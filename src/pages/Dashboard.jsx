import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useGlobalSearch } from '../hooks/useGlobalSearch'
import usePageTitle from '../hooks/usePageTitle'
import { Plus, MoreHorizontal, Calendar, Building, CheckSquare, AlertCircle, AlertTriangle } from 'lucide-react'
import GlobalSearch from '../components/search/GlobalSearch'
import { useAssetStore } from '../stores/assetStore'
import { useTaskStore } from '../stores/taskStore'
import { useState, useEffect } from 'react'

const Dashboard = () => {
  usePageTitle('Dashboard')
  
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isOpen: isSearchOpen, closeSearch } = useGlobalSearch()
  const { assets, fetchAssets } = useAssetStore()
  const { tasks, fetchTasks } = useTaskStore()
  
  const [dashboardStats, setDashboardStats] = useState({
    totalAssets: 0,
    tasksToday: 0,
    overdueTasks: 0,
    flaggedAssets: 0
  })

  useEffect(() => {
    fetchAssets()
    fetchTasks()
  }, [fetchAssets, fetchTasks])

  useEffect(() => {
    if (assets.length > 0 || tasks.length > 0) {
      calculateDashboardStats()
    }
  }, [assets, tasks])

  const calculateDashboardStats = () => {
    const today = new Date()
    const todayTasks = tasks.filter(task => {
      const taskDate = new Date(task.dueDate)
      return taskDate.toDateString() === today.toDateString()
    })
    
    const overdue = tasks.filter(task => {
      const taskDate = new Date(task.dueDate)
      return taskDate < today && task.status !== 'Completed'
    })
    
    const flagged = assets.filter(asset => 
      asset.condition === 'Critical' || asset.condition === 'Needs Repairs'
    )

    setDashboardStats({
      totalAssets: assets.length,
      tasksToday: todayTasks.length,
      overdueTasks: overdue.length,
      flaggedAssets: flagged.length
    })
  }


  const stats = [
    { title: 'Total Assets', value: dashboardStats.totalAssets, color: 'bg-blue-500 text-white p-6 rounded-xl shadow-sm', icon: Building },
    { title: 'Tasks Today', value: dashboardStats.tasksToday, color: 'bg-orange-500 text-white p-6 rounded-xl shadow-sm', icon: Calendar },
    { title: 'Overdue', value: dashboardStats.overdueTasks, color: 'bg-teal-500 text-white p-6 rounded-xl shadow-sm', icon: AlertCircle },
    { title: 'Flagged', value: dashboardStats.flaggedAssets, color: 'bg-red-500 text-white p-6 rounded-xl shadow-sm', icon: CheckSquare },
  ]


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Welcome {user?.name || 'User'}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Get started by adding your first asset or creating your first task
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={() => navigate('/assets/add')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Asset
          </button>
          <button
            onClick={() => navigate('/tasks/add')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Task
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <div key={index} className={stat.color}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <div className="text-xs sm:text-sm opacity-90 mb-1 sm:mb-2">{stat.title}</div>
                <div className="text-xl sm:text-3xl font-bold">{stat.value}</div>
              </div>
              <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 opacity-80 mt-2 sm:mt-0 self-end sm:self-auto" />
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
            <div className="flex items-start space-x-3 bg-blue-600 text-white p-3 rounded-lg">
              <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="text-sm font-medium">Home Inspection with Agent K</div>
                <div className="text-xs opacity-80">20 September 2024</div>
              </div>
            </div>
            <div className="flex items-start space-x-3 bg-red-500 text-white p-3 rounded-lg">
              <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="text-sm font-medium">Home Inspection with Agent K</div>
                <div className="text-xs opacity-80">20 September 2024</div>
              </div>
            </div>
            <div className="flex items-start space-x-3 bg-blue-600 text-white p-3 rounded-lg">
              <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="text-sm font-medium">Home Inspection with Agent K</div>
                <div className="text-xs opacity-80">20 September 2024</div>
              </div>
            </div>
            <div className="flex items-start space-x-3 bg-orange-500 text-white p-3 rounded-lg">
              <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="text-sm font-medium">Home Inspection with Agent K</div>
                <div className="text-xs opacity-80">20 September 2024</div>
              </div>
            </div>
            <div className="flex items-start space-x-3 bg-orange-500 text-white p-3 rounded-lg">
              <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="text-sm font-medium">Home Inspection with Agent K</div>
                <div className="text-xs opacity-80">20 September 2024</div>
              </div>
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
    </div>
  )
}

export default Dashboard