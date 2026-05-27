# API Gateway

Single entry point for all client requests. Handles routing, authentication, rate limiting, and health checks.

## Features

- **Request Routing**: Forwards requests to downstream services
- **Authentication**: JWT validation middleware
- **Rate Limiting**: Per-user and per-IP rate limiting
- **Health Checks**: Aggregates health status from all services
- **Error Handling**: Consistent error responses
- **Logging**: Structured logging with Pino

## Service Endpoints

| Service | Port | Base Path |
|---------|------|-----------|
| Auth | 3001 | /auth |
| Habit | 3002 | /habits |
| Expense | 3003 | /expenses |
| Analytics | 3004 | /analytics |
| Notification | 3005 | /notifications |
| AI | 8000 | /ai |

## Quick Start

```bash
npm install
npm run dev
```

Gateway will start on `http://localhost:3000`

## Key Endpoints

```bash
# Health check
GET /health

# Auth endpoints
POST /auth/register
POST /auth/login
POST /auth/refresh

# User info (requires token)
GET /me
```

## Environment Variables

See `.env.example` for all required variables.

```bash
GATEWAY_PORT=3000
AUTH_SERVICE_URL=http://localhost:3001
# ... other service URLs
```

## Architecture

```
Gateway
├── middleware/      # Auth, rate limiting, logging
├── routes/          # Route handlers
├── services/        # Service client instances
└── types/           # Type definitions
```

## Testing

```bash
npm test              # Run tests
npm test:watch       # Watch mode
npm test:coverage    # Coverage report
```

## Development

```bash
npm run lint:fix     # Fix linting issues
npm run format       # Format code
npm run build        # Build for production
```
