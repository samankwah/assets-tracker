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