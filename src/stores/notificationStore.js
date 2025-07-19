import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import emailService from '../services/emailService.js'
import browserNotifications from '../utils/browserNotifications.js'

const useNotificationStore = create(
  persist(
    (set, get) => ({
  notifications: [
    {
      id: '1',
      type: 'task_due',
      title: 'Task Due Today',
      message: 'Inspection for Downtown Apartment is due today at 2:00 PM',
      timestamp: new Date().toISOString(),
      read: false,
      assetId: '1',
      taskId: '1'
    },
    {
      id: '2',
      type: 'task_overdue',
      title: 'Overdue Task',
      message: 'Monthly cleaning for Suburban House is 2 days overdue',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      read: false,
      assetId: '2',
      taskId: '2'
    },
    {
      id: '3',
      type: 'inspection_reminder',
      title: 'Inspection Reminder',
      message: 'Quarterly safety check for Business Complex scheduled for tomorrow',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      read: true,
      assetId: '3',
      taskId: '3'
    },
    {
      id: '4',
      type: 'maintenance_completed',
      title: 'Task Completed',
      message: 'HVAC maintenance for City Center Office has been completed',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      read: true,
      assetId: '4',
      taskId: '4'
    }
  ],

  // Browser notification preferences
  browserPreferences: {
    enabled: false,
    taskDue: true,
    taskOverdue: true,
    inspectionReminder: true,
    maintenanceCompleted: false,
    assetStatusChange: false
  },

  // Email preferences
  emailPreferences: {
    enabled: true,
    taskDue: true,
    taskOverdue: true,
    inspectionReminder: true,
    maintenanceCompleted: true,
    weeklyReport: true,
    monthlyReport: true,
    email: 'user@example.com'
  },

  // Email delivery status tracking
  emailDeliveries: [],

  // Add a new notification
  addNotification: (notification) => {
    const newNotification = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    }
    
    set(state => ({
      notifications: [newNotification, ...state.notifications]
    }))
  },

  // Add notification with email delivery
  addNotificationWithEmail: async (notification, emailData = {}) => {
    const { addNotification, emailPreferences } = get()
    
    // Add in-app notification
    addNotification(notification)
    
    // Send email if enabled and user has email preferences
    if (emailPreferences.enabled && emailPreferences[notification.type]) {
      try {
        const emailId = await get().sendNotificationEmail(notification, emailData)
        
        // Track email delivery
        set(state => ({
          emailDeliveries: [...state.emailDeliveries, {
            id: emailId,
            notificationId: notification.id || Date.now().toString(),
            type: notification.type,
            status: 'sent',
            timestamp: new Date().toISOString()
          }]
        }))
      } catch (error) {
        console.error('Failed to send notification email:', error)
      }
    }
  },

  // Mark notification as read
  markAsRead: (id) => {
    set(state => ({
      notifications: state.notifications.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    }))
  },

  // Mark all notifications as read
  markAllAsRead: () => {
    set(state => ({
      notifications: state.notifications.map(notification => ({
        ...notification,
        read: true
      }))
    }))
  },

  // Delete a notification
  deleteNotification: (id) => {
    set(state => ({
      notifications: state.notifications.filter(notification => notification.id !== id)
    }))
  },

  // Get unread count
  getUnreadCount: () => {
    const { notifications } = get()
    return notifications.filter(n => !n.read).length
  },

  // Get notifications by type
  getNotificationsByType: (type) => {
    const { notifications } = get()
    return notifications.filter(n => n.type === type)
  },

  // Clear all notifications
  clearAll: () => {
    set({ notifications: [] })
  },

  // Create task-related notifications
  createTaskNotifications: (task) => {
    const { addNotification } = get()
    const now = new Date()
    const dueDate = new Date(task.dueDate)
    const timeDiff = dueDate - now

    // Create due reminder if task is due today
    if (timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000) {
      addNotification({
        type: 'task_due',
        title: 'Task Due Today',
        message: `${task.type} for ${task.assetName} is due today at ${task.time || '9:00 AM'}`,
        assetId: task.assetId,
        taskId: task.id
      })
    }

    // Create overdue notification if task is overdue
    if (timeDiff < 0 && task.status !== 'Completed') {
      const daysOverdue = Math.ceil(Math.abs(timeDiff) / (24 * 60 * 60 * 1000))
      addNotification({
        type: 'task_overdue',
        title: 'Overdue Task',
        message: `${task.type} for ${task.assetName} is ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue`,
        assetId: task.assetId,
        taskId: task.id
      })
    }
  },

  // Create inspection reminder notifications
  createInspectionReminder: (asset) => {
    const { addNotification } = get()
    
    if (asset.inspectionStatus === 'Scheduled for Inspection' && asset.nextInspection) {
      const inspectionDate = new Date(asset.nextInspection)
      const now = new Date()
      const timeDiff = inspectionDate - now

      // Remind 1 day before inspection
      if (timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000) {
        addNotification({
          type: 'inspection_reminder',
          title: 'Inspection Reminder',
          message: `Inspection for ${asset.name} is scheduled for tomorrow`,
          assetId: asset.id
        })
      }
    }
  },

  // Create maintenance completion notification
  createMaintenanceCompleted: (task) => {
    const { addNotificationWithEmail } = get()
    
    addNotificationWithEmail({
      type: 'maintenance_completed',
      title: 'Task Completed',
      message: `${task.type} for ${task.assetName} has been completed`,
      assetId: task.assetId,
      taskId: task.id
    }, { task })
  },

  // Send notification email
  sendNotificationEmail: async (notification, emailData = {}) => {
    const { emailPreferences } = get()
    
    try {
      let response
      
      switch (notification.type) {
        case 'task_due':
          response = await emailService.sendTaskDueNotification(
            emailPreferences.email,
            emailData.task,
            emailData.asset
          )
          break
          
        case 'task_overdue':
          response = await emailService.sendTaskOverdueNotification(
            emailPreferences.email,
            emailData.task,
            emailData.asset,
            emailData.daysOverdue
          )
          break
          
        case 'inspection_reminder':
          response = await emailService.sendInspectionReminder(
            emailPreferences.email,
            emailData.asset,
            emailData.inspectionDate
          )
          break
          
        case 'maintenance_completed':
          response = await emailService.sendMaintenanceCompleted(
            emailPreferences.email,
            emailData.task,
            emailData.asset
          )
          break
          
        default:
          console.warn('Unknown notification type for email:', notification.type)
          return null
      }
      
      return response?.id || Date.now().toString()
    } catch (error) {
      console.error('Failed to send notification email:', error)
      throw error
    }
  },

  // Update email preferences
  updateEmailPreferences: async (preferences) => {
    set(state => ({
      emailPreferences: { ...state.emailPreferences, ...preferences }
    }))
    
    try {
      await emailService.updateEmailPreferences(preferences.email, preferences)
    } catch (error) {
      console.error('Failed to update email preferences:', error)
    }
  },

  // Get email delivery status
  getEmailDeliveryStatus: async (emailId) => {
    try {
      const status = await emailService.getEmailStatus(emailId)
      
      // Update local delivery status
      set(state => ({
        emailDeliveries: state.emailDeliveries.map(delivery =>
          delivery.id === emailId
            ? { ...delivery, status: status.status, updatedAt: new Date().toISOString() }
            : delivery
        )
      }))
      
      return status
    } catch (error) {
      console.error('Failed to get email delivery status:', error)
      return null
    }
  },

  // Send weekly report email
  sendWeeklyReport: async (reportData) => {
    const { emailPreferences } = get()
    
    if (!emailPreferences.weeklyReport) return
    
    try {
      const response = await emailService.sendWeeklyReport(
        emailPreferences.email,
        reportData
      )
      
      set(state => ({
        emailDeliveries: [...state.emailDeliveries, {
          id: response.id,
          type: 'weekly_report',
          status: 'sent',
          timestamp: new Date().toISOString()
        }]
      }))
      
      return response
    } catch (error) {
      console.error('Failed to send weekly report:', error)
      throw error
    }
  },

  // Send monthly report email
  sendMonthlyReport: async (reportData) => {
    const { emailPreferences } = get()
    
    if (!emailPreferences.monthlyReport) return
    
    try {
      const response = await emailService.sendMonthlyReport(
        emailPreferences.email,
        reportData
      )
      
      set(state => ({
        emailDeliveries: [...state.emailDeliveries, {
          id: response.id,
          type: 'monthly_report',
          status: 'sent',
          timestamp: new Date().toISOString()
        }]
      }))
      
      return response
    } catch (error) {
      console.error('Failed to send monthly report:', error)
      throw error
    }
  },

  // Schedule notification
  scheduleNotification: async (notification, sendAt, emailData = {}) => {
    try {
      const response = await emailService.scheduleEmail(
        get().emailPreferences.email,
        notification.title,
        notification.type,
        emailData,
        sendAt
      )
      
      // Add to scheduled notifications tracking
      set(state => ({
        emailDeliveries: [...state.emailDeliveries, {
          id: response.id,
          notificationId: notification.id,
          type: notification.type,
          status: 'scheduled',
          scheduledFor: sendAt,
          timestamp: new Date().toISOString()
        }]
      }))
      
      return response
    } catch (error) {
      console.error('Failed to schedule notification:', error)
      throw error
    }
  },

  // Enhanced task notifications with email
  createTaskNotificationsWithEmail: async (task, asset) => {
    const { addNotificationWithEmail } = get()
    const now = new Date()
    const dueDate = new Date(task.dueDate)
    const timeDiff = dueDate - now

    // Create due reminder if task is due today
    if (timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000) {
      await addNotificationWithEmail({
        type: 'task_due',
        title: 'Task Due Today',
        message: `${task.type} for ${task.assetName || asset?.name} is due today at ${task.time || '9:00 AM'}`,
        assetId: task.assetId,
        taskId: task.id
      }, { task, asset })
    }

    // Create overdue notification if task is overdue
    if (timeDiff < 0 && task.status !== 'Completed') {
      const daysOverdue = Math.ceil(Math.abs(timeDiff) / (24 * 60 * 60 * 1000))
      await addNotificationWithEmail({
        type: 'task_overdue',
        title: 'Overdue Task',
        message: `${task.type} for ${task.assetName || asset?.name} is ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue`,
        assetId: task.assetId,
        taskId: task.id
      }, { task, asset, daysOverdue })
    }
  },

  // Enhanced inspection reminders with email
  createInspectionReminderWithEmail: async (asset) => {
    const { addNotificationWithEmail } = get()
    
    if (asset.inspectionStatus === 'Scheduled for Inspection' && asset.nextInspection) {
      const inspectionDate = new Date(asset.nextInspection)
      const now = new Date()
      const timeDiff = inspectionDate - now

      // Remind 1 day before inspection
      if (timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000) {
        await addNotificationWithEmail({
          type: 'inspection_reminder',
          title: 'Inspection Reminder',
          message: `Inspection for ${asset.name} is scheduled for tomorrow`,
          assetId: asset.id
        }, { asset, inspectionDate: asset.nextInspection })
      }
    }
  },

  // Browser notification functions
  updateBrowserPreferences: (preferences) => {
    set(state => ({
      browserPreferences: { ...state.browserPreferences, ...preferences }
    }))
  },

  // Show browser notification
  showBrowserNotification: async (notification, data = {}) => {
    const { browserPreferences } = get()
    
    if (!browserPreferences.enabled) return null
    
    // Check if this type of notification is enabled
    const typeKey = notification.type.replace('_', '')
    if (browserPreferences[typeKey] === false) return null
    
    try {
      let browserNotif
      
      switch (notification.type) {
        case 'task_due':
          browserNotif = await browserNotifications.showTaskNotification(data.task, 'due')
          break
        case 'task_overdue':
          browserNotif = await browserNotifications.showTaskNotification(data.task, 'overdue')
          break
        case 'inspection_reminder':
          browserNotif = await browserNotifications.showAssetNotification(data.asset, 'inspection')
          break
        case 'maintenance_completed':
          browserNotif = await browserNotifications.showTaskNotification(data.task, 'completed')
          break
        default:
          browserNotif = await browserNotifications.showCustomNotification(
            notification.title,
            notification.message
          )
      }
      
      return browserNotif
    } catch (error) {
      console.error('Failed to show browser notification:', error)
      return null
    }
  },

  // Enhanced add notification with browser support
  addNotificationWithBrowser: async (notificationData, emailData = {}) => {
    const { addNotification, showBrowserNotification } = get()
    
    // Add to in-app notifications
    const notification = addNotification(notificationData)
    
    // Show browser notification
    await showBrowserNotification(notification, emailData)
    
    return notification
  },

  // Enhanced add notification with both email and browser support
  addNotificationWithAll: async (notificationData, emailData = {}) => {
    const { addNotificationWithEmail, showBrowserNotification } = get()
    
    // Add to in-app notifications and send email
    const notification = await addNotificationWithEmail(notificationData, emailData)
    
    // Show browser notification
    await showBrowserNotification(notification, emailData)
    
    return notification
  },

  // Enable browser notifications
  enableBrowserNotifications: async () => {
    try {
      const permission = await browserNotifications.requestPermission()
      
      if (permission === 'granted') {
        set(state => ({
          browserPreferences: { ...state.browserPreferences, enabled: true }
        }))
        return true
      }
      
      return false
    } catch (error) {
      console.error('Failed to enable browser notifications:', error)
      return false
    }
  },

  // Check browser notification support and permission
  getBrowserNotificationStatus: () => {
    return {
      supported: browserNotifications.isNotificationSupported(),
      permission: browserNotifications.getPermissionStatus()
    }
  },

  // Test browser notification
  testBrowserNotification: async () => {
    try {
      await browserNotifications.showTestNotification()
      return true
    } catch (error) {
      console.error('Failed to show test notification:', error)
      return false
    }
  }
    }),
    {
      name: 'notification-store',
      partialize: (state) => ({
        browserPreferences: state.browserPreferences,
        emailPreferences: state.emailPreferences,
        notifications: state.notifications.slice(-50), // Keep last 50 notifications
        emailDeliveries: state.emailDeliveries.slice(-100) // Keep last 100 email deliveries
      })
    }
  )
)

export { useNotificationStore }