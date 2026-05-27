# Docker Compose - Local Development

This `docker-compose.yml` sets up PostgreSQL and Redis for local development.

## Services

- **PostgreSQL 14** - Database server on port 5432
- **Redis 7** - In-memory cache & BullMQ message broker on port 6379

## Quick Start

```bash
# Start services in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop & remove volumes (clean slate)
docker-compose down -v
```

## Connecting Services

### PostgreSQL
```
Host: localhost
Port: 5432
User: postgres
Password: postgres
```

### Redis
```
Host: localhost
Port: 6379
Password: (none)
```

## Creating Databases

```bash
# Connect to PostgreSQL
docker exec -it dailyflow-postgres psql -U postgres

# Create databases
CREATE DATABASE dailyflow_auth;
CREATE DATABASE dailyflow_habit;
CREATE DATABASE dailyflow_expense;
CREATE DATABASE dailyflow_analytics;
CREATE DATABASE dailyflow_notification;
CREATE DATABASE dailyflow_ai;

# Exit
\q
```

## Troubleshooting

### Ports already in use
```bash
# Find and kill process
lsof -i :5432
lsof -i :6379
kill -9 <PID>
```

### Cannot connect to PostgreSQL
```bash
# Check container status
docker ps

# View logs
docker logs dailyflow-postgres

# Restart
docker restart dailyflow-postgres
```

### Reset everything
```bash
docker-compose down -v
docker-compose up -d
```
