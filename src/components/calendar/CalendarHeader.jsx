import { ChevronLeft, ChevronRight, Calendar, Grid, List, Plus } from 'lucide-react'

const CalendarHeader = ({ 
  currentDate, 
  viewMode, 
  onViewModeChange, 
  onNavigateToday,
  onNavigatePrevious,
  onNavigateNext,
  onAddEvent
}) => {
  const formatDate = (date) => {
    if (viewMode === 'month') {
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    } else if (viewMode === 'week') {
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      
      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return `${weekStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} ${weekStart.getDate()}-${weekEnd.getDate()}`
      } else {
        return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
      }
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    }
  }

  const viewModeButtons = [
    { mode: 'month', label: 'Month', icon: Calendar },
    { mode: 'week', label: 'Week', icon: Grid },
    { mode: 'day', label: 'Day', icon: List }
  ]

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={onNavigatePrevious}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white min-w-[200px] text-center">
            {formatDate(currentDate)}
          </h2>
          
          <button
            onClick={onNavigateNext}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        
        <button
          onClick={onNavigateToday}
          className="btn-secondary text-sm"
        >
          Today
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {viewModeButtons.map(({ mode, label, icon: Icon }) => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === mode
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={onAddEvent}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Add Event</span>
        </button>
      </div>
    </div>
  )
}

export default CalendarHeader