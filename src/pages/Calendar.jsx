import { useState } from 'react'
import { useCalendarStore } from '../stores/calendarStore'
import { useTaskStore } from '../stores/taskStore'
import usePageTitle from '../hooks/usePageTitle'
import CalendarView from '../components/calendar/CalendarView'
import EventModal from '../components/calendar/EventModal'
import AddTaskModal from '../components/tasks/AddTaskModal'
import TaskDetailModal from '../components/tasks/TaskDetailModal'
import toast from 'react-hot-toast'

const Calendar = () => {
  usePageTitle('Calendar')
  
  const { 
    currentDate, 
    viewMode, 
    setCurrentDate, 
    setViewMode, 
    navigateToToday, 
    navigateToNext, 
    navigateToPrevious 
  } = useCalendarStore()
  
  const { completeTask, deleteTask } = useTaskStore()
  
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false)
  const [showAddTaskModal, setShowAddTaskModal] = useState(false)
  const [eventModalMode, setEventModalMode] = useState('view')
  const [selectedDate, setSelectedDate] = useState(new Date())

  const handleDateChange = (date) => {
    setSelectedDate(date)
    setCurrentDate(date)
  }

  const handleEventClick = (event) => {
    setSelectedEvent(event)
    setShowTaskDetailModal(true)
  }

  const handleAddEvent = (date) => {
    setSelectedDate(date || new Date())
    setShowAddTaskModal(true)
  }

  const handleEditEvent = (event) => {
    setSelectedEvent(event)
    setEventModalMode('edit')
    setShowEventModal(true)
  }

  const handleDeleteEvent = async (eventId) => {
    try {
      await deleteTask(eventId)
      toast.success('Event deleted successfully')
    } catch (error) {
      toast.error('Failed to delete event')
    }
  }

  const handleViewModeChange = (mode) => {
    setViewMode(mode)
  }


  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendar</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Schedule and track your maintenance tasks
          </p>
        </div>
      </div>

      {/* Calendar Component */}
      <CalendarView
        viewMode={viewMode}
        selectedDate={selectedDate}
        onViewModeChange={handleViewModeChange}
        onDateChange={handleDateChange}
        onEventClick={handleEventClick}
        onAddEvent={handleAddEvent}
        showFilters={true}
      />

      {/* Legend */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Event Color Legend
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Overdue</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-amber-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">High Priority</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Medium Priority</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Low Priority</span>
          </div>
        </div>
      </div>

      {/* Navigation Help */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
          Calendar Navigation Tips
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Click on any date to switch to day view</li>
          <li>• Click on events to view details and manage tasks</li>
          <li>• Use the view buttons to switch between month, week, and day views</li>
          <li>• Click "Today" to quickly navigate to the current date</li>
        </ul>
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={showTaskDetailModal}
        onClose={() => setShowTaskDetailModal(false)}
        task={selectedEvent}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
      />

      {/* Event Modal for Edit */}
      <EventModal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        event={selectedEvent}
        mode={eventModalMode}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
      />

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={showAddTaskModal}
        onClose={() => setShowAddTaskModal(false)}
      />
    </div>
  )
}

export default Calendar