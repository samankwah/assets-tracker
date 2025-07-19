import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import Sidebar from '../Sidebar'

// Mock stores
const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'admin'
}

vi.mock('../../../stores/authStore', () => ({
  useAuthStore: () => ({
    user: mockUser,
    logout: vi.fn()
  })
}))

// Mock navigation
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/dashboard' })
  }
})

// Wrapper component for routing
const TestWrapper = ({ children, initialEntries = ['/dashboard'] }) => (
  <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
)

describe('Sidebar', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders navigation menu', () => {
    render(
      <TestWrapper>
        <Sidebar {...defaultProps} />
      </TestWrapper>
    )
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Assets')).toBeInTheDocument()
    expect(screen.getByText('Tasks')).toBeInTheDocument()
    expect(screen.getByText('Calendar')).toBeInTheDocument()
  })

  it('renders user profile section', () => {
    render(
      <TestWrapper>
        <Sidebar {...defaultProps} />
      </TestWrapper>
    )
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('highlights active navigation item', () => {
    render(
      <TestWrapper initialEntries={['/assets']}>
        <Sidebar {...defaultProps} />
      </TestWrapper>
    )
    
    const assetsLink = screen.getByText('Assets').closest('a')
    expect(assetsLink).toHaveClass('bg-blue-50', 'text-blue-600')
  })

  it('renders navigation icons', () => {
    render(
      <TestWrapper>
        <Sidebar {...defaultProps} />
      </TestWrapper>
    )
    
    // Check that icons are present for navigation items
    const navItems = screen.getAllByRole('link')
    navItems.forEach(item => {
      const icon = item.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })
  })

  it('renders logout button', () => {
    render(
      <TestWrapper>
        <Sidebar {...defaultProps} />
      </TestWrapper>
    )
    
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked on mobile', async () => {
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <Sidebar {...defaultProps} />
      </TestWrapper>
    )
    
    const closeButton = screen.getByLabelText('Close sidebar')
    await user.click(closeButton)
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('renders app logo/title', () => {
    render(
      <TestWrapper>
        <Sidebar {...defaultProps} />
      </TestWrapper>
    )
    
    expect(screen.getByText('Asset Tracker')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(
      <TestWrapper>
        <Sidebar {...defaultProps} />
      </TestWrapper>
    )
    
    const sidebar = screen.getByRole('navigation')
    expect(sidebar).toBeInTheDocument()
    expect(sidebar).toHaveAttribute('aria-label', 'Main navigation')
  })

  it('renders additional menu items for admin users', () => {
    render(
      <TestWrapper>
        <Sidebar {...defaultProps} />
      </TestWrapper>
    )
    
    // Admin users should see additional options
    expect(screen.getByText('Analytics')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('applies correct classes when closed', () => {
    render(
      <TestWrapper>
        <Sidebar {...defaultProps} isOpen={false} />
      </TestWrapper>
    )
    
    const sidebar = screen.getByRole('navigation')
    expect(sidebar).toHaveClass('-translate-x-full')
  })

  it('applies correct classes when open', () => {
    render(
      <TestWrapper>
        <Sidebar {...defaultProps} isOpen={true} />
      </TestWrapper>
    )
    
    const sidebar = screen.getByRole('navigation')
    expect(sidebar).not.toHaveClass('-translate-x-full')
  })

  it('renders all navigation links with correct href attributes', () => {
    render(
      <TestWrapper>
        <Sidebar {...defaultProps} />
      </TestWrapper>
    )
    
    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/dashboard')
    expect(screen.getByText('Assets').closest('a')).toHaveAttribute('href', '/assets')
    expect(screen.getByText('Tasks').closest('a')).toHaveAttribute('href', '/tasks')
    expect(screen.getByText('Calendar').closest('a')).toHaveAttribute('href', '/calendar')
  })

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <Sidebar {...defaultProps} />
      </TestWrapper>
    )
    
    const firstLink = screen.getByText('Dashboard').closest('a')
    firstLink.focus()
    
    await user.keyboard('{Tab}')
    const secondLink = screen.getByText('Assets').closest('a')
    expect(secondLink).toHaveFocus()
  })
})