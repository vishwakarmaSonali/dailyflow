import React from 'react'

export default function Expenses() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Expenses</h2>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
          Add Expense
        </button>
      </div>

      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month</h3>
        <div className="space-y-2">
          <p className="text-gray-600">Total Spent: <span className="font-bold text-indigo-600">$0.00</span></p>
          <p className="text-gray-600">Budget: <span className="font-bold">$1,000.00</span></p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <p className="text-gray-500">No expenses yet. Add one to get started!</p>
      </div>
    </div>
  )
}
