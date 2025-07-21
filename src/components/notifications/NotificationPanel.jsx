import { useState, forwardRef } from 'react'
import { Bell, X, Check, Clock, AlertCircle, Calendar, Trash2 } from 'lucide-react'

const NotificationPanel = forwardRef(({ isOpen, onClose, notifications, onMarkAsRead, onMarkAllAsRead, onDelete }, ref) => {
  const [filter, setFilter] = useState('all') // 'all', 'unread', 'read'

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_due':
        return <Calendar className="w-5 h-5 text-blue-500" />
      case 'task_overdue':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'inspection_reminder':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'maintenance_completed':
        return <Check className="w-5 h-5 text-green-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'task_due':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20'
      case 'task_overdue':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20'
      case 'inspection_reminder':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
      case 'maintenance_completed':
        return 'border-l-green-500 bg-green-50 dark:bg-green-900/20'
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  const getTimeAgo = (timestamp) => {
    const now = new Date()
    const notificationTime = new Date(timestamp)
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read
    if (filter === 'read') return notification.read
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-20">
      <div ref={ref} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden notification-panel">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Bell className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notifications
            </h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {['all', 'unread', 'read'].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`flex-1 py-2 px-4 text-sm font-medium capitalize transition-colors ${
                filter === filterType
                  ? 'text-secondary-600 dark:text-secondary-400 border-b-2 border-secondary-600 dark:border-secondary-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {filterType}
              {filterType === 'unread' && unreadCount > 0 && (
                <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Actions */}
        {unreadCount > 0 && (
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={onMarkAllAsRead}
              className="text-sm text-secondary-600 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-300"
            >
              Mark all as read
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredNotifications.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-l-4 ${
                    !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                  } ${getNotificationColor(notification.type)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            !notification.read 
                              ? 'text-gray-900 dark:text-white' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {getTimeAgo(notification.timestamp)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.read && (
                            <button
                              onClick={() => onMarkAsRead(notification.id)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => onDelete(notification.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete notification"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {filter === 'all' ? 'No notifications' : `No ${filter} notifications`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

NotificationPanel.displayName = 'NotificationPanel'

export default NotificationPanel