import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TextInput, TextArea, Select } from '@/components/UI/Form'

describe('Form Components', () => {
  describe('TextInput', () => {
    it('renders input field with label', () => {
      render(<TextInput label="Email" />)
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    })

    it('displays required indicator', () => {
      render(<TextInput label="Email" required />)
      expect(screen.getByText('*')).toBeInTheDocument()
    })

    it('displays error message', () => {
      render(<TextInput label="Email" error="Email is required" />)
      expect(screen.getByText('Email is required')).toBeInTheDocument()
    })

    it('accepts input value', async () => {
      const user = userEvent.setup()
      const { container } = render(<TextInput label="Email" />)
      const input = container.querySelector('input')!
      
      await user.type(input, 'test@example.com')
      expect(input).toHaveValue('test@example.com')
    })

    it('handles placeholder', () => {
      const { container } = render(<TextInput label="Email" placeholder="Enter email" />)
      const input = container.querySelector('input')
      expect(input).toHaveAttribute('placeholder', 'Enter email')
    })
  })

  describe('TextArea', () => {
    it('renders textarea with label', () => {
      render(<TextArea label="Description" />)
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    })

    it('displays error message', () => {
      render(<TextArea label="Description" error="Description is required" />)
      expect(screen.getByText('Description is required')).toBeInTheDocument()
    })

    it('accepts multiline input', async () => {
      const user = userEvent.setup()
      const { container } = render(<TextArea label="Description" />)
      const textarea = container.querySelector('textarea')!
      
      await user.type(textarea, 'Line 1\nLine 2')
      expect(textarea).toHaveValue('Line 1\nLine 2')
    })
  })

  describe('Select', () => {
    const options = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ]

    it('renders select with label', () => {
      render(<Select label="Category" options={options} />)
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
    })

    it('displays all options', () => {
      render(<Select label="Category" options={options} />)
      expect(screen.getByText('Option 1')).toBeInTheDocument()
      expect(screen.getByText('Option 2')).toBeInTheDocument()
    })

    it('displays error message', () => {
      render(<Select label="Category" options={options} error="Please select an option" />)
      expect(screen.getByText('Please select an option')).toBeInTheDocument()
    })

    it('handles value selection', async () => {
      const user = userEvent.setup()
      const { container } = render(<Select label="Category" options={options} value="option1" onChange={() => {}} />)
      const select = container.querySelector('select')!
      
      expect(select).toHaveValue('option1')
    })

    it('shows required indicator', () => {
      render(<Select label="Category" options={options} required />)
      expect(screen.getByText('*')).toBeInTheDocument()
    })
  })
})
