import { Habit } from '../entities/Habit';

export interface IHabitRepository {
  save(habit: Habit): Promise<Habit>;
  findById(id: string): Promise<Habit | null>;
  findByUserId(userId: string): Promise<Habit[]>;
  update(habit: Habit): Promise<Habit>;
  delete(id: string): Promise<void>;
}
