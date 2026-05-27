import { Habit } from '@domain/entities/Habit';
import { StreakCount } from '@domain/value-objects/StreakCount';
import { HabitLoggedEvent } from '@domain/events/HabitLoggedEvent';
import { IHabitRepository } from '@domain/repositories/IHabitRepository';
import { IEventPublisher } from '@application/ports/IEventPublisher';

export interface LogHabitDto {
  habitId: string;
  userId: string;
}

export class LogHabitUseCase {
  constructor(
    private habitRepository: IHabitRepository,
    private eventPublisher: IEventPublisher
  ) {}

  async execute(dto: LogHabitDto): Promise<HabitLoggedEvent> {
    const habit = await this.habitRepository.findById(dto.habitId);
    if (!habit) {
      throw new Error('Habit not found');
    }

    // Calculate streak (simplified - in real app, check last log date)
    const streak = new StreakCount(1, 1, 1);
    const milestone = streak.getMilestone();

    // Publish event
    const event = new HabitLoggedEvent(habit.id, habit.userId, new Date(), streak.current, milestone);
    await this.eventPublisher.publish('habit:logged', {
      habitId: habit.id,
      userId: habit.userId,
      streakCount: streak.current,
      milestone: milestone,
      timestamp: new Date().toISOString(),
    });

    return event;
  }
}
