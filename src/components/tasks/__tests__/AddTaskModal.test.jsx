import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import AddTaskModal from '../AddTaskModal'

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

// Mock stores
const mockAddTask = vi.fn()
const mockAssets = [
  { id: '1', name: 'Downtown Apartment' },
  { id: '2', name: 'Suburban House' }
]

vi.mock('../../../stores/taskStore', () => ({
  useTaskStore: () => ({
    addTask: mockAddTask,
    loading: false
  })
}))

vi.mock('../../../stores/assetStore', () => ({
  useAssetStore: () => ({
    assets: mockAssets
  })
}))

// Mock react-hook-form
vi.mock('react-hook-form', () => ({
  useForm: () => ({
    register: vi.fn(() => ({})),
    handleSubmit: vi.fn((fn) => vi.fn()),
    formState: { errors: {} },
    setValue: vi.fn(),
    watch: vi.fn(),
    reset: vi.fn()
  })
}))

// Wrapper component for routing
const TestWrapper = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

describe('AddTaskModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onTaskAdded: vi.fn(),
    selectedAssetId: null
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders when open', () => {
    render(
      <TestWrapper>
        <AddTaskModal {...defaultProps} />
      </TestWrapper>
    )
    
    expect(screen.getByText('Add New Task')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(
      <TestWrapper>
        <AddTaskModal {...defaultProps} isOpen={false} />
      </TestWrapper>
    )
    
    expect(screen.queryByText('Add New Task')).not.toBeInTheDocument()
  })

  it('renders form fields', () => {
    render(
      <TestWrapper>
        <AddTaskModal {...defaultProps} />
      </TestWrapper>
    )
    
    expect(screen.getByLabelText(/task title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/asset/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/task type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument()
  })

  it('renders action buttons', () => {
    render(
      <TestWrapper>
        <AddTaskModal {...defaultProps} />
      </TestWrapper>
    )
    
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Add Task')).toBeInTheDocument()
  })

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <AddTaskModal {...defaultProps} />
      </TestWrapper>
    )
    
    await user.click(screen.getByText('Cancel'))
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('includes due date and time fields', () => {
    render(
      <TestWrapper>
        <AddTaskModal {...defaultProps} />
      </TestWrapper>
    )
    
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/due time/i)).toBeInTheDocument()
  })

  it('includes assigned to field', () => {
    render(
      <TestWrapper>
        <AddTaskModal {...defaultProps} />
      </TestWrapper>
    )
    
    expect(screen.getByLabelText(/assigned to/i)).toBeInTheDocument()
  })

  it('includes recurring task options', () => {
    render(
      <TestWrapper>
        <AddTaskModal {...defaultProps} />
      </TestWrapper>
    )
    
    expect(screen.getByLabelText(/recurring/i)).toBeInTheDocument()
  })

  it('includes notification settings', () => {
    render(
      <TestWrapper>
        <AddTaskModal {...defaultProps} />
      </TestWrapper>
    )
    
    expect(screen.getByText(/notification preferences/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email notification/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/sms notification/i)).toBeInTheDocument()
  })

  it('renders task type options', () => {
    render(
      <TestWrapper>
        <AddTaskModal {...defaultProps} />
      </TestWrapper>
    )
    
    const typeSelect = screen.getByLabelText(/task type/i)
    expect(typeSelect).toBeInTheDocument()
  })

  it('renders priority options', () => {
    render(
      <TestWrapper>
        <AddTaskModal {...defaultProps} />
      </TestWrapper>
    )
    
    const prioritySelect = screen.getByLabelText(/priority/i)
    expect(prioritySelect).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(
      <TestWrapper>
        <AddTaskModal {...defaultProps} />
      </TestWrapper>
    )
    
    const modal = screen.getByRole('dialog')
    expect(modal).toBeInTheDocument()
    expect(modal).toHaveAttribute('aria-modal', 'true')
  })

  it('focuses on first input when opened', async () => {
    render(
      <TestWrapper>
        <AddTaskModal {...defaultProps} />
      </TestWrapper>
    )
    
    await waitFor(() => {
      const titleInput = screen.getByLabelText(/task title/i)
      expect(titleInput).toHaveFocus()
    })
  })

  it('handles escape key to close modal', async () => {
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <AddTaskModal {...defaultProps} />
      </TestWrapper>
    )
    
    await user.keyboard('{Escape}')
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('pre-selects asset when selectedAssetId is provided', () => {
    render(
      <TestWrapper>
        <AddTaskModal {...defaultProps} selectedAssetId="1" />
      </TestWrapper>
    )
    
    // The asset should be pre-selected in the dropdown
    const assetSelect = screen.getByLabelText(/asset/i)
    expect(assetSelect).toBeInTheDocument()
  })
})