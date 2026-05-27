# Expense Service (:3003)

Expense tracking, category management, and budget monitoring.

## Features
- Expense CRUD operations
- Category management
- Budget setting and tracking
- Budget threshold alerts (80%, 100%)
- Event publishing for anomaly detection

## Endpoints
- `POST /` - Create expense
- `GET /:userId/expenses` - Get user expenses
- `POST /budgets` - Set budget
- `GET /analytics` - Expense analytics

## Events Published
- `expense:created` - New expense created
- `budget:threshold_exceeded` - Budget limit reached
