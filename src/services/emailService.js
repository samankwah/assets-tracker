// Email Service - Handles email notifications and communication
// Supports multiple email providers and templates

import { api } from './apiService.js'

const EMAIL_TEMPLATES = {
  TASK_DUE: 'task_due',
  TASK_OVERDUE: 'task_overdue',
  INSPECTION_REMINDER: 'inspection_reminder',
  MAINTENANCE_COMPLETED: 'maintenance_completed',
  ASSET_STATUS_CHANGE: 'asset_status_change',
  WEEKLY_REPORT: 'weekly_report',
  MONTHLY_REPORT: 'monthly_report'
}

const EMAIL_PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
}

class EmailService {
  constructor() {
    this.provider = import.meta.env.VITE_EMAIL_PROVIDER || 'sendgrid'
    this.apiKey = import.meta.env.VITE_EMAIL_API_KEY
    this.fromEmail = import.meta.env.VITE_FROM_EMAIL || 'noreply@assettracker.com'
    this.fromName = import.meta.env.VITE_FROM_NAME || 'Asset Tracker'
  }

  // Send a single email
  async sendEmail(to, subject, template, data = {}, options = {}) {
    try {
      const emailData = {
        to: Array.isArray(to) ? to : [to],
        from: {
          email: options.fromEmail || this.fromEmail,
          name: options.fromName || this.fromName
        },
        subject,
        template,
        templateData: data,
        priority: options.priority || EMAIL_PRIORITIES.NORMAL,
        sendAt: options.sendAt || null,
        tags: options.tags || [],
        metadata: options.metadata || {}
      }

      const response = await api.post('/notifications/email/send', emailData)
      return response
    } catch (error) {
      console.error('Failed to send email:', error)
      throw new Error(`Email delivery failed: ${error.message}`)
    }
  }

  // Send bulk emails
  async sendBulkEmails(emails) {
    try {
      const bulkData = {
        emails: emails.map(email => ({
          to: Array.isArray(email.to) ? email.to : [email.to],
          subject: email.subject,
          template: email.template,
          templateData: email.data || {},
          priority: email.priority || EMAIL_PRIORITIES.NORMAL,
          tags: email.tags || [],
          metadata: email.metadata || {}
        }))
      }

      const response = await api.post('/notifications/email/bulk', bulkData)
      return response
    } catch (error) {
      console.error('Failed to send bulk emails:', error)
      throw new Error(`Bulk email delivery failed: ${error.message}`)
    }
  }

  // Send task due notification
  async sendTaskDueNotification(userEmail, task, asset) {
    const subject = `Task Due: ${task.type} for ${asset.name}`
    const templateData = {
      userName: task.assignedTo || 'User',
      taskType: task.type,
      assetName: asset.name,
      dueDate: new Date(task.dueDate).toLocaleDateString(),
      dueTime: task.time || '9:00 AM',
      priority: task.priority,
      description: task.description,
      assetAddress: `${asset.address.street}, ${asset.address.city}`,
      dashboardUrl: `${window.location.origin}/tasks/${task.id}`
    }

    return this.sendEmail(
      userEmail,
      subject,
      EMAIL_TEMPLATES.TASK_DUE,
      templateData,
      { priority: EMAIL_PRIORITIES.HIGH, tags: ['task', 'due', 'reminder'] }
    )
  }

  // Send task overdue notification
  async sendTaskOverdueNotification(userEmail, task, asset, daysOverdue) {
    const subject = `OVERDUE: ${task.type} for ${asset.name} (${daysOverdue} days)`
    const templateData = {
      userName: task.assignedTo || 'User',
      taskType: task.type,
      assetName: asset.name,
      daysOverdue,
      dueDate: new Date(task.dueDate).toLocaleDateString(),
      priority: task.priority,
      description: task.description,
      assetAddress: `${asset.address.street}, ${asset.address.city}`,
      dashboardUrl: `${window.location.origin}/tasks/${task.id}`
    }

    return this.sendEmail(
      userEmail,
      subject,
      EMAIL_TEMPLATES.TASK_OVERDUE,
      templateData,
      { priority: EMAIL_PRIORITIES.URGENT, tags: ['task', 'overdue', 'urgent'] }
    )
  }

  // Send inspection reminder
  async sendInspectionReminder(userEmail, asset, inspectionDate) {
    const subject = `Inspection Reminder: ${asset.name}`
    const templateData = {
      userName: 'User',
      assetName: asset.name,
      inspectionDate: new Date(inspectionDate).toLocaleDateString(),
      inspectionTime: '10:00 AM', // Default time
      assetType: asset.type,
      assetAddress: `${asset.address.street}, ${asset.address.city}`,
      frequency: asset.frequency || 'Quarterly',
      dashboardUrl: `${window.location.origin}/assets/${asset.id}`
    }

    return this.sendEmail(
      userEmail,
      subject,
      EMAIL_TEMPLATES.INSPECTION_REMINDER,
      templateData,
      { priority: EMAIL_PRIORITIES.HIGH, tags: ['inspection', 'reminder'] }
    )
  }

  // Send maintenance completion notification
  async sendMaintenanceCompleted(userEmail, task, asset) {
    const subject = `Completed: ${task.type} for ${asset.name}`
    const templateData = {
      userName: task.assignedTo || 'User',
      taskType: task.type,
      assetName: asset.name,
      completedDate: new Date(task.completedAt || Date.now()).toLocaleDateString(),
      completedBy: task.completedBy || 'System',
      notes: task.completionNotes || 'Task completed successfully',
      assetAddress: `${asset.address.street}, ${asset.address.city}`,
      dashboardUrl: `${window.location.origin}/tasks/${task.id}`
    }

    return this.sendEmail(
      userEmail,
      subject,
      EMAIL_TEMPLATES.MAINTENANCE_COMPLETED,
      templateData,
      { priority: EMAIL_PRIORITIES.NORMAL, tags: ['task', 'completed', 'maintenance'] }
    )
  }

  // Send asset status change notification
  async sendAssetStatusChange(userEmail, asset, oldStatus, newStatus) {
    const subject = `Asset Status Update: ${asset.name}`
    const templateData = {
      userName: 'User',
      assetName: asset.name,
      oldStatus,
      newStatus,
      changedDate: new Date().toLocaleDateString(),
      assetType: asset.type,
      assetAddress: `${asset.address.street}, ${asset.address.city}`,
      dashboardUrl: `${window.location.origin}/assets/${asset.id}`
    }

    return this.sendEmail(
      userEmail,
      subject,
      EMAIL_TEMPLATES.ASSET_STATUS_CHANGE,
      templateData,
      { priority: EMAIL_PRIORITIES.NORMAL, tags: ['asset', 'status', 'update'] }
    )
  }

  // Send weekly report
  async sendWeeklyReport(userEmail, reportData) {
    const subject = `Weekly Asset Report - ${new Date().toLocaleDateString()}`
    const templateData = {
      userName: 'User',
      reportDate: new Date().toLocaleDateString(),
      totalAssets: reportData.totalAssets,
      tasksCompleted: reportData.tasksCompleted,
      tasksPending: reportData.tasksPending,
      tasksOverdue: reportData.tasksOverdue,
      inspectionsDue: reportData.inspectionsDue,
      assetsNeedingAttention: reportData.assetsNeedingAttention,
      topAssets: reportData.topAssets || [],
      upcomingTasks: reportData.upcomingTasks || [],
      dashboardUrl: `${window.location.origin}/dashboard`
    }

    return this.sendEmail(
      userEmail,
      subject,
      EMAIL_TEMPLATES.WEEKLY_REPORT,
      templateData,
      { priority: EMAIL_PRIORITIES.NORMAL, tags: ['report', 'weekly', 'summary'] }
    )
  }

  // Send monthly report
  async sendMonthlyReport(userEmail, reportData) {
    const subject = `Monthly Asset Report - ${new Date().toLocaleDateString()}`
    const templateData = {
      userName: 'User',
      reportDate: new Date().toLocaleDateString(),
      monthName: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      totalAssets: reportData.totalAssets,
      tasksCompleted: reportData.tasksCompleted,
      maintenanceCosts: reportData.maintenanceCosts || 0,
      inspectionsCompleted: reportData.inspectionsCompleted,
      assetValueChanges: reportData.assetValueChanges || [],
      performanceMetrics: reportData.performanceMetrics || {},
      dashboardUrl: `${window.location.origin}/dashboard`
    }

    return this.sendEmail(
      userEmail,
      subject,
      EMAIL_TEMPLATES.MONTHLY_REPORT,
      templateData,
      { priority: EMAIL_PRIORITIES.NORMAL, tags: ['report', 'monthly', 'summary'] }
    )
  }

  // Get email delivery status
  async getEmailStatus(emailId) {
    try {
      const response = await api.get(`/notifications/email/${emailId}/status`)
      return response
    } catch (error) {
      console.error('Failed to get email status:', error)
      throw new Error(`Email status check failed: ${error.message}`)
    }
  }

  // Get email analytics
  async getEmailAnalytics(filters = {}) {
    try {
      const response = await api.get('/notifications/email/analytics', filters)
      return response
    } catch (error) {
      console.error('Failed to get email analytics:', error)
      throw new Error(`Email analytics failed: ${error.message}`)
    }
  }

  // Update email preferences
  async updateEmailPreferences(userEmail, preferences) {
    try {
      const response = await api.put('/notifications/email/preferences', {
        email: userEmail,
        preferences
      })
      return response
    } catch (error) {
      console.error('Failed to update email preferences:', error)
      throw new Error(`Email preferences update failed: ${error.message}`)
    }
  }

  // Validate email template
  async validateTemplate(template, data) {
    try {
      const response = await api.post('/notifications/email/validate', {
        template,
        data
      })
      return response
    } catch (error) {
      console.error('Failed to validate email template:', error)
      throw new Error(`Email template validation failed: ${error.message}`)
    }
  }

  // Queue scheduled email
  async scheduleEmail(to, subject, template, data, sendAt, options = {}) {
    try {
      const emailData = {
        to: Array.isArray(to) ? to : [to],
        subject,
        template,
        templateData: data,
        sendAt: new Date(sendAt).toISOString(),
        priority: options.priority || EMAIL_PRIORITIES.NORMAL,
        tags: options.tags || [],
        metadata: options.metadata || {}
      }

      const response = await api.post('/notifications/email/schedule', emailData)
      return response
    } catch (error) {
      console.error('Failed to schedule email:', error)
      throw new Error(`Email scheduling failed: ${error.message}`)
    }
  }

  // Cancel scheduled email
  async cancelScheduledEmail(emailId) {
    try {
      const response = await api.delete(`/notifications/email/scheduled/${emailId}`)
      return response
    } catch (error) {
      console.error('Failed to cancel scheduled email:', error)
      throw new Error(`Email cancellation failed: ${error.message}`)
    }
  }
}

// Create and export singleton instance
const emailService = new EmailService()

export { emailService, EMAIL_TEMPLATES, EMAIL_PRIORITIES }
export default emailService