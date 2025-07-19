import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, userEvent, mockAsset } from '../../../test/utils'
import AssetCard from '../AssetCard'

describe('AssetCard', () => {
  const mockHandlers = {
    onView: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders asset information correctly', () => {
    renderWithProviders(
      <AssetCard asset={mockAsset} {...mockHandlers} />
    )

    expect(screen.getByText('Test Asset')).toBeInTheDocument()
    expect(screen.getByText('Apartment')).toBeInTheDocument()
    expect(screen.getByText('123 Test St')).toBeInTheDocument()
    expect(screen.getByText('Test City, Test State')).toBeInTheDocument()
    expect(screen.getByText('2 bed • 1 bath • 1 floor')).toBeInTheDocument()
  })

  it('displays asset status badge', () => {
    renderWithProviders(
      <AssetCard asset={mockAsset} {...mockHandlers} />
    )

    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Active')).toHaveClass('badge-success')
  })

  it('displays asset condition badge', () => {
    renderWithProviders(
      <AssetCard asset={mockAsset} {...mockHandlers} />
    )

    expect(screen.getByText('Good')).toBeInTheDocument()
    expect(screen.getByText('Good')).toHaveClass('badge-success')
  })

  it('displays inspection status badge', () => {
    renderWithProviders(
      <AssetCard asset={mockAsset} {...mockHandlers} />
    )

    expect(screen.getByText('Not Inspected')).toBeInTheDocument()
    expect(screen.getByText('Not Inspected')).toHaveClass('badge-gray')
  })

  it('shows next inspection date when available', () => {
    renderWithProviders(
      <AssetCard asset={mockAsset} {...mockHandlers} />
    )

    expect(screen.getByText('Next Inspection:')).toBeInTheDocument()
    expect(screen.getByText('8/1/2025')).toBeInTheDocument()
  })

  it('renders asset image', () => {
    renderWithProviders(
      <AssetCard asset={mockAsset} {...mockHandlers} />
    )

    const image = screen.getByAltText('Test Asset')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', '/api/placeholder/400/300')
  })

  it('calls onView when View button is clicked', async () => {
    const user = userEvent.setup()
    
    renderWithProviders(
      <AssetCard asset={mockAsset} {...mockHandlers} />
    )

    const viewButton = screen.getByTitle('View details')
    await user.click(viewButton)

    expect(mockHandlers.onView).toHaveBeenCalledWith(mockAsset)
  })

  it('calls onEdit when Edit button is clicked', async () => {
    const user = userEvent.setup()
    
    renderWithProviders(
      <AssetCard asset={mockAsset} {...mockHandlers} />
    )

    const editButton = screen.getByTitle('Edit asset')
    await user.click(editButton)

    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockAsset)
  })

  it('calls onDelete when Delete button is clicked', async () => {
    const user = userEvent.setup()
    
    renderWithProviders(
      <AssetCard asset={mockAsset} {...mockHandlers} />
    )

    const deleteButton = screen.getByTitle('Delete asset')
    await user.click(deleteButton)

    expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockAsset)
  })

  it('handles asset with different status correctly', () => {
    const maintainanceAsset = {
      ...mockAsset,
      status: 'Under Maintenance',
      condition: 'Needs Repairs'
    }

    renderWithProviders(
      <AssetCard asset={maintainanceAsset} {...mockHandlers} />
    )

    expect(screen.getByText('Under Maintenance')).toHaveClass('badge-warning')
    expect(screen.getByText('Needs Repairs')).toHaveClass('badge-error')
  })

  it('handles asset without next inspection date', () => {
    const assetWithoutInspection = {
      ...mockAsset,
      nextInspection: null
    }

    renderWithProviders(
      <AssetCard asset={assetWithoutInspection} {...mockHandlers} />
    )

    expect(screen.getByText('Next Inspection:')).toBeInTheDocument()
    expect(screen.getByText('Not scheduled')).toBeInTheDocument()
  })

  it('displays features correctly', () => {
    renderWithProviders(
      <AssetCard asset={mockAsset} {...mockHandlers} />
    )

    expect(screen.getByText('Test Feature')).toBeInTheDocument()
  })

  it('shows balcony information when available', () => {
    renderWithProviders(
      <AssetCard asset={mockAsset} {...mockHandlers} />
    )

    expect(screen.getByText('Balcony')).toBeInTheDocument()
  })

  it('handles asset with multiple floors correctly', () => {
    const multiFloorAsset = {
      ...mockAsset,
      details: {
        ...mockAsset.details,
        floors: 3
      }
    }

    renderWithProviders(
      <AssetCard asset={multiFloorAsset} {...mockHandlers} />
    )

    expect(screen.getByText('2 bed • 1 bath • 3 floors')).toBeInTheDocument()
  })

  it('handles click on card body to call onView', async () => {
    const user = userEvent.setup()
    
    renderWithProviders(
      <AssetCard asset={mockAsset} {...mockHandlers} />
    )

    const cardBody = screen.getByText('Test Asset').closest('.asset-card')
    await user.click(cardBody)

    expect(mockHandlers.onView).toHaveBeenCalledWith(mockAsset)
  })
})