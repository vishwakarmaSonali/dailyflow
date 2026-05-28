"""Anomaly detector domain class for identifying unusual spending patterns."""

from dataclasses import dataclass
from enum import Enum
from statistics import mean, stdev
from typing import Optional


class AnomalySeverity(str, Enum):
    """Severity levels for detected anomalies."""

    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


@dataclass
class Anomaly:
    """Detected spending anomaly."""

    description: str
    severity: AnomalySeverity
    expected_value: float
    actual_value: float
    deviation_pct: float
    recommended_action: str


class AnomalyDetector:
    """Domain class for detecting unusual spending patterns.
    
    Uses statistical methods to identify anomalies.
    Actual data aggregation delegated to infrastructure layer.
    """

    def __init__(self, std_dev_threshold: float = 2.5) -> None:
        """Initialize anomaly detector.
        
        Args:
            std_dev_threshold: Number of standard deviations for anomaly threshold
        """
        self.std_dev_threshold = std_dev_threshold

    def detect_spending_anomaly(
        self,
        category: str,
        current_amount: float,
        historical_amounts: list[float],
    ) -> Optional[Anomaly]:
        """Detect anomalies in spending by category.
        
        Args:
            category: Expense category
            current_amount: Current spending amount
            historical_amounts: List of historical spending amounts
            
        Returns:
            Anomaly if detected, None otherwise
        """
        if len(historical_amounts) < 2:
            return None

        avg = mean(historical_amounts)
        std = stdev(historical_amounts)

        # No variation in history = no anomaly possible
        if std == 0:
            return None

        z_score = abs((current_amount - avg) / std)

        if z_score >= self.std_dev_threshold:
            deviation_pct = abs((current_amount - avg) / avg * 100) if avg > 0 else 0

            if current_amount > avg * 2:
                severity = AnomalySeverity.HIGH
                action = f"Review purchase. Spending {deviation_pct:.0f}% above normal for {category}"
            elif current_amount > avg * 1.5:
                severity = AnomalySeverity.MEDIUM
                action = f"Check if {category} purchase is intentional or recurring"
            else:
                severity = AnomalySeverity.LOW
                action = f"Unusual {category} spending. Consider if this is sustainable"

            return Anomaly(
                description=f"Unusual {category} spending detected",
                severity=severity,
                expected_value=avg,
                actual_value=current_amount,
                deviation_pct=deviation_pct,
                recommended_action=action,
            )

        return None

    def detect_frequency_anomaly(
        self,
        category: str,
        current_frequency: int,
        historical_frequencies: list[int],
    ) -> Optional[Anomaly]:
        """Detect anomalies in transaction frequency.
        
        Args:
            category: Expense category
            current_frequency: Current transaction count
            historical_frequencies: List of historical transaction counts
            
        Returns:
            Anomaly if detected, None otherwise
        """
        if len(historical_frequencies) < 2:
            return None

        avg_frequency = mean(historical_frequencies)
        freq_std = stdev(historical_frequencies) if len(historical_frequencies) > 1 else 0

        if freq_std == 0:
            return None

        z_score = abs((current_frequency - avg_frequency) / freq_std)

        if z_score >= self.std_dev_threshold:
            change_pct = (
                (current_frequency - avg_frequency) / avg_frequency * 100
                if avg_frequency > 0
                else 0
            )

            severity = (
                AnomalySeverity.HIGH
                if abs(change_pct) > 50
                else AnomalySeverity.MEDIUM
            )
            action = f"Unusual frequency of {category} transactions (up {change_pct:.0f}%)"

            return Anomaly(
                description=f"Unusual {category} transaction frequency",
                severity=severity,
                expected_value=avg_frequency,
                actual_value=float(current_frequency),
                deviation_pct=change_pct,
                recommended_action=action,
            )

        return None

    def calculate_z_score(self, value: float, mean_val: float, std_val: float) -> float:
        """Calculate z-score for a value.
        
        Args:
            value: Value to calculate z-score for
            mean_val: Mean of population
            std_val: Standard deviation of population
            
        Returns:
            Z-score
        """
        if std_val == 0:
            return 0.0
        return (value - mean_val) / std_val

    def is_anomalous(self, z_score: float) -> bool:
        """Determine if z-score indicates anomaly.
        
        Args:
            z_score: Z-score to evaluate
            
        Returns:
            True if anomalous
        """
        return abs(z_score) >= self.std_dev_threshold
