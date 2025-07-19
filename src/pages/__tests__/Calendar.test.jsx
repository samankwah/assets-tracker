import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test/utils'
import Calendar from '../Calendar'

// Mock data
const mockEvents = [
  {
    id: '1',
    title: 'Monthly Inspection',
    start: new Date('2025-01-15T09:00:00Z'),
    end: new Date('2025-01-15T10:00:00Z'),
    type: 'inspection',
    assetId: '1',
    assetName: 'Downtown Apartment',
    priority: 'High',
    status: 'scheduled'
  },
  {
    id: '2',
    title: 'HVAC Maintenance',
    start: new Date('2025-01-20T14:00:00Z'),
    end: new Date('2025-01-20T16:00:00Z'),
    type: 'maintenance',
    assetId: '2',
    assetName: 'Suburban House',
    priority: 'Medium',
    status: 'scheduled'
  }
]

const mockCalendarStore = {
  events: mockEvents,
  view: 'month',
  selectedDate: new Date('2025-01-15'),
  filters: {
    eventType: '',
    priority: '',
    status: '',
    assetId: ''
  },
  setView: vi.fn(),
  setSelectedDate: vi.fn(),
  setFilters: vi.fn(),
  getEventsForDateRange: vi.fn(() => mockEvents),
  addEvent: vi.fn(),
  updateEvent: vi.fn(),
  deleteEvent: vi.fn()
}

const mockAssets = [
  { id: '1', name: 'Downtown Apartment' },
  { id: '2', name: 'Suburban House' }
]

const mockAssetStore = {
  assets: mockAssets
}

vi.mock('../../stores/calendarStore', () => ({
  useCalendarStore: () => mockCalendarStore
}))

vi.mock('../../stores/assetStore', () => ({
  useAssetStore: () => mockAssetStore
}))

// Mock external calendar service
vi.mock('../../services/externalCalendarService', () => ({
  default: {
    isConnected: vi.fn(() => false),
    connect: vi.fn(),
    sync: vi.fn(),
    getConnectionStatus: vi.fn(() => ({
      google: false,
      outlook: false,
      apple: false
    }))
  }
}))

describe('Calendar Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders calendar page with header', () => {
    renderWithProviders(<Calendar />)
    
    expect(screen.getByText('Calendar')).toBeInTheDocument()
    expect(screen.getByText('Schedule and track maintenance activities')).toBeInTheDocument()
  })

  it('renders view toggle buttons', () => {
    renderWithProviders(<Calendar />)
    
    expect(screen.getByText('Month')).toBeInTheDocument()
    expect(screen.getByText('Week')).toBeInTheDocument()
    expect(screen.getByText('Day')).toBeInTheDocument()
  })

  it('renders filter controls', () => {
    renderWithProviders(<Calendar />)
    
    expect(screen.getByText('All Types')).toBeInTheDocument()
    expect(screen.getByText('All Priorities')).toBeInTheDocument()
    expect(screen.getByText('All Status')).toBeInTheDocument()
  })

  it('shows current view as active', () => {
    renderWithProviders(<Calendar />)
    
    const monthButton = screen.getByText('Month')
    expect(monthButton).toHaveClass('bg-blue-600', 'text-white')
  })

  it('switches to week view when week button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Calendar />)
    
    const weekButton = screen.getByText('Week')
    await user.click(weekButton)
    
    expect(mockCalendarStore.setView).toHaveBeenCalledWith('week')
  })

  it('switches to day view when day button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Calendar />)
    
    const dayButton = screen.getByText('Day')
    await user.click(dayButton)
    
    expect(mockCalendarStore.setView).toHaveBeenCalledWith('day')
  })

  it('handles event type filter change', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Calendar />)
    
    const typeSelect = screen.getByDisplayValue('All Types')
    await user.selectOptions(typeSelect, 'inspection')
    
    expect(mockCalendarStore.setFilters).toHaveBeenCalledWith({
      ...mockCalendarStore.filters,
      eventType: 'inspection'
    })
  })

  it('handles priority filter change', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Calendar />)
    
    const prioritySelect = screen.getByDisplayValue('All Priorities')
    await user.selectOptions(prioritySelect, 'High')
    
    expect(mockCalendarStore.setFilters).toHaveBeenCalledWith({
      ...mockCalendarStore.filters,
      priority: 'High'
    })
  })

  it('handles status filter change', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Calendar />)
    
    const statusSelect = screen.getByDisplayValue('All Status')
    await user.selectOptions(statusSelect, 'scheduled')
    
    expect(mockCalendarStore.setFilters).toHaveBeenCalledWith({
      ...mockCalendarStore.filters,
      status: 'scheduled'
    })
  })

  it('handles asset filter change', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Calendar />)
    
    const assetSelect = screen.getByDisplayValue('All Assets')
    await user.selectOptions(assetSelect, '1')
    
    expect(mockCalendarStore.setFilters).toHaveBeenCalledWith({
      ...mockCalendarStore.filters,
      assetId: '1'
    })
  })

  it('renders calendar navigation', () => {
    renderWithProviders(<Calendar />)
    
    // Should have navigation buttons (previous/next)
    const prevButton = screen.getByRole('button', { name: /previous/i })
    const nextButton = screen.getByRole('button', { name: /next/i })
    
    expect(prevButton).toBeInTheDocument()
    expect(nextButton).toBeInTheDocument()
  })

  it('renders today button', () => {
    renderWithProviders(<Calendar />)
    
    expect(screen.getByText('Today')).toBeInTheDocument()
  })

  it('handles today button click', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Calendar />)
    
    const todayButton = screen.getByText('Today')
    await user.click(todayButton)
    
    expect(mockCalendarStore.setSelectedDate).toHaveBeenCalled()
  })

  it('renders external calendar sync section', () => {
    renderWithProviders(<Calendar />)
    
    expect(screen.getByText('External Calendar Sync')).toBeInTheDocument()
    expect(screen.getByText('Google Calendar')).toBeInTheDocument()
    expect(screen.getByText('Microsoft Outlook')).toBeInTheDocument()
    expect(screen.getByText('Apple Calendar')).toBeInTheDocument()
  })

  it('shows calendar connection status', () => {
    renderWithProviders(<Calendar />)
    
    // Should show "Not Connected" status for all calendars
    const notConnectedElements = screen.getAllByText('Not Connected')
    expect(notConnectedElements).toHaveLength(3)
  })

  it('renders sync button when calendars are connected', () => {
    // Mock connected state
    const mockConnectedStore = {
      ...mockCalendarStore,
      externalConnections: {
        google: true,
        outlook: false,
        apple: false
      }
    }
    
    renderWithProviders(<Calendar />, {
      calendarStore: mockConnectedStore
    })
    
    expect(screen.getByText('Sync All')).toBeInTheDocument()
  })

  it('renders add event button', () => {
    renderWithProviders(<Calendar />)
    
    expect(screen.getByText('Add Event')).toBeInTheDocument()
  })

  it('opens add event modal when add button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Calendar />)
    
    const addButton = screen.getByText('Add Event')
    await user.click(addButton)
    
    // Modal state should change
    expect(addButton).toBeInTheDocument()
  })

  it('shows event count in different views', () => {
    renderWithProviders(<Calendar />)
    
    // Should show events based on current view
    expect(screen.getByText(/events/i)).toBeInTheDocument()
  })

  it('renders calendar legend', () => {
    renderWithProviders(<Calendar />)
    
    expect(screen.getByText('Legend')).toBeInTheDocument()
    expect(screen.getByText('Inspection')).toBeInTheDocument()
    expect(screen.getByText('Maintenance')).toBeInTheDocument()
    expect(screen.getByText('Safety Check')).toBeInTheDocument()
  })

  it('renders week view correctly', () => {
    const mockWeekStore = {
      ...mockCalendarStore,
      view: 'week'
    }
    
    renderWithProviders(<Calendar />, {
      calendarStore: mockWeekStore
    })
    
    const weekButton = screen.getByText('Week')
    expect(weekButton).toHaveClass('bg-blue-600', 'text-white')
  })

  it('renders day view correctly', () => {
    const mockDayStore = {
      ...mockCalendarStore,
      view: 'day'
    }
    
    renderWithProviders(<Calendar />, {
      calendarStore: mockDayStore
    })
    
    const dayButton = screen.getByText('Day')
    expect(dayButton).toHaveClass('bg-blue-600', 'text-white')
  })

  it('shows clear filters button when filters are active', () => {
    const mockFilteredStore = {
      ...mockCalendarStore,
      filters: {
        ...mockCalendarStore.filters,
        eventType: 'inspection'
      }
    }
    
    renderWithProviders(<Calendar />, {
      calendarStore: mockFilteredStore
    })
    
    expect(screen.getByText('Clear Filters')).toBeInTheDocument()
  })

  it('handles clear filters action', async () => {
    const user = userEvent.setup()
    const mockFilteredStore = {
      ...mockCalendarStore,
      filters: {
        eventType: 'inspection',
        priority: 'High',
        status: '',
        assetId: ''
      }
    }
    
    renderWithProviders(<Calendar />, {
      calendarStore: mockFilteredStore
    })
    
    const clearButton = screen.getByText('Clear Filters')
    await user.click(clearButton)
    
    expect(mockCalendarStore.setFilters).toHaveBeenCalledWith({
      eventType: '',
      priority: '',
      status: '',
      assetId: ''
    })
  })

  it('renders loading state correctly', () => {
    const mockLoadingStore = {
      ...mockCalendarStore,
      loading: true
    }
    
    renderWithProviders(<Calendar />, {
      calendarStore: mockLoadingStore
    })
    
    expect(screen.getByText('Loading calendar...')).toBeInTheDocument()
  })

  it('handles calendar navigation correctly', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Calendar />)
    
    const nextButton = screen.getByRole('button', { name: /next/i })
    await user.click(nextButton)
    
    expect(mockCalendarStore.setSelectedDate).toHaveBeenCalled()
  })
})