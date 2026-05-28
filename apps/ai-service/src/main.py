"""AI Service - FastAPI main application."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.infrastructure.config import get_settings
from src.infrastructure.http.routes import create_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI lifespan context manager.
    
    Handles startup and shutdown events.
    """
    # Startup
    logger.info(f"Starting AI Service on port {settings.port}")
    yield
    # Shutdown
    logger.info("Shutting down AI Service")


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
