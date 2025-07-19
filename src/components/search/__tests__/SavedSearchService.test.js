import savedSearchService from '../../../services/savedSearchService'

describe('SavedSearchService', () => {
  beforeEach(() => {
    savedSearchService.clearAllSavedSearches()
    savedSearchService.clearSearchHistory()
  })

  afterEach(() => {
    savedSearchService.clearAllSavedSearches()
    savedSearchService.clearSearchHistory()
  })

  describe('createSavedSearch', () => {
    it('should create a new saved search', () => {
      const searchData = {
        name: 'Test Search',
        description: 'A test search',
        query: 'building',
        filters: { type: 'assets', status: 'Active' },
        entityType: 'assets'
      }

      const savedSearch = savedSearchService.createSavedSearch(searchData)

      expect(savedSearch).toBeDefined()
      expect(savedSearch.id).toBeDefined()
      expect(savedSearch.name).toBe('Test Search')
      expect(savedSearch.description).toBe('A test search')
      expect(savedSearch.query).toBe('building')
      expect(savedSearch.entityType).toBe('assets')
      expect(savedSearch.usageCount).toBe(0)
      expect(savedSearch.createdAt).toBeDefined()
    })

    it('should set default values for optional fields', () => {
      const searchData = {
        name: 'Minimal Search'
      }

      const savedSearch = savedSearchService.createSavedSearch(searchData)

      expect(savedSearch.description).toBe('')
      expect(savedSearch.query).toBe('')
      expect(savedSearch.filters).toEqual({})
      expect(savedSearch.entityType).toBe('assets')
      expect(savedSearch.isPublic).toBe(false)
      expect(savedSearch.isQuickAccess).toBe(false)
      expect(savedSearch.tags).toEqual([])
    })
  })

  describe('getAllSavedSearches', () => {
    beforeEach(() => {
      savedSearchService.createSavedSearch({
        name: 'Asset Search',
        entityType: 'assets',
        query: 'building'
      })
      savedSearchService.createSavedSearch({
        name: 'Task Search',
        entityType: 'tasks',
        query: 'maintenance'
      })
      savedSearchService.createSavedSearch({
        name: 'Public Search',
        entityType: 'assets',
        isPublic: true
      })
    })

    it('should return all saved searches', () => {
      const searches = savedSearchService.getAllSavedSearches()
      expect(searches).toHaveLength(3)
    })

    it('should filter by entity type', () => {
      const assetSearches = savedSearchService.getAllSavedSearches({ entityType: 'assets' })
      expect(assetSearches).toHaveLength(2)
      expect(assetSearches.every(s => s.entityType === 'assets')).toBe(true)

      const taskSearches = savedSearchService.getAllSavedSearches({ entityType: 'tasks' })
      expect(taskSearches).toHaveLength(1)
      expect(taskSearches[0].entityType).toBe('tasks')
    })

    it('should filter by public status', () => {
      const publicSearches = savedSearchService.getAllSavedSearches({ isPublic: true })
      expect(publicSearches).toHaveLength(1)
      expect(publicSearches[0].isPublic).toBe(true)

      const privateSearches = savedSearchService.getAllSavedSearches({ isPublic: false })
      expect(privateSearches).toHaveLength(2)
      expect(privateSearches.every(s => s.isPublic === false)).toBe(true)
    })
  })

  describe('executeSavedSearch', () => {
    it('should execute a saved search and update usage stats', async () => {
      const searchData = {
        name: 'Test Search',
        query: 'test',
        filters: { status: 'Active' }
      }

      const savedSearch = savedSearchService.createSavedSearch(searchData)
      const testData = [
        { name: 'Test Item 1', status: 'Active' },
        { name: 'Test Item 2', status: 'Inactive' },
        { name: 'Another Test', status: 'Active' }
      ]

      const result = await savedSearchService.executeSavedSearch(savedSearch.id, testData)

      expect(result).toBeDefined()
      expect(result.search).toBeDefined()
      expect(result.results).toHaveLength(2) // Only active items matching 'test'
      expect(result.resultCount).toBe(2)

      // Check that usage stats were updated
      const updatedSearch = savedSearchService.getSavedSearch(savedSearch.id)
      expect(updatedSearch.usageCount).toBe(1)
      expect(updatedSearch.lastUsed).toBeDefined()
    })

    it('should add search to history when executed', async () => {
      const searchData = {
        name: 'History Test',
        query: 'test'
      }

      const savedSearch = savedSearchService.createSavedSearch(searchData)
      await savedSearchService.executeSavedSearch(savedSearch.id, [])

      const history = savedSearchService.getSearchHistory()
      expect(history).toHaveLength(1)
      expect(history[0].searchId).toBe(savedSearch.id)
      expect(history[0].searchName).toBe('History Test')
    })
  })

  describe('performSearch', () => {
    const testData = [
      { name: 'Building A', type: 'Building', status: 'Active', location: 'New York' },
      { name: 'Equipment B', type: 'Equipment', status: 'Maintenance', location: 'Boston' },
      { name: 'Building C', type: 'Building', status: 'Active', location: 'Chicago' }
    ]

    it('should filter by text query', () => {
      const search = { query: 'building', filters: {} }
      const results = savedSearchService.performSearch(search, testData)
      expect(results).toHaveLength(2)
      expect(results.every(r => r.name.toLowerCase().includes('building'))).toBe(true)
    })

    it('should filter by exact match filters', () => {
      const search = { query: '', filters: { status: 'Active' } }
      const results = savedSearchService.performSearch(search, testData)
      expect(results).toHaveLength(2)
      expect(results.every(r => r.status === 'Active')).toBe(true)
    })

    it('should combine text query and filters', () => {
      const search = { query: 'building', filters: { status: 'Active' } }
      const results = savedSearchService.performSearch(search, testData)
      expect(results).toHaveLength(2)
      expect(results.every(r => 
        r.name.toLowerCase().includes('building') && r.status === 'Active'
      )).toBe(true)
    })

    it('should handle array filters', () => {
      const search = { query: '', filters: { status: ['Active', 'Maintenance'] } }
      const results = savedSearchService.performSearch(search, testData)
      expect(results).toHaveLength(3)
    })

    it('should ignore "all" filter values', () => {
      const search = { query: '', filters: { status: 'all', type: 'Building' } }
      const results = savedSearchService.performSearch(search, testData)
      expect(results).toHaveLength(2)
      expect(results.every(r => r.type === 'Building')).toBe(true)
    })
  })

  describe('searchSavedSearches', () => {
    beforeEach(() => {
      savedSearchService.createSavedSearch({
        name: 'Building Search',
        description: 'Search for buildings',
        query: 'building',
        tags: ['real-estate', 'property']
      })
      savedSearchService.createSavedSearch({
        name: 'Equipment Maintenance',
        description: 'Find equipment needing maintenance',
        query: 'equipment',
        tags: ['maintenance', 'equipment']
      })
    })

    it('should search by name', () => {
      const results = savedSearchService.searchSavedSearches('building')
      expect(results).toHaveLength(1)
      expect(results[0].name).toBe('Building Search')
    })

    it('should search by description', () => {
      const results = savedSearchService.searchSavedSearches('maintenance')
      expect(results).toHaveLength(1)
      expect(results[0].name).toBe('Equipment Maintenance')
    })

    it('should search by query', () => {
      const results = savedSearchService.searchSavedSearches('equipment')
      expect(results).toHaveLength(1)
      expect(results[0].name).toBe('Equipment Maintenance')
    })

    it('should search by tags', () => {
      const results = savedSearchService.searchSavedSearches('real-estate')
      expect(results).toHaveLength(1)
      expect(results[0].name).toBe('Building Search')
    })

    it('should be case insensitive', () => {
      const results = savedSearchService.searchSavedSearches('BUILDING')
      expect(results).toHaveLength(1)
      expect(results[0].name).toBe('Building Search')
    })
  })

  describe('getSearchTemplates', () => {
    it('should return predefined search templates', () => {
      const templates = savedSearchService.getSearchTemplates()
      expect(templates).toBeInstanceOf(Array)
      expect(templates.length).toBeGreaterThan(0)
      
      const template = templates[0]
      expect(template).toHaveProperty('id')
      expect(template).toHaveProperty('name')
      expect(template).toHaveProperty('description')
      expect(template).toHaveProperty('entityType')
      expect(template).toHaveProperty('filters')
    })
  })

  describe('createSearchFromTemplate', () => {
    it('should create a search from template', () => {
      const templates = savedSearchService.getSearchTemplates()
      const template = templates[0]
      
      const search = savedSearchService.createSearchFromTemplate(template.id)
      expect(search).toBeDefined()
      expect(search.name).toBe(template.name)
      expect(search.entityType).toBe(template.entityType)
      expect(search.filters).toEqual(template.filters)
    })

    it('should allow custom name for template search', () => {
      const templates = savedSearchService.getSearchTemplates()
      const template = templates[0]
      
      const search = savedSearchService.createSearchFromTemplate(template.id, 'Custom Name')
      expect(search.name).toBe('Custom Name')
    })

    it('should throw error for invalid template', () => {
      expect(() => {
        savedSearchService.createSearchFromTemplate('invalid-id')
      }).toThrow('Template not found')
    })
  })

  describe('getSearchAnalytics', () => {
    beforeEach(() => {
      const search1 = savedSearchService.createSavedSearch({
        name: 'Search 1',
        entityType: 'assets',
        isQuickAccess: true
      })
      const search2 = savedSearchService.createSavedSearch({
        name: 'Search 2',
        entityType: 'tasks',
        isPublic: true
      })
      
      // Simulate usage
      savedSearchService.updateSavedSearch(search1.id, { usageCount: 5 })
      savedSearchService.updateSavedSearch(search2.id, { usageCount: 3 })
    })

    it('should return analytics data', () => {
      const analytics = savedSearchService.getSearchAnalytics()
      
      expect(analytics).toHaveProperty('totalSavedSearches')
      expect(analytics).toHaveProperty('averageUsage')
      expect(analytics).toHaveProperty('mostUsedSearches')
      expect(analytics).toHaveProperty('searchesByEntityType')
      expect(analytics).toHaveProperty('quickAccessCount')
      expect(analytics).toHaveProperty('publicSearchesCount')
      
      expect(analytics.totalSavedSearches).toBe(2)
      expect(analytics.averageUsage).toBe(4) // (5 + 3) / 2
      expect(analytics.quickAccessCount).toBe(1)
      expect(analytics.publicSearchesCount).toBe(1)
      expect(analytics.searchesByEntityType.assets).toBe(1)
      expect(analytics.searchesByEntityType.tasks).toBe(1)
    })
  })
})