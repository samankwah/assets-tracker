import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const MiniCalendar = ({ onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date())

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  const { year, month } = useMemo(() => ({
    year: currentDate.getFullYear(),
    month: currentDate.getMonth()
  }), [currentDate])

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const firstDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const calendarDays = useMemo(() => {
    const days = []
    
    // Previous month days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i)
      days.push({
        date: prevDate.getDate(),
        isCurrentMonth: false,
        fullDate: prevDate
      })
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const fullDate = new Date(year, month, day)
      days.push({
        date: day,
        isCurrentMonth: true,
        fullDate
      })
    }
    
    // Next month days to fill the grid
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day)
      days.push({
        date: day,
        isCurrentMonth: false,
        fullDate: nextDate
      })
    }
    
    return days
  }, [year, month, firstDayOfWeek, daysInMonth])

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  const isToday = (date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const handleDateClick = (dayInfo) => {
    if (onDateSelect) {
      onDateSelect(dayInfo.fullDate)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
        
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          {monthNames[month]} {year}
        </h3>
        
        <button
          onClick={() => navigateMonth(1)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map((day, index) => (
          <div
            key={index}
            className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.slice(0, 42).map((dayInfo, index) => (
          <button
            key={index}
            onClick={() => handleDateClick(dayInfo)}
            className={`
              text-xs p-1 rounded text-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
              ${dayInfo.isCurrentMonth 
                ? 'text-gray-900 dark:text-white' 
                : 'text-gray-400 dark:text-gray-600'
              }
              ${isToday(dayInfo.fullDate) 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : ''
              }
            `}
          >
            {dayInfo.date}
          </button>
        ))}
      </div>
    </div>
  )
}

export default MiniCalendar