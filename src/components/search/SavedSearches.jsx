import { useState, useEffect } from 'react'
import {
  Search,
  Save,
  Star,
  Trash2,
  Edit3,
  Clock,
  Filter,
  Download,
  Upload,
  Copy,
  Play,
  MoreHorizontal,
  Plus,
  Bookmark,
  Tag,
  Calendar,
  TrendingUp
} from 'lucide-react'
import savedSearchService from '../../services/savedSearchService'

const SavedSearches = ({ 
  onExecuteSearch, 
  onEditSearch, 
  currentEntityType = 'assets',
  onClose 
}) => {
  const [savedSearches, setSavedSearches] = useState([])
  const [searchTemplates, setSearchTemplates] = useState([])
  const [quickAccessSearches, setQuickAccessSearches] = useState([])
  const [searchHistory, setSearchHistory] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [activeTab, setActiveTab] = useState('saved')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSearch, setSelectedSearch] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [newSearchName, setNewSearchName] = useState('')
  const [editingSearch, setEditingSearch] = useState(null)

  useEffect(() => {
    loadData()
  }, [currentEntityType])

  const loadData = () => {
    setSavedSearches(savedSearchService.getAllSavedSearches({ 
      entityType: currentEntityType 
    }))
    setSearchTemplates(savedSearchService.getSearchTemplates())
    setQuickAccessSearches(savedSearchService.getQuickAccessSearches())
    setSearchHistory(savedSearchService.getSearchHistory(10))
    setAnalytics(savedSearchService.getSearchAnalytics())
  }

  const handleExecuteSearch = async (search) => {
    try {
      const result = await savedSearchService.executeSavedSearch(search.id, [])
      onExecuteSearch?.(search, result)
      loadData() // Refresh to update usage stats
    } catch (error) {
      console.error('Failed to execute search:', error)
    }
  }

  const handleDeleteSearch = (searchId) => {
    try {
      savedSearchService.deleteSavedSearch(searchId)
      loadData()
      setShowDeleteConfirm(null)
    } catch (error) {
      console.error('Failed to delete search:', error)
    }
  }

  const handleToggleQuickAccess = (searchId) => {
    try {
      const search = savedSearchService.getSavedSearch(searchId)
      if (search) {
        savedSearchService.updateSavedSearch(searchId, {
          isQuickAccess: !search.isQuickAccess
        })
        loadData()
      }
    } catch (error) {
      console.error('Failed to toggle quick access:', error)
    }
  }

  const handleDuplicateSearch = (searchId) => {
    try {
      savedSearchService.duplicateSavedSearch(searchId)
      loadData()
    } catch (error) {
      console.error('Failed to duplicate search:', error)
    }
  }

  const handleCreateFromTemplate = (template) => {
    try {
      savedSearchService.createSearchFromTemplate(template.id)
      loadData()
    } catch (error) {
      console.error('Failed to create search from template:', error)
    }
  }

  const handleEditSearch = (search) => {
    setEditingSearch(search)
    setNewSearchName(search.name)
  }

  const handleSaveEdit = () => {
    if (editingSearch && newSearchName.trim()) {
      try {
        savedSearchService.updateSavedSearch(editingSearch.id, {
          name: newSearchName.trim()
        })
        loadData()
        setEditingSearch(null)
        setNewSearchName('')
      } catch (error) {
        console.error('Failed to update search:', error)
      }
    }
  }

  const handleExportSearches = () => {
    try {
      const exportData = savedSearchService.exportSavedSearches('json')
      const blob = new Blob([exportData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `saved-searches-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export searches:', error)
    }
  }

  const filteredSearches = savedSearches.filter(search =>
    search.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    search.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    search.query.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString()
  }

  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    return formatDate(dateString)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Saved Searches
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportSearches}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Export searches"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search saved searches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {[
            { id: 'saved', label: 'Saved Searches', icon: Bookmark },
            { id: 'templates', label: 'Templates', icon: Star },
            { id: 'quick', label: 'Quick Access', icon: TrendingUp },
            { id: 'history', label: 'History', icon: Clock },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'saved' && (
          <div className="space-y-4">
            {filteredSearches.length === 0 ? (
              <div className="text-center py-12">
                <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No saved searches found</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Save your search filters for quick access later
                </p>
              </div>
            ) : (
              filteredSearches.map(search => (
                <div
                  key={search.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {search.name}
                        </h3>
                        {search.isQuickAccess && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          search.entityType === 'assets' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                            : search.entityType === 'tasks'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                        }`}>
                          {search.entityType}
                        </span>
                      </div>
                      
                      {search.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {search.description}
                        </p>
                      )}

                      {search.query && (
                        <div className="flex items-center space-x-2 mb-2">
                          <Search className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            "{search.query}"
                          </span>
                        </div>
                      )}

                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Created {formatDate(search.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>Used {search.usageCount} times</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Last used {formatRelativeTime(search.lastUsed)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleExecuteSearch(search)}
                        className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Execute search"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleQuickAccess(search.id)}
                        className={`p-2 ${search.isQuickAccess 
                          ? 'text-yellow-500 hover:text-yellow-600' 
                          : 'text-gray-400 hover:text-gray-600'
                        }`}
                        title="Toggle quick access"
                      >
                        <Star className={`w-4 h-4 ${search.isQuickAccess ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleEditSearch(search)}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        title="Edit search"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicateSearch(search.id)}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        title="Duplicate search"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(search.id)}
                        className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete search"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Search Templates
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Pre-built searches for common use cases
              </p>
            </div>
            {searchTemplates.map(template => (
              <div
                key={template.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {template.name}
                      </h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        template.entityType === 'assets' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                          : template.entityType === 'tasks'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                      }`}>
                        {template.entityType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {template.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCreateFromTemplate(template)}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Use Template</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'quick' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Quick Access Searches
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your most frequently used searches
              </p>
            </div>
            {quickAccessSearches.length === 0 ? (
              <div className="text-center py-12">
                <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No quick access searches</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Star your favorite searches for quick access
                </p>
              </div>
            ) : (
              quickAccessSearches.map(search => (
                <div
                  key={search.id}
                  onClick={() => handleExecuteSearch(search)}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {search.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Used {search.usageCount} times
                        </p>
                      </div>
                    </div>
                    <Play className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Search History
              </h3>
              <button
                onClick={() => {
                  savedSearchService.clearSearchHistory()
                  loadData()
                }}
                className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              >
                Clear History
              </button>
            </div>
            {searchHistory.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No search history</p>
              </div>
            ) : (
              searchHistory.map(historyItem => (
                <div
                  key={historyItem.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {historyItem.searchName || historyItem.query}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Executed {formatRelativeTime(historyItem.executedAt)}
                      </p>
                    </div>
                    {historyItem.searchId && (
                      <button
                        onClick={() => {
                          const search = savedSearchService.getSavedSearch(historyItem.searchId)
                          if (search) handleExecuteSearch(search)
                        }}
                        className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Search Analytics
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {analytics.totalSavedSearches}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Saved Searches
                </div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {analytics.totalExecutions}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Executions
                </div>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {analytics.quickAccessCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Quick Access
                </div>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {analytics.averageUsage.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Avg Usage per Search
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                  Most Used Searches
                </h4>
                <div className="space-y-2">
                  {analytics.mostUsedSearches.map((search, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {search.name}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {search.usageCount} uses
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                  Searches by Type
                </h4>
                <div className="space-y-2">
                  {Object.entries(analytics.searchesByEntityType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-sm text-gray-900 dark:text-white capitalize">
                        {type}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {count} searches
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Delete Saved Search
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this saved search? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleDeleteSearch(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Search Modal */}
      {editingSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Edit Search Name
            </h3>
            <input
              type="text"
              value={newSearchName}
              onChange={(e) => setNewSearchName(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter search name"
            />
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditingSearch(null)
                  setNewSearchName('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SavedSearches