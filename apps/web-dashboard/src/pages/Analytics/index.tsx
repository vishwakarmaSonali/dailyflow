import React, { useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useAnalytics } from '@/hooks/useAPI'

const COLORS = ['#4f46e5', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']

export default function AnalyticsPage() {
  const { analytics, loading, fetchAnalytics } = useAnalytics()

  useEffect(() => {
    fetchAnalytics('month')
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    )
  }

  // Sample data for charts
  const spendingTrendData = [
    { date: 'May 1', amount: 45 },
    { date: 'May 5', amount: 52 },
    { date: 'May 10', amount: 38 },
    { date: 'May 15', amount: 61 },
    { date: 'May 20', amount: 55 },
    { date: 'May 25', amount: 67 },
    { date: 'May 30', amount: 48 },
  ]

  const categoryData = [
    { name: 'Food', value: 280 },
    { name: 'Transport', value: 120 },
    { name: 'Entertainment', value: 95 },
    { name: 'Utilities', value: 150 },
    { name: 'Shopping', value: 110 },
    { name: 'Other', value: 85 },
  ]

  const habitData = [
    { week: 'Week 1', completion: 85 },
    { week: 'Week 2', completion: 78 },
    { week: 'Week 3', completion: 92 },
    { week: 'Week 4', completion: 88 },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Analytics & Insights</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Average Daily Spending</p>
          <p className="text-3xl font-bold text-indigo-600">$48.50</p>
          <p className="text-xs text-gray-500 mt-2">↑ 5% from last month</p>
        </div>
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Total Expenses</p>
          <p className="text-3xl font-bold text-gray-900">$840.00</p>
          <p className="text-xs text-gray-500 mt-2">This month</p>
        </div>
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Habit Completion</p>
          <p className="text-3xl font-bold text-green-600">86%</p>
          <p className="text-xs text-gray-500 mt-2">Average this month</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Trend */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={spendingTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                labelStyle={{ color: '#111827' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={{ fill: '#4f46e5', r: 4 }}
                name="Daily Spend"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Habit Completion */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Habit Completion Rate</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={habitData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="week" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                labelStyle={{ color: '#111827' }}
              />
              <Bar
                dataKey="completion"
                fill="#10b981"
                radius={[8, 8, 0, 0]}
                name="Completion %"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Category Breakdown</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          {/* Category List */}
          <div className="flex flex-col justify-center space-y-3">
            {categoryData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-700">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">${item.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
