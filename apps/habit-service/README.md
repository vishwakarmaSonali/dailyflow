# Habit Service

Habit tracking, daily logging, and streak management.

## Features

- **Habit CRUD** - Create, read, update, delete habits
- **Daily Logging** - Log habit completion
- **Streak Calculation** - Track current, longest, and total streaks
- **Milestone Detection** - Detect 7-day, 30-day, 100-day milestones
- **Event Publishing** - Publish events to notification service

## Key Endpoints

```bash
POST   /health                          # Health check
POST   /                                # Create habit
GET    /:userId/habits                  # Get user habits
POST   /:habitId/log                    # Log completion
GET    /:habitId/analytics              # Habit analytics
```

## Example

```bash
# Create habit
curl -X POST http://localhost:3002 \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "name": "Morning Exercise",
    "description": "30 min workout",
    "frequency": "daily"
  }'

# Log completion
curl -X POST http://localhost:3002/habit123/log \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123"}'
```

## Events Published

- `habit:created` - New habit created
- `habit:logged` - Daily habit logged
- `habit:milestone:reached` - Milestone achieved (7, 30, 100 days)

## Architecture

Following **Clean Architecture** pattern with:
- Domain entities (Habit, HabitLog, StreakCount)
- Value objects (Frequency, Milestone)
- Event publishing to Redis/BullMQ
- Prisma PostgreSQL integration
