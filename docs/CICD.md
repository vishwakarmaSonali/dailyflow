# DailyFlow CI/CD Pipeline

**Last Updated**: Phase 7 — CI/CD Complete  
**Status**: ✅ GitHub Actions configured

---

## Workflow Overview

```
Push / PR
   │
   ├── ci.yml ──────────────────────────────────────── (always runs)
   │    ├── lint          ESLint + Prettier
   │    ├── typecheck     tsc --noEmit per service
   │    ├── test-node     Jest (matrix: api-gateway, auth, habit)
   │    ├── test-web      Jest + React Testing Library (web-dashboard)
   │    ├── test-python   pytest + coverage (ai-service)
   │    ├── build-web     Vite production build
   │    └── build-services tsc compile (matrix)
   │
   ├── pr-checks.yml ────────────────────────────────── (PRs only)
   │    ├── commitlint    Conventional commits validation
   │    ├── pr-size       Lines changed → comment on PR
   │    ├── security-audit npm audit + pip-audit
   │    ├── secret-scan   Gitleaks scan
   │    └── env-check     Ensure .env not committed
   │
   ├── deploy-web.yml ───────────────────────────────── (main only, web changes)
   │    ├── verify-build  Test + build
   │    ├── deploy-vercel vercel --prod
   │    └── smoke-test    HTTP 200 check
   │
   └── docker.yml ───────────────────────────────────── (main only, service changes)
        ├── detect-changes  dorny/paths-filter
        ├── build-push      docker buildx → GHCR (matrix)
        └── summary         Job summary
```

---

## Required GitHub Secrets

Set these in **GitHub → Settings → Secrets and variables → Actions → Secrets**:

### Core Secrets (required for CI)

| Secret | Description | How to get |
|--------|-------------|-----------|
| `JWT_SECRET` | JWT signing key (≥32 chars) | `openssl rand -hex 32` |
| `DATABASE_URL` | Test DB connection string | Neon free tier |
| `REDIS_URL` | Redis connection | Upstash free tier |

### Deployment Secrets (required for deploy-web.yml)

| Secret | Description | How to get |
|--------|-------------|-----------|
| `VERCEL_TOKEN` | Vercel personal access token | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Your Vercel organization ID | `vercel env pull` |
| `VERCEL_PROJECT_ID` | Web dashboard project ID | `vercel link` in `apps/web-dashboard` |
| `VITE_API_URL` | Production API URL | Your deployed API gateway URL |

### Docker Secrets (required for docker.yml)

| Secret | Description |
|--------|-------------|
| `GITHUB_TOKEN` | Auto-provided by GitHub Actions (GHCR login) |

### AI Service Secrets (optional — tests use mocks)

| Secret | Description |
|--------|-------------|
| `OPENAI_API_KEY` | OpenAI API key for integration tests |

### Notification Secrets (for production)

| Secret | Description |
|--------|-------------|
| `FCM_PROJECT_ID` | Firebase Cloud Messaging project |
| `FCM_PRIVATE_KEY` | FCM service account key |
| `FCM_CLIENT_EMAIL` | FCM service account email |

---

## Setting Up Secrets

### 1. Via GitHub UI

1. Go to `https://github.com/YOUR_ORG/dailyflow/settings/secrets/actions`
2. Click **New repository secret**
3. Add each secret from the table above

### 2. Via GitHub CLI (faster)

```bash
# Install gh CLI: brew install gh && gh auth login

# Core secrets
gh secret set JWT_SECRET --body "$(openssl rand -hex 32)"
gh secret set REDIS_URL --body "redis://localhost:6379"
gh secret set DATABASE_URL --body "postgresql://..."

# Vercel
gh secret set VERCEL_TOKEN --body "your_vercel_token"
gh secret set VERCEL_ORG_ID --body "your_org_id"
gh secret set VERCEL_PROJECT_ID --body "your_project_id"
gh secret set VITE_API_URL --body "https://api.dailyflow.app"

# OpenAI
gh secret set OPENAI_API_KEY --body "sk-..."
```

---

## Vercel Setup

### Initial Setup

```bash
# In apps/web-dashboard
cd apps/web-dashboard
npx vercel link          # Connect to Vercel project
npx vercel env pull      # Download .env.local from Vercel
```

### Vercel Project Settings

In the Vercel dashboard → Project → Settings:

- **Framework Preset**: Vite
- **Root Directory**: `apps/web-dashboard`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Environment Variables in Vercel

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://api.dailyflow.app` (your API gateway) |
| `VITE_APP_VERSION` | Set via CI as `${{ github.sha }}` |

---

## Docker Registry (GHCR)

Images are published to: `ghcr.io/YOUR_ORG/dailyflow-SERVICE:latest`

### Pulling Images

```bash
# Login to GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# Pull a service image
docker pull ghcr.io/YOUR_ORG/dailyflow-api-gateway:latest
docker pull ghcr.io/YOUR_ORG/dailyflow-habit-service:latest
docker pull ghcr.io/YOUR_ORG/dailyflow-ai-service:latest
```

### Docker Compose with GHCR images

```yaml
# docker-compose.prod.yml
services:
  api-gateway:
    image: ghcr.io/YOUR_ORG/dailyflow-api-gateway:latest
    env_file: .env.production
    ports: ["3000:3000"]

  habit-service:
    image: ghcr.io/YOUR_ORG/dailyflow-habit-service:latest
    env_file: .env.production
```

---

## Branch Protection Rules

Configure in **GitHub → Settings → Branches → Add rule** for `main`:

```
Branch name pattern: main

☑ Require a pull request before merging
  ☑ Require approvals: 1

☑ Require status checks to pass before merging
  Required checks:
  - CI Passed          (from ci.yml)
  - Secret Scan        (from pr-checks.yml)
  - Env Check          (from pr-checks.yml)

☑ Require branches to be up to date before merging
☑ Require conversation resolution before merging
☑ Do not allow bypassing the above settings
```

---

## Local CI Simulation

Run the same checks locally before pushing:

```bash
# Run all tests
npm test

# Lint
npm run lint

# TypeScript check
cd apps/web-dashboard && npx tsc --noEmit

# Python tests
cd apps/ai-service && poetry run pytest

# Build web dashboard
cd apps/web-dashboard && npm run build

# Security audit
npm audit --audit-level=high

# Secret scan (requires gitleaks installed)
gitleaks detect --source .
```

---

## Deployment Environments

| Environment | Trigger | URL |
|-------------|---------|-----|
| **Production** | Push to `main` (web changes) | `https://app.dailyflow.dev` |
| **Staging** | Manual workflow dispatch | `https://staging.dailyflow.dev` |
| **Preview** | PR opened | Auto-generated Vercel URL |

---

## Monitoring CI Health

- **GitHub Actions Dashboard**: `github.com/YOUR_ORG/dailyflow/actions`
- **Build artifacts**: Retained for 7 days (coverage reports, build zips)
- **Workflow badges**: Add to README.md:

```markdown
[![CI](https://github.com/YOUR_ORG/dailyflow/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_ORG/dailyflow/actions/workflows/ci.yml)
[![Deploy](https://github.com/YOUR_ORG/dailyflow/actions/workflows/deploy-web.yml/badge.svg)](https://github.com/YOUR_ORG/dailyflow/actions/workflows/deploy-web.yml)
```

---

## Troubleshooting

### `npm install` fails in CI
```yaml
# Add to workflow if pnpm-lock.yaml not present
- name: Install with npm fallback
  run: npm install || pnpm install
```

### Vercel deploy fails with "project not found"
```bash
# Re-link the project locally
cd apps/web-dashboard
vercel unlink && vercel link
# Then update VERCEL_PROJECT_ID secret
```

### Docker build fails (no Dockerfile)
Run the `docker.yml` workflow with `workflow_dispatch` to auto-generate Dockerfiles for Node services.

### AI service tests fail with OpenAI error
Tests should mock OpenAI calls. If live calls are needed:
```bash
gh secret set OPENAI_API_KEY --body "sk-your-real-key"
```
