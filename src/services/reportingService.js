// Reporting Service - Advanced reporting and analytics
// Generates comprehensive reports with export capabilities

import { analyticsUtils } from '../utils/analyticsUtils.js'
import { format, startOfYear, endOfYear, startOfMonth, endOfMonth } from 'date-fns'
import { api } from './apiService.js'

class ReportingService {
  constructor() {
    this.reportTemplates = {
      EXECUTIVE_SUMMARY: 'executive_summary',
      ASSET_PERFORMANCE: 'asset_performance',
      MAINTENANCE_REPORT: 'maintenance_report',
      FINANCIAL_ANALYSIS: 'financial_analysis',
      COMPLIANCE_REPORT: 'compliance_report',
      PORTFOLIO_OVERVIEW: 'portfolio_overview',
      CUSTOM_REPORT: 'custom_report'
    }
  }

  // Generate Executive Summary Report
  async generateExecutiveSummary(assets, tasks, dateRange = 'monthly') {
    const now = new Date()
    const startDate = dateRange === 'monthly' ? startOfMonth(now) : startOfYear(now)
    const endDate = dateRange === 'monthly' ? endOfMonth(now) : endOfYear(now)

    const report = {
      id: `exec_${Date.now()}`,
      title: `Executive Summary - ${format(now, 'MMMM yyyy')}`,
      generatedAt: now.toISOString(),
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        type: dateRange
      },
      summary: {
        totalAssets: assets.length,
        totalValue: this.calculatePortfolioValue(assets),
        maintenanceCosts: this.calculateMaintenanceCosts(tasks, startDate, endDate),
        taskCompletion: this.calculateTaskCompletion(tasks, startDate, endDate),
        riskScore: this.calculatePortfolioRisk(assets, tasks)
      },
      keyMetrics: {
        assetUtilization: this.calculateAssetUtilization(assets),
        maintenanceEfficiency: this.calculateMaintenanceEfficiency(tasks),
        costPerAsset: this.calculateCostPerAsset(assets, tasks),
        growthRate: this.calculateGrowthRate(assets)
      },
      alerts: this.generateAlerts(assets, tasks),
      trends: analyticsUtils.getMaintenanceTrends(tasks, 12),
      recommendations: analyticsUtils.getAssetRecommendations(assets, tasks)
    }

    return report
  }

  // Generate Asset Performance Report
  async generateAssetPerformanceReport(assets, tasks, filters = {}) {
    const performanceMetrics = analyticsUtils.getPerformanceMetrics(assets, tasks)
    
    // Apply filters
    let filteredMetrics = performanceMetrics
    if (filters.assetType) {
      filteredMetrics = filteredMetrics.filter(m => m.type === filters.assetType)
    }
    if (filters.riskLevel) {
      filteredMetrics = filteredMetrics.filter(m => m.riskLevel === filters.riskLevel)
    }
    if (filters.condition) {
      filteredMetrics = filteredMetrics.filter(m => m.condition === filters.condition)
    }

    const report = {
      id: `perf_${Date.now()}`,
      title: 'Asset Performance Analysis',
      generatedAt: new Date().toISOString(),
      filters,
      summary: {
        totalAssets: filteredMetrics.length,
        averageScore: Math.round(filteredMetrics.reduce((sum, m) => sum + m.performanceScore, 0) / filteredMetrics.length),
        topPerformers: filteredMetrics.filter(m => m.performanceScore >= 80).length,
        underPerformers: filteredMetrics.filter(m => m.performanceScore < 60).length
      },
      performance: {
        byType: this.groupPerformanceByType(filteredMetrics),
        byCondition: this.groupPerformanceByCondition(filteredMetrics),
        byRisk: this.groupPerformanceByRisk(filteredMetrics)
      },
      topAssets: filteredMetrics
        .sort((a, b) => b.performanceScore - a.performanceScore)
        .slice(0, 10),
      bottomAssets: filteredMetrics
        .sort((a, b) => a.performanceScore - b.performanceScore)
        .slice(0, 10),
      detailedMetrics: filteredMetrics,
      recommendations: this.generatePerformanceRecommendations(filteredMetrics)
    }

    return report
  }

  // Generate Maintenance Report
  async generateMaintenanceReport(assets, tasks, period = '12months') {
    const months = period === '6months' ? 6 : period === '12months' ? 12 : 24
    const maintenanceTasks = tasks.filter(task => task.type === 'Maintenance')
    const inspectionTasks = tasks.filter(task => task.type === 'Inspection')

    const report = {
      id: `maint_${Date.now()}`,
      title: `Maintenance Report - Last ${months} Months`,
      generatedAt: new Date().toISOString(),
      period: `${months} months`,
      summary: {
        totalMaintenanceTasks: maintenanceTasks.length,
        completedTasks: maintenanceTasks.filter(t => t.status === 'Completed').length,
        overdueeTasks: this.getOverdueTasks(maintenanceTasks).length,
        averageCompletionTime: this.calculateAverageCompletionTime(maintenanceTasks),
        totalCost: this.calculateMaintenanceCosts(maintenanceTasks)
      },
      trends: analyticsUtils.getMaintenanceTrends(tasks, months),
      inspectionAnalysis: analyticsUtils.getInspectionAnalysis(assets, tasks),
      costBreakdown: this.calculateMaintenanceCostBreakdown(assets, maintenanceTasks),
      scheduleCompliance: this.calculateScheduleCompliance(assets, tasks),
      assetMaintenanceRanking: this.rankAssetsByMaintenance(assets, maintenanceTasks),
      upcomingMaintenance: this.getUpcomingMaintenance(assets, tasks),
      recommendations: this.generateMaintenanceRecommendations(assets, tasks)
    }

    return report
  }

  // Generate Financial Analysis Report
  async generateFinancialReport(assets, tasks, period = 'yearly') {
    const costAnalysis = analyticsUtils.getCostAnalysis(assets, tasks)
    const maintenanceTasks = tasks.filter(task => task.type === 'Maintenance')

    const report = {
      id: `fin_${Date.now()}`,
      title: `Financial Analysis - ${period}`,
      generatedAt: new Date().toISOString(),
      period,
      portfolio: {
        totalValue: costAnalysis.summary.totalPortfolioValue,
        totalMaintenanceCost: costAnalysis.summary.totalAnnualMaintenance,
        averageMaintenanceRatio: costAnalysis.summary.averageMaintenanceRatio,
        roi: this.calculateROI(assets, tasks)
      },
      costAnalysis: {
        byAssetType: this.groupCostsByType(assets, maintenanceTasks),
        byCondition: this.groupCostsByCondition(assets, maintenanceTasks),
        monthlyTrends: this.calculateMonthlyCostTrends(maintenanceTasks),
        varianceAnalysis: this.calculateCostVariance(assets, maintenanceTasks)
      },
      budgetAnalysis: {
        plannedVsActual: this.calculateBudgetVariance(assets, maintenanceTasks),
        forecastedCosts: this.forecastMaintenanceCosts(assets, maintenanceTasks),
        costSavingOpportunities: this.identifyCostSavings(assets, maintenanceTasks)
      },
      assetValuation: this.calculateAssetValuation(assets, tasks),
      recommendations: this.generateFinancialRecommendations(assets, tasks)
    }

    return report
  }

  // Generate Compliance Report
  async generateComplianceReport(assets, tasks) {
    const inspectionTasks = tasks.filter(task => task.type === 'Inspection')
    const inspectionAnalysis = analyticsUtils.getInspectionAnalysis(assets, tasks)

    const report = {
      id: `comp_${Date.now()}`,
      title: 'Compliance & Risk Assessment Report',
      generatedAt: new Date().toISOString(),
      compliance: {
        inspectionCompliance: this.calculateInspectionCompliance(assets, inspectionTasks),
        maintenanceCompliance: this.calculateMaintenanceCompliance(assets, tasks),
        safetyCompliance: this.calculateSafetyCompliance(assets),
        regulatoryCompliance: this.calculateRegulatoryCompliance(assets)
      },
      riskAssessment: {
        overallRiskScore: this.calculatePortfolioRisk(assets, tasks),
        riskByAsset: this.calculateAssetRisks(assets, tasks),
        criticalIssues: this.identifyCriticalIssues(assets, tasks),
        riskTrends: this.calculateRiskTrends(assets, tasks)
      },
      inspectionStatus: inspectionAnalysis,
      auditTrail: this.generateAuditTrail(assets, tasks),
      recommendations: this.generateComplianceRecommendations(assets, tasks)
    }

    return report
  }

  // Generate Custom Report
  async generateCustomReport(config, assets, tasks) {
    const {
      title,
      sections,
      filters,
      dateRange,
      groupBy,
      metrics
    } = config

    let filteredAssets = this.applyFilters(assets, filters)
    let filteredTasks = this.applyFilters(tasks, filters)

    const report = {
      id: `custom_${Date.now()}`,
      title: title || 'Custom Report',
      generatedAt: new Date().toISOString(),
      config,
      data: {}
    }

    // Generate requested sections
    if (sections.includes('summary')) {
      report.data.summary = this.generateSummarySection(filteredAssets, filteredTasks)
    }

    if (sections.includes('analytics')) {
      report.data.analytics = {
        conditionDistribution: analyticsUtils.getConditionDistribution(filteredAssets),
        typeDistribution: analyticsUtils.getTypeDistribution(filteredAssets),
        performanceMetrics: analyticsUtils.getPerformanceMetrics(filteredAssets, filteredTasks)
      }
    }

    if (sections.includes('trends')) {
      report.data.trends = analyticsUtils.getMaintenanceTrends(filteredTasks, 12)
    }

    if (sections.includes('costs')) {
      report.data.costs = analyticsUtils.getCostAnalysis(filteredAssets, filteredTasks)
    }

    if (sections.includes('recommendations')) {
      report.data.recommendations = analyticsUtils.getAssetRecommendations(filteredAssets, filteredTasks)
    }

    return report
  }

  // Export report in various formats
  async exportReport(report, format = 'pdf') {
    try {
      const exportData = {
        report,
        format,
        exportedAt: new Date().toISOString()
      }

      switch (format) {
        case 'pdf':
          return await this.exportToPDF(report)
        case 'excel':
          return await this.exportToExcel(report)
        case 'csv':
          return await this.exportToCSV(report)
        case 'json':
          return await this.exportToJSON(report)
        default:
          throw new Error(`Unsupported export format: ${format}`)
      }
    } catch (error) {
      console.error('Failed to export report:', error)
      throw error
    }
  }

  // Schedule automated reports
  async scheduleReport(config) {
    try {
      const response = await api.post('/reports/schedule', config)
      return response
    } catch (error) {
      console.error('Failed to schedule report:', error)
      throw error
    }
  }

  // Get report history
  async getReportHistory(filters = {}) {
    try {
      const response = await api.get('/reports/history', filters)
      return response
    } catch (error) {
      console.error('Failed to get report history:', error)
      throw error
    }
  }

  // Helper methods
  calculatePortfolioValue(assets) {
    return assets.reduce((total, asset) => {
      const baseValue = {
        'Apartment': 250000,
        'House': 400000,
        'Condo': 300000,
        'Commercial': 800000
      }[asset.type] || 300000

      // Adjust for condition
      const conditionMultiplier = {
        'Good': 1.0,
        'Fair': 0.85,
        'Needs Repairs': 0.7,
        'Critical': 0.5
      }[asset.condition] || 0.8

      return total + (baseValue * conditionMultiplier)
    }, 0)
  }

  calculateMaintenanceCosts(tasks, startDate, endDate) {
    const maintenanceTasks = tasks.filter(task => {
      if (task.type !== 'Maintenance') return false
      if (!startDate || !endDate) return true
      
      const taskDate = new Date(task.createdAt)
      return taskDate >= startDate && taskDate <= endDate
    })

    return maintenanceTasks.reduce((total, task) => {
      const baseCost = {
        'Routine Maintenance': 500,
        'Emergency Repair': 1500,
        'Inspection': 300,
        'Cleaning': 200,
        'HVAC Maintenance': 800,
        'Plumbing': 600,
        'Electrical': 700
      }[task.type] || 400

      return total + baseCost
    }, 0)
  }

  calculateTaskCompletion(tasks, startDate, endDate) {
    const periodTasks = tasks.filter(task => {
      if (!startDate || !endDate) return true
      const taskDate = new Date(task.createdAt)
      return taskDate >= startDate && taskDate <= endDate
    })

    const completed = periodTasks.filter(task => task.status === 'Completed').length
    return periodTasks.length > 0 ? Math.round((completed / periodTasks.length) * 100) : 0
  }

  calculatePortfolioRisk(assets, tasks) {
    let totalRisk = 0
    let assetCount = 0

    assets.forEach(asset => {
      let riskScore = 0

      // Condition risk
      const conditionRisk = {
        'Good': 10,
        'Fair': 30,
        'Needs Repairs': 60,
        'Critical': 90
      }[asset.condition] || 50

      // Overdue tasks risk
      const overdueTasks = this.getOverdueTasksForAsset(tasks, asset.id)
      const overdueRisk = Math.min(overdueTasks.length * 10, 40)

      // Inspection risk
      const inspectionRisk = this.calculateInspectionRisk(asset)

      riskScore = Math.min((conditionRisk + overdueRisk + inspectionRisk) / 3, 100)
      totalRisk += riskScore
      assetCount++
    })

    return assetCount > 0 ? Math.round(totalRisk / assetCount) : 0
  }

  getOverdueTasks(tasks) {
    const now = new Date()
    return tasks.filter(task => {
      const dueDate = new Date(task.dueDate)
      return now > dueDate && task.status !== 'Completed'
    })
  }

  getOverdueTasksForAsset(tasks, assetId) {
    return this.getOverdueTasks(tasks).filter(task => task.assetId === assetId)
  }

  calculateInspectionRisk(asset) {
    if (!asset.lastInspection) return 80

    const daysSinceInspection = Math.floor(
      (new Date() - new Date(asset.lastInspection)) / (1000 * 60 * 60 * 24)
    )

    if (daysSinceInspection > 365) return 70
    if (daysSinceInspection > 180) return 40
    if (daysSinceInspection > 90) return 20
    return 10
  }

  generateAlerts(assets, tasks) {
    const alerts = []
    const now = new Date()

    // Critical condition assets
    const criticalAssets = assets.filter(asset => asset.condition === 'Critical')
    if (criticalAssets.length > 0) {
      alerts.push({
        type: 'critical',
        title: 'Critical Condition Assets',
        message: `${criticalAssets.length} asset(s) in critical condition`,
        count: criticalAssets.length,
        priority: 'high'
      })
    }

    // Overdue tasks
    const overdueTasks = this.getOverdueTasks(tasks)
    if (overdueTasks.length > 0) {
      alerts.push({
        type: 'overdue',
        title: 'Overdue Tasks',
        message: `${overdueTasks.length} task(s) overdue`,
        count: overdueTasks.length,
        priority: overdueTasks.length > 5 ? 'high' : 'medium'
      })
    }

    // Overdue inspections
    const overdueInspections = assets.filter(asset => {
      return asset.nextInspection && new Date(asset.nextInspection) < now
    })
    if (overdueInspections.length > 0) {
      alerts.push({
        type: 'inspection',
        title: 'Overdue Inspections',
        message: `${overdueInspections.length} inspection(s) overdue`,
        count: overdueInspections.length,
        priority: 'medium'
      })
    }

    return alerts
  }

  // Export methods
  async exportToPDF(report) {
    // In a real implementation, this would use a PDF library like jsPDF
    const pdfData = this.generatePDFContent(report)
    const blob = new Blob([pdfData], { type: 'application/pdf' })
    return this.downloadFile(blob, `${report.title.replace(/\s+/g, '_')}.pdf`)
  }

  async exportToExcel(report) {
    // In a real implementation, this would use a library like SheetJS
    const excelData = this.generateExcelContent(report)
    const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    return this.downloadFile(blob, `${report.title.replace(/\s+/g, '_')}.xlsx`)
  }

  async exportToCSV(report) {
    const csvData = this.generateCSVContent(report)
    const blob = new Blob([csvData], { type: 'text/csv' })
    return this.downloadFile(blob, `${report.title.replace(/\s+/g, '_')}.csv`)
  }

  async exportToJSON(report) {
    const jsonData = JSON.stringify(report, null, 2)
    const blob = new Blob([jsonData], { type: 'application/json' })
    return this.downloadFile(blob, `${report.title.replace(/\s+/g, '_')}.json`)
  }

  downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    return { success: true, filename }
  }

  generateCSVContent(report) {
    // Generate CSV based on report type and data
    if (report.detailedMetrics) {
      const headers = ['Asset Name', 'Type', 'Condition', 'Performance Score', 'Risk Level', 'Total Tasks', 'Completed Tasks']
      const rows = report.detailedMetrics.map(metric => [
        metric.assetName,
        metric.type,
        metric.condition,
        metric.performanceScore,
        metric.riskLevel,
        metric.totalTasks,
        metric.completedTasks
      ])
      return [headers, ...rows].map(row => row.join(',')).join('\n')
    }

    // Default CSV format for summary data
    const data = [
      ['Report', report.title],
      ['Generated', format(new Date(report.generatedAt), 'yyyy-MM-dd HH:mm:ss')],
      [''],
      ['Summary Data'],
      ...Object.entries(report.summary || {}).map(([key, value]) => [key, value])
    ]
    return data.map(row => row.join(',')).join('\n')
  }

  // Additional helper methods would be implemented here...
  groupPerformanceByType(metrics) {
    const grouped = {}
    metrics.forEach(metric => {
      if (!grouped[metric.type]) {
        grouped[metric.type] = []
      }
      grouped[metric.type].push(metric)
    })
    return grouped
  }

  groupPerformanceByCondition(metrics) {
    const grouped = {}
    metrics.forEach(metric => {
      if (!grouped[metric.condition]) {
        grouped[metric.condition] = []
      }
      grouped[metric.condition].push(metric)
    })
    return grouped
  }

  groupPerformanceByRisk(metrics) {
    const grouped = {}
    metrics.forEach(metric => {
      if (!grouped[metric.riskLevel]) {
        grouped[metric.riskLevel] = []
      }
      grouped[metric.riskLevel].push(metric)
    })
    return grouped
  }
}

// Create and export singleton instance
const reportingService = new ReportingService()

export { reportingService, ReportingService }
export default reportingService