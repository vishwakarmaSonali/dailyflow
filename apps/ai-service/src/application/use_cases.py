"""Use cases for AI Service application layer."""

from typing import Optional

from src.application.dtos import ProcessReceiptResponse
from src.domain.receipt_processor import ExtractedExpense, ReceiptProcessor


class ProcessReceiptUseCase:
    """Use case for processing receipt images and extracting expense data."""

    def __init__(self, receipt_processor: ReceiptProcessor) -> None:
        """Initialize use case.
        
        Args:
            receipt_processor: Domain instance for receipt processing
        """
        self.receipt_processor = receipt_processor

    async def execute(
        self,
        image_data: str,
        merchant_hint: Optional[str] = None,
        amount_hint: Optional[float] = None,
    ) -> ProcessReceiptResponse:
        """Process receipt and extract expense data.
        
        Args:
            image_data: Base64 encoded receipt image
            merchant_hint: Optional merchant name hint
            amount_hint: Optional amount hint
            
        Returns:
            ProcessReceiptResponse with extracted data
            
        Raises:
            ValueError: If image processing fails
        """
        # In real implementation, call OpenAI Vision API
        # For now, return mock data structure
        
        expense = ExtractedExpense(
            merchant_name=merchant_hint or "Unknown Merchant",
            amount=amount_hint or 0.0,
            currency="USD",
            category=self.receipt_processor.categorize_receipt(
                merchant_hint or "Unknown"
            ),
            date=None,
            confidence_score=0.85,
        )

        is_valid, errors = self.receipt_processor.validate_extracted_expense(expense)
        if not is_valid:
            raise ValueError(f"Invalid expense data: {', '.join(errors)}")

        return ProcessReceiptResponse(
            merchant_name=expense.merchant_name,
            amount=expense.amount,
            currency=expense.currency,
            category=expense.category.value,
            confidence_score=expense.confidence_score,
        )
