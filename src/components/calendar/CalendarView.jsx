import { useState, useEffect } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  List,
  User,
  MapPin,
  Table,
  Plus
} from 'lucide-react'
import { useCalendarStore } from '../../stores/calendarStore'

const CalendarView = ({ 
  selectedDate = new Date(),
  onDateChange,
  onEventClick,
  onAddEvent
}) => {
  const { getCalendarEvents } = useCalendarStore()
  
  const [currentDate, setCurrentDate] = useState(selectedDate)
  const [calendarView, setCalendarView] = useState('Calendar') // Calendar, Table, List
  const [timeFilter, setTimeFilter] = useState('Due') // Due, Day, Week, Month

  useEffect(() => {
    setCurrentDate(selectedDate)
  }, [selectedDate])

  // Update sidebar when calendar month changes
  useEffect(() => {
    // Force re-render of sidebar when currentDate or timeFilter changes
    // This ensures the sidebar shows events for the currently displayed month
  }, [currentDate, timeFilter])

  // Get events filtered by current date and time filter
  const getFilteredEventsByTime = () => {
    const calendarEvents = getCalendarEvents()
    
    // Convert calendar events to the format expected by the sidebar
    const formattedEvents = calendarEvents.map(event => {
      const eventDate = new Date(event.start)
      return {
        id: event.id,
        title: event.title || event.description || 'Untitled Event',
        date: eventDate.getDate(),
        month: eventDate.getMonth(),
        year: eventDate.getFullYear(),
        status: event.status || 'Pending',
        type: event.type || event.taskType || 'Task',
        location: event.assetName || 'No location specified',
        avatar: '/api/placeholder/32/32',
        priority: event.priority,
        assignedTo: event.assignedTo,
        originalEvent: event,
        fullDate: eventDate
      }
    })

    // Generate mock events for the current displayed month for demonstration
    const generateMockEventsForMonth = (targetMonth, targetYear) => {
      const mockEvents = []
      const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate()
      
      // Generate sample events across the month
      const sampleEvents = [
        { day: 4, status: 'Pending', type: 'Inspection', title: 'Property inspection for building safety compliance', priority: 'High' },
        { day: 8, status: 'Maintenance Overdue', type: 'Maintenance', title: 'Overdue maintenance work on HVAC system requires attention', priority: 'High' },
        { day: 13, status: 'Pending', type: 'Maintenance', title: 'Routine maintenance check for electrical systems', priority: 'Medium' },
        { day: 16, status: 'Maintenance Overdue', type: 'Maintenance', title: 'Plumbing maintenance work overdue - urgent repair needed', priority: 'High' },
        { day: 18, status: 'Inspected', type: 'Inspection', title: 'Completed annual safety inspection with certificates', priority: 'Medium' },
        { day: 22, status: 'Maintenance Overdue', type: 'Maintenance', title: 'Fire safety system maintenance overdue - schedule immediately', priority: 'High' },
        { day: 27, status: 'Inspected', type: 'Inspection', title: 'Building structural inspection completed successfully', priority: 'Low' },
        { day: 29, status: 'Pending', type: 'Inspection', title: 'Final inspection before tenant move-in process', priority: 'Medium' }
      ]

      sampleEvents.forEach(sample => {
        if (sample.day <= daysInMonth) {
          mockEvents.push({
            id: `mock-${targetMonth}-${sample.day}`,
            title: sample.title,
            date: sample.day,
            month: targetMonth,
            year: targetYear,
            status: sample.status,
            type: sample.type,
            priority: sample.priority,
            location: 'Oxford Street, Lebanon',
            avatar: '/api/placeholder/32/32',
            fullDate: new Date(targetYear, targetMonth, sample.day)
          })
        }
      })

      return mockEvents
    }

    // If no real events exist, generate mock events for current month
    let allEvents = formattedEvents
    if (formattedEvents.length === 0) {
      allEvents = generateMockEventsForMonth(currentDate.getMonth(), currentDate.getFullYear())
    }

    // Filter events based on time filter
    let filteredEvents = allEvents

    switch (timeFilter) {
      case 'Due':
        // Show overdue and due today/tomorrow
        filteredEvents = allEvents.filter(event => {
          const eventDate = event.fullDate
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const tomorrow = new Date(today)
          tomorrow.setDate(tomorrow.getDate() + 1)
          
          return event.status === 'Maintenance Overdue' || 
                 (eventDate >= today && eventDate <= tomorrow)
        })
        break
        
      case 'Day':
        // Show events for current day
        filteredEvents = allEvents.filter(event => {
          const eventDate = event.fullDate
          const today = new Date()
          return eventDate.toDateString() === today.toDateString()
        })
        break
        
      case 'Week':
        // Show events for current week
        filteredEvents = allEvents.filter(event => {
          const eventDate = event.fullDate
          const today = new Date()
          const weekStart = new Date(today)
          weekStart.setDate(today.getDate() - today.getDay())
          weekStart.setHours(0, 0, 0, 0)
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekStart.getDate() + 6)
          weekEnd.setHours(23, 59, 59, 999)
          
          return eventDate >= weekStart && eventDate <= weekEnd
        })
        break
        
      case 'Month':
        // Show events for currently displayed month
        filteredEvents = allEvents.filter(event => {
          return event.month === currentDate.getMonth() && 
                 event.year === currentDate.getFullYear()
        })
        break
    }

    // Sort events by date
    return filteredEvents.sort((a, b) => a.fullDate - b.fullDate)
  }

  const getStatusColor = (status, priority = 'Medium') => {
    // First check for status-based colors (matching the legend)
    if (status === 'Completed' || status === 'Inspected') {
      return 'bg-green-500' // Completed - Green
    }
    if (status === 'Overdue' || status === 'Maintenance Overdue') {
      return 'bg-red-500' // Overdue - Red
    }
    
    // Then use priority-based colors for pending/active tasks
    switch (priority) {
      case 'High':
        return 'bg-amber-500' // High Priority - Amber
      case 'Medium':
        return 'bg-blue-500' // Medium Priority - Blue  
      case 'Low':
        return 'bg-gray-500' // Low Priority - Gray
      default:
        return 'bg-blue-500' // Default to Medium Priority
    }
  }

  const getStatusBarColor = (status, priority = 'Medium') => {
    // First check for status-based colors (matching the legend)
    if (status === 'Completed' || status === 'Inspected') {
      return 'border-l-green-500' // Completed - Green
    }
    if (status === 'Overdue' || status === 'Maintenance Overdue') {
      return 'border-l-red-500' // Overdue - Red
    }
    
    // Then use priority-based colors for pending/active tasks
    switch (priority) {
      case 'High':
        return 'border-l-amber-500' // High Priority - Amber
      case 'Medium':
        return 'border-l-blue-500' // Medium Priority - Blue
      case 'Low':
        return 'border-l-gray-500' // Low Priority - Gray
      default:
        return 'border-l-blue-500' // Default to Medium Priority
    }
  }

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + direction)
    setCurrentDate(newDate)
    onDateChange?.(newDate)
  }

  const renderTopNavigation = () => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex items-center justify-between">
          {/* Left side - View tabs */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCalendarView('Calendar')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                calendarView === 'Calendar'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Calendar</span>
            </button>
            <button
              onClick={() => setCalendarView('Table')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                calendarView === 'Table'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Table className="w-4 h-4" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setCalendarView('List')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                calendarView === 'List'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <List className="w-4 h-4" />
              <span>List</span>
            </button>
          </div>

          {/* Right side - Time filters and Add Event */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setTimeFilter('Due')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                timeFilter === 'Due'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Due
            </button>
            <button
              onClick={() => setTimeFilter('Day')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                timeFilter === 'Day'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setTimeFilter('Week')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                timeFilter === 'Week'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeFilter('Month')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                timeFilter === 'Month'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Month
            </button>
            
            {/* Add Event Button */}
            <div className="ml-4 pl-4 border-l border-gray-200 dark:border-gray-600">
              <button
                onClick={() => onAddEvent?.(currentDate)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Event</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderSidebar = () => {
    const events = getFilteredEventsByTime()

    const getSidebarTitle = () => {
      switch (timeFilter) {
        case 'Due':
          return 'Due & Overdue Tasks'
        case 'Day':
          return 'Today\'s Tasks'
        case 'Week':
          return 'This Week\'s Tasks'
        case 'Month':
          return `${currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Tasks`
        default:
          return 'Tasks'
      }
    }

    return (
      <div className="w-80 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Sidebar Header */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                {getSidebarTitle()}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {events.length} {events.length === 1 ? 'task' : 'tasks'} found
              </p>
            </div>
            <button
              onClick={() => onAddEvent?.(currentDate)}
              className="flex items-center justify-center w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              title="Add Event"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="h-full overflow-y-auto">
          {events.length > 0 ? events.map((event) => (
            <div
              key={event.id}
              className={`p-4 border-l-4 ${getStatusBarColor(event.status, event.priority)} border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors`}
              onClick={() => onEventClick?.(event)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {String(event.date).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                    {new Date(event.year, event.month, event.date).toLocaleDateString('en-US', { month: 'short' })}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {event.year}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`inline-block px-2 py-1 text-xs font-medium text-white rounded ${getStatusColor(event.status, event.priority)}`}>
                      {event.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">
                    {event.title}
                  </p>
                  
                  <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                    <MapPin className="w-3 h-3" />
                    <span>{event.location}</span>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="p-6 text-center">
              <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">No tasks found</p>
              <p className="text-xs text-gray-400 mb-4">
                Try selecting a different time filter
              </p>
              <button
                onClick={() => onAddEvent?.(currentDate)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Event</span>
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderCalendarGrid = () => {
    // Use current date for dynamic calendar navigation
    const displayDate = currentDate
    const firstDay = new Date(displayDate.getFullYear(), displayDate.getMonth(), 1)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const currentDateForLoop = new Date(startDate)
    const events = getFilteredEventsByTime()
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(currentDateForLoop)
      const dayEvents = events.filter(event => 
        event.date === date.getDate() && 
        event.month === date.getMonth() && 
        event.year === date.getFullYear()
      )
      const isCurrentMonth = date.getMonth() === displayDate.getMonth()
      const isToday = date.toDateString() === new Date().toDateString()
      
      days.push(
        <div
          key={i}
          className={`min-h-[120px] p-2 border-r border-b border-gray-200 dark:border-gray-700 transition-all cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
            isCurrentMonth 
              ? 'bg-white dark:bg-gray-800' 
              : 'bg-gray-50 dark:bg-gray-900'
          } ${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
          onClick={() => onDateChange?.(date)}
          onDoubleClick={() => onAddEvent?.(date)}
          title="Double-click to add event"
        >
          <div className={`text-sm font-medium mb-2 ${
            isCurrentMonth 
              ? 'text-gray-900 dark:text-white' 
              : 'text-gray-400 dark:text-gray-600'
          } ${isToday ? 'text-blue-600 dark:text-blue-400' : ''}`}>
            {date.getDate()}
          </div>
          
          <div className="space-y-1">
            {dayEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center space-x-1 cursor-pointer hover:opacity-80"
                onClick={(e) => {
                  e.stopPropagation()
                  onEventClick?.(event.originalEvent || event)
                }}
              >
                <div className={`w-1 h-4 ${getStatusColor(event.status, event.priority)} rounded-full flex-shrink-0`}></div>
                <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )
      
      currentDateForLoop.setDate(currentDateForLoop.getDate() + 1)
    }

    return (
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Calendar Header */}
        <div className="bg-blue-500 text-white p-4 flex items-center justify-between">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-1 hover:bg-blue-600 rounded transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h2 className="text-xl font-bold">
            {displayDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}
          </h2>
          
          <button
            onClick={() => navigateMonth(1)}
            className="p-1 hover:bg-blue-600 rounded transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="bg-gray-100 dark:bg-gray-700 p-3 text-center text-sm font-medium text-gray-900 dark:text-white border-r border-b border-gray-200 dark:border-gray-600 last:border-r-0">
              {day}
            </div>
          ))}
          {days}
        </div>
      </div>
    )
  }

  const renderTableView = () => {
    const events = getFilteredEventsByTime()

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Tasks Table - {timeFilter} View
            </h3>
          </div>
          <button
            onClick={() => onAddEvent?.(currentDate)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div className="flex flex-col">
                      <span className="font-medium">{String(event.date).padStart(2, '0')}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(event.year, event.month, event.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(event.status, event.priority)} text-white`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {event.type}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs">
                    <div className="line-clamp-2">{event.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {event.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <button
                      onClick={() => onEventClick?.(event.originalEvent || event)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {events.length === 0 && (
            <div className="text-center py-12">
              <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">No events found for the selected time period</p>
              <button
                onClick={() => onAddEvent?.(currentDate)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Event</span>
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderListView = () => {
    const events = getFilteredEventsByTime()

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Tasks List - {timeFilter} View
            </h3>
          </div>
          <button
            onClick={() => onAddEvent?.(currentDate)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {events.map((event) => (
            <div
              key={event.id}
              className={`p-6 border-l-4 ${getStatusBarColor(event.status, event.priority)} hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors`}
              onClick={() => onEventClick?.(event.originalEvent || event)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {String(event.date).padStart(2, '0')}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase text-center">
                      {new Date(event.year, event.month, event.date).toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      {event.year}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`inline-block px-3 py-1 text-xs font-medium text-white rounded-full ${getStatusColor(event.status, event.priority)}`}>
                        {event.status}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {event.type}
                      </span>
                    </div>
                    
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {event.title}
                    </h4>
                    
                    <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {events.length === 0 && (
            <div className="text-center py-12">
              <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">No events found for the selected time period</p>
              <p className="text-sm text-gray-400 mb-4">Try selecting a different time filter or add new events</p>
              <button
                onClick={() => onAddEvent?.(currentDate)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Event</span>
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderMainContent = () => {
    if (calendarView === 'Calendar') {
      return (
        <div className="flex space-x-6">
          {renderSidebar()}
          {renderCalendarGrid()}
        </div>
      )
    } else if (calendarView === 'Table') {
      return renderTableView()
    } else {
      return renderListView()
    }
  }

  return (
    <div className="space-y-6">
      {renderTopNavigation()}
      {renderMainContent()}
    </div>
  )
}

export default CalendarView