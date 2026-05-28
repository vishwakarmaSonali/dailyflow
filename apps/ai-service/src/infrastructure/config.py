"""Configuration for AI Service from environment."""

from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment."""

    # Service
    port: int = 8000
    log_level: str = "INFO"
    environment: str = "development"

    # OpenAI
    openai_api_key: str
    openai_model: str = "gpt-4o-mini"
    openai_vision_model: str = "gpt-4-vision-preview"
    openai_whisper_model: str = "whisper-1"

    # Redis (Event Bus)
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_db: int = 0
    redis_url: str = "redis://localhost:6379/0"

    # Service Discovery
    auth_service_url: str = "http://localhost:3001"
    habit_service_url: str = "http://localhost:3002"
    expense_service_url: str = "http://localhost:3003"
    analytics_service_url: str = "http://localhost:3004"

    # AI Settings
    receipt_ocr_confidence_threshold: float = 0.7
    anomaly_detection_std_devs: float = 2.5
    insights_generation_days: int = 7
    voice_transcription_max_file_size: int = 25000000  # 25MB in bytes

    class Config:
        """Pydantic config."""

        env_file = ".env.local"
        env_file_encoding = "utf-8"
        case_sensitive = False


def get_settings() -> Settings:
    """Get application settings.
    
    Returns:
        Settings instance
    """
    return Settings()
