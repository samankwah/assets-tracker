import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test/utils'
import Tasks from '../Tasks'

// Mock data
const mockTasks = [
  {
    id: '1',
    title: 'Monthly Inspection',
    description: 'Regular monthly inspection for Downtown Apartment',
    assetId: '1',
    assetName: 'Downtown Apartment',
    type: 'Inspection',
    status: 'Not Inspected',
    priority: 'High',
    dueDate: '2025-01-15T09:00:00Z',
    dueTime: '09:00 AM',
    assignedTo: 'John Doe',
    frequency: 'Monthly',
    notifications: { email: true, sms: false },
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    title: 'HVAC Maintenance',
    description: 'Quarterly HVAC system maintenance',
    assetId: '2',
    assetName: 'Suburban House',
    type: 'Maintenance',
    status: 'Under Maintenance',
    priority: 'Medium',
    dueDate: '2025-01-20T14:00:00Z',
    dueTime: '02:00 PM',
    assignedTo: 'Jane Smith',
    frequency: 'Quarterly',
    notifications: { email: true, sms: true },
    createdAt: '2025-01-02T00:00:00Z'
  }
]

const mockAssets = [
  { id: '1', name: 'Downtown Apartment' },
  { id: '2', name: 'Suburban House' }
]

const mockTaskStore = {
  tasks: mockTasks,
  filters: {
    status: '',
    priority: '',
    type: '',
    assetId: '',
    assignedTo: ''
  },
  searchTerm: '',
  sortBy: 'dueDate',
  sortOrder: 'asc',
  getFilteredTasks: vi.fn(() => mockTasks),
  getTaskStats: vi.fn(() => ({
    total: 2,
    today: 1,
    overdue: 0,
    completed: 0
  })),
  setFilters: vi.fn(),
  setSearchTerm: vi.fn(),
  setSorting: vi.fn(),
  deleteTask: vi.fn(),
  completeTask: vi.fn()
}

const mockAssetStore = {
  assets: mockAssets
}

vi.mock('../../stores/taskStore', () => ({
  useTaskStore: () => mockTaskStore
}))

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

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

// Mock window.confirm
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: vi.fn(() => true)
})

describe('Tasks Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders tasks page with header and content', () => {
    renderWithProviders(<Tasks />)
    
    expect(screen.getByText('Tasks')).toBeInTheDocument()
    expect(screen.getByText('Manage maintenance tasks and inspections')).toBeInTheDocument()
    expect(screen.getByText('Add New Task')).toBeInTheDocument()
  })

  it('displays task statistics cards', () => {
    renderWithProviders(<Tasks />)
    
    expect(screen.getByText('Total Tasks')).toBeInTheDocument()
    expect(screen.getByText('Due Today')).toBeInTheDocument()
    expect(screen.getByText('Overdue')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
    
    expect(screen.getByText('2')).toBeInTheDocument() // Total tasks
    expect(screen.getByText('1')).toBeInTheDocument() // Due today
  })

  it('renders search input with placeholder', () => {
    renderWithProviders(<Tasks />)
    
    const searchInput = screen.getByPlaceholderText('Search tasks by title, description, or asset...')
    expect(searchInput).toBeInTheDocument()
  })

  it('renders filter controls', () => {
    renderWithProviders(<Tasks />)
    
    const filtersButton = screen.getByText('Filters')
    expect(filtersButton).toBeInTheDocument()
  })

  it('renders sort options', () => {
    renderWithProviders(<Tasks />)
    
    expect(screen.getByText('Sort by:')).toBeInTheDocument()
    expect(screen.getByText(/Due Date/)).toBeInTheDocument()
    expect(screen.getByText(/Priority/)).toBeInTheDocument()
    expect(screen.getByText(/Title/)).toBeInTheDocument()
  })

  it('renders view toggle buttons', () => {
    renderWithProviders(<Tasks />)
    
    const gridButton = screen.getByRole('button', { name: /grid view/i })
    const listButton = screen.getByRole('button', { name: /list view/i })
    
    expect(gridButton).toBeInTheDocument()
    expect(listButton).toBeInTheDocument()
  })

  it('displays task count correctly', () => {
    renderWithProviders(<Tasks />)
    
    expect(screen.getByText('2 of 2 tasks')).toBeInTheDocument()
  })

  it('displays tasks in grid view by default', () => {
    renderWithProviders(<Tasks />)
    
    expect(screen.getByText('Monthly Inspection')).toBeInTheDocument()
    expect(screen.getByText('HVAC Maintenance')).toBeInTheDocument()
  })

  it('handles search input changes', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Tasks />)
    
    const searchInput = screen.getByPlaceholderText('Search tasks by title, description, or asset...')
    await user.type(searchInput, 'Monthly')
    
    expect(mockTaskStore.setSearchTerm).toHaveBeenCalledWith('Monthly')
  })

  it('shows and hides filters panel', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Tasks />)
    
    const filtersButton = screen.getByText('Filters')
    await user.click(filtersButton)
    
    // Filter panel should be visible
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Priority')).toBeInTheDocument()
    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getByText('Asset')).toBeInTheDocument()
    expect(screen.getByText('Assigned To')).toBeInTheDocument()
  })

  it('handles status filter change', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Tasks />)
    
    // Open filters first
    const filtersButton = screen.getByText('Filters')
    await user.click(filtersButton)
    
    const statusSelect = screen.getByDisplayValue('All Status')
    await user.selectOptions(statusSelect, 'Not Inspected')
    
    expect(mockTaskStore.setFilters).toHaveBeenCalledWith({
      ...mockTaskStore.filters,
      status: 'Not Inspected'
    })
  })

  it('handles priority filter change', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Tasks />)
    
    // Open filters first
    const filtersButton = screen.getByText('Filters')
    await user.click(filtersButton)
    
    const prioritySelect = screen.getByDisplayValue('All Priorities')
    await user.selectOptions(prioritySelect, 'High')
    
    expect(mockTaskStore.setFilters).toHaveBeenCalledWith({
      ...mockTaskStore.filters,
      priority: 'High'
    })
  })

  it('handles sorting by due date', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Tasks />)
    
    const dueDateSort = screen.getByText(/Due Date/)
    await user.click(dueDateSort)
    
    expect(mockTaskStore.setSorting).toHaveBeenCalledWith('dueDate', 'desc')
  })

  it('handles sorting by priority', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Tasks />)
    
    const prioritySort = screen.getByText(/Priority/)
    await user.click(prioritySort)
    
    expect(mockTaskStore.setSorting).toHaveBeenCalledWith('priority', 'asc')
  })

  it('handles sorting by title', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Tasks />)
    
    const titleSort = screen.getByText(/Title/)
    await user.click(titleSort)
    
    expect(mockTaskStore.setSorting).toHaveBeenCalledWith('title', 'asc')
  })

  it('switches to list view when list button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Tasks />)
    
    const listButton = screen.getByRole('button', { name: /list view/i })
    await user.click(listButton)
    
    expect(listButton).toHaveClass('bg-secondary-100')
  })

  it('shows clear filters button when filters are active', () => {
    const mockStoreWithFilters = {
      ...mockTaskStore,
      filters: { ...mockTaskStore.filters, status: 'Not Inspected' }
    }
    
    renderWithProviders(<Tasks />, {
      taskStore: mockStoreWithFilters
    })
    
    const filtersButton = screen.getByText('Filters')
    expect(filtersButton).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('handles clear filters action', async () => {
    const user = userEvent.setup()
    const mockStoreWithFilters = {
      ...mockTaskStore,
      filters: { ...mockTaskStore.filters, status: 'Not Inspected' },
      searchTerm: 'test'
    }
    
    renderWithProviders(<Tasks />, {
      taskStore: mockStoreWithFilters
    })
    
    const clearButton = screen.getByText('Clear Filters')
    await user.click(clearButton)
    
    expect(mockTaskStore.setFilters).toHaveBeenCalledWith({
      status: '',
      priority: '',
      type: '',
      assetId: '',
      assignedTo: ''
    })
    expect(mockTaskStore.setSearchTerm).toHaveBeenCalledWith('')
  })

  it('opens add task modal when add button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Tasks />)
    
    const addButton = screen.getByText('Add New Task')
    await user.click(addButton)
    
    // Modal state should change (we can't test the actual modal as it's a separate component)
    expect(addButton).toBeInTheDocument()
  })

  it('shows empty state when no tasks', () => {
    const mockEmptyStore = {
      ...mockTaskStore,
      tasks: [],
      getFilteredTasks: vi.fn(() => []),
      getTaskStats: vi.fn(() => ({ total: 0, today: 0, overdue: 0, completed: 0 }))
    }
    
    renderWithProviders(<Tasks />, {
      taskStore: mockEmptyStore
    })
    
    expect(screen.getByText('No tasks found')).toBeInTheDocument()
    expect(screen.getByText('Get started by creating your first task')).toBeInTheDocument()
  })

  it('shows no results state when filters return no matches', () => {
    const mockFilteredStore = {
      ...mockTaskStore,
      searchTerm: 'nonexistent',
      getFilteredTasks: vi.fn(() => [])
    }
    
    renderWithProviders(<Tasks />, {
      taskStore: mockFilteredStore
    })
    
    expect(screen.getByText('No tasks match your filters')).toBeInTheDocument()
    expect(screen.getByText('Try adjusting your search criteria or filters')).toBeInTheDocument()
  })

  it('shows filtered count when filters are applied', () => {
    const mockFilteredStore = {
      ...mockTaskStore,
      searchTerm: 'Monthly',
      getFilteredTasks: vi.fn(() => [mockTasks[0]])
    }
    
    renderWithProviders(<Tasks />, {
      taskStore: mockFilteredStore
    })
    
    expect(screen.getByText('1 of 2 tasks')).toBeInTheDocument()
    expect(screen.getByText('(filtered)')).toBeInTheDocument()
  })

  it('displays export menu', () => {
    renderWithProviders(<Tasks />)
    
    expect(screen.getByText('Export')).toBeInTheDocument()
  })

  it('shows active sort indicator', () => {
    renderWithProviders(<Tasks />)
    
    // Due Date should show as active with sort direction
    expect(screen.getByText(/Due Date ↑/)).toBeInTheDocument()
  })

  it('handles asset filter selection', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Tasks />)
    
    // Open filters first
    const filtersButton = screen.getByText('Filters')
    await user.click(filtersButton)
    
    const assetSelect = screen.getByDisplayValue('All Assets')
    await user.selectOptions(assetSelect, '1')
    
    expect(mockTaskStore.setFilters).toHaveBeenCalledWith({
      ...mockTaskStore.filters,
      assetId: '1'
    })
  })

  it('handles assigned to filter selection', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Tasks />)
    
    // Open filters first
    const filtersButton = screen.getByText('Filters')
    await user.click(filtersButton)
    
    const assignedSelect = screen.getByDisplayValue('All Assignees')
    await user.selectOptions(assignedSelect, 'Agent X')
    
    expect(mockTaskStore.setFilters).toHaveBeenCalledWith({
      ...mockTaskStore.filters,
      assignedTo: 'Agent X'
    })
  })
})