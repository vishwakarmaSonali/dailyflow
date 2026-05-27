import express from 'express';
import { createAuthController } from '@infrastructure/http/AuthController';
import { PrismaUserRepository } from '@infrastructure/repositories/PrismaUserRepository';
import { PrismaClient } from '@prisma/client';

const app = express();
const PORT = process.env.AUTH_SERVICE_PORT || 3001;

app.use(express.json());

// Initialize Prisma
const prisma = new PrismaClient();

// Initialize repositories
const userRepository = new PrismaUserRepository(prisma);

// Register routes
app.use('/auth', createAuthController(userRepository));
app.use('/', createAuthController(userRepository));

app.listen(PORT, () => {
  console.log(`Auth Service listening on http://localhost:${PORT}`);
});

export default app;
