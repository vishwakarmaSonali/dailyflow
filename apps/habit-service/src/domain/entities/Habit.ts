// Domain Entity - Habit
export class Habit {
  constructor(
    readonly id: string,
    readonly userId: string,
    readonly name: string,
    readonly description: string,
    readonly frequency: string,
    readonly createdAt: Date
  ) {}

  isValid(): boolean {
    return Boolean(this.name && this.userId && this.frequency);
  }

  static create(userId: string, name: string, description: string, frequency: string): Habit {
    if (!userId || !name) {
      throw new Error('userId and name are required');
    }
    if (!['daily', 'weekly', 'monthly'].includes(frequency)) {
      throw new Error('Invalid frequency');
    }
    return new Habit(
      Math.random().toString(36).substr(2, 9),
      userId,
      name,
      description,
      frequency,
      new Date()
    );
  }
}
