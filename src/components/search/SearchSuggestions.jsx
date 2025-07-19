import { useState } from 'react'
import { 
  Search, 
  Clock, 
  Star, 
  TrendingUp, 
  Building, 
  CheckSquare, 
  X 
} from 'lucide-react'
import { useSearchStore } from '../../stores/searchStore'

const SearchSuggestions = ({ searchTerm, onSuggestionClick, onSearchTermChange }) => {
  const { 
    recentSearches, 
    savedSearches, 
    getSearchSuggestions, 
    getPopularSearches,
    addToRecent,
    removeSavedSearch 
  } = useSearchStore()

  const suggestions = getSearchSuggestions(searchTerm)
  const popularSearches = getPopularSearches()

  const handleSuggestionClick = (suggestion) => {
    addToRecent(suggestion)
    onSuggestionClick(suggestion)
  }

  const quickFilters = [
    { label: 'Active Assets', filter: { type: 'assets', status: 'Active' } },
    { label: 'Overdue Tasks', filter: { type: 'tasks', status: 'Overdue' } },
    { label: 'High Priority', filter: { type: 'tasks', priority: 'High' } },
    { label: 'Today\'s Tasks', filter: { type: 'tasks', dueDate: 'today' } },
    { label: 'Maintenance Due', filter: { type: 'assets', status: 'Maintenance' } }
  ]

  if (!searchTerm && recentSearches.length === 0 && savedSearches.length === 0) {
    return (
      <div className="p-4 space-y-4">
        {/* Quick Filters */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Quick Filters
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickFilters.map((filter, index) => (
              <button
                key={index}
                onClick={() => onSuggestionClick(filter.label)}
                className="flex items-center space-x-2 p-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
              >
                <Search className="w-4 h-4" />
                <span>{filter.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Popular Searches */}
        {popularSearches.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              Popular Searches
            </h4>
            <div className="space-y-1">
              {popularSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(search)}
                  className="flex items-center space-x-2 w-full p-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                >
                  <Search className="w-4 h-4" />
                  <span>{search}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {/* Search Suggestions */}
      {suggestions.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Suggestions
          </h4>
          <div className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="flex items-center space-x-2 w-full p-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
              >
                <Search className="w-4 h-4" />
                <span>{suggestion}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent Searches */}
      {!searchTerm && recentSearches.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            Recent Searches
          </h4>
          <div className="space-y-1">
            {recentSearches.slice(0, 5).map((search, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(search)}
                className="flex items-center space-x-2 w-full p-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
              >
                <Clock className="w-4 h-4" />
                <span>{search}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Saved Searches */}
      {!searchTerm && savedSearches.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
            <Star className="w-4 h-4 mr-1" />
            Saved Searches
          </h4>
          <div className="space-y-1">
            {savedSearches.map((search) => (
              <div
                key={search.id}
                className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <button
                  onClick={() => handleSuggestionClick(search.term)}
                  className="flex items-center space-x-2 flex-1 text-left"
                >
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {search.name}
                  </span>
                </button>
                <button
                  onClick={() => removeSavedSearch(search.id)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchSuggestions