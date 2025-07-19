import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ErrorDisplay from '../ErrorDisplay'

describe('ErrorDisplay', () => {
  const defaultProps = {
    title: 'Something went wrong',
    error: { message: 'Network connection failed' },
    onRetry: vi.fn(),
    onDismiss: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders error title and message', () => {
    render(<ErrorDisplay {...defaultProps} />)
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Network connection failed')).toBeInTheDocument()
  })

  it('renders retry button when onRetry is provided', () => {
    render(<ErrorDisplay {...defaultProps} />)
    
    const retryButton = screen.getByText('Retry')
    expect(retryButton).toBeInTheDocument()
  })

  it('handles retry button click', async () => {
    const user = userEvent.setup()
    render(<ErrorDisplay {...defaultProps} />)
    
    const retryButton = screen.getByText('Retry')
    await user.click(retryButton)
    
    expect(defaultProps.onRetry).toHaveBeenCalledTimes(1)
  })

  it('renders dismiss button when onDismiss is provided and showDismiss is true', () => {
    render(<ErrorDisplay {...defaultProps} showDismiss={true} />)
    
    const dismissButton = screen.getByText('Dismiss')
    expect(dismissButton).toBeInTheDocument()
  })

  it('handles dismiss button click', async () => {
    const user = userEvent.setup()
    render(<ErrorDisplay {...defaultProps} showDismiss={true} />)
    
    const dismissButton = screen.getByText('Dismiss')
    await user.click(dismissButton)
    
    expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1)
  })

  it('does not render retry button when onRetry is not provided', () => {
    const propsWithoutRetry = { ...defaultProps, onRetry: undefined }
    render(<ErrorDisplay {...propsWithoutRetry} />)
    
    expect(screen.queryByText('Retry')).not.toBeInTheDocument()
  })

  it('does not render dismiss button when showDismiss is false', () => {
    render(<ErrorDisplay {...defaultProps} showDismiss={false} />)
    
    expect(screen.queryByText('Dismiss')).not.toBeInTheDocument()
  })

  it('handles string error message', () => {
    const propsWithStringError = {
      ...defaultProps,
      error: 'Simple error message'
    }
    render(<ErrorDisplay {...propsWithStringError} />)
    
    expect(screen.getByText('Simple error message')).toBeInTheDocument()
  })

  it('handles error object without message', () => {
    const propsWithEmptyError = {
      ...defaultProps,
      error: {}
    }
    render(<ErrorDisplay {...propsWithEmptyError} />)
    
    expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument()
  })

  it('renders with different variants', () => {
    const { rerender } = render(<ErrorDisplay {...defaultProps} variant="inline" />)
    
    let container = screen.getByRole('alert')
    expect(container).toHaveClass('border-l-4', 'border-red-500')
    
    rerender(<ErrorDisplay {...defaultProps} variant="card" />)
    container = screen.getByRole('alert')
    expect(container).toHaveClass('border', 'border-red-200')
  })

  it('shows error icon', () => {
    render(<ErrorDisplay {...defaultProps} />)
    
    const errorIcon = screen.getByRole('alert').querySelector('svg')
    expect(errorIcon).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<ErrorDisplay {...defaultProps} className="custom-error-class" />)
    
    const container = screen.getByRole('alert')
    expect(container).toHaveClass('custom-error-class')
  })

  it('renders with default title when not provided', () => {
    const propsWithoutTitle = { ...defaultProps, title: undefined }
    render(<ErrorDisplay {...propsWithoutTitle} />)
    
    expect(screen.getByText('Error')).toBeInTheDocument()
  })

  it('handles complex error objects', () => {
    const complexError = {
      message: 'Validation failed',
      status: 400,
      details: { field: 'email', reason: 'invalid format' }
    }
    const propsWithComplexError = {
      ...defaultProps,
      error: complexError
    }
    render(<ErrorDisplay {...propsWithComplexError} />)
    
    expect(screen.getByText('Validation failed')).toBeInTheDocument()
  })

  it('is accessible with proper ARIA attributes', () => {
    render(<ErrorDisplay {...defaultProps} />)
    
    const errorContainer = screen.getByRole('alert')
    expect(errorContainer).toBeInTheDocument()
  })

  it('renders action buttons in correct order', () => {
    render(<ErrorDisplay {...defaultProps} showDismiss={true} />)
    
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(2)
    expect(buttons[0]).toHaveTextContent('Retry')
    expect(buttons[1]).toHaveTextContent('Dismiss')
  })
})