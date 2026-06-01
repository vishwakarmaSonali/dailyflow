/**
 * API Endpoints for DailyFlow Services
 */

import { APIClient } from './client';
import {
  User,
  Habit,
  HabitLog,
  Expense,
  Insight,
  AnalyticsData,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  CreateHabitRequest,
  CreateExpenseRequest,
  LogHabitRequest,
  PaginatedResponse,
} from './types';

export class APIEndpoints {
  constructor(private client: APIClient) {}

  // Auth endpoints
  async login(request: LoginRequest): Promise<LoginResponse> {
    return this.client.post('/auth/login', request);
  }

  async signup(request: SignupRequest): Promise<LoginResponse> {
    return this.client.post('/auth/signup', request);
  }

  async logout(): Promise<void> {
    await this.client.post('/auth/logout', {});
  }

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    return this.client.post('/auth/refresh', { refresh_token: refreshToken });
  }

  async getCurrentUser(): Promise<User> {
    return this.client.get('/auth/me');
  }

  // Habit endpoints
  async getHabits(page = 1, limit = 20): Promise<PaginatedResponse<Habit>> {
    return this.client.get(`/habits?page=${page}&limit=${limit}`);
  }

  async getHabit(id: string): Promise<Habit> {
    return this.client.get(`/habits/${id}`);
  }

  async createHabit(request: CreateHabitRequest): Promise<Habit> {
    return this.client.post('/habits', request);
  }

  async updateHabit(id: string, request: Partial<CreateHabitRequest>): Promise<Habit> {
    return this.client.put(`/habits/${id}`, request);
  }

  async deleteHabit(id: string): Promise<void> {
    await this.client.delete(`/habits/${id}`);
  }

  async logHabit(request: LogHabitRequest): Promise<HabitLog> {
    return this.client.post('/habits/log', request);
  }

  async getHabitStreaks(habitId: string): Promise<{ current: number; best: number }> {
    return this.client.get(`/habits/${habitId}/streaks`);
  }

  async getHabitLogs(habitId: string, days = 30): Promise<HabitLog[]> {
    return this.client.get(`/habits/${habitId}/logs?days=${days}`);
  }

  // Expense endpoints
  async getExpenses(page = 1, limit = 20): Promise<PaginatedResponse<Expense>> {
    return this.client.get(`/expenses?page=${page}&limit=${limit}`);
  }

  async getExpense(id: string): Promise<Expense> {
    return this.client.get(`/expenses/${id}`);
  }

  async createExpense(request: CreateExpenseRequest): Promise<Expense> {
    return this.client.post('/expenses', request);
  }

  async updateExpense(id: string, request: Partial<CreateExpenseRequest>): Promise<Expense> {
    return this.client.put(`/expenses/${id}`, request);
  }

  async deleteExpense(id: string): Promise<void> {
    await this.client.delete(`/expenses/${id}`);
  }

  async getExpensesByCategory(category: string): Promise<Expense[]> {
    return this.client.get(`/expenses/category/${category}`);
  }

  async getExpensesByDateRange(startDate: string, endDate: string): Promise<Expense[]> {
    return this.client.get(
      `/expenses/range?start=${startDate}&end=${endDate}`
    );
  }

  // Insight endpoints
  async getInsights(): Promise<Insight[]> {
    return this.client.get('/insights');
  }

  async getInsightByType(type: string): Promise<Insight | null> {
    return this.client.get(`/insights/${type}`);
  }

  async generateInsights(): Promise<Insight[]> {
    return this.client.post('/insights/generate', {});
  }

  // Analytics endpoints
  async getAnalytics(period = 'month'): Promise<AnalyticsData> {
    return this.client.get(`/analytics?period=${period}`);
  }

  async getSpendingTrend(days = 30): Promise<{ date: string; amount: number }[]> {
    return this.client.get(`/analytics/spending-trend?days=${days}`);
  }

  async getCategoryBreakdown(): Promise<Record<string, number>> {
    return this.client.get('/analytics/category-breakdown');
  }

  async getHabitCompletionRate(): Promise<{ rate: number; trend: number[] }> {
    return this.client.get('/analytics/habit-completion');
  }
}
