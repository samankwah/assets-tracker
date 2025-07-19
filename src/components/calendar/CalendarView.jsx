import { useState, useEffect } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Plus,
  Filter,
  Grid,
  List,
  Clock,
  AlertCircle,
  CheckCircle,
  User,
  Building
} from 'lucide-react'
import { useTaskStore } from '../../stores/taskStore'
import { useAssetStore } from '../../stores/assetStore'
import { useCalendarStore } from '../../stores/calendarStore'
import { toast } from 'react-hot-toast'

const CalendarView = ({ 
  viewMode = 'month', 
  onViewModeChange,
  selectedDate = new Date(),
  onDateChange,
  onEventClick,
  onAddEvent,
  showFilters = false
}) => {
  const { tasks, getFilteredTasks, updateTask } = useTaskStore()
  const { assets } = useAssetStore()
  const { getCalendarEvents, updateEvent } = useCalendarStore()
  
  const [currentDate, setCurrentDate] = useState(selectedDate)
  const [draggedEvent, setDraggedEvent] = useState(null)
  const [filterType, setFilterType] = useState('all')
  const [filterAsset, setFilterAsset] = useState('')
  const [draggedOverDate, setDraggedOverDate] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showDragPreview, setShowDragPreview] = useState(false)

  useEffect(() => {
    setCurrentDate(selectedDate)
  }, [selectedDate])

  const getEventsForDate = (date) => {
    const allEvents = getCalendarEvents()
    return allEvents.filter(event => {
      const eventDate = new Date(event.start)
      return eventDate.toDateString() === date.toDateString()
    }).filter(event => {
      if (filterType === 'all') return true
      return event.type === filterType || event.taskType === filterType
    }).filter(event => {
      if (!filterAsset) return true
      return event.assetId?.toString() === filterAsset
    })
  }

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + direction)
    setCurrentDate(newDate)
    onDateChange?.(newDate)
  }

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction * 7))
    setCurrentDate(newDate)
    onDateChange?.(newDate)
  }

  const navigateDay = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + direction)
    setCurrentDate(newDate)
    onDateChange?.(newDate)
  }

  const getEventColor = (event) => {
    // Use custom color if available
    if (event.color) {
      return `bg-[${event.color}]`
    }
    
    if (event.status === 'Completed') return 'bg-green-500'
    if (event.status === 'Overdue') return 'bg-red-500'
    
    // Different colors for different event types
    if (event.type === 'Inspection') return 'bg-blue-600'
    if (event.type === 'Maintenance') return 'bg-orange-500'
    if (event.type === 'Meeting') return 'bg-purple-500'
    if (event.type === 'Emergency') return 'bg-red-600'
    
    switch (event.priority) {
      case 'High': return 'bg-red-600'
      case 'Medium': return 'bg-yellow-500'
      case 'Low': return 'bg-green-600'
      default: return 'bg-blue-500'
    }
  }

  const getEventIcon = (task) => {
    if (task.status === 'Completed') return <CheckCircle className="w-3 h-3" />
    if (task.status === 'Overdue') return <AlertCircle className="w-3 h-3" />
    return <Clock className="w-3 h-3" />
  }

  const handleDragStart = (e, event) => {
    setDraggedEvent(event)
    setIsDragging(true)
    setShowDragPreview(true)
    e.dataTransfer.effectAllowed = 'move'
    
    // Create custom drag image
    const dragImage = createDragPreview(event)
    if (dragImage) {
      e.dataTransfer.setDragImage(dragImage, 100, 20)
    }
    
    // Store event data for cross-browser compatibility
    e.dataTransfer.setData('text/plain', JSON.stringify({
      id: event.id,
      title: event.title,
      type: event.type || event.taskType
    }))
  }

  const handleDragOver = (e, targetDate) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    
    if (targetDate) {
      setDraggedOverDate(targetDate.toDateString())
    }
  }

  const handleDragEnter = (e, targetDate) => {
    e.preventDefault()
    if (targetDate && draggedEvent) {
      setDraggedOverDate(targetDate.toDateString())
    }
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    // Only clear if we're leaving the calendar area
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDraggedOverDate(null)
    }
  }

  const handleDrop = async (e, targetDate) => {
    e.preventDefault()
    setDraggedOverDate(null)
    setIsDragging(false)
    setShowDragPreview(false)
    
    if (!draggedEvent || !targetDate) {
      setDraggedEvent(null)
      return
    }

    try {
      const originalDate = new Date(draggedEvent.start || draggedEvent.dueDate)
      const newDate = new Date(targetDate)
      
      // Preserve time from original date
      newDate.setHours(originalDate.getHours())
      newDate.setMinutes(originalDate.getMinutes())
      newDate.setSeconds(originalDate.getSeconds())
      
      // Calculate duration for events with end times
      let newEndDate = null
      if (draggedEvent.end) {
        const duration = new Date(draggedEvent.end).getTime() - originalDate.getTime()
        newEndDate = new Date(newDate.getTime() + duration)
      }

      // Update based on event type
      if (draggedEvent.type === 'task' || draggedEvent.taskType) {
        // Update task
        await updateTask(draggedEvent.id, {
          dueDate: newDate.toISOString(),
          updatedAt: new Date().toISOString()
        })
        
        toast.success(`Task "${draggedEvent.title}" moved to ${newDate.toLocaleDateString()}`)
      } else {
        // Update calendar event
        const updates = {
          start: newDate,
          updatedAt: new Date().toISOString()
        }
        
        if (newEndDate) {
          updates.end = newEndDate
        }
        
        updateEvent(draggedEvent.id, updates)
        
        toast.success(`Event "${draggedEvent.title}" moved to ${newDate.toLocaleDateString()}`)
      }
    } catch (error) {
      console.error('Failed to move event:', error)
      toast.error('Failed to move event')
    }
    
    setDraggedEvent(null)
  }

  const createDragPreview = (event) => {
    try {
      const preview = document.createElement('div')
      preview.className = 'bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium max-w-xs'
      preview.style.position = 'absolute'
      preview.style.top = '-1000px'
      preview.style.pointerEvents = 'none'
      preview.innerHTML = `
        <div class="flex items-center space-x-2">
          <div class="w-2 h-2 bg-white rounded-full"></div>
          <span>${event.title}</span>
        </div>
      `
      
      document.body.appendChild(preview)
      
      // Remove after drag starts
      setTimeout(() => {
        if (document.body.contains(preview)) {
          document.body.removeChild(preview)
        }
      }, 100)
      
      return preview
    } catch (error) {
      console.error('Failed to create drag preview:', error)
      return null
    }
  }

  const handleDragEnd = (e) => {
    setIsDragging(false)
    setDraggedEvent(null)
    setDraggedOverDate(null)
    setShowDragPreview(false)
  }

  const renderMonthView = () => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const currentDateForLoop = new Date(startDate)
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(currentDateForLoop)
      const events = getEventsForDate(date)
      const isCurrentMonth = date.getMonth() === currentDate.getMonth()
      const isToday = date.toDateString() === new Date().toDateString()
      
      days.push(
        <div
          key={i}
          className={`min-h-[120px] p-2 border border-gray-200 dark:border-gray-700 transition-all ${
            isCurrentMonth 
              ? 'bg-white dark:bg-gray-800' 
              : 'bg-gray-50 dark:bg-gray-900'
          } ${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''} ${
            draggedOverDate === date.toDateString() 
              ? 'bg-blue-100 dark:bg-blue-800/30 border-blue-400 dark:border-blue-500' 
              : ''
          }`}
          onDragOver={(e) => handleDragOver(e, date)}
          onDragEnter={(e) => handleDragEnter(e, date)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, date)}
        >
          <div className={`text-sm font-medium mb-2 ${
            isCurrentMonth 
              ? 'text-gray-900 dark:text-white' 
              : 'text-gray-400 dark:text-gray-600'
          } ${isToday ? 'text-blue-600 dark:text-blue-400' : ''}`}>
            {date.getDate()}
          </div>
          <div className="space-y-1">
            {events.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className={`${getEventColor(event)} text-white text-xs p-1 rounded cursor-pointer flex items-center space-x-1 hover:opacity-80 transition-opacity ${
                  draggedEvent?.id === event.id ? 'opacity-50 transform scale-95' : ''
                }`}
                draggable
                onDragStart={(e) => handleDragStart(e, event)}
                onDragEnd={handleDragEnd}
                onClick={() => onEventClick?.(event)}
              >
                {getEventIcon(event)}
                <span className="truncate">{event.title}</span>
              </div>
            ))}
            {events.length > 3 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 pl-1">
                +{events.length - 3} more
              </div>
            )}
          </div>
        </div>
      )
      
      currentDateForLoop.setDate(currentDateForLoop.getDate() + 1)
    }

    return (
      <div className="grid grid-cols-7 gap-0 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="bg-gray-100 dark:bg-gray-700 p-3 text-center text-sm font-medium text-gray-900 dark:text-white">
            {day}
          </div>
        ))}
        {days}
      </div>
    )
  }

  const renderWeekView = () => {
    const weekStart = new Date(currentDate)
    weekStart.setDate(currentDate.getDate() - currentDate.getDay())
    
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      
      const events = getEventsForDate(date)
      const isToday = date.toDateString() === new Date().toDateString()
      
      days.push(
        <div key={i} className="flex-1 min-h-[400px] border-r border-gray-200 dark:border-gray-700 last:border-r-0">
          <div className={`p-3 text-center border-b border-gray-200 dark:border-gray-700 ${
            isToday ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-800'
          }`}>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {date.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div className={`text-lg font-bold ${
              isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
            }`}>
              {date.getDate()}
            </div>
          </div>
          <div 
            className={`p-2 space-y-1 transition-all ${
              draggedOverDate === date.toDateString() 
                ? 'bg-blue-50 dark:bg-blue-800/20' 
                : ''
            }`}
            onDragOver={(e) => handleDragOver(e, date)}
            onDragEnter={(e) => handleDragEnter(e, date)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, date)}
          >
            {events.map((event) => (
              <div
                key={event.id}
                className={`${getEventColor(event)} text-white text-xs p-2 rounded cursor-pointer flex items-center space-x-2 hover:opacity-80 transition-opacity ${
                  draggedEvent?.id === event.id ? 'opacity-50 transform scale-95' : ''
                }`}
                draggable
                onDragStart={(e) => handleDragStart(e, event)}
                onDragEnd={handleDragEnd}
                onClick={() => onEventClick?.(event)}
              >
                {getEventIcon(event)}
                <div className="flex-1 truncate">
                  <div className="font-medium">{event.title}</div>
                  <div className="text-xs opacity-75">{event.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="flex">
          {days}
        </div>
      </div>
    )
  }

  const renderDayView = () => {
    const events = getEventsForDate(currentDate)
    const isToday = currentDate.toDateString() === new Date().toDateString()
    
    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className={`p-4 border-b border-gray-200 dark:border-gray-700 ${
          isToday ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-800'
        }`}>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {currentDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
        <div className="p-4">
          {events.length > 0 ? (
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className={`${getEventColor(event)} text-white p-4 rounded-lg cursor-pointer hover:opacity-90 transition-opacity`}
                  onClick={() => onEventClick?.(event)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getEventIcon(event)}
                        <h3 className="font-medium text-lg">{event.title}</h3>
                      </div>
                      <p className="text-sm opacity-90 mb-2">{event.description}</p>
                      <div className="flex items-center space-x-4 text-sm opacity-75">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Building className="w-3 h-3" />
                          <span>{event.assetName}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{event.assignedTo}</span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className="text-xs px-2 py-1 bg-white bg-opacity-20 rounded">
                        {event.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No events scheduled for this day</p>
              <button
                onClick={() => onAddEvent?.(currentDate)}
                className="mt-4 btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  const getNavigationLabel = () => {
    switch (viewMode) {
      case 'month':
        return currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
      case 'week':
        const weekStart = new Date(currentDate)
        weekStart.setDate(currentDate.getDate() - currentDate.getDay())
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
      case 'day':
        return currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      default:
        return ''
    }
  }

  const navigate = (direction) => {
    switch (viewMode) {
      case 'month':
        navigateMonth(direction)
        break
      case 'week':
        navigateWeek(direction)
        break
      case 'day':
        navigateDay(direction)
        break
    }
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {getNavigationLabel()}
          </h2>
          <button
            onClick={() => navigate(1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              const today = new Date()
              setCurrentDate(today)
              onDateChange?.(today)
            }}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Today
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Mode Buttons */}
          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange?.('month')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'month'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => onViewModeChange?.('week')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'week'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => onViewModeChange?.('day')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'day'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Day
            </button>
          </div>

          <button
            onClick={() => onAddEvent?.(currentDate)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Filters:</span>
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="Inspection">Inspection</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Safety Check">Safety Check</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Meeting">Meeting</option>
              <option value="Emergency">Emergency</option>
            </select>
            <select
              value={filterAsset}
              onChange={(e) => setFilterAsset(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Assets</option>
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name}
                </option>
              ))}
            </select>
            {(filterType !== 'all' || filterAsset) && (
              <button
                onClick={() => {
                  setFilterType('all')
                  setFilterAsset('')
                }}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Calendar Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg">
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
      </div>
    </div>
  )
}

export default CalendarView