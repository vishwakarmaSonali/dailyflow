"""AI Service - FastAPI main application."""

import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.application.event_handlers import ExpenseEventHandler, HabitEventHandler
from src.domain.anomaly_detector import AnomalyDetector
from src.domain.insights_engine import InsightsEngine
from src.infrastructure.config import get_settings
from src.infrastructure.database import CacheRepository
from src.infrastructure.http.routes import create_router
from src.infrastructure.redis import RedisClient
from src.infrastructure.redis.event_consumer import EventConsumer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


settings = get_settings()

# Global instances
redis_client: RedisClient | None = None
event_consumer: EventConsumer | None = None
cache_repository: CacheRepository | None = None
event_consumer_task: asyncio.Task | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI lifespan context manager.
    
    Handles startup and shutdown events, including event consumer.
    """
    global redis_client, event_consumer, cache_repository, event_consumer_task

    # Startup
    logger.info(f"Starting AI Service on port {settings.port}")

    try:
        # Initialize Redis and event consumer
        redis_client = RedisClient(settings)
        await redis_client.connect()

        event_consumer = EventConsumer(settings)
        await event_consumer.connect()

        cache_repository = CacheRepository(settings)

        # Register event handlers
        expense_handler = ExpenseEventHandler(
            event_consumer,
            cache_repository,
            AnomalyDetector(settings.anomaly_detection_std_devs),
        )
        habit_handler = HabitEventHandler(
            event_consumer,
            cache_repository,
            InsightsEngine(settings.insights_generation_days),
        )

        event_consumer.register_handler(
            event_type="expense:created",
            handler=expense_handler.handle_expense_created,
        )
        event_consumer.register_handler(
            event_type="habit:logged",
            handler=habit_handler.handle_habit_logged,
        )
        event_consumer.register_handler(
            event_type="habit:milestone:reached",
            handler=habit_handler.handle_habit_milestone,
        )

        # Start event consumer in background
        event_consumer_task = asyncio.create_task(event_consumer.start())
        logger.info("Event consumer started")

    except Exception as e:
        logger.error(f"Failed to start event consumer: {str(e)}")

    yield

    # Shutdown
    logger.info("Shutting down AI Service")

    try:
        if event_consumer:
            await event_consumer.stop()
        if event_consumer_task:
            event_consumer_task.cancel()
            try:
                await event_consumer_task
            except asyncio.CancelledError:
                pass
        if redis_client:
            await redis_client.disconnect()
        logger.info("Event consumer stopped")
    except Exception as e:
        logger.error(f"Error during shutdown: {str(e)}")


def create_app() -> FastAPI:
    """Create and configure FastAPI application.
    
    Returns:
        Configured FastAPI application
    """
    app = FastAPI(
        title="DailyFlow AI Service",
        description="AI-powered insights, OCR, and anomaly detection for DailyFlow",
        version="0.1.0",
        lifespan=lifespan,
    )

    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",  # API Gateway
            "http://localhost:3001",  # Auth Service
            "http://localhost:3002",  # Habit Service
            "http://localhost:3003",  # Expense Service
            "http://localhost:3004",  # Analytics Service
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routes
    router = create_router(settings)
    app.include_router(router)

    @app.get("/health")
    async def root_health() -> dict:
        """Root health check."""
        return {"status": "healthy", "service": "ai-service"}

    return app


# Create app instance
app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=settings.environment == "development",
        log_level=settings.log_level.lower(),
    )
