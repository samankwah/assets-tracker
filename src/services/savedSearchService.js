/**
 * Service for managing saved searches and filters
 */
class SavedSearchService {
  constructor() {
    this.searches = new Map()
    this.searchHistory = []
    this.maxHistorySize = 100
    this.loadStoredData()
  }

  /**
   * Create a new saved search
   */
  createSavedSearch(searchData) {
    const search = {
      id: `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: searchData.name,
      description: searchData.description || '',
      query: searchData.query || '',
      filters: searchData.filters || {},
      entityType: searchData.entityType || 'assets', // 'assets', 'tasks', 'inspections'
      isPublic: searchData.isPublic || false,
      isQuickAccess: searchData.isQuickAccess || false,
      tags: searchData.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: searchData.createdBy || 'current_user',
      usageCount: 0,
      lastUsed: null,
      resultCount: searchData.resultCount || 0
    }

    this.searches.set(search.id, search)
    this.saveToStorage()
    return search
  }

  /**
   * Update existing saved search
   */
  updateSavedSearch(searchId, updates) {
    const search = this.searches.get(searchId)
    if (!search) {
      throw new Error('Saved search not found')
    }

    const updatedSearch = {
      ...search,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    this.searches.set(searchId, updatedSearch)
    this.saveToStorage()
    return updatedSearch
  }

  /**
   * Delete saved search
   */
  deleteSavedSearch(searchId) {
    const deleted = this.searches.delete(searchId)
    if (deleted) {
      this.saveToStorage()
    }
    return deleted
  }

  /**
   * Get saved search by ID
   */
  getSavedSearch(searchId) {
    return this.searches.get(searchId)
  }

  /**
   * Get all saved searches
   */
  getAllSavedSearches(options = {}) {
    const {
      entityType = null,
      isPublic = null,
      createdBy = null,
      sortBy = 'lastUsed',
      sortOrder = 'desc',
      limit = null
    } = options

    let searches = Array.from(this.searches.values())

    // Apply filters
    if (entityType) {
      searches = searches.filter(search => search.entityType === entityType)
    }

    if (isPublic !== null) {
      searches = searches.filter(search => search.isPublic === isPublic)
    }

    if (createdBy) {
      searches = searches.filter(search => search.createdBy === createdBy)
    }

    // Sort
    searches.sort((a, b) => {
      let aVal = a[sortBy]
      let bVal = b[sortBy]

      // Handle special sorting cases
      if (sortBy === 'lastUsed') {
        aVal = aVal ? new Date(aVal).getTime() : 0
        bVal = bVal ? new Date(bVal).getTime() : 0
      } else if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aVal = new Date(aVal).getTime()
        bVal = new Date(bVal).getTime()
      }

      if (sortOrder === 'desc') {
        return bVal > aVal ? 1 : -1
      } else {
        return aVal > bVal ? 1 : -1
      }
    })

    // Apply limit
    if (limit) {
      searches = searches.slice(0, limit)
    }

    return searches
  }

  /**
   * Get quick access searches
   */
  getQuickAccessSearches() {
    return Array.from(this.searches.values())
      .filter(search => search.isQuickAccess)
      .sort((a, b) => b.usageCount - a.usageCount)
  }

  /**
   * Execute saved search
   */
  async executeSavedSearch(searchId, data = []) {
    const search = this.searches.get(searchId)
    if (!search) {
      throw new Error('Saved search not found')
    }

    // Update usage statistics
    this.updateSavedSearch(searchId, {
      usageCount: search.usageCount + 1,
      lastUsed: new Date().toISOString()
    })

    // Add to search history
    this.addToHistory({
      searchId,
      searchName: search.name,
      query: search.query,
      filters: search.filters,
      executedAt: new Date().toISOString()
    })

    // Execute the search
    const results = this.performSearch(search, data)
    
    // Update result count
    this.updateSavedSearch(searchId, {
      resultCount: results.length
    })

    return {
      search,
      results,
      executedAt: new Date().toISOString(),
      resultCount: results.length
    }
  }

  /**
   * Perform search based on saved search criteria
   */
  performSearch(search, data) {
    let results = [...data]

    // Apply text search
    if (search.query) {
      const query = search.query.toLowerCase()
      results = results.filter(item => {
        const searchableFields = ['name', 'title', 'description', 'type', 'status', 'assetName']
        return searchableFields.some(field => {
          const value = item[field]
          return value && value.toString().toLowerCase().includes(query)
        })
      })
    }

    // Apply filters
    if (search.filters && Object.keys(search.filters).length > 0) {
      results = results.filter(item => {
        return Object.entries(search.filters).every(([key, filterValue]) => {
          if (!filterValue || filterValue === 'all') return true

          const itemValue = item[key]
          
          // Handle array filters (multiple selections)
          if (Array.isArray(filterValue)) {
            return filterValue.includes(itemValue)
          }

          // Handle range filters
          if (typeof filterValue === 'object' && filterValue.min !== undefined && filterValue.max !== undefined) {
            const numValue = parseFloat(itemValue)
            return numValue >= filterValue.min && numValue <= filterValue.max
          }

          // Handle date range filters
          if (typeof filterValue === 'object' && filterValue.startDate && filterValue.endDate) {
            const itemDate = new Date(itemValue)
            const startDate = new Date(filterValue.startDate)
            const endDate = new Date(filterValue.endDate)
            return itemDate >= startDate && itemDate <= endDate
          }

          // Handle exact match
          return itemValue === filterValue
        })
      })
    }

    return results
  }

  /**
   * Create quick search from current filters
   */
  createQuickSearchFromFilters(name, query, filters, entityType, resultCount = 0) {
    return this.createSavedSearch({
      name,
      query,
      filters,
      entityType,
      isQuickAccess: true,
      resultCount,
      description: `Quick search created from current filters`
    })
  }

  /**
   * Duplicate saved search
   */
  duplicateSavedSearch(searchId, newName = null) {
    const originalSearch = this.searches.get(searchId)
    if (!originalSearch) {
      throw new Error('Saved search not found')
    }

    const duplicatedSearch = {
      ...originalSearch,
      name: newName || `${originalSearch.name} (Copy)`,
      usageCount: 0,
      lastUsed: null
    }

    return this.createSavedSearch(duplicatedSearch)
  }

  /**
   * Search within saved searches
   */
  searchSavedSearches(query) {
    const queryLower = query.toLowerCase()
    return Array.from(this.searches.values()).filter(search => 
      search.name.toLowerCase().includes(queryLower) ||
      search.description.toLowerCase().includes(queryLower) ||
      search.query.toLowerCase().includes(queryLower) ||
      search.tags.some(tag => tag.toLowerCase().includes(queryLower))
    )
  }

  /**
   * Get search suggestions based on history and popular searches
   */
  getSearchSuggestions(entityType = null, limit = 10) {
    const searches = this.getAllSavedSearches({
      entityType,
      sortBy: 'usageCount',
      sortOrder: 'desc',
      limit: limit * 2 // Get more to filter
    })

    // Mix popular and recent searches
    const popularSearches = searches.slice(0, Math.floor(limit * 0.7))
    const recentHistory = this.getSearchHistory(Math.ceil(limit * 0.3))

    const suggestions = [
      ...popularSearches.map(search => ({
        type: 'saved',
        id: search.id,
        text: search.name,
        description: search.description,
        usageCount: search.usageCount
      })),
      ...recentHistory.map(history => ({
        type: 'history',
        text: history.query || history.searchName,
        description: `Used ${new Date(history.executedAt).toLocaleDateString()}`,
        searchId: history.searchId
      }))
    ]

    // Remove duplicates and limit
    const uniqueSuggestions = suggestions.reduce((acc, suggestion) => {
      const exists = acc.find(s => s.text === suggestion.text)
      if (!exists) {
        acc.push(suggestion)
      }
      return acc
    }, [])

    return uniqueSuggestions.slice(0, limit)
  }

  /**
   * Add search to history
   */
  addToHistory(historyItem) {
    this.searchHistory.unshift({
      ...historyItem,
      id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    })

    // Keep history size manageable
    if (this.searchHistory.length > this.maxHistorySize) {
      this.searchHistory = this.searchHistory.slice(0, this.maxHistorySize)
    }

    this.saveToStorage()
  }

  /**
   * Get search history
   */
  getSearchHistory(limit = 20) {
    return this.searchHistory.slice(0, limit)
  }

  /**
   * Clear search history
   */
  clearSearchHistory() {
    this.searchHistory = []
    this.saveToStorage()
  }

  /**
   * Get search analytics
   */
  getSearchAnalytics() {
    const searches = Array.from(this.searches.values())
    const history = this.searchHistory

    const analytics = {
      totalSavedSearches: searches.length,
      totalExecutions: history.length,
      averageUsage: searches.length > 0 ? searches.reduce((sum, s) => sum + s.usageCount, 0) / searches.length : 0,
      mostUsedSearches: searches
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 5)
        .map(s => ({
          name: s.name,
          usageCount: s.usageCount,
          lastUsed: s.lastUsed
        })),
      searchesByEntityType: searches.reduce((acc, search) => {
        acc[search.entityType] = (acc[search.entityType] || 0) + 1
        return acc
      }, {}),
      recentActivity: history.slice(0, 10).map(h => ({
        searchName: h.searchName,
        executedAt: h.executedAt
      })),
      quickAccessCount: searches.filter(s => s.isQuickAccess).length,
      publicSearchesCount: searches.filter(s => s.isPublic).length
    }

    return analytics
  }

  /**
   * Export saved searches
   */
  exportSavedSearches(format = 'json') {
    const searches = Array.from(this.searches.values())
    
    switch (format) {
      case 'json':
        return JSON.stringify(searches, null, 2)
      case 'csv':
        return this.convertSearchesToCSV(searches)
      default:
        throw new Error(`Unsupported export format: ${format}`)
    }
  }

  /**
   * Import saved searches
   */
  importSavedSearches(data, format = 'json') {
    let searches = []
    
    try {
      switch (format) {
        case 'json':
          searches = JSON.parse(data)
          break
        default:
          throw new Error(`Unsupported import format: ${format}`)
      }

      let imported = 0
      let errors = []

      searches.forEach(searchData => {
        try {
          // Generate new ID to avoid conflicts
          delete searchData.id
          this.createSavedSearch(searchData)
          imported++
        } catch (error) {
          errors.push(`Failed to import "${searchData.name}": ${error.message}`)
        }
      })

      return {
        success: true,
        imported,
        errors,
        total: searches.length
      }
    } catch (error) {
      throw new Error(`Import failed: ${error.message}`)
    }
  }

  /**
   * Convert searches to CSV format
   */
  convertSearchesToCSV(searches) {
    const headers = ['Name', 'Description', 'Entity Type', 'Query', 'Usage Count', 'Created At', 'Last Used']
    const rows = [headers.join(',')]
    
    searches.forEach(search => {
      const row = [
        `"${search.name}"`,
        `"${search.description}"`,
        `"${search.entityType}"`,
        `"${search.query}"`,
        search.usageCount,
        `"${search.createdAt}"`,
        `"${search.lastUsed || 'Never'}"`
      ]
      rows.push(row.join(','))
    })
    
    return rows.join('\n')
  }

  /**
   * Get search templates for common use cases
   */
  getSearchTemplates() {
    return [
      {
        id: 'overdue_tasks',
        name: 'Overdue Tasks',
        description: 'Find all overdue tasks',
        entityType: 'tasks',
        query: '',
        filters: {
          status: 'Overdue'
        }
      },
      {
        id: 'high_priority_assets',
        name: 'High Priority Assets',
        description: 'Assets requiring immediate attention',
        entityType: 'assets',
        query: '',
        filters: {
          priority: 'High',
          status: 'Active'
        }
      },
      {
        id: 'recent_inspections',
        name: 'Recent Inspections',
        description: 'Inspections completed in the last 30 days',
        entityType: 'inspections',
        query: '',
        filters: {
          completedAt: {
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date().toISOString()
          }
        }
      },
      {
        id: 'maintenance_due',
        name: 'Maintenance Due',
        description: 'Assets due for maintenance',
        entityType: 'assets',
        query: 'maintenance',
        filters: {
          condition: ['Fair', 'Poor']
        }
      },
      {
        id: 'unassigned_tasks',
        name: 'Unassigned Tasks',
        description: 'Tasks without an assignee',
        entityType: 'tasks',
        query: '',
        filters: {
          assignedTo: ''
        }
      }
    ]
  }

  /**
   * Create search from template
   */
  createSearchFromTemplate(templateId, customName = null) {
    const template = this.getSearchTemplates().find(t => t.id === templateId)
    if (!template) {
      throw new Error('Template not found')
    }

    return this.createSavedSearch({
      ...template,
      name: customName || template.name,
      description: `${template.description} (from template)`
    })
  }

  /**
   * Save data to localStorage
   */
  saveToStorage() {
    try {
      const data = {
        searches: Array.from(this.searches.entries()),
        history: this.searchHistory
      }
      localStorage.setItem('assetTracker_savedSearches', JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save searches to storage:', error)
    }
  }

  /**
   * Load data from localStorage
   */
  loadStoredData() {
    try {
      const stored = localStorage.getItem('assetTracker_savedSearches')
      if (stored) {
        const data = JSON.parse(stored)
        
        if (data.searches) {
          this.searches = new Map(data.searches)
        }
        
        if (data.history) {
          this.searchHistory = data.history
        }
      }
    } catch (error) {
      console.error('Failed to load searches from storage:', error)
      this.searches = new Map()
      this.searchHistory = []
    }
  }

  /**
   * Clear all saved searches
   */
  clearAllSavedSearches() {
    this.searches.clear()
    this.saveToStorage()
  }
}

export default new SavedSearchService()