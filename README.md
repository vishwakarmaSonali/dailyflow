# DailyFlow - Enterprise Personal Productivity Platform

**DailyFlow** is a comprehensive personal productivity platform that combines habit tracking, expense management, and AI-powered insights. Built with enterprise-grade microservices architecture, Clean Architecture patterns, and comprehensive testing.

## 🏗️ Architecture Overview

### Technology Stack
- **Frontend**: React Native (Expo) + React.js Dashboard
- **Backend**: Node.js (6 services) + Python FastAPI (1 service) + API Gateway
- **Database**: PostgreSQL (Neon) - Database Per Service pattern
- **Messaging**: Redis + BullMQ (async event bus)
- **Testing**: Jest (Node) + pytest (Python) - 80% coverage minimum
- **DevOps**: Docker Compose, GitHub Actions, Husky

### Microservices
1. **API Gateway** (:3000) - Single entry point, auth, routing, health checks
2. **Auth Service** (:3001) - User management, JWT tokens, password reset
3. **Habit Service** (:3002) - Habit CRUD, daily logging, streak tracking
4. **Expense Service** (:3003) - Expense tracking, budgets, categories
5. **Analytics Service** (:3004) - Dashboard queries, spending trends
6. **Notification Service** (:3005) - Push notifications, in-app messaging
7. **AI Service** (:8000, Python) - GPT insights, OCR, anomaly detection

## 📋 Quick Start

### Prerequisites
- Node.js 18+ (with pnpm)
- Python 3.10+
- Docker & Docker Compose
- PostgreSQL 14+ (Neon account)
- Redis (Upstash account)

### Local Development Setup

```bash
# Install dependencies (all services)
pnpm install

# Set up environment variables
cp .env.example .env.local

# Start services with Docker Compose
docker-compose up -d

# Run database migrations
pnpm --filter=@dailyflow/auth-service run migrate

# Start API Gateway (development)
pnpm --filter=@dailyflow/api-gateway run dev

# Start individual services
pnpm --filter=@dailyflow/habit-service run dev
pnpm --filter=@dailyflow/expense-service run dev
```

## 📚 Documentation

- [Setup Guide](./docs/SETUP.md) - Detailed setup instructions
- [Architecture](./docs/ARCHITECTURE.md) - System design & patterns
- [API Documentation](./docs/API.md) - REST endpoints
- [Testing Strategy](./docs/TESTING.md) - Coverage & patterns
- [Deployment](./docs/DEPLOYMENT.md) - Production checklist

## 🗂️ Project Structure

```
dailyflow/
├── apps/
│   ├── api-gateway/          # Express API Gateway
│   ├── auth-service/         # Authentication & Authorization
│   ├── habit-service/        # Habit tracking & streaks
│   ├── expense-service/      # Expense & budget tracking
│   ├── analytics-service/    # Analytics & dashboard
│   ├── notification-service/ # Push notifications
│   ├── ai-service/           # Python: GPT, OCR, Whisper
│   ├── mobile/               # Expo React Native app
│   └── dashboard/            # React.js web dashboard
├── packages/
│   ├── shared-types/         # TypeScript types
│   ├── shared-utils/         # Utilities, constants
│   ├── shared-config/        # ESLint, Prettier, Jest configs
│   └── logger/               # Structured logging
├── docs/                     # Documentation
├── docker-compose.yml        # Local dev environment
├── pnpm-workspace.yaml       # Workspace config
└── .github/workflows/        # CI/CD pipelines
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run specific service tests
pnpm --filter=@dailyflow/habit-service test
```

## 📦 Build & Deploy

```bash
# Build all services
pnpm build

# Build specific service
pnpm --filter=@dailyflow/api-gateway build

# Docker build
docker build -t dailyflow-api-gateway apps/api-gateway/
```

## 🔄 Git Workflow

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit with conventional commits: `git commit -m "feat: description"`
3. Push and create a pull request
4. CI/CD pipeline runs automatically
5. Code review and merge

## 📄 License

MIT

## 👥 Team

Created by the DailyFlow team.

---

**Status**: 🚀 Phase 1 - Repository & Monorepo Setup (In Progress)
