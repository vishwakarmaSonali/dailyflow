import React, { useState, useEffect } from 'react'
import { Plus, CheckCircle2, TrendingUp } from 'lucide-react'
import { useHabits } from '@/hooks/useAPI'
import { useHabitsStore } from '@/stores/appStore'
import NewHabitModal from '@/components/Habits/NewHabitModal'
import Button from '@/components/UI/Button'

export default function HabitsPage() {
  const { habits, loading, fetchHabits, logHabit } = useHabits()
  const { setHabits } = useHabitsStore()
  const [isModalOpen, setIsModalOpen] = useState(false)

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

  const handleLogToday = async (habitId: string) => {
    try {
      await logHabit(habitId)
      const data = await fetchHabits()
      setHabits(data || [])
    } catch (error) {
      console.error('Failed to log habit:', error)
    }
  }

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
        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus size={20} />
          New Habit
        </Button>
      </div>

      <NewHabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          const loadHabits = async () => {
            const data = await fetchHabits()
            setHabits(data || [])
          }
          loadHabits()
        }}
      />

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

              <div className="grid grid-cols-2 gap-4 mb-6 py-4 border-y border-gray-200">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Current Streak</p>
                  <p className="text-2xl font-bold text-indigo-600">{habit.streak_count || 0}</p>
                  <p className="text-xs text-gray-500">days</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Best Streak</p>
                  <p className="text-2xl font-bold text-green-600">{habit.best_streak || 0}</p>
                  <p className="text-xs text-gray-500">days</p>
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => handleLogToday(habit.id)}
                className="w-full flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={16} />
                Log Today
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <TrendingUp size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">No habits yet. Start building better habits today!</p>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            Create Your First Habit
          </Button>
        </div>
      )}
    </div>
  )
}
