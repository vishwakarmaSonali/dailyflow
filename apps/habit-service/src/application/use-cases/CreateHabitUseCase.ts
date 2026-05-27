import { Habit } from '@domain/entities/Habit';
import { IHabitRepository } from '@domain/repositories/IHabitRepository';

export interface CreateHabitDto {
  userId: string;
  name: string;
  description: string;
  frequency: string;
}

export class CreateHabitUseCase {
  constructor(private habitRepository: IHabitRepository) {}

  async execute(dto: CreateHabitDto): Promise<Habit> {
    const habit = Habit.create(dto.userId, dto.name, dto.description, dto.frequency);
    return this.habitRepository.save(habit);
  }
}
