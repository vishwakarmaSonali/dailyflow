import { create } from 'zustand';
import { endpoints } from '../hooks/useAPI';

export interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  streakCount: number;
  lastLoggedAt?: string;
  createdAt: string;
  isCompletedToday?: boolean;
}

export interface HabitLog {
  id: string;
  habitId: string;
  notes?: string;
  loggedAt: string;
}

interface HabitsState {
  habits: Habit[];
  loading: boolean;
  error: string | null;
  actionLoading: string | null; // habitId currently being actioned

  fetchHabits: () => Promise<void>;
  createHabit: (data: { name: string; description?: string; frequency: string }) => Promise<void>;
  logHabit: (habitId: string, notes?: string) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  clearError: () => void;
}

export const useHabitsStore = create<HabitsState>((set, get) => ({
  habits: [],
  loading: false,
  error: null,
  actionLoading: null,

  fetchHabits: async () => {
    try {
      set({ loading: true, error: null });
      const response = await endpoints.getHabits();
      const habits: Habit[] = (response?.data ?? response ?? []).map((h: any) => ({
        id: h.id,
        name: h.name,
        description: h.description,
        frequency: h.frequency ?? 'daily',
        streakCount: h.streakCount ?? h.streak_count ?? 0,
        lastLoggedAt: h.lastLoggedAt ?? h.last_logged_at,
        createdAt: h.createdAt ?? h.created_at,
        isCompletedToday: h.isCompletedToday ?? false,
      }));
      set({ habits });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch habits';
      set({ error: msg });
    } finally {
      set({ loading: false });
    }
  },

  createHabit: async (data) => {
    try {
      set({ error: null });
      const newHabit = await endpoints.createHabit(data);
      const habit: Habit = {
        id: newHabit.id,
        name: newHabit.name,
        description: newHabit.description,
        frequency: newHabit.frequency ?? 'daily',
        streakCount: 0,
        createdAt: newHabit.createdAt ?? new Date().toISOString(),
        isCompletedToday: false,
      };
      set({ habits: [...get().habits, habit] });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create habit';
      set({ error: msg });
      throw err;
    }
  },

  logHabit: async (habitId, notes) => {
    try {
      set({ actionLoading: habitId });
      await endpoints.logHabit({ habit_id: habitId, notes });
      // Optimistically update streak & completion
      set({
        habits: get().habits.map((h) =>
          h.id === habitId
            ? {
                ...h,
                isCompletedToday: true,
                streakCount: h.streakCount + 1,
                lastLoggedAt: new Date().toISOString(),
              }
            : h
        ),
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to log habit';
      set({ error: msg });
      throw err;
    } finally {
      set({ actionLoading: null });
    }
  },

  deleteHabit: async (habitId) => {
    try {
      set({ actionLoading: habitId });
      await endpoints.deleteHabit(habitId);
      set({ habits: get().habits.filter((h) => h.id !== habitId) });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete habit';
      set({ error: msg });
      throw err;
    } finally {
      set({ actionLoading: null });
    }
  },

  clearError: () => set({ error: null }),
}));
