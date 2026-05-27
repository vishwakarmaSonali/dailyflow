// Domain Event
export class HabitLoggedEvent {
  constructor(
    readonly habitId: string,
    readonly userId: string,
    readonly timestamp: Date,
    readonly streakCount: number,
    readonly milestone: number | null
  ) {}
}
