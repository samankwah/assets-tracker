import { describe, it, expect, beforeEach } from 'vitest'
import { useNotificationStore } from '../notificationStore'

describe('NotificationStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useNotificationStore.setState({
      notifications: []
    })
  })

  it('initializes with default state', () => {
    const store = useNotificationStore.getState()
    expect(store.notifications).toBeDefined()
    expect(Array.isArray(store.notifications)).toBe(true)
  })

  it('adds a new notification', () => {
    const store = useNotificationStore.getState()
    const notificationData = {
      type: 'task_due',
      title: 'Test Notification',
      message: 'Test message',
      assetId: '1',
      taskId: '1'
    }

    store.addNotification(notificationData)
    const notifications = useNotificationStore.getState().notifications

    expect(notifications).toHaveLength(1)
    expect(notifications[0]).toMatchObject(notificationData)
    expect(notifications[0].id).toBeDefined()
    expect(notifications[0].timestamp).toBeDefined()
    expect(notifications[0].read).toBe(false)
  })

  it('marks notification as read', () => {
    const store = useNotificationStore.getState()
    
    // Add a notification first
    store.addNotification({
      type: 'task_due',
      title: 'Test Notification',
      message: 'Test message'
    })

    const notifications = useNotificationStore.getState().notifications
    const notificationId = notifications[0].id

    // Mark as read
    store.markAsRead(notificationId)
    const updatedNotifications = useNotificationStore.getState().notifications

    expect(updatedNotifications[0].read).toBe(true)
  })

  it('marks all notifications as read', () => {
    const store = useNotificationStore.getState()
    
    // Add multiple notifications
    store.addNotification({
      type: 'task_due',
      title: 'Notification 1',
      message: 'Message 1'
    })

    store.addNotification({
      type: 'task_overdue',
      title: 'Notification 2',
      message: 'Message 2'
    })

    // Mark all as read
    store.markAllAsRead()
    const notifications = useNotificationStore.getState().notifications

    expect(notifications[0].read).toBe(true)
    expect(notifications[1].read).toBe(true)
  })

  it('deletes a notification', () => {
    const store = useNotificationStore.getState()
    
    // Add a notification first
    store.addNotification({
      type: 'task_due',
      title: 'Test Notification',
      message: 'Test message'
    })

    const notifications = useNotificationStore.getState().notifications
    const notificationId = notifications[0].id

    // Delete the notification
    store.deleteNotification(notificationId)
    const updatedNotifications = useNotificationStore.getState().notifications

    expect(updatedNotifications).toHaveLength(0)
  })

  it('gets unread count correctly', () => {
    const store = useNotificationStore.getState()
    
    // Add notifications with different read statuses
    store.addNotification({
      type: 'task_due',
      title: 'Unread Notification 1',
      message: 'Message 1'
    })

    store.addNotification({
      type: 'task_overdue',
      title: 'Unread Notification 2',
      message: 'Message 2'
    })

    // Mark one as read
    const notifications = useNotificationStore.getState().notifications
    store.markAsRead(notifications[0].id)

    const unreadCount = store.getUnreadCount()
    expect(unreadCount).toBe(1)
  })

  it('gets notifications by type', () => {
    const store = useNotificationStore.getState()
    
    // Add notifications of different types
    store.addNotification({
      type: 'task_due',
      title: 'Due Task',
      message: 'Task is due'
    })

    store.addNotification({
      type: 'task_overdue',
      title: 'Overdue Task',
      message: 'Task is overdue'
    })

    store.addNotification({
      type: 'task_due',
      title: 'Another Due Task',
      message: 'Another task is due'
    })

    const dueNotifications = store.getNotificationsByType('task_due')
    const overdueNotifications = store.getNotificationsByType('task_overdue')

    expect(dueNotifications).toHaveLength(2)
    expect(overdueNotifications).toHaveLength(1)
    expect(dueNotifications[0].type).toBe('task_due')
    expect(overdueNotifications[0].type).toBe('task_overdue')
  })

  it('clears all notifications', () => {
    const store = useNotificationStore.getState()
    
    // Add multiple notifications
    store.addNotification({
      type: 'task_due',
      title: 'Notification 1',
      message: 'Message 1'
    })

    store.addNotification({
      type: 'task_overdue',
      title: 'Notification 2',
      message: 'Message 2'
    })

    // Clear all notifications
    store.clearAll()
    const notifications = useNotificationStore.getState().notifications

    expect(notifications).toHaveLength(0)
  })

  it('creates task notifications for due tasks', () => {
    const store = useNotificationStore.getState()
    const task = {
      id: 1,
      title: 'Test Task',
      type: 'Inspection',
      assetName: 'Test Asset',
      assetId: 1,
      dueDate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours from now
      time: '09:00 AM',
      status: 'Not Inspected'
    }

    store.createTaskNotifications(task)
    const notifications = useNotificationStore.getState().notifications

    expect(notifications).toHaveLength(1)
    expect(notifications[0].type).toBe('task_due')
    expect(notifications[0].title).toBe('Task Due Today')
  })

  it('creates task notifications for overdue tasks', () => {
    const store = useNotificationStore.getState()
    const task = {
      id: 1,
      title: 'Test Task',
      type: 'Inspection',
      assetName: 'Test Asset',
      assetId: 1,
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      time: '09:00 AM',
      status: 'Not Inspected'
    }

    store.createTaskNotifications(task)
    const notifications = useNotificationStore.getState().notifications

    expect(notifications).toHaveLength(1)
    expect(notifications[0].type).toBe('task_overdue')
    expect(notifications[0].title).toBe('Overdue Task')
  })

  it('creates inspection reminder notifications', () => {
    const store = useNotificationStore.getState()
    const asset = {
      id: 1,
      name: 'Test Asset',
      inspectionStatus: 'Scheduled for Inspection',
      nextInspection: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString() // 12 hours from now
    }

    store.createInspectionReminder(asset)
    const notifications = useNotificationStore.getState().notifications

    expect(notifications).toHaveLength(1)
    expect(notifications[0].type).toBe('inspection_reminder')
    expect(notifications[0].title).toBe('Inspection Reminder')
  })

  it('creates maintenance completion notifications', () => {
    const store = useNotificationStore.getState()
    const task = {
      id: 1,
      title: 'Test Task',
      type: 'Maintenance',
      assetName: 'Test Asset',
      assetId: 1
    }

    store.createMaintenanceCompleted(task)
    const notifications = useNotificationStore.getState().notifications

    expect(notifications).toHaveLength(1)
    expect(notifications[0].type).toBe('maintenance_completed')
    expect(notifications[0].title).toBe('Task Completed')
  })

  it('does not create notifications for completed tasks', () => {
    const store = useNotificationStore.getState()
    const task = {
      id: 1,
      title: 'Test Task',
      type: 'Inspection',
      assetName: 'Test Asset',
      assetId: 1,
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      time: '09:00 AM',
      status: 'Completed'
    }

    store.createTaskNotifications(task)
    const notifications = useNotificationStore.getState().notifications

    expect(notifications).toHaveLength(0)
  })

  it('does not create inspection reminders for assets without scheduled inspections', () => {
    const store = useNotificationStore.getState()
    const asset = {
      id: 1,
      name: 'Test Asset',
      inspectionStatus: 'Not Inspected',
      nextInspection: null
    }

    store.createInspectionReminder(asset)
    const notifications = useNotificationStore.getState().notifications

    expect(notifications).toHaveLength(0)
  })

  it('handles notifications with missing optional fields', () => {
    const store = useNotificationStore.getState()
    
    store.addNotification({
      type: 'task_due',
      title: 'Test Notification',
      message: 'Test message'
      // Missing assetId and taskId
    })

    const notifications = useNotificationStore.getState().notifications
    expect(notifications).toHaveLength(1)
    expect(notifications[0].assetId).toBeUndefined()
    expect(notifications[0].taskId).toBeUndefined()
  })

  it('orders notifications by timestamp (newest first)', () => {
    const store = useNotificationStore.getState()
    
    // Add first notification
    store.addNotification({
      type: 'task_due',
      title: 'First Notification',
      message: 'First message'
    })

    // Wait a moment to ensure different timestamps
    setTimeout(() => {
      // Add second notification
      store.addNotification({
        type: 'task_overdue',
        title: 'Second Notification',
        message: 'Second message'
      })

      const notifications = useNotificationStore.getState().notifications
      expect(notifications[0].title).toBe('Second Notification')
      expect(notifications[1].title).toBe('First Notification')
    }, 1)
  })
})