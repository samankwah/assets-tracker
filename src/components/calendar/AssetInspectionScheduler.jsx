import React, { useState, useEffect } from 'react'
import {
  Calendar,
  Clock,
  Building,
  CheckCircle,
  AlertTriangle,
  Settings,
  Play,
  BarChart3,
  Users,
  MapPin,
  FileText,
  Plus,
  RefreshCw,
  Download,
  Filter,
  X
} from 'lucide-react'
import { useAssetStore } from '../../stores/assetStore'
import { useCalendarStore } from '../../stores/calendarStore'
import { toast } from 'react-hot-toast'
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns'

const AssetInspectionScheduler = () => {
  const { assets, getFilteredAssets } = useAssetStore()
  const {
    generateAssetInspectionSchedule,
    generateAllAssetsInspectionSchedule,
    updateAssetInspectionSchedule,
    completeInspectionEvent,
    getUpcomingInspections,
    getOverdueInspections,
    getInspectionAnalytics
  } = useCalendarStore()

  const [selectedAsset, setSelectedAsset] = useState(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [selectedInspection, setSelectedInspection] = useState(null)
  const [scheduleConfig, setScheduleConfig] = useState({
    startDate: new Date().toISOString().split('T')[0],
    autoSchedule: true,
    conflictResolution: 'spread',
    generateCount: 12
  })

  const [inspectionConfig, setInspectionConfig] = useState({
    'Safety Check': { frequency: 'monthly', enabled: true, duration: 60, priority: 'High' },
    'Maintenance Inspection': { frequency: 'quarterly', enabled: true, duration: 120, priority: 'Medium' },
    'Compliance Audit': { frequency: 'yearly', enabled: true, duration: 180, priority: 'High' },
    'Condition Assessment': { frequency: 'biannual', enabled: true, duration: 90, priority: 'Medium' }
  })

  const [completionForm, setCompletionForm] = useState({
    completedBy: '',
    findings: [],
    status: 'Completed',
    condition: '',
    score: 0,
    notes: '',
    actionItems: [],
    nextInspectionDate: ''
  })

  const [analytics, setAnalytics] = useState(null)
  const [upcomingInspections, setUpcomingInspections] = useState([])
  const [overdueInspections, setOverdueInspections] = useState([])

  const inspectionTypes = [
    'Safety Check',
    'Maintenance Inspection', 
    'Compliance Audit',
    'Condition Assessment',
    'Emergency Inspection'
  ]

  const frequencies = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'biannual', label: 'Bi-annual' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'as_needed', label: 'As Needed' }
  ]

  useEffect(() => {
    refreshData()
  }, [])

  const refreshData = () => {
    setUpcomingInspections(getUpcomingInspections(30))
    setOverdueInspections(getOverdueInspections())
    setAnalytics(getInspectionAnalytics())
  }

  const handleGenerateScheduleForAsset = async () => {
    if (!selectedAsset) return

    try {
      const result = generateAssetInspectionSchedule(selectedAsset.id, {
        startDate: new Date(scheduleConfig.startDate)
      })
      
      toast.success(`Generated ${result.events.length} inspection events for ${selectedAsset.name}`)
      setShowScheduleModal(false)
      refreshData()
    } catch (error) {
      toast.error('Failed to generate inspection schedule')
      console.error(error)
    }
  }

  const handleGenerateScheduleForAll = async () => {
    try {
      const result = generateAllAssetsInspectionSchedule(scheduleConfig)
      
      toast.success(`Generated ${result.events.length} inspection events for all assets`)
      if (result.conflicts.length > 0) {
        toast.warning(`${result.conflicts.length} scheduling conflicts were resolved`)
      }
      refreshData()
    } catch (error) {
      toast.error('Failed to generate inspection schedules')
      console.error(error)
    }
  }

  const handleUpdateInspectionConfig = async (assetId) => {
    try {
      const result = updateAssetInspectionSchedule(assetId, inspectionConfig)
      
      toast.success(`Updated inspection configuration for asset`)
      refreshData()
    } catch (error) {
      toast.error('Failed to update inspection configuration')
      console.error(error)
    }
  }

  const handleCompleteInspection = async () => {
    if (!selectedInspection) return

    try {
      const completion = completeInspectionEvent(selectedInspection.id, completionForm)
      
      toast.success('Inspection completed successfully')
      setShowCompletionModal(false)
      setSelectedInspection(null)
      setCompletionForm({
        completedBy: '',
        findings: [],
        status: 'Completed',
        condition: '',
        score: 0,
        notes: '',
        actionItems: [],
        nextInspectionDate: ''
      })
      refreshData()
    } catch (error) {
      toast.error('Failed to complete inspection')
      console.error(error)
    }
  }

  const InspectionCard = ({ inspection, showActions = true }) => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
            {inspection.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {format(new Date(inspection.start), 'MMM dd, yyyy • h:mm a')}
          </p>
        </div>
        <span className={`px-2 py-1 text-xs rounded ${
          inspection.priority === 'High' 
            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            : inspection.priority === 'Medium'
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        }`}>
          {inspection.priority}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center text-gray-600 dark:text-gray-400">
          <Building className="w-4 h-4 mr-2" />
          <span>{inspection.assetName}</span>
        </div>
        <div className="flex items-center text-gray-600 dark:text-gray-400">
          <Users className="w-4 h-4 mr-2" />
          <span>{inspection.assignedTo || 'Unassigned'}</span>
        </div>
        <div className="flex items-center text-gray-600 dark:text-gray-400">
          <Clock className="w-4 h-4 mr-2" />
          <span>{inspection.inspectionData?.inspectionType}</span>
        </div>
      </div>

      {showActions && (
        <div className="flex space-x-2 mt-4">
          <button
            onClick={() => {
              setSelectedInspection(inspection)
              setShowCompletionModal(true)
            }}
            className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors flex items-center justify-center space-x-1"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Complete</span>
          </button>
          <button
            onClick={() => {
              // Navigate to calendar view for this event
              console.log('View in calendar:', inspection)
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Calendar className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )

  const AnalyticsCard = ({ title, value, icon: Icon, color = 'blue' }) => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <Icon className={`w-8 h-8 text-${color}-500`} />
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Asset Inspection Scheduler
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage and schedule asset inspections with calendar integration
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Inspections</span>
          </button>
          <button
            onClick={handleGenerateScheduleForAll}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Generate All</span>
          </button>
        </div>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <AnalyticsCard
            title="Total Inspections"
            value={analytics.total}
            icon={Calendar}
            color="blue"
          />
          <AnalyticsCard
            title="Completed"
            value={analytics.completed}
            icon={CheckCircle}
            color="green"
          />
          <AnalyticsCard
            title="Overdue"
            value={analytics.overdue}
            icon={AlertTriangle}
            color="red"
          />
          <AnalyticsCard
            title="Completion Rate"
            value={`${Math.round(analytics.completionRate)}%`}
            icon={BarChart3}
            color="purple"
          />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Inspections */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Upcoming Inspections
              </h2>
            </div>
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              {upcomingInspections.length > 0 ? (
                upcomingInspections.slice(0, 5).map(inspection => (
                  <InspectionCard key={inspection.id} inspection={inspection} />
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No upcoming inspections</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Overdue Inspections */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-700 rounded-lg">
            <div className="p-4 border-b border-red-200 dark:border-red-700">
              <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Overdue Inspections
              </h2>
            </div>
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              {overdueInspections.length > 0 ? (
                overdueInspections.slice(0, 5).map(inspection => (
                  <InspectionCard key={inspection.id} inspection={inspection} />
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No overdue inspections</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Asset List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Assets
              </h2>
            </div>
            <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
              {assets.map(asset => (
                <div
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedAsset?.id === asset.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                        {asset.name}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {asset.type} • {asset.condition}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${
                      asset.inspectionStatus === 'Overdue'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : asset.inspectionStatus === 'Recently Inspected'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {asset.inspectionStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Schedule Inspections
                </h2>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Asset Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Asset
                  </label>
                  <select
                    value={selectedAsset?.id || ''}
                    onChange={(e) => {
                      const asset = assets.find(a => a.id === parseInt(e.target.value))
                      setSelectedAsset(asset)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select an asset</option>
                    {assets.map(asset => (
                      <option key={asset.id} value={asset.id}>
                        {asset.name} ({asset.type})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Schedule Configuration */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={scheduleConfig.startDate}
                      onChange={(e) => setScheduleConfig(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Conflict Resolution
                    </label>
                    <select
                      value={scheduleConfig.conflictResolution}
                      onChange={(e) => setScheduleConfig(prev => ({ ...prev, conflictResolution: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="spread">Spread Across Days</option>
                      <option value="stack">Stack Same Day</option>
                      <option value="manual">Manual Resolution</option>
                    </select>
                  </div>
                </div>

                {/* Inspection Type Configuration */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Inspection Configuration
                  </h3>
                  <div className="space-y-4">
                    {inspectionTypes.map(type => (
                      <div key={type} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={inspectionConfig[type]?.enabled || false}
                            onChange={(e) => setInspectionConfig(prev => ({
                              ...prev,
                              [type]: { ...prev[type], enabled: e.target.checked }
                            }))}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {type}
                          </span>
                        </div>
                        {inspectionConfig[type]?.enabled && (
                          <div className="flex items-center space-x-2">
                            <select
                              value={inspectionConfig[type]?.frequency || 'monthly'}
                              onChange={(e) => setInspectionConfig(prev => ({
                                ...prev,
                                [type]: { ...prev[type], frequency: e.target.value }
                              }))}
                              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            >
                              {frequencies.map(freq => (
                                <option key={freq.value} value={freq.value}>
                                  {freq.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={handleGenerateScheduleForAsset}
                    disabled={!selectedAsset}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Generate Schedule
                  </button>
                  <button
                    onClick={() => setShowScheduleModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {showCompletionModal && selectedInspection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Complete Inspection
                </h2>
                <button
                  onClick={() => setShowCompletionModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {selectedInspection.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedInspection.assetName} • {format(new Date(selectedInspection.start), 'MMM dd, yyyy')}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Completed By
                    </label>
                    <input
                      type="text"
                      value={completionForm.completedBy}
                      onChange={(e) => setCompletionForm(prev => ({ ...prev, completedBy: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Inspector name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Condition
                    </label>
                    <select
                      value={completionForm.condition}
                      onChange={(e) => setCompletionForm(prev => ({ ...prev, condition: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select condition</option>
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Inspection Score (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={completionForm.score}
                    onChange={(e) => setCompletionForm(prev => ({ ...prev, score: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={completionForm.notes}
                    onChange={(e) => setCompletionForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Inspection findings and observations..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Next Inspection Date
                  </label>
                  <input
                    type="date"
                    value={completionForm.nextInspectionDate}
                    onChange={(e) => setCompletionForm(prev => ({ ...prev, nextInspectionDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleCompleteInspection}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Complete Inspection
                  </button>
                  <button
                    onClick={() => setShowCompletionModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AssetInspectionScheduler