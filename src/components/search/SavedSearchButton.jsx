import { useState } from 'react'
import { Bookmark, ChevronDown } from 'lucide-react'
import { useClickOutside } from '../../hooks/useClickOutside'
import SavedSearches from './SavedSearches'
import savedSearchService from '../../services/savedSearchService'

const SavedSearchButton = ({ 
  onExecuteSearch, 
  currentEntityType = 'assets',
  showQuickAccess = true,
  className = ''
}) => {
  const [showSavedSearches, setShowSavedSearches] = useState(false)
  const [quickAccessSearches, setQuickAccessSearches] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)

  // Add click outside functionality
  const dropdownRef = useClickOutside(() => {
    setShowDropdown(false)
  }, showDropdown)

  const loadQuickAccessSearches = () => {
    const searches = savedSearchService.getQuickAccessSearches()
    setQuickAccessSearches(searches.filter(s => 
      currentEntityType === 'all' || s.entityType === currentEntityType
    ).slice(0, 5))
  }

  const handleButtonClick = () => {
    if (showQuickAccess) {
      loadQuickAccessSearches()
      setShowDropdown(!showDropdown)
    } else {
      setShowSavedSearches(true)
    }
  }

  const handleExecuteQuickSearch = async (search) => {
    try {
      const result = await savedSearchService.executeSavedSearch(search.id, [])
      onExecuteSearch?.(search, result)
      setShowDropdown(false)
    } catch (error) {
      console.error('Failed to execute search:', error)
    }
  }

  const handleExecuteSavedSearch = (search, result) => {
    onExecuteSearch?.(search, result)
    setShowSavedSearches(false)
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={handleButtonClick}
        className={`flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors ${className}`}
      >
        <Bookmark className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Saved Searches
        </span>
        {showQuickAccess && (
          <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
            showDropdown ? 'rotate-180' : ''
          }`} />
        )}
      </button>

      {/* Quick Access Dropdown */}
      {showQuickAccess && showDropdown && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Quick Access
            </h3>
          </div>
          
          {quickAccessSearches.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No quick access searches
              </p>
              <button
                onClick={() => {
                  setShowDropdown(false)
                  setShowSavedSearches(true)
                }}
                className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Browse all saved searches
              </button>
            </div>
          ) : (
            <>
              <div className="max-h-64 overflow-y-auto">
                {quickAccessSearches.map(search => (
                  <button
                    key={search.id}
                    onClick={() => handleExecuteQuickSearch(search)}
                    className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {search.name}
                        </h4>
                        {search.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                            {search.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            search.entityType === 'assets' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                              : search.entityType === 'tasks'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                          }`}>
                            {search.entityType}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            Used {search.usageCount} times
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setShowDropdown(false)
                    setShowSavedSearches(true)
                  }}
                  className="w-full text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View all saved searches
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}

      {/* Saved Searches Modal */}
      {showSavedSearches && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <SavedSearches
            onExecuteSearch={handleExecuteSavedSearch}
            currentEntityType={currentEntityType}
            onClose={() => setShowSavedSearches(false)}
          />
        </div>
      )}
    </div>
  )
}

export default SavedSearchButton