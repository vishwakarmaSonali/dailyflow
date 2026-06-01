import React, { useState } from 'react'
import { useHabits } from '@/hooks/useAPI'
import Modal from '@/components/UI/Modal'
import Button from '@/components/UI/Button'
import { TextInput, TextArea, Select } from '@/components/UI/Form'

interface NewHabitModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

export default function NewHabitModal({ isOpen, onClose, onSuccess }: NewHabitModalProps) {
  const { createHabit, loading } = useHabits()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: 'daily',
    color: 'indigo',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Habit name is required'
    }
    if (formData.name.length > 100) {
      newErrors.name = 'Habit name must be less than 100 characters'
    }
    if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      await createHabit({
        name: formData.name.trim(),
        description: formData.description.trim(),
        frequency: formData.frequency as 'daily' | 'weekly' | 'monthly',
      })

      setFormData({ name: '', description: '', frequency: 'daily', color: 'indigo' })
      setErrors({})
      onSuccess?.()
      onClose()
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to create habit',
      })
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Habit" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          label="Habit Name"
          required
          placeholder="e.g., Morning Meditation"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
        />

        <TextArea
          label="Description"
          placeholder="What is this habit about? What are your goals?"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          error={errors.description}
        />

        <Select
          label="Frequency"
          required
          options={FREQUENCIES}
          value={formData.frequency}
          onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
          error={errors.frequency}
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
            Create Habit
          </Button>
        </div>
      </form>
    </Modal>
  )
}
