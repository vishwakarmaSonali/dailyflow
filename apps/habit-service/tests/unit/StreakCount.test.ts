import { StreakCount } from '../src/domain/value-objects/StreakCount';

describe('StreakCount Value Object', () => {
  it('should increment streak', () => {
    const streak = new StreakCount(5, 10, 20);
    const incremented = streak.increment();
    expect(incremented.current).toBe(6);
    expect(incremented.longest).toBe(10);
  });

  it('should detect milestone', () => {
    const streak = new StreakCount(7, 7, 7);
    expect(streak.getMilestone()).toBe(7);
  });

  it('should throw error on negative values', () => {
    expect(() => {
      new StreakCount(-1, 0, 0);
    }).toThrow('Streak counts cannot be negative');
  });
});
