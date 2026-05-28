"""Insights engine domain class for generating habit and expense insights."""

from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import Enum
from typing import Optional


class InsightType(str, Enum):
    """Types of insights that can be generated."""

    HABIT_STREAK = "HABIT_STREAK"
    SPENDING_TREND = "SPENDING_TREND"
    BUDGET_ALERT = "BUDGET_ALERT"
    CATEGORY_INSIGHT = "CATEGORY_INSIGHT"
    GOAL_PROGRESS = "GOAL_PROGRESS"


@dataclass
class Insight:
    """Generated insight for user."""

    type: InsightType
    title: str
    description: str
    confidence: float
    actionable_items: list[str]
    generated_at: datetime


class InsightsEngine:
    """Domain class for generating habit and expense insights.
    
    Performs analysis on habit streaks and spending patterns.
    Actual data aggregation delegated to infrastructure layer.
    """

    def __init__(self, days_lookback: int = 7) -> None:
        """Initialize insights engine.
        
        Args:
            days_lookback: Number of days to analyze for trends
        """
        self.days_lookback = days_lookback

    def analyze_habit_streak(
        self,
        habit_name: str,
        current_streak: int,
        max_streak: int,
        completion_rate: float,
    ) -> Insight:
        """Generate insight about habit streak.
        
        Args:
            habit_name: Name of the habit
            current_streak: Current streak count
            max_streak: Maximum streak achieved
            completion_rate: Percentage of days completed (0-1)
            
        Returns:
            Insight about the habit
        """
        if completion_rate >= 0.9:
            title = f"🔥 {habit_name} is on fire!"
            description = f"You've completed {habit_name} {int(completion_rate * 100)}% of the time."
            confidence = 0.95
            actionable = ["Keep up the momentum!", "Consider increasing the difficulty"]
        elif completion_rate >= 0.7:
            title = f"✨ Good progress on {habit_name}"
            description = f"Current streak: {current_streak} days. Your dedication is paying off!"
            confidence = 0.85
            actionable = ["Don't break the streak", "Small improvements compound over time"]
        else:
            title = f"📈 Time to refocus on {habit_name}"
            description = f"Completion rate is at {int(completion_rate * 100)}%. You've done {max_streak} days before!"
            confidence = 0.8
            actionable = ["Start with just one day", "Track what's preventing completion"]

        return Insight(
            type=InsightType.HABIT_STREAK,
            title=title,
            description=description,
            confidence=confidence,
            actionable_items=actionable,
            generated_at=datetime.now(),
        )

    def analyze_spending_trend(
        self,
        category: str,
        current_month_total: float,
        previous_month_total: float,
        budget_limit: Optional[float] = None,
    ) -> Insight:
        """Generate insight about spending trend.
        
        Args:
            category: Expense category
            current_month_total: Total spending this month
            previous_month_total: Total spending last month
            budget_limit: Optional monthly budget
            
        Returns:
            Insight about spending trend
        """
        change_pct = (
            ((current_month_total - previous_month_total) / previous_month_total * 100)
            if previous_month_total > 0
            else 0
        )

        if current_month_total > (budget_limit or float("inf")):
            title = f"⚠️ {category} spending exceeded budget"
            description = f"You've spent ${current_month_total:.2f} vs budget of ${budget_limit:.2f}"
            confidence = 0.99
            actionable = ["Review recent purchases", "Set stricter spending limits next month"]
        elif change_pct > 20:
            title = f"📊 {category} spending increased"
            description = f"Up {change_pct:.0f}% from last month (${current_month_total:.2f})"
            confidence = 0.8
            actionable = ["Investigate unusual purchases", "Identify new spending patterns"]
        elif change_pct < -20:
            title = f"💰 {category} spending decreased"
            description = f"Down {abs(change_pct):.0f}% from last month (${current_month_total:.2f})"
            confidence = 0.8
            actionable = ["Great progress!", "Maintain this spending level"]
        else:
            title = f"📌 {category} spending is stable"
            description = f"Spending is consistent at ${current_month_total:.2f}/month"
            confidence = 0.75
            actionable = ["Keep tracking regularly"]

        return Insight(
            type=InsightType.SPENDING_TREND,
            title=title,
            description=description,
            confidence=confidence,
            actionable_items=actionable,
            generated_at=datetime.now(),
        )

    def calculate_completion_rate(self, completed_days: int, total_days: int) -> float:
        """Calculate habit completion rate.
        
        Args:
            completed_days: Number of days completed
            total_days: Total days to track
            
        Returns:
            Completion rate as float (0.0-1.0)
        """
        if total_days == 0:
            return 0.0
        return min(completed_days / total_days, 1.0)

    def get_trend_direction(self, current: float, previous: float) -> str:
        """Determine trend direction.
        
        Args:
            current: Current value
            previous: Previous value
            
        Returns:
            "up", "down", or "stable"
        """
        change_pct = (current - previous) / previous if previous > 0 else 0

        if change_pct > 0.1:
            return "up"
        elif change_pct < -0.1:
            return "down"
        else:
            return "stable"
