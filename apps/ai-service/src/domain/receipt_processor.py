"""Receipt processor domain class for OCR and expense extraction."""

from dataclasses import dataclass
from enum import Enum
from typing import Optional


class ReceiptCategory(str, Enum):
    """Valid expense categories extracted from receipts."""

    GROCERIES = "GROCERIES"
    RESTAURANT = "RESTAURANT"
    SHOPPING = "SHOPPING"
    UTILITIES = "UTILITIES"
    TRANSPORTATION = "TRANSPORTATION"
    ENTERTAINMENT = "ENTERTAINMENT"
    HEALTHCARE = "HEALTHCARE"
    OTHER = "OTHER"


@dataclass
class ExtractedExpense:
    """Receipt data extracted by OCR."""

    merchant_name: str
    amount: float
    currency: str
    category: ReceiptCategory
    date: Optional[str]
    tax_amount: Optional[float] = None
    items: Optional[list[str]] = None
    confidence_score: float = 0.0


class ReceiptProcessor:
    """Domain class for receipt processing and OCR logic.
    
    Handles validation and transformation of receipt data.
    Actual OCR calls delegated to infrastructure layer.
    """

    def __init__(self, confidence_threshold: float = 0.7) -> None:
        """Initialize receipt processor.
        
        Args:
            confidence_threshold: Minimum confidence score for OCR results (0.0-1.0)
        """
        self.confidence_threshold = confidence_threshold

    def validate_extracted_expense(self, expense: ExtractedExpense) -> tuple[bool, list[str]]:
        """Validate extracted expense data.
        
        Args:
            expense: Extracted expense to validate
            
        Returns:
            Tuple of (is_valid, list of validation errors)
        """
        errors: list[str] = []

        # Validate amount
        if expense.amount <= 0:
            errors.append("Amount must be greater than zero")

        # Validate confidence
        if expense.confidence_score < self.confidence_threshold:
            errors.append(
                f"Confidence score {expense.confidence_score} below threshold "
                f"{self.confidence_threshold}"
            )

        # Validate currency
        if not expense.currency or len(expense.currency) != 3:
            errors.append("Currency must be 3-letter code (e.g., USD)")

        # Validate merchant name
        if not expense.merchant_name or len(expense.merchant_name.strip()) == 0:
            errors.append("Merchant name cannot be empty")

        # Validate tax if provided
        if expense.tax_amount is not None and expense.tax_amount < 0:
            errors.append("Tax amount cannot be negative")

        return len(errors) == 0, errors

    def categorize_receipt(self, merchant_name: str, items: Optional[list[str]] = None) -> ReceiptCategory:
        """Auto-categorize receipt based on merchant and items.
        
        Args:
            merchant_name: Name of merchant/store
            items: Optional list of items purchased
            
        Returns:
            ReceiptCategory for the expense
        """
        merchant_lower = merchant_name.lower()

        # Simple heuristic-based categorization
        if any(keyword in merchant_lower for keyword in ["grocery", "walmart", "target", "whole foods"]):
            return ReceiptCategory.GROCERIES

        if any(keyword in merchant_lower for keyword in ["restaurant", "cafe", "pizza", "burger", "sushi"]):
            return ReceiptCategory.RESTAURANT

        if any(keyword in merchant_lower for keyword in ["mall", "shop", "store", "amazon", "ebay"]):
            return ReceiptCategory.SHOPPING

        if any(keyword in merchant_lower for keyword in ["gas", "uber", "lyft", "transit"]):
            return ReceiptCategory.TRANSPORTATION

        if any(keyword in merchant_lower for keyword in ["hospital", "clinic", "pharmacy", "doctor"]):
            return ReceiptCategory.HEALTHCARE

        if any(keyword in merchant_lower for keyword in ["movie", "cinema", "theater", "concert"]):
            return ReceiptCategory.ENTERTAINMENT

        if any(keyword in merchant_lower for keyword in ["electric", "water", "gas", "internet"]):
            return ReceiptCategory.UTILITIES

        return ReceiptCategory.OTHER

    def calculate_total_with_tax(self, subtotal: float, tax: Optional[float] = None) -> float:
        """Calculate total amount including tax.
        
        Args:
            subtotal: Subtotal before tax
            tax: Tax amount (optional)
            
        Returns:
            Total amount
        """
        return subtotal + (tax or 0.0)
