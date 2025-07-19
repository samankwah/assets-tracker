import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '../../test/utils'
import Dashboard from '../Dashboard'

// Mock the stores
vi.mock('../../stores/assetStore', () => ({
  useAssetStore: vi.fn(() => ({
    getAssetStats: () => ({
      total: 5,
      active: 3,
      maintenance: 1,
      decommissioned: 1
    }),
    assets: [
      { id: 1, name: 'Asset 1', status: 'Active' },
      { id: 2, name: 'Asset 2', status: 'Under Maintenance' }
    ]
  }))
}))

vi.mock('../../stores/taskStore', () => ({
  useTaskStore: vi.fn(() => ({
    getTaskStats: () => ({
      total: 10,
      completed: 6,
      today: 2,
      overdue: 1
    }),
    tasks: [
      { id: 1, title: 'Task 1', status: 'Not Inspected' },
      { id: 2, title: 'Task 2', status: 'Completed' }
    ]
  }))
}))

describe('Dashboard', () => {
  it('renders dashboard title and description', () => {
    renderWithProviders(<Dashboard />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Overview of your real estate portfolio')).toBeInTheDocument()
  })

  it('displays asset statistics cards', () => {
    renderWithProviders(<Dashboard />)

    expect(screen.getByText('Total Assets')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('Active Assets')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('Under Maintenance')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('displays task statistics cards', () => {
    renderWithProviders(<Dashboard />)

    expect(screen.getByText('Total Tasks')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('Tasks Due Today')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('Overdue Tasks')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('Completed Tasks')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
  })

  it('shows quick actions section', () => {
    renderWithProviders(<Dashboard />)

    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    expect(screen.getByText('Add New Asset')).toBeInTheDocument()
    expect(screen.getByText('Create Task')).toBeInTheDocument()
    expect(screen.getByText('Schedule Inspection')).toBeInTheDocument()
    expect(screen.getByText('View Calendar')).toBeInTheDocument()
  })

  it('displays recent assets section', () => {
    renderWithProviders(<Dashboard />)

    expect(screen.getByText('Recent Assets')).toBeInTheDocument()
    expect(screen.getByText('Asset 1')).toBeInTheDocument()
    expect(screen.getByText('Asset 2')).toBeInTheDocument()
    expect(screen.getByText('View All Assets')).toBeInTheDocument()
  })

  it('displays recent tasks section', () => {
    renderWithProviders(<Dashboard />)

    expect(screen.getByText('Recent Tasks')).toBeInTheDocument()
    expect(screen.getByText('Task 1')).toBeInTheDocument()
    expect(screen.getByText('Task 2')).toBeInTheDocument()
    expect(screen.getByText('View All Tasks')).toBeInTheDocument()
  })

  it('shows activity timeline', () => {
    renderWithProviders(<Dashboard />)

    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
    expect(screen.getByText('View All Activity')).toBeInTheDocument()
  })

  it('displays overview section', () => {
    renderWithProviders(<Dashboard />)

    expect(screen.getByText('System Overview')).toBeInTheDocument()
    expect(screen.getByText('Portfolio Performance')).toBeInTheDocument()
    expect(screen.getByText('Assets by Status')).toBeInTheDocument()
    expect(screen.getByText('Tasks by Priority')).toBeInTheDocument()
  })

  it('shows welcome message', () => {
    renderWithProviders(<Dashboard />)

    expect(screen.getByText('Welcome back! Here\'s what\'s happening with your assets.')).toBeInTheDocument()
  })

  it('renders stat cards with correct styling', () => {
    renderWithProviders(<Dashboard />)

    const totalAssetsCard = screen.getByText('Total Assets').closest('div')
    expect(totalAssetsCard).toHaveClass('stat-card-blue')

    const activeAssetsCard = screen.getByText('Active Assets').closest('div')
    expect(activeAssetsCard).toHaveClass('stat-card-teal')

    const dueTodayCard = screen.getByText('Tasks Due Today').closest('div')
    expect(dueTodayCard).toHaveClass('stat-card-orange')

    const overdueCard = screen.getByText('Overdue Tasks').closest('div')
    expect(overdueCard).toHaveClass('stat-card-red')
  })

  it('shows charts section', () => {
    renderWithProviders(<Dashboard />)

    expect(screen.getByText('Analytics')).toBeInTheDocument()
    expect(screen.getByText('Asset Performance')).toBeInTheDocument()
    expect(screen.getByText('Task Completion Rate')).toBeInTheDocument()
  })

  it('displays upcoming inspections section', () => {
    renderWithProviders(<Dashboard />)

    expect(screen.getByText('Upcoming Inspections')).toBeInTheDocument()
    expect(screen.getByText('View Calendar')).toBeInTheDocument()
  })

  it('shows maintenance alerts section', () => {
    renderWithProviders(<Dashboard />)

    expect(screen.getByText('Maintenance Alerts')).toBeInTheDocument()
    expect(screen.getByText('View All Alerts')).toBeInTheDocument()
  })

  it('renders responsive grid layout', () => {
    renderWithProviders(<Dashboard />)

    // Check for responsive grid classes
    const statsGrid = screen.getByText('Total Assets').closest('div').parentElement
    expect(statsGrid).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4')
  })

  it('shows empty state for assets when no assets exist', () => {
    // Mock empty assets
    const { useAssetStore } = require('../../stores/assetStore')
    useAssetStore.mockReturnValueOnce({
      getAssetStats: () => ({ total: 0, active: 0, maintenance: 0, decommissioned: 0 }),
      assets: []
    })

    renderWithProviders(<Dashboard />)

    expect(screen.getByText('No assets added yet')).toBeInTheDocument()
  })

  it('shows empty state for tasks when no tasks exist', () => {
    // Mock empty tasks
    const { useTaskStore } = require('../../stores/taskStore')
    useTaskStore.mockReturnValueOnce({
      getTaskStats: () => ({ total: 0, completed: 0, today: 0, overdue: 0 }),
      tasks: []
    })

    renderWithProviders(<Dashboard />)

    expect(screen.getByText('No tasks created yet')).toBeInTheDocument()
  })

  it('handles loading states correctly', () => {
    renderWithProviders(<Dashboard />)

    // Check that data is displayed without loading indicators
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('shows priority indicators for overdue tasks', () => {
    renderWithProviders(<Dashboard />)

    const overdueSection = screen.getByText('Overdue Tasks')
    expect(overdueSection).toBeInTheDocument()
    expect(overdueSection.closest('div')).toHaveClass('stat-card-red')
  })

  it('displays proper icons for each section', () => {
    renderWithProviders(<Dashboard />)

    // Check that icons are rendered (they should be present as SVG elements)
    const svgElements = document.querySelectorAll('svg')
    expect(svgElements.length).toBeGreaterThan(0)
  })
})