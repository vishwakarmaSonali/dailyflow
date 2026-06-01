import { useCallback, useEffect, useState } from 'react'
import {
  APIClient,
  APIEndpoints,
  TokenManager,
  LocalStorageAdapter,
  APIError,
  NetworkError,
} from '@dailyflow/api-client'

// Initialize API client
const apiClient = new APIClient({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 30000,
})

const tokenManager = new TokenManager(new LocalStorageAdapter())
const endpoints = new APIEndpoints(apiClient)

// Custom hook for API calls with loading/error states
export function useAPI<T>(
  apiFn: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiFn()
      setData(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, dependencies)

  useEffect(() => {
    execute()
  }, [execute])

  return { data, loading, error, execute }
}

// Auth hook
export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const isAuth = await tokenManager.isAuthenticated()
        setIsAuthenticated(isAuth)

        if (isAuth) {
          const token = await tokenManager.getAccessToken()
          if (token) {
            apiClient.setAuthToken(token)
          }
        }
      } catch (error) {
        console.error('Auth init error:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true)
      const response = await endpoints.login({ email, password })
      await tokenManager.setTokens(response.access_token, response.refresh_token)
      apiClient.setAuthToken(response.access_token)
      setUser(response.user)
      setIsAuthenticated(true)
      return response
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      setLoading(true)
      await endpoints.logout()
      await tokenManager.clearTokens()
      apiClient.clearAuthToken()
      setUser(null)
      setIsAuthenticated(false)
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const signup = useCallback(
    async (email: string, password: string, name: string) => {
      try {
        setLoading(true)
        const response = await endpoints.signup({ email, password, name })
        await tokenManager.setTokens(response.access_token, response.refresh_token)
        apiClient.setAuthToken(response.access_token)
        setUser(response.user)
        setIsAuthenticated(true)
        return response
      } catch (error) {
        console.error('Signup error:', error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    signup,
  }
}

// Habits hook
export function useHabits() {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchHabits = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await endpoints.getHabits()
      setHabits(response.data)
      return response.data
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch habits')
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const createHabit = useCallback(
    async (habitData: any) => {
      try {
        const newHabit = await endpoints.createHabit(habitData)
        setHabits([...habits, newHabit])
        return newHabit
      } catch (error) {
        console.error('Create habit error:', error)
        throw error
      }
    },
    [habits]
  )

  const logHabit = useCallback(async (habitId: string, notes?: string) => {
    try {
      const log = await endpoints.logHabit({ habit_id: habitId, notes })
      return log
    } catch (error) {
      console.error('Log habit error:', error)
      throw error
    }
  }, [])

  return {
    habits,
    loading,
    error,
    fetchHabits,
    createHabit,
    logHabit,
  }
}

// Expenses hook
export function useExpenses() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await endpoints.getExpenses()
      setExpenses(response.data)
      return response.data
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch expenses')
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const createExpense = useCallback(
    async (expenseData: any) => {
      try {
        const newExpense = await endpoints.createExpense(expenseData)
        setExpenses([...expenses, newExpense])
        return newExpense
      } catch (error) {
        console.error('Create expense error:', error)
        throw error
      }
    },
    [expenses]
  )

  return {
    expenses,
    loading,
    error,
    fetchExpenses,
    createExpense,
  }
}

// Insights hook
export function useInsights() {
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchInsights = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await endpoints.getInsights()
      setInsights(data)
      return data
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch insights')
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const generateInsights = useCallback(async () => {
    try {
      const data = await endpoints.generateInsights()
      setInsights(data)
      return data
    } catch (error) {
      console.error('Generate insights error:', error)
      throw error
    }
  }, [])

  return {
    insights,
    loading,
    error,
    fetchInsights,
    generateInsights,
  }
}

// Analytics hook
export function useAnalytics() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchAnalytics = useCallback(async (period = 'month') => {
    try {
      setLoading(true)
      setError(null)
      const data = await endpoints.getAnalytics(period)
      setAnalytics(data)
      return data
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch analytics')
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    analytics,
    loading,
    error,
    fetchAnalytics,
  }
}

export { apiClient, endpoints, tokenManager }
