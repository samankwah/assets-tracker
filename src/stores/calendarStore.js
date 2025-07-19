import { create } from 'zustand'
import { useTaskStore } from './taskStore'
import { useAssetStore } from './assetStore'
import assetInspectionService from '../services/assetInspectionService'

export const useCalendarStore = create((set, get) => ({
  currentDate: new Date(),
  viewMode: 'month', // 'month', 'week', 'day'
  selectedDate: null,
  events: [],
  recurringEvents: [],
  eventTemplates: [],
  inspectionEvents: [],
  inspectionSchedules: new Map(),
  loading: false,
  error: null,

  // Calendar navigation
  setCurrentDate: (date) => set({ currentDate: date }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSelectedDate: (date) => set({ selectedDate: date }),

  // Navigate calendar
  navigateToToday: () => set({ currentDate: new Date() }),
  navigateToNext: () => {
    const { currentDate, viewMode } = get()
    const newDate = new Date(currentDate)
    
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1)
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7)
    } else if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + 1)
    }
    
    set({ currentDate: newDate })
  },
  
  navigateToPrevious: () => {
    const { currentDate, viewMode } = get()
    const newDate = new Date(currentDate)
    
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7)
    } else if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() - 1)
    }
    
    set({ currentDate: newDate })
  },

  // Get calendar events from tasks and inspections
  getCalendarEvents: () => {
    const tasks = useTaskStore.getState().tasks
    const { events, inspectionEvents } = get()
    
    // Convert tasks to calendar events
    const taskEvents = tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      start: new Date(task.dueDate),
      end: new Date(new Date(task.dueDate).getTime() + 60 * 60 * 1000), // 1 hour duration
      type: 'task',
      taskType: task.type,
      priority: task.priority,
      status: task.status,
      assetId: task.assetId,
      assetName: task.assetName,
      assignedTo: task.assignedTo,
      color: getEventColor(task.priority, task.status)
    }))
    
    // Combine all events
    return [...taskEvents, ...events, ...(inspectionEvents || [])]
  },

  // Get events for a specific date
  getEventsForDate: (date) => {
    const events = get().getCalendarEvents()
    const targetDate = new Date(date)
    targetDate.setHours(0, 0, 0, 0)
    
    return events.filter(event => {
      const eventDate = new Date(event.start)
      eventDate.setHours(0, 0, 0, 0)
      return eventDate.getTime() === targetDate.getTime()
    })
  },

  // Get events for a date range
  getEventsForRange: (startDate, endDate) => {
    const events = get().getCalendarEvents()
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    return events.filter(event => {
      const eventDate = new Date(event.start)
      return eventDate >= start && eventDate <= end
    })
  },

  // Calendar utility functions
  getCalendarDays: (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    
    // First day of the month
    const firstDay = new Date(year, month, 1)
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0)
    
    // Days to show from previous month
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    // Days to show from next month
    const endDate = new Date(lastDay)
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))
    
    const days = []
    const current = new Date(startDate)
    
    while (current <= endDate) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return days
  },

  getWeekDays: (date) => {
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay())
    
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }
    
    return days
  },

  // Loading states
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Event Management
  createEvent: (eventData) => {
    const newEvent = {
      id: Date.now(),
      title: eventData.title,
      description: eventData.description || '',
      start: new Date(eventData.start),
      end: new Date(eventData.end),
      type: eventData.type || 'custom',
      category: eventData.category || 'general',
      assetId: eventData.assetId || null,
      assetName: eventData.assetName || '',
      assignedTo: eventData.assignedTo || '',
      priority: eventData.priority || 'Medium',
      status: eventData.status || 'Scheduled',
      location: eventData.location || '',
      color: eventData.color || getEventColor(eventData.priority, eventData.status),
      allDay: eventData.allDay || false,
      reminders: eventData.reminders || [],
      attachments: eventData.attachments || [],
      notes: eventData.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      recurring: eventData.recurring || null,
      parentEventId: eventData.parentEventId || null
    }

    set(state => ({
      events: [...state.events, newEvent]
    }))

    // If this is a recurring event, create the series
    if (eventData.recurring) {
      get().createRecurringEventSeries(newEvent)
    }

    return newEvent
  },

  updateEvent: (eventId, eventData) => {
    set(state => ({
      events: state.events.map(event =>
        event.id === eventId
          ? { ...event, ...eventData, updatedAt: new Date().toISOString() }
          : event
      )
    }))
  },

  deleteEvent: (eventId, deleteOptions = { deleteAll: false }) => {
    const { events } = get()
    const event = events.find(e => e.id === eventId)

    if (!event) return

    if (event.recurring && deleteOptions.deleteAll) {
      // Delete all events in the recurring series
      const seriesEvents = events.filter(e => 
        e.parentEventId === event.parentEventId || e.id === event.parentEventId
      )
      
      set(state => ({
        events: state.events.filter(e => 
          !seriesEvents.some(se => se.id === e.id)
        )
      }))
    } else {
      // Delete single event
      set(state => ({
        events: state.events.filter(e => e.id !== eventId)
      }))
    }
  },

  // Recurring Events
  createRecurringEventSeries: (baseEvent) => {
    if (!baseEvent.recurring) return

    const { frequency, interval, endDate, count, daysOfWeek, monthlyPattern } = baseEvent.recurring
    const series = []
    let currentDate = new Date(baseEvent.start)
    let eventCount = 0
    const maxEvents = count || 365 // Limit to prevent infinite loops
    const seriesEndDate = endDate ? new Date(endDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)

    while (eventCount < maxEvents && currentDate <= seriesEndDate) {
      if (eventCount > 0) { // Skip the first one as it's already created
        const eventDuration = baseEvent.end.getTime() - baseEvent.start.getTime()
        const newEvent = {
          ...baseEvent,
          id: Date.now() + eventCount,
          start: new Date(currentDate),
          end: new Date(currentDate.getTime() + eventDuration),
          parentEventId: baseEvent.id,
          recurring: { ...baseEvent.recurring, isInstance: true }
        }
        series.push(newEvent)
      }

      // Calculate next occurrence
      currentDate = get().calculateNextOccurrence(currentDate, frequency, interval, daysOfWeek, monthlyPattern)
      eventCount++
    }

    if (series.length > 0) {
      set(state => ({
        events: [...state.events, ...series],
        recurringEvents: [...state.recurringEvents, {
          id: baseEvent.id,
          baseEvent,
          seriesCount: series.length + 1,
          createdAt: new Date().toISOString()
        }]
      }))
    }
  },

  calculateNextOccurrence: (currentDate, frequency, interval = 1, daysOfWeek = [], monthlyPattern = null) => {
    const nextDate = new Date(currentDate)

    switch (frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + interval)
        break

      case 'weekly':
        if (daysOfWeek && daysOfWeek.length > 0) {
          // Find next occurrence based on days of week
          const currentDay = nextDate.getDay()
          const sortedDays = [...daysOfWeek].sort((a, b) => a - b)
          
          let nextDay = sortedDays.find(day => day > currentDay)
          if (nextDay === undefined) {
            // Next occurrence is next week
            nextDay = sortedDays[0]
            nextDate.setDate(nextDate.getDate() + (7 - currentDay + nextDay))
          } else {
            nextDate.setDate(nextDate.getDate() + (nextDay - currentDay))
          }
        } else {
          nextDate.setDate(nextDate.getDate() + (7 * interval))
        }
        break

      case 'monthly':
        if (monthlyPattern === 'byDate') {
          nextDate.setMonth(nextDate.getMonth() + interval)
        } else if (monthlyPattern === 'byDay') {
          // Keep same day of week and week of month
          const originalWeekOfMonth = Math.ceil(currentDate.getDate() / 7)
          const originalDayOfWeek = currentDate.getDay()
          
          nextDate.setMonth(nextDate.getMonth() + interval)
          nextDate.setDate(1)
          
          // Find the correct week and day
          while (nextDate.getDay() !== originalDayOfWeek) {
            nextDate.setDate(nextDate.getDate() + 1)
          }
          nextDate.setDate(nextDate.getDate() + ((originalWeekOfMonth - 1) * 7))
        } else {
          nextDate.setMonth(nextDate.getMonth() + interval)
        }
        break

      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + interval)
        break

      default:
        // Unknown frequency, default to daily
        nextDate.setDate(nextDate.getDate() + 1)
    }

    return nextDate
  },

  // Event Templates
  createEventTemplate: (templateData) => {
    const template = {
      id: Date.now(),
      name: templateData.name,
      description: templateData.description || '',
      type: templateData.type,
      category: templateData.category,
      duration: templateData.duration || 60, // minutes
      priority: templateData.priority || 'Medium',
      defaultAssignee: templateData.defaultAssignee || '',
      defaultLocation: templateData.defaultLocation || '',
      defaultReminders: templateData.defaultReminders || [],
      color: templateData.color,
      isPublic: templateData.isPublic || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    set(state => ({
      eventTemplates: [...state.eventTemplates, template]
    }))

    return template
  },

  updateEventTemplate: (templateId, templateData) => {
    set(state => ({
      eventTemplates: state.eventTemplates.map(template =>
        template.id === templateId
          ? { ...template, ...templateData, updatedAt: new Date().toISOString() }
          : template
      )
    }))
  },

  deleteEventTemplate: (templateId) => {
    set(state => ({
      eventTemplates: state.eventTemplates.filter(template => template.id !== templateId)
    }))
  },

  createEventFromTemplate: (templateId, eventData) => {
    const { eventTemplates } = get()
    const template = eventTemplates.find(t => t.id === templateId)
    
    if (!template) {
      throw new Error('Template not found')
    }

    const newEventData = {
      title: eventData.title || template.name,
      description: template.description,
      type: template.type,
      category: template.category,
      priority: template.priority,
      assignedTo: eventData.assignedTo || template.defaultAssignee,
      location: eventData.location || template.defaultLocation,
      reminders: template.defaultReminders,
      color: template.color,
      start: eventData.start,
      end: eventData.end || new Date(new Date(eventData.start).getTime() + template.duration * 60000),
      ...eventData
    }

    return get().createEvent(newEventData)
  },

  // Event Search and Filtering
  searchEvents: (query, filters = {}) => {
    const { events } = get()
    
    return events.filter(event => {
      // Text search
      const matchesQuery = !query || 
        event.title.toLowerCase().includes(query.toLowerCase()) ||
        event.description.toLowerCase().includes(query.toLowerCase()) ||
        event.assetName.toLowerCase().includes(query.toLowerCase())

      // Type filter
      const matchesType = !filters.type || event.type === filters.type

      // Category filter
      const matchesCategory = !filters.category || event.category === filters.category

      // Asset filter
      const matchesAsset = !filters.assetId || event.assetId === filters.assetId

      // Status filter
      const matchesStatus = !filters.status || event.status === filters.status

      // Priority filter
      const matchesPriority = !filters.priority || event.priority === filters.priority

      // Date range filter
      const matchesDateRange = !filters.startDate || !filters.endDate ||
        (event.start >= new Date(filters.startDate) && event.start <= new Date(filters.endDate))

      return matchesQuery && matchesType && matchesCategory && matchesAsset && 
             matchesStatus && matchesPriority && matchesDateRange
    })
  },

  // Event Statistics
  getEventStats: () => {
    const { events } = get()
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
    const thisWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    return {
      total: events.length,
      today: events.filter(e => {
        const eventDate = new Date(e.start)
        const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())
        return eventDay.getTime() === today.getTime()
      }).length,
      tomorrow: events.filter(e => {
        const eventDate = new Date(e.start)
        const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())
        return eventDay.getTime() === tomorrow.getTime()
      }).length,
      thisWeek: events.filter(e => {
        const eventDate = new Date(e.start)
        return eventDate >= today && eventDate <= thisWeek
      }).length,
      overdue: events.filter(e => {
        return new Date(e.start) < now && e.status !== 'Completed'
      }).length,
      byStatus: {
        scheduled: events.filter(e => e.status === 'Scheduled').length,
        inProgress: events.filter(e => e.status === 'In Progress').length,
        completed: events.filter(e => e.status === 'Completed').length,
        cancelled: events.filter(e => e.status === 'Cancelled').length
      },
      byType: events.reduce((acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1
        return acc
      }, {}),
      byPriority: {
        high: events.filter(e => e.priority === 'High').length,
        medium: events.filter(e => e.priority === 'Medium').length,
        low: events.filter(e => e.priority === 'Low').length
      }
    }
  },

  // Event Reminders
  createReminder: (eventId, reminderData) => {
    const reminder = {
      id: Date.now(),
      eventId,
      type: reminderData.type || 'email', // email, sms, popup, push
      timing: reminderData.timing || 15, // minutes before event
      message: reminderData.message || '',
      isActive: true,
      createdAt: new Date().toISOString()
    }

    set(state => ({
      events: state.events.map(event =>
        event.id === eventId
          ? { ...event, reminders: [...(event.reminders || []), reminder] }
          : event
      )
    }))

    return reminder
  },

  updateReminder: (eventId, reminderId, reminderData) => {
    set(state => ({
      events: state.events.map(event =>
        event.id === eventId
          ? {
              ...event,
              reminders: event.reminders?.map(reminder =>
                reminder.id === reminderId
                  ? { ...reminder, ...reminderData }
                  : reminder
              ) || []
            }
          : event
      )
    }))
  },

  deleteReminder: (eventId, reminderId) => {
    set(state => ({
      events: state.events.map(event =>
        event.id === eventId
          ? {
              ...event,
              reminders: event.reminders?.filter(reminder => reminder.id !== reminderId) || []
            }
          : event
      )
    }))
  },

  // Event Import/Export
  exportEvents: (format = 'ics', filters = {}) => {
    const filteredEvents = get().searchEvents('', filters)
    
    if (format === 'ics') {
      return get().generateICSCalendar(filteredEvents)
    } else if (format === 'json') {
      return JSON.stringify(filteredEvents, null, 2)
    } else if (format === 'csv') {
      return get().generateCSVData(filteredEvents)
    }
    
    throw new Error(`Unsupported export format: ${format}`)
  },

  generateICSCalendar: (events) => {
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Asset Tracker//Calendar//EN',
      'CALSCALE:GREGORIAN'
    ]

    events.forEach(event => {
      const startDate = new Date(event.start).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
      const endDate = new Date(event.end).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
      
      icsContent.push(
        'BEGIN:VEVENT',
        `UID:${event.id}@assettracker.com`,
        `DTSTART:${startDate}`,
        `DTEND:${endDate}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.description}`,
        `LOCATION:${event.location}`,
        `STATUS:${event.status.toUpperCase()}`,
        `PRIORITY:${event.priority === 'High' ? '1' : event.priority === 'Medium' ? '5' : '9'}`,
        'END:VEVENT'
      )
    })

    icsContent.push('END:VCALENDAR')
    return icsContent.join('\r\n')
  },

  generateCSVData: (events) => {
    const headers = ['Title', 'Description', 'Start', 'End', 'Type', 'Status', 'Priority', 'Asset', 'Assigned To', 'Location']
    const csvRows = [headers.join(',')]
    
    events.forEach(event => {
      const row = [
        `"${event.title}"`,
        `"${event.description}"`,
        `"${event.start.toISOString()}"`,
        `"${event.end.toISOString()}"`,
        `"${event.type}"`,
        `"${event.status}"`,
        `"${event.priority}"`,
        `"${event.assetName}"`,
        `"${event.assignedTo}"`,
        `"${event.location}"`
      ]
      csvRows.push(row.join(','))
    })
    
    return csvRows.join('\n')
  },

  // Asset Inspection Integration
  generateAssetInspectionSchedule: (assetId, options = {}) => {
    const assets = useAssetStore.getState().assets
    const asset = assets.find(a => a.id === assetId)
    
    if (!asset) {
      throw new Error('Asset not found')
    }
    
    const schedule = assetInspectionService.calculateInspectionSchedule(asset, options.startDate)
    const events = assetInspectionService.createInspectionCalendarEvents(schedule)
    
    // Store the schedule
    const { inspectionSchedules } = get()
    inspectionSchedules.set(assetId, {
      schedule,
      generatedAt: new Date().toISOString(),
      options
    })
    
    // Add to inspection events
    set(state => ({
      inspectionEvents: [...state.inspectionEvents, ...events],
      inspectionSchedules
    }))
    
    return { schedule, events }
  },

  generateAllAssetsInspectionSchedule: (options = {}) => {
    const assets = useAssetStore.getState().assets
    const result = assetInspectionService.scheduleAssetsInspections(assets, options)
    
    // Store all schedules
    const { inspectionSchedules } = get()
    assets.forEach(asset => {
      const assetSchedule = result.schedules.filter(s => s.assetId === asset.id)
      inspectionSchedules.set(asset.id, {
        schedule: assetSchedule,
        generatedAt: new Date().toISOString(),
        options
      })
    })
    
    set(state => ({
      inspectionEvents: [...state.inspectionEvents, ...result.events],
      inspectionSchedules
    }))
    
    return result
  },

  updateAssetInspectionSchedule: (assetId, scheduleConfig) => {
    const assets = useAssetStore.getState().assets
    const asset = assets.find(a => a.id === assetId)
    
    if (!asset) {
      throw new Error('Asset not found')
    }
    
    // Update asset with new inspection config
    const { updateAssetInspectionConfig } = useAssetStore.getState()
    updateAssetInspectionConfig(assetId, scheduleConfig)
    
    // Regenerate schedule
    const updatedAsset = { ...asset, inspectionSchedule: scheduleConfig }
    const schedule = assetInspectionService.calculateInspectionSchedule(updatedAsset)
    const events = assetInspectionService.createInspectionCalendarEvents(schedule)
    
    // Update stored schedule and events
    const { inspectionSchedules, inspectionEvents } = get()
    inspectionSchedules.set(assetId, {
      schedule,
      generatedAt: new Date().toISOString(),
      config: scheduleConfig
    })
    
    // Remove old inspection events for this asset and add new ones
    const filteredEvents = inspectionEvents.filter(e => e.assetId !== assetId)
    
    set({
      inspectionEvents: [...filteredEvents, ...events],
      inspectionSchedules
    })
    
    return { schedule, events }
  },

  completeInspectionEvent: (eventId, completionData) => {
    const { inspectionEvents } = get()
    const event = inspectionEvents.find(e => e.id === eventId)
    
    if (!event || !event.inspectionData) {
      throw new Error('Inspection event not found')
    }
    
    // Complete the inspection
    const { completeAssetInspection } = useAssetStore.getState()
    const completion = completeAssetInspection(
      event.assetId,
      event.inspectionData.inspectionId || eventId,
      completionData
    )
    
    // Update event status
    set(state => ({
      inspectionEvents: state.inspectionEvents.map(e =>
        e.id === eventId
          ? { ...e, status: 'Completed', completionData }
          : e
      )
    }))
    
    return completion
  },

  getAssetInspectionEvents: (assetId) => {
    const { inspectionEvents } = get()
    return inspectionEvents.filter(e => e.assetId === assetId)
  },

  getUpcomingInspections: (daysAhead = 30) => {
    const { inspectionEvents } = get()
    const cutoffDate = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000)
    const today = new Date()
    
    return inspectionEvents.filter(event => {
      const eventDate = new Date(event.start)
      return eventDate >= today && eventDate <= cutoffDate && event.status !== 'Completed'
    }).sort((a, b) => new Date(a.start) - new Date(b.start))
  },

  getOverdueInspections: () => {
    const { inspectionEvents } = get()
    const today = new Date()
    
    return inspectionEvents.filter(event => {
      const eventDate = new Date(event.start)
      return eventDate < today && event.status !== 'Completed'
    }).sort((a, b) => new Date(a.start) - new Date(b.start))
  },

  getInspectionAnalytics: (assetIds = [], dateRange = {}) => {
    const { inspectionEvents } = get()
    let filteredEvents = inspectionEvents
    
    if (assetIds.length > 0) {
      filteredEvents = filteredEvents.filter(e => assetIds.includes(e.assetId))
    }
    
    if (dateRange.startDate || dateRange.endDate) {
      filteredEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.start)
        if (dateRange.startDate && eventDate < new Date(dateRange.startDate)) return false
        if (dateRange.endDate && eventDate > new Date(dateRange.endDate)) return false
        return true
      })
    }
    
    const completed = filteredEvents.filter(e => e.status === 'Completed')
    const overdue = filteredEvents.filter(e => {
      const eventDate = new Date(e.start)
      return eventDate < new Date() && e.status !== 'Completed'
    })
    
    return {
      total: filteredEvents.length,
      completed: completed.length,
      pending: filteredEvents.length - completed.length - overdue.length,
      overdue: overdue.length,
      completionRate: filteredEvents.length > 0 ? (completed.length / filteredEvents.length) * 100 : 0,
      byType: filteredEvents.reduce((acc, event) => {
        const type = event.inspectionData?.inspectionType || 'Unknown'
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {}),
      byAsset: filteredEvents.reduce((acc, event) => {
        acc[event.assetName] = (acc[event.assetName] || 0) + 1
        return acc
      }, {})
    }
  },

  // Default event templates
  getDefaultTemplates: () => [
    {
      id: 'template_inspection',
      name: 'Property Inspection',
      description: 'Standard property inspection appointment',
      type: 'Inspection',
      category: 'maintenance',
      duration: 120,
      priority: 'High',
      color: '#3b82f6',
      defaultReminders: [
        { type: 'email', timing: 1440 }, // 1 day before
        { type: 'popup', timing: 60 }    // 1 hour before
      ]
    },
    {
      id: 'template_maintenance',
      name: 'Maintenance Work',
      description: 'Scheduled maintenance work',
      type: 'Maintenance',
      category: 'maintenance',
      duration: 180,
      priority: 'Medium',
      color: '#f59e0b',
      defaultReminders: [
        { type: 'email', timing: 720 },  // 12 hours before
        { type: 'popup', timing: 30 }    // 30 minutes before
      ]
    },
    {
      id: 'template_meeting',
      name: 'Client Meeting',
      description: 'Meeting with property owner or tenant',
      type: 'Meeting',
      category: 'business',
      duration: 60,
      priority: 'Medium',
      color: '#8b5cf6',
      defaultReminders: [
        { type: 'email', timing: 60 },   // 1 hour before
        { type: 'popup', timing: 15 }    // 15 minutes before
      ]
    },
    {
      id: 'template_emergency',
      name: 'Emergency Response',
      description: 'Emergency repair or response',
      type: 'Emergency',
      category: 'urgent',
      duration: 240,
      priority: 'High',
      color: '#ef4444',
      defaultReminders: [
        { type: 'popup', timing: 5 }     // 5 minutes before
      ]
    }
  ]
}))

// Helper function to get event color based on priority and status
const getEventColor = (priority, status) => {
  if (status === 'Completed') return '#10b981' // green
  if (status === 'Overdue') return '#ef4444' // red
  
  switch (priority) {
    case 'High': return '#f59e0b' // amber
    case 'Medium': return '#3b82f6' // blue
    case 'Low': return '#6b7280' // gray
    default: return '#6b7280'
  }
}