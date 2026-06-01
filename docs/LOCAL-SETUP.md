# DailyFlow - Local Development Setup

## Prerequisites

- Docker & Docker Compose
- Node.js 16+ & npm/pnpm
- Python 3.9+ (for AI Service development)
- PostgreSQL client (optional, for debugging)

## Quick Start

### 1. Clone & Install Dependencies

```bash
# Clone repository
git clone <repo-url>
cd dailyflow

# Install dependencies
pnpm install

# Install workspace packages
pnpm install -r
```

### 2. Setup Environment Variables

```bash
# Copy example env
cp .env.example .env

# Update with your API keys
# OPENAI_API_KEY=sk-...
# OPENAI_MODEL=gpt-4
# OPENAI_VISION_MODEL=gpt-4-vision-preview
# OPENAI_WHISPER_MODEL=whisper-1
```

### 3. Start Services with Docker Compose

```bash
# Start all services (PostgreSQL, Redis, AI Service)
docker-compose up -d

# View logs
docker-compose logs -f

# Check health
docker-compose ps
```

### 4. Verify Services

**PostgreSQL** (localhost:5432)
```bash
psql -h localhost -U postgres -d postgres
```

**Redis** (localhost:6379)
```bash
redis-cli ping
# Should return: PONG
```

**AI Service** (localhost:8000)
```bash
curl http://localhost:8000/health
# Should return: {"status": "healthy", "service": "ai-service"}
```

### 5. Start Frontend Services

```bash
# Terminal 1: Web Dashboard
cd apps/web-dashboard
pnpm install
pnpm run dev
# Opens http://localhost:5173

# Terminal 2: Expo App (optional)
cd apps/expo-app
pnpm install
npm start
```

### 6. Run Tests

```bash
# AI Service Tests
cd apps/ai-service
pytest tests/

# Frontend Tests (when implemented)
cd apps/web-dashboard
pnpm run test
```

---

## Service Configuration

### PostgreSQL
- **Host:** localhost:5432
- **User:** postgres
- **Password:** postgres
- **Database:** postgres
- **Health Check:** `pg_isready -U postgres`

### Redis
- **Host:** localhost:6379
- **Health Check:** `redis-cli ping`
- **Features:** Append-only persistence enabled

### AI Service
- **Port:** 8000
- **Health Check:** `GET /health`
- **Worker Check:** `GET /health/workers`
- **OCR Queue:** `/workers/ocr/enqueue`
- **Insights Queue:** `/workers/insights/enqueue`

---

## Development Workflows

### Running AI Service Locally (without Docker)

```bash
cd apps/ai-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI server
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### Debugging Events

```bash
# Watch Redis events
redis-cli SUBSCRIBE "dailyflow:*"

# View Redis queue length
redis-cli LLEN "dailyflow:expense-events"
redis-cli LLEN "dailyflow:habit-events"
```

### Database Migrations

```bash
cd apps/ai-service

# Create migration
alembic revision --autogenerate -m "Description"

# Apply migration
alembic upgrade head

# View migration status
alembic current
```

---

## Common Commands

```bash
# Stop all services
docker-compose down

# View logs for specific service
docker-compose logs ai-service
docker-compose logs postgres
docker-compose logs redis

# Rebuild containers
docker-compose build --no-cache

# Reset volumes (WARNING: deletes data)
docker-compose down -v

# Run only specific services
docker-compose up postgres redis

# Access container shell
docker-compose exec ai-service bash
docker-compose exec postgres psql -U postgres -d postgres
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find what's using port 5432
lsof -i :5432

# Kill process
kill -9 <PID>

# Or use different ports in docker-compose.yml
```

### Redis Connection Error

```bash
# Check Redis status
docker-compose exec redis redis-cli ping

# Restart Redis
docker-compose restart redis
```

### AI Service Fails to Start

```bash
# Check logs
docker-compose logs ai-service

# Verify environment variables
docker-compose exec ai-service env | grep OPENAI

# Verify Redis connection
docker-compose exec ai-service curl -f http://localhost:6379/ping
```

### Database Connection Error

```bash
# Check PostgreSQL status
docker-compose exec postgres pg_isready

# View database size
docker-compose exec postgres psql -U postgres -d postgres -c "\l"

# Reset database
docker-compose exec postgres psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS dailyflow; CREATE DATABASE dailyflow;"
```

---

## Architecture

### Event Flow

```
Service (Auth, Habit, Expense, Analytics)
    ↓ (publishes event)
Redis BullMQ Queue
    ↓ (event-consumer consumes)
AI Service Event Consumer
    ↓ (event handler processes)
Worker Pool (OCR, Insights, Caching)
    ↓ (publishes result event)
Redis BullMQ Queue
    ↓ (other services subscribe)
Other Services (update cache, send notifications)
```

### Data Flow

```
Frontend (React SPA)
    ↓ (API call via axios)
API Gateway (localhost:3000)
    ↓ (routes to microservices)
Services (Auth, Habit, Expense, etc.)
    ↓ (publish events on mutations)
Redis Event Bus
    ↓ (AI Service subscribes)
AI Service (processes asynchronously)
    ↓ (publishes insights/anomalies)
Other Services (consume and update)
```

---

## Performance Tuning

### Redis Memory

```bash
# View memory usage
docker-compose exec redis redis-cli INFO memory

# Set max memory policy
docker-compose exec redis redis-cli CONFIG SET maxmemory 256mb
docker-compose exec redis redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

### PostgreSQL Connections

```bash
# View current connections
docker-compose exec postgres psql -U postgres -d postgres -c "SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;"

# Adjust max connections in docker-compose.yml
# command: postgres -c max_connections=200
```

### AI Service Workers

Update `src/main.py`:
```python
# Increase worker pool size for better throughput
ocr_worker_pool = WorkerPool(
    worker_factory=ocr_worker_factory, 
    num_workers=10  # Increase from 5
)
```

---

## Deployment

See `docs/DEPLOYMENT.md` for production deployment guide.

---

## Support

For issues or questions:
1. Check `docs/` directory for detailed guides
2. Review git logs: `git log --oneline --all`
3. Check service health endpoints
4. View container logs: `docker-compose logs <service>`

---

**Last Updated:** June 1, 2026
**Version:** 0.1.0
**Status:** Development
