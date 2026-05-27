import express from 'express';
import { createHabitController } from '@infrastructure/http/HabitController';
import { PrismaHabitRepository } from '@infrastructure/repositories/PrismaHabitRepository';
import { BullMQEventPublisher } from '@infrastructure/events/BullMQEventPublisher';
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';

const app = express();
const PORT = process.env.HABIT_SERVICE_PORT || 3002;

app.use(express.json());

// Initialize Prisma
const prisma = new PrismaClient();

// Initialize Redis
const redis = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
redis.connect().catch((err) => console.error('Redis error:', err));

// Initialize repositories & services
const habitRepository = new PrismaHabitRepository(prisma);
const eventPublisher = new BullMQEventPublisher(redis as any);

// Register routes
app.use('/', createHabitController(habitRepository, eventPublisher));

app.listen(PORT, () => {
  console.log(`Habit Service listening on http://localhost:${PORT}`);
});

export default app;
