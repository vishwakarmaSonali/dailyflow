"""Redis client for event bus communication."""

import logging
from typing import Optional

import redis.asyncio as redis
from redis.exceptions import ConnectionError

from src.infrastructure.config import Settings

logger = logging.getLogger(__name__)


class RedisClient:
    """Async Redis client for AI Service."""

    def __init__(self, settings: Settings) -> None:
        """Initialize Redis client.
        
        Args:
            settings: Application settings with Redis URL
        """
        self.settings = settings
        self.client: Optional[redis.Redis] = None

    async def connect(self) -> None:
        """Connect to Redis.
        
        Raises:
            ConnectionError: If connection fails
        """
        try:
            self.client = await redis.from_url(
                self.settings.redis_url,
                encoding="utf-8",
                decode_responses=True,
            )
            # Test connection
            await self.client.ping()
            logger.info("Connected to Redis")
        except ConnectionError as e:
            logger.error(f"Failed to connect to Redis: {str(e)}")
            raise

    async def disconnect(self) -> None:
        """Disconnect from Redis."""
        if self.client:
            await self.client.close()
            logger.info("Disconnected from Redis")

    async def publish(self, channel: str, message: str) -> int:
        """Publish message to channel.
        
        Args:
            channel: Channel name
            message: Message to publish
            
        Returns:
            Number of subscribers that received message
        """
        if not self.client:
            raise RuntimeError("Redis client not connected")
        return await self.client.publish(channel, message)

    async def subscribe(self, channels: list[str]):
        """Subscribe to channels.
        
        Args:
            channels: List of channel names
            
        Returns:
            PubSub object
        """
        if not self.client:
            raise RuntimeError("Redis client not connected")
        pubsub = self.client.pubsub()
        await pubsub.subscribe(channels)
        return pubsub

    async def get(self, key: str) -> Optional[str]:
        """Get value from Redis.
        
        Args:
            key: Key to retrieve
            
        Returns:
            Value or None
        """
        if not self.client:
            raise RuntimeError("Redis client not connected")
        return await self.client.get(key)

    async def set(self, key: str, value: str, ex: Optional[int] = None) -> bool:
        """Set value in Redis.
        
        Args:
            key: Key to set
            value: Value to set
            ex: Expiration time in seconds (optional)
            
        Returns:
            True if successful
        """
        if not self.client:
            raise RuntimeError("Redis client not connected")
        return await self.client.set(key, value, ex=ex)

    async def delete(self, key: str) -> int:
        """Delete key from Redis.
        
        Args:
            key: Key to delete
            
        Returns:
            Number of keys deleted
        """
        if not self.client:
            raise RuntimeError("Redis client not connected")
        return await self.client.delete(key)

    async def exists(self, key: str) -> bool:
        """Check if key exists.
        
        Args:
            key: Key to check
            
        Returns:
            True if key exists
        """
        if not self.client:
            raise RuntimeError("Redis client not connected")
        return await self.client.exists(key) > 0
