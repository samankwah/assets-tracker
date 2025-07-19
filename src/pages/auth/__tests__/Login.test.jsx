import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../../test/utils'
import Login from '../Login'

// Mock the auth context
const mockAuthContext = {
  login: vi.fn(),
  loading: false,
  error: null
}

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => mockAuthContext
}))

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>
}))

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form with all elements', () => {
    renderWithProviders(<Login />)
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    expect(screen.getByText('Sign in to your account to continue')).toBeInTheDocument()
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByText(/forgot your password/i)).toBeInTheDocument()
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument()
  })

  it('has proper form labels and placeholders', () => {
    renderWithProviders(<Login />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('placeholder', 'Enter your email')
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(passwordInput).toHaveAttribute('placeholder', 'Enter your password')
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Login />)
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)
    
    expect(screen.getByText('Email is required')).toBeInTheDocument()
    expect(screen.getByText('Password is required')).toBeInTheDocument()
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Login />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(emailInput, 'invalid-email')
    await user.click(submitButton)
    
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
  })

  it('validates password minimum length', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Login />)
    
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(passwordInput, '123')
    await user.click(submitButton)
    
    expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    mockAuthContext.login.mockResolvedValue({ success: true })
    
    renderWithProviders(<Login />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    expect(mockAuthContext.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    })
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()
    mockAuthContext.loading = true
    
    renderWithProviders(<Login />)
    
    const submitButton = screen.getByRole('button', { name: /signing in/i })
    expect(submitButton).toBeDisabled()
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('handles login success', async () => {
    const user = userEvent.setup()
    mockAuthContext.login.mockResolvedValue({ success: true })
    
    renderWithProviders(<Login />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('handles login error', async () => {
    const user = userEvent.setup()
    const errorMessage = 'Invalid credentials'
    mockAuthContext.login.mockRejectedValue(new Error(errorMessage))
    
    renderWithProviders(<Login />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('displays auth context error', () => {
    mockAuthContext.error = 'Network error'
    
    renderWithProviders(<Login />)
    
    expect(screen.getByText('Network error')).toBeInTheDocument()
  })

  it('has remember me checkbox', () => {
    renderWithProviders(<Login />)
    
    const rememberCheckbox = screen.getByLabelText(/remember me/i)
    expect(rememberCheckbox).toBeInTheDocument()
    expect(rememberCheckbox).toHaveAttribute('type', 'checkbox')
  })

  it('handles remember me toggle', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Login />)
    
    const rememberCheckbox = screen.getByLabelText(/remember me/i)
    
    expect(rememberCheckbox).not.toBeChecked()
    
    await user.click(rememberCheckbox)
    expect(rememberCheckbox).toBeChecked()
    
    await user.click(rememberCheckbox)
    expect(rememberCheckbox).not.toBeChecked()
  })

  it('includes remember me in form submission', async () => {
    const user = userEvent.setup()
    mockAuthContext.login.mockResolvedValue({ success: true })
    
    renderWithProviders(<Login />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const rememberCheckbox = screen.getByLabelText(/remember me/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(rememberCheckbox)
    await user.click(submitButton)
    
    expect(mockAuthContext.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      remember: true
    })
  })

  it('has demo login option', () => {
    renderWithProviders(<Login />)
    
    expect(screen.getByText(/try demo account/i)).toBeInTheDocument()
    expect(screen.getByText('demo@example.com')).toBeInTheDocument()
    expect(screen.getByText('password')).toBeInTheDocument()
  })

  it('handles demo login', async () => {
    const user = userEvent.setup()
    mockAuthContext.login.mockResolvedValue({ success: true })
    
    renderWithProviders(<Login />)
    
    const demoButton = screen.getByText(/use demo account/i)
    await user.click(demoButton)
    
    expect(mockAuthContext.login).toHaveBeenCalledWith({
      email: 'demo@example.com',
      password: 'password'
    })
  })

  it('shows password visibility toggle', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Login />)
    
    const passwordInput = screen.getByLabelText(/password/i)
    const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i })
    
    expect(passwordInput).toHaveAttribute('type', 'password')
    
    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')
    
    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('has proper navigation links', () => {
    renderWithProviders(<Login />)
    
    const forgotPasswordLink = screen.getByText(/forgot your password/i)
    const signUpLink = screen.getByText(/sign up/i)
    
    expect(forgotPasswordLink).toHaveAttribute('href', '/auth/forgot-password')
    expect(signUpLink).toHaveAttribute('href', '/auth/register')
  })

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Login />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    
    await user.type(emailInput, 'test@example.com')
    await user.tab()
    
    expect(passwordInput).toHaveFocus()
  })

  it('submits form on Enter key press', async () => {
    const user = userEvent.setup()
    mockAuthContext.login.mockResolvedValue({ success: true })
    
    renderWithProviders(<Login />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.keyboard('{Enter}')
    
    expect(mockAuthContext.login).toHaveBeenCalled()
  })

  it('clears form errors when user starts typing', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Login />)
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)
    
    expect(screen.getByText('Email is required')).toBeInTheDocument()
    
    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 't')
    
    expect(screen.queryByText('Email is required')).not.toBeInTheDocument()
  })
})