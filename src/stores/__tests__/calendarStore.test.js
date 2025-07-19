import { describe, it, expect, beforeEach } from 'vitest'
import { useCalendarStore } from '../calendarStore'

// Mock event data
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
    status: 'completed'
  }
]

describe('Calendar Store', () => {
  let store

  beforeEach(() => {
    store = useCalendarStore.getState()
    // Reset store to initial state
    useCalendarStore.setState({
      events: [],
      view: 'month',
      selectedDate: new Date('2025-01-15'),
      filters: {
        eventType: '',
        priority: '',
        status: '',
        assetId: ''
      }
    })
  })

  describe('Initial State', () => {
    it('has correct initial state', () => {
      const state = useCalendarStore.getState()
      
      expect(state.events).toEqual([])
      expect(state.view).toBe('month')
      expect(state.selectedDate).toBeInstanceOf(Date)
      expect(state.filters).toEqual({
        eventType: '',
        priority: '',
        status: '',
        assetId: ''
      })
    })
  })

  describe('View Management', () => {
    it('sets calendar view', () => {
      const { setView } = useCalendarStore.getState()
      
      setView('week')
      expect(useCalendarStore.getState().view).toBe('week')
      
      setView('day')
      expect(useCalendarStore.getState().view).toBe('day')
      
      setView('month')
      expect(useCalendarStore.getState().view).toBe('month')
    })

    it('sets selected date', () => {
      const { setSelectedDate } = useCalendarStore.getState()
      const newDate = new Date('2025-02-01')
      
      setSelectedDate(newDate)
      expect(useCalendarStore.getState().selectedDate).toEqual(newDate)
    })
  })

  describe('Event Management', () => {
    it('adds new event', () => {
      const { addEvent } = useCalendarStore.getState()
      const newEvent = {
        id: '3',
        title: 'New Event',
        start: new Date('2025-01-25T10:00:00Z'),
        end: new Date('2025-01-25T11:00:00Z'),
        type: 'inspection',
        assetId: '1',
        priority: 'Low'
      }
      
      addEvent(newEvent)
      const state = useCalendarStore.getState()
      
      expect(state.events).toHaveLength(1)
      expect(state.events[0]).toEqual(newEvent)
    })

    it('updates existing event', () => {
      const { addEvent, updateEvent } = useCalendarStore.getState()
      
      // Add an event first
      addEvent(mockEvents[0])
      
      // Update the event
      const updatedEvent = {
        ...mockEvents[0],
        title: 'Updated Inspection',
        priority: 'Low'
      }
      
      updateEvent('1', updatedEvent)
      const state = useCalendarStore.getState()
      
      expect(state.events[0].title).toBe('Updated Inspection')
      expect(state.events[0].priority).toBe('Low')
    })

    it('deletes event', () => {
      const { addEvent, deleteEvent } = useCalendarStore.getState()
      
      // Add events first
      addEvent(mockEvents[0])
      addEvent(mockEvents[1])
      
      expect(useCalendarStore.getState().events).toHaveLength(2)
      
      // Delete one event
      deleteEvent('1')
      const state = useCalendarStore.getState()
      
      expect(state.events).toHaveLength(1)
      expect(state.events[0].id).toBe('2')
    })

    it('handles non-existent event updates', () => {
      const { updateEvent } = useCalendarStore.getState()
      
      // Try to update non-existent event
      updateEvent('999', { title: 'Updated' })
      
      // Should not crash and events should remain empty
      expect(useCalendarStore.getState().events).toHaveLength(0)
    })

    it('handles non-existent event deletion', () => {
      const { addEvent, deleteEvent } = useCalendarStore.getState()
      
      addEvent(mockEvents[0])
      
      // Try to delete non-existent event
      deleteEvent('999')
      
      // Original event should still exist
      expect(useCalendarStore.getState().events).toHaveLength(1)
    })
  })

  describe('Filtering', () => {
    beforeEach(() => {
      const { addEvent } = useCalendarStore.getState()
      mockEvents.forEach(event => addEvent(event))
    })

    it('sets filters', () => {
      const { setFilters } = useCalendarStore.getState()
      const newFilters = {
        eventType: 'inspection',
        priority: 'High',
        status: 'scheduled',
        assetId: '1'
      }
      
      setFilters(newFilters)
      expect(useCalendarStore.getState().filters).toEqual(newFilters)
    })

    it('gets events for date range', () => {
      const { getEventsForDateRange } = useCalendarStore.getState()
      
      const startDate = new Date('2025-01-01')
      const endDate = new Date('2025-01-31')
      
      const events = getEventsForDateRange(startDate, endDate)
      
      // Both events should be in January 2025
      expect(events).toHaveLength(2)
    })

    it('filters events by date range', () => {
      const { getEventsForDateRange } = useCalendarStore.getState()
      
      const startDate = new Date('2025-01-10')
      const endDate = new Date('2025-01-18')
      
      const events = getEventsForDateRange(startDate, endDate)
      
      // Only the first event (Jan 15) should be in this range
      expect(events).toHaveLength(1)
      expect(events[0].id).toBe('1')
    })

    it('applies event type filter', () => {
      const { setFilters, getEventsForDateRange } = useCalendarStore.getState()
      
      setFilters({ eventType: 'inspection', priority: '', status: '', assetId: '' })
      
      const events = getEventsForDateRange(
        new Date('2025-01-01'),
        new Date('2025-01-31')
      )
      
      expect(events).toHaveLength(1)
      expect(events[0].type).toBe('inspection')
    })

    it('applies priority filter', () => {
      const { setFilters, getEventsForDateRange } = useCalendarStore.getState()
      
      setFilters({ eventType: '', priority: 'High', status: '', assetId: '' })
      
      const events = getEventsForDateRange(
        new Date('2025-01-01'),
        new Date('2025-01-31')
      )
      
      expect(events).toHaveLength(1)
      expect(events[0].priority).toBe('High')
    })

    it('applies status filter', () => {
      const { setFilters, getEventsForDateRange } = useCalendarStore.getState()
      
      setFilters({ eventType: '', priority: '', status: 'completed', assetId: '' })
      
      const events = getEventsForDateRange(
        new Date('2025-01-01'),
        new Date('2025-01-31')
      )
      
      expect(events).toHaveLength(1)
      expect(events[0].status).toBe('completed')
    })

    it('applies asset filter', () => {
      const { setFilters, getEventsForDateRange } = useCalendarStore.getState()
      
      setFilters({ eventType: '', priority: '', status: '', assetId: '1' })
      
      const events = getEventsForDateRange(
        new Date('2025-01-01'),
        new Date('2025-01-31')
      )
      
      expect(events).toHaveLength(1)
      expect(events[0].assetId).toBe('1')
    })

    it('applies multiple filters', () => {
      const { setFilters, getEventsForDateRange } = useCalendarStore.getState()
      
      setFilters({ 
        eventType: 'inspection', 
        priority: 'High', 
        status: 'scheduled', 
        assetId: '1' 
      })
      
      const events = getEventsForDateRange(
        new Date('2025-01-01'),
        new Date('2025-01-31')
      )
      
      expect(events).toHaveLength(1)
      expect(events[0].id).toBe('1')
    })

    it('returns empty array when no events match filters', () => {
      const { setFilters, getEventsForDateRange } = useCalendarStore.getState()
      
      setFilters({ eventType: 'nonexistent', priority: '', status: '', assetId: '' })
      
      const events = getEventsForDateRange(
        new Date('2025-01-01'),
        new Date('2025-01-31')
      )
      
      expect(events).toHaveLength(0)
    })

    it('handles events without optional properties', () => {
      const { addEvent, getEventsForDateRange } = useCalendarStore.getState()
      
      const minimalEvent = {
        id: '3',
        title: 'Minimal Event',
        start: new Date('2025-01-10T12:00:00Z'),
        end: new Date('2025-01-10T13:00:00Z')
      }
      
      addEvent(minimalEvent)
      
      const events = getEventsForDateRange(
        new Date('2025-01-01'),
        new Date('2025-01-31')
      )
      
      expect(events).toHaveLength(3)
    })
  })

  describe('Date Range Calculations', () => {
    it('handles events spanning multiple days', () => {
      const { addEvent, getEventsForDateRange } = useCalendarStore.getState()
      
      const multiDayEvent = {
        id: '3',
        title: 'Multi-day Event',
        start: new Date('2025-01-15T09:00:00Z'),
        end: new Date('2025-01-17T17:00:00Z'),
        type: 'maintenance'
      }
      
      addEvent(multiDayEvent)
      
      const events = getEventsForDateRange(
        new Date('2025-01-16T00:00:00Z'),
        new Date('2025-01-16T23:59:59Z')
      )
      
      expect(events).toHaveLength(1)
      expect(events[0].id).toBe('3')
    })

    it('handles events at date range boundaries', () => {
      const { addEvent, getEventsForDateRange } = useCalendarStore.getState()
      
      const boundaryEvent = {
        id: '3',
        title: 'Boundary Event',
        start: new Date('2025-01-01T00:00:00Z'),
        end: new Date('2025-01-01T01:00:00Z'),
        type: 'inspection'
      }
      
      addEvent(boundaryEvent)
      
      const events = getEventsForDateRange(
        new Date('2025-01-01T00:00:00Z'),
        new Date('2025-01-31T23:59:59Z')
      )
      
      expect(events).toHaveLength(1)
    })

    it('excludes events outside date range', () => {
      const { getEventsForDateRange } = useCalendarStore.getState()
      
      const events = getEventsForDateRange(
        new Date('2025-02-01'),
        new Date('2025-02-28')
      )
      
      expect(events).toHaveLength(0)
    })
  })
})