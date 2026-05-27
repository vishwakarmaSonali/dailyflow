# DailyFlow Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│  📱 Mobile (Expo)          🖥  Dashboard (React.js)                     │
├─────────────────────────────────────────────────────────────────────────┤
│                        API GATEWAY  :3000                               │
│          Auth  ·  Rate-limit  ·  Routing  ·  Health aggregation        │
├──────────┬───────────┬───────────┬───────────┬──────────────────────────┤
│ Auth     │ Habit     │ Expense   │ Analytics │ Notification            │
│ :3001    │ :3002     │ :3003     │ :3004     │ :3005                   │
│ Postgres │ Postgres  │ Postgres  │ Postgres  │ Postgres + Redis        │
├──────────┴───────────┴───────────┴───────────┴──────────────────────────┤
│  🐍 AI Service (Python FastAPI)  :8000                                  │
│  Receipt OCR  ·  Insights  ·  Anomaly  ·  Whisper voice               │
├──────────────────────────────────────────────────────────────────────────┤
│  📨 BullMQ (Redis Upstash) — Async event bus                            │
│  expense:created → anomaly check | weekly:trigger → insights            │
│  habit:milestone → notification  | budget:exceeded → push               │
└──────────────────────────────────────────────────────────────────────────┘
```

## Microservices Breakdown

### 1. API Gateway (:3000)
**Responsibility**: Single entry point for all client requests

**Features**:
- Request routing to downstream services
- JWT authentication & authorization
- Rate limiting per user/IP
- Health check aggregation
- Request/response logging
- CORS configuration
- Error handling & transformation

**Key Dependencies**: express, axios, passport-jwt, express-rate-limit

---

### 2. Auth Service (:3001)
**Responsibility**: User authentication & authorization

**Use Cases**:
- User registration & email verification
- Login & logout
- JWT token issuance (access + refresh)
- Password reset
- Session revocation
- Token rotation

**Database Schema**:
- `users` - Core user data
- `sessions` - Active sessions
- `password_resets` - Reset tokens

---

### 3. Habit Service (:3002)
**Responsibility**: Personal habit tracking & streaks

**Use Cases**:
- Create/update/delete habits
- Log daily habit completion
- Calculate streaks (current, longest, total)
- Milestone detection (7-day, 30-day, 100-day)
- Generate habit analytics

**Events Published**:
- `habit:created` - New habit started
- `habit:logged` - Daily log submitted
- `habit:milestone:reached` - Streak milestone

**Database Schema**:
- `habits` - Habit definitions
- `habit_logs` - Daily completions
- `habit_streaks` - Streak tracking

---

### 4. Expense Service (:3003)
**Responsibility**: Expense tracking & budgeting

**Use Cases**:
- Create/update/delete expenses
- Categorize expenses
- Set budgets per category
- Check budget thresholds
- Receipt URL association
- Generate expense reports

**Events Published**:
- `expense:created` - New expense
- `expense:updated` - Expense modified
- `budget:threshold_exceeded` - 80% / 100% threshold

**Database Schema**:
- `expenses` - Expense entries
- `categories` - Expense categories
- `budgets` - Budget definitions
- `receipts` - Receipt URLs

---

### 5. Analytics Service (:3004)
**Responsibility**: Cross-service analytics & dashboard

**Features**:
- Read-only queries for dashboard
- Spending trends (7-day, 30-day, 90-day)
- Habit completion rates
- Budget vs actual spending
- Category breakdown
- Predictive analytics (based on trends)

**Event Consumers**:
- `expense:created` - Update spending analytics
- `habit:logged` - Update completion rates

**Database Schema**: Read-optimized views/caching

---

### 6. Notification Service (:3005)
**Responsibility**: Push notifications & in-app messaging

**Features**:
- FCM push notification delivery
- In-app notification persistence
- User notification preferences
- Email notifications (future)
- SMS alerts (future)

**Event Consumers**:
- `habit:milestone:reached` - "You hit a 7-day streak! 🔥"
- `budget:threshold_exceeded` - "You've hit 80% of your budget"
- `ai:insights_ready` - "Weekly insights are ready"

**Database Schema**:
- `notification_preferences` - User settings
- `notifications` - Notification history

---

### 7. AI Service (:8000, Python FastAPI)
**Responsibility**: AI-powered features

**Use Cases**:
- **Weekly Insights**: GPT-4o-mini summarizes habits + spending weekly
- **Receipt OCR**: Vision API + GPT extracts text from receipt images
- **Anomaly Detection**: Flags unusual spending patterns
- **Voice Transcription**: Whisper API for voice expense entry

**Events Published**:
- `ai:insights_ready` - Weekly insights generated
- `ai:anomaly_detected` - Unusual pattern detected

---

## Communication Patterns

### Synchronous (REST/HTTP)
- **Client → API Gateway**: All client requests via JWT-validated REST
- **Gateway → Services**: Forward requests via http-proxy-middleware
- **Service → Service**: Direct REST calls for cross-service data (avoided where possible)

### Asynchronous (BullMQ/Redis)
- **Expense → AI**: `expense:created` → anomaly detection
- **Habit → Notification**: `habit:milestone:reached` → push notification
- **Expense → Notification**: `budget:exceeded` → alert
- **AI (self-triggered)**: `weekly:insights_trigger` → run every Sunday 8pm

**Why BullMQ?**
- Decouples services (expense service doesn't wait for anomaly check)
- Enables retries & dead-letter queues
- Handles backpressure (AI service takes time)
- Provides audit trail (all events logged)

---

## Clean Architecture Per Service

Each service follows the same 4-layer pattern:

```
┌─────────────────────────────────┐
│  Infrastructure Layer           │  ← Prisma repos, HTTP controllers,
│  ┌───────────────────────────┐  │     FCM adapter, Redis client
│  │  Application Layer        │  │  ← Use cases, DTOs, service interfaces
│  │  ┌─────────────────────┐  │  │
│  │  │  Domain Layer       │  │  │  ← Entities, Value Objects,
│  │  │  (Zero deps)        │  │  │     Domain Events, IRepositories
│  │  └─────────────────────┘  │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘

Dependencies always point INWARD. The domain layer has ZERO external dependencies.
```

### Example: Habit Service

```
habit-service/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── Habit.ts          # Rich domain object with business rules
│   │   │   └── HabitLog.ts
│   │   ├── value-objects/
│   │   │   └── StreakCount.ts    # Immutable, self-validating
│   │   ├── events/
│   │   │   └── HabitLoggedEvent.ts
│   │   └── repositories/
│   │       └── IHabitRepository.ts (interface - no Prisma!)
│   │
│   ├── application/
│   │   ├── use-cases/
│   │   │   ├── CreateHabitUseCase.ts
│   │   │   ├── LogHabitUseCase.ts
│   │   │   └── CalculateStreakUseCase.ts
│   │   ├── dtos/
│   │   │   └── CreateHabitDto.ts
│   │   └── ports/
│   │       └── IEventPublisher.ts
│   │
│   ├── infrastructure/
│   │   ├── repositories/
│   │   │   └── PrismaHabitRepository.ts (implements IHabitRepository)
│   │   ├── events/
│   │   │   └── BullMQEventPublisher.ts
│   │   ├── http/
│   │   │   ├── HabitController.ts
│   │   │   └── HabitRoutes.ts
│   │   └── container.ts         # Dependency injection
│   │
│   └── main.ts
│
└── tests/
    ├── unit/
    │   ├── domain/Habit.test.ts
    │   └── use-cases/CreateHabitUseCase.test.ts
    └── integration/
        └── HabitController.test.ts
```

---

## Data Flow Example: Logging a Habit

1. **Client** → `POST /habits/123/log` (JWT token included)
2. **API Gateway** → Validates JWT, extracts user ID, forwards to Habit Service
3. **Habit Service Controller** → Receives request, calls LogHabitUseCase
4. **LogHabitUseCase** → Business logic (check habit exists, update streak, etc.)
5. **Domain Layer** → Habit entity calculates new streak
6. **Infrastructure (Prisma)** → Persists to PostgreSQL
7. **EventPublisher** → Publishes `habit:logged` event to Redis
8. **Notification Service** (listening) → Receives event, checks for milestones
9. **Response** → Returns to client with 200 + updated habit data

---

## Database Per Service

Each service has its own PostgreSQL database (schema):

```
PostgreSQL Neon Account
├── dailyflow_auth
│   ├── users
│   └── sessions
├── dailyflow_habit
│   ├── habits
│   ├── habit_logs
│   └── habit_streaks
├── dailyflow_expense
│   ├── expenses
│   ├── categories
│   ├── budgets
│   └── receipts
├── dailyflow_analytics
│   ├── spending_summary (view)
│   └── habit_summary (view)
├── dailyflow_notification
│   ├── notification_preferences
│   └── notifications
└── dailyflow_ai
    └── (job tracking, results)
```

**Key Rule**: Services NEVER query another service's database directly. Cross-service data is fetched via REST calls or carried in async event payloads.

---

## Deployment Architecture

### Development (Local)
- Docker Compose: PostgreSQL + Redis
- All services run locally on different ports
- .env.local with credentials

### Staging
- Neon PostgreSQL (shared infrastructure)
- Upstash Redis
- Docker containers or VPS
- GitHub Actions CI/CD

### Production
- Neon PostgreSQL (production cluster)
- Upstash Redis (production)
- Kubernetes (optional scaling)
- GitHub Actions → Docker Registry → Production

---

## Testing Strategy

### Test Pyramid per Service

```
       ⬢ E2E (5%)
      ⬢⬢⬢ Integration (15%)
    ⬢⬢⬢⬢⬢⬢⬢ Unit (80%)
```

**Coverage Targets**:
- Overall: ≥80%
- Domain layer: ≥90%
- Controllers: ≥70%

### Test Types

1. **Unit Tests** - Domain entities, use cases, value objects
2. **Integration Tests** - Controllers, repositories with in-memory DB
3. **E2E Tests** - API Gateway through all services (limited)

**Framework**: Jest (Node) + pytest (Python)

---

## Code Quality

All services enforce the same standards:

**ESLint**: Detects bugs, enforces best practices
**Prettier**: Automatic formatting
**Husky + Commitlint**: Pre-commit hooks, conventional commits
**TypeScript**: Strict mode enabled
**CI/CD**: GitHub Actions blocks merges on lint/test failures

---

## References

- [Setup Guide](./SETUP.md)
- [API Documentation](./API.md)
- [Testing Strategy](./TESTING.md)
