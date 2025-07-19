import { useState } from 'react'
import { useTaskStore } from '../stores/taskStore'
import { useAssetStore } from '../stores/assetStore'
import { Plus, Filter, Calendar, Clock, User, CheckSquare, AlertCircle, Grid, List } from 'lucide-react'
import AddTaskModal from '../components/tasks/AddTaskModal'
import TaskDetailModal from '../components/tasks/TaskDetailModal'
import TaskCard from '../components/tasks/TaskCard'
import TaskTableView from '../components/tasks/TaskTableView'
import ExportMenu from '../components/ui/ExportMenu'
import { SavedSearchButton } from '../components/search'
import toast from 'react-hot-toast'

const Tasks = () => {
  const { 
    tasks, 
    filters, 
    searchTerm, 
    sortBy,
    sortOrder,
    getFilteredTasks, 
    getTaskStats,
    setFilters, 
    setSearchTerm,
    setSorting,
    deleteTask,
    completeTask
  } = useTaskStore()
  
  const { assets } = useAssetStore()
  
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'

  const filteredTasks = getFilteredTasks()
  const taskStats = getTaskStats()

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
  }

  const handleSearchChange = (search) => {
    setSearchTerm(search)
  }

  const handleSortChange = (field) => {
    const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc'
    setSorting(field, newOrder)
  }

  const handleClearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      type: '',
      assetId: '',
      assignedTo: ''
    })
    setSearchTerm('')
  }

  const handleViewTask = (task) => {
    setSelectedTask(task)
    setShowDetailModal(true)
  }

  const handleEditTask = (task) => {
    setSelectedTask(task)
    // TODO: Open edit modal
  }

  const handleDeleteTask = (task) => {
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      deleteTask(task.id)
      toast.success('Task deleted successfully')
    }
  }

  const handleCompleteTask = (task) => {
    completeTask(task.id)
    toast.success('Task marked as completed')
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '') || searchTerm !== ''

  const statCards = [
    { title: 'Total Tasks', value: taskStats.total, color: 'stat-card-blue', icon: CheckSquare },
    { title: 'Due Today', value: taskStats.today, color: 'stat-card-orange', icon: Calendar },
    { title: 'Overdue', value: taskStats.overdue, color: 'stat-card-red', icon: AlertCircle },
    { title: 'Completed', value: taskStats.completed, color: 'stat-card-teal', icon: CheckSquare },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage maintenance tasks and inspections
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Task
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className={stat.color}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm opacity-90">{stat.title}</div>
              </div>
              <stat.icon className="w-8 h-8 opacity-80" />
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search tasks by title, description, or asset..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-4 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <SavedSearchButton
            currentEntityType="tasks"
            onExecuteSearch={(search, result) => {
              setSearchTerm(search.query || '')
              setFilters(search.filters || {})
            }}
            className="px-4 py-3"
          />
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="bg-secondary-500 text-white text-xs px-2 py-1 rounded-full">
                Active
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFiltersChange({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">All Status</option>
                  <option value="Not Inspected">Not Inspected</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                  <option value="Recently Inspected">Recently Inspected</option>
                  <option value="Scheduled for Inspection">Scheduled for Inspection</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={filters.priority}
                  onChange={(e) => handleFiltersChange({ ...filters, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">All Priorities</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFiltersChange({ ...filters, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">All Types</option>
                  <option value="Inspection">Inspection</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Safety Check">Safety Check</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Planning">Planning</option>
                  <option value="Repair">Repair</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Asset
                </label>
                <select
                  value={filters.assetId}
                  onChange={(e) => handleFiltersChange({ ...filters, assetId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">All Assets</option>
                  {assets.map(asset => (
                    <option key={asset.id} value={asset.id}>{asset.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assigned To
                </label>
                <select
                  value={filters.assignedTo}
                  onChange={(e) => handleFiltersChange({ ...filters, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">All Assignees</option>
                  <option value="Agent X">Agent X</option>
                  <option value="Agent Y">Agent Y</option>
                  <option value="Agent Z">Agent Z</option>
                  <option value="Cleaning Team">Cleaning Team</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sort Options and View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
          <button
            onClick={() => handleSortChange('dueDate')}
            className={`text-sm font-medium transition-colors ${
              sortBy === 'dueDate' 
                ? 'text-secondary-600 dark:text-secondary-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Due Date {sortBy === 'dueDate' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSortChange('priority')}
            className={`text-sm font-medium transition-colors ${
              sortBy === 'priority' 
                ? 'text-secondary-600 dark:text-secondary-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Priority {sortBy === 'priority' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSortChange('title')}
            className={`text-sm font-medium transition-colors ${
              sortBy === 'title' 
                ? 'text-secondary-600 dark:text-secondary-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Title {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <ExportMenu 
            data={filteredTasks}
            type="tasks"
            filters={{ ...filters, searchTerm }}
            title="Tasks"
          />
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' 
                ? 'bg-secondary-100 text-secondary-600 dark:bg-secondary-900 dark:text-secondary-400' 
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' 
                ? 'bg-secondary-100 text-secondary-600 dark:bg-secondary-900 dark:text-secondary-400' 
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
        <span>
          {filteredTasks.length} of {tasks.length} tasks
        </span>
        {hasActiveFilters && (
          <span className="text-secondary-600 dark:text-secondary-400">
            (filtered)
          </span>
        )}
      </div>

      {/* Tasks Grid/List */}
      {filteredTasks.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onView={handleViewTask}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onComplete={handleCompleteTask}
              />
            ))}
          </div>
        ) : (
          <TaskTableView
            tasks={filteredTasks}
            onView={handleViewTask}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onComplete={handleCompleteTask}
          />
        )
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <CheckSquare className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {hasActiveFilters ? 'No tasks match your filters' : 'No tasks found'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {hasActiveFilters 
              ? 'Try adjusting your search criteria or filters' 
              : 'Get started by creating your first task'}
          </p>
          {!hasActiveFilters && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Task
            </button>
          )}
        </div>
      )}

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        task={selectedTask}
        onEdit={handleEditTask}
      />
    </div>
  )
}

export default Tasks