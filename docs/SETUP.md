# DailyFlow Setup Guide

## Phase 4: Additional Microservices ✅ (CURRENT)

### What We've Done
- ✅ Initialized Git repository and monorepo structure
- ✅ Configured shared tooling (ESLint, Prettier, Jest, Husky, Commitlint)
- ✅ Built API Gateway and Auth Service skeletons
- ✅ Built Habit, Expense, Analytics, and Notification service scaffolding
- ✅ Created service READMEs and architecture documentation

### Next: Phase 5 - AI Service and Frontend

## Installation & Development

### 1. Prerequisites
```bash
# Install pnpm globally
npm install -g pnpm@latest

# Verify versions
node --version    # Should be v18+
pnpm --version    # Should be v8+
```

### 2. Clone & Install Dependencies
```bash
git clone https://github.com/vishwakarmaSonali/dailyflow.git
cd dailyflow
pnpm install
```

### 3. Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Edit with your values
nano .env.local
```

### 4. Docker Services (PostgreSQL, Redis)
```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Verify services
docker-compose ps
```

### 5. Run Services
```bash
# Option A: Start all services
pnpm dev

# Option B: Start individual service
pnpm --filter=@dailyflow/api-gateway run dev

# Option C: Start AI Service
cd apps/ai-service
poetry install
poetry run python -m uvicorn src.main:app --reload --port 8000
```

## Environment Variables

### Critical for Local Dev
- `DATABASE_URL_*` - Each service needs its own PostgreSQL database
- `JWT_SECRET` - For Auth Service (use anything locally, proper value in production)
- `REDIS_URL` - For BullMQ event bus
- `AI_SERVICE_URL` - AI Service base URL for gateway proxying
- `OPENAI_API_KEY` - For AI Service (optional for initial development)
- `OPENAI_MODEL`, `OPENAI_VISION_MODEL`, `OPENAI_WHISPER_MODEL` - OpenAI models used by AI Service

### Production Considerations
- Never commit `.env` (use `.env.example` for template)
- Use secret management (GitHub Secrets, 1Password, Vault)
- Rotate JWT_SECRET regularly
- Use separate credentials per environment

## Common Commands

```bash
# Package management
pnpm add lodash                              # Add to root
pnpm --filter=@dailyflow/habit-service add @types/node

# Testing
pnpm test                                    # All services
pnpm --filter=@dailyflow/habit-service test # Single service

# Linting & Formatting
pnpm lint
pnpm lint:fix
pnpm format

# Build for production
pnpm build

# View workspace info
pnpm list
```

## Troubleshooting

### `pnpm: command not found`
```bash
npm install -g pnpm@latest
```

### PostgreSQL connection error
```bash
# Check if containers are running
docker-compose ps

# Restart services
docker-compose restart
```

### Port already in use
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

## Next Steps

1. **Phase 5**: Create Python AI Service with FastAPI, OCR, and GPT insights
2. **Phase 6**: Initialize Expo mobile app and React dashboard
3. **Run Prisma migrations** for all services and verify database connectivity
4. **Test end-to-end event flow** from Habit Service through Analytics/Notification

---

**Last Updated**: Phase 1 Complete
