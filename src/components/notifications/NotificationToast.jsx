import { useEffect } from 'react'
import { useNotificationStore } from '../../stores/notificationStore'
import { useTaskStore } from '../../stores/taskStore'
import { useAssetStore } from '../../stores/assetStore'

const NotificationToast = () => {
  const { 
    createTaskNotifications, 
    createInspectionReminder,
    addNotificationWithAll,
    browserPreferences 
  } = useNotificationStore()
  const { tasks } = useTaskStore()
  const { assets } = useAssetStore()

  useEffect(() => {
    const checkForNotifications = () => {
      const now = new Date()
      
      // Check for task due notifications
      tasks.forEach(async (task) => {
        const dueDate = new Date(task.dueDate)
        const timeDiff = dueDate - now
        
        // Check if task is due today or overdue
        if (timeDiff <= 24 * 60 * 60 * 1000) {
          const asset = assets.find(a => a.id === task.assetId)
          
          if (timeDiff > 0) {
            // Task due today
            await addNotificationWithAll({
              type: 'task_due',
              title: 'Task Due Today',
              message: `${task.type} for ${task.assetName || asset?.name} is due today at ${task.dueTime || '9:00 AM'}`,
              assetId: task.assetId,
              taskId: task.id
            }, { task, asset })
          } else if (task.status !== 'Completed') {
            // Task overdue
            const daysOverdue = Math.ceil(Math.abs(timeDiff) / (24 * 60 * 60 * 1000))
            await addNotificationWithAll({
              type: 'task_overdue',
              title: 'Overdue Task',
              message: `${task.type} for ${task.assetName || asset?.name} is ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue`,
              assetId: task.assetId,
              taskId: task.id
            }, { task, asset, daysOverdue })
          }
        }
      })
      
      // Check for inspection reminders
      assets.forEach(async (asset) => {
        if (asset.inspectionStatus === 'Scheduled for Inspection' && asset.nextInspection) {
          const inspectionDate = new Date(asset.nextInspection)
          const timeDiff = inspectionDate - now
          
          // Remind 1 day before inspection
          if (timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000) {
            await addNotificationWithAll({
              type: 'inspection_reminder',
              title: 'Inspection Reminder',
              message: `Inspection for ${asset.name} is scheduled for tomorrow`,
              assetId: asset.id
            }, { asset, inspectionDate: asset.nextInspection })
          }
        }
      })
    }

    // Check immediately on mount
    checkForNotifications()
    
    // Set up interval to check every hour
    const interval = setInterval(checkForNotifications, 60 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [tasks, assets, createTaskNotifications, createInspectionReminder])

  return null // This component doesn't render anything
}

export default NotificationToast