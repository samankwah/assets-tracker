import { useCalendarStore } from '../../stores/calendarStore'

const DayView = ({ currentDate, onEventClick }) => {
  const { getEventsForDate } = useCalendarStore()
  
  const events = getEventsForDate(currentDate)
  const timeSlots = Array.from({ length: 24 }, (_, i) => i)
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const isToday = () => {
    const compareDate = new Date(currentDate)
    compareDate.setHours(0, 0, 0, 0)
    return compareDate.getTime() === today.getTime()
  }
  
  const formatTime = (hour) => {
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:00 ${ampm}`
  }
  
  const getEventPosition = (event) => {
    const eventDate = new Date(event.start)
    const hour = eventDate.getHours()
    const minutes = eventDate.getMinutes()
    
    return {
      top: `${(hour * 60 + minutes) * (80 / 60)}px`, // 80px per hour in day view
      height: '60px' // Default 1-hour duration
    }
  }
  
  const getCurrentTimePosition = () => {
    if (!isToday()) return null
    
    const now = new Date()
    const hour = now.getHours()
    const minutes = now.getMinutes()
    
    return `${(hour * 60 + minutes) * (80 / 60)}px`
  }

  const currentTimePosition = getCurrentTimePosition()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card overflow-hidden">
      {/* Day Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {events.length} event{events.length !== 1 ? 's' : ''} scheduled
            </p>
          </div>
          {isToday() && (
            <span className="badge badge-success">Today</span>
          )}
        </div>
      </div>
      
      {/* Time Grid */}
      <div className="relative">
        <div className="grid grid-cols-[80px_1fr] min-h-[1920px]"> {/* 24 hours * 80px */}
          {/* Time Column */}
          <div className="border-r border-gray-200 dark:border-gray-700">
            {timeSlots.map((hour) => (
              <div key={hour} className="h-[80px] px-2 py-1 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                {formatTime(hour)}
              </div>
            ))}
          </div>
          
          {/* Day Column */}
          <div className="relative">
            {/* Hour Grid Lines */}
            {timeSlots.map((hour) => (
              <div
                key={hour}
                className="h-[80px] border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              />
            ))}
            
            {/* Current Time Line */}
            {currentTimePosition && (
              <div
                className="absolute left-0 right-0 h-0.5 bg-red-500 z-20"
                style={{ top: currentTimePosition }}
              >
                <div className="absolute -left-2 -top-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-gray-800" />
              </div>
            )}
            
            {/* Events */}
            {events.map((event) => {
              const position = getEventPosition(event)
              
              return (
                <div
                  key={event.id}
                  className={`absolute left-2 right-2 p-3 rounded-lg cursor-pointer z-10 shadow-sm border-l-4 ${
                    event.status === 'Completed' ? 'bg-green-50 border-green-500 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    event.status === 'Overdue' ? 'bg-red-50 border-red-500 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    event.priority === 'High' ? 'bg-amber-50 border-amber-500 text-amber-800 dark:bg-amber-900 dark:text-amber-200' :
                    event.priority === 'Medium' ? 'bg-blue-50 border-blue-500 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    'bg-gray-50 border-gray-500 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                  }`}
                  style={position}
                  onClick={() => onEventClick(event)}
                >
                  <div className="font-medium mb-1">{event.title}</div>
                  <div className="text-sm opacity-80 mb-1">{event.assetName}</div>
                  <div className="text-xs opacity-70">
                    {event.assignedTo} • {event.taskType}
                  </div>
                  <div className="text-xs opacity-70 mt-1">
                    {new Date(event.start).toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DayView