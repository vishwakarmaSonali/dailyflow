"""Pytest configuration and fixtures."""

import pytest
from fastapi.testclient import TestClient

from src.infrastructure.config import Settings
from src.main import create_app


@pytest.fixture
def settings():
    """Create test settings."""
    return Settings(
        openai_api_key="test-key",
        environment="testing",
    )


@pytest.fixture
def test_client():
    """Create test client."""
    app = create_app()
    return TestClient(app)


@pytest.fixture
def mock_receipt_image():
    """Mock receipt image in base64."""
    return "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
