import { Habit } from '../src/domain/entities/Habit';

describe('Habit Entity', () => {
  it('should create a valid habit', () => {
    const habit = Habit.create('user1', 'Morning Jog', '5km run', 'daily');
    expect(habit.name).toBe('Morning Jog');
    expect(habit.frequency).toBe('daily');
    expect(habit.isValid()).toBe(true);
  });

  it('should throw error with invalid frequency', () => {
    expect(() => {
      Habit.create('user1', 'Exercise', 'description', 'yearly');
    }).toThrow('Invalid frequency');
  });
});
