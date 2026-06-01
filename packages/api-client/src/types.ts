/**
 * Types for DailyFlow API Client
 */

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  category?: string;
  streak_count: number;
  best_streak: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  logged_at: string;
  notes?: string;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  category: string;
  description?: string;
  merchant?: string;
  receipt_url?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface Insight {
  id: string;
  user_id: string;
  type: 'HABIT_STREAK' | 'SPENDING_TREND' | 'SAVINGS_GOAL' | 'ANOMALY';
  title: string;
  description: string;
  confidence: number;
  actionable_items: string[];
  created_at: string;
  expires_at?: string;
}

export interface AnalyticsData {
  period: string;
  total_expenses: number;
  average_daily_expense: number;
  category_breakdown: Record<string, number>;
  spending_trend: Array<{ date: string; amount: number }>;
  habit_completion_rate: number;
}

// Request/Response DTOs
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface CreateHabitRequest {
  name: string;
  description?: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  category?: string;
}

export interface CreateExpenseRequest {
  amount: number;
  currency: string;
  category: string;
  description?: string;
  merchant?: string;
  receipt_url?: string;
  tags?: string[];
}

export interface LogHabitRequest {
  habit_id: string;
  notes?: string;
}

// Error types
export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  has_more: boolean;
}
