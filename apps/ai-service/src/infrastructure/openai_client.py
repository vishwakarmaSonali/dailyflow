"""OpenAI API client wrapper."""

import base64
import logging
from typing import Optional

from openai import AsyncOpenAI

from src.infrastructure.config import Settings

logger = logging.getLogger(__name__)


class OpenAIClient:
    """Wrapper for OpenAI API with error handling and retry logic."""

    def __init__(self, settings: Settings) -> None:
        """Initialize OpenAI client.
        
        Args:
            settings: Application settings with API key
        """
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self.settings = settings

    async def extract_receipt_ocr(self, image_base64: str) -> dict:
        """Extract expense data from receipt image using Vision API.
        
        Args:
            image_base64: Base64 encoded receipt image
            
        Returns:
            Dictionary with extracted expense data
            
        Raises:
            ValueError: If API call fails
        """
        try:
            # Validate base64
            try:
                base64.b64decode(image_base64, validate=True)
            except Exception as e:
                raise ValueError(f"Invalid base64 image data: {str(e)}")

            response = await self.client.chat.completions.create(
                model=self.settings.openai_vision_model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_base64}"
                                },
                            },
                            {
                                "type": "text",
                                "text": """Extract the following from this receipt:
                                1. Merchant/Store name
                                2. Total amount (number only)
                                3. Currency (USD, EUR, etc.)
                                4. Date (if visible)
                                5. Tax amount (if visible)
                                6. Likely expense category (GROCERIES, RESTAURANT, SHOPPING, etc.)
                                
                                Return as JSON: {merchant, amount, currency, date, tax, category}""",
                            },
                        ],
                    }
                ],
                temperature=0.1,  # Low temperature for consistent extraction
            )

            # Parse response
            content = response.choices[0].message.content
            if not content:
                raise ValueError("Empty response from vision API")

            # Extract JSON from response (assuming JSON in response)
            import json

            import re

            json_match = re.search(r"\{.*\}", content, re.DOTALL)
            if not json_match:
                logger.error(f"No JSON found in response: {content}")
                raise ValueError("Could not parse receipt data from response")

            return json.loads(json_match.group())

        except Exception as e:
            logger.error(f"Receipt OCR failed: {str(e)}")
            raise ValueError(f"Receipt processing failed: {str(e)}")

    async def generate_insights_text(self, prompt: str, max_tokens: int = 500) -> str:
        """Generate insights using GPT-4.
        
        Args:
            prompt: Prompt for GPT-4
            max_tokens: Maximum tokens in response
            
        Returns:
            Generated insights text
            
        Raises:
            ValueError: If API call fails
        """
        try:
            response = await self.client.chat.completions.create(
                model=self.settings.openai_model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=max_tokens,
            )

            content = response.choices[0].message.content
            if not content:
                raise ValueError("Empty response from GPT")

            return content

        except Exception as e:
            logger.error(f"Insights generation failed: {str(e)}")
            raise ValueError(f"Insights generation failed: {str(e)}")

    async def transcribe_voice(self, audio_base64: str, format: str) -> dict:
        """Transcribe voice using Whisper API.
        
        Args:
            audio_base64: Base64 encoded audio file
            format: Audio format (mp3, wav, etc.)
            
        Returns:
            Dictionary with transcription and metadata
            
        Raises:
            ValueError: If transcription fails
        """
        try:
            # In real implementation, decode base64 and create file
            # For now, return mock data
            return {
                "text": "Sample transcription from audio",
                "duration": 5.0,
                "confidence": 0.92,
                "language": "en",
            }

        except Exception as e:
            logger.error(f"Voice transcription failed: {str(e)}")
            raise ValueError(f"Voice transcription failed: {str(e)}")
