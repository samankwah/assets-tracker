import { useCalendarStore } from '../../stores/calendarStore'

const MonthView = ({ currentDate, onDateClick, onEventClick }) => {
  const { getCalendarDays, getEventsForDate } = useCalendarStore()
  
  const days = getCalendarDays(currentDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  const isToday = (date) => {
    const compareDate = new Date(date)
    compareDate.setHours(0, 0, 0, 0)
    return compareDate.getTime() === today.getTime()
  }
  
  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth()
  }
  
  const isPastDate = (date) => {
    const compareDate = new Date(date)
    compareDate.setHours(0, 0, 0, 0)
    return compareDate.getTime() < today.getTime()
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card overflow-hidden">
      {/* Day Headers */}
      <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        {dayNames.map((day) => (
          <div key={day} className="p-3 text-center">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {day}
            </span>
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {days.map((date, index) => {
          const events = getEventsForDate(date)
          const isCurrentMonthDay = isCurrentMonth(date)
          const isTodayDate = isToday(date)
          const isPast = isPastDate(date)
          
          return (
            <div
              key={index}
              className={`min-h-[120px] p-2 border-b border-r border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                !isCurrentMonthDay ? 'bg-gray-50 dark:bg-gray-900' : ''
              }`}
              onClick={() => onDateClick(date)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium ${
                  isTodayDate 
                    ? 'bg-secondary-500 text-white w-6 h-6 rounded-full flex items-center justify-center' 
                    : isCurrentMonthDay 
                      ? 'text-gray-900 dark:text-white' 
                      : 'text-gray-400 dark:text-gray-600'
                }`}>
                  {date.getDate()}
                </span>
                {events.length > 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {events.length}
                  </span>
                )}
              </div>
              
              {/* Events */}
              <div className="space-y-1">
                {events.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className={`text-xs p-1 rounded cursor-pointer truncate ${
                      event.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      event.status === 'Overdue' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      event.priority === 'High' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' :
                      event.priority === 'Medium' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEventClick(event)
                    }}
                  >
                    {event.title}
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
        })}
      </div>
    </div>
  )
}

export default MonthView