# DailyFlow Setup Guide

## Phase 1: Repository & Monorepo Setup ✅ (CURRENT)

### What We've Done
- ✅ Initialized Git repository
- ✅ Created monorepo structure (pnpm workspaces)
- ✅ Set up `.gitignore`, `package.json`, `.env.example`
- ✅ Created comprehensive README.md

### Next: Phase 2 - Shared Configuration & Tooling

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
```

## Environment Variables

### Critical for Local Dev
- `DATABASE_URL_*` - Each service needs its own PostgreSQL database
- `JWT_SECRET` - For Auth Service (use anything locally, proper value in production)
- `REDIS_URL` - For BullMQ event bus
- `OPENAI_API_KEY` - For AI Service (optional for initial development)

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

1. **Phase 2**: Set up ESLint, Prettier, Husky, Commitlint
2. **Phase 3**: Create API Gateway skeleton
3. **Phase 4**: Create Auth Service with Clean Architecture
4. **Phase 5+**: Additional services and frontend

---

**Last Updated**: Phase 1 Complete
