import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAssetStore } from '../stores/assetStore'
import usePageTitle from '../hooks/usePageTitle'
import { Plus, Grid, List, Filter, Search, SlidersHorizontal } from 'lucide-react'
import AddAssetModal from '../components/assets/AddAssetModal'
import AssetDetailModal from '../components/assets/AssetDetailModal'
import AssetEditModal from '../components/assets/AssetEditModal'
import AssetFilters from '../components/assets/AssetFilters'
import AssetCard from '../components/assets/AssetCard'
import AssetTableView from '../components/assets/AssetTableView'
import LoadingSpinner, { AssetGridSkeleton } from '../components/ui/LoadingSpinner'
import ErrorDisplay from '../components/ui/ErrorDisplay'
import ExportMenu from '../components/ui/ExportMenu'
import { SavedSearchButton } from '../components/search'
import toast from 'react-hot-toast'

const Assets = () => {
  usePageTitle('Assets')
  const navigate = useNavigate()
  
  const { 
    assets, 
    filters, 
    searchTerm, 
    loading,
    error,
    getFilteredAssets, 
    setFilters, 
    setSearchTerm,
    deleteAsset,
    fetchAssets,
    setError
  } = useAssetStore()
  
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [selectedAsset, setSelectedAsset] = useState(null)

  const filteredAssets = getFilteredAssets()

  // Initialize assets on component mount
  useEffect(() => {
    if (assets.length === 0) {
      fetchAssets().catch(err => {
        console.error('Failed to fetch assets:', err)
      })
    }
  }, [assets.length, fetchAssets])

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
  }

  const handleSearchChange = (search) => {
    setSearchTerm(search)
  }

  const handleClearFilters = () => {
    setFilters({
      status: '',
      type: '',
      condition: '',
      inspectionStatus: ''
    })
    setSearchTerm('')
  }

  const handleViewAsset = (asset) => {
    setSelectedAsset(asset)
    setShowDetailModal(true)
  }

  const handleEditAsset = (asset) => {
    setSelectedAsset(asset)
    setShowEditModal(true)
  }

  const handleDeleteAsset = async (asset) => {
    if (window.confirm(`Are you sure you want to delete "${asset.name}"?`)) {
      try {
        await deleteAsset(asset.id)
        toast.success('Asset deleted successfully')
      } catch (error) {
        toast.error('Failed to delete asset')
        console.error('Delete error:', error)
      }
    }
  }

  const handleRetry = () => {
    setError(null)
    fetchAssets()
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '') || searchTerm !== ''

  // Show error state
  if (error && assets.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assets</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your real estate portfolio
            </p>
          </div>
        </div>
        <ErrorDisplay
          error={error}
          title="Failed to load assets"
          onRetry={handleRetry}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assets</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your real estate portfolio
          </p>
        </div>
        <button
          onClick={() => navigate('/assets/add')}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Asset
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search assets by name, address, or city..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <SavedSearchButton
            currentEntityType="assets"
            onExecuteSearch={(search, result) => {
              setSearchTerm(search.query || '')
              setFilters(search.filters || {})
            }}
            className="px-4 py-3"
          />
          <button
            onClick={() => setShowFilters(true)}
            className="flex items-center space-x-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
                {Object.values(filters).filter(v => v).length + (searchTerm ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <select
            value={filters.status}
            onChange={(e) => handleFiltersChange({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Under Maintenance">Under Maintenance</option>
            <option value="Decommissioned">Decommissioned</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) => handleFiltersChange({ ...filters, type: e.target.value })}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          >
            <option value="">All Types</option>
            <option value="Apartment">Apartment</option>
            <option value="House">House</option>
            <option value="Condo">Condo</option>
            <option value="Commercial">Commercial</option>
          </select>

          <select
            value={filters.condition}
            onChange={(e) => handleFiltersChange({ ...filters, condition: e.target.value })}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          >
            <option value="">All Conditions</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Needs Repairs">Needs Repairs</option>
            <option value="Critical">Critical</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* View Toggle and Results Count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <span>
            {filteredAssets.length} of {assets.length} assets
          </span>
          {hasActiveFilters && (
            <span className="text-secondary-600 dark:text-secondary-400">
              (filtered)
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <ExportMenu 
            data={filteredAssets}
            type="assets"
            filters={{ ...filters, searchTerm }}
            title="Assets"
          />
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' 
                ? 'bg-secondary-100 text-secondary-600 dark:bg-secondary-900 dark:text-secondary-400' 
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' 
                ? 'bg-secondary-100 text-secondary-600 dark:bg-secondary-900 dark:text-secondary-400' 
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Error display for non-critical errors */}
      {error && assets.length > 0 && (
        <ErrorDisplay
          error={error}
          title="Something went wrong"
          onRetry={handleRetry}
          onDismiss={() => setError(null)}
          variant="inline"
          showDismiss={true}
        />
      )}

      {/* Assets Grid/List */}
      {loading && assets.length === 0 ? (
        <AssetGridSkeleton count={6} />
      ) : filteredAssets.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onView={handleViewAsset}
                onEdit={handleEditAsset}
                onDelete={handleDeleteAsset}
              />
            ))}
          </div>
        ) : (
          <AssetTableView
            assets={filteredAssets}
            onView={handleViewAsset}
            onDelete={handleDeleteAsset}
            loading={loading}
          />
        )
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Grid className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {hasActiveFilters ? 'No assets match your filters' : 'No assets found'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {hasActiveFilters 
              ? 'Try adjusting your search criteria or filters' 
              : 'Get started by adding your first asset'}
          </p>
          {!hasActiveFilters && (
            <button
              onClick={() => navigate('/assets/add')}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Asset
            </button>
          )}
        </div>
      )}

      {/* Add Asset Modal */}
      <AddAssetModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      {/* Asset Detail Modal */}
      <AssetDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        asset={selectedAsset}
        onEdit={handleEditAsset}
      />

      {/* Asset Edit Modal */}
      <AssetEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        asset={selectedAsset}
      />

      {/* Asset Filters Modal */}
      {showFilters && (
        <AssetFilters
          onClose={() => setShowFilters(false)}
        />
      )}
    </div>
  )
}

export default Assets