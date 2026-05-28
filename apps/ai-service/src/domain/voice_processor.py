"""Voice processor domain class for audio transcription logic."""

from dataclasses import dataclass
from enum import Enum
from typing import Optional


class AudioFormat(str, Enum):
    """Supported audio formats."""

    MP3 = "mp3"
    WAV = "wav"
    M4A = "m4a"
    OGG = "ogg"
    FLAC = "flac"


@dataclass
class TranscriptionResult:
    """Result of voice transcription."""

    text: str
    duration_seconds: float
    language: str
    confidence: float
    word_count: int


class VoiceProcessor:
    """Domain class for voice transcription logic.
    
    Handles validation and transformation of audio data.
    Actual transcription calls delegated to infrastructure layer.
    """

    def __init__(self, max_file_size_mb: int = 25, confidence_threshold: float = 0.7) -> None:
        """Initialize voice processor.
        
        Args:
            max_file_size_mb: Maximum file size in megabytes
            confidence_threshold: Minimum confidence score for transcription (0.0-1.0)
        """
        self.max_file_size_bytes = max_file_size_mb * 1024 * 1024
        self.confidence_threshold = confidence_threshold

    def validate_audio_file(
        self, file_size: int, audio_format: AudioFormat
    ) -> tuple[bool, list[str]]:
        """Validate audio file for transcription.
        
        Args:
            file_size: Size of audio file in bytes
            audio_format: Format of audio file
            
        Returns:
            Tuple of (is_valid, list of validation errors)
        """
        errors: list[str] = []

        # Validate file size
        if file_size > self.max_file_size_bytes:
            max_mb = self.max_file_size_bytes / (1024 * 1024)
            errors.append(f"File size exceeds {max_mb}MB limit")

        # Validate format
        if audio_format not in AudioFormat:
            supported = ", ".join([fmt.value for fmt in AudioFormat])
            errors.append(f"Unsupported format. Supported: {supported}")

        return len(errors) == 0, errors

    def extract_expense_data_from_text(self, transcription: str) -> dict:
        """Extract structured expense data from transcribed text.
        
        Simple keyword-based extraction. Real NLP would be more sophisticated.
        
        Args:
            transcription: Transcribed text from audio
            
        Returns:
            Dictionary with extracted data (amount, merchant, category hints)
        """
        text_lower = transcription.lower()

        # Simple amount extraction (looking for "$X" or "X dollars")
        amount: Optional[float] = None
        import re

        amount_match = re.search(r"\$(\d+(?:\.\d{2})?)", text_lower)
        if amount_match:
            amount = float(amount_match.group(1))

        # Merchant extraction (look for common patterns)
        merchant: Optional[str] = None
        merchants = ["walmart", "target", "costco", "whole foods", "amazon", "starbucks"]
        for m in merchants:
            if m in text_lower:
                merchant = m.title()
                break

        # Category hints
        category_hints = []
        if any(word in text_lower for word in ["coffee", "lunch", "dinner", "restaurant"]):
            category_hints.append("RESTAURANT")
        if any(word in text_lower for word in ["groceries", "grocery", "food", "milk", "bread"]):
            category_hints.append("GROCERIES")
        if any(word in text_lower for word in ["uber", "lyft", "gas", "parking"]):
            category_hints.append("TRANSPORTATION")

        return {
            "transcription": transcription,
            "amount": amount,
            "merchant": merchant,
            "category_hints": category_hints,
            "word_count": len(transcription.split()),
        }

    def validate_transcription(self, result: TranscriptionResult) -> tuple[bool, list[str]]:
        """Validate transcription result quality.
        
        Args:
            result: Transcription result to validate
            
        Returns:
            Tuple of (is_valid, list of validation errors)
        """
        errors: list[str] = []

        # Validate confidence
        if result.confidence < self.confidence_threshold:
            errors.append(
                f"Confidence {result.confidence:.2f} below threshold {self.confidence_threshold}"
            )

        # Validate transcription is not empty
        if not result.text or len(result.text.strip()) == 0:
            errors.append("Transcription is empty")

        # Validate reasonable duration
        if result.duration_seconds < 0.5:
            errors.append("Audio is too short to transcribe accurately")

        if result.duration_seconds > 3600:  # 1 hour
            errors.append("Audio is too long (max 1 hour)")

        # Validate word count
        if result.word_count < 1:
            errors.append("No words detected in transcription")

        return len(errors) == 0, errors

    def get_audio_format(self, filename: str) -> Optional[AudioFormat]:
        """Extract audio format from filename.
        
        Args:
            filename: Name of audio file
            
        Returns:
            AudioFormat or None
        """
        if not filename:
            return None

        ext = filename.split(".")[-1].lower()
        try:
            return AudioFormat(ext)
        except ValueError:
            return None
