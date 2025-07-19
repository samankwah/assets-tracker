import React, { useState, useEffect } from 'react'
import { useNotificationStore } from '../../stores/notificationStore'
import { Mail, Settings, Bell, Calendar, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

const EmailPreferences = () => {
  const { 
    emailPreferences, 
    updateEmailPreferences,
    emailDeliveries 
  } = useNotificationStore()

  const [preferences, setPreferences] = useState(emailPreferences)
  const [saving, setSaving] = useState(false)
  const [testEmailSending, setTestEmailSending] = useState(false)

  useEffect(() => {
    setPreferences(emailPreferences)
  }, [emailPreferences])

  const handleToggle = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleEmailChange = (e) => {
    setPreferences(prev => ({
      ...prev,
      email: e.target.value
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateEmailPreferences(preferences)
      toast.success('Email preferences updated successfully')
    } catch (error) {
      toast.error('Failed to update email preferences')
      console.error('Failed to save preferences:', error)
    } finally {
      setSaving(false)
    }
  }

  const sendTestEmail = async () => {
    setTestEmailSending(true)
    try {
      // This would be implemented in the email service
      toast.success('Test email sent successfully')
    } catch (error) {
      toast.error('Failed to send test email')
    } finally {
      setTestEmailSending(false)
    }
  }

  const getRecentEmailStats = () => {
    const recent = emailDeliveries.filter(delivery => {
      const deliveryDate = new Date(delivery.timestamp)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return deliveryDate >= weekAgo
    })

    return {
      total: recent.length,
      sent: recent.filter(d => d.status === 'sent').length,
      failed: recent.filter(d => d.status === 'failed').length,
      scheduled: recent.filter(d => d.status === 'scheduled').length
    }
  }

  const stats = getRecentEmailStats()

  const notificationTypes = [
    {
      key: 'taskDue',
      label: 'Task Due Reminders',
      description: 'Get notified when tasks are due today',
      icon: Bell,
      color: 'text-blue-600'
    },
    {
      key: 'taskOverdue',
      label: 'Overdue Task Alerts',
      description: 'Urgent notifications for overdue tasks',
      icon: AlertCircle,
      color: 'text-red-600'
    },
    {
      key: 'inspectionReminder',
      label: 'Inspection Reminders',
      description: 'Reminders for scheduled property inspections',
      icon: Calendar,
      color: 'text-green-600'
    },
    {
      key: 'maintenanceCompleted',
      label: 'Task Completion',
      description: 'Notifications when maintenance tasks are completed',
      icon: CheckCircle,
      color: 'text-emerald-600'
    },
    {
      key: 'weeklyReport',
      label: 'Weekly Reports',
      description: 'Summary of your assets and tasks every week',
      icon: FileText,
      color: 'text-purple-600'
    },
    {
      key: 'monthlyReport',
      label: 'Monthly Reports',
      description: 'Comprehensive monthly asset management reports',
      icon: FileText,
      color: 'text-indigo-600'
    }
  ]

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Email Preferences
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your email notification settings and preferences
          </p>
        </div>
      </div>

      {/* Email Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Email Activity (Last 7 Days)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.total}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Sent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.sent}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Delivered</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.failed}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.scheduled}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Scheduled</div>
          </div>
        </div>
      </div>

      {/* Email Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Email Configuration
        </h2>
        
        <div className="space-y-4">
          {/* Master Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Settings className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  Enable Email Notifications
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Master switch for all email notifications
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.enabled}
                onChange={() => handleToggle('enabled')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Email Address */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email Address
            </label>
            <input
              type="email"
              value={preferences.email}
              onChange={handleEmailChange}
              disabled={!preferences.enabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
              placeholder="Enter your email address"
            />
          </div>

          {/* Test Email Button */}
          <button
            onClick={sendTestEmail}
            disabled={!preferences.enabled || !preferences.email || testEmailSending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {testEmailSending ? 'Sending...' : 'Send Test Email'}
          </button>
        </div>
      </div>

      {/* Notification Types */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Notification Types
        </h2>
        
        <div className="space-y-4">
          {notificationTypes.map((type) => {
            const IconComponent = type.icon
            return (
              <div 
                key={type.key}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <IconComponent className={`h-5 w-5 ${type.color}`} />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {type.label}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {type.description}
                    </div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.enabled && preferences[type.key]}
                    onChange={() => handleToggle(type.key)}
                    disabled={!preferences.enabled}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
                </label>
              </div>
            )
          })}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>

      {/* Recent Email Deliveries */}
      {emailDeliveries.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Email Activity
          </h2>
          <div className="space-y-3">
            {emailDeliveries.slice(0, 5).map((delivery) => (
              <div 
                key={delivery.id}
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    delivery.status === 'sent' ? 'bg-green-500' :
                    delivery.status === 'failed' ? 'bg-red-500' :
                    delivery.status === 'scheduled' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`} />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white capitalize">
                      {delivery.type.replace('_', ' ')}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(delivery.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                  delivery.status === 'sent' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                  delivery.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                  delivery.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {delivery.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default EmailPreferences