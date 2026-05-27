// Domain Value Object - StreakCount
export class StreakCount {
  constructor(readonly current: number, readonly longest: number, readonly total: number) {
    if (current < 0 || longest < 0 || total < 0) {
      throw new Error('Streak counts cannot be negative');
    }
  }

  increment(): StreakCount {
    return new StreakCount(this.current + 1, Math.max(this.longest, this.current + 1), this.total + 1);
  }

  reset(): StreakCount {
    return new StreakCount(0, this.longest, this.total);
  }

  getMilestone(): number | null {
    const milestones = [7, 30, 100];
    for (const milestone of milestones) {
      if (this.current === milestone) {
        return milestone;
      }
    }
    return null;
  }
}
