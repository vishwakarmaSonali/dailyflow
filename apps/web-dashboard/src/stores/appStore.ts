import { create } from 'zustand'
import { useAuth as useAuthHook } from '@dailyflow/api-client'
import type { User } from '@dailyflow/api-client'

interface AuthStore {
  user: User | null
  token: string | null
  isLoading: boolean
  error: Error | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
  clearError: () => void
}

export const useAuthStore = create<AuthStore>((set) => {
  const { login: apiLogin, signup: apiSignup, logout: apiLogout } = useAuthHook()

  return {
    user: null,
    token: null,
    isLoading: false,
    error: null,

    login: async (email: string, password: string) => {
      set({ isLoading: true, error: null })
      try {
        const response = await apiLogin(email, password)
        set({ user: response.user, token: response.access_token, isLoading: false })
      } catch (error) {
        set({ error: error instanceof Error ? error : new Error('Login failed'), isLoading: false })
        throw error
      }
    },

    signup: async (email: string, password: string, name: string) => {
      set({ isLoading: true, error: null })
      try {
        const response = await apiSignup(email, password, name)
        set({ user: response.user, token: response.access_token, isLoading: false })
      } catch (error) {
        set({ error: error instanceof Error ? error : new Error('Signup failed'), isLoading: false })
        throw error
      }
    },

    logout: async () => {
      set({ isLoading: true })
      try {
        await apiLogout()
        set({ user: null, token: null, isLoading: false, error: null })
      } catch (error) {
        set({ error: error instanceof Error ? error : new Error('Logout failed'), isLoading: false })
        throw error
      }
    },

    setUser: (user) => set({ user }),

    clearError: () => set({ error: null }),
  }
})

// Habits store
interface HabitsStore {
  habits: any[]
  loading: boolean
  error: Error | null
  setHabits: (habits: any[]) => void
  addHabit: (habit: any) => void
  removeHabit: (id: string) => void
  updateHabit: (id: string, habit: any) => void
  setLoading: (loading: boolean) => void
  setError: (error: Error | null) => void
}

export const useHabitsStore = create<HabitsStore>((set) => ({
  habits: [],
  loading: false,
  error: null,
  setHabits: (habits) => set({ habits }),
  addHabit: (habit) => set((state) => ({ habits: [...state.habits, habit] })),
  removeHabit: (id) => set((state) => ({ habits: state.habits.filter((h) => h.id !== id) })),
  updateHabit: (id, habit) =>
    set((state) => ({
      habits: state.habits.map((h) => (h.id === id ? habit : h)),
    })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}))

// Expenses store
interface ExpensesStore {
  expenses: any[]
  loading: boolean
  error: Error | null
  setExpenses: (expenses: any[]) => void
  addExpense: (expense: any) => void
  removeExpense: (id: string) => void
  updateExpense: (id: string, expense: any) => void
  setLoading: (loading: boolean) => void
  setError: (error: Error | null) => void
}

export const useExpensesStore = create<ExpensesStore>((set) => ({
  expenses: [],
  loading: false,
  error: null,
  setExpenses: (expenses) => set({ expenses }),
  addExpense: (expense) => set((state) => ({ expenses: [...state.expenses, expense] })),
  removeExpense: (id) => set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) })),
  updateExpense: (id, expense) =>
    set((state) => ({
      expenses: state.expenses.map((e) => (e.id === id ? expense : e)),
    })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}))
