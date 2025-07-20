import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAssetStore } from '../stores/assetStore'
import { useTaskStore } from '../stores/taskStore'
import { usePhaseStore } from '../stores/phaseStore'
import { useGlobalSearch } from '../hooks/useGlobalSearch'
import usePageTitle from '../hooks/usePageTitle'
import { Plus, Eye, MoreHorizontal, Calendar, Home, Building, CheckSquare, AlertCircle, Search, TrendingUp, BarChart3, AlertTriangle } from 'lucide-react'
import GlobalSearch from '../components/search/GlobalSearch'
import AnalyticsSummary from '../components/analytics/AnalyticsSummary'
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard'
import AddAssetModal from '../components/assets/AddAssetModal'
import AddTaskModal from '../components/tasks/AddTaskModal'
import { PhaseBadge } from '../components/phases'
import { PHASES, PHASE_COLORS } from '../types/phaseTypes'

const Dashboard = () => {
  usePageTitle('Dashboard')
  
  const navigate = useNavigate()
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
    { title: 'Total Assets', value: 25, color: 'bg-blue-500 text-white p-6 rounded-xl shadow-sm', icon: Building },
    { title: 'Tasks Today', value: 10, color: 'bg-orange-500 text-white p-6 rounded-xl shadow-sm', icon: Calendar },
    { title: 'Overdue', value: 15, color: 'bg-teal-500 text-white p-6 rounded-xl shadow-sm', icon: AlertCircle },
    { title: 'Flagged', value: 0, color: 'bg-red-500 text-white p-6 rounded-xl shadow-sm', icon: CheckSquare },
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
            onClick={() => setShowAddAsset(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Asset
          </button>
          <button
            onClick={() => setShowAddTask(true)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center"
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
              <div className="flex-1">
                <div className="text-sm opacity-90 mb-2">{stat.title}</div>
                <div className="text-3xl font-bold">{stat.value}</div>
              </div>
              <stat.icon className="w-8 h-8 opacity-80" />
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* All Assets */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Assets</h3>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((index) => (
              <div key={index} className="flex items-center space-x-4">
                <img
                  src="/api/placeholder/60/60"
                  alt="Property"
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Inspected</span>
                  </div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-900 dark:text-white font-medium">
                      July 23rd 2025
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 mt-1">
                    <AlertTriangle className="w-3 h-3 text-red-500" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">High</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button 
              onClick={() => navigate('/assets')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All Assets
            </button>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activities</h3>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-3">
            <div className="bg-blue-600 text-white p-3 rounded-lg">
              <div className="text-sm font-medium">Home Inspection with Agent K</div>
              <div className="text-xs opacity-80">20 September 2024</div>
            </div>
            <div className="bg-red-500 text-white p-3 rounded-lg">
              <div className="text-sm font-medium">Home Inspection with Agent K</div>
              <div className="text-xs opacity-80">20 September 2024</div>
            </div>
            <div className="bg-blue-600 text-white p-3 rounded-lg">
              <div className="text-sm font-medium">Home Inspection with Agent K</div>
              <div className="text-xs opacity-80">20 September 2024</div>
            </div>
            <div className="bg-orange-500 text-white p-3 rounded-lg">
              <div className="text-sm font-medium">Home Inspection with Agent K</div>
              <div className="text-xs opacity-80">20 September 2024</div>
            </div>
            <div className="bg-orange-500 text-white p-3 rounded-lg">
              <div className="text-sm font-medium">Home Inspection with Agent K</div>
              <div className="text-xs opacity-80">20 September 2024</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button 
              onClick={() => navigate('/calendar')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View Calendar
            </button>
          </div>
        </div>

        {/* Asset Condition */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Asset Condition</h3>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Under Maintenance</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div className="bg-blue-600 h-3 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Awaiting Repairs</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div className="bg-red-500 h-3 rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Under Repairs</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div className="bg-orange-500 h-3 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button 
              onClick={() => navigate('/tasks')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All Tasks
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