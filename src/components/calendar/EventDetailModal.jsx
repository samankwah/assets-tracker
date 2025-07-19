import { X, Calendar, Clock, User, Building, AlertCircle, CheckCircle } from 'lucide-react'

const EventDetailModal = ({ event, isOpen, onClose, onEditEvent, onDeleteEvent, onCompleteTask }) => {
  if (!isOpen || !event) return null

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20'
      case 'Medium': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20'
      case 'Low': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'badge-success'
      case 'Under Maintenance': return 'badge-warning'
      case 'Recently Inspected': return 'badge-success'
      case 'Scheduled for Inspection': return 'badge-info'
      case 'Overdue': return 'badge-error'
      case 'Not Inspected': return 'badge-gray'
      default: return 'badge-gray'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Inspection': return <AlertCircle className="w-5 h-5" />
      case 'Maintenance': return <CheckCircle className="w-5 h-5" />
      case 'Safety Check': return <AlertCircle className="w-5 h-5" />
      case 'Cleaning': return <CheckCircle className="w-5 h-5" />
      default: return <CheckCircle className="w-5 h-5" />
    }
  }

  const isOverdue = new Date(event.start) < new Date() && event.status !== 'Completed'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            {getTypeIcon(event.taskType)}
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Event Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Event Header */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {event.title}
              </h3>
              <div className="flex items-center space-x-2">
                <span className={`badge ${getPriorityColor(event.priority)}`}>
                  {event.priority} Priority
                </span>
                <span className={`badge ${getStatusColor(event.status)}`}>
                  {event.status}
                </span>
                {isOverdue && (
                  <span className="badge badge-error">
                    Overdue
                  </span>
                )}
              </div>
            </div>

            {event.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {event.description}
              </p>
            )}
          </div>

          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(event.start).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(event.start).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Assigned to</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {event.assignedTo}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Building className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Asset</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {event.assetName}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Task Type</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {event.taskType}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {event.status}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Time Information */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Time Information
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Start Time</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(event.start).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">End Time</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(event.end).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            {event.status !== 'Completed' && (
              <button
                onClick={() => onCompleteTask(event)}
                className="btn-success flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as Complete
              </button>
            )}
            
            <button
              onClick={() => onEditEvent(event)}
              className="btn-secondary flex-1"
            >
              Edit Task
            </button>
            
            <button
              onClick={() => onDeleteEvent(event)}
              className="btn-error flex-1"
            >
              Delete Task
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetailModal