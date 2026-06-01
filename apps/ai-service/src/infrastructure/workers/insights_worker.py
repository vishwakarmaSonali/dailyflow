"""Insights worker for generating user insights asynchronously."""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

from src.infrastructure.workers.worker_pool import Worker
from src.infrastructure.config import Settings
from src.infrastructure.database import CacheRepository
from src.infrastructure.event_publisher import EventPublisher
from src.domain.insights_engine import InsightsEngine

logger = logging.getLogger(__name__)


class InsightsWorker(Worker):
    """Worker for asynchronous generation of user insights."""

    def __init__(
        self,
        worker_id: str,
        cache_repository: CacheRepository,
        event_publisher: EventPublisher,
        insights_engine: InsightsEngine,
        settings: Settings,
        timeout_seconds: int = 30,
    ) -> None:
        """Initialize Insights worker.

        Args:
            worker_id: Unique worker identifier
            cache_repository: Cache repository for storing insights
            event_publisher: Event publisher for publishing events
            insights_engine: Insights generation engine
            settings: Application settings
            timeout_seconds: Task timeout in seconds
        """
        super().__init__(worker_id, timeout_seconds)
        self.cache_repository = cache_repository
        self.event_publisher = event_publisher
        self.insights_engine = insights_engine
        self.settings = settings
        self.retry_count: Dict[str, int] = {}
        self.max_retries = 2

    async def _execute_task(self, task_data: Dict[str, Any]) -> None:
        """Execute insights generation task.

        Args:
            task_data: Task data containing user_id, insight_type, etc.

        Expected task_data format:
            {
                "task_type": "insights",
                "user_id": str,
                "insight_type": str (HABIT_STREAK, SPENDING_TREND, etc.),
                "data": dict (user data for analysis),
            }
        """
        try:
            user_id = task_data.get("user_id")
            insight_type = task_data.get("insight_type", "SPENDING_TREND")
            data = task_data.get("data", {})

            if not user_id:
                logger.error("Insights task missing user_id")
                return

            logger.info(
                f"Worker {self.worker_id} generating {insight_type} "
                f"insight for user {user_id}"
            )

            cached_insight = await self.cache_repository.get_cached_insight(
                user_id, insight_type
            )
            if cached_insight:
                logger.debug(
                    f"Using cached insight for user {user_id}, "
                    f"type {insight_type}"
                )
                return

            insight = await self._generate_insight(
                user_id, insight_type, data
            )

            await self.cache_repository.cache_insight(
                user_id=user_id,
                insight_type=insight_type,
                title=insight.get("title", ""),
                description=insight.get("description", ""),
                confidence=insight.get("confidence", 0.0),
                actionable_items=insight.get("actionable_items", []),
                ttl_hours=12,
            )

            await self.event_publisher.publish_insight_generated(
                user_id=user_id,
                insight_type=insight_type,
                title=insight.get("title", ""),
                description=insight.get("description", ""),
                confidence=insight.get("confidence", 0.0),
                actionable_items=insight.get("actionable_items", []),
            )

            logger.info(
                f"Worker {self.worker_id} completed {insight_type} "
                f"insight for user {user_id}"
            )

        except Exception as e:
            logger.error(
                f"Worker {self.worker_id} insights processing error: {str(e)}"
            )
            raise

    async def _generate_insight(
        self, user_id: str, insight_type: str, data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate insight for user.

        In production, this would use the InsightsEngine and potentially
        external AI services.

        Args:
            user_id: User ID
            insight_type: Type of insight to generate
            data: User data for analysis

        Returns:
            Generated insight with metadata
        """
        await asyncio.sleep(0.5)

        title = f"{insight_type} Insight"
        description = f"Generated {insight_type} analysis for user {user_id}"
        confidence = 0.78
        actionable_items = [
            "Action 1 for improving this insight",
            "Action 2 for improving this insight",
        ]

        return {
            "title": title,
            "description": description,
            "confidence": confidence,
            "actionable_items": actionable_items,
            "generated_at": datetime.now().isoformat(),
        }

    async def _handle_timeout(self, task_data: Dict[str, Any]) -> None:
        """Handle insights task timeout with retry logic.

        Args:
            task_data: Task that timed out
        """
        user_id = task_data.get("user_id")
        insight_type = task_data.get("insight_type", "UNKNOWN")

        current_retry = self.retry_count.get(user_id, 0)
        self.retry_count[user_id] = current_retry + 1

        if current_retry < self.max_retries:
            logger.info(
                f"Retrying {insight_type} insight generation for user {user_id} "
                f"(attempt {current_retry + 1}/{self.max_retries})"
            )
            await asyncio.sleep(2 ** current_retry)
            await self.cache_repository.log_event(
                event_type="insights_timeout",
                payload={
                    "user_id": user_id,
                    "insight_type": insight_type,
                    "retry_attempt": current_retry + 1,
                    "timeout_seconds": self.timeout_seconds,
                },
                status="PENDING",
            )
        else:
            logger.error(
                f"Insights task for user {user_id} ({insight_type}) "
                f"exceeded max retries"
            )
            await self.cache_repository.log_event(
                event_type="insights_timeout",
                payload={
                    "user_id": user_id,
                    "insight_type": insight_type,
                    "failed_after_retries": self.max_retries,
                },
                status="FAILED",
            )

    async def _handle_error(
        self, task_data: Dict[str, Any], error: Exception
    ) -> None:
        """Handle insights task error gracefully.

        Args:
            task_data: Task that failed
            error: Exception that was raised
        """
        user_id = task_data.get("user_id")
        insight_type = task_data.get("insight_type", "UNKNOWN")

        logger.error(
            f"Insights generation error for user {user_id} "
            f"({insight_type}): {str(error)}"
        )

        await self.cache_repository.log_event(
            event_type="insights_error",
            payload={
                "user_id": user_id,
                "insight_type": insight_type,
                "error": str(error),
            },
            status="FAILED",
        )

        await self.cache_repository.update_event_status(
            event_log_id=f"insights:{user_id}:{insight_type}",
            status="FAILED",
            error=f"Insights generation failed: {str(error)}",
        )
