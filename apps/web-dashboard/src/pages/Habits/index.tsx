import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHabits } from '@/hooks/useAPI'
import { useHabitsStore } from '@/stores/appStore'
import { Plus } from 'lucide-react'

export default function HabitsPage() {
  const navigate = useNavigate()
  const { habits, loading, fetchHabits } = useHabits()
  const { setHabits } = useHabitsStore()

  useEffect(() => {
    const loadHabits = async () => {
      try {
        const data = await fetchHabits()
        setHabits(data || [])
      } catch (error) {
        console.error('Failed to load habits:', error)
      }
    }
    loadHabits()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading habits...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Habits</h2>
        <button
          onClick={() => navigate('/habits/new')}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          <Plus size={20} />
          New Habit
        </button>
      </div>

      {habits && habits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {habits.map((habit) => (
            <div key={habit.id} className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{habit.name}</h3>
                  {habit.description && (
                    <p className="text-sm text-gray-600 mt-1">{habit.description}</p>
                  )}
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700">
                  {habit.frequency}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Current Streak</p>
                  <p className="text-2xl font-bold text-indigo-600">{habit.streak_count}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Best Streak</p>
                  <p className="text-2xl font-bold text-gray-900">{habit.best_streak}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 text-sm font-medium">
                  Log Today
                </button>
                <button className="flex-1 border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50 text-sm font-medium">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No habits yet</h3>
          <p className="text-gray-600 mb-4">Create your first habit to get started</p>
          <button
            onClick={() => navigate('/habits/new')}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            <Plus size={20} />
            Create First Habit
          </button>
        </div>
      )}
    </div>
  )
}
