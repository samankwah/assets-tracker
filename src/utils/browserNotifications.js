/**
 * Browser notification utilities for Asset Tracker
 * Provides desktop push notifications using the Web Notifications API
 */

class BrowserNotifications {
  constructor() {
    this.permission = Notification.permission
    this.isSupported = 'Notification' in window
  }

  /**
   * Check if browser notifications are supported
   */
  isNotificationSupported() {
    return this.isSupported
  }

  /**
   * Get current notification permission status
   */
  getPermissionStatus() {
    return this.permission
  }

  /**
   * Request notification permission from user
   */
  async requestPermission() {
    if (!this.isSupported) {
      throw new Error('Browser notifications are not supported')
    }

    if (this.permission === 'granted') {
      return 'granted'
    }

    if (this.permission === 'denied') {
      throw new Error('Notification permission has been denied')
    }

    try {
      const permission = await Notification.requestPermission()
      this.permission = permission
      return permission
    } catch (error) {
      throw new Error('Failed to request notification permission: ' + error.message)
    }
  }

  /**
   * Show a browser notification
   */
  async showNotification(title, options = {}) {
    if (!this.isSupported) {
      console.warn('Browser notifications not supported')
      return null
    }

    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted')
      return null
    }

    const defaultOptions = {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      requireInteraction: false,
      silent: false,
      tag: 'asset-tracker',
      ...options
    }

    try {
      const notification = new Notification(title, defaultOptions)
      
      // Auto-close after 5 seconds unless requireInteraction is true
      if (!defaultOptions.requireInteraction) {
        setTimeout(() => {
          notification.close()
        }, 5000)
      }

      return notification
    } catch (error) {
      console.error('Failed to show notification:', error)
      return null
    }
  }

  /**
   * Show task-related notifications
   */
  async showTaskNotification(task, type = 'due') {
    const icons = {
      due: '📅',
      overdue: '⚠️',
      completed: '✅',
      reminder: '🔔'
    }

    const titles = {
      due: 'Task Due Today',
      overdue: 'Task Overdue',
      completed: 'Task Completed',
      reminder: 'Task Reminder'
    }

    const messages = {
      due: `${task.title} is due today`,
      overdue: `${task.title} is overdue`,
      completed: `${task.title} has been completed`,
      reminder: `Reminder: ${task.title}`
    }

    return this.showNotification(titles[type], {
      body: messages[type],
      icon: '/favicon.ico',
      tag: `task-${task.id}`,
      data: { taskId: task.id, type, task },
      actions: type === 'due' || type === 'overdue' ? [
        { action: 'view', title: 'View Task' },
        { action: 'complete', title: 'Mark Complete' }
      ] : undefined
    })
  }

  /**
   * Show asset-related notifications
   */
  async showAssetNotification(asset, type = 'inspection') {
    const icons = {
      inspection: '🔍',
      maintenance: '🔧',
      status: '📊',
      alert: '🚨'
    }

    const titles = {
      inspection: 'Inspection Due',
      maintenance: 'Maintenance Required',
      status: 'Asset Status Changed',
      alert: 'Asset Alert'
    }

    const messages = {
      inspection: `Inspection due for ${asset.name}`,
      maintenance: `Maintenance required for ${asset.name}`,
      status: `Status changed for ${asset.name}`,
      alert: `Alert for ${asset.name}`
    }

    return this.showNotification(titles[type], {
      body: messages[type],
      icon: '/favicon.ico',
      tag: `asset-${asset.id}`,
      data: { assetId: asset.id, type, asset },
      actions: [
        { action: 'view', title: 'View Asset' },
        { action: 'schedule', title: 'Schedule Task' }
      ]
    })
  }

  /**
   * Show custom notification
   */
  async showCustomNotification(title, message, options = {}) {
    return this.showNotification(title, {
      body: message,
      icon: '/favicon.ico',
      tag: 'custom',
      ...options
    })
  }

  /**
   * Test notification (useful for settings/preferences)
   */
  async showTestNotification() {
    return this.showNotification('Test Notification', {
      body: 'Browser notifications are working correctly!',
      icon: '/favicon.ico',
      tag: 'test',
      requireInteraction: false
    })
  }

  /**
   * Clear notifications by tag
   */
  clearNotificationsByTag(tag) {
    // Note: There's no direct API to clear notifications by tag
    // This is a placeholder for future enhancement
    console.log(`Clearing notifications with tag: ${tag}`)
  }

  /**
   * Setup notification click handlers
   */
  setupNotificationHandlers(onNotificationClick) {
    if (!this.isSupported) return

    // Handle notification clicks
    if (typeof onNotificationClick === 'function') {
      // Listen for notification events on the global scope
      window.addEventListener('notificationclick', (event) => {
        onNotificationClick(event)
      })
    }
  }
}

// Create singleton instance
const browserNotifications = new BrowserNotifications()

export default browserNotifications
export { BrowserNotifications }