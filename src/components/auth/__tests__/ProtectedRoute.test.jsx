import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../../test/utils'
import ProtectedRoute from '../ProtectedRoute'

// Mock the auth context
const mockAuthContext = {
  user: null,
  loading: false,
  isAuthenticated: false
}

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => mockAuthContext
}))

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  Navigate: ({ to, replace }) => <div data-testid="navigate" data-to={to} data-replace={replace} />,
  useLocation: () => ({ pathname: '/dashboard' })
}))

// Test component to wrap
const TestComponent = () => <div data-testid="protected-content">Protected Content</div>

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset auth context to default state
    mockAuthContext.user = null
    mockAuthContext.loading = false
    mockAuthContext.isAuthenticated = false
  })

  it('renders children when user is authenticated', () => {
    mockAuthContext.user = { id: '1', email: 'test@example.com', name: 'Test User' }
    mockAuthContext.isAuthenticated = true
    
    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    )
    
    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument()
  })

  it('redirects to login when user is not authenticated', () => {
    mockAuthContext.user = null
    mockAuthContext.isAuthenticated = false
    mockAuthContext.loading = false
    
    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    )
    
    const navigate = screen.getByTestId('navigate')
    expect(navigate).toBeInTheDocument()
    expect(navigate).toHaveAttribute('data-to', '/auth/login')
    expect(navigate).toHaveAttribute('data-replace', 'true')
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
  })

  it('shows loading spinner when authentication is loading', () => {
    mockAuthContext.loading = true
    mockAuthContext.isAuthenticated = false
    
    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    )
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument()
  })

  it('handles role-based access control', () => {
    mockAuthContext.user = { 
      id: '1', 
      email: 'test@example.com', 
      name: 'Test User',
      role: 'user'
    }
    mockAuthContext.isAuthenticated = true
    
    renderWithProviders(
      <ProtectedRoute requiredRole="admin">
        <TestComponent />
      </ProtectedRoute>
    )
    
    // Should redirect to unauthorized page or show error
    const navigate = screen.getByTestId('navigate')
    expect(navigate).toHaveAttribute('data-to', '/unauthorized')
  })

  it('allows access when user has required role', () => {
    mockAuthContext.user = { 
      id: '1', 
      email: 'admin@example.com', 
      name: 'Admin User',
      role: 'admin'
    }
    mockAuthContext.isAuthenticated = true
    
    renderWithProviders(
      <ProtectedRoute requiredRole="admin">
        <TestComponent />
      </ProtectedRoute>
    )
    
    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument()
  })

  it('allows access when user has higher role', () => {
    mockAuthContext.user = { 
      id: '1', 
      email: 'admin@example.com', 
      name: 'Admin User',
      role: 'admin'
    }
    mockAuthContext.isAuthenticated = true
    
    renderWithProviders(
      <ProtectedRoute requiredRole="user">
        <TestComponent />
      </ProtectedRoute>
    )
    
    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
  })

  it('handles multiple required roles', () => {
    mockAuthContext.user = { 
      id: '1', 
      email: 'manager@example.com', 
      name: 'Manager User',
      role: 'manager'
    }
    mockAuthContext.isAuthenticated = true
    
    renderWithProviders(
      <ProtectedRoute requiredRoles={['admin', 'manager']}>
        <TestComponent />
      </ProtectedRoute>
    )
    
    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
  })

  it('denies access when user role not in required roles', () => {
    mockAuthContext.user = { 
      id: '1', 
      email: 'user@example.com', 
      name: 'Regular User',
      role: 'user'
    }
    mockAuthContext.isAuthenticated = true
    
    renderWithProviders(
      <ProtectedRoute requiredRoles={['admin', 'manager']}>
        <TestComponent />
      </ProtectedRoute>
    )
    
    const navigate = screen.getByTestId('navigate')
    expect(navigate).toHaveAttribute('data-to', '/unauthorized')
  })

  it('preserves current location for redirect after login', () => {
    const mockUseLocation = vi.fn(() => ({ 
      pathname: '/dashboard',
      search: '?tab=assets',
      state: { from: '/previous' }
    }))
    
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom')
      return {
        ...actual,
        Navigate: ({ to, state }) => (
          <div data-testid="navigate" data-to={to} data-state={JSON.stringify(state)} />
        ),
        useLocation: mockUseLocation
      }
    })
    
    mockAuthContext.user = null
    mockAuthContext.isAuthenticated = false
    
    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    )
    
    const navigate = screen.getByTestId('navigate')
    const state = JSON.parse(navigate.getAttribute('data-state') || '{}')
    expect(state.from).toBeDefined()
  })

  it('handles custom unauthorized redirect', () => {
    mockAuthContext.user = { 
      id: '1', 
      email: 'user@example.com', 
      name: 'User',
      role: 'user'
    }
    mockAuthContext.isAuthenticated = true
    
    renderWithProviders(
      <ProtectedRoute 
        requiredRole="admin" 
        unauthorizedRedirect="/access-denied"
      >
        <TestComponent />
      </ProtectedRoute>
    )
    
    const navigate = screen.getByTestId('navigate')
    expect(navigate).toHaveAttribute('data-to', '/access-denied')
  })

  it('shows custom loading component', () => {
    const CustomLoader = () => <div data-testid="custom-loader">Custom Loading...</div>
    
    mockAuthContext.loading = true
    
    renderWithProviders(
      <ProtectedRoute loadingComponent={<CustomLoader />}>
        <TestComponent />
      </ProtectedRoute>
    )
    
    expect(screen.getByTestId('custom-loader')).toBeInTheDocument()
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
  })

  it('works without any user role restrictions', () => {
    mockAuthContext.user = { 
      id: '1', 
      email: 'user@example.com', 
      name: 'User'
      // No role property
    }
    mockAuthContext.isAuthenticated = true
    
    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    )
    
    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
  })

  it('handles expired token gracefully', () => {
    mockAuthContext.user = null
    mockAuthContext.isAuthenticated = false
    mockAuthContext.loading = false
    
    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    )
    
    const navigate = screen.getByTestId('navigate')
    expect(navigate).toHaveAttribute('data-to', '/auth/login')
  })

  it('renders error boundary for children errors', () => {
    const ErrorComponent = () => {
      throw new Error('Test error')
    }
    
    mockAuthContext.user = { id: '1', email: 'test@example.com' }
    mockAuthContext.isAuthenticated = true
    
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    renderWithProviders(
      <ProtectedRoute>
        <ErrorComponent />
      </ProtectedRoute>
    )
    
    // Should handle error gracefully
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    
    consoleSpy.mockRestore()
  })
})