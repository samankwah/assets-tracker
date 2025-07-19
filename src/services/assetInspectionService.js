import { addDays, addWeeks, addMonths, addYears, format, isAfter, isBefore } from 'date-fns'

/**
 * Service for managing asset inspection scheduling and calendar integration
 */
class AssetInspectionService {
  constructor() {
    this.inspectionTypes = {
      'Safety Check': {
        frequency: 'monthly',
        duration: 60, // minutes
        priority: 'High',
        description: 'Monthly safety inspection to ensure asset compliance',
        color: '#ef4444',
        category: 'safety',
        requiredFields: ['checklist', 'certifications']
      },
      'Maintenance Inspection': {
        frequency: 'quarterly',
        duration: 120,
        priority: 'Medium',
        description: 'Quarterly maintenance inspection for preventive care',
        color: '#f59e0b',
        category: 'maintenance',
        requiredFields: ['condition_assessment', 'maintenance_log']
      },
      'Compliance Audit': {
        frequency: 'yearly',
        duration: 180,
        priority: 'High',
        description: 'Annual compliance audit for regulatory requirements',
        color: '#3b82f6',
        category: 'compliance',
        requiredFields: ['documentation', 'certifications', 'compliance_report']
      },
      'Condition Assessment': {
        frequency: 'biannual',
        duration: 90,
        priority: 'Medium',
        description: 'Semi-annual condition assessment for asset lifecycle management',
        color: '#8b5cf6',
        category: 'assessment',
        requiredFields: ['condition_report', 'photos', 'recommendations']
      },
      'Emergency Inspection': {
        frequency: 'as_needed',
        duration: 45,
        priority: 'High',
        description: 'Emergency inspection following incidents or reports',
        color: '#dc2626',
        category: 'emergency',
        requiredFields: ['incident_report', 'immediate_actions']
      }
    }

    this.inspectionSchedules = new Map() // Asset ID -> Inspection Schedule
    this.inspectionHistory = new Map() // Asset ID -> Inspection History
  }

  /**
   * Calculate next inspection dates for an asset
   */
  calculateInspectionSchedule(asset, startDate = new Date()) {
    const schedule = []
    const assetType = asset.type
    const customSchedule = asset.inspectionSchedule || {}

    // Get applicable inspection types for this asset
    const applicableInspections = this.getApplicableInspections(assetType, customSchedule)

    applicableInspections.forEach(inspectionType => {
      const config = this.inspectionTypes[inspectionType]
      const customConfig = customSchedule[inspectionType] || {}
      
      const frequency = customConfig.frequency || config.frequency
      const nextDates = this.calculateNextInspectionDates(
        startDate, 
        frequency, 
        customConfig.count || 12 // Generate next 12 occurrences
      )

      nextDates.forEach((date, index) => {
        schedule.push({
          id: `${asset.id}_${inspectionType}_${index}`,
          assetId: asset.id,
          assetName: asset.name,
          assetType: asset.type,
          inspectionType,
          scheduledDate: date,
          duration: customConfig.duration || config.duration,
          priority: customConfig.priority || config.priority,
          description: customConfig.description || config.description,
          color: customConfig.color || config.color,
          category: config.category,
          status: 'Scheduled',
          requiredFields: config.requiredFields,
          assignedTo: customConfig.defaultInspector || asset.manager || '',
          location: asset.location || '',
          recurring: {
            frequency,
            interval: customConfig.interval || 1,
            isInstance: index > 0,
            parentScheduleId: index === 0 ? null : `${asset.id}_${inspectionType}_0`
          }
        })
      })
    })

    return schedule.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate))
  }

  /**
   * Get inspection types applicable to asset type
   */
  getApplicableInspections(assetType, customSchedule = {}) {
    const defaultInspections = {
      'Residential Property': ['Safety Check', 'Maintenance Inspection', 'Compliance Audit'],
      'Commercial Property': ['Safety Check', 'Maintenance Inspection', 'Compliance Audit', 'Condition Assessment'],
      'Industrial Equipment': ['Safety Check', 'Maintenance Inspection', 'Condition Assessment'],
      'Vehicle': ['Safety Check', 'Maintenance Inspection'],
      'IT Equipment': ['Maintenance Inspection', 'Condition Assessment'],
      'Furniture': ['Condition Assessment'],
      'Other': ['Condition Assessment']
    }

    const applicable = defaultInspections[assetType] || defaultInspections['Other']
    
    // Add any custom inspection types
    const customTypes = Object.keys(customSchedule).filter(
      type => !applicable.includes(type) && this.inspectionTypes[type]
    )

    return [...applicable, ...customTypes]
  }

  /**
   * Calculate next inspection dates based on frequency
   */
  calculateNextInspectionDates(startDate, frequency, count = 12) {
    const dates = []
    let currentDate = new Date(startDate)

    for (let i = 0; i < count; i++) {
      dates.push(new Date(currentDate))

      switch (frequency) {
        case 'weekly':
          currentDate = addWeeks(currentDate, 1)
          break
        case 'biweekly':
          currentDate = addWeeks(currentDate, 2)
          break
        case 'monthly':
          currentDate = addMonths(currentDate, 1)
          break
        case 'quarterly':
          currentDate = addMonths(currentDate, 3)
          break
        case 'biannual':
          currentDate = addMonths(currentDate, 6)
          break
        case 'yearly':
          currentDate = addYears(currentDate, 1)
          break
        case 'as_needed':
        default:
          // For as_needed, only return the start date
          return dates
      }
    }

    return dates
  }

  /**
   * Create calendar events from inspection schedule
   */
  createInspectionCalendarEvents(inspectionSchedule) {
    return inspectionSchedule.map(inspection => ({
      id: `inspection_${inspection.id}`,
      title: `${inspection.inspectionType} - ${inspection.assetName}`,
      description: inspection.description,
      start: new Date(inspection.scheduledDate),
      end: new Date(new Date(inspection.scheduledDate).getTime() + inspection.duration * 60000),
      type: 'Inspection',
      category: inspection.category,
      assetId: inspection.assetId,
      assetName: inspection.assetName,
      assignedTo: inspection.assignedTo,
      priority: inspection.priority,
      status: inspection.status,
      location: inspection.location,
      color: inspection.color,
      allDay: false,
      reminders: this.getDefaultReminders(inspection.inspectionType, inspection.priority),
      attachments: [],
      notes: `Required fields: ${inspection.requiredFields.join(', ')}`,
      recurring: inspection.recurring,
      inspectionData: {
        inspectionType: inspection.inspectionType,
        requiredFields: inspection.requiredFields,
        assetType: inspection.assetType
      }
    }))
  }

  /**
   * Get default reminders for inspection type
   */
  getDefaultReminders(inspectionType, priority) {
    const baseReminders = [
      { type: 'email', timing: 1440, message: `${inspectionType} scheduled for tomorrow` }, // 1 day before
      { type: 'popup', timing: 60, message: `${inspectionType} starting in 1 hour` } // 1 hour before
    ]

    if (priority === 'High') {
      baseReminders.unshift(
        { type: 'email', timing: 10080, message: `${inspectionType} scheduled for next week` } // 7 days before
      )
    }

    return baseReminders
  }

  /**
   * Schedule inspections for multiple assets
   */
  scheduleAssetsInspections(assets, options = {}) {
    const {
      startDate = new Date(),
      autoSchedule = true,
      conflictResolution = 'spread' // 'spread', 'stack', 'manual'
    } = options

    const allSchedules = []
    const conflicts = []

    assets.forEach(asset => {
      const schedule = this.calculateInspectionSchedule(asset, startDate)
      allSchedules.push(...schedule)
    })

    // Detect and resolve conflicts
    if (autoSchedule && conflictResolution !== 'manual') {
      const resolved = this.resolveSchedulingConflicts(allSchedules, conflictResolution)
      return {
        schedules: resolved.schedules,
        conflicts: resolved.conflicts,
        events: this.createInspectionCalendarEvents(resolved.schedules)
      }
    }

    return {
      schedules: allSchedules,
      conflicts,
      events: this.createInspectionCalendarEvents(allSchedules)
    }
  }

  /**
   * Resolve scheduling conflicts
   */
  resolveSchedulingConflicts(schedules, resolution = 'spread') {
    const conflicts = []
    const resolved = [...schedules]

    // Group by date and inspector
    const dateInspectorMap = new Map()
    
    resolved.forEach((schedule, index) => {
      const dateKey = format(new Date(schedule.scheduledDate), 'yyyy-MM-dd')
      const inspector = schedule.assignedTo || 'unassigned'
      const key = `${dateKey}_${inspector}`

      if (!dateInspectorMap.has(key)) {
        dateInspectorMap.set(key, [])
      }
      
      dateInspectorMap.get(key).push({ ...schedule, originalIndex: index })
    })

    // Find conflicts (multiple inspections same day/inspector)
    dateInspectorMap.forEach((inspections, key) => {
      if (inspections.length > 1) {
        conflicts.push({
          date: key.split('_')[0],
          inspector: key.split('_')[1],
          conflictingInspections: inspections.map(i => i.id),
          count: inspections.length
        })

        // Resolve conflicts based on strategy
        if (resolution === 'spread') {
          this.spreadConflictingInspections(inspections, resolved)
        } else if (resolution === 'stack') {
          this.stackConflictingInspections(inspections, resolved)
        }
      }
    })

    return { schedules: resolved, conflicts }
  }

  /**
   * Spread conflicting inspections across different days
   */
  spreadConflictingInspections(conflictingInspections, resolved) {
    conflictingInspections.forEach((inspection, index) => {
      if (index > 0) { // Keep first one, move others
        const newDate = addDays(new Date(inspection.scheduledDate), index)
        const resolvedIndex = resolved.findIndex(r => r.id === inspection.id)
        if (resolvedIndex !== -1) {
          resolved[resolvedIndex].scheduledDate = newDate
        }
      }
    })
  }

  /**
   * Stack conflicting inspections at different times same day
   */
  stackConflictingInspections(conflictingInspections, resolved) {
    let currentTime = 9 // Start at 9 AM
    
    conflictingInspections.forEach(inspection => {
      const resolvedIndex = resolved.findIndex(r => r.id === inspection.id)
      if (resolvedIndex !== -1) {
        const newDate = new Date(inspection.scheduledDate)
        newDate.setHours(currentTime, 0, 0, 0)
        resolved[resolvedIndex].scheduledDate = newDate
        
        // Move to next available time slot
        currentTime += Math.ceil(inspection.duration / 60) + 1 // Add 1 hour buffer
        if (currentTime >= 17) { // After 5 PM, move to next day
          currentTime = 9
        }
      }
    })
  }

  /**
   * Update inspection schedule for asset
   */
  updateAssetInspectionSchedule(assetId, scheduleConfig) {
    this.inspectionSchedules.set(assetId, {
      ...scheduleConfig,
      updatedAt: new Date().toISOString()
    })

    return this.inspectionSchedules.get(assetId)
  }

  /**
   * Complete inspection and update history
   */
  completeInspection(inspectionId, completionData) {
    const completion = {
      inspectionId,
      completedAt: new Date().toISOString(),
      completedBy: completionData.completedBy,
      findings: completionData.findings || [],
      status: completionData.status || 'Completed',
      nextInspectionDate: completionData.nextInspectionDate,
      attachments: completionData.attachments || [],
      notes: completionData.notes || '',
      score: completionData.score || null,
      actionItems: completionData.actionItems || []
    }

    const assetId = completionData.assetId
    if (!this.inspectionHistory.has(assetId)) {
      this.inspectionHistory.set(assetId, [])
    }

    this.inspectionHistory.get(assetId).push(completion)
    return completion
  }

  /**
   * Get inspection history for asset
   */
  getInspectionHistory(assetId, options = {}) {
    const {
      limit = 50,
      inspectionType = null,
      startDate = null,
      endDate = null
    } = options

    let history = this.inspectionHistory.get(assetId) || []

    // Apply filters
    if (inspectionType) {
      history = history.filter(h => h.inspectionType === inspectionType)
    }

    if (startDate) {
      history = history.filter(h => new Date(h.completedAt) >= new Date(startDate))
    }

    if (endDate) {
      history = history.filter(h => new Date(h.completedAt) <= new Date(endDate))
    }

    // Sort by completion date (newest first)
    history.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))

    return history.slice(0, limit)
  }

  /**
   * Get inspection analytics
   */
  getInspectionAnalytics(assetIds = [], dateRange = {}) {
    const { startDate, endDate } = dateRange
    let allHistory = []

    if (assetIds.length === 0) {
      // Get all inspection history
      this.inspectionHistory.forEach(history => {
        allHistory.push(...history)
      })
    } else {
      // Get history for specific assets
      assetIds.forEach(assetId => {
        const history = this.inspectionHistory.get(assetId) || []
        allHistory.push(...history)
      })
    }

    // Apply date filter
    if (startDate || endDate) {
      allHistory = allHistory.filter(inspection => {
        const date = new Date(inspection.completedAt)
        if (startDate && date < new Date(startDate)) return false
        if (endDate && date > new Date(endDate)) return false
        return true
      })
    }

    const analytics = {
      totalInspections: allHistory.length,
      completionRate: this.calculateCompletionRate(allHistory),
      averageScore: this.calculateAverageScore(allHistory),
      inspectionsByType: this.groupByInspectionType(allHistory),
      trendsOverTime: this.calculateTrends(allHistory),
      topFindings: this.getTopFindings(allHistory),
      upcomingInspections: this.getUpcomingInspections(assetIds)
    }

    return analytics
  }

  /**
   * Calculate completion rate
   */
  calculateCompletionRate(inspections) {
    const completed = inspections.filter(i => i.status === 'Completed').length
    return inspections.length > 0 ? (completed / inspections.length) * 100 : 0
  }

  /**
   * Calculate average inspection score
   */
  calculateAverageScore(inspections) {
    const scoredInspections = inspections.filter(i => i.score !== null)
    if (scoredInspections.length === 0) return null

    const total = scoredInspections.reduce((sum, i) => sum + i.score, 0)
    return total / scoredInspections.length
  }

  /**
   * Group inspections by type
   */
  groupByInspectionType(inspections) {
    return inspections.reduce((acc, inspection) => {
      const type = inspection.inspectionType || 'Unknown'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})
  }

  /**
   * Calculate inspection trends over time
   */
  calculateTrends(inspections) {
    const monthlyData = inspections.reduce((acc, inspection) => {
      const month = format(new Date(inspection.completedAt), 'yyyy-MM')
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {})

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }))
  }

  /**
   * Get top findings from inspections
   */
  getTopFindings(inspections) {
    const findingsCount = {}
    
    inspections.forEach(inspection => {
      inspection.findings?.forEach(finding => {
        findingsCount[finding] = (findingsCount[finding] || 0) + 1
      })
    })

    return Object.entries(findingsCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([finding, count]) => ({ finding, count }))
  }

  /**
   * Get upcoming inspections
   */
  getUpcomingInspections(assetIds = [], daysAhead = 30) {
    const cutoffDate = addDays(new Date(), daysAhead)
    const upcoming = []

    this.inspectionSchedules.forEach((schedule, assetId) => {
      if (assetIds.length === 0 || assetIds.includes(assetId)) {
        // Get scheduled inspections that haven't been completed
        // This would need to be integrated with actual scheduling system
      }
    })

    return upcoming
  }
}

export default new AssetInspectionService()