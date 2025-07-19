import { toast } from 'react-hot-toast'

/**
 * Service for handling advanced bulk operations across the application
 */
class BulkOperationsService {
  constructor() {
    this.operations = new Map()
    this.history = []
    this.maxHistorySize = 100
  }

  /**
   * Execute bulk operation
   */
  async executeBulkOperation(operationType, items, options = {}) {
    const operationId = `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const operation = {
      id: operationId,
      type: operationType,
      itemCount: items.length,
      startedAt: new Date().toISOString(),
      status: 'in_progress',
      progress: 0,
      results: [],
      errors: [],
      options
    }

    this.operations.set(operationId, operation)

    try {
      const results = await this.performOperation(operation, items, options)
      
      operation.status = 'completed'
      operation.completedAt = new Date().toISOString()
      operation.results = results.success
      operation.errors = results.errors
      operation.progress = 100

      this.addToHistory(operation)
      this.operations.delete(operationId)

      return {
        success: true,
        operationId,
        results: results.success,
        errors: results.errors,
        total: items.length,
        processed: results.success.length + results.errors.length
      }
    } catch (error) {
      operation.status = 'failed'
      operation.error = error.message
      operation.completedAt = new Date().toISOString()
      
      this.addToHistory(operation)
      this.operations.delete(operationId)

      throw error
    }
  }

  /**
   * Perform the actual operation based on type
   */
  async performOperation(operation, items, options) {
    const results = { success: [], errors: [] }
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      
      try {
        let result
        
        switch (operation.type) {
          case 'update_assets':
            result = await this.updateAsset(item.id, options.updateData)
            break
            
          case 'delete_assets':
            result = await this.deleteAsset(item.id)
            break
            
          case 'update_tasks':
            result = await this.updateTask(item.id, options.updateData)
            break
            
          case 'delete_tasks':
            result = await this.deleteTask(item.id)
            break
            
          case 'assign_tasks':
            result = await this.assignTask(item.id, options.assignee)
            break
            
          case 'move_phase':
            result = await this.moveAssetPhase(item.id, options.targetPhase)
            break
            
          case 'bulk_inspect':
            result = await this.scheduleInspection(item.id, options.inspectionData)
            break
            
          case 'export_data':
            result = await this.exportItem(item, options.format)
            break
            
          case 'send_notifications':
            result = await this.sendNotification(item.id, options.notificationData)
            break
            
          case 'update_status':
            result = await this.updateStatus(item.id, options.status, item.type)
            break
            
          case 'tag_items':
            result = await this.addTags(item.id, options.tags, item.type)
            break
            
          case 'duplicate_items':
            result = await this.duplicateItem(item, options.duplicateOptions)
            break
            
          default:
            throw new Error(`Unknown operation type: ${operation.type}`)
        }
        
        results.success.push({
          itemId: item.id,
          itemName: item.name || item.title,
          result
        })
      } catch (error) {
        results.errors.push({
          itemId: item.id,
          itemName: item.name || item.title,
          error: error.message
        })
      }
      
      // Update progress
      operation.progress = Math.round(((i + 1) / items.length) * 100)
    }
    
    return results
  }

  /**
   * Asset operations
   */
  async updateAsset(assetId, updateData) {
    // Simulate API call
    await this.delay(100)
    
    return {
      action: 'update',
      assetId,
      updateData,
      timestamp: new Date().toISOString()
    }
  }

  async deleteAsset(assetId) {
    await this.delay(150)
    
    return {
      action: 'delete',
      assetId,
      timestamp: new Date().toISOString()
    }
  }

  async moveAssetPhase(assetId, targetPhase) {
    await this.delay(200)
    
    return {
      action: 'phase_move',
      assetId,
      targetPhase,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Task operations
   */
  async updateTask(taskId, updateData) {
    await this.delay(100)
    
    return {
      action: 'update',
      taskId,
      updateData,
      timestamp: new Date().toISOString()
    }
  }

  async deleteTask(taskId) {
    await this.delay(120)
    
    return {
      action: 'delete',
      taskId,
      timestamp: new Date().toISOString()
    }
  }

  async assignTask(taskId, assignee) {
    await this.delay(80)
    
    return {
      action: 'assign',
      taskId,
      assignee,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Inspection operations
   */
  async scheduleInspection(assetId, inspectionData) {
    await this.delay(300)
    
    return {
      action: 'schedule_inspection',
      assetId,
      inspectionType: inspectionData.type,
      scheduledDate: inspectionData.date,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Export operations
   */
  async exportItem(item, format) {
    await this.delay(250)
    
    const exportData = this.formatExportData(item, format)
    
    return {
      action: 'export',
      itemId: item.id,
      format,
      size: exportData.length,
      timestamp: new Date().toISOString()
    }
  }

  formatExportData(item, format) {
    switch (format) {
      case 'json':
        return JSON.stringify(item, null, 2)
      case 'csv':
        return this.convertToCSV([item])
      case 'xml':
        return this.convertToXML(item)
      default:
        return JSON.stringify(item)
    }
  }

  convertToCSV(items) {
    if (items.length === 0) return ''
    
    const headers = Object.keys(items[0])
    const csvHeaders = headers.join(',')
    const csvRows = items.map(item => 
      headers.map(header => `"${item[header] || ''}"`).join(',')
    )
    
    return [csvHeaders, ...csvRows].join('\n')
  }

  convertToXML(item) {
    const xmlString = Object.entries(item)
      .map(([key, value]) => `<${key}>${value}</${key}>`)
      .join('\n  ')
    
    return `<item>\n  ${xmlString}\n</item>`
  }

  /**
   * Notification operations
   */
  async sendNotification(itemId, notificationData) {
    await this.delay(100)
    
    return {
      action: 'send_notification',
      itemId,
      type: notificationData.type,
      recipient: notificationData.recipient,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Status operations
   */
  async updateStatus(itemId, status, itemType) {
    await this.delay(80)
    
    return {
      action: 'update_status',
      itemId,
      itemType,
      newStatus: status,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Tag operations
   */
  async addTags(itemId, tags, itemType) {
    await this.delay(60)
    
    return {
      action: 'add_tags',
      itemId,
      itemType,
      tags,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Duplicate operations
   */
  async duplicateItem(item, options) {
    await this.delay(200)
    
    const duplicatedItem = {
      ...item,
      id: `${item.id}_copy_${Date.now()}`,
      name: `${item.name || item.title} (Copy)`,
      createdAt: new Date().toISOString(),
      ...options.overrides
    }
    
    return {
      action: 'duplicate',
      originalId: item.id,
      duplicatedId: duplicatedItem.id,
      duplicatedItem,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Get operation progress
   */
  getOperationProgress(operationId) {
    return this.operations.get(operationId)
  }

  /**
   * Get all active operations
   */
  getActiveOperations() {
    return Array.from(this.operations.values())
  }

  /**
   * Cancel operation
   */
  cancelOperation(operationId) {
    const operation = this.operations.get(operationId)
    if (operation) {
      operation.status = 'cancelled'
      operation.cancelledAt = new Date().toISOString()
      
      this.addToHistory(operation)
      this.operations.delete(operationId)
      
      return true
    }
    return false
  }

  /**
   * Get operation history
   */
  getOperationHistory(limit = 50) {
    return this.history
      .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
      .slice(0, limit)
  }

  /**
   * Add operation to history
   */
  addToHistory(operation) {
    this.history.unshift({
      ...operation,
      summary: this.generateOperationSummary(operation)
    })
    
    // Keep history size manageable
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(0, this.maxHistorySize)
    }
    
    // Save to localStorage
    this.saveHistory()
  }

  /**
   * Generate operation summary
   */
  generateOperationSummary(operation) {
    const successCount = operation.results?.length || 0
    const errorCount = operation.errors?.length || 0
    const total = operation.itemCount
    
    const typeLabels = {
      update_assets: 'Updated Assets',
      delete_assets: 'Deleted Assets',
      update_tasks: 'Updated Tasks',
      delete_tasks: 'Deleted Tasks',
      assign_tasks: 'Assigned Tasks',
      move_phase: 'Moved Asset Phases',
      bulk_inspect: 'Scheduled Inspections',
      export_data: 'Exported Data',
      send_notifications: 'Sent Notifications',
      update_status: 'Updated Status',
      tag_items: 'Tagged Items',
      duplicate_items: 'Duplicated Items'
    }
    
    const typeLabel = typeLabels[operation.type] || operation.type
    
    if (operation.status === 'completed') {
      return `${typeLabel}: ${successCount}/${total} successful${errorCount > 0 ? `, ${errorCount} failed` : ''}`
    } else if (operation.status === 'failed') {
      return `${typeLabel}: Failed - ${operation.error}`
    } else if (operation.status === 'cancelled') {
      return `${typeLabel}: Cancelled at ${operation.progress}%`
    } else {
      return `${typeLabel}: In progress (${operation.progress}%)`
    }
  }

  /**
   * Validate bulk operation
   */
  validateBulkOperation(operationType, items, options = {}) {
    const errors = []
    
    if (!operationType) {
      errors.push('Operation type is required')
    }
    
    if (!Array.isArray(items) || items.length === 0) {
      errors.push('Items array is required and must not be empty')
    }
    
    if (items.length > 1000) {
      errors.push('Maximum 1000 items allowed per bulk operation')
    }
    
    // Type-specific validations
    switch (operationType) {
      case 'update_assets':
      case 'update_tasks':
        if (!options.updateData || Object.keys(options.updateData).length === 0) {
          errors.push('Update data is required for update operations')
        }
        break
        
      case 'assign_tasks':
        if (!options.assignee) {
          errors.push('Assignee is required for task assignment')
        }
        break
        
      case 'move_phase':
        if (!options.targetPhase) {
          errors.push('Target phase is required for phase move operations')
        }
        break
        
      case 'bulk_inspect':
        if (!options.inspectionData || !options.inspectionData.type) {
          errors.push('Inspection data with type is required')
        }
        break
        
      case 'export_data':
        if (!options.format) {
          errors.push('Export format is required')
        }
        break
        
      case 'send_notifications':
        if (!options.notificationData || !options.notificationData.type) {
          errors.push('Notification data with type is required')
        }
        break
        
      case 'update_status':
        if (!options.status) {
          errors.push('Status is required for status update operations')
        }
        break
        
      case 'tag_items':
        if (!options.tags || !Array.isArray(options.tags) || options.tags.length === 0) {
          errors.push('Tags array is required and must not be empty')
        }
        break
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Get available operation types
   */
  getAvailableOperations() {
    return [
      {
        id: 'update_assets',
        name: 'Update Assets',
        description: 'Update multiple assets with new data',
        category: 'assets',
        requiresData: true
      },
      {
        id: 'delete_assets',
        name: 'Delete Assets',
        description: 'Delete multiple assets',
        category: 'assets',
        destructive: true
      },
      {
        id: 'move_phase',
        name: 'Move Asset Phases',
        description: 'Move assets to a different phase',
        category: 'assets',
        requiresData: true
      },
      {
        id: 'update_tasks',
        name: 'Update Tasks',
        description: 'Update multiple tasks with new data',
        category: 'tasks',
        requiresData: true
      },
      {
        id: 'delete_tasks',
        name: 'Delete Tasks',
        description: 'Delete multiple tasks',
        category: 'tasks',
        destructive: true
      },
      {
        id: 'assign_tasks',
        name: 'Assign Tasks',
        description: 'Assign tasks to team members',
        category: 'tasks',
        requiresData: true
      },
      {
        id: 'bulk_inspect',
        name: 'Schedule Inspections',
        description: 'Schedule inspections for multiple assets',
        category: 'inspections',
        requiresData: true
      },
      {
        id: 'export_data',
        name: 'Export Data',
        description: 'Export selected items to various formats',
        category: 'data',
        requiresData: true
      },
      {
        id: 'send_notifications',
        name: 'Send Notifications',
        description: 'Send notifications about selected items',
        category: 'communication',
        requiresData: true
      },
      {
        id: 'update_status',
        name: 'Update Status',
        description: 'Update status of multiple items',
        category: 'general',
        requiresData: true
      },
      {
        id: 'tag_items',
        name: 'Add Tags',
        description: 'Add tags to multiple items',
        category: 'general',
        requiresData: true
      },
      {
        id: 'duplicate_items',
        name: 'Duplicate Items',
        description: 'Create copies of selected items',
        category: 'general',
        requiresData: false
      }
    ]
  }

  /**
   * Save history to localStorage
   */
  saveHistory() {
    try {
      localStorage.setItem('assetTracker_bulkOperationHistory', JSON.stringify(this.history))
    } catch (error) {
      console.error('Failed to save bulk operation history:', error)
    }
  }

  /**
   * Load history from localStorage
   */
  loadHistory() {
    try {
      const stored = localStorage.getItem('assetTracker_bulkOperationHistory')
      if (stored) {
        this.history = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load bulk operation history:', error)
      this.history = []
    }
  }

  /**
   * Clear history
   */
  clearHistory() {
    this.history = []
    this.saveHistory()
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Get operation statistics
   */
  getOperationStats() {
    const operations = this.getOperationHistory()
    
    const stats = {
      total: operations.length,
      completed: operations.filter(op => op.status === 'completed').length,
      failed: operations.filter(op => op.status === 'failed').length,
      cancelled: operations.filter(op => op.status === 'cancelled').length,
      byType: {},
      totalItemsProcessed: 0
    }
    
    operations.forEach(op => {
      stats.byType[op.type] = (stats.byType[op.type] || 0) + 1
      stats.totalItemsProcessed += (op.results?.length || 0)
    })
    
    return stats
  }
}

export default new BulkOperationsService()