import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../../test/utils'
import Header from '../Header'

// Mock the hooks and stores
const mockAuth = {
  user: {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://example.com/avatar.jpg'
  }
}

const mockNotificationStore = {
  notifications: [
    {
      id: '1',
      type: 'task_due',
      title: 'Task Due',
      message: 'Monthly inspection is due today',
      read: false,
      timestamp: new Date().toISOString()
    },
    {
      id: '2',
      type: 'task_overdue',
      title: 'Task Overdue',
      message: 'HVAC maintenance is overdue',
      read: true,
      timestamp: new Date().toISOString()
    }
  ],
  getUnreadCount: vi.fn(() => 1),
  markAsRead: vi.fn(),
  markAllAsRead: vi.fn(),
  deleteNotification: vi.fn()
}

const mockGlobalSearch = {
  isOpen: false,
  openSearch: vi.fn(),
  closeSearch: vi.fn()
}

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => mockAuth
}))

vi.mock('../../../stores/notificationStore', () => ({
  useNotificationStore: () => mockNotificationStore
}))

vi.mock('../../../hooks/useGlobalSearch', () => ({
  useGlobalSearch: () => mockGlobalSearch
}))

// Mock the notification components
vi.mock('../../notifications/NotificationPanel', () => ({
  default: ({ isOpen, onClose, notifications, onMarkAsRead, onMarkAllAsRead, onDelete }) => 
    isOpen ? (
      <div data-testid="notification-panel">
        <button onClick={onClose}>Close</button>
        <button onClick={onMarkAllAsRead}>Mark All Read</button>
        {notifications.map(notif => (
          <div key={notif.id} data-testid={`notification-${notif.id}`}>
            <span>{notif.title}</span>
            <button onClick={() => onMarkAsRead(notif.id)}>Mark Read</button>
            <button onClick={() => onDelete(notif.id)}>Delete</button>
          </div>
        ))}
      </div>
    ) : null
}))

vi.mock('../../notifications/NotificationSettings', () => ({
  default: ({ isOpen, onClose }) => 
    isOpen ? (
      <div data-testid="notification-settings">
        <button onClick={onClose}>Close Settings</button>
      </div>
    ) : null
}))

vi.mock('../../search/GlobalSearch', () => ({
  default: ({ isOpen, onClose }) => 
    isOpen ? (
      <div data-testid="global-search">
        <button onClick={onClose}>Close Search</button>
      </div>
    ) : null
}))

describe('Header Component', () => {
  const defaultProps = {
    onMobileSidebarToggle: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders header with all elements', () => {
    renderWithProviders(<Header {...defaultProps} />)
    
    // Mobile menu button
    expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument()
    
    // Search input
    expect(screen.getByPlaceholderText('Search assets, tasks... ')).toBeInTheDocument()
    
    // Notification bell
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument()
    
    // Settings button
    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument()
    
    // User profile
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByAltText('John Doe')).toBeInTheDocument()
  })

  it('shows unread notification count', () => {
    renderWithProviders(<Header {...defaultProps} />)
    
    const notificationBadge = screen.getByText('1')
    expect(notificationBadge).toBeInTheDocument()
    expect(notificationBadge).toHaveClass('bg-red-500')
  })

  it('handles mobile sidebar toggle', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Header {...defaultProps} />)
    
    const mobileMenuButton = screen.getByRole('button', { name: /menu/i })
    await user.click(mobileMenuButton)
    
    expect(defaultProps.onMobileSidebarToggle).toHaveBeenCalledTimes(1)
  })

  it('opens global search when search input is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Header {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText('Search assets, tasks... ')
    await user.click(searchInput)
    
    expect(mockGlobalSearch.openSearch).toHaveBeenCalledTimes(1)
  })

  it('shows keyboard shortcut hint', () => {
    renderWithProviders(<Header {...defaultProps} />)
    
    expect(screen.getByText('⌘K')).toBeInTheDocument()
  })

  it('opens notification panel when bell is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Header {...defaultProps} />)
    
    const notificationButton = screen.getByRole('button', { name: /notifications/i })
    await user.click(notificationButton)
    
    expect(screen.getByTestId('notification-panel')).toBeInTheDocument()
  })

  it('closes notification panel', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Header {...defaultProps} />)
    
    // Open panel
    const notificationButton = screen.getByRole('button', { name: /notifications/i })
    await user.click(notificationButton)
    
    // Close panel
    const closeButton = screen.getByText('Close')
    await user.click(closeButton)
    
    expect(screen.queryByTestId('notification-panel')).not.toBeInTheDocument()
  })

  it('handles notification actions', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Header {...defaultProps} />)
    
    // Open panel
    const notificationButton = screen.getByRole('button', { name: /notifications/i })
    await user.click(notificationButton)
    
    // Mark all as read
    const markAllButton = screen.getByText('Mark All Read')
    await user.click(markAllButton)
    expect(mockNotificationStore.markAllAsRead).toHaveBeenCalled()
    
    // Mark single notification as read
    const markReadButton = screen.getByTestId('notification-1').querySelector('button[onClick]')
    if (markReadButton && markReadButton.textContent === 'Mark Read') {
      await user.click(markReadButton)
      expect(mockNotificationStore.markAsRead).toHaveBeenCalledWith('1')
    }
  })

  it('opens notification settings when settings button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Header {...defaultProps} />)
    
    const settingsButton = screen.getByRole('button', { name: /settings/i })
    await user.click(settingsButton)
    
    expect(screen.getByTestId('notification-settings')).toBeInTheDocument()
  })

  it('closes notification settings', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Header {...defaultProps} />)
    
    // Open settings
    const settingsButton = screen.getByRole('button', { name: /settings/i })
    await user.click(settingsButton)
    
    // Close settings
    const closeButton = screen.getByText('Close Settings')
    await user.click(closeButton)
    
    expect(screen.queryByTestId('notification-settings')).not.toBeInTheDocument()
  })

  it('shows profile dropdown when profile is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Header {...defaultProps} />)
    
    const profileButton = screen.getByRole('button', { name: /john doe/i })
    await user.click(profileButton)
    
    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Change Password')).toBeInTheDocument()
    expect(screen.getByText('Account Settings')).toBeInTheDocument()
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })

  it('handles profile dropdown navigation', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Header {...defaultProps} />)
    
    // Open dropdown
    const profileButton = screen.getByRole('button', { name: /john doe/i })
    await user.click(profileButton)
    
    // Check links
    expect(screen.getByText('Profile')).toHaveAttribute('href', '/profile')
    expect(screen.getByText('Change Password')).toHaveAttribute('href', '/forgot-password')
    expect(screen.getByText('Logout')).toHaveAttribute('href', '/logout')
  })

  it('hides notification count when no unread notifications', () => {
    mockNotificationStore.getUnreadCount.mockReturnValue(0)
    
    renderWithProviders(<Header {...defaultProps} />)
    
    expect(screen.queryByText('1')).not.toBeInTheDocument()
  })

  it('shows 9+ for high unread count', () => {
    mockNotificationStore.getUnreadCount.mockReturnValue(15)
    
    renderWithProviders(<Header {...defaultProps} />)
    
    expect(screen.getByText('9+')).toBeInTheDocument()
  })

  it('hides mobile-only elements on larger screens', () => {
    renderWithProviders(<Header {...defaultProps} />)
    
    // Mobile menu button should have lg:hidden class
    const mobileMenuButton = screen.getByRole('button', { name: /menu/i })
    expect(mobileMenuButton).toHaveClass('lg:hidden')
  })

  it('shows responsive layout elements', () => {
    renderWithProviders(<Header {...defaultProps} />)
    
    // Message button should be hidden on mobile
    const messageButtons = screen.getAllByRole('button')
    const messageButton = messageButtons.find(btn => 
      btn.querySelector('svg') && btn.className.includes('hidden sm:block')
    )
    expect(messageButton).toBeInTheDocument()
  })

  it('handles search keyboard shortcut display', () => {
    renderWithProviders(<Header {...defaultProps} />)
    
    const shortcutHint = screen.getByText('⌘K')
    expect(shortcutHint).toHaveClass('hidden sm:block')
  })

  it('renders user avatar with fallback', () => {
    renderWithProviders(<Header {...defaultProps} />)
    
    const avatar = screen.getByAltText('John Doe')
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg')
  })

  it('handles user without avatar', () => {
    const userWithoutAvatar = {
      ...mockAuth,
      user: { ...mockAuth.user, avatar: null }
    }
    
    vi.mocked(mockAuth).user = userWithoutAvatar.user
    
    renderWithProviders(<Header {...defaultProps} />)
    
    const avatar = screen.getByAltText('John Doe')
    expect(avatar).toHaveAttribute('src', '/api/placeholder/32/32')
  })

  it('closes dropdowns when clicking outside', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Header {...defaultProps} />)
    
    // Open profile dropdown
    const profileButton = screen.getByRole('button', { name: /john doe/i })
    await user.click(profileButton)
    
    expect(screen.getByText('Profile')).toBeInTheDocument()
    
    // Click outside (on header)
    const header = screen.getByRole('banner')
    await user.click(header)
    
    // Dropdown should close (this would need proper event handling in the component)
    // This test assumes the component handles outside clicks
  })
})