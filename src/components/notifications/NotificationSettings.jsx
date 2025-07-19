import { useState, useEffect } from 'react'
import { Bell, BellOff, Check, X, AlertCircle, Settings } from 'lucide-react'
import browserNotifications from '../../utils/browserNotifications'
import { useNotificationStore } from '../../stores/notificationStore'
import toast from 'react-hot-toast'

const NotificationSettings = ({ isOpen, onClose }) => {
  const { emailPreferences, updateEmailPreferences } = useNotificationStore()
  const [browserPermission, setBrowserPermission] = useState('default')
  const [browserSupported, setBrowserSupported] = useState(false)
  const [browserSettings, setBrowserSettings] = useState({
    taskDue: true,
    taskOverdue: true,
    inspectionReminder: true,
    maintenanceCompleted: false,
    assetStatusChange: false
  })

  useEffect(() => {
    if (isOpen) {
      // Check browser notification support and permission
      setBrowserSupported(browserNotifications.isNotificationSupported())
      setBrowserPermission(browserNotifications.getPermissionStatus())
    }
  }, [isOpen])

  const handleRequestBrowserPermission = async () => {
    try {
      const permission = await browserNotifications.requestPermission()
      setBrowserPermission(permission)
      
      if (permission === 'granted') {
        toast.success('Browser notifications enabled!')
        // Show test notification
        browserNotifications.showTestNotification()
      } else {
        toast.error('Browser notification permission denied')
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleTestBrowserNotification = async () => {
    try {
      await browserNotifications.showTestNotification()
      toast.success('Test notification sent!')
    } catch (error) {
      toast.error('Failed to send test notification')
    }
  }

  const handleBrowserSettingChange = (setting, value) => {
    setBrowserSettings(prev => ({
      ...prev,
      [setting]: value
    }))
  }

  const handleEmailSettingChange = (setting, value) => {
    updateEmailPreferences({
      ...emailPreferences,
      [setting]: value
    })
  }

  const getBrowserPermissionStatus = () => {
    switch (browserPermission) {
      case 'granted':
        return { color: 'text-green-600', icon: Check, text: 'Enabled' }
      case 'denied':
        return { color: 'text-red-600', icon: X, text: 'Blocked' }
      default:
        return { color: 'text-gray-600', icon: AlertCircle, text: 'Not Set' }
    }
  }

  if (!isOpen) return null

  const permissionStatus = getBrowserPermissionStatus()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-gray-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Notification Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Browser Notifications Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Browser Notifications
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get desktop notifications for important updates
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <permissionStatus.icon className={`w-5 h-5 ${permissionStatus.color}`} />
                <span className={`text-sm font-medium ${permissionStatus.color}`}>
                  {permissionStatus.text}
                </span>
              </div>
            </div>

            {!browserSupported ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm text-yellow-800 dark:text-yellow-200">
                    Browser notifications are not supported in this browser
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {browserPermission !== 'granted' && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bell className="w-5 h-5 text-blue-600" />
                        <span className="text-sm text-blue-800 dark:text-blue-200">
                          Enable browser notifications to get desktop alerts
                        </span>
                      </div>
                      <button
                        onClick={handleRequestBrowserPermission}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Enable
                      </button>
                    </div>
                  </div>
                )}

                {browserPermission === 'granted' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Browser notifications are enabled
                      </span>
                      <button
                        onClick={handleTestBrowserNotification}
                        className="px-3 py-1 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Test
                      </button>
                    </div>

                    {/* Browser notification preferences */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        Desktop Notification Types
                      </h4>
                      
                      {[
                        { key: 'taskDue', label: 'Tasks due today' },
                        { key: 'taskOverdue', label: 'Overdue tasks' },
                        { key: 'inspectionReminder', label: 'Inspection reminders' },
                        { key: 'maintenanceCompleted', label: 'Maintenance completed' },
                        { key: 'assetStatusChange', label: 'Asset status changes' }
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {label}
                          </span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={browserSettings[key]}
                              onChange={(e) => handleBrowserSettingChange(key, e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Email Notifications Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Email Notifications
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receive notifications via email
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { key: 'enabled', label: 'Enable email notifications' },
                  { key: 'taskReminders', label: 'Task reminders' },
                  { key: 'inspectionAlerts', label: 'Inspection alerts' },
                  { key: 'maintenanceUpdates', label: 'Maintenance updates' },
                  { key: 'weeklyReports', label: 'Weekly reports' },
                  { key: 'monthlyReports', label: 'Monthly reports' }
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {label}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={emailPreferences[key]}
                        onChange={(e) => handleEmailSettingChange(key, e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* In-App Notifications Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  In-App Notifications
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Show notifications in the application interface
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-800 dark:text-green-200">
                    In-app notifications are always enabled and cannot be disabled
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationSettings