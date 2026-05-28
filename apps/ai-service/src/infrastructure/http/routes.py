"""FastAPI routes for AI Service."""

import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, UploadFile, File, status

from src.application.dtos import (
    DetectAnomaliesRequest,
    DetectAnomaliesResponse,
    GenerateInsightsRequest,
    GenerateInsightsResponse,
    HealthCheckResponse,
    ProcessReceiptRequest,
    ProcessReceiptResponse,
    TranscribeVoiceRequest,
    TranscribeVoiceResponse,
)
from src.application.use_cases import ProcessReceiptUseCase
from src.domain.anomaly_detector import AnomalyDetector
from src.domain.insights_engine import InsightsEngine
from src.domain.receipt_processor import ReceiptProcessor
from src.domain.voice_processor import VoiceProcessor
from src.infrastructure.config import Settings
from src.infrastructure.openai_client import OpenAIClient

logger = logging.getLogger(__name__)


def create_router(settings: Settings) -> APIRouter:
    """Create FastAPI router with all AI Service routes.
    
    Args:
        settings: Application settings
        
    Returns:
        APIRouter with all routes
    """
    router = APIRouter(prefix="/api/ai", tags=["AI Service"])

    # Initialize dependencies
    receipt_processor = ReceiptProcessor(
        confidence_threshold=settings.receipt_ocr_confidence_threshold
    )
    insights_engine = InsightsEngine(days_lookback=settings.insights_generation_days)
    anomaly_detector = AnomalyDetector(std_dev_threshold=settings.anomaly_detection_std_devs)
    voice_processor = VoiceProcessor(
        max_file_size_mb=int(settings.voice_transcription_max_file_size / (1024 * 1024))
    )
    openai_client = OpenAIClient(settings)

    # Health check
    @router.get("/health", response_model=HealthCheckResponse)
    async def health_check() -> HealthCheckResponse:
        """Health check endpoint.
        
        Returns:
            Health status
        """
        return HealthCheckResponse(status="healthy")

    # Receipt processing
    @router.post("/receipt/process", response_model=ProcessReceiptResponse)
    async def process_receipt(request: ProcessReceiptRequest) -> ProcessReceiptResponse:
        """Process receipt image and extract expense data.
        
        Args:
            request: Receipt processing request
            
        Returns:
            Extracted expense data
            
        Raises:
            HTTPException: If processing fails
        """
        try:
            use_case = ProcessReceiptUseCase(receipt_processor)
            result = await use_case.execute(
                image_data=request.image_data,
                merchant_hint=request.merchant_hint,
                amount_hint=request.amount_hint,
            )
            return result
        except ValueError as e:
            logger.error(f"Receipt processing error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
            )
        except Exception as e:
            logger.error(f"Unexpected error in receipt processing: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Receipt processing failed",
            )

    # Insights generation
    @router.post("/insights/generate", response_model=GenerateInsightsResponse)
    async def generate_insights(request: GenerateInsightsRequest) -> GenerateInsightsResponse:
        """Generate insights for user.
        
        Args:
            request: Insights generation request
            
        Returns:
            Generated insight
            
        Raises:
            HTTPException: If generation fails
        """
        try:
            # Mock implementation
            insight = insights_engine.analyze_habit_streak(
                habit_name="Sample Habit",
                current_streak=10,
                max_streak=30,
                completion_rate=0.85,
            )

            return GenerateInsightsResponse(
                type=insight.type.value,
                title=insight.title,
                description=insight.description,
                confidence=insight.confidence,
                actionable_items=insight.actionable_items,
            )
        except Exception as e:
            logger.error(f"Insights generation error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Insights generation failed",
            )

    # Anomaly detection
    @router.post("/anomalies/detect", response_model=DetectAnomaliesResponse)
    async def detect_anomalies(request: DetectAnomaliesRequest) -> DetectAnomaliesResponse:
        """Detect spending anomalies.
        
        Args:
            request: Anomaly detection request
            
        Returns:
            Detection results
            
        Raises:
            HTTPException: If detection fails
        """
        try:
            # Mock implementation with sample data
            anomaly = anomaly_detector.detect_spending_anomaly(
                category=request.category,
                current_amount=request.current_amount,
                historical_amounts=[100.0, 110.0, 105.0, 115.0],
            )

            return DetectAnomaliesResponse(
                category=request.category,
                is_anomalous=anomaly is not None,
                anomalies=[
                    {
                        "description": anomaly.description,
                        "severity": anomaly.severity.value,
                        "deviation_pct": anomaly.deviation_pct,
                    }
                ]
                if anomaly
                else [],
                message="Analysis complete" if anomaly is None else "Anomaly detected",
            )
        except Exception as e:
            logger.error(f"Anomaly detection error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Anomaly detection failed",
            )

    # Voice transcription
    @router.post("/voice/transcribe", response_model=TranscribeVoiceResponse)
    async def transcribe_voice(request: TranscribeVoiceRequest) -> TranscribeVoiceResponse:
        """Transcribe voice to text.
        
        Args:
            request: Voice transcription request
            
        Returns:
            Transcription results
            
        Raises:
            HTTPException: If transcription fails
        """
        try:
            from src.domain.voice_processor import AudioFormat

            audio_format = voice_processor.get_audio_format(request.format)
            if not audio_format:
                raise ValueError(f"Unsupported audio format: {request.format}")

            # Mock implementation
            extracted_data = voice_processor.extract_expense_data_from_text(
                "I spent $50 at Starbucks"
            )

            return TranscribeVoiceResponse(
                text="I spent $50 at Starbucks",
                duration_seconds=3.5,
                confidence=0.95,
                extracted_data=extracted_data,
            )
        except ValueError as e:
            logger.error(f"Voice transcription validation error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
            )
        except Exception as e:
            logger.error(f"Voice transcription error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Voice transcription failed",
            )

    return router
