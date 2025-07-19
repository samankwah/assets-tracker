import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, userEvent, mockNotification } from '../../../test/utils'
import NotificationPanel from '../NotificationPanel'

describe('NotificationPanel', () => {
  const mockHandlers = {
    onClose: vi.fn(),
    onMarkAsRead: vi.fn(),
    onMarkAllAsRead: vi.fn(),
    onDelete: vi.fn(),
  }

  const mockNotifications = [
    mockNotification,
    {
      id: '2',
      type: 'task_overdue',
      title: 'Overdue Task',
      message: 'Test overdue task',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: true,
      assetId: '2',
      taskId: '2'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not render when isOpen is false', () => {
    renderWithProviders(
      <NotificationPanel
        isOpen={false}
        notifications={mockNotifications}
        {...mockHandlers}
      />
    )

    expect(screen.queryByText('Notifications')).not.toBeInTheDocument()
  })

  it('renders notification panel when isOpen is true', () => {
    renderWithProviders(
      <NotificationPanel
        isOpen={true}
        notifications={mockNotifications}
        {...mockHandlers}
      />
    )

    expect(screen.getByText('Notifications')).toBeInTheDocument()
  })

  it('displays unread count badge', () => {
    renderWithProviders(
      <NotificationPanel
        isOpen={true}
        notifications={mockNotifications}
        {...mockHandlers}
      />
    )

    expect(screen.getByText('1')).toBeInTheDocument() // Unread count
  })

  it('displays notifications correctly', () => {
    renderWithProviders(
      <NotificationPanel
        isOpen={true}
        notifications={mockNotifications}
        {...mockHandlers}
      />
    )

    expect(screen.getByText('Task Due Today')).toBeInTheDocument()
    expect(screen.getByText('Test task is due today')).toBeInTheDocument()
    expect(screen.getByText('Overdue Task')).toBeInTheDocument()
    expect(screen.getByText('Test overdue task')).toBeInTheDocument()
  })

  it('shows correct notification icons based on type', () => {
    renderWithProviders(
      <NotificationPanel
        isOpen={true}
        notifications={mockNotifications}
        {...mockHandlers}
      />
    )

    // Check for notification type icons
    const icons = screen.getAllByRole('img', { hidden: true })
    expect(icons.length).toBeGreaterThan(0)
  })

  it('filters notifications by unread when unread tab is selected', async () => {
    const user = userEvent.setup()
    
    renderWithProviders(
      <NotificationPanel
        isOpen={true}
        notifications={mockNotifications}
        {...mockHandlers}
      />
    )

    const unreadTab = screen.getByText('unread')
    await user.click(unreadTab)

    expect(screen.getByText('Task Due Today')).toBeInTheDocument()
    expect(screen.queryByText('Overdue Task')).not.toBeInTheDocument()
  })

  it('filters notifications by read when read tab is selected', async () => {
    const user = userEvent.setup()
    
    renderWithProviders(
      <NotificationPanel
        isOpen={true}
        notifications={mockNotifications}
        {...mockHandlers}
      />
    )

    const readTab = screen.getByText('read')
    await user.click(readTab)

    expect(screen.queryByText('Task Due Today')).not.toBeInTheDocument()
    expect(screen.getByText('Overdue Task')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    
    renderWithProviders(
      <NotificationPanel
        isOpen={true}
        notifications={mockNotifications}
        {...mockHandlers}
      />
    )

    const closeButton = screen.getByRole('button', { name: /close/i })
    await user.click(closeButton)

    expect(mockHandlers.onClose).toHaveBeenCalled()
  })

  it('calls onMarkAsRead when mark as read button is clicked', async () => {
    const user = userEvent.setup()
    
    renderWithProviders(
      <NotificationPanel
        isOpen={true}
        notifications={mockNotifications}
        {...mockHandlers}
      />
    )

    const markAsReadButton = screen.getByTitle('Mark as read')
    await user.click(markAsReadButton)

    expect(mockHandlers.onMarkAsRead).toHaveBeenCalledWith('1')
  })

  it('calls onMarkAllAsRead when mark all as read button is clicked', async () => {
    const user = userEvent.setup()
    
    renderWithProviders(
      <NotificationPanel
        isOpen={true}
        notifications={mockNotifications}
        {...mockHandlers}
      />
    )

    const markAllAsReadButton = screen.getByText('Mark all as read')
    await user.click(markAllAsReadButton)

    expect(mockHandlers.onMarkAllAsRead).toHaveBeenCalled()
  })

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup()
    
    renderWithProviders(
      <NotificationPanel
        isOpen={true}
        notifications={mockNotifications}
        {...mockHandlers}
      />
    )

    const deleteButtons = screen.getAllByTitle('Delete notification')
    await user.click(deleteButtons[0])

    expect(mockHandlers.onDelete).toHaveBeenCalledWith('1')
  })

  it('shows empty state when no notifications', () => {
    renderWithProviders(
      <NotificationPanel
        isOpen={true}
        notifications={[]}
        {...mockHandlers}
      />
    )

    expect(screen.getByText('No notifications')).toBeInTheDocument()
  })

  it('shows empty state for filtered notifications', async () => {
    const user = userEvent.setup()
    const allReadNotifications = [
      { ...mockNotification, read: true }
    ]
    
    renderWithProviders(
      <NotificationPanel
        isOpen={true}
        notifications={allReadNotifications}
        {...mockHandlers}
      />
    )

    const unreadTab = screen.getByText('unread')
    await user.click(unreadTab)

    expect(screen.getByText('No unread notifications')).toBeInTheDocument()
  })

  it('displays time ago correctly', () => {
    renderWithProviders(
      <NotificationPanel
        isOpen={true}
        notifications={mockNotifications}
        {...mockHandlers}
      />
    )

    expect(screen.getByText('Just now')).toBeInTheDocument()
    expect(screen.getByText('2h ago')).toBeInTheDocument()
  })

  it('does not show mark all as read button when no unread notifications', () => {
    const allReadNotifications = mockNotifications.map(n => ({ ...n, read: true }))
    
    renderWithProviders(
      <NotificationPanel
        isOpen={true}
        notifications={allReadNotifications}
        {...mockHandlers}
      />
    )

    expect(screen.queryByText('Mark all as read')).not.toBeInTheDocument()
  })

  it('shows correct background color for unread notifications', () => {
    renderWithProviders(
      <NotificationPanel
        isOpen={true}
        notifications={mockNotifications}
        {...mockHandlers}
      />
    )

    const unreadNotification = screen.getByText('Task Due Today').closest('div')
    expect(unreadNotification).toHaveClass('bg-blue-50')
  })

  it('closes when overlay is clicked', async () => {
    const user = userEvent.setup()
    
    renderWithProviders(
      <NotificationPanel
        isOpen={true}
        notifications={mockNotifications}
        {...mockHandlers}
      />
    )

    const overlay = screen.getByText('Notifications').closest('div').previousSibling
    await user.click(overlay)

    expect(mockHandlers.onClose).toHaveBeenCalled()
  })
})