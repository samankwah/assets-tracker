import { useCalendarStore } from '../../stores/calendarStore'

const WeekView = ({ currentDate, onDateClick, onEventClick }) => {
  const { getWeekDays, getEventsForDate } = useCalendarStore()
  
  const weekDays = getWeekDays(currentDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const timeSlots = Array.from({ length: 24 }, (_, i) => i)
  
  const isToday = (date) => {
    const compareDate = new Date(date)
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
      top: `${(hour * 60 + minutes) * (60 / 60)}px`, // 60px per hour
      height: '50px' // Default 1-hour duration
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card overflow-hidden">
      {/* Week Header */}
      <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700">
        <div className="p-4 bg-gray-50 dark:bg-gray-900">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Time</span>
        </div>
        {weekDays.map((date, index) => {
          const isTodayDate = isToday(date)
          const events = getEventsForDate(date)
          
          return (
            <div
              key={index}
              className={`p-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                isTodayDate ? 'bg-secondary-50 dark:bg-secondary-900' : ''
              }`}
              onClick={() => onDateClick(date)}
            >
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {dayNames[date.getDay()]}
              </div>
              <div className={`text-lg font-semibold mt-1 ${
                isTodayDate 
                  ? 'bg-secondary-500 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto' 
                  : 'text-gray-900 dark:text-white'
              }`}>
                {date.getDate()}
              </div>
              {events.length > 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {events.length} event{events.length > 1 ? 's' : ''}
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      {/* Time Grid */}
      <div className="relative">
        <div className="grid grid-cols-8 min-h-[1440px]"> {/* 24 hours * 60px */}
          {/* Time Column */}
          <div className="border-r border-gray-200 dark:border-gray-700">
            {timeSlots.map((hour) => (
              <div key={hour} className="h-[60px] px-2 py-1 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                {formatTime(hour)}
              </div>
            ))}
          </div>
          
          {/* Day Columns */}
          {weekDays.map((date, dayIndex) => {
            const events = getEventsForDate(date)
            
            return (
              <div
                key={dayIndex}
                className="relative border-r border-gray-200 dark:border-gray-700"
              >
                {/* Hour Grid Lines */}
                {timeSlots.map((hour) => (
                  <div
                    key={hour}
                    className="h-[60px] border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => onDateClick(date)}
                  />
                ))}
                
                {/* Events */}
                {events.map((event) => {
                  const position = getEventPosition(event)
                  
                  return (
                    <div
                      key={event.id}
                      className={`absolute left-1 right-1 p-1 rounded text-xs cursor-pointer z-10 ${
                        event.status === 'Completed' ? 'bg-green-500 text-white' :
                        event.status === 'Overdue' ? 'bg-red-500 text-white' :
                        event.priority === 'High' ? 'bg-amber-500 text-white' :
                        event.priority === 'Medium' ? 'bg-blue-500 text-white' :
                        'bg-gray-500 text-white'
                      }`}
                      style={position}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick(event)
                      }}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="text-xs opacity-90 truncate">{event.assetName}</div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default WeekView