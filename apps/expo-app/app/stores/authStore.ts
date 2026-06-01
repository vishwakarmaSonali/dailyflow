import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, endpoints, tokenManager } from '../hooks/useAPI';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,

  initialize: async () => {
    try {
      set({ loading: true, error: null });
      const isAuth = await tokenManager.isAuthenticated();

      if (isAuth) {
        const token = await tokenManager.getAccessToken();
        if (token) {
          apiClient.setAuthToken(token);
        }
        // Try to get cached user profile
        const cachedUser = await AsyncStorage.getItem('dailyflow_user');
        if (cachedUser) {
          set({ user: JSON.parse(cachedUser), isAuthenticated: true });
        } else {
          set({ isAuthenticated: true });
        }
      } else {
        set({ isAuthenticated: false, user: null });
      }
    } catch (error) {
      console.error('Auth init error:', error);
      set({ isAuthenticated: false, user: null });
    } finally {
      set({ loading: false });
    }
  },

  login: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const response = await endpoints.login({ email, password });
      await tokenManager.setTokens(response.access_token, response.refresh_token);
      apiClient.setAuthToken(response.access_token);

      const user: User = response.user;
      await AsyncStorage.setItem('dailyflow_user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Login failed';
      set({ error: msg });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  signup: async (email, password, name) => {
    try {
      set({ loading: true, error: null });
      const response = await endpoints.signup({ email, password, name });
      await tokenManager.setTokens(response.access_token, response.refresh_token);
      apiClient.setAuthToken(response.access_token);

      const user: User = response.user;
      await AsyncStorage.setItem('dailyflow_user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Signup failed';
      set({ error: msg });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    try {
      set({ loading: true });
      await endpoints.logout().catch(() => {}); // best-effort server logout
      await tokenManager.clearTokens();
      await AsyncStorage.removeItem('dailyflow_user');
      apiClient.clearAuthToken();
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
