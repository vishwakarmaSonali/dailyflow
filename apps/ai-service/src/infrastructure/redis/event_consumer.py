"""BullMQ event consumer for processing events from Node services."""

import json
import logging
from typing import Callable, Dict, Optional

import redis.asyncio as redis

from src.domain.events import DomainEvent, EventType
from src.infrastructure.config import Settings

logger = logging.getLogger(__name__)


class EventConsumer:
    """Consumes events from Redis BullMQ queues."""

    def __init__(self, settings: Settings) -> None:
        """Initialize event consumer.
        
        Args:
            settings: Application settings
        """
        self.settings = settings
        self.redis_client: Optional[redis.Redis] = None
        self.handlers: Dict[str, Callable] = {}
        self.running = False

    async def connect(self) -> None:
        """Connect to Redis.
        
        Raises:
            ConnectionError: If connection fails
        """
        self.redis_client = await redis.from_url(
            self.settings.redis_url,
            encoding="utf-8",
            decode_responses=True,
        )
        await self.redis_client.ping()
        logger.info("Event consumer connected to Redis")

    async def disconnect(self) -> None:
        """Disconnect from Redis."""
        if self.redis_client:
            await self.redis_client.close()
            logger.info("Event consumer disconnected from Redis")

    def register_handler(
        self, event_type: EventType, handler: Callable
    ) -> None:
        """Register event handler.
        
        Args:
            event_type: Type of event to handle
            handler: Async callable to handle event
        """
        self.handlers[event_type.value] = handler
        logger.info(f"Registered handler for {event_type.value}")

    async def start(self) -> None:
        """Start consuming events.
        
        Listens to BullMQ queues for all registered event types.
        """
        if not self.redis_client:
            raise RuntimeError("Event consumer not connected")

        self.running = True
        logger.info("Event consumer started")

        # Subscribe to event queues
        queue_names = [
            f"ai:expense:created",
            f"ai:habit:logged",
            f"ai:habit:milestone:reached",
        ]

        pubsub = self.redis_client.pubsub()
        await pubsub.subscribe(queue_names)

        try:
            async for message in pubsub.listen():
                if not self.running:
                    break

                if message["type"] == "message":
                    try:
                        event_data = json.loads(message["data"])
                        await self._handle_event(event_data)
                    except json.JSONDecodeError as e:
                        logger.error(f"Invalid JSON in event: {str(e)}")
                    except Exception as e:
                        logger.error(f"Error handling event: {str(e)}")

        finally:
            await pubsub.unsubscribe(queue_names)

    async def stop(self) -> None:
        """Stop consuming events."""
        self.running = False
        logger.info("Event consumer stopped")

    async def _handle_event(self, event_data: dict) -> None:
        """Handle incoming event.
        
        Args:
            event_data: Event data dictionary
        """
        event_type = event_data.get("event_type")

        # Get handler for event type
        handler = self.handlers.get(event_type)
        if not handler:
            logger.warning(f"No handler registered for event type: {event_type}")
            return

        # Call handler
        try:
            await handler(event_data)
            logger.info(f"Successfully handled event: {event_type}")
        except Exception as e:
            logger.error(f"Error in handler for {event_type}: {str(e)}")
            # TODO: Add to dead letter queue for retry

    async def publish_event(self, event: DomainEvent) -> None:
        """Publish event to outgoing queue.
        
        Args:
            event: Event to publish
        """
        if not self.redis_client:
            raise RuntimeError("Event consumer not connected")

        queue_name = f"ai:{event.event_type.value}"
        await self.redis_client.rpush(queue_name, event.to_json())
        logger.info(f"Published event to {queue_name}")
