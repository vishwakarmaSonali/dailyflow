# Analytics Service (:3004)

Read-optimized analytics and dashboard queries.

## Features
- Spending trends (7-day, 30-day, 90-day)
- Habit completion rates
- Budget vs actual analysis
- Category breakdown
- Predictive analytics

## Endpoints
- `GET /:userId/dashboard` - User dashboard data
- `GET /:userId/spending-trends` - Spending trends
- `GET /:userId/habits-analytics` - Habit analytics
- `GET /health` - Health check

## Event Consumers
- `expense:created` - Update spending analytics
- `habit:logged` - Update completion rates
