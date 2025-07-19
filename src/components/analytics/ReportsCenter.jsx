import React, { useState, useEffect } from 'react'
import {
  FileText,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  DollarSign,
  Shield,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  LineChart,
  Settings,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react'
import { useAssetStore } from '../../stores/assetStore'
import { useTaskStore } from '../../stores/taskStore'
import reportingService from '../../services/reportingService'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'

const ReportsCenter = () => {
  const { assets } = useAssetStore()
  const { tasks } = useTaskStore()
  
  const [activeTab, setActiveTab] = useState('generate')
  const [selectedReport, setSelectedReport] = useState('executive_summary')
  const [reportConfig, setReportConfig] = useState({
    title: '',
    period: 'monthly',
    format: 'pdf',
    filters: {},
    sections: ['summary', 'analytics', 'trends', 'recommendations']
  })
  const [generatedReports, setGeneratedReports] = useState([])
  const [scheduledReports, setScheduledReports] = useState([])
  const [generating, setGenerating] = useState(false)
  const [reportHistory, setReportHistory] = useState([])

  useEffect(() => {
    loadReportHistory()
    loadScheduledReports()
  }, [])

  const reportTypes = [
    {
      id: 'executive_summary',
      name: 'Executive Summary',
      description: 'High-level overview with key metrics and insights',
      icon: TrendingUp,
      color: 'blue',
      estimatedTime: '2-3 minutes'
    },
    {
      id: 'asset_performance',
      name: 'Asset Performance',
      description: 'Detailed performance analysis for all assets',
      icon: BarChart3,
      color: 'green',
      estimatedTime: '3-5 minutes'
    },
    {
      id: 'maintenance_report',
      name: 'Maintenance Report',
      description: 'Comprehensive maintenance tracking and analysis',
      icon: Settings,
      color: 'orange',
      estimatedTime: '4-6 minutes'
    },
    {
      id: 'financial_analysis',
      name: 'Financial Analysis',
      description: 'Cost analysis, ROI, and budget tracking',
      icon: DollarSign,
      color: 'emerald',
      estimatedTime: '3-4 minutes'
    },
    {
      id: 'compliance_report',
      name: 'Compliance & Risk',
      description: 'Risk assessment and compliance status',
      icon: Shield,
      color: 'red',
      estimatedTime: '5-7 minutes'
    },
    {
      id: 'portfolio_overview',
      name: 'Portfolio Overview',
      description: 'Complete portfolio summary and trends',
      icon: PieChart,
      color: 'purple',
      estimatedTime: '4-5 minutes'
    }
  ]

  const generateReport = async () => {
    if (!selectedReport || generating) return

    setGenerating(true)
    try {
      let report

      switch (selectedReport) {
        case 'executive_summary':
          report = await reportingService.generateExecutiveSummary(assets, tasks, reportConfig.period)
          break
        case 'asset_performance':
          report = await reportingService.generateAssetPerformanceReport(assets, tasks, reportConfig.filters)
          break
        case 'maintenance_report':
          report = await reportingService.generateMaintenanceReport(assets, tasks, reportConfig.period)
          break
        case 'financial_analysis':
          report = await reportingService.generateFinancialReport(assets, tasks, reportConfig.period)
          break
        case 'compliance_report':
          report = await reportingService.generateComplianceReport(assets, tasks)
          break
        case 'portfolio_overview':
          report = await reportingService.generateExecutiveSummary(assets, tasks, 'yearly')
          break
        default:
          throw new Error('Unknown report type')
      }

      setGeneratedReports(prev => [report, ...prev])
      toast.success('Report generated successfully!')
      setActiveTab('generated')
    } catch (error) {
      toast.error('Failed to generate report')
      console.error('Report generation error:', error)
    } finally {
      setGenerating(false)
    }
  }

  const exportReport = async (report, format) => {
    try {
      await reportingService.exportReport(report, format)
      toast.success(`Report exported as ${format.toUpperCase()}`)
    } catch (error) {
      toast.error('Failed to export report')
      console.error('Export error:', error)
    }
  }

  const scheduleReport = async () => {
    try {
      const scheduleConfig = {
        reportType: selectedReport,
        schedule: reportConfig.schedule,
        config: reportConfig,
        active: true
      }
      
      await reportingService.scheduleReport(scheduleConfig)
      toast.success('Report scheduled successfully!')
      loadScheduledReports()
    } catch (error) {
      toast.error('Failed to schedule report')
      console.error('Schedule error:', error)
    }
  }

  const loadReportHistory = async () => {
    try {
      const history = await reportingService.getReportHistory()
      setReportHistory(history || [])
    } catch (error) {
      console.error('Failed to load report history:', error)
    }
  }

  const loadScheduledReports = async () => {
    try {
      // Mock scheduled reports for now
      setScheduledReports([
        {
          id: '1',
          name: 'Monthly Executive Summary',
          type: 'executive_summary',
          schedule: 'monthly',
          nextRun: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          active: true
        },
        {
          id: '2',
          name: 'Quarterly Performance Report',
          type: 'asset_performance',
          schedule: 'quarterly',
          nextRun: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          active: false
        }
      ])
    } catch (error) {
      console.error('Failed to load scheduled reports:', error)
    }
  }

  const ReportCard = ({ report, onExport, onView }) => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {report.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Generated on {format(new Date(report.generatedAt), 'MMM d, yyyy HH:mm')}
          </p>
        </div>
        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded">
          Ready
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {report.summary && Object.entries(report.summary).slice(0, 4).map(([key, value]) => (
          <div key={key} className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </div>
          </div>
        ))}
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => onView(report)}
          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          View Report
        </button>
        <button
          onClick={() => onExport(report, 'pdf')}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  )

  const ScheduledReportCard = ({ scheduledReport, onToggle }) => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${scheduledReport.active ? 'bg-green-500' : 'bg-gray-400'}`} />
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">
              {scheduledReport.name}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {scheduledReport.schedule} • Next run: {format(scheduledReport.nextRun, 'MMM d, yyyy')}
            </p>
          </div>
        </div>
        <button
          onClick={() => onToggle(scheduledReport.id)}
          className={`p-2 rounded-lg transition-colors ${
            scheduledReport.active 
              ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30' 
              : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          {scheduledReport.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Reports Center
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Generate comprehensive reports and analytics for your asset portfolio
          </p>
        </div>
        <button
          onClick={loadReportHistory}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { key: 'generate', label: 'Generate Reports', icon: FileText },
            { key: 'generated', label: 'Generated Reports', icon: CheckCircle },
            { key: 'scheduled', label: 'Scheduled Reports', icon: Clock }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Generate Reports Tab */}
      {activeTab === 'generate' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Report Types */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Select Report Type
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportTypes.map(reportType => {
                const IconComponent = reportType.icon
                return (
                  <button
                    key={reportType.id}
                    onClick={() => setSelectedReport(reportType.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedReport === reportType.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg bg-${reportType.color}-100 dark:bg-${reportType.color}-900/30`}>
                        <IconComponent className={`w-5 h-5 text-${reportType.color}-600 dark:text-${reportType.color}-400`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {reportType.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {reportType.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          {reportType.estimatedTime}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Configuration Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Report Configuration
            </h3>
            
            <div className="space-y-4">
              {/* Period Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time Period
                </label>
                <select
                  value={reportConfig.period}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, period: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="monthly">This Month</option>
                  <option value="quarterly">This Quarter</option>
                  <option value="yearly">This Year</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {/* Export Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Export Format
                </label>
                <select
                  value={reportConfig.format}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, format: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="pdf">PDF Document</option>
                  <option value="excel">Excel Spreadsheet</option>
                  <option value="csv">CSV File</option>
                  <option value="json">JSON Data</option>
                </select>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateReport}
                disabled={!selectedReport || generating}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {generating ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Generating...</span>
                  </div>
                ) : (
                  'Generate Report'
                )}
              </button>

              {/* Quick Stats */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Portfolio Summary
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Total Assets</span>
                    <span className="font-medium text-gray-900 dark:text-white">{assets.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Total Tasks</span>
                    <span className="font-medium text-gray-900 dark:text-white">{tasks.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Completed Tasks</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {tasks.filter(t => t.status === 'Completed').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generated Reports Tab */}
      {activeTab === 'generated' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Generated Reports
            </h2>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {generatedReports.length} report(s) available
            </span>
          </div>

          {generatedReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generatedReports.map(report => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onExport={exportReport}
                  onView={(report) => console.log('View report:', report)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No reports generated yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Generate your first report to see it here
              </p>
              <button
                onClick={() => setActiveTab('generate')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Generate Report
              </button>
            </div>
          )}
        </div>
      )}

      {/* Scheduled Reports Tab */}
      {activeTab === 'scheduled' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Scheduled Reports
            </h2>
            <button
              onClick={() => {/* Open schedule modal */}}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Schedule New Report
            </button>
          </div>

          <div className="space-y-4">
            {scheduledReports.map(scheduledReport => (
              <ScheduledReportCard
                key={scheduledReport.id}
                scheduledReport={scheduledReport}
                onToggle={(id) => {
                  setScheduledReports(prev => prev.map(report => 
                    report.id === id ? { ...report, active: !report.active } : report
                  ))
                }}
              />
            ))}
          </div>

          {scheduledReports.length === 0 && (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No scheduled reports
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Set up automated report generation for regular insights
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ReportsCenter