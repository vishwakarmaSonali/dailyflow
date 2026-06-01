import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, Calendar, Target, Award } from 'lucide-react'
import { useAuthStore } from '@/stores/appStore'
import { useHabits, useExpenses } from '@/hooks/useAPI'
import Button from '@/components/UI/Button'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { habits, fetchHabits } = useHabits()
  const { expenses, fetchExpenses } = useExpenses()

  useEffect(() => {
    fetchHabits()
    fetchExpenses()
  }, [])

  const totalExpenses = expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0
  const completedHabitsToday = habits?.filter((h) => h.logged_today)?.length || 0
  const totalHabits = habits?.length || 0
  const completionRate = totalHabits > 0 ? Math.round((completedHabitsToday / totalHabits) * 100) : 0

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
        <p className="text-indigo-100">Track your habits and expenses to build a better tomorrow</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Habits</p>
              <p className="text-3xl font-bold text-gray-900">{totalHabits}</p>
            </div>
            <Target size={32} className="text-indigo-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Logged Today</p>
              <p className="text-3xl font-bold text-indigo-600">{completedHabitsToday}</p>
            </div>
            <Calendar size={32} className="text-indigo-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
              <p className="text-3xl font-bold text-green-600">{completionRate}%</p>
            </div>
            <Award size={32} className="text-green-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Spent This Month</p>
              <p className="text-3xl font-bold text-red-600">${totalExpenses.toFixed(2)}</p>
            </div>
            <TrendingUp size={32} className="text-red-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Habits */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Habits</h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/habits')}
            >
              View All
            </Button>
          </div>

          {habits && habits.length > 0 ? (
            <div className="space-y-3">
              {habits.slice(0, 3).map((habit) => (
                <div key={habit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{habit.name}</p>
                    <p className="text-xs text-gray-600">
                      Streak: {habit.streak_count || 0} days
                    </p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${habit.logged_today ? 'bg-green-600' : 'bg-gray-300'}`} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600 py-4">No habits yet. Create one to get started!</p>
          )}
        </div>

        {/* Recent Expenses */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Expenses</h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/expenses')}
            >
              View All
            </Button>
          </div>

          {expenses && expenses.length > 0 ? (
            <div className="space-y-3">
              {expenses.slice(0, 3).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{expense.description}</p>
                    <p className="text-xs text-gray-600">{expense.category}</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">${expense.amount.toFixed(2)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600 py-4">No expenses yet. Track your spending!</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant="primary"
            onClick={() => navigate('/habits')}
            className="w-full"
          >
            Manage Habits
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/expenses')}
            className="w-full"
          >
            Track Expenses
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/analytics')}
            className="w-full"
          >
            View Analytics
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/settings')}
            className="w-full"
          >
            Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
