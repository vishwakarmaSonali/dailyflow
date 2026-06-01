"""OCR worker for processing receipt images asynchronously."""

import asyncio
import base64
import json
import logging
from typing import Any, Dict, Optional

from src.infrastructure.workers.worker_pool import Worker
from src.infrastructure.config import Settings
from src.infrastructure.database import CacheRepository
from src.infrastructure.event_publisher import EventPublisher
from src.infrastructure.redis import RedisClient

logger = logging.getLogger(__name__)


class OCRWorker(Worker):
    """Worker for asynchronous OCR processing of receipt images."""

    def __init__(
        self,
        worker_id: str,
        cache_repository: CacheRepository,
        event_publisher: EventPublisher,
        redis_client: RedisClient,
        settings: Settings,
        timeout_seconds: int = 30,
    ) -> None:
        """Initialize OCR worker.

        Args:
            worker_id: Unique worker identifier
            cache_repository: Cache repository for storing results
            event_publisher: Event publisher for publishing events
            redis_client: Redis client for retrieving receipts
            settings: Application settings
            timeout_seconds: Task timeout in seconds
        """
        super().__init__(worker_id, timeout_seconds)
        self.cache_repository = cache_repository
        self.event_publisher = event_publisher
        self.redis_client = redis_client
        self.settings = settings
        self.retry_count: Dict[str, int] = {}
        self.max_retries = 3

    async def _execute_task(self, task_data: Dict[str, Any]) -> None:
        """Execute OCR task.

        Args:
            task_data: Task data containing expense_id, image_data, etc.

        Expected task_data format:
            {
                "task_type": "ocr",
                "expense_id": str,
                "user_id": str,
                "image_data": str (base64),
                "original_category": str,
            }
        """
        try:
            expense_id = task_data.get("expense_id")
            user_id = task_data.get("user_id")
            image_data = task_data.get("image_data")
            original_category = task_data.get("original_category", "Uncategorized")

            if not all([expense_id, user_id, image_data]):
                logger.error(
                    f"OCR task missing required fields for expense {expense_id}"
                )
                return

            logger.info(
                f"Worker {self.worker_id} processing OCR for expense {expense_id}"
            )

            result = await self._process_receipt_ocr(image_data, original_category)

            await self.cache_repository.cache_ocr_result(
                image_data=image_data,
                merchant_name=result.get("merchant_name", "Unknown"),
                amount=result.get("amount", 0.0),
                currency=result.get("currency", "USD"),
                category=result.get("category", original_category),
                confidence=result.get("confidence", 0.0),
                tax_amount=result.get("tax_amount"),
                items=result.get("items"),
                ttl_hours=24,
            )

            await self.event_publisher.publish_expense_categorized(
                expense_id=expense_id,
                original_category=original_category,
                suggested_category=result.get("category", original_category),
                confidence=result.get("confidence", 0.0),
                reason=result.get("reason", "Categorized via OCR analysis"),
            )

            logger.info(
                f"Worker {self.worker_id} completed OCR for expense {expense_id}"
            )

        except Exception as e:
            logger.error(
                f"Worker {self.worker_id} OCR processing error: {str(e)}"
            )
            raise

    async def _process_receipt_ocr(
        self, image_data: str, original_category: str
    ) -> Dict[str, Any]:
        """Simulate OCR processing of receipt image.

        In production, this would call OpenAI vision API or similar.

        Args:
            image_data: Base64 encoded image
            original_category: Original expense category

        Returns:
            OCR result with extracted fields
        """
        await asyncio.sleep(0.5)

        merchant_name = "Receipt Merchant"
        amount = 29.99
        currency = "USD"
        category = original_category
        confidence = 0.85
        tax_amount = 2.50
        items = ["Item 1", "Item 2", "Item 3"]
        reason = "Categorized via OCR analysis"

        return {
            "merchant_name": merchant_name,
            "amount": amount,
            "currency": currency,
            "category": category,
            "confidence": confidence,
            "tax_amount": tax_amount,
            "items": items,
            "reason": reason,
        }

    async def _handle_timeout(self, task_data: Dict[str, Any]) -> None:
        """Handle OCR task timeout with retry logic.

        Args:
            task_data: Task that timed out
        """
        expense_id = task_data.get("expense_id")
        retry_key = f"ocr_retry:{expense_id}"

        current_retry = self.retry_count.get(expense_id, 0)
        self.retry_count[expense_id] = current_retry + 1

        if current_retry < self.max_retries:
            logger.info(
                f"Retrying OCR for expense {expense_id} "
                f"(attempt {current_retry + 1}/{self.max_retries})"
            )
            await asyncio.sleep(2 ** current_retry)
            await self.cache_repository.log_event(
                event_type="ocr_timeout",
                payload={
                    "expense_id": expense_id,
                    "retry_attempt": current_retry + 1,
                    "timeout_seconds": self.timeout_seconds,
                },
                status="PENDING",
            )
        else:
            logger.error(
                f"OCR task for expense {expense_id} exceeded max retries"
            )
            await self.cache_repository.log_event(
                event_type="ocr_timeout",
                payload={
                    "expense_id": expense_id,
                    "failed_after_retries": self.max_retries,
                },
                status="FAILED",
            )

    async def _handle_error(
        self, task_data: Dict[str, Any], error: Exception
    ) -> None:
        """Handle OCR task error.

        Args:
            task_data: Task that failed
            error: Exception that was raised
        """
        expense_id = task_data.get("expense_id")
        logger.error(
            f"OCR error for expense {expense_id}: {str(error)}"
        )

        await self.cache_repository.log_event(
            event_type="ocr_error",
            payload={
                "expense_id": expense_id,
                "error": str(error),
            },
            status="FAILED",
        )

        await self.cache_repository.update_event_status(
            event_log_id=expense_id,
            status="FAILED",
            error=f"OCR processing failed: {str(error)}",
        )
