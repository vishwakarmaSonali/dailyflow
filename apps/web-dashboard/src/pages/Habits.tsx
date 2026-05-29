import React from 'react'

export default function Habits() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Your Habits</h2>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
          Add Habit
        </button>
      </div>

      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <p className="text-gray-500">No habits yet. Create one to get started!</p>
      </div>
    </div>
  )
}
