"""AI Service - FastAPI main application."""

import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.application.event_handlers import ExpenseEventHandler, HabitEventHandler
from src.domain.anomaly_detector import AnomalyDetector
from src.domain.events import EventType
from src.domain.insights_engine import InsightsEngine
from src.infrastructure.config import get_settings
from src.infrastructure.database import CacheRepository
from src.infrastructure.event_publisher import EventPublisher
from src.infrastructure.http.routes import create_router
from src.infrastructure.redis import RedisClient
from src.infrastructure.redis.event_consumer import EventConsumer
from src.infrastructure.workers import WorkerPool, OCRWorker, InsightsWorker

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


settings = get_settings()

# Global instances
redis_client: RedisClient | None = None
event_consumer: EventConsumer | None = None
event_publisher: EventPublisher | None = None
cache_repository: CacheRepository | None = None
event_consumer_task: asyncio.Task | None = None
ocr_worker_pool: WorkerPool | None = None
insights_worker_pool: WorkerPool | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI lifespan context manager.
    
    Handles startup and shutdown events, including event consumer and workers.
    """
    global redis_client, event_consumer, event_publisher, cache_repository
    global event_consumer_task, ocr_worker_pool, insights_worker_pool

    # Startup
    logger.info(f"Starting AI Service on port {settings.port}")

    try:
        # Initialize Redis and event consumer
        redis_client = RedisClient(settings)
        await redis_client.connect()

        event_consumer = EventConsumer(settings)
        await event_consumer.connect()

        event_publisher = EventPublisher(redis_client)
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
            event_type=EventType.EXPENSE_CREATED,
            handler=expense_handler.handle_expense_created,
        )
        event_consumer.register_handler(
            event_type=EventType.HABIT_LOGGED,
            handler=habit_handler.handle_habit_logged,
        )
        event_consumer.register_handler(
            event_type=EventType.HABIT_MILESTONE_REACHED,
            handler=habit_handler.handle_habit_milestone,
        )

        # Start event consumer in background
        event_consumer_task = asyncio.create_task(event_consumer.start())
        logger.info("Event consumer started")

        # Initialize and start worker pools for Phase 5+
        ocr_worker_factory = lambda worker_id: OCRWorker(
            worker_id=worker_id,
            cache_repository=cache_repository,
            event_publisher=event_publisher,
            redis_client=redis_client,
            settings=settings,
            timeout_seconds=30,
        )
        ocr_worker_pool = WorkerPool(
            worker_factory=ocr_worker_factory, num_workers=5
        )
        await ocr_worker_pool.start()
        logger.info("OCR worker pool started with 5 workers")

        insights_engine = InsightsEngine(settings.insights_generation_days)
        insights_worker_factory = lambda worker_id: InsightsWorker(
            worker_id=worker_id,
            cache_repository=cache_repository,
            event_publisher=event_publisher,
            insights_engine=insights_engine,
            settings=settings,
            timeout_seconds=30,
        )
        insights_worker_pool = WorkerPool(
            worker_factory=insights_worker_factory, num_workers=5
        )
        await insights_worker_pool.start()
        logger.info("Insights worker pool started with 5 workers")

    except Exception as e:
        logger.error(f"Failed to start AI Service: {str(e)}")

    yield

    # Shutdown
    logger.info("Shutting down AI Service")

    try:
        if ocr_worker_pool:
            await ocr_worker_pool.stop()
            logger.info("OCR worker pool stopped")

        if insights_worker_pool:
            await insights_worker_pool.stop()
            logger.info("Insights worker pool stopped")

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
        logger.info("AI Service shutdown complete")
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

    @app.get("/health/workers")
    async def worker_health() -> dict:
        """Get worker pool health statistics.
        
        Returns:
            Dictionary with OCR and Insights worker pool stats
        """
        ocr_stats = (
            ocr_worker_pool.get_stats() if ocr_worker_pool else {}
        )
        insights_stats = (
            insights_worker_pool.get_stats() if insights_worker_pool else {}
        )
        return {
            "status": "healthy",
            "service": "ai-service",
            "ocr_worker_pool": ocr_stats,
            "insights_worker_pool": insights_stats,
        }

    @app.post("/workers/ocr/enqueue")
    async def enqueue_ocr_task(task_data: dict) -> dict:
        """Enqueue an OCR processing task.
        
        Args:
            task_data: Task data with expense_id, user_id, image_data, etc.
            
        Returns:
            Status confirmation
        """
        if not ocr_worker_pool or not ocr_worker_pool.is_running:
            return {"status": "error", "message": "OCR worker pool not running"}

        try:
            await ocr_worker_pool.enqueue_task(task_data)
            return {
                "status": "success",
                "message": "Task enqueued for OCR processing",
                "queue_size": ocr_worker_pool.task_queue.qsize(),
            }
        except Exception as e:
            logger.error(f"Failed to enqueue OCR task: {str(e)}")
            return {"status": "error", "message": str(e)}

    @app.post("/workers/insights/enqueue")
    async def enqueue_insights_task(task_data: dict) -> dict:
        """Enqueue an insights generation task.
        
        Args:
            task_data: Task data with user_id, insight_type, data, etc.
            
        Returns:
            Status confirmation
        """
        if not insights_worker_pool or not insights_worker_pool.is_running:
            return {
                "status": "error",
                "message": "Insights worker pool not running",
            }

        try:
            await insights_worker_pool.enqueue_task(task_data)
            return {
                "status": "success",
                "message": "Task enqueued for insights generation",
                "queue_size": insights_worker_pool.task_queue.qsize(),
            }
        except Exception as e:
            logger.error(f"Failed to enqueue insights task: {str(e)}")
            return {"status": "error", "message": str(e)}

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
