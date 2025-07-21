import { useState } from 'react'
import { useClickOutsideAndEscape } from '../../hooks/useClickOutside'
import { X, Calendar, User, AlertCircle, CheckCircle, Clock, Building, Edit2, Trash2, MapPin } from 'lucide-react'
import { useTaskStore } from '../../stores/taskStore'
import { useAssetStore } from '../../stores/assetStore'
import toast from 'react-hot-toast'

const TaskDetailModal = ({ isOpen, onClose, task, onEdit }) => {
  const { completeTaskApi, deleteTaskApi } = useTaskStore()
  const { getAssetById } = useAssetStore()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  // Add click outside functionality
  const modalRef = useClickOutsideAndEscape(onClose, isOpen && task)

  if (!isOpen || !task) return null

  const asset = getAssetById(task.assetId)

  const handleCompleteTask = async () => {
    setLoading(true)
    try {
      await completeTaskApi(task.id)
      toast.success('Task marked as completed!')
      onClose()
    } catch (error) {
      toast.error('Failed to complete task')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTask = async () => {
    setLoading(true)
    try {
      await deleteTaskApi(task.id)
      toast.success('Task deleted successfully!')
      onClose()
    } catch (error) {
      toast.error('Failed to delete task')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'In Progress':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'Overdue':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Completed':
        return 'badge-success'
      case 'In Progress':
        return 'badge-warning'
      case 'Overdue':
        return 'badge-error'
      default:
        return 'badge-info'
    }
  }

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'High':
        return 'badge-error'
      case 'Medium':
        return 'badge-warning'
      case 'Low':
        return 'badge-info'
      default:
        return 'badge-info'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Completed'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Task Details
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(task)}
              className="p-2 text-gray-500 hover:text-secondary-600 dark:hover:text-secondary-400"
              title="Edit Task"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400"
              title="Delete Task"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6 space-y-6">
            {/* Task Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {task.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {task.description}
                </p>
                
                {/* Status and Priority Badges */}
                <div className="flex flex-wrap gap-2">
                  <span className={`badge ${getStatusBadgeClass(task.status)}`}>
                    {getStatusIcon(task.status)}
                    <span className="ml-2">{task.status}</span>
                  </span>
                  <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>
                    {task.priority} Priority
                  </span>
                  <span className="badge badge-secondary">
                    {task.type}
                  </span>
                  {isOverdue && (
                    <span className="badge badge-error">
                      Overdue
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Task Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Schedule Information */}
                <div className="card">
                  <div className="card-header">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      Schedule
                    </h4>
                  </div>
                  <div className="card-body space-y-3">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Due Date</span>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {formatDate(task.dueDate)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Time</span>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {formatTime(task.dueDate)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Frequency</span>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {task.frequency}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Assignment Information */}
                <div className="card">
                  <div className="card-header">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Assignment
                    </h4>
                  </div>
                  <div className="card-body space-y-3">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Assigned To</span>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {task.assignedTo || 'Unassigned'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Created</span>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {formatDate(task.createdAt)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Last Updated</span>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {formatDate(task.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Asset Information */}
                <div className="card">
                  <div className="card-header">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <Building className="w-5 h-5 mr-2" />
                      Asset
                    </h4>
                  </div>
                  <div className="card-body space-y-3">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Property</span>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {asset?.name || task.assetName}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Type</span>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {asset?.type || 'Unknown'}
                      </p>
                    </div>
                    {asset?.address && (
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Address</span>
                        <p className="text-gray-900 dark:text-white font-medium flex items-start">
                          <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                          {asset.address.street}, {asset.address.city}, {asset.address.state}
                        </p>
                      </div>
                    )}
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Asset Status</span>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {asset?.status || 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notification Settings */}
                {task.notificationSettings && (
                  <div className="card">
                    <div className="card-header">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        Notifications
                      </h4>
                    </div>
                    <div className="card-body space-y-3">
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Type</span>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {task.notificationSettings.type}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Reminder</span>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {task.notificationSettings.reminderTime}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Enabled</span>
                        <div className="flex space-x-2 mt-1">
                          {task.notifications?.email && (
                            <span className="badge badge-info">Email</span>
                          )}
                          {task.notifications?.sms && (
                            <span className="badge badge-info">SMS</span>
                          )}
                          {task.notifications?.inApp && (
                            <span className="badge badge-info">In-App</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-3">
                {task.status !== 'Completed' && (
                  <button
                    onClick={handleCompleteTask}
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? 'Completing...' : 'Mark as Complete'}
                  </button>
                )}
                <button
                  onClick={() => onEdit(task)}
                  className="btn-secondary"
                >
                  Edit Task
                </button>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Task ID: {task.id}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Delete Task
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete "{task.title}"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTask}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskDetailModal