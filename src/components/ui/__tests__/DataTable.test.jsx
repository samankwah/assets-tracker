import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, userEvent } from '../../../test/utils'
import DataTable from '../DataTable'

const mockData = [
  { id: 1, name: 'Item 1', category: 'Category A', status: 'Active' },
  { id: 2, name: 'Item 2', category: 'Category B', status: 'Inactive' },
  { id: 3, name: 'Item 3', category: 'Category A', status: 'Active' },
]

const mockColumns = [
  { key: 'name', label: 'Name', sortable: true },
  { 
    key: 'category', 
    label: 'Category', 
    sortable: true, 
    filterable: true,
    filterOptions: ['Category A', 'Category B']
  },
  { 
    key: 'status', 
    label: 'Status', 
    sortable: true,
    filterable: true,
    filterOptions: ['Active', 'Inactive']
  },
]

describe('DataTable', () => {
  it('renders table with data', () => {
    renderWithProviders(
      <DataTable data={mockData} columns={mockColumns} />
    )

    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Category')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
    expect(screen.getByText('Item 3')).toBeInTheDocument()
  })

  it('shows empty message when no data', () => {
    renderWithProviders(
      <DataTable 
        data={[]} 
        columns={mockColumns} 
        emptyMessage="No items found"
      />
    )

    expect(screen.getByText('No items found')).toBeInTheDocument()
  })

  it('renders search input when searchable', () => {
    renderWithProviders(
      <DataTable 
        data={mockData} 
        columns={mockColumns} 
        searchable={true}
      />
    )

    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
  })

  it('filters data based on search input', async () => {
    const user = userEvent.setup()
    
    renderWithProviders(
      <DataTable 
        data={mockData} 
        columns={mockColumns} 
        searchable={true}
      />
    )

    const searchInput = screen.getByPlaceholderText('Search...')
    await user.type(searchInput, 'Item 1')

    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.queryByText('Item 2')).not.toBeInTheDocument()
    expect(screen.queryByText('Item 3')).not.toBeInTheDocument()
  })

  it('renders filter dropdowns when filterable', () => {
    renderWithProviders(
      <DataTable 
        data={mockData} 
        columns={mockColumns} 
        filterable={true}
      />
    )

    expect(screen.getByDisplayValue('All Category')).toBeInTheDocument()
    expect(screen.getByDisplayValue('All Status')).toBeInTheDocument()
  })

  it('filters data based on dropdown selection', async () => {
    const user = userEvent.setup()
    
    renderWithProviders(
      <DataTable 
        data={mockData} 
        columns={mockColumns} 
        filterable={true}
      />
    )

    const categoryFilter = screen.getByDisplayValue('All Category')
    await user.selectOptions(categoryFilter, 'Category A')

    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.queryByText('Item 2')).not.toBeInTheDocument()
    expect(screen.getByText('Item 3')).toBeInTheDocument()
  })

  it('handles row click when onRowClick is provided', async () => {
    const user = userEvent.setup()
    const mockRowClick = vi.fn()
    
    renderWithProviders(
      <DataTable 
        data={mockData} 
        columns={mockColumns} 
        onRowClick={mockRowClick}
      />
    )

    const firstRow = screen.getByText('Item 1').closest('tr')
    await user.click(firstRow)

    expect(mockRowClick).toHaveBeenCalledWith(mockData[0])
  })

  it('sorts data when column header is clicked', async () => {
    const user = userEvent.setup()
    
    renderWithProviders(
      <DataTable 
        data={mockData} 
        columns={mockColumns} 
        sortable={true}
      />
    )

    const nameHeader = screen.getByText('Name')
    await user.click(nameHeader)

    // Check if sort icon is visible
    const sortIcon = nameHeader.parentElement.querySelector('svg')
    expect(sortIcon).toBeInTheDocument()
  })

  it('shows pagination when enabled', () => {
    const largeMockData = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
      category: 'Category A',
      status: 'Active'
    }))

    renderWithProviders(
      <DataTable 
        data={largeMockData} 
        columns={mockColumns} 
        pagination={true}
        pageSize={10}
      />
    )

    expect(screen.getByText('Showing 1 to 10 of 15 results')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument() // Page 2 button
  })

  it('navigates to next page when pagination button is clicked', async () => {
    const user = userEvent.setup()
    const largeMockData = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
      category: 'Category A',
      status: 'Active'
    }))

    renderWithProviders(
      <DataTable 
        data={largeMockData} 
        columns={mockColumns} 
        pagination={true}
        pageSize={10}
      />
    )

    const nextPageButton = screen.getByText('2')
    await user.click(nextPageButton)

    expect(screen.getByText('Showing 11 to 15 of 15 results')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = renderWithProviders(
      <DataTable 
        data={mockData} 
        columns={mockColumns} 
        className="custom-class"
      />
    )

    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })

  it('renders custom cell content with render function', () => {
    const customColumns = [
      {
        key: 'name',
        label: 'Name',
        render: (value) => <span data-testid="custom-cell">{value.toUpperCase()}</span>
      }
    ]

    renderWithProviders(
      <DataTable 
        data={mockData} 
        columns={customColumns} 
      />
    )

    expect(screen.getByTestId('custom-cell')).toBeInTheDocument()
    expect(screen.getByText('ITEM 1')).toBeInTheDocument()
  })
})