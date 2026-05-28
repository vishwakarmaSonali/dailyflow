"""Data transfer objects (DTOs) for AI Service API."""

from typing import Optional

from pydantic import BaseModel, Field, field_validator


class ProcessReceiptRequest(BaseModel):
    """Request to process receipt image."""

    image_data: str = Field(..., description="Base64 encoded receipt image")
    merchant_hint: Optional[str] = Field(None, description="Optional merchant name hint")
    amount_hint: Optional[float] = Field(None, description="Optional amount hint in USD")


class ProcessReceiptResponse(BaseModel):
    """Response from receipt processing."""

    merchant_name: str
    amount: float
    currency: str
    category: str
    tax_amount: Optional[float] = None
    items: Optional[list[str]] = None
    confidence_score: float


class GenerateInsightsRequest(BaseModel):
    """Request to generate insights."""

    user_id: str
    insight_type: str = Field(
        ...,
        description="Type of insight: habit_streak, spending_trend, budget_alert, etc.",
    )
    days_lookback: Optional[int] = Field(7, description="Number of days to analyze")


class GenerateInsightsResponse(BaseModel):
    """Response with generated insight."""

    type: str
    title: str
    description: str
    confidence: float
    actionable_items: list[str]


class DetectAnomaliesRequest(BaseModel):
    """Request to detect spending anomalies."""

    user_id: str
    category: str
    current_amount: float
    lookback_days: Optional[int] = Field(30, description="Historical period to analyze")

    @field_validator("current_amount")
    @classmethod
    def validate_amount(cls, v: float) -> float:
        """Validate spending amount."""
        if v < 0:
            raise ValueError("Amount cannot be negative")
        return v


class DetectAnomaliesResponse(BaseModel):
    """Response with detected anomalies."""

    category: str
    is_anomalous: bool
    anomalies: list[dict] = []
    message: str


class TranscribeVoiceRequest(BaseModel):
    """Request to transcribe voice."""

    audio_data: str = Field(..., description="Base64 encoded audio file")
    format: str = Field(..., description="Audio format: mp3, wav, m4a, ogg, flac")
    language: Optional[str] = Field("en", description="Language code (e.g., 'en', 'es')")


class TranscribeVoiceResponse(BaseModel):
    """Response from voice transcription."""

    text: str
    duration_seconds: float
    confidence: float
    extracted_data: dict = Field(
        default_factory=dict, description="Extracted expense data from transcription"
    )


class HealthCheckResponse(BaseModel):
    """Health check response."""

    status: str
    service: str = "ai-service"
    version: str = "0.1.0"
