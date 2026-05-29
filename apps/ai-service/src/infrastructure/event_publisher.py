"""Event publisher for publishing processed events to outgoing queues."""

import json
import logging
from datetime import datetime
from typing import Any, Optional

from src.domain.events import DomainEvent, EventType
from src.infrastructure.redis import RedisClient

logger = logging.getLogger(__name__)


class EventPublisher:
    """Publishes AI Service events to Redis event bus."""

    def __init__(self, redis_client: RedisClient) -> None:
        """Initialize event publisher.
        
        Args:
            redis_client: Redis client for publishing
        """
        self.redis_client = redis_client

    async def publish_anomaly_detected(
        self,
        user_id: str,
        category: str,
        severity: str,
        expected_value: float,
        actual_value: float,
        deviation_pct: float,
        description: str,
        recommended_action: str,
    ) -> bool:
        """Publish anomaly detected event.
        
        Args:
            user_id: User ID
            category: Expense category
            severity: Anomaly severity (LOW, MEDIUM, HIGH, CRITICAL)
            expected_value: Expected spending value
            actual_value: Actual spending value
            deviation_pct: Deviation percentage
            description: Anomaly description
            recommended_action: Action to take
            
        Returns:
            True if published successfully
        """
        try:
            event = {
                "event_id": f"anomaly-{user_id}-{int(datetime.now().timestamp())}",
                "event_type": EventType.ANOMALY_DETECTED.value,
                "timestamp": datetime.now().isoformat(),
                "source_service": "ai-service",
                "data": {
                    "user_id": user_id,
                    "category": category,
                    "anomaly_type": "spending",
                    "severity": severity,
                    "expected_value": expected_value,
                    "actual_value": actual_value,
                    "deviation_pct": deviation_pct,
                    "description": description,
                    "recommended_action": recommended_action,
                },
            }

            queue_name = "ai:anomaly:detected"
            await self.redis_client.publish(queue_name, json.dumps(event))
            logger.info(f"Published anomaly event for user {user_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to publish anomaly event: {str(e)}")
            return False

    async def publish_insight_generated(
        self,
        user_id: str,
        insight_type: str,
        title: str,
        description: str,
        confidence: float,
        actionable_items: list[str],
    ) -> bool:
        """Publish insight generated event.
        
        Args:
            user_id: User ID
            insight_type: Type of insight (HABIT_STREAK, SPENDING_TREND, etc.)
            title: Insight title
            description: Insight description
            confidence: Confidence score
            actionable_items: List of actionable items
            
        Returns:
            True if published successfully
        """
        try:
            event = {
                "event_id": f"insight-{user_id}-{int(datetime.now().timestamp())}",
                "event_type": EventType.INSIGHT_GENERATED.value,
                "timestamp": datetime.now().isoformat(),
                "source_service": "ai-service",
                "data": {
                    "user_id": user_id,
                    "insight_type": insight_type,
                    "title": title,
                    "description": description,
                    "confidence": confidence,
                    "actionable_items": actionable_items,
                },
            }

            queue_name = "ai:insight:generated"
            await self.redis_client.publish(queue_name, json.dumps(event))
            logger.info(f"Published insight event for user {user_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to publish insight event: {str(e)}")
            return False

    async def publish_expense_categorized(
        self,
        expense_id: str,
        original_category: str,
        suggested_category: str,
        confidence: float,
        reason: str,
    ) -> bool:
        """Publish expense categorized event.
        
        Args:
            expense_id: Expense ID
            original_category: Original category
            suggested_category: Suggested category from AI
            confidence: Confidence score
            reason: Reason for suggestion
            
        Returns:
            True if published successfully
        """
        try:
            event = {
                "event_id": f"categorized-{expense_id}",
                "event_type": EventType.EXPENSE_CATEGORIZED.value,
                "timestamp": datetime.now().isoformat(),
                "source_service": "ai-service",
                "data": {
                    "expense_id": expense_id,
                    "original_category": original_category,
                    "suggested_category": suggested_category,
                    "confidence": confidence,
                    "reason": reason,
                },
            }

            queue_name = "ai:expense:categorized"
            await self.redis_client.publish(queue_name, json.dumps(event))
            logger.info(f"Published categorization event for expense {expense_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to publish categorization event: {str(e)}")
            return False

    async def publish_with_retry(
        self, event: DomainEvent, max_retries: int = 3
    ) -> bool:
        """Publish event with retry logic.
        
        Args:
            event: Event to publish
            max_retries: Maximum retry attempts
            
        Returns:
            True if published successfully
        """
        import asyncio

        for attempt in range(max_retries):
            try:
                queue_name = f"ai:{event.event_type.value}"
                await self.redis_client.publish(queue_name, event.to_json())
                logger.info(f"Published event: {event.event_type.value} (attempt {attempt + 1})")
                return True

            except Exception as e:
                logger.warning(
                    f"Publish attempt {attempt + 1}/{max_retries} failed: {str(e)}"
                )
                if attempt < max_retries - 1:
                    await asyncio.sleep(2 ** attempt)  # Exponential backoff
                else:
                    logger.error(f"Failed to publish event after {max_retries} attempts")
                    return False

        return False

    async def publish_to_dead_letter_queue(
        self, event: dict, error: str
    ) -> bool:
        """Publish failed event to dead letter queue.
        
        Args:
            event: Failed event
            error: Error message
            
        Returns:
            True if published to DLQ
        """
        try:
            dlq_event = {
                **event,
                "error": error,
                "failed_at": datetime.now().isoformat(),
            }

            queue_name = "ai:dlq"
            await self.redis_client.publish(queue_name, json.dumps(dlq_event))
            logger.info(f"Published event to dead letter queue: {event.get('event_id')}")
            return True

        except Exception as e:
            logger.error(f"Failed to publish to DLQ: {str(e)}")
            return False
