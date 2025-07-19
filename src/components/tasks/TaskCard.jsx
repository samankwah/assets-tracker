import { Calendar, Clock, User, Building, AlertCircle, CheckCircle, Eye, Edit, Trash2, Layers, Shield } from 'lucide-react'
import { PhaseBadge } from '../phases'

const TaskCard = ({ task, onView, onEdit, onDelete, onComplete }) => {
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20'
      case 'Medium': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20'
      case 'Low': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Inspection': return <AlertCircle className="w-4 h-4" />
      case 'Maintenance': return <CheckCircle className="w-4 h-4" />
      case 'Safety Check': return <AlertCircle className="w-4 h-4" />
      case 'Cleaning': return <CheckCircle className="w-4 h-4" />
      default: return <CheckCircle className="w-4 h-4" />
    }
  }

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Completed'
  const isToday = new Date(task.dueDate).toDateString() === new Date().toDateString()

  return (
    <div className={`card hover:shadow-card-hover transition-shadow duration-200 ${
      isOverdue ? 'border-red-300 dark:border-red-700' : ''
    }`}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {task.title}
            </h3>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Building className="w-4 h-4 mr-1" />
              {task.assetName}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`badge ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            {task.relatedPhase && (
              <PhaseBadge phase={task.relatedPhase} size="xs" />
            )}
            <div className="flex space-x-1">
              <button
                onClick={() => onView(task)}
                className="p-1 text-gray-400 hover:text-secondary-600 transition-colors"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => onEdit(task)}
                className="p-1 text-gray-400 hover:text-secondary-600 transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(task)}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 text-gray-400 mr-2" />
              <span className={`${isToday ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-900 dark:text-white'}`}>
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
              {isToday && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">
                  Today
                </span>
              )}
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 text-gray-400 mr-1" />
              <span className="text-gray-900 dark:text-white">{task.time}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <User className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-gray-900 dark:text-white">{task.assignedTo}</span>
            </div>
            <div className="flex items-center">
              {getTypeIcon(task.type)}
              <span className="ml-1 text-gray-900 dark:text-white">{task.type}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`badge ${getStatusColor(task.status)}`}>
              {task.status}
            </span>
            {task.phaseRequirement && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/20 rounded-full">
                <Shield className="w-3 h-3" />
                Required
              </span>
            )}
            {task.phaseSpecific && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-purple-700 bg-purple-100 dark:text-purple-300 dark:bg-purple-900/20 rounded-full">
                <Layers className="w-3 h-3" />
                Phase-specific
              </span>
            )}
            {isOverdue && (
              <span className="badge badge-error">
                Overdue
              </span>
            )}
          </div>

          {task.status !== 'Completed' && (
            <button
              onClick={() => onComplete(task)}
              className="btn-success text-xs px-3 py-1"
            >
              Mark Complete
            </button>
          )}
        </div>

        {task.description && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {task.description}
            </p>
          </div>
        )}

        {/* Notification indicator */}
        {(task.notifications.email || task.notifications.sms || task.notifications.inApp) && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <AlertCircle className="w-3 h-3 mr-1" />
              <span>
                Notifications: {task.notificationSettings.type} • {task.notificationSettings.reminderTime}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TaskCard