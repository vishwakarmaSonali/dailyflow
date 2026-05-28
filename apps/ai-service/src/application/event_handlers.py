"""Event handlers for AI Service."""

import logging
from typing import Any

from src.domain.anomaly_detector import AnomalyDetector
from src.domain.events import AnomalyDetectedEvent, EventType, InsightGeneratedEvent
from src.domain.insights_engine import InsightsEngine
from src.infrastructure.database import CacheRepository
from src.infrastructure.redis.event_consumer import EventConsumer

logger = logging.getLogger(__name__)


class ExpenseEventHandler:
    """Handler for expense-related events."""

    def __init__(
        self,
        event_consumer: EventConsumer,
        cache_repository: CacheRepository,
        anomaly_detector: AnomalyDetector,
    ) -> None:
        """Initialize expense event handler.
        
        Args:
            event_consumer: Event consumer for publishing
            cache_repository: Cache repository
            anomaly_detector: Anomaly detector
        """
        self.event_consumer = event_consumer
        self.cache_repository = cache_repository
        self.anomaly_detector = anomaly_detector

    async def handle_expense_created(self, event_data: dict) -> None:
        """Handle expense:created event.
        
        Triggers anomaly detection and caches result.
        
        Args:
            event_data: Event data
        """
        try:
            user_id = event_data.get("data", {}).get("user_id")
            category = event_data.get("data", {}).get("category")
            amount = event_data.get("data", {}).get("amount")

            logger.info(f"Processing expense event for user {user_id}, amount {amount}")

            # Log event
            await self.cache_repository.log_event(
                event_type="expense:created",
                payload=event_data,
                status="PROCESSING",
            )

            # TODO: Detect anomalies using historical data
            # For now, placeholder
            anomaly = None

            if anomaly:
                # Publish anomaly event
                anomaly_event = AnomalyDetectedEvent(
                    event_id=f"anomaly-{user_id}-{category}",
                    event_type=EventType.ANOMALY_DETECTED,
                    timestamp=__import__("datetime").datetime.now(),
                    source_service="ai-service",
                    data={
                        "user_id": user_id,
                        "category": category,
                        "anomaly_type": "spending",
                        "severity": anomaly.severity.value,
                        "expected_value": anomaly.expected_value,
                        "actual_value": anomaly.actual_value,
                        "deviation_pct": anomaly.deviation_pct,
                        "description": anomaly.description,
                    },
                )
                await self.event_consumer.publish_event(anomaly_event)

        except Exception as e:
            logger.error(f"Error handling expense event: {str(e)}")
            raise


class HabitEventHandler:
    """Handler for habit-related events."""

    def __init__(
        self,
        event_consumer: EventConsumer,
        cache_repository: CacheRepository,
        insights_engine: InsightsEngine,
    ) -> None:
        """Initialize habit event handler.
        
        Args:
            event_consumer: Event consumer for publishing
            cache_repository: Cache repository
            insights_engine: Insights engine
        """
        self.event_consumer = event_consumer
        self.cache_repository = cache_repository
        self.insights_engine = insights_engine

    async def handle_habit_logged(self, event_data: dict) -> None:
        """Handle habit:logged event.
        
        Triggers insights generation and caches result.
        
        Args:
            event_data: Event data
        """
        try:
            user_id = event_data.get("data", {}).get("user_id")
            habit_name = event_data.get("data", {}).get("habit_name")
            streak_count = event_data.get("data", {}).get("streak_count", 0)

            logger.info(f"Processing habit logged event for user {user_id}, habit {habit_name}")

            # Log event
            await self.cache_repository.log_event(
                event_type="habit:logged",
                payload=event_data,
                status="PROCESSING",
            )

            # Generate insight
            # TODO: Get historical data from Habit Service
            insight = self.insights_engine.analyze_habit_streak(
                habit_name=habit_name,
                current_streak=streak_count,
                max_streak=streak_count,  # TODO: Get from service
                completion_rate=0.85,  # TODO: Calculate from data
            )

            # Cache insight
            await self.cache_repository.cache_insight(
                user_id=user_id,
                insight_type=insight.type.value,
                title=insight.title,
                description=insight.description,
                confidence=insight.confidence,
                actionable_items=insight.actionable_items,
            )

            # Publish insight event
            insight_event = InsightGeneratedEvent(
                event_id=f"insight-{user_id}-habit",
                event_type=EventType.INSIGHT_GENERATED,
                timestamp=__import__("datetime").datetime.now(),
                source_service="ai-service",
                data={
                    "user_id": user_id,
                    "insight_type": insight.type.value,
                    "title": insight.title,
                    "description": insight.description,
                    "confidence": insight.confidence,
                    "actionable_items": insight.actionable_items,
                },
            )
            await self.event_consumer.publish_event(insight_event)

        except Exception as e:
            logger.error(f"Error handling habit event: {str(e)}")
            raise

    async def handle_habit_milestone(self, event_data: dict) -> None:
        """Handle habit:milestone:reached event.
        
        Generates celebration insight.
        
        Args:
            event_data: Event data
        """
        try:
            user_id = event_data.get("data", {}).get("user_id")
            habit_name = event_data.get("data", {}).get("habit_name")
            milestone = event_data.get("data", {}).get("milestone")

            logger.info(
                f"Processing milestone event for user {user_id}, habit {habit_name}, milestone {milestone}"
            )

            # Log event
            await self.cache_repository.log_event(
                event_type="habit:milestone:reached",
                payload=event_data,
                status="PROCESSING",
            )

            # Generate celebration insight
            # TODO: Customize based on milestone (7, 30, 100, etc.)
            celebration_title = f"🎉 {milestone}-day streak on {habit_name}!"
            celebration_desc = f"Incredible commitment! You've maintained this habit for {milestone} consecutive days."

            # Publish insight event
            insight_event = InsightGeneratedEvent(
                event_id=f"insight-{user_id}-milestone",
                event_type=EventType.INSIGHT_GENERATED,
                timestamp=__import__("datetime").datetime.now(),
                source_service="ai-service",
                data={
                    "user_id": user_id,
                    "insight_type": "MILESTONE_CELEBRATION",
                    "title": celebration_title,
                    "description": celebration_desc,
                    "confidence": 0.99,
                    "actionable_items": ["Share your achievement!", "Set a new goal"],
                },
            )
            await self.event_consumer.publish_event(insight_event)

        except Exception as e:
            logger.error(f"Error handling milestone event: {str(e)}")
            raise
