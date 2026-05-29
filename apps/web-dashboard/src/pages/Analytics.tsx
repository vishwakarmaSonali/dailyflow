import React from 'react'

export default function Analytics() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending Trends</h3>
          <p className="text-gray-500">Chart will display here</p>
        </div>
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
          <p className="text-gray-500">Chart will display here</p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Habit Performance</h3>
        <p className="text-gray-500">Chart will display here</p>
      </div>
    </div>
  )
}
