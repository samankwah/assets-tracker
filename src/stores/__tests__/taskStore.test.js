import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useTaskStore } from '../taskStore'

// Mock the notification store
vi.mock('../notificationStore', () => ({
  useNotificationStore: {
    getState: () => ({
      createTaskNotifications: vi.fn(),
      createMaintenanceCompleted: vi.fn()
    })
  }
}))

describe('TaskStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useTaskStore.setState({
      tasks: [],
      selectedTask: null,
      filters: {
        status: '',
        priority: '',
        type: '',
        assetId: '',
        assignedTo: ''
      },
      searchTerm: '',
      sortBy: 'dueDate',
      sortOrder: 'asc'
    })
  })

  it('initializes with default state', () => {
    const store = useTaskStore.getState()
    
    expect(store.tasks).toBeDefined()
    expect(store.selectedTask).toBeNull()
    expect(store.filters).toEqual({
      status: '',
      priority: '',
      type: '',
      assetId: '',
      assignedTo: ''
    })
    expect(store.searchTerm).toBe('')
    expect(store.sortBy).toBe('dueDate')
    expect(store.sortOrder).toBe('asc')
  })

  it('creates a new task', () => {
    const store = useTaskStore.getState()
    const newTaskData = {
      title: 'Test Task',
      description: 'Test Description',
      assetId: 1,
      assetName: 'Test Asset',
      type: 'Inspection',
      priority: 'High',
      dueDate: '2025-08-01T09:00:00Z',
      assignedTo: 'Agent X'
    }

    const createdTask = store.createTask(newTaskData)
    const tasks = useTaskStore.getState().tasks

    expect(createdTask).toMatchObject(newTaskData)
    expect(createdTask.id).toBeDefined()
    expect(createdTask.status).toBe('Not Inspected')
    expect(createdTask.createdAt).toBeDefined()
    expect(createdTask.updatedAt).toBeDefined()
    expect(tasks).toContain(createdTask)
  })

  it('updates an existing task', () => {
    const store = useTaskStore.getState()
    
    // Create a task first
    const createdTask = store.createTask({
      title: 'Test Task',
      description: 'Test Description',
      type: 'Inspection',
      priority: 'High'
    })

    // Update the task
    const updateData = {
      title: 'Updated Task',
      priority: 'Medium'
    }

    store.updateTask(createdTask.id, updateData)
    const tasks = useTaskStore.getState().tasks
    const updatedTask = tasks.find(t => t.id === createdTask.id)

    expect(updatedTask.title).toBe('Updated Task')
    expect(updatedTask.priority).toBe('Medium')
    expect(updatedTask.updatedAt).not.toBe(createdTask.updatedAt)
  })

  it('deletes a task', () => {
    const store = useTaskStore.getState()
    
    // Create a task first
    const createdTask = store.createTask({
      title: 'Test Task',
      type: 'Inspection'
    })

    // Delete the task
    store.deleteTask(createdTask.id)
    const tasks = useTaskStore.getState().tasks

    expect(tasks).not.toContain(createdTask)
    expect(tasks.find(t => t.id === createdTask.id)).toBeUndefined()
  })

  it('completes a task', () => {
    const store = useTaskStore.getState()
    
    // Create a task first
    const createdTask = store.createTask({
      title: 'Test Task',
      type: 'Inspection',
      status: 'Not Inspected'
    })

    // Complete the task
    store.completeTask(createdTask.id)
    const tasks = useTaskStore.getState().tasks
    const completedTask = tasks.find(t => t.id === createdTask.id)

    expect(completedTask.status).toBe('Completed')
    expect(completedTask.updatedAt).not.toBe(createdTask.updatedAt)
  })

  it('sets selected task', () => {
    const store = useTaskStore.getState()
    const task = { id: 1, title: 'Test Task' }

    store.setSelectedTask(task)
    const selectedTask = useTaskStore.getState().selectedTask

    expect(selectedTask).toBe(task)
  })

  it('updates filters', () => {
    const store = useTaskStore.getState()
    const newFilters = {
      status: 'Completed',
      priority: 'High',
      type: 'Inspection',
      assetId: '1',
      assignedTo: 'Agent X'
    }

    store.setFilters(newFilters)
    const filters = useTaskStore.getState().filters

    expect(filters).toEqual(newFilters)
  })

  it('updates search term', () => {
    const store = useTaskStore.getState()
    const searchTerm = 'test search'

    store.setSearchTerm(searchTerm)
    const currentSearchTerm = useTaskStore.getState().searchTerm

    expect(currentSearchTerm).toBe(searchTerm)
  })

  it('updates sorting', () => {
    const store = useTaskStore.getState()

    store.setSorting('priority', 'desc')
    const { sortBy, sortOrder } = useTaskStore.getState()

    expect(sortBy).toBe('priority')
    expect(sortOrder).toBe('desc')
  })

  it('filters tasks correctly', () => {
    const store = useTaskStore.getState()
    
    // Create test tasks
    const task1 = store.createTask({
      title: 'High Priority Task',
      priority: 'High',
      status: 'Not Inspected',
      type: 'Inspection',
      assetId: 1,
      assetName: 'Test Asset',
      assignedTo: 'Agent X'
    })

    const task2 = store.createTask({
      title: 'Low Priority Task',
      priority: 'Low',
      status: 'Completed',
      type: 'Maintenance',
      assetId: 2,
      assetName: 'Another Asset',
      assignedTo: 'Agent Y'
    })

    // Test filtering by priority
    store.setFilters({ priority: 'High', status: '', type: '', assetId: '', assignedTo: '' })
    let filteredTasks = store.getFilteredTasks()
    expect(filteredTasks).toContain(task1)
    expect(filteredTasks).not.toContain(task2)

    // Test filtering by status
    store.setFilters({ priority: '', status: 'Completed', type: '', assetId: '', assignedTo: '' })
    filteredTasks = store.getFilteredTasks()
    expect(filteredTasks).toContain(task2)
    expect(filteredTasks).not.toContain(task1)

    // Test search functionality
    store.setFilters({ priority: '', status: '', type: '', assetId: '', assignedTo: '' })
    store.setSearchTerm('High Priority')
    filteredTasks = store.getFilteredTasks()
    expect(filteredTasks).toContain(task1)
    expect(filteredTasks).not.toContain(task2)
  })

  it('sorts tasks correctly', () => {
    const store = useTaskStore.getState()
    
    // Create test tasks with different due dates
    const task1 = store.createTask({
      title: 'Task 1',
      dueDate: '2025-08-01T09:00:00Z',
      priority: 'High'
    })

    const task2 = store.createTask({
      title: 'Task 2',
      dueDate: '2025-07-25T09:00:00Z',
      priority: 'Medium'
    })

    const task3 = store.createTask({
      title: 'Task 3',
      dueDate: '2025-08-15T09:00:00Z',
      priority: 'Low'
    })

    // Test sorting by due date (ascending)
    store.setSorting('dueDate', 'asc')
    let sortedTasks = store.getFilteredTasks()
    expect(sortedTasks[0]).toBe(task2)
    expect(sortedTasks[1]).toBe(task1)
    expect(sortedTasks[2]).toBe(task3)

    // Test sorting by due date (descending)
    store.setSorting('dueDate', 'desc')
    sortedTasks = store.getFilteredTasks()
    expect(sortedTasks[0]).toBe(task3)
    expect(sortedTasks[1]).toBe(task1)
    expect(sortedTasks[2]).toBe(task2)
  })

  it('calculates task statistics correctly', () => {
    const store = useTaskStore.getState()
    
    // Create test tasks with different statuses and due dates
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    store.createTask({
      title: 'Task 1',
      status: 'Not Inspected',
      dueDate: today.toISOString()
    })

    store.createTask({
      title: 'Task 2',
      status: 'Completed',
      dueDate: today.toISOString()
    })

    store.createTask({
      title: 'Task 3',
      status: 'Not Inspected',
      dueDate: yesterday.toISOString()
    })

    const stats = store.getTaskStats()

    expect(stats.total).toBe(3)
    expect(stats.completed).toBe(1)
    expect(stats.today).toBe(1)
    expect(stats.overdue).toBe(1)
  })

  it('gets task by id', () => {
    const store = useTaskStore.getState()
    const createdTask = store.createTask({
      title: 'Test Task',
      type: 'Inspection'
    })

    const foundTask = store.getTaskById(createdTask.id)
    expect(foundTask).toBe(createdTask)

    const notFoundTask = store.getTaskById(999)
    expect(notFoundTask).toBeUndefined()
  })

  it('handles empty task list', () => {
    const store = useTaskStore.getState()
    const filteredTasks = store.getFilteredTasks()
    const stats = store.getTaskStats()

    expect(filteredTasks).toEqual([])
    expect(stats.total).toBe(0)
    expect(stats.completed).toBe(0)
    expect(stats.today).toBe(0)
    expect(stats.overdue).toBe(0)
  })

  it('handles multiple filter combinations', () => {
    const store = useTaskStore.getState()
    
    // Create test tasks
    store.createTask({
      title: 'High Priority Inspection',
      type: 'Inspection',
      priority: 'High',
      status: 'Not Inspected',
      assignedTo: 'Agent X'
    })

    store.createTask({
      title: 'Medium Priority Maintenance',
      type: 'Maintenance',
      priority: 'Medium',
      status: 'Completed',
      assignedTo: 'Agent Y'
    })

    // Test multiple filters
    store.setFilters({
      priority: 'High',
      type: 'Inspection',
      status: 'Not Inspected',
      assignedTo: 'Agent X',
      assetId: ''
    })

    const filteredTasks = store.getFilteredTasks()
    expect(filteredTasks).toHaveLength(1)
    expect(filteredTasks[0].title).toBe('High Priority Inspection')
  })
})