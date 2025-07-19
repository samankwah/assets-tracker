import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import AddAssetModal from '../AddAssetModal'

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

// Mock stores
const mockAddAsset = vi.fn()
vi.mock('../../../stores/assetStore', () => ({
  useAssetStore: () => ({
    addAsset: mockAddAsset,
    loading: false
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

describe('AddAssetModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onAssetAdded: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders when open', () => {
    render(
      <TestWrapper>
        <AddAssetModal {...defaultProps} />
      </TestWrapper>
    )
    
    expect(screen.getByText('Add New Asset')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(
      <TestWrapper>
        <AddAssetModal {...defaultProps} isOpen={false} />
      </TestWrapper>
    )
    
    expect(screen.queryByText('Add New Asset')).not.toBeInTheDocument()
  })

  it('renders form fields', () => {
    render(
      <TestWrapper>
        <AddAssetModal {...defaultProps} />
      </TestWrapper>
    )
    
    expect(screen.getByLabelText(/asset name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/asset type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
  })

  it('renders action buttons', () => {
    render(
      <TestWrapper>
        <AddAssetModal {...defaultProps} />
      </TestWrapper>
    )
    
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Add Asset')).toBeInTheDocument()
  })

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <AddAssetModal {...defaultProps} />
      </TestWrapper>
    )
    
    await user.click(screen.getByText('Cancel'))
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when overlay is clicked', async () => {
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <AddAssetModal {...defaultProps} />
      </TestWrapper>
    )
    
    const overlay = screen.getByTestId('modal-overlay')
    await user.click(overlay)
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('includes address fields', () => {
    render(
      <TestWrapper>
        <AddAssetModal {...defaultProps} />
      </TestWrapper>
    )
    
    expect(screen.getByLabelText(/street address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/state/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/zip code/i)).toBeInTheDocument()
  })

  it('includes property details fields', () => {
    render(
      <TestWrapper>
        <AddAssetModal {...defaultProps} />
      </TestWrapper>
    )
    
    expect(screen.getByLabelText(/bedrooms/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/bathrooms/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/square feet/i)).toBeInTheDocument()
  })

  it('renders asset type options', () => {
    render(
      <TestWrapper>
        <AddAssetModal {...defaultProps} />
      </TestWrapper>
    )
    
    const typeSelect = screen.getByLabelText(/asset type/i)
    expect(typeSelect).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(
      <TestWrapper>
        <AddAssetModal {...defaultProps} />
      </TestWrapper>
    )
    
    const modal = screen.getByRole('dialog')
    expect(modal).toBeInTheDocument()
    expect(modal).toHaveAttribute('aria-modal', 'true')
  })

  it('focuses on first input when opened', async () => {
    render(
      <TestWrapper>
        <AddAssetModal {...defaultProps} />
      </TestWrapper>
    )
    
    await waitFor(() => {
      const nameInput = screen.getByLabelText(/asset name/i)
      expect(nameInput).toHaveFocus()
    })
  })

  it('handles escape key to close modal', async () => {
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <AddAssetModal {...defaultProps} />
      </TestWrapper>
    )
    
    await user.keyboard('{Escape}')
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })
})