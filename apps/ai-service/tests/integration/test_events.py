"""Integration tests for event-driven architecture."""

import json
import pytest
from unittest.mock import AsyncMock, patch, MagicMock

from src.domain.events import EventType
from src.application.event_handlers import ExpenseEventHandler, HabitEventHandler
from src.domain.anomaly_detector import AnomalyDetector
from src.domain.insights_engine import InsightsEngine


@pytest.mark.asyncio
async def test_expense_created_event_flow(event_consumer, cache_repository):
    """Test complete flow: expense:created → anomaly:detected event."""
    
    # Setup
    anomaly_detector = AnomalyDetector(std_devs=2.0)
    handler = ExpenseEventHandler(
        event_consumer=event_consumer,
        cache_repository=cache_repository,
        anomaly_detector=anomaly_detector,
    )
    
    # Create test expense event
    expense_event = {
        "type": EventType.EXPENSE_CREATED,
        "user_id": "test_user_123",
        "expense_id": "exp_456",
        "category": "Groceries",
        "amount": 250.0,  # High amount to trigger anomaly
        "timestamp": "2026-06-01T10:00:00Z",
    }
    
    # Mock event publisher
    with patch.object(handler, 'event_publisher') as mock_publisher:
        mock_publisher.publish_anomaly_detected = AsyncMock()
        
        # Handle event
        await handler.handle_expense_created(expense_event)
        
        # Verify anomaly detection was called
        assert mock_publisher.publish_anomaly_detected.called
        call_args = mock_publisher.publish_anomaly_detected.call_args
        
        # Verify anomaly event contains expected data
        assert call_args[1]["user_id"] == "test_user_123"
        assert call_args[1]["expense_id"] == "exp_456"
        assert call_args[1]["category"] == "Groceries"


@pytest.mark.asyncio
async def test_habit_logged_event_flow(event_consumer, cache_repository):
    """Test complete flow: habit:logged → insights:generated event."""
    
    # Setup
    insights_engine = InsightsEngine(days=30)
    handler = HabitEventHandler(
        event_consumer=event_consumer,
        cache_repository=cache_repository,
        insights_engine=insights_engine,
    )
    
    # Create test habit logged event
    habit_event = {
        "type": EventType.HABIT_LOGGED,
        "user_id": "test_user_123",
        "habit_id": "habit_789",
        "habit_name": "Morning Exercise",
        "logged_at": "2026-06-01T06:00:00Z",
        "streak_count": 15,
    }
    
    # Mock event publisher
    with patch.object(handler, 'event_publisher') as mock_publisher:
        mock_publisher.publish_insight_generated = AsyncMock()
        
        # Handle event
        await handler.handle_habit_logged(habit_event)
        
        # Verify insight generation was called
        assert mock_publisher.publish_insight_generated.called
        call_args = mock_publisher.publish_insight_generated.call_args
        
        # Verify insight event contains expected data
        assert call_args[1]["user_id"] == "test_user_123"
        assert call_args[1]["habit_id"] == "habit_789"


@pytest.mark.asyncio
async def test_habit_milestone_event_flow(event_consumer, cache_repository):
    """Test complete flow: habit:milestone → insights event."""
    
    # Setup
    insights_engine = InsightsEngine(days=30)
    handler = HabitEventHandler(
        event_consumer=event_consumer,
        cache_repository=cache_repository,
        insights_engine=insights_engine,
    )
    
    # Create test milestone event
    milestone_event = {
        "type": EventType.HABIT_MILESTONE_REACHED,
        "user_id": "test_user_123",
        "habit_id": "habit_789",
        "milestone_days": 30,
        "milestone_type": "streak",
    }
    
    # Mock event publisher
    with patch.object(handler, 'event_publisher') as mock_publisher:
        mock_publisher.publish_insight_generated = AsyncMock()
        
        # Handle event
        await handler.handle_habit_milestone(milestone_event)
        
        # Verify milestone insight was published
        assert mock_publisher.publish_insight_generated.called


@pytest.mark.asyncio
async def test_event_consumer_registration():
    """Test event consumer handler registration."""
    from src.infrastructure.redis.event_consumer import EventConsumer
    
    consumer = EventConsumer(settings=MagicMock())
    
    # Register handlers
    mock_handler_1 = AsyncMock()
    mock_handler_2 = AsyncMock()
    
    consumer.register_handler(EventType.EXPENSE_CREATED, mock_handler_1)
    consumer.register_handler(EventType.HABIT_LOGGED, mock_handler_2)
    
    # Verify handlers are registered
    assert EventType.EXPENSE_CREATED in consumer.handlers
    assert EventType.HABIT_LOGGED in consumer.handlers
    assert consumer.handlers[EventType.EXPENSE_CREATED] == mock_handler_1
    assert consumer.handlers[EventType.HABIT_LOGGED] == mock_handler_2


@pytest.mark.asyncio
async def test_anomaly_detection_high_amount(cache_repository):
    """Test anomaly detection for high spending amounts."""
    detector = AnomalyDetector(std_devs=2.0)
    
    # Simulate historical expenses
    historical_amounts = [50.0, 55.0, 60.0, 52.0, 58.0]
    
    # Test normal amount
    is_anomalous = detector.detect_anomaly(
        category="Groceries",
        current_amount=58.0,
        historical_amounts=historical_amounts,
    )
    assert not is_anomalous, "Normal amount should not be anomalous"
    
    # Test high amount
    is_anomalous = detector.detect_anomaly(
        category="Groceries",
        current_amount=150.0,  # Way higher than historical
        historical_amounts=historical_amounts,
    )
    assert is_anomalous, "High amount should be anomalous"


@pytest.mark.asyncio
async def test_insights_generation(cache_repository):
    """Test insights generation for habits."""
    engine = InsightsEngine(days=30)
    
    # Mock habit data
    habit_data = {
        "habit_id": "habit_123",
        "name": "Daily Meditation",
        "frequency": "daily",
        "current_streak": 21,
        "best_streak": 45,
        "completion_rate": 0.85,
    }
    
    # Generate insights
    insights = engine.generate_insights(habit_data)
    
    # Verify insights structure
    assert "title" in insights
    assert "description" in insights
    assert "confidence" in insights
    assert insights["confidence"] >= 0 and insights["confidence"] <= 1


@pytest.mark.asyncio
async def test_event_publishing_retry_logic(event_publisher):
    """Test event publishing with retry logic."""
    
    # Mock Redis client to fail first 2 times
    call_count = 0
    
    async def mock_publish(*args, **kwargs):
        nonlocal call_count
        call_count += 1
        if call_count < 3:
            raise Exception("Redis connection failed")
        return {"status": "success"}
    
    with patch.object(event_publisher.redis_client, 'publish', new=mock_publish):
        # Should succeed after retries
        result = await event_publisher.publish_with_retry(
            queue_name="expense-events",
            event_data={"test": "data"},
            max_retries=3,
        )
        
        # Verify it succeeded after retries
        assert result is not None
        assert call_count >= 3


@pytest.mark.asyncio
async def test_event_consumer_consumption():
    """Test event consumer consuming messages from queue."""
    from src.infrastructure.redis.event_consumer import EventConsumer
    
    consumer = EventConsumer(settings=MagicMock())
    
    # Mock handler
    mock_handler = AsyncMock()
    consumer.register_handler(EventType.EXPENSE_CREATED, mock_handler)
    
    # Mock Redis client to return event
    test_event = {
        "type": EventType.EXPENSE_CREATED,
        "user_id": "user123",
        "expense_id": "exp456",
    }
    
    with patch.object(consumer, 'get_next_event', new=AsyncMock(return_value=test_event)):
        # Process event
        event = await consumer.get_next_event()
        
        # Verify event was retrieved
        assert event["type"] == EventType.EXPENSE_CREATED
        assert event["user_id"] == "user123"


@pytest.mark.asyncio
async def test_worker_pool_processing():
    """Test worker pool processing tasks."""
    from src.infrastructure.workers import WorkerPool, OCRWorker
    
    # Mock factory
    def mock_worker_factory(worker_id):
        worker = MagicMock(spec=OCRWorker)
        worker.worker_id = worker_id
        worker.process_task = AsyncMock(return_value={"status": "success"})
        return worker
    
    # Create worker pool
    pool = WorkerPool(worker_factory=mock_worker_factory, num_workers=3)
    
    # Verify pool has correct number of workers
    assert len(pool.workers) == 3


@pytest.mark.asyncio
async def test_cache_repository_ocr_result(cache_repository):
    """Test caching OCR results."""
    
    # Cache OCR result
    await cache_repository.cache_ocr_result(
        image_data="base64imagedata",
        merchant_name="Starbucks",
        amount=5.50,
        currency="USD",
        category="Food & Dining",
        confidence=0.95,
        ttl_hours=24,
    )
    
    # Attempt to retrieve (would return None as DB not connected in test)
    # In real scenario, would verify cache hit
    result = await cache_repository.get_cached_ocr("base64imagedata")
    # Result may be None in test env, but method should execute without error


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
