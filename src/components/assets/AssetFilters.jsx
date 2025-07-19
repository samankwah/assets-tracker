import { useState } from 'react'
import { 
  Filter, 
  X, 
  Search, 
  MapPin, 
  Home, 
  Calendar, 
  AlertCircle,
  Save,
  Clock,
  Tag,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react'
import { useAssetStore } from '../../stores/assetStore'
import { PHASES } from '../../types/phaseTypes'
import { PhaseBadge } from '../phases'

const AssetFilters = ({ onClose }) => {
  const { filters, setFilters, searchTerm, setSearchTerm, getFilteredAssets } = useAssetStore()
  
  const [localFilters, setLocalFilters] = useState(filters)
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm)
  const [expandedSections, setExpandedSections] = useState({
    search: true,
    status: true,
    phase: true,
    details: false,
    location: false,
    inspection: false,
    advanced: false
  })
  const [savedFilters, setSavedFilters] = useState([])
  const [filterName, setFilterName] = useState('')

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleFilterChange = (filterType, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const handleApplyFilters = () => {
    setFilters(localFilters)
    setSearchTerm(localSearchTerm)
    onClose()
  }

  const handleResetFilters = () => {
    const emptyFilters = {
      status: '',
      type: '',
      condition: '',
      inspectionStatus: '',
      currentPhase: '',
      priority: '',
      frequency: '',
      location: '',
      dateRange: '',
      bedrooms: '',
      bathrooms: ''
    }
    setLocalFilters(emptyFilters)
    setLocalSearchTerm('')
    setFilters(emptyFilters)
    setSearchTerm('')
  }

  const handleSaveFilter = () => {
    if (filterName.trim()) {
      const newFilter = {
        id: Date.now(),
        name: filterName,
        filters: localFilters,
        searchTerm: localSearchTerm,
        createdAt: new Date().toISOString()
      }
      setSavedFilters(prev => [...prev, newFilter])
      setFilterName('')
    }
  }

  const handleLoadFilter = (savedFilter) => {
    setLocalFilters(savedFilter.filters)
    setLocalSearchTerm(savedFilter.searchTerm)
  }

  const handleDeleteSavedFilter = (filterId) => {
    setSavedFilters(prev => prev.filter(f => f.id !== filterId))
  }

  const getActiveFilterCount = () => {
    const filterCount = Object.values(localFilters).filter(value => value && value !== '').length
    return filterCount + (localSearchTerm ? 1 : 0)
  }

  const FilterSection = ({ title, icon: Icon, section, children }) => (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h3>
        </div>
        {expandedSections[section] ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>
      {expandedSections[section] && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Filter className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Filter Assets
            </h2>
            {getActiveFilterCount() > 0 && (
              <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-medium">
                {getActiveFilterCount()} active
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filter Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Search Section */}
          <FilterSection title="Search" icon={Search} section="search">
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assets by name, address, or city..."
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Search across asset names, addresses, and locations
              </p>
            </div>
          </FilterSection>

          {/* Status & Type Section */}
          <FilterSection title="Status & Type" icon={Tag} section="status">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={localFilters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                  <option value="Decommissioned">Decommissioned</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={localFilters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Types</option>
                  <option value="Apartment">Apartment</option>
                  <option value="House">House</option>
                  <option value="Condo">Condo</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Condition
                </label>
                <select
                  value={localFilters.condition}
                  onChange={(e) => handleFilterChange('condition', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Conditions</option>
                  <option value="Newly Built">Newly Built</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Needs Repairs">Needs Repairs</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={localFilters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Priorities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
          </FilterSection>

          {/* Phase Section */}
          <FilterSection title="Asset Phase" icon={Tag} section="phase">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Phase
                </label>
                <select
                  value={localFilters.currentPhase}
                  onChange={(e) => handleFilterChange('currentPhase', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Phases</option>
                  {Object.values(PHASES).map((phase) => (
                    <option key={phase} value={phase}>
                      {phase}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Phase Quick Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Quick Phase Filters
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(PHASES).map((phase) => (
                    <button
                      key={phase}
                      onClick={() => handleFilterChange('currentPhase', 
                        localFilters.currentPhase === phase ? '' : phase
                      )}
                      className={`
                        p-2 rounded-lg border transition-all duration-200 text-sm
                        ${localFilters.currentPhase === phase
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }
                      `}
                    >
                      <div className="flex items-center justify-center">
                        <PhaseBadge phase={phase} size="xs" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Phase Progress Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phase Progress
                </label>
                <select
                  value={localFilters.phaseProgress || ''}
                  onChange={(e) => handleFilterChange('phaseProgress', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Any Progress</option>
                  <option value="0-25">0-25% Complete</option>
                  <option value="26-50">26-50% Complete</option>
                  <option value="51-75">51-75% Complete</option>
                  <option value="76-100">76-100% Complete</option>
                  <option value="100">Fully Complete</option>
                </select>
              </div>
            </div>
          </FilterSection>

          {/* Property Details Section */}
          <FilterSection title="Property Details" icon={Home} section="details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bedrooms
                </label>
                <select
                  value={localFilters.bedrooms}
                  onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Any</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bathrooms
                </label>
                <select
                  value={localFilters.bathrooms}
                  onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Any</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4+</option>
                </select>
              </div>
            </div>
          </FilterSection>

          {/* Location Section */}
          <FilterSection title="Location" icon={MapPin} section="location">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Enter city, state, or zip code"
                  value={localFilters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </FilterSection>

          {/* Inspection Section */}
          <FilterSection title="Inspection" icon={Calendar} section="inspection">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Inspection Status
                </label>
                <select
                  value={localFilters.inspectionStatus}
                  onChange={(e) => handleFilterChange('inspectionStatus', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Statuses</option>
                  <option value="Not Inspected">Not Inspected</option>
                  <option value="Recently Inspected">Recently Inspected</option>
                  <option value="Scheduled for Inspection">Scheduled for Inspection</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Frequency
                </label>
                <select
                  value={localFilters.frequency}
                  onChange={(e) => handleFilterChange('frequency', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Frequencies</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Annual">Annual</option>
                </select>
              </div>
            </div>
          </FilterSection>

          {/* Saved Filters Section */}
          <FilterSection title="Saved Filters" icon={Save} section="advanced">
            <div className="space-y-4">
              {/* Save Current Filter */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Enter filter name"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  onClick={handleSaveFilter}
                  disabled={!filterName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-4 h-4" />
                </button>
              </div>

              {/* Saved Filters List */}
              {savedFilters.length > 0 ? (
                <div className="space-y-2">
                  {savedFilters.map((filter) => (
                    <div key={filter.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {filter.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(filter.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleLoadFilter(filter)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSavedFilter(filter.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No saved filters yet
                </p>
              )}
            </div>
          </FilterSection>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleResetFilters}
            className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset All</span>
          </button>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssetFilters