import React, { useState } from 'react'
import { useExpenses } from '@/hooks/useAPI'
import Modal from '@/components/UI/Modal'
import Button from '@/components/UI/Button'
import { TextInput, Select } from '@/components/UI/Form'

interface NewExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const CATEGORIES = [
  { value: 'food', label: 'Food & Dining' },
  { value: 'transport', label: 'Transport' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'health', label: 'Health & Fitness' },
  { value: 'education', label: 'Education' },
  { value: 'other', label: 'Other' },
]

export default function NewExpenseModal({ isOpen, onClose, onSuccess }: NewExpenseModalProps) {
  const { createExpense, loading } = useExpenses()
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'food',
    date: new Date().toISOString().split('T')[0],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }
    if (!formData.amount) {
      newErrors.amount = 'Amount is required'
    } else if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      await createExpense({
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date,
      })

      setFormData({
        description: '',
        amount: '',
        category: 'food',
        date: new Date().toISOString().split('T')[0],
      })
      setErrors({})
      onSuccess?.()
      onClose()
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to create expense',
      })
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Expense" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          label="Description"
          required
          placeholder="e.g., Lunch at downtown cafe"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          error={errors.description}
        />

        <TextInput
          label="Amount"
          type="number"
          required
          step="0.01"
          min="0"
          placeholder="0.00"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          error={errors.amount}
        />

        <Select
          label="Category"
          required
          options={CATEGORIES}
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          error={errors.category}
        />

        <TextInput
          label="Date"
          type="date"
          required
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          error={errors.date}
        />

        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {errors.submit}
          </div>
        )}

        <div className="flex gap-3 justify-end pt-4">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" loading={loading} type="submit">
            Add Expense
          </Button>
        </div>
      </form>
    </Modal>
  )
}
