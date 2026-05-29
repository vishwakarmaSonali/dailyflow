import React from 'react'

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Habits Today</h3>
          <p className="text-3xl font-bold text-indigo-600">0/5</p>
        </div>
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Spent</h3>
          <p className="text-3xl font-bold text-indigo-600">$0.00</p>
        </div>
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Active Streaks</h3>
          <p className="text-3xl font-bold text-indigo-600">0</p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Insights</h3>
        <p className="text-gray-500">Loading insights...</p>
      </div>
    </div>
  )
}
