import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, userEvent, mockTask } from '../../../test/utils'
import TaskCard from '../TaskCard'

describe('TaskCard', () => {
  const mockHandlers = {
    onView: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onComplete: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders task information correctly', () => {
    renderWithProviders(
      <TaskCard task={mockTask} {...mockHandlers} />
    )

    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
    expect(screen.getByText('Test Asset')).toBeInTheDocument()
    expect(screen.getByText('Agent X')).toBeInTheDocument()
  })

  it('displays task type badge', () => {
    renderWithProviders(
      <TaskCard task={mockTask} {...mockHandlers} />
    )

    expect(screen.getByText('Inspection')).toBeInTheDocument()
    expect(screen.getByText('Inspection')).toHaveClass('badge-info')
  })

  it('displays priority badge', () => {
    renderWithProviders(
      <TaskCard task={mockTask} {...mockHandlers} />
    )

    expect(screen.getByText('High')).toBeInTheDocument()
    expect(screen.getByText('High')).toHaveClass('badge-error')
  })

  it('displays status badge', () => {
    renderWithProviders(
      <TaskCard task={mockTask} {...mockHandlers} />
    )

    expect(screen.getByText('Not Inspected')).toBeInTheDocument()
    expect(screen.getByText('Not Inspected')).toHaveClass('badge-gray')
  })

  it('shows due date information', () => {
    renderWithProviders(
      <TaskCard task={mockTask} {...mockHandlers} />
    )

    expect(screen.getByText('7/25/2025')).toBeInTheDocument()
    expect(screen.getByText('09:00 AM')).toBeInTheDocument()
  })

  it('shows frequency information', () => {
    renderWithProviders(
      <TaskCard task={mockTask} {...mockHandlers} />
    )

    expect(screen.getByText('Monthly')).toBeInTheDocument()
  })

  it('calls onView when View button is clicked', async () => {
    const user = userEvent.setup()
    
    renderWithProviders(
      <TaskCard task={mockTask} {...mockHandlers} />
    )

    const viewButton = screen.getByTitle('View details')
    await user.click(viewButton)

    expect(mockHandlers.onView).toHaveBeenCalledWith(mockTask)
  })

  it('calls onEdit when Edit button is clicked', async () => {
    const user = userEvent.setup()
    
    renderWithProviders(
      <TaskCard task={mockTask} {...mockHandlers} />
    )

    const editButton = screen.getByTitle('Edit task')
    await user.click(editButton)

    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockTask)
  })

  it('calls onDelete when Delete button is clicked', async () => {
    const user = userEvent.setup()
    
    renderWithProviders(
      <TaskCard task={mockTask} {...mockHandlers} />
    )

    const deleteButton = screen.getByTitle('Delete task')
    await user.click(deleteButton)

    expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockTask)
  })

  it('calls onComplete when Complete button is clicked for non-completed tasks', async () => {
    const user = userEvent.setup()
    
    renderWithProviders(
      <TaskCard task={mockTask} {...mockHandlers} />
    )

    const completeButton = screen.getByTitle('Mark as complete')
    await user.click(completeButton)

    expect(mockHandlers.onComplete).toHaveBeenCalledWith(mockTask)
  })

  it('does not show complete button for completed tasks', () => {
    const completedTask = {
      ...mockTask,
      status: 'Completed'
    }

    renderWithProviders(
      <TaskCard task={completedTask} {...mockHandlers} />
    )

    expect(screen.queryByTitle('Mark as complete')).not.toBeInTheDocument()
  })

  it('handles overdue tasks correctly', () => {
    const overdueTask = {
      ...mockTask,
      dueDate: '2025-07-15T09:00:00Z' // Past date
    }

    renderWithProviders(
      <TaskCard task={overdueTask} {...mockHandlers} />
    )

    expect(screen.getByText('Overdue')).toBeInTheDocument()
  })

  it('handles due today tasks correctly', () => {
    const todayTask = {
      ...mockTask,
      dueDate: new Date().toISOString()
    }

    renderWithProviders(
      <TaskCard task={todayTask} {...mockHandlers} />
    )

    expect(screen.getByText('Due Today')).toBeInTheDocument()
  })

  it('handles different task types correctly', () => {
    const maintenanceTask = {
      ...mockTask,
      type: 'Maintenance'
    }

    renderWithProviders(
      <TaskCard task={maintenanceTask} {...mockHandlers} />
    )

    expect(screen.getByText('Maintenance')).toHaveClass('badge-warning')
  })

  it('handles different priority levels correctly', () => {
    const lowPriorityTask = {
      ...mockTask,
      priority: 'Low'
    }

    renderWithProviders(
      <TaskCard task={lowPriorityTask} {...mockHandlers} />
    )

    expect(screen.getByText('Low')).toHaveClass('badge-success')
  })

  it('handles click on card body to call onView', async () => {
    const user = userEvent.setup()
    
    renderWithProviders(
      <TaskCard task={mockTask} {...mockHandlers} />
    )

    const cardBody = screen.getByText('Test Task').closest('.task-card')
    await user.click(cardBody)

    expect(mockHandlers.onView).toHaveBeenCalledWith(mockTask)
  })

  it('prevents event propagation on action buttons', async () => {
    const user = userEvent.setup()
    
    renderWithProviders(
      <TaskCard task={mockTask} {...mockHandlers} />
    )

    const viewButton = screen.getByTitle('View details')
    await user.click(viewButton)

    expect(mockHandlers.onView).toHaveBeenCalledWith(mockTask)
    // Card onClick should not be called when clicking action buttons
    expect(mockHandlers.onView).toHaveBeenCalledTimes(1)
  })

  it('shows notification settings when enabled', () => {
    renderWithProviders(
      <TaskCard task={mockTask} {...mockHandlers} />
    )

    // Check if notification indicators are present
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('In-App')).toBeInTheDocument()
  })
})