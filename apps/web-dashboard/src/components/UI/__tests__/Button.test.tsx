import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from '@/components/UI/Button'

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('applies primary variant by default', () => {
    const { container } = render(<Button>Primary</Button>)
    const button = container.querySelector('button')
    expect(button).toHaveClass('bg-indigo-600')
  })

  it('applies secondary variant', () => {
    const { container } = render(<Button variant="secondary">Secondary</Button>)
    const button = container.querySelector('button')
    expect(button).toHaveClass('bg-gray-200')
  })

  it('applies danger variant', () => {
    const { container } = render(<Button variant="danger">Delete</Button>)
    const button = container.querySelector('button')
    expect(button).toHaveClass('bg-red-600')
  })

  it('handles click events', async () => {
    const user = userEvent.setup()
    const onClick = jest.fn()
    render(<Button onClick={onClick}>Click</Button>)
    
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows loading state with spinner', () => {
    const { container } = render(<Button loading>Loading</Button>)
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('disables button during loading', () => {
    render(<Button loading>Loading</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('applies size classes', () => {
    const { container: smallContainer } = render(<Button size="sm">Small</Button>)
    expect(smallContainer.querySelector('button')).toHaveClass('px-3', 'py-1.5')

    const { container: largeContainer } = render(<Button size="lg">Large</Button>)
    expect(largeContainer.querySelector('button')).toHaveClass('px-6', 'py-3')
  })
})
