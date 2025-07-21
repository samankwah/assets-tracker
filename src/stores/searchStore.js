import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useSearchStore = create(
  persist(
    (set, get) => ({
      // Search history
      searchHistory: [],
      
      // Recent searches
      recentSearches: [],
      
      // Search filters
      defaultFilters: {
        type: 'all',
        status: 'all',
        priority: 'all'
      },
      
      // Saved searches
      savedSearches: [],
      
      // Add to search history
      addToHistory: (searchTerm, results) => {
        set((state) => ({
          searchHistory: [
            {
              id: Date.now(),
              term: searchTerm,
              results: results,
              timestamp: new Date().toISOString()
            },
            ...state.searchHistory.slice(0, 49) // Keep last 50 searches
          ]
        }))
      },
      
      // Add to recent searches
      addToRecent: (searchTerm) => {
        set((state) => {
          const filtered = state.recentSearches.filter(item => item !== searchTerm)
          return {
            recentSearches: [searchTerm, ...filtered].slice(0, 10) // Keep last 10 recent searches
          }
        })
      },
      
      // Clear search history
      clearHistory: () => {
        set({ searchHistory: [] })
      },
      
      // Clear recent searches
      clearRecent: () => {
        set({ recentSearches: [] })
      },
      
      // Save search
      saveSearch: (searchTerm, filters, name) => {
        set((state) => ({
          savedSearches: [
            ...state.savedSearches,
            {
              id: Date.now(),
              name: name || searchTerm,
              term: searchTerm,
              filters: filters,
              createdAt: new Date().toISOString()
            }
          ]
        }))
      },
      
      // Remove saved search
      removeSavedSearch: (id) => {
        set((state) => ({
          savedSearches: state.savedSearches.filter(search => search.id !== id)
        }))
      },
      
      // Get search suggestions
      getSearchSuggestions: (term) => {
        const { searchHistory, recentSearches } = get()
        const termLower = term.toLowerCase()
        
        // Get suggestions from history
        const historySuggestions = searchHistory
          .filter(item => item.term.toLowerCase().includes(termLower))
          .map(item => item.term)
          .slice(0, 5)
        
        // Get suggestions from recent searches
        const recentSuggestions = recentSearches
          .filter(item => item.toLowerCase().includes(termLower))
          .slice(0, 5)
        
        // Combine and deduplicate
        const allSuggestions = [...new Set([...historySuggestions, ...recentSuggestions])]
        return allSuggestions.slice(0, 8)
      },

      // Track search analytics
      trackSearchAnalytics: (term, results, filters) => {
        set((state) => ({
          searchHistory: [
            {
              id: Date.now(),
              term,
              results: {
                total: results?.assets?.length + results?.tasks?.length || 0,
                assets: results?.assets?.length || 0,
                tasks: results?.tasks?.length || 0
              },
              filters,
              timestamp: new Date().toISOString(),
              responseTime: Date.now() - state.searchStartTime || 0
            },
            ...state.searchHistory.slice(0, 99)
          ]
        }))
      },

      // Mark search start time for performance tracking
      markSearchStart: () => {
        set({ searchStartTime: Date.now() })
      },

      // Get search analytics
      getSearchAnalytics: (days = 7) => {
        const { searchHistory } = get()
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - days)
        
        const recentSearches = searchHistory.filter(search => 
          new Date(search.timestamp) >= cutoffDate
        )

        const totalSearches = recentSearches.length
        const uniqueTerms = [...new Set(recentSearches.map(s => s.term.toLowerCase()))].length
        const avgResultsPerSearch = totalSearches > 0 
          ? recentSearches.reduce((sum, s) => sum + (s.results?.total || 0), 0) / totalSearches
          : 0
        const avgResponseTime = totalSearches > 0
          ? recentSearches.reduce((sum, s) => sum + (s.responseTime || 0), 0) / totalSearches
          : 0

        return {
          totalSearches,
          uniqueTerms,
          avgResultsPerSearch,
          avgResponseTime,
          topTerms: recentSearches
            .reduce((acc, search) => {
              const term = search.term.toLowerCase()
              acc[term] = (acc[term] || 0) + 1
              return acc
            }, {})
        }
      },

      // Full-text search function
      performFullTextSearch: (searchTerm, assets, tasks, filters = {}) => {
        const term = searchTerm.toLowerCase().trim()
        if (!term) return { assets: [], tasks: [], total: 0 }

        const searchAssets = (assets) => {
          return assets.filter(asset => {
            // Basic text matching
            const textMatch = [
              asset.name,
              asset.type,
              asset.status,
              asset.condition,
              asset.address?.street,
              asset.address?.city,
              asset.address?.state,
              asset.description
            ].some(field => 
              field && field.toLowerCase().includes(term)
            )

            // Apply filters
            if (filters.type && filters.type !== 'all' && asset.type !== filters.type) return false
            if (filters.status && filters.status !== 'all' && asset.status !== filters.status) return false
            if (filters.condition && filters.condition !== 'all' && asset.condition !== filters.condition) return false

            return textMatch
          })
        }

        const searchTasks = (tasks) => {
          return tasks.filter(task => {
            // Basic text matching
            const textMatch = [
              task.title,
              task.description,
              task.type,
              task.priority,
              task.status,
              task.assignedTo,
              task.assetName
            ].some(field => 
              field && field.toLowerCase().includes(term)
            )

            // Apply filters
            if (filters.type && filters.type !== 'all' && task.type !== filters.type) return false
            if (filters.status && filters.status !== 'all' && task.status !== filters.status) return false
            if (filters.priority && filters.priority !== 'all' && task.priority !== filters.priority) return false

            return textMatch
          })
        }

        const matchingAssets = searchAssets(assets)
        const matchingTasks = searchTasks(tasks)

        return {
          assets: matchingAssets,
          tasks: matchingTasks,
          total: matchingAssets.length + matchingTasks.length
        }
      },

      // Advanced search with ranking
      performAdvancedSearch: (searchTerm, assets, tasks, filters = {}) => {
        const term = searchTerm.toLowerCase().trim()
        if (!term) return { assets: [], tasks: [], total: 0 }

        const calculateRelevanceScore = (item, fields) => {
          let score = 0
          const terms = term.split(' ')

          fields.forEach(field => {
            if (!field) return
            const fieldLower = field.toLowerCase()
            
            // Exact match gets highest score
            if (fieldLower === term) score += 100
            
            // Starts with search term gets high score
            if (fieldLower.startsWith(term)) score += 50
            
            // Contains all terms gets medium score
            if (terms.every(t => fieldLower.includes(t))) score += 30
            
            // Contains any term gets low score
            if (terms.some(t => fieldLower.includes(t))) score += 10
          })

          return score
        }

        const searchAndRankAssets = (assets) => {
          return assets
            .map(asset => ({
              ...asset,
              relevanceScore: calculateRelevanceScore(asset, [
                asset.name,
                asset.type,
                asset.status,
                asset.condition,
                asset.address?.street,
                asset.address?.city,
                asset.description
              ])
            }))
            .filter(asset => {
              // Apply relevance threshold
              if (asset.relevanceScore === 0) return false
              
              // Apply filters
              if (filters.type && filters.type !== 'all' && asset.type !== filters.type) return false
              if (filters.status && filters.status !== 'all' && asset.status !== filters.status) return false
              if (filters.condition && filters.condition !== 'all' && asset.condition !== filters.condition) return false

              return true
            })
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
        }

        const searchAndRankTasks = (tasks) => {
          return tasks
            .map(task => ({
              ...task,
              relevanceScore: calculateRelevanceScore(task, [
                task.title,
                task.description,
                task.type,
                task.priority,
                task.status,
                task.assignedTo,
                task.assetName
              ])
            }))
            .filter(task => {
              // Apply relevance threshold
              if (task.relevanceScore === 0) return false
              
              // Apply filters
              if (filters.type && filters.type !== 'all' && task.type !== filters.type) return false
              if (filters.status && filters.status !== 'all' && task.status !== filters.status) return false
              if (filters.priority && filters.priority !== 'all' && task.priority !== filters.priority) return false

              return true
            })
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
        }

        const matchingAssets = searchAndRankAssets(assets)
        const matchingTasks = searchAndRankTasks(tasks)

        return {
          assets: matchingAssets,
          tasks: matchingTasks,
          total: matchingAssets.length + matchingTasks.length
        }
      },
      
      // Get popular searches
      getPopularSearches: () => {
        const { searchHistory } = get()
        const termCounts = {}
        
        searchHistory.forEach(item => {
          termCounts[item.term] = (termCounts[item.term] || 0) + 1
        })
        
        return Object.entries(termCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([term]) => term)
      }
    }),
    {
      name: 'search-store',
      partialize: (state) => ({
        searchHistory: state.searchHistory,
        recentSearches: state.recentSearches,
        savedSearches: state.savedSearches
      })
    }
  )
)