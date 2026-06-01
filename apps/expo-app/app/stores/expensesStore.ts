import { create } from 'zustand';
import { endpoints } from '../hooks/useAPI';

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
}

export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Health & Fitness',
  'Bills & Utilities',
  'Travel',
  'Education',
  'Other',
];

const MONTHLY_BUDGET = 1000; // default budget

interface ExpensesState {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  budget: number;
  selectedCategory: string | null;

  fetchExpenses: () => Promise<void>;
  createExpense: (data: {
    amount: number;
    category: string;
    description: string;
    date?: string;
  }) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  setSelectedCategory: (category: string | null) => void;
  clearError: () => void;

  // Computed helpers (returned as regular methods for Zustand)
  getTotalThisMonth: () => number;
  getRemainingBudget: () => number;
  getFilteredExpenses: () => Expense[];
  getByCategory: () => Record<string, number>;
}

export const useExpensesStore = create<ExpensesState>((set, get) => ({
  expenses: [],
  loading: false,
  error: null,
  budget: MONTHLY_BUDGET,
  selectedCategory: null,

  fetchExpenses: async () => {
    try {
      set({ loading: true, error: null });
      const response = await endpoints.getExpenses();
      const expenses: Expense[] = (response?.data ?? response ?? []).map((e: any) => ({
        id: e.id,
        amount: parseFloat(e.amount),
        category: e.category ?? 'Other',
        description: e.description ?? '',
        date: e.date ?? e.createdAt ?? new Date().toISOString(),
        createdAt: e.createdAt ?? e.created_at ?? new Date().toISOString(),
      }));
      set({ expenses });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch expenses';
      set({ error: msg });
    } finally {
      set({ loading: false });
    }
  },

  createExpense: async (data) => {
    try {
      set({ error: null });
      const newExpense = await endpoints.createExpense(data);
      const expense: Expense = {
        id: newExpense.id,
        amount: parseFloat(newExpense.amount),
        category: newExpense.category ?? 'Other',
        description: newExpense.description ?? '',
        date: newExpense.date ?? new Date().toISOString(),
        createdAt: newExpense.createdAt ?? new Date().toISOString(),
      };
      set({ expenses: [expense, ...get().expenses] });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create expense';
      set({ error: msg });
      throw err;
    }
  },

  deleteExpense: async (id) => {
    try {
      await endpoints.deleteExpense(id);
      set({ expenses: get().expenses.filter((e) => e.id !== id) });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete expense';
      set({ error: msg });
      throw err;
    }
  },

  setSelectedCategory: (category) => set({ selectedCategory: category }),

  clearError: () => set({ error: null }),

  getTotalThisMonth: () => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    return get()
      .expenses.filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      })
      .reduce((sum, e) => sum + e.amount, 0);
  },

  getRemainingBudget: () => get().budget - get().getTotalThisMonth(),

  getFilteredExpenses: () => {
    const { expenses, selectedCategory } = get();
    if (!selectedCategory) return expenses;
    return expenses.filter((e) => e.category === selectedCategory);
  },

  getByCategory: () => {
    return get().expenses.reduce(
      (acc, e) => {
        acc[e.category] = (acc[e.category] ?? 0) + e.amount;
        return acc;
      },
      {} as Record<string, number>
    );
  },
}));
