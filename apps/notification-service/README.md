# Notification Service (:3005)

Push notifications and in-app messaging.

## Features
- FCM push notification delivery
- In-app notification persistence
- User notification preferences
- Email notifications (future)
- SMS alerts (future)

## Endpoints
- `GET /health` - Health check
- `GET /:userId/preferences` - User notification preferences
- `POST /:userId/preferences` - Update preferences
- `GET /:userId/notifications` - Get user notifications

## Event Consumers
- `habit:milestone:reached` - Send milestone notification
- `budget:threshold_exceeded` - Send budget alert
- `ai:insights_ready` - Send insights ready notification
