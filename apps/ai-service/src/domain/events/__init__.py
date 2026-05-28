"""Domain events for AI Service event-driven architecture."""

from dataclasses import dataclass, asdict
from datetime import datetime
from enum import Enum
from typing import Any, Optional
import json


class EventType(str, Enum):
    """Event types consumed and published by AI Service."""

    # Consumed from other services
    EXPENSE_CREATED = "expense:created"
    HABIT_LOGGED = "habit:logged"
    HABIT_MILESTONE_REACHED = "habit:milestone:reached"

    # Published by AI Service
    EXPENSE_CATEGORIZED = "expense:categorized"
    ANOMALY_DETECTED = "anomaly:detected"
    INSIGHT_GENERATED = "insight:generated"


@dataclass
class DomainEvent:
    """Base class for all domain events."""

    event_id: str
    event_type: EventType
    timestamp: datetime
    source_service: str
    data: dict

    def to_json(self) -> str:
        """Serialize event to JSON."""
        return json.dumps(
            {
                "event_id": self.event_id,
                "event_type": self.event_type.value,
                "timestamp": self.timestamp.isoformat(),
                "source_service": self.source_service,
                "data": self.data,
            }
        )


@dataclass
class ExpenseCreatedEvent(DomainEvent):
    """Event when an expense is created."""

    # data fields:
    # - expense_id: str
    # - user_id: str
    # - amount: float
    # - currency: str
    # - category: str
    # - merchant: str
    # - description: str
    # - date: str (ISO format)

    def __post_init__(self) -> None:
        """Validate event type."""
        assert self.event_type == EventType.EXPENSE_CREATED


@dataclass
class HabitLoggedEvent(DomainEvent):
    """Event when a habit is logged."""

    # data fields:
    # - habit_id: str
    # - user_id: str
    # - habit_name: str
    # - logged_at: str (ISO format)
    # - streak_count: int
    # - milestone_reached: bool (optional)

    def __post_init__(self) -> None:
        """Validate event type."""
        assert self.event_type == EventType.HABIT_LOGGED


@dataclass
class HabitMilestoneReachedEvent(DomainEvent):
    """Event when a habit milestone is reached."""

    # data fields:
    # - habit_id: str
    # - user_id: str
    # - habit_name: str
    # - streak_count: int
    # - milestone: int (7, 30, 100, etc.)

    def __post_init__(self) -> None:
        """Validate event type."""
        assert self.event_type == EventType.HABIT_MILESTONE_REACHED


@dataclass
class ExpenseCategorizedEvent(DomainEvent):
    """Event when expense is auto-categorized by AI."""

    # data fields:
    # - expense_id: str
    # - original_category: str
    # - suggested_category: str
    # - confidence: float
    # - reason: str

    def __post_init__(self) -> None:
        """Validate event type."""
        assert self.event_type == EventType.EXPENSE_CATEGORIZED


@dataclass
class AnomalyDetectedEvent(DomainEvent):
    """Event when spending anomaly is detected."""

    # data fields:
    # - user_id: str
    # - category: str
    # - anomaly_type: str (spending, frequency)
    # - severity: str (LOW, MEDIUM, HIGH, CRITICAL)
    # - expected_value: float
    # - actual_value: float
    # - deviation_pct: float
    # - description: str
    # - recommended_action: str

    def __post_init__(self) -> None:
        """Validate event type."""
        assert self.event_type == EventType.ANOMALY_DETECTED


@dataclass
class InsightGeneratedEvent(DomainEvent):
    """Event when insight is generated for user."""

    # data fields:
    # - user_id: str
    # - insight_type: str (HABIT_STREAK, SPENDING_TREND, BUDGET_ALERT, etc.)
    # - title: str
    # - description: str
    # - confidence: float
    # - actionable_items: list[str]

    def __post_init__(self) -> None:
        """Validate event type."""
        assert self.event_type == EventType.INSIGHT_GENERATED
