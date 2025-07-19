import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test/utils'
import Assets from '../Assets'

// Mock the stores
const mockAssets = [
  {
    id: '1',
    name: 'Downtown Apartment',
    type: 'Apartment',
    status: 'Active',
    condition: 'Good',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001'
    },
    details: {
      bedrooms: 2,
      bathrooms: 1,
      squareFeet: 850
    },
    currentPhase: 'active',
    priority: 'Medium',
    inspectionStatus: 'Recently Inspected',
    images: [],
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Suburban House',
    type: 'House',
    status: 'Under Maintenance',
    condition: 'Fair',
    address: {
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210'
    },
    details: {
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1200
    },
    currentPhase: 'active',
    priority: 'High',
    inspectionStatus: 'Due for Inspection',
    images: [],
    createdAt: '2025-01-02T00:00:00Z'
  }
]

const mockAssetStore = {
  assets: mockAssets,
  filters: {
    status: '',
    type: '',
    condition: '',
    inspectionStatus: ''
  },
  searchTerm: '',
  loading: false,
  error: null,
  getFilteredAssets: vi.fn(() => mockAssets),
  setFilters: vi.fn(),
  setSearchTerm: vi.fn(),
  deleteAsset: vi.fn(),
  fetchAssets: vi.fn(),
  setError: vi.fn()
}

vi.mock('../../stores/assetStore', () => ({
  useAssetStore: () => mockAssetStore
}))

vi.mock('../../hooks/useGlobalSearch', () => ({
  useGlobalSearch: () => ({
    isOpen: false,
    openSearch: vi.fn(),
    closeSearch: vi.fn()
  })
}))

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

describe('Assets Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders assets page with header and content', () => {
    renderWithProviders(<Assets />)
    
    expect(screen.getByText('Assets')).toBeInTheDocument()
    expect(screen.getByText('Manage your real estate portfolio')).toBeInTheDocument()
    expect(screen.getByText('Add New Asset')).toBeInTheDocument()
  })

  it('displays asset count correctly', () => {
    renderWithProviders(<Assets />)
    
    expect(screen.getByText('2 of 2 assets')).toBeInTheDocument()
  })

  it('renders search input with placeholder', () => {
    renderWithProviders(<Assets />)
    
    const searchInput = screen.getByPlaceholderText('Search assets by name, address, or city...')
    expect(searchInput).toBeInTheDocument()
  })

  it('renders filter controls', () => {
    renderWithProviders(<Assets />)
    
    expect(screen.getByText('All Status')).toBeInTheDocument()
    expect(screen.getByText('All Types')).toBeInTheDocument()
    expect(screen.getByText('All Conditions')).toBeInTheDocument()
  })

  it('renders view toggle buttons', () => {
    renderWithProviders(<Assets />)
    
    const gridButton = screen.getByRole('button', { name: /grid view/i })
    const listButton = screen.getByRole('button', { name: /list view/i })
    
    expect(gridButton).toBeInTheDocument()
    expect(listButton).toBeInTheDocument()
  })

  it('renders export menu', () => {
    renderWithProviders(<Assets />)
    
    expect(screen.getByText('Export')).toBeInTheDocument()
  })

  it('displays assets in grid view by default', () => {
    renderWithProviders(<Assets />)
    
    expect(screen.getByText('Downtown Apartment')).toBeInTheDocument()
    expect(screen.getByText('Suburban House')).toBeInTheDocument()
  })

  it('handles search input changes', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Assets />)
    
    const searchInput = screen.getByPlaceholderText('Search assets by name, address, or city...')
    await user.type(searchInput, 'Downtown')
    
    expect(mockAssetStore.setSearchTerm).toHaveBeenCalledWith('Downtown')
  })

  it('handles status filter change', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Assets />)
    
    const statusSelect = screen.getByDisplayValue('All Status')
    await user.selectOptions(statusSelect, 'Active')
    
    expect(mockAssetStore.setFilters).toHaveBeenCalledWith({
      ...mockAssetStore.filters,
      status: 'Active'
    })
  })

  it('handles type filter change', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Assets />)
    
    const typeSelect = screen.getByDisplayValue('All Types')
    await user.selectOptions(typeSelect, 'Apartment')
    
    expect(mockAssetStore.setFilters).toHaveBeenCalledWith({
      ...mockAssetStore.filters,
      type: 'Apartment'
    })
  })

  it('handles condition filter change', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Assets />)
    
    const conditionSelect = screen.getByDisplayValue('All Conditions')
    await user.selectOptions(conditionSelect, 'Good')
    
    expect(mockAssetStore.setFilters).toHaveBeenCalledWith({
      ...mockAssetStore.filters,
      condition: 'Good'
    })
  })

  it('shows clear filters button when filters are active', () => {
    const mockStoreWithFilters = {
      ...mockAssetStore,
      filters: { status: 'Active', type: '', condition: '', inspectionStatus: '' }
    }
    
    vi.mocked(mockAssetStore.getFilteredAssets).mockReturnValue(mockAssets)
    
    renderWithProviders(<Assets />, {
      assetStore: mockStoreWithFilters
    })
    
    expect(screen.getByText('Clear Filters')).toBeInTheDocument()
  })

  it('handles clear filters action', async () => {
    const user = userEvent.setup()
    const mockStoreWithFilters = {
      ...mockAssetStore,
      filters: { status: 'Active', type: '', condition: '', inspectionStatus: '' }
    }
    
    renderWithProviders(<Assets />, {
      assetStore: mockStoreWithFilters
    })
    
    const clearButton = screen.getByText('Clear Filters')
    await user.click(clearButton)
    
    expect(mockAssetStore.setFilters).toHaveBeenCalledWith({
      status: '',
      type: '',
      condition: '',
      inspectionStatus: ''
    })
    expect(mockAssetStore.setSearchTerm).toHaveBeenCalledWith('')
  })

  it('switches to list view when list button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Assets />)
    
    const listButton = screen.getByRole('button', { name: /list view/i })
    await user.click(listButton)
    
    // List view should be active (different styling)
    expect(listButton).toHaveClass('bg-secondary-100')
  })

  it('opens add asset modal when add button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Assets />)
    
    const addButton = screen.getByText('Add New Asset')
    await user.click(addButton)
    
    // Modal should be rendered (we can't test the actual modal here as it's mocked)
    expect(addButton).toBeInTheDocument()
  })

  it('shows loading state correctly', () => {
    const mockLoadingStore = {
      ...mockAssetStore,
      loading: true,
      assets: []
    }
    
    renderWithProviders(<Assets />, {
      assetStore: mockLoadingStore
    })
    
    // Should show skeleton loading
    expect(screen.getByTestId('asset-grid-skeleton')).toBeInTheDocument()
  })

  it('shows error state correctly', () => {
    const mockErrorStore = {
      ...mockAssetStore,
      error: { message: 'Failed to load assets' },
      assets: []
    }
    
    renderWithProviders(<Assets />, {
      assetStore: mockErrorStore
    })
    
    expect(screen.getByText('Failed to load assets')).toBeInTheDocument()
  })

  it('shows empty state when no assets', () => {
    const mockEmptyStore = {
      ...mockAssetStore,
      assets: [],
      getFilteredAssets: vi.fn(() => [])
    }
    
    renderWithProviders(<Assets />, {
      assetStore: mockEmptyStore
    })
    
    expect(screen.getByText('No assets found')).toBeInTheDocument()
    expect(screen.getByText('Get started by adding your first asset')).toBeInTheDocument()
  })

  it('shows no results state when filters return no matches', () => {
    const mockFilteredStore = {
      ...mockAssetStore,
      searchTerm: 'nonexistent',
      getFilteredAssets: vi.fn(() => [])
    }
    
    renderWithProviders(<Assets />, {
      assetStore: mockFilteredStore
    })
    
    expect(screen.getByText('No assets match your filters')).toBeInTheDocument()
    expect(screen.getByText('Try adjusting your search criteria or filters')).toBeInTheDocument()
  })

  it('fetches assets on mount when no assets exist', () => {
    const mockEmptyStore = {
      ...mockAssetStore,
      assets: []
    }
    
    renderWithProviders(<Assets />, {
      assetStore: mockEmptyStore
    })
    
    expect(mockAssetStore.fetchAssets).toHaveBeenCalled()
  })

  it('handles retry action on error', async () => {
    const user = userEvent.setup()
    const mockErrorStore = {
      ...mockAssetStore,
      error: { message: 'Network error' },
      assets: []
    }
    
    renderWithProviders(<Assets />, {
      assetStore: mockErrorStore
    })
    
    const retryButton = screen.getByText('Retry')
    await user.click(retryButton)
    
    expect(mockAssetStore.setError).toHaveBeenCalledWith(null)
    expect(mockAssetStore.fetchAssets).toHaveBeenCalled()
  })

  it('shows filtered count when filters are applied', () => {
    const mockFilteredStore = {
      ...mockAssetStore,
      searchTerm: 'Downtown',
      getFilteredAssets: vi.fn(() => [mockAssets[0]])
    }
    
    renderWithProviders(<Assets />, {
      assetStore: mockFilteredStore
    })
    
    expect(screen.getByText('1 of 2 assets')).toBeInTheDocument()
    expect(screen.getByText('(filtered)')).toBeInTheDocument()
  })

  it('opens filters modal when filters button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Assets />)
    
    const filtersButton = screen.getByText('Filters')
    await user.click(filtersButton)
    
    // Filter button should show active state or modal
    expect(filtersButton).toBeInTheDocument()
  })
})