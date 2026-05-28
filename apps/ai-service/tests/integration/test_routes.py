"""Integration tests for API routes."""

import pytest

from src.application.dtos import ProcessReceiptRequest


def test_health_check(test_client):
    """Test health check endpoint."""
    response = test_client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_ai_health_check(test_client):
    """Test AI service health check."""
    response = test_client.get("/api/ai/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_process_receipt_success(test_client, mock_receipt_image):
    """Test successful receipt processing."""
    request_data = {
        "image_data": mock_receipt_image,
        "merchant_hint": "Starbucks",
        "amount_hint": 5.50,
    }
    response = test_client.post("/api/ai/receipt/process", json=request_data)
    assert response.status_code == 200
    data = response.json()
    assert data["merchant_name"] == "Starbucks"
    assert data["amount"] == 5.50
    assert data["currency"] == "USD"


def test_process_receipt_missing_data(test_client):
    """Test receipt processing with invalid data."""
    request_data = {"image_data": ""}
    response = test_client.post("/api/ai/receipt/process", json=request_data)
    # Should fail validation
    assert response.status_code in [400, 422]


def test_generate_insights_success(test_client):
    """Test successful insights generation."""
    request_data = {
        "user_id": "user123",
        "insight_type": "habit_streak",
    }
    response = test_client.post("/api/ai/insights/generate", json=request_data)
    assert response.status_code == 200
    data = response.json()
    assert "title" in data
    assert "description" in data
    assert "confidence" in data


def test_detect_anomalies_success(test_client):
    """Test successful anomaly detection."""
    request_data = {
        "user_id": "user123",
        "category": "Groceries",
        "current_amount": 150.0,
    }
    response = test_client.post("/api/ai/anomalies/detect", json=request_data)
    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "Groceries"
    assert "is_anomalous" in data


def test_transcribe_voice_success(test_client):
    """Test successful voice transcription."""
    request_data = {
        "audio_data": "base64encodedaudio",
        "format": "mp3",
        "language": "en",
    }
    response = test_client.post("/api/ai/voice/transcribe", json=request_data)
    assert response.status_code == 200
    data = response.json()
    assert "text" in data
    assert data["duration_seconds"] > 0
    assert data["confidence"] > 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
