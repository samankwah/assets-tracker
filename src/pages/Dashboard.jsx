import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useAssetStore } from '../stores/assetStore'
import { useTaskStore } from '../stores/taskStore'
import { usePhaseStore } from '../stores/phaseStore'
import { useGlobalSearch } from '../hooks/useGlobalSearch'
import { Plus, Eye, MoreHorizontal, Calendar, Home, Building, CheckSquare, AlertCircle, Search, TrendingUp, BarChart3 } from 'lucide-react'
import GlobalSearch from '../components/search/GlobalSearch'
import AnalyticsSummary from '../components/analytics/AnalyticsSummary'
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard'
import AddAssetModal from '../components/assets/AddAssetModal'
import AddTaskModal from '../components/tasks/AddTaskModal'
import { PhaseBadge } from '../components/phases'
import { PHASES, PHASE_COLORS } from '../types/phaseTypes'

const Dashboard = () => {
  const { user } = useAuth()
  const { assets, getAssetStats } = useAssetStore()
  const { getTaskStats, getUpcomingTasks } = useTaskStore()
  const { getPhaseStatistics, getPhaseDistribution, getUpcomingTransitions, calculatePhaseMetrics } = usePhaseStore()
  const { isOpen: isSearchOpen, openSearch, closeSearch } = useGlobalSearch()
  const [showAddAsset, setShowAddAsset] = useState(false)
  const [showAddTask, setShowAddTask] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)

  // Initialize phase data for existing assets
  useEffect(() => {
    assets.forEach(asset => {
      if (asset.currentPhase && asset.phaseMetadata) {
        // This would normally be done in the asset store, but for demo purposes
        // we'll just ensure the phase store is aware of the assets
      }
    })
    calculatePhaseMetrics()
  }, [assets, calculatePhaseMetrics])

  const assetStats = getAssetStats()
  const taskStats = getTaskStats()
  const upcomingTasks = getUpcomingTasks(7)
  const phaseStats = getPhaseStatistics()
  const phaseDistribution = getPhaseDistribution()
  const upcomingPhaseTransitions = getUpcomingTransitions(30)

  const stats = [
    { title: 'Total Assets', value: assetStats.total, color: 'stat-card-blue', icon: Building },
    { title: 'Tasks Today', value: taskStats.today, color: 'stat-card-orange', icon: Calendar },
    { title: 'Phase Progress', value: `${phaseStats.avgProgress}%`, color: 'stat-card-green', icon: TrendingUp },
    { title: 'Phase Transitions', value: upcomingPhaseTransitions.length, color: 'stat-card-purple', icon: BarChart3 },
  ]

  const recentActivities = upcomingTasks.slice(0, 4).map(task => ({
    type: task.title,
    date: new Date(task.dueDate).toLocaleDateString(),
    priority: task.priority.toLowerCase(),
    assetName: task.assetName,
    taskType: task.type
  }))

  // Convert phase distribution to chart data
  const phaseChartData = Object.entries(phaseDistribution).map(([phase, count]) => {
    const total = Object.values(phaseDistribution).reduce((sum, c) => sum + c, 0)
    const phaseColors = PHASE_COLORS[phase]
    return {
      label: phase,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      color: phaseColors?.dot || 'bg-gray-500',
      count: count
    }
  }).filter(item => item.count > 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome {user?.name || 'User'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Get started by adding your first asset or creating your first task
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={openSearch}
            className="btn-secondary"
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </button>
          <button
            onClick={() => setShowAddAsset(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Asset
          </button>
          <button
            onClick={() => setShowAddTask(true)}
            className="btn-secondary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Task
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className={stat.color}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-sm opacity-90">{stat.title}</div>
              </div>
              <stat.icon className="w-8 h-8 opacity-80" />
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* All Assets */}
        <div className="card">
          <div className="card-header flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Assets</h3>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {assets.slice(0, 3).map((asset, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <img
                    src={asset.images?.[0] || "/api/placeholder/60/60"}
                    alt={asset.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${
                        asset.status === 'Active' ? 'bg-green-500' :
                        asset.status === 'Under Maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{asset.status}</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {asset.nextInspection ? new Date(asset.nextInspection).toLocaleDateString() : 'No inspection scheduled'}
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <span className={`w-2 h-2 rounded-full ${
                        asset.condition === 'Good' ? 'bg-green-500' :
                        asset.condition === 'Fair' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">{asset.condition}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card-footer">
            <button className="text-secondary-600 hover:text-secondary-700 text-sm font-medium">
              View All Assets
            </button>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="card">
          <div className="card-header flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Tasks</h3>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.priority === 'high' ? 'bg-red-500' :
                    activity.priority === 'medium' ? 'bg-orange-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.type}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {activity.assetName} • {activity.date}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {activity.taskType}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card-footer">
            <button className="text-secondary-600 hover:text-secondary-700 text-sm font-medium">
              View Calendar
            </button>
          </div>
        </div>

        {/* Phase Distribution */}
        <div className="card">
          <div className="card-header flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Phase Distribution</h3>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
          <div className="card-body">
            {phaseChartData.length > 0 ? (
              <div className="space-y-4">
                {phaseChartData.map((phase, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <PhaseBadge phase={phase.label} size="xs" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {phase.label}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {phase.count} assets
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${phase.color}`}
                        style={{ width: `${phase.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {phase.percentage}%
                    </div>
                  </div>
                ))}

                {/* Phase Progress Summary */}
                <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-blue-700 dark:text-blue-300">
                      Average Phase Progress
                    </span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">
                      {phaseStats.avgProgress}%
                    </span>
                  </div>
                </div>

                {/* Upcoming Transitions */}
                {upcomingPhaseTransitions.length > 0 && (
                  <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-medium text-orange-700 dark:text-orange-300">
                        Upcoming Transitions
                      </span>
                      <span className="text-orange-600 dark:text-orange-400 font-bold">
                        {upcomingPhaseTransitions.length}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {upcomingPhaseTransitions.slice(0, 2).map((transition, idx) => (
                        <div key={idx} className="text-xs text-orange-600 dark:text-orange-400">
                          Asset {transition.assetId} • {transition.daysUntil} days
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <TrendingUp className="w-8 h-8 mx-auto" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No phase data available
                </p>
              </div>
            )}
          </div>
          <div className="card-footer">
            <button className="text-secondary-600 hover:text-secondary-700 text-sm font-medium">
              View Phase Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Global Search Modal */}
      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={closeSearch}
      />

      {/* Add Asset Modal */}
      <AddAssetModal
        isOpen={showAddAsset}
        onClose={() => setShowAddAsset(false)}
      />

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={showAddTask}
        onClose={() => setShowAddTask(false)}
      />
    </div>
  )
}

export default Dashboard