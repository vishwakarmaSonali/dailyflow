import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Modal from '@/components/UI/Modal'

describe('Modal Component', () => {
  it('renders when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    )
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    )
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    )
    
    const closeButton = screen.getByRole('button')
    await user.click(closeButton)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('renders different sizes', () => {
    const { container: smallContainer } = render(
      <Modal isOpen={true} onClose={() => {}} title="Small" size="sm">
        Content
      </Modal>
    )
    expect(smallContainer.querySelector('.max-w-sm')).toBeInTheDocument()

    const { container: largeContainer } = render(
      <Modal isOpen={true} onClose={() => {}} title="Large" size="lg">
        Content
      </Modal>
    )
    expect(largeContainer.querySelector('.max-w-lg')).toBeInTheDocument()
  })

  it('displays modal title correctly', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="My Modal Title">
        Content
      </Modal>
    )
    expect(screen.getByText('My Modal Title')).toBeInTheDocument()
  })

  it('renders children content correctly', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Modal">
        <div>
          <p>First paragraph</p>
          <p>Second paragraph</p>
        </div>
      </Modal>
    )
    expect(screen.getByText('First paragraph')).toBeInTheDocument()
    expect(screen.getByText('Second paragraph')).toBeInTheDocument()
  })
})
