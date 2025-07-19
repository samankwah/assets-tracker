import React, { useState, useEffect } from 'react'
import {
  Workflow,
  GitBranch,
  Play,
  Pause,
  Plus,
  Trash2,
  Link,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
  ArrowDown,
  Settings,
  Eye,
  Copy,
  Save,
  X
} from 'lucide-react'
import { useTaskStore } from '../../stores/taskStore'
import { useAssetStore } from '../../stores/assetStore'
import { toast } from 'react-hot-toast'

const TaskWorkflowManager = () => {
  const {
    tasks,
    dependencies,
    workflows,
    getDependencyGraph,
    addTaskDependency,
    removeDependency,
    validateDependency,
    createWorkflow,
    executeWorkflow,
    getWorkflowTemplates,
    getTaskDependencies
  } = useTaskStore()

  const { assets } = useAssetStore()

  const [activeTab, setActiveTab] = useState('dependencies')
  const [selectedTask, setSelectedTask] = useState(null)
  const [selectedWorkflow, setSelectedWorkflow] = useState(null)
  const [showCreateWorkflow, setShowCreateWorkflow] = useState(false)
  const [dependencyForm, setDependencyForm] = useState({
    dependentTask: '',
    prerequisiteTask: '',
    type: 'finish_to_start'
  })

  const [workflowForm, setWorkflowForm] = useState({
    name: '',
    description: '',
    assetTypes: [],
    triggers: [],
    steps: []
  })

  const dependencyTypes = [
    { value: 'finish_to_start', label: 'Finish to Start', description: 'Task B starts when Task A finishes' },
    { value: 'start_to_start', label: 'Start to Start', description: 'Task B starts when Task A starts' },
    { value: 'finish_to_finish', label: 'Finish to Finish', description: 'Task B finishes when Task A finishes' },
    { value: 'start_to_finish', label: 'Start to Finish', description: 'Task B finishes when Task A starts' }
  ]

  const workflowTemplates = getWorkflowTemplates()

  useEffect(() => {
    if (selectedTask) {
      const deps = getTaskDependencies(selectedTask.id)
      setSelectedTask({ ...selectedTask, dependencies: deps })
    }
  }, [dependencies, selectedTask?.id])

  const handleAddDependency = () => {
    const validation = validateDependency(
      parseInt(dependencyForm.dependentTask),
      parseInt(dependencyForm.prerequisiteTask)
    )

    if (!validation.valid) {
      toast.error(validation.error)
      return
    }

    try {
      addTaskDependency(
        parseInt(dependencyForm.dependentTask),
        parseInt(dependencyForm.prerequisiteTask),
        dependencyForm.type
      )
      toast.success('Dependency added successfully')
      setDependencyForm({ dependentTask: '', prerequisiteTask: '', type: 'finish_to_start' })
    } catch (error) {
      toast.error('Failed to add dependency')
    }
  }

  const handleRemoveDependency = (dependencyId) => {
    try {
      removeDependency(dependencyId)
      toast.success('Dependency removed')
    } catch (error) {
      toast.error('Failed to remove dependency')
    }
  }

  const handleExecuteWorkflow = async (workflowId, assetId) => {
    try {
      const result = await executeWorkflow(workflowId, assetId, {
        startDate: new Date().toISOString()
      })
      
      if (result.success) {
        toast.success(`Workflow executed successfully. Created ${result.createdTasks.length} tasks.`)
      } else {
        toast.error(result.reason || 'Failed to execute workflow')
      }
    } catch (error) {
      toast.error('Failed to execute workflow')
    }
  }

  const handleCreateWorkflowFromTemplate = (template) => {
    try {
      const workflow = createWorkflow(template)
      toast.success('Workflow created from template')
      setSelectedWorkflow(workflow)
    } catch (error) {
      toast.error('Failed to create workflow')
    }
  }

  const DependencyVisualizer = ({ task }) => {
    const deps = getTaskDependencies(task.id)
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Dependencies for: {task.title}
        </h3>
        
        <div className="space-y-4">
          {/* Prerequisites */}
          {deps.prerequisites.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prerequisites (must complete first):
              </h4>
              <div className="space-y-2">
                {deps.prerequisites.map(dep => {
                  const prereqTask = tasks.find(t => t.id === dep.prerequisiteTaskId)
                  return (
                    <div key={dep.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className={`w-4 h-4 ${
                          prereqTask?.status === 'Completed' ? 'text-green-500' : 'text-gray-400'
                        }`} />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {prereqTask?.title}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({dep.type.replace('_', ' ')})
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveDependency(dep.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Dependents */}
          {deps.dependents.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dependent tasks (waiting for this task):
              </h4>
              <div className="space-y-2">
                {deps.dependents.map(dep => {
                  const depTask = tasks.find(t => t.id === dep.dependentTaskId)
                  return (
                    <div key={dep.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {depTask?.title}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({dep.type.replace('_', ' ')})
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveDependency(dep.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {deps.prerequisites.length === 0 && deps.dependents.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No dependencies found for this task
            </p>
          )}
        </div>
      </div>
    )
  }

  const WorkflowCard = ({ workflow, onExecute, onView }) => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {workflow.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {workflow.description}
          </p>
        </div>
        <span className={`px-2 py-1 text-xs rounded ${
          workflow.isActive 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
        }`}>
          {workflow.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium mr-2">Steps:</span>
          <span>{workflow.steps?.length || 0}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium mr-2">Asset Types:</span>
          <span>{workflow.assetTypes?.join(', ') || 'All'}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium mr-2">Triggers:</span>
          <span>{workflow.triggers?.join(', ') || 'Manual'}</span>
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => onView(workflow)}
          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm flex items-center justify-center space-x-2"
        >
          <Eye className="w-4 h-4" />
          <span>View</span>
        </button>
        <div className="relative">
          <select
            onChange={(e) => {
              if (e.target.value) {
                onExecute(workflow.id, parseInt(e.target.value))
                e.target.value = ''
              }
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Execute on...</option>
            {assets.map(asset => (
              <option key={asset.id} value={asset.id}>
                {asset.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Task Workflow Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage task dependencies and automated workflows
          </p>
        </div>
        <button
          onClick={() => setShowCreateWorkflow(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Workflow</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { key: 'dependencies', label: 'Task Dependencies', icon: GitBranch },
            { key: 'workflows', label: 'Workflows', icon: Workflow },
            { key: 'templates', label: 'Templates', icon: Copy }
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

      {/* Dependencies Tab */}
      {activeTab === 'dependencies' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Tasks
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {tasks.map(task => {
                const deps = getTaskDependencies(task.id)
                const hasPrerequisites = deps.prerequisites.length > 0
                const hasDependents = deps.dependents.length > 0
                
                return (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedTask?.id === task.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {task.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {task.assetName} • {task.type}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {hasPrerequisites && (
                          <ArrowDown className="w-4 h-4 text-red-500" title="Has prerequisites" />
                        )}
                        {hasDependents && (
                          <ArrowRight className="w-4 h-4 text-blue-500" title="Has dependents" />
                        )}
                        <span className={`px-2 py-1 text-xs rounded ${
                          task.status === 'Completed' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : task.status === 'Blocked'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Add Dependency Form */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Add Dependency
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dependent Task (waits for prerequisite)
                  </label>
                  <select
                    value={dependencyForm.dependentTask}
                    onChange={(e) => setDependencyForm(prev => ({ ...prev, dependentTask: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select dependent task</option>
                    {tasks.map(task => (
                      <option key={task.id} value={task.id}>
                        {task.title} ({task.assetName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prerequisite Task (must complete first)
                  </label>
                  <select
                    value={dependencyForm.prerequisiteTask}
                    onChange={(e) => setDependencyForm(prev => ({ ...prev, prerequisiteTask: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select prerequisite task</option>
                    {tasks.map(task => (
                      <option key={task.id} value={task.id}>
                        {task.title} ({task.assetName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dependency Type
                  </label>
                  <select
                    value={dependencyForm.type}
                    onChange={(e) => setDependencyForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    {dependencyTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {dependencyTypes.find(t => t.value === dependencyForm.type)?.description}
                  </p>
                </div>

                <button
                  onClick={handleAddDependency}
                  disabled={!dependencyForm.dependentTask || !dependencyForm.prerequisiteTask}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  <Link className="w-4 h-4" />
                  <span>Add Dependency</span>
                </button>
              </div>
            </div>
          </div>

          {/* Task Dependencies Visualizer */}
          <div>
            {selectedTask ? (
              <DependencyVisualizer task={selectedTask} />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                <GitBranch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Select a Task
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose a task from the list to view and manage its dependencies
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Workflows Tab */}
      {activeTab === 'workflows' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Active Workflows
            </h2>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {workflows.length} workflow(s)
            </span>
          </div>

          {workflows.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workflows.map(workflow => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  onExecute={handleExecuteWorkflow}
                  onView={setSelectedWorkflow}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Workflow className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No workflows created
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create workflows to automate task sequences for your assets
              </p>
              <button
                onClick={() => setActiveTab('templates')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Templates
              </button>
            </div>
          )}
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Workflow Templates
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflowTemplates.map((template, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {template.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium mr-2">Steps:</span>
                    <span>{template.steps.length}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium mr-2">Asset Types:</span>
                    <span>{template.assetTypes.join(', ')}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleCreateWorkflowFromTemplate(template)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                >
                  Create from Template
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskWorkflowManager