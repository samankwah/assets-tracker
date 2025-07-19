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

// Mock service for development
export const mockTaskService = {
  async getTasks(filters = {}) {
    const mockTasks = JSON.parse(localStorage.getItem('mock_tasks') || '[]')
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
    const mockTasks = JSON.parse(localStorage.getItem('mock_tasks') || '[]')
    const task = mockTasks.find(t => t.id === id)
    
    if (!task) {
      throw new Error('Task not found')
    }
    
    return task
  },

  async createTask(taskData) {
    const mockTasks = JSON.parse(localStorage.getItem('mock_tasks') || '[]')
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
    const mockTasks = JSON.parse(localStorage.getItem('mock_tasks') || '[]')
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
    const mockTasks = JSON.parse(localStorage.getItem('mock_tasks') || '[]')
    const filteredTasks = mockTasks.filter(t => t.id !== id)
    
    localStorage.setItem('mock_tasks', JSON.stringify(filteredTasks))
    return { message: 'Task deleted successfully' }
  },

  async getTasksByAsset(assetId) {
    return this.getTasks({ assetId })
  },

  async getOverdueTasks() {
    const mockTasks = JSON.parse(localStorage.getItem('mock_tasks') || '[]')
    const now = new Date()
    const overdueTasks = mockTasks.filter(task => {
      return task.dueDate && new Date(task.dueDate) < now && task.status !== 'completed'
    })
    
    return { tasks: overdueTasks, total: overdueTasks.length }
  },

  async getTasksDueToday() {
    const mockTasks = JSON.parse(localStorage.getItem('mock_tasks') || '[]')
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
    const mockTasks = JSON.parse(localStorage.getItem('mock_tasks') || '[]')
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