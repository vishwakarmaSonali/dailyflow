# Auth Service

User authentication and JWT token management service.

## Features

- **User Registration** - Email/password registration with email verification (future)
- **Login** - Return access + refresh tokens
- **Token Refresh** - Rotate tokens securely
- **Password Reset** - Secure password reset flow (future)
- **Session Management** - Revoke and manage sessions

## Architecture

Following **Clean Architecture** pattern:

```
domain/             Domain entities (User, Email) - zero dependencies
├── entities/
│   └── User.ts
├── value-objects/
│   └── Email.ts
└── repositories/
    └── IUserRepository.ts

application/        Use cases (RegisterUser, LoginUser)
├── use-cases/
├── dtos/
└── ports/

infrastructure/     Implementation (Prisma, HTTP, JWT)
├── repositories/   Implement IUserRepository
├── http/          Express controllers & routes
├── prisma/        Database schema
└── jwt/           JWT token service
```

## Key Endpoints

```bash
POST   /health                          # Health check
POST   /register                        # Register new user
POST   /login                          # Login user
POST   /refresh                        # Refresh access token
POST   /logout                         # Logout user
GET    /users/:id                      # Get user (future)
```

## Database

PostgreSQL with Prisma ORM. Schema:

```prisma
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  password  String    // bcrypt hashed
  name      String
  verified  Boolean   @default(false)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}
```

## Quick Start

```bash
npm install
npm run build
npm run dev
```

## Testing

```bash
npm test              # Run all tests
npm test:coverage    # Coverage report
```

## Development

```bash
npm run lint:fix     # Fix linting
npm run format       # Format code
```
