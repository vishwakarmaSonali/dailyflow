import { Habit } from '@domain/entities/Habit';
import { IHabitRepository } from '@domain/repositories/IHabitRepository';
import { PrismaClient } from '@prisma/client';

export class PrismaHabitRepository implements IHabitRepository {
  constructor(private prisma: PrismaClient) {}

  async save(habit: Habit): Promise<Habit> {
    const dbHabit = await this.prisma.habit.create({
      data: {
        userId: habit.userId,
        name: habit.name,
        description: habit.description,
        frequency: habit.frequency,
      },
    });

    return new Habit(
      dbHabit.id,
      dbHabit.userId,
      dbHabit.name,
      dbHabit.description,
      dbHabit.frequency,
      dbHabit.createdAt
    );
  }

  async findById(id: string): Promise<Habit | null> {
    const dbHabit = await this.prisma.habit.findUnique({ where: { id } });
    if (!dbHabit) return null;

    return new Habit(
      dbHabit.id,
      dbHabit.userId,
      dbHabit.name,
      dbHabit.description,
      dbHabit.frequency,
      dbHabit.createdAt
    );
  }

  async findByUserId(userId: string): Promise<Habit[]> {
    const dbHabits = await this.prisma.habit.findMany({ where: { userId } });
    return dbHabits.map(
      (h) => new Habit(h.id, h.userId, h.name, h.description, h.frequency, h.createdAt)
    );
  }

  async update(habit: Habit): Promise<Habit> {
    const dbHabit = await this.prisma.habit.update({
      where: { id: habit.id },
      data: {
        name: habit.name,
        description: habit.description,
        frequency: habit.frequency,
      },
    });

    return new Habit(
      dbHabit.id,
      dbHabit.userId,
      dbHabit.name,
      dbHabit.description,
      dbHabit.frequency,
      dbHabit.createdAt
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.habit.delete({ where: { id } });
  }
}
