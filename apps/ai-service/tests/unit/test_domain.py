"""Unit tests for domain layer."""

import pytest

from src.domain.anomaly_detector import AnomalyDetector, AnomalySeverity
from src.domain.insights_engine import InsightsEngine, InsightType
from src.domain.receipt_processor import ReceiptProcessor, ReceiptCategory, ExtractedExpense
from src.domain.voice_processor import VoiceProcessor, AudioFormat, TranscriptionResult


class TestReceiptProcessor:
    """Tests for ReceiptProcessor domain class."""

    @pytest.fixture
    def processor(self):
        """Create processor instance."""
        return ReceiptProcessor(confidence_threshold=0.7)

    def test_validate_extracted_expense_valid(self, processor):
        """Test validation of valid expense."""
        expense = ExtractedExpense(
            merchant_name="Starbucks",
            amount=5.50,
            currency="USD",
            category=ReceiptCategory.RESTAURANT,
            confidence_score=0.85,
        )
        is_valid, errors = processor.validate_extracted_expense(expense)
        assert is_valid
        assert len(errors) == 0

    def test_validate_extracted_expense_invalid_amount(self, processor):
        """Test validation fails with zero amount."""
        expense = ExtractedExpense(
            merchant_name="Store",
            amount=0,
            currency="USD",
            category=ReceiptCategory.SHOPPING,
            confidence_score=0.85,
        )
        is_valid, errors = processor.validate_extracted_expense(expense)
        assert not is_valid
        assert any("greater than zero" in err for err in errors)

    def test_validate_extracted_expense_low_confidence(self, processor):
        """Test validation fails with low confidence."""
        expense = ExtractedExpense(
            merchant_name="Store",
            amount=10.0,
            currency="USD",
            category=ReceiptCategory.SHOPPING,
            confidence_score=0.5,
        )
        is_valid, errors = processor.validate_extracted_expense(expense)
        assert not is_valid
        assert any("below threshold" in err for err in errors)

    def test_categorize_receipt_groceries(self, processor):
        """Test categorization of grocery receipt."""
        category = processor.categorize_receipt("Whole Foods")
        assert category == ReceiptCategory.GROCERIES

    def test_categorize_receipt_restaurant(self, processor):
        """Test categorization of restaurant receipt."""
        category = processor.categorize_receipt("Pizza Hut")
        assert category == ReceiptCategory.RESTAURANT

    def test_categorize_receipt_other(self, processor):
        """Test categorization defaults to other."""
        category = processor.categorize_receipt("Unknown Store")
        assert category == ReceiptCategory.OTHER

    def test_calculate_total_with_tax(self, processor):
        """Test tax calculation."""
        total = processor.calculate_total_with_tax(100.0, 10.0)
        assert total == 110.0

    def test_calculate_total_without_tax(self, processor):
        """Test total without tax."""
        total = processor.calculate_total_with_tax(100.0)
        assert total == 100.0


class TestInsightsEngine:
    """Tests for InsightsEngine domain class."""

    @pytest.fixture
    def engine(self):
        """Create insights engine instance."""
        return InsightsEngine(days_lookback=7)

    def test_analyze_habit_streak_excellent(self, engine):
        """Test excellent habit streak insight."""
        insight = engine.analyze_habit_streak(
            habit_name="Exercise",
            current_streak=15,
            max_streak=20,
            completion_rate=0.95,
        )
        assert insight.type == InsightType.HABIT_STREAK
        assert "fire" in insight.title.lower()
        assert insight.confidence >= 0.9

    def test_analyze_habit_streak_poor(self, engine):
        """Test poor habit streak insight."""
        insight = engine.analyze_habit_streak(
            habit_name="Meditation",
            current_streak=1,
            max_streak=5,
            completion_rate=0.3,
        )
        assert insight.type == InsightType.HABIT_STREAK
        assert "refocus" in insight.title.lower()

    def test_analyze_spending_trend_increase(self, engine):
        """Test spending increase insight."""
        insight = engine.analyze_spending_trend(
            category="Restaurants",
            current_month_total=250.0,
            previous_month_total=150.0,
        )
        assert insight.type == InsightType.SPENDING_TREND
        assert "increased" in insight.description.lower()

    def test_analyze_spending_trend_decrease(self, engine):
        """Test spending decrease insight."""
        insight = engine.analyze_spending_trend(
            category="Shopping",
            current_month_total=100.0,
            previous_month_total=200.0,
        )
        assert insight.type == InsightType.SPENDING_TREND
        assert "decreased" in insight.description.lower()

    def test_calculate_completion_rate(self, engine):
        """Test completion rate calculation."""
        rate = engine.calculate_completion_rate(7, 10)
        assert rate == 0.7

    def test_calculate_completion_rate_exceeds_one(self, engine):
        """Test completion rate caps at 1.0."""
        rate = engine.calculate_completion_rate(10, 5)
        assert rate == 1.0


class TestAnomalyDetector:
    """Tests for AnomalyDetector domain class."""

    @pytest.fixture
    def detector(self):
        """Create detector instance."""
        return AnomalyDetector(std_dev_threshold=2.0)

    def test_detect_spending_anomaly_high(self, detector):
        """Test detection of high spending anomaly."""
        anomaly = detector.detect_spending_anomaly(
            category="Groceries",
            current_amount=500.0,
            historical_amounts=[100.0, 110.0, 105.0, 95.0],
        )
        assert anomaly is not None
        assert anomaly.severity == AnomalySeverity.HIGH

    def test_detect_spending_anomaly_none(self, detector):
        """Test no anomaly detection."""
        anomaly = detector.detect_spending_anomaly(
            category="Groceries",
            current_amount=105.0,
            historical_amounts=[100.0, 110.0, 105.0, 95.0],
        )
        assert anomaly is None

    def test_calculate_z_score(self, detector):
        """Test z-score calculation."""
        z = detector.calculate_z_score(150.0, 100.0, 10.0)
        assert z == 5.0

    def test_is_anomalous(self, detector):
        """Test anomaly determination."""
        assert detector.is_anomalous(3.0)
        assert not detector.is_anomalous(1.0)


class TestVoiceProcessor:
    """Tests for VoiceProcessor domain class."""

    @pytest.fixture
    def processor(self):
        """Create processor instance."""
        return VoiceProcessor(max_file_size_mb=25)

    def test_validate_audio_file_valid(self, processor):
        """Test valid audio file validation."""
        is_valid, errors = processor.validate_audio_file(1000000, AudioFormat.MP3)
        assert is_valid
        assert len(errors) == 0

    def test_validate_audio_file_too_large(self, processor):
        """Test file size validation."""
        is_valid, errors = processor.validate_audio_file(
            26 * 1024 * 1024, AudioFormat.WAV
        )
        assert not is_valid
        assert any("exceeds" in err for err in errors)

    def test_get_audio_format_mp3(self, processor):
        """Test audio format extraction."""
        fmt = processor.get_audio_format("recording.mp3")
        assert fmt == AudioFormat.MP3

    def test_get_audio_format_invalid(self, processor):
        """Test invalid format extraction."""
        fmt = processor.get_audio_format("recording.xyz")
        assert fmt is None

    def test_extract_expense_data_from_text(self, processor):
        """Test expense extraction from transcription."""
        data = processor.extract_expense_data_from_text(
            "I spent $25 at Starbucks for coffee"
        )
        assert data["amount"] == 25.0
        assert "starbucks" in data["merchant"].lower()

    def test_validate_transcription_valid(self, processor):
        """Test valid transcription."""
        result = TranscriptionResult(
            text="Sample transcription",
            duration_seconds=5.0,
            language="en",
            confidence=0.95,
            word_count=2,
        )
        is_valid, errors = processor.validate_transcription(result)
        assert is_valid


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
