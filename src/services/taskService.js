// Task Service - API layer for task management
// This service handles all task-related API calls

import { api } from './apiService'

class TaskService {
  // Get all tasks with optional filters
  async getTasks(filters = {}) {
    return api.get('/tasks', filters)
  }

  // Get a single task by ID
  async getTaskById(id) {
    return api.get(`/tasks/${id}`)
  }

  // Create a new task
  async createTask(taskData) {
    return api.post('/tasks', taskData)
  }

  // Update an existing task
  async updateTask(id, taskData) {
    return api.put(`/tasks/${id}`, taskData)
  }

  // Delete a task
  async deleteTask(id) {
    return api.delete(`/tasks/${id}`)
  }

  // Get tasks by asset ID
  async getTasksByAsset(assetId) {
    return api.get(`/tasks`, { assetId })
  }

  // Get tasks by status
  async getTasksByStatus(status) {
    return api.get(`/tasks`, { status })
  }

  // Get tasks by priority
  async getTasksByPriority(priority) {
    return api.get(`/tasks`, { priority })
  }

  // Get overdue tasks
  async getOverdueTasks() {
    return api.get('/tasks/overdue')
  }

  // Get tasks due today
  async getTasksDueToday() {
    return api.get('/tasks/due-today')
  }

  // Get tasks due this week
  async getTasksDueThisWeek() {
    return api.get('/tasks/due-this-week')
  }

  // Mark task as complete
  async completeTask(id) {
    return api.patch(`/tasks/${id}/complete`)
  }

  // Mark task as incomplete
  async incompleteTask(id) {
    return api.patch(`/tasks/${id}/incomplete`)
  }

  // Assign task to user
  async assignTask(id, userId) {
    return api.patch(`/tasks/${id}/assign`, { userId })
  }

  // Unassign task
  async unassignTask(id) {
    return api.patch(`/tasks/${id}/unassign`)
  }

  // Add comment to task
  async addComment(id, comment) {
    return api.post(`/tasks/${id}/comments`, { comment })
  }

  // Get task comments
  async getTaskComments(id) {
    return api.get(`/tasks/${id}/comments`)
  }

  // Update task progress
  async updateTaskProgress(id, progress) {
    return api.patch(`/tasks/${id}/progress`, { progress })
  }

  // Get task statistics
  async getTaskStats() {
    return api.get('/tasks/stats')
  }

  // Bulk operations
  async bulkUpdateTasks(updates) {
    return api.post('/tasks/bulk-update', updates)
  }

  async bulkDeleteTasks(taskIds) {
    return api.post('/tasks/bulk-delete', { taskIds })
  }

  // Export tasks
  async exportTasks(format = 'csv', filters = {}) {
    const params = { format, ...filters }
    const response = await fetch(`${api.baseUrl}/tasks/export?${new URLSearchParams(params)}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Export failed')
    }
    
    return response.blob()
  }
}

// Create and export singleton instance
const taskService = new TaskService()
export default taskService

// Default mock tasks data
const defaultMockTasks = [
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
    notifications: { email: true, sms: false, inApp: true },
    notificationSettings: { type: 'Email', reminderTime: '2 days before' },
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
    notifications: { email: true, sms: true, inApp: true },
    notificationSettings: { type: 'Email', reminderTime: '1 day before' },
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
    notifications: { email: true, sms: false, inApp: true },
    notificationSettings: { type: 'Email', reminderTime: '3 days before' },
    createdAt: '2025-07-01T10:00:00Z',
    updatedAt: '2025-07-12T10:00:00Z'
  },
  {
    id: 4,
    title: 'HVAC System Inspection',
    description: 'Seasonal HVAC system maintenance and filter replacement',
    assetId: 4,
    assetName: 'Sunset Boulevard Apartment',
    type: 'Maintenance',
    status: 'Scheduled',
    priority: 'Medium',
    dueDate: '2025-07-28T11:00:00Z',
    time: '11:00 AM',
    assignedTo: 'Agent A',
    frequency: 'Quarterly',
    condition: 'Good',
    notifications: { email: true, sms: true, inApp: true },
    notificationSettings: { type: 'Email', reminderTime: '1 day before' },
    createdAt: '2025-07-12T10:00:00Z',
    updatedAt: '2025-07-18T10:00:00Z'
  },
  {
    id: 5,
    title: 'Fire Safety Equipment Check',
    description: 'Monthly fire extinguisher and smoke detector testing',
    assetId: 5,
    assetName: 'Downtown Loft',
    type: 'Safety',
    status: 'Completed',
    priority: 'High',
    dueDate: '2025-07-15T10:00:00Z',
    time: '10:00 AM',
    assignedTo: 'Agent B',
    frequency: 'Monthly',
    condition: 'Excellent',
    notifications: { email: true, sms: false, inApp: true },
    notificationSettings: { type: 'Email', reminderTime: '2 days before' },
    createdAt: '2025-07-01T10:00:00Z',
    updatedAt: '2025-07-15T10:00:00Z'
  },
  {
    id: 6,
    title: 'Landscape Maintenance',
    description: 'Trimming, watering, and general garden maintenance',
    assetId: 6,
    assetName: 'Oakwood Family Home',
    type: 'Maintenance',
    status: 'In Progress',
    priority: 'Low',
    dueDate: '2025-07-30T09:00:00Z',
    time: '09:00 AM',
    assignedTo: 'Agent C',
    frequency: 'Weekly',
    condition: 'Good',
    notifications: { email: false, sms: true, inApp: true },
    notificationSettings: { type: 'SMS', reminderTime: '1 day before' },
    createdAt: '2025-07-08T10:00:00Z',
    updatedAt: '2025-07-21T10:00:00Z'
  },
  {
    id: 7,
    title: 'Electrical System Audit',
    description: 'Annual electrical system safety inspection and certification',
    assetId: 7,
    assetName: 'Riverside Townhouse',
    type: 'Inspection',
    status: 'Scheduled',
    priority: 'High',
    dueDate: '2025-08-05T13:00:00Z',
    time: '01:00 PM',
    assignedTo: 'Agent D',
    frequency: 'Annual',
    condition: 'Needs Repairs',
    notifications: { email: true, sms: true, inApp: true },
    notificationSettings: { type: 'Email', reminderTime: '3 days before' },
    createdAt: '2025-07-15T10:00:00Z',
    updatedAt: '2025-07-20T10:00:00Z'
  },
  {
    id: 8,
    title: 'Pool Maintenance',
    description: 'Chemical balance testing and pool cleaning service',
    assetId: 8,
    assetName: 'Beachfront Condo',
    type: 'Maintenance',
    status: 'Completed',
    priority: 'Medium',
    dueDate: '2025-07-18T15:00:00Z',
    time: '03:00 PM',
    assignedTo: 'Agent E',
    frequency: 'Weekly',
    condition: 'Excellent',
    notifications: { email: true, sms: false, inApp: true },
    notificationSettings: { type: 'Email', reminderTime: '1 day before' },
    createdAt: '2025-07-10T10:00:00Z',
    updatedAt: '2025-07-18T15:30:00Z'
  },
  {
    id: 9,
    title: 'Security System Upgrade',
    description: 'Installation of new security cameras and access control system',
    assetId: 9,
    assetName: 'Mountain View Cabin',
    type: 'Upgrade',
    status: 'Planning',
    priority: 'Medium',
    dueDate: '2025-08-10T10:00:00Z',
    time: '10:00 AM',
    assignedTo: 'Agent F',
    frequency: 'One-time',
    condition: 'Good',
    notifications: { email: true, sms: true, inApp: true },
    notificationSettings: { type: 'Email', reminderTime: '5 days before' },
    createdAt: '2025-07-16T10:00:00Z',
    updatedAt: '2025-07-20T10:00:00Z'
  },
  {
    id: 10,
    title: 'Window Cleaning Service',
    description: 'Professional window cleaning for all exterior windows',
    assetId: 10,
    assetName: 'Historic Brownstone',
    type: 'Cleaning',
    status: 'Scheduled',
    priority: 'Low',
    dueDate: '2025-07-25T08:00:00Z',
    time: '08:00 AM',
    assignedTo: 'Agent G',
    frequency: 'Monthly',
    condition: 'Fair',
    notifications: { email: false, sms: true, inApp: false },
    notificationSettings: { type: 'SMS', reminderTime: '1 day before' },
    createdAt: '2025-07-05T10:00:00Z',
    updatedAt: '2025-07-19T10:00:00Z'
  },
  {
    id: 11,
    title: 'Appliance Warranty Check',
    description: 'Review and update appliance warranties and service contracts',
    assetId: 11,
    assetName: 'Suburban Villa',
    type: 'Administrative',
    status: 'Pending',
    priority: 'Low',
    dueDate: '2025-08-15T14:00:00Z',
    time: '02:00 PM',
    assignedTo: 'Agent H',
    frequency: 'Annual',
    condition: 'Excellent',
    notifications: { email: true, sms: false, inApp: true },
    notificationSettings: { type: 'Email', reminderTime: '1 week before' },
    createdAt: '2025-07-20T10:00:00Z',
    updatedAt: '2025-07-20T10:00:00Z'
  },
  {
    id: 12,
    title: 'Pest Control Treatment',
    description: 'Quarterly pest control inspection and treatment',
    assetId: 12,
    assetName: 'City Center Penthouse',
    type: 'Maintenance',
    status: 'Overdue',
    priority: 'High',
    dueDate: '2025-07-10T16:00:00Z',
    time: '04:00 PM',
    assignedTo: 'Agent I',
    frequency: 'Quarterly',
    condition: 'Excellent',
    notifications: { email: true, sms: true, inApp: true },
    notificationSettings: { type: 'Email', reminderTime: '2 days before' },
    createdAt: '2025-06-25T10:00:00Z',
    updatedAt: '2025-07-10T10:00:00Z'
  },
  {
    id: 13,
    title: 'Dock Maintenance',
    description: 'Inspect and repair boat dock structure and safety equipment',
    assetId: 13,
    assetName: 'Lakeside Retreat',
    type: 'Maintenance',
    status: 'In Progress',
    priority: 'Medium',
    dueDate: '2025-08-02T12:00:00Z',
    time: '12:00 PM',
    assignedTo: 'Agent J',
    frequency: 'Bi-Annual',
    condition: 'Good',
    notifications: { email: true, sms: false, inApp: true },
    notificationSettings: { type: 'Email', reminderTime: '3 days before' },
    createdAt: '2025-07-18T10:00:00Z',
    updatedAt: '2025-07-21T10:00:00Z'
  },
  {
    id: 14,
    title: 'Foundation Inspection',
    description: 'Annual foundation and structural integrity assessment',
    assetId: 14,
    assetName: 'Garden District Home',
    type: 'Inspection',
    status: 'Scheduled',
    priority: 'High',
    dueDate: '2025-08-20T09:00:00Z',
    time: '09:00 AM',
    assignedTo: 'Agent K',
    frequency: 'Annual',
    condition: 'Critical',
    notifications: { email: true, sms: true, inApp: true },
    notificationSettings: { type: 'Email', reminderTime: '1 week before' },
    createdAt: '2025-07-15T10:00:00Z',
    updatedAt: '2025-07-19T10:00:00Z'
  },
  {
    id: 15,
    title: 'Smart Home System Update',
    description: 'Update smart home automation system and security protocols',
    assetId: 15,
    assetName: 'Tech Hub Apartment',
    type: 'Upgrade',
    status: 'Completed',
    priority: 'Medium',
    dueDate: '2025-07-12T11:00:00Z',
    time: '11:00 AM',
    assignedTo: 'Agent L',
    frequency: 'Bi-Annual',
    condition: 'Needs Repairs',
    notifications: { email: true, sms: false, inApp: true },
    notificationSettings: { type: 'Email', reminderTime: '2 days before' },
    createdAt: '2025-07-01T10:00:00Z',
    updatedAt: '2025-07-12T14:00:00Z'
  },
  {
    id: 16,
    title: 'Roof Gutter Cleaning',
    description: 'Clean and inspect roof gutters and downspouts',
    assetId: 1,
    assetName: 'Los Palmas Apartment',
    type: 'Cleaning',
    status: 'Pending',
    priority: 'Medium',
    dueDate: '2025-08-05T10:00:00Z',
    time: '10:00 AM',
    assignedTo: 'Agent M',
    frequency: 'Bi-Annual',
    condition: 'Good',
    notifications: { email: false, sms: true, inApp: true },
    notificationSettings: { type: 'SMS', reminderTime: '2 days before' },
    createdAt: '2025-07-20T10:00:00Z',
    updatedAt: '2025-07-20T10:00:00Z'
  },
  {
    id: 17,
    title: 'Energy Efficiency Audit',
    description: 'Comprehensive energy usage assessment and efficiency recommendations',
    assetId: 3,
    assetName: 'Calgary Street Condo',
    type: 'Assessment',
    status: 'Scheduled',
    priority: 'Low',
    dueDate: '2025-08-12T13:00:00Z',
    time: '01:00 PM',
    assignedTo: 'Agent N',
    frequency: 'Annual',
    condition: 'Critical',
    notifications: { email: true, sms: false, inApp: false },
    notificationSettings: { type: 'Email', reminderTime: '1 week before' },
    createdAt: '2025-07-18T10:00:00Z',
    updatedAt: '2025-07-21T10:00:00Z'
  },
  {
    id: 18,
    title: 'Balcony Safety Inspection',
    description: 'Inspect balcony railings, flooring, and structural integrity',
    assetId: 5,
    assetName: 'Downtown Loft',
    type: 'Safety',
    status: 'In Progress',
    priority: 'High',
    dueDate: '2025-07-26T14:00:00Z',
    time: '02:00 PM',
    assignedTo: 'Agent O',
    frequency: 'Annual',
    condition: 'Excellent',
    notifications: { email: true, sms: true, inApp: true },
    notificationSettings: { type: 'Email', reminderTime: '3 days before' },
    createdAt: '2025-07-19T10:00:00Z',
    updatedAt: '2025-07-21T10:00:00Z'
  },
  {
    id: 19,
    title: 'Flooring Replacement',
    description: 'Replace damaged hardwood flooring in living areas',
    assetId: 10,
    assetName: 'Historic Brownstone',
    type: 'Repair',
    status: 'Planning',
    priority: 'Medium',
    dueDate: '2025-09-01T09:00:00Z',
    time: '09:00 AM',
    assignedTo: 'Agent P',
    frequency: 'One-time',
    condition: 'Fair',
    notifications: { email: true, sms: false, inApp: true },
    notificationSettings: { type: 'Email', reminderTime: '1 week before' },
    createdAt: '2025-07-21T10:00:00Z',
    updatedAt: '2025-07-21T10:00:00Z'
  },
  {
    id: 20,
    title: 'Garage Door Maintenance',
    description: 'Lubricate and test garage door mechanisms and safety features',
    assetId: 11,
    assetName: 'Suburban Villa',
    type: 'Maintenance',
    status: 'Scheduled',
    priority: 'Low',
    dueDate: '2025-08-08T15:00:00Z',
    time: '03:00 PM',
    assignedTo: 'Agent Q',
    frequency: 'Quarterly',
    condition: 'Excellent',
    notifications: { email: false, sms: true, inApp: false },
    notificationSettings: { type: 'SMS', reminderTime: '1 day before' },
    createdAt: '2025-07-21T10:00:00Z',
    updatedAt: '2025-07-21T10:00:00Z'
  }
];

// Mock service for development
export const mockTaskService = {
  async getTasks(filters = {}) {
    let mockTasks = JSON.parse(localStorage.getItem('mock_tasks') || 'null')
    
    // If no data in localStorage, use default and save it
    if (!mockTasks || mockTasks.length === 0) {
      mockTasks = defaultMockTasks
      localStorage.setItem('mock_tasks', JSON.stringify(mockTasks))
    }
    let filteredTasks = mockTasks

    if (filters.status) {
      filteredTasks = filteredTasks.filter(task => task.status === filters.status)
    }

    if (filters.priority) {
      filteredTasks = filteredTasks.filter(task => task.priority === filters.priority)
    }

    if (filters.assetId) {
      filteredTasks = filteredTasks.filter(task => task.assetId === filters.assetId)
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(searchTerm) ||
        task.description.toLowerCase().includes(searchTerm)
      )
    }

    return {
      tasks: filteredTasks,
      total: filteredTasks.length,
      page: 1,
      limit: 50
    }
  },

  async getTaskById(id) {
    let mockTasks = JSON.parse(localStorage.getItem('mock_tasks') || 'null')
    
    if (!mockTasks || mockTasks.length === 0) {
      mockTasks = defaultMockTasks
      localStorage.setItem('mock_tasks', JSON.stringify(mockTasks))
    }
    const task = mockTasks.find(t => t.id === id)
    
    if (!task) {
      throw new Error('Task not found')
    }
    
    return task
  },

  async createTask(taskData) {
    let mockTasks = JSON.parse(localStorage.getItem('mock_tasks') || 'null')
    
    if (!mockTasks || mockTasks.length === 0) {
      mockTasks = defaultMockTasks
    }
    const newTask = {
      ...taskData,
      id: Date.now(),
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: []
    }
    
    mockTasks.push(newTask)
    localStorage.setItem('mock_tasks', JSON.stringify(mockTasks))
    
    return newTask
  },

  async updateTask(id, taskData) {
    let mockTasks = JSON.parse(localStorage.getItem('mock_tasks') || 'null')
    
    if (!mockTasks || mockTasks.length === 0) {
      mockTasks = defaultMockTasks
    }
    const index = mockTasks.findIndex(t => t.id === id)
    
    if (index === -1) {
      throw new Error('Task not found')
    }
    
    mockTasks[index] = {
      ...mockTasks[index],
      ...taskData,
      updatedAt: new Date().toISOString()
    }
    
    localStorage.setItem('mock_tasks', JSON.stringify(mockTasks))
    return mockTasks[index]
  },

  async deleteTask(id) {
    let mockTasks = JSON.parse(localStorage.getItem('mock_tasks') || 'null')
    
    if (!mockTasks || mockTasks.length === 0) {
      mockTasks = defaultMockTasks
    }
    const filteredTasks = mockTasks.filter(t => t.id !== id)
    
    localStorage.setItem('mock_tasks', JSON.stringify(filteredTasks))
    return { message: 'Task deleted successfully' }
  },

  async getTasksByAsset(assetId) {
    return this.getTasks({ assetId })
  },

  async getOverdueTasks() {
    let mockTasks = JSON.parse(localStorage.getItem('mock_tasks') || 'null')
    
    if (!mockTasks || mockTasks.length === 0) {
      mockTasks = defaultMockTasks
      localStorage.setItem('mock_tasks', JSON.stringify(mockTasks))
    }
    const now = new Date()
    const overdueTasks = mockTasks.filter(task => {
      return task.dueDate && new Date(task.dueDate) < now && task.status !== 'completed'
    })
    
    return { tasks: overdueTasks, total: overdueTasks.length }
  },

  async getTasksDueToday() {
    let mockTasks = JSON.parse(localStorage.getItem('mock_tasks') || 'null')
    
    if (!mockTasks || mockTasks.length === 0) {
      mockTasks = defaultMockTasks
      localStorage.setItem('mock_tasks', JSON.stringify(mockTasks))
    }
    const today = new Date().toDateString()
    const todayTasks = mockTasks.filter(task => {
      return task.dueDate && new Date(task.dueDate).toDateString() === today
    })
    
    return { tasks: todayTasks, total: todayTasks.length }
  },

  async completeTask(id) {
    return this.updateTask(id, { 
      status: 'completed', 
      progress: 100,
      completedAt: new Date().toISOString()
    })
  },

  async getTaskStats() {
    let mockTasks = JSON.parse(localStorage.getItem('mock_tasks') || 'null')
    
    if (!mockTasks || mockTasks.length === 0) {
      mockTasks = defaultMockTasks
      localStorage.setItem('mock_tasks', JSON.stringify(mockTasks))
    }
    const now = new Date()
    
    return {
      total: mockTasks.length,
      pending: mockTasks.filter(t => t.status === 'pending').length,
      inProgress: mockTasks.filter(t => t.status === 'in_progress').length,
      completed: mockTasks.filter(t => t.status === 'completed').length,
      overdue: mockTasks.filter(t => 
        t.dueDate && new Date(t.dueDate) < now && t.status !== 'completed'
      ).length,
      dueToday: mockTasks.filter(t => 
        t.dueDate && new Date(t.dueDate).toDateString() === now.toDateString()
      ).length
    }
  }
}

export { TaskService }