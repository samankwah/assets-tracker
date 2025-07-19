import { create } from 'zustand'
import { useAssetStore } from './assetStore'
import { useNotificationStore } from './notificationStore'
import taskService, { mockTaskService } from '../services/taskService'
import { shouldUseMockApi } from '../services/apiService'
import { PHASES } from '../types/phaseTypes'
import { recurringTaskUtils } from '../utils/recurringTaskUtils'
import { taskTemplates } from '../data/taskTemplates'

// Mock task data matching the Figma design
const mockTasks = [
  {
    id: 1,
    title: 'Roof Inspection for Block C',
    description: 'Annual roof inspection and maintenance for Block C properties',
    assetId: 1,
    assetName: 'Los Palmas Apartment',
    type: 'Inspection',
    status: 'Not Inspected',
    priority: 'High',
    dueDate: '2025-07-23T09:00:00Z',
    time: '08:00 AM',
    assignedTo: 'Agent X',
    frequency: 'Monthly',
    condition: 'Needs Repairs',
    relatedPhase: PHASES.ACTIVE,
    phaseSpecific: true,
    phaseRequirement: false,
    blockedByPhase: false,
    notifications: {
      email: true,
      sms: false,
      inApp: true
    },
    notificationSettings: {
      type: 'Email',
      reminderTime: '2 days before'
    },
    createdAt: '2025-07-10T10:00:00Z',
    updatedAt: '2025-07-17T10:00:00Z'
  },
  {
    id: 2,
    title: 'Plumbing Maintenance',
    description: 'Quarterly plumbing system check and maintenance',
    assetId: 2,
    assetName: 'Gregory Street House',
    type: 'Maintenance',
    status: 'Recently Inspected',
    priority: 'Medium',
    dueDate: '2025-08-01T14:00:00Z',
    time: '02:00 PM',
    assignedTo: 'Agent Y',
    frequency: 'Quarterly',
    condition: 'Good',
    relatedPhase: PHASES.MAINTENANCE,
    phaseSpecific: true,
    phaseRequirement: true,
    blockedByPhase: false,
    notifications: {
      email: true,
      sms: true,
      inApp: true
    },
    notificationSettings: {
      type: 'Email',
      reminderTime: '1 day before'
    },
    createdAt: '2025-07-05T10:00:00Z',
    updatedAt: '2025-07-15T10:00:00Z'
  },
  {
    id: 3,
    title: 'Kitchen Renovation Planning',
    description: 'Planning and assessment for kitchen renovation project',
    assetId: 3,
    assetName: 'Calgary Street Condo',
    type: 'Planning',
    status: 'Overdue',
    priority: 'High',
    dueDate: '2025-07-20T10:00:00Z',
    time: '10:00 AM',
    assignedTo: 'Agent Z',
    frequency: 'One-time',
    condition: 'Critical',
    relatedPhase: PHASES.DISPOSAL,
    phaseSpecific: true,
    phaseRequirement: false,
    blockedByPhase: false,
    notifications: {
      email: true,
      sms: false,
      inApp: true
    },
    notificationSettings: {
      type: 'Email',
      reminderTime: '3 days before'
    },
    createdAt: '2025-07-01T10:00:00Z',
    updatedAt: '2025-07-12T10:00:00Z'
  },
  {
    id: 4,
    title: 'Safety Check',
    description: 'Monthly safety inspection and equipment check',
    assetId: 1,
    assetName: 'Los Palmas Apartment',
    type: 'Safety Check',
    status: 'Scheduled for Inspection',
    priority: 'Medium',
    dueDate: '2025-07-25T11:00:00Z',
    time: '11:00 AM',
    assignedTo: 'Agent X',
    frequency: 'Monthly',
    condition: 'Fair',
    relatedPhase: PHASES.ACTIVE,
    phaseSpecific: true,
    phaseRequirement: true,
    blockedByPhase: false,
    notifications: {
      email: true,
      sms: false,
      inApp: true
    },
    notificationSettings: {
      type: 'Email',
      reminderTime: '1 day before'
    },
    createdAt: '2025-07-08T10:00:00Z',
    updatedAt: '2025-07-16T10:00:00Z'
  },
  {
    id: 5,
    title: 'Cleaning Service',
    description: 'Deep cleaning service for common areas',
    assetId: 2,
    assetName: 'Gregory Street House',
    type: 'Cleaning',
    status: 'Under Maintenance',
    priority: 'Low',
    dueDate: '2025-08-05T09:00:00Z',
    time: '09:00 AM',
    assignedTo: 'Cleaning Team',
    frequency: 'Weekly',
    condition: 'Good',
    relatedPhase: PHASES.MAINTENANCE,
    phaseSpecific: false,
    phaseRequirement: false,
    blockedByPhase: false,
    notifications: {
      email: false,
      sms: false,
      inApp: true
    },
    notificationSettings: {
      type: 'In-App',
      reminderTime: '1 day before'
    },
    createdAt: '2025-07-12T10:00:00Z',
    updatedAt: '2025-07-17T10:00:00Z'
  }
]

export const useTaskStore = create((set, get) => ({
  tasks: mockTasks,
  selectedTask: null,
  loading: false,
  error: null,
  filters: {
    status: '',
    priority: '',
    type: '',
    assetId: '',
    assignedTo: '',
    relatedPhase: '',
    phaseSpecific: null,
    phaseRequirement: null
  },
  searchTerm: '',
  sortBy: 'dueDate',
  sortOrder: 'asc',

  // Dependencies and workflows
  dependencies: [], // Array of dependency relationships
  workflows: [], // Array of workflow templates
  taskHistory: [], // Task state change history

  // Task CRUD operations
  createTask: (taskData) => {
    // Get asset phase context if assetId is provided
    let phaseContext = {}
    if (taskData.assetId) {
      const { getAssetById } = useAssetStore.getState()
      const asset = getAssetById(taskData.assetId)
      if (asset && asset.currentPhase) {
        phaseContext = {
          relatedPhase: asset.currentPhase,
          phaseSpecific: taskData.phaseSpecific ?? true,
          phaseRequirement: taskData.phaseRequirement ?? false,
          blockedByPhase: taskData.blockedByPhase ?? false
        }
      }
    }
    
    const newTask = {
      id: Date.now(),
      ...taskData,
      ...phaseContext,
      status: 'Not Inspected',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    set(state => ({ tasks: [...state.tasks, newTask] }))
    
    // Create notifications for the new task
    const { createTaskNotifications } = useNotificationStore.getState()
    createTaskNotifications(newTask)
    
    return newTask
  },

  updateTask: (id, taskData) => {
    set(state => ({
      tasks: state.tasks.map(task => 
        task.id === id 
          ? { ...task, ...taskData, updatedAt: new Date().toISOString() }
          : task
      )
    }))
  },

  deleteTask: (id) => {
    set(state => ({
      tasks: state.tasks.filter(task => task.id !== id)
    }))
  },

  // Task completion
  completeTask: (id) => {
    const { tasks } = get()
    const taskToComplete = tasks.find(task => task.id === id)
    
    set(state => ({
      tasks: state.tasks.map(task => 
        task.id === id 
          ? { ...task, status: 'Completed', updatedAt: new Date().toISOString() }
          : task
      )
    }))
    
    // Create completion notification with all notification types
    if (taskToComplete) {
      const { addNotificationWithAll } = useNotificationStore.getState()
      const { assets } = useAssetStore.getState()
      const asset = assets.find(a => a.id === taskToComplete.assetId)
      
      addNotificationWithAll({
        type: 'maintenance_completed',
        title: 'Task Completed',
        message: `${taskToComplete.type} for ${taskToComplete.assetName || asset?.name} has been completed`,
        assetId: taskToComplete.assetId,
        taskId: taskToComplete.id
      }, { task: taskToComplete, asset })
    }
  },

  // Task selection
  setSelectedTask: (task) => set({ selectedTask: task }),

  // Filtering and search
  setFilters: (filters) => set({ filters }),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  setSorting: (sortBy, sortOrder) => set({ sortBy, sortOrder }),

  // Computed getters
  getFilteredTasks: () => {
    const { tasks, filters, searchTerm, sortBy, sortOrder } = get()
    
    let filteredTasks = tasks.filter(task => {
      const matchesSearch = searchTerm === '' || 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.assetName.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = filters.status === '' || task.status === filters.status
      const matchesPriority = filters.priority === '' || task.priority === filters.priority
      const matchesType = filters.type === '' || task.type === filters.type
      const matchesAsset = filters.assetId === '' || task.assetId.toString() === filters.assetId
      const matchesAssignee = filters.assignedTo === '' || task.assignedTo === filters.assignedTo
      const matchesPhase = filters.relatedPhase === '' || task.relatedPhase === filters.relatedPhase
      const matchesPhaseSpecific = filters.phaseSpecific === null || task.phaseSpecific === filters.phaseSpecific
      const matchesPhaseRequirement = filters.phaseRequirement === null || task.phaseRequirement === filters.phaseRequirement

      return matchesSearch && matchesStatus && matchesPriority && matchesType && matchesAsset && matchesAssignee && matchesPhase && matchesPhaseSpecific && matchesPhaseRequirement
    })

    // Sort tasks
    filteredTasks.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]

      if (sortBy === 'dueDate') {
        aValue = new Date(aValue)
        bValue = new Date(bValue)
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filteredTasks
  },

  getTaskById: (id) => {
    const { tasks } = get()
    return tasks.find(task => task.id === id)
  },

  getTasksByAsset: (assetId) => {
    const { tasks } = get()
    return tasks.filter(task => task.assetId === assetId)
  },

  getTaskStats: () => {
    const { tasks } = get()
    const now = new Date()
    
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'Not Inspected').length,
      inProgress: tasks.filter(t => t.status === 'Under Maintenance').length,
      completed: tasks.filter(t => t.status === 'Completed').length,
      overdue: tasks.filter(t => new Date(t.dueDate) < now && t.status !== 'Completed').length,
      today: tasks.filter(t => {
        const taskDate = new Date(t.dueDate)
        return taskDate.toDateString() === now.toDateString()
      }).length,
      thisWeek: tasks.filter(t => {
        const taskDate = new Date(t.dueDate)
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - now.getDay())
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        return taskDate >= weekStart && taskDate <= weekEnd
      }).length,
      highPriority: tasks.filter(t => t.priority === 'High').length
    }
  },

  getUpcomingTasks: (days = 7) => {
    const { tasks } = get()
    const now = new Date()
    const futureDate = new Date()
    futureDate.setDate(now.getDate() + days)

    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate)
      return taskDate >= now && taskDate <= futureDate && task.status !== 'Completed'
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
  },

  // Loading states
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // API integration methods
  fetchTasks: async (filters = {}) => {
    const { setLoading, setError } = get()
    setLoading(true)
    setError(null)

    try {
      const service = shouldUseMockApi() ? mockTaskService : taskService
      const response = await service.getTasks(filters)
      
      set({ 
        tasks: response.tasks || response,
        loading: false 
      })
      
      return response
    } catch (error) {
      setError(error.message)
      setLoading(false)
      throw error
    }
  },

  fetchTaskById: async (id) => {
    const { setLoading, setError } = get()
    setLoading(true)
    setError(null)

    try {
      const service = shouldUseMockApi() ? mockTaskService : taskService
      const task = await service.getTaskById(id)
      
      setLoading(false)
      return task
    } catch (error) {
      setError(error.message)
      setLoading(false)
      throw error
    }
  },

  createTaskApi: async (taskData) => {
    const { setLoading, setError, createTask } = get()
    setLoading(true)
    setError(null)

    try {
      const service = shouldUseMockApi() ? mockTaskService : taskService
      const newTask = await service.createTask(taskData)
      
      // Update local state
      createTask(newTask)
      setLoading(false)
      
      return newTask
    } catch (error) {
      setError(error.message)
      setLoading(false)
      throw error
    }
  },

  updateTaskApi: async (id, taskData) => {
    const { setLoading, setError, updateTask } = get()
    setLoading(true)
    setError(null)

    try {
      const service = shouldUseMockApi() ? mockTaskService : taskService
      const updatedTask = await service.updateTask(id, taskData)
      
      // Update local state
      updateTask(id, updatedTask)
      setLoading(false)
      
      return updatedTask
    } catch (error) {
      setError(error.message)
      setLoading(false)
      throw error
    }
  },

  deleteTaskApi: async (id) => {
    const { setLoading, setError, deleteTask } = get()
    setLoading(true)
    setError(null)

    try {
      const service = shouldUseMockApi() ? mockTaskService : taskService
      await service.deleteTask(id)
      
      // Update local state
      deleteTask(id)
      setLoading(false)
      
      return { success: true }
    } catch (error) {
      setError(error.message)
      setLoading(false)
      throw error
    }
  },

  completeTaskApi: async (id) => {
    const { setLoading, setError, completeTask } = get()
    setLoading(true)
    setError(null)

    try {
      const service = shouldUseMockApi() ? mockTaskService : taskService
      await service.completeTask(id)
      
      // Update local state
      completeTask(id)
      setLoading(false)
      
      return { success: true }
    } catch (error) {
      setError(error.message)
      setLoading(false)
      throw error
    }
  },

  fetchTaskStats: async () => {
    const { setLoading, setError } = get()
    setLoading(true)
    setError(null)

    try {
      const service = shouldUseMockApi() ? mockTaskService : taskService
      const stats = await service.getTaskStats()
      
      setLoading(false)
      return stats
    } catch (error) {
      setError(error.message)
      setLoading(false)
      throw error
    }
  },

  // Recurring task management
  generateRecurringTasks: async (startDate, endDate, templateIds = null) => {
    const { setLoading, setError } = get()
    setLoading(true)
    
    try {
      const { assets } = useAssetStore.getState()
      
      // Filter templates if specific template IDs are provided
      const templates = templateIds 
        ? taskTemplates.filter(t => templateIds.includes(t.id))
        : taskTemplates.filter(t => t.frequency !== 'One-time')
      
      const generatedTasks = recurringTaskUtils.generateRecurringTasks(
        templates,
        assets,
        startDate,
        endDate
      )
      
      // Add generated tasks to the store
      set(state => ({
        tasks: [...state.tasks, ...generatedTasks]
      }))
      
      setLoading(false)
      return generatedTasks
    } catch (error) {
      setError(error.message)
      setLoading(false)
      throw error
    }
  },

  getUpcomingRecurringTasks: (lookAheadDays = 30) => {
    const { tasks } = get()
    const { assets } = useAssetStore.getState()
    
    return recurringTaskUtils.getUpcomingRecurringTasks(
      tasks,
      taskTemplates,
      assets,
      lookAheadDays
    )
  },

  autoGenerateRecurringTasks: async (lookAheadDays = 30) => {
    const { setLoading, setError } = get()
    setLoading(true)
    
    try {
      const upcomingTasks = get().getUpcomingRecurringTasks(lookAheadDays)
      
      if (upcomingTasks.length > 0) {
        set(state => ({
          tasks: [...state.tasks, ...upcomingTasks]
        }))
        
        // Send notification about generated tasks
        const { addNotification } = useNotificationStore.getState()
        addNotification({
          id: Date.now(),
          title: 'Recurring Tasks Generated',
          message: `${upcomingTasks.length} recurring tasks have been automatically generated.`,
          type: 'info',
          category: 'task',
          timestamp: new Date().toISOString(),
          read: false
        })
      }
      
      setLoading(false)
      return upcomingTasks
    } catch (error) {
      setError(error.message)
      setLoading(false)
      throw error
    }
  },

  getRecurringTaskStats: () => {
    const { tasks } = get()
    return recurringTaskUtils.getRecurringTaskStats(tasks)
  },

  completeRecurringTask: async (taskId) => {
    const { updateTask, getTaskById } = get()
    const task = getTaskById(taskId)
    
    if (!task || !task.isRecurring) {
      throw new Error('Task not found or not a recurring task')
    }
    
    // Mark current task as completed
    await updateTask(taskId, { 
      status: 'Completed',
      completedAt: new Date().toISOString()
    })
    
    // Generate next occurrence if it's a recurring task
    if (task.frequency !== 'One-time') {
      const nextDueDate = recurringTaskUtils.calculateNextOccurrence(task.dueDate, task.frequency)
      
      if (nextDueDate) {
        const nextTask = recurringTaskUtils.createRecurringTaskData(task, nextDueDate)
        
        set(state => ({
          tasks: [...state.tasks, nextTask]
        }))
        
        return nextTask
      }
    }
    
    return null
  },

  validateRecurringTask: (taskData) => {
    return recurringTaskUtils.validateRecurringConfig(taskData)
  },

  // Initialize store with data
  initializeStore: async () => {
    const { fetchTasks } = get()
    
    try {
      await fetchTasks()
      
      // Auto-generate recurring tasks on initialization
      setTimeout(() => {
        get().autoGenerateRecurringTasks()
      }, 1000)
    } catch (error) {
      console.error('Failed to initialize task store:', error)
    }
  },

  // Task Dependencies Management
  addTaskDependency: (dependentTaskId, prerequisiteTaskId, dependencyType = 'finish_to_start') => {
    const dependency = {
      id: Date.now(),
      dependentTaskId,
      prerequisiteTaskId,
      type: dependencyType, // finish_to_start, start_to_start, finish_to_finish, start_to_finish
      createdAt: new Date().toISOString(),
      isActive: true
    }

    set(state => ({
      dependencies: [...state.dependencies, dependency]
    }))

    // Update task status if needed
    get().updateTaskDependencyStatus(dependentTaskId)
    
    return dependency
  },

  removeDependency: (dependencyId) => {
    const { dependencies } = get()
    const dependency = dependencies.find(d => d.id === dependencyId)
    
    set(state => ({
      dependencies: state.dependencies.filter(d => d.id !== dependencyId)
    }))

    // Update dependent task status
    if (dependency) {
      get().updateTaskDependencyStatus(dependency.dependentTaskId)
    }
  },

  getTaskDependencies: (taskId) => {
    const { dependencies } = get()
    return {
      prerequisites: dependencies.filter(d => d.dependentTaskId === taskId && d.isActive),
      dependents: dependencies.filter(d => d.prerequisiteTaskId === taskId && d.isActive)
    }
  },

  updateTaskDependencyStatus: (taskId) => {
    const { tasks, dependencies } = get()
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    const prerequisites = dependencies.filter(d => d.dependentTaskId === taskId && d.isActive)
    
    // Check if all prerequisites are met
    const prerequisiteTasks = prerequisites.map(dep => 
      tasks.find(t => t.id === dep.prerequisiteTaskId)
    ).filter(Boolean)

    const allPrerequisitesMet = prerequisiteTasks.every(prereqTask => {
      // Different dependency types have different completion criteria
      const dep = prerequisites.find(d => d.prerequisiteTaskId === prereqTask.id)
      switch (dep.type) {
        case 'finish_to_start':
          return prereqTask.status === 'Completed'
        case 'start_to_start':
          return ['Under Maintenance', 'Completed'].includes(prereqTask.status)
        case 'finish_to_finish':
          return prereqTask.status === 'Completed'
        case 'start_to_finish':
          return ['Under Maintenance', 'Completed'].includes(prereqTask.status)
        default:
          return prereqTask.status === 'Completed'
      }
    })

    // Update task if it's blocked/unblocked
    if (prerequisites.length > 0) {
      const isBlocked = !allPrerequisitesMet
      const currentlyBlocked = task.status === 'Blocked'
      
      if (isBlocked && !currentlyBlocked) {
        get().updateTask(taskId, { 
          status: 'Blocked',
          blockedReason: 'Waiting for prerequisite tasks to complete'
        })
      } else if (!isBlocked && currentlyBlocked) {
        get().updateTask(taskId, { 
          status: 'Not Inspected',
          blockedReason: null
        })
      }
    }
  },

  // Check if task can be started based on dependencies
  canTaskBeStarted: (taskId) => {
    const { tasks, dependencies } = get()
    const prerequisites = dependencies.filter(d => d.dependentTaskId === taskId && d.isActive)
    
    if (prerequisites.length === 0) return true

    const prerequisiteTasks = prerequisites.map(dep => 
      tasks.find(t => t.id === dep.prerequisiteTaskId)
    ).filter(Boolean)

    return prerequisiteTasks.every(prereqTask => {
      const dep = prerequisites.find(d => d.prerequisiteTaskId === prereqTask.id)
      switch (dep.type) {
        case 'finish_to_start':
          return prereqTask.status === 'Completed'
        case 'start_to_start':
          return ['Under Maintenance', 'Completed'].includes(prereqTask.status)
        case 'finish_to_finish':
          return prereqTask.status === 'Completed'
        case 'start_to_finish':
          return ['Under Maintenance', 'Completed'].includes(prereqTask.status)
        default:
          return prereqTask.status === 'Completed'
      }
    })
  },

  // Workflow Management
  createWorkflow: (workflowData) => {
    const workflow = {
      id: Date.now(),
      name: workflowData.name,
      description: workflowData.description,
      steps: workflowData.steps || [], // Array of workflow steps
      triggers: workflowData.triggers || [], // When this workflow should be triggered
      conditions: workflowData.conditions || [], // Conditions for workflow execution
      assetTypes: workflowData.assetTypes || [], // Asset types this applies to
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    set(state => ({
      workflows: [...state.workflows, workflow]
    }))

    return workflow
  },

  executeWorkflow: async (workflowId, assetId, triggerData = {}) => {
    const { workflows, createTask, addTaskDependency } = get()
    const workflow = workflows.find(w => w.id === workflowId)
    
    if (!workflow || !workflow.isActive) {
      throw new Error('Workflow not found or inactive')
    }

    const { getAssetById } = useAssetStore.getState()
    const asset = getAssetById(assetId)
    
    if (!asset) {
      throw new Error('Asset not found')
    }

    // Check if workflow applies to this asset type
    if (workflow.assetTypes.length > 0 && !workflow.assetTypes.includes(asset.type)) {
      return { success: false, reason: 'Workflow does not apply to this asset type' }
    }

    // Execute workflow steps
    const createdTasks = []
    let previousTaskId = null

    for (const step of workflow.steps) {
      const taskData = {
        title: step.title.replace('{assetName}', asset.name),
        description: step.description.replace('{assetName}', asset.name),
        assetId: assetId,
        assetName: asset.name,
        type: step.type,
        priority: step.priority,
        assignedTo: step.assignedTo,
        dueDate: get().calculateStepDueDate(step, triggerData.startDate),
        frequency: step.frequency || 'One-time',
        workflowId: workflowId,
        workflowStepId: step.id,
        ...step.additionalData
      }

      const task = createTask(taskData)
      createdTasks.push(task)

      // Add dependency to previous task if specified
      if (step.dependsOnPrevious && previousTaskId) {
        addTaskDependency(task.id, previousTaskId, step.dependencyType || 'finish_to_start')
      }

      // Add dependencies to specific steps
      if (step.dependencies) {
        step.dependencies.forEach(depStepId => {
          const depTask = createdTasks.find(t => t.workflowStepId === depStepId)
          if (depTask) {
            addTaskDependency(task.id, depTask.id, step.dependencyType || 'finish_to_start')
          }
        })
      }

      previousTaskId = task.id
    }

    // Record workflow execution
    const execution = {
      id: Date.now(),
      workflowId,
      assetId,
      executedAt: new Date().toISOString(),
      createdTasks: createdTasks.map(t => t.id),
      triggerData,
      status: 'executed'
    }

    // Log workflow execution in task history
    get().addTaskHistoryEntry({
      type: 'workflow_executed',
      workflowId,
      assetId,
      taskIds: createdTasks.map(t => t.id),
      timestamp: new Date().toISOString(),
      details: execution
    })

    return {
      success: true,
      execution,
      createdTasks
    }
  },

  calculateStepDueDate: (step, startDate) => {
    const baseDate = startDate ? new Date(startDate) : new Date()
    
    if (step.daysFromStart) {
      const dueDate = new Date(baseDate)
      dueDate.setDate(baseDate.getDate() + step.daysFromStart)
      return dueDate.toISOString()
    }
    
    if (step.relativeDueDate) {
      const dueDate = new Date(baseDate)
      const { value, unit } = step.relativeDueDate
      
      switch (unit) {
        case 'days':
          dueDate.setDate(baseDate.getDate() + value)
          break
        case 'weeks':
          dueDate.setDate(baseDate.getDate() + (value * 7))
          break
        case 'months':
          dueDate.setMonth(baseDate.getMonth() + value)
          break
        default:
          dueDate.setDate(baseDate.getDate() + 1)
      }
      
      return dueDate.toISOString()
    }
    
    // Default: due tomorrow
    const dueDate = new Date(baseDate)
    dueDate.setDate(baseDate.getDate() + 1)
    return dueDate.toISOString()
  },

  // Predefined workflow templates
  getWorkflowTemplates: () => [
    {
      name: 'New Asset Onboarding',
      description: 'Complete workflow for onboarding a new asset',
      steps: [
        {
          id: 1,
          title: 'Initial Inspection for {assetName}',
          description: 'Conduct comprehensive initial inspection',
          type: 'Inspection',
          priority: 'High',
          daysFromStart: 1,
          dependsOnPrevious: false
        },
        {
          id: 2,
          title: 'Documentation Setup for {assetName}',
          description: 'Set up asset documentation and records',
          type: 'Documentation',
          priority: 'Medium',
          daysFromStart: 2,
          dependsOnPrevious: true
        },
        {
          id: 3,
          title: 'Safety Assessment for {assetName}',
          description: 'Conduct safety and compliance assessment',
          type: 'Safety Check',
          priority: 'High',
          daysFromStart: 3,
          dependsOnPrevious: false
        },
        {
          id: 4,
          title: 'Maintenance Schedule Setup for {assetName}',
          description: 'Establish regular maintenance schedule',
          type: 'Planning',
          priority: 'Medium',
          daysFromStart: 7,
          dependsOnPrevious: true,
          dependencies: [1, 3]
        }
      ],
      assetTypes: ['Apartment', 'House', 'Condo', 'Commercial'],
      triggers: ['asset_created', 'asset_acquired']
    },
    {
      name: 'Quarterly Maintenance Cycle',
      description: 'Standard quarterly maintenance workflow',
      steps: [
        {
          id: 1,
          title: 'Pre-Maintenance Inspection for {assetName}',
          description: 'Inspect asset before maintenance work',
          type: 'Inspection',
          priority: 'Medium',
          daysFromStart: 0
        },
        {
          id: 2,
          title: 'HVAC Maintenance for {assetName}',
          description: 'Service and maintain HVAC systems',
          type: 'Maintenance',
          priority: 'High',
          daysFromStart: 2,
          dependsOnPrevious: true
        },
        {
          id: 3,
          title: 'Plumbing Check for {assetName}',
          description: 'Inspect and maintain plumbing systems',
          type: 'Maintenance',
          priority: 'Medium',
          daysFromStart: 3,
          dependsOnPrevious: false
        },
        {
          id: 4,
          title: 'Electrical Systems Check for {assetName}',
          description: 'Inspect electrical systems and safety',
          type: 'Safety Check',
          priority: 'High',
          daysFromStart: 4,
          dependsOnPrevious: false
        },
        {
          id: 5,
          title: 'Post-Maintenance Inspection for {assetName}',
          description: 'Final inspection after maintenance work',
          type: 'Inspection',
          priority: 'Medium',
          daysFromStart: 7,
          dependsOnPrevious: true,
          dependencies: [2, 3, 4]
        }
      ],
      assetTypes: ['Apartment', 'House', 'Condo', 'Commercial'],
      triggers: ['quarterly_schedule', 'maintenance_due']
    },
    {
      name: 'Emergency Response Workflow',
      description: 'Emergency response and repair workflow',
      steps: [
        {
          id: 1,
          title: 'Emergency Assessment for {assetName}',
          description: 'Immediate assessment of emergency situation',
          type: 'Inspection',
          priority: 'High',
          daysFromStart: 0
        },
        {
          id: 2,
          title: 'Safety Measures for {assetName}',
          description: 'Implement immediate safety measures',
          type: 'Safety Check',
          priority: 'High',
          daysFromStart: 0,
          dependsOnPrevious: true
        },
        {
          id: 3,
          title: 'Emergency Repair for {assetName}',
          description: 'Conduct emergency repairs',
          type: 'Emergency Repair',
          priority: 'High',
          daysFromStart: 1,
          dependsOnPrevious: true
        },
        {
          id: 4,
          title: 'Post-Emergency Inspection for {assetName}',
          description: 'Verify repairs and safety',
          type: 'Inspection',
          priority: 'High',
          daysFromStart: 2,
          dependsOnPrevious: true
        }
      ],
      assetTypes: ['Apartment', 'House', 'Condo', 'Commercial'],
      triggers: ['emergency_reported', 'critical_condition']
    }
  ],

  // Task History Management
  addTaskHistoryEntry: (entry) => {
    const historyEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...entry
    }

    set(state => ({
      taskHistory: [historyEntry, ...state.taskHistory.slice(0, 999)] // Keep last 1000 entries
    }))
  },

  getTaskHistory: (taskId) => {
    const { taskHistory } = get()
    return taskHistory.filter(entry => 
      entry.taskId === taskId || 
      (entry.taskIds && entry.taskIds.includes(taskId))
    )
  },

  // Enhanced task completion with dependency propagation
  completeTaskWithDependencies: async (taskId) => {
    const { tasks, completeTask, dependencies, updateTaskDependencyStatus } = get()
    const task = tasks.find(t => t.id === taskId)
    
    if (!task) {
      throw new Error('Task not found')
    }

    // Complete the task
    await completeTask(taskId)

    // Update all dependent tasks
    const dependentTasks = dependencies
      .filter(d => d.prerequisiteTaskId === taskId && d.isActive)
      .map(d => d.dependentTaskId)

    dependentTasks.forEach(dependentTaskId => {
      updateTaskDependencyStatus(dependentTaskId)
    })

    // Record completion in history
    get().addTaskHistoryEntry({
      type: 'task_completed',
      taskId,
      affectedDependencies: dependentTasks,
      completedAt: new Date().toISOString()
    })

    // Check if this completes a workflow
    const workflow = get().checkWorkflowCompletion(taskId)
    if (workflow) {
      get().addTaskHistoryEntry({
        type: 'workflow_completed',
        workflowId: workflow.id,
        assetId: task.assetId,
        completedAt: new Date().toISOString()
      })
    }

    return {
      completedTask: task,
      affectedDependencies: dependentTasks,
      completedWorkflow: workflow
    }
  },

  checkWorkflowCompletion: (completedTaskId) => {
    const { tasks, workflows } = get()
    const completedTask = tasks.find(t => t.id === completedTaskId)
    
    if (!completedTask?.workflowId) return null

    const workflow = workflows.find(w => w.id === completedTask.workflowId)
    if (!workflow) return null

    // Check if all tasks in this workflow are completed
    const workflowTasks = tasks.filter(t => t.workflowId === workflow.id && t.assetId === completedTask.assetId)
    const allCompleted = workflowTasks.every(t => t.status === 'Completed')

    return allCompleted ? workflow : null
  },

  // Auto-trigger workflows based on conditions
  checkWorkflowTriggers: (trigger, assetId, additionalData = {}) => {
    const { workflows } = get()
    const triggeredWorkflows = []

    workflows.forEach(workflow => {
      if (workflow.isActive && workflow.triggers.includes(trigger)) {
        // Check conditions if any
        const conditionsMet = workflow.conditions.every(condition => {
          // Implement condition checking logic based on condition type
          return get().evaluateWorkflowCondition(condition, assetId, additionalData)
        })

        if (conditionsMet) {
          triggeredWorkflows.push(workflow)
        }
      }
    })

    return triggeredWorkflows
  },

  evaluateWorkflowCondition: (condition, assetId, data) => {
    const { getAssetById } = useAssetStore.getState()
    const asset = getAssetById(assetId)
    
    if (!asset) return false

    switch (condition.type) {
      case 'asset_condition':
        return condition.value.includes(asset.condition)
      case 'asset_type':
        return condition.value.includes(asset.type)
      case 'has_no_recent_inspection':
        const daysSinceInspection = asset.lastInspection ? 
          Math.floor((new Date() - new Date(asset.lastInspection)) / (1000 * 60 * 60 * 24)) : 999
        return daysSinceInspection > condition.value
      default:
        return true
    }
  },

  // Get dependency graph for visualization
  getDependencyGraph: () => {
    const { tasks, dependencies } = get()
    const nodes = tasks.map(task => ({
      id: task.id,
      label: task.title,
      status: task.status,
      priority: task.priority,
      type: task.type
    }))

    const edges = dependencies
      .filter(d => d.isActive)
      .map(dep => ({
        from: dep.prerequisiteTaskId,
        to: dep.dependentTaskId,
        type: dep.type,
        id: dep.id
      }))

    return { nodes, edges }
  },

  // Validation methods
  validateDependency: (dependentTaskId, prerequisiteTaskId) => {
    const { dependencies } = get()
    
    // Check for circular dependencies
    const wouldCreateCircle = get().checkCircularDependency(dependentTaskId, prerequisiteTaskId)
    if (wouldCreateCircle) {
      return { valid: false, error: 'This dependency would create a circular reference' }
    }

    // Check if dependency already exists
    const exists = dependencies.some(d => 
      d.dependentTaskId === dependentTaskId && 
      d.prerequisiteTaskId === prerequisiteTaskId && 
      d.isActive
    )
    if (exists) {
      return { valid: false, error: 'This dependency already exists' }
    }

    return { valid: true }
  },

  checkCircularDependency: (taskId, newPrerequisiteId, visited = new Set()) => {
    if (visited.has(taskId)) {
      return taskId === newPrerequisiteId
    }

    visited.add(taskId)
    const { dependencies } = get()
    
    const prerequisites = dependencies
      .filter(d => d.dependentTaskId === taskId && d.isActive)
      .map(d => d.prerequisiteTaskId)

    prerequisites.push(newPrerequisiteId)

    for (const prereqId of prerequisites) {
      if (get().checkCircularDependency(prereqId, newPrerequisiteId, new Set(visited))) {
        return true
      }
    }

    return false
  }
}))