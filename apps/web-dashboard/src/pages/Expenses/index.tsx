import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useExpenses } from '@/hooks/useAPI'
import { useExpensesStore } from '@/stores/appStore'
import { Plus, Trash2 } from 'lucide-react'

export default function ExpensesPage() {
  const navigate = useNavigate()
  const { expenses, loading, fetchExpenses } = useExpenses()
  const { setExpenses } = useExpensesStore()

  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const data = await fetchExpenses()
        setExpenses(data || [])
      } catch (error) {
        console.error('Failed to load expenses:', error)
      }
    }
    loadExpenses()
  }, [])

  const totalExpenses = expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading expenses...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Expenses</h2>
        <button
          onClick={() => navigate('/expenses/new')}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          <Plus size={20} />
          Add Expense
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Total This Month</p>
          <p className="text-3xl font-bold text-indigo-600">${totalExpenses.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Budget</p>
          <p className="text-3xl font-bold text-gray-900">$1,000.00</p>
        </div>
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Remaining</p>
          <p className="text-3xl font-bold text-green-600">${(1000 - totalExpenses).toFixed(2)}</p>
        </div>
      </div>

      {expenses && expenses.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{expense.description || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    ${expense.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(expense.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <button className="text-red-600 hover:text-red-700">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses yet</h3>
          <p className="text-gray-600 mb-4">Add your first expense to track spending</p>
          <button
            onClick={() => navigate('/expenses/new')}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            <Plus size={20} />
            Add First Expense
          </button>
        </div>
      )}
    </div>
  )
}
