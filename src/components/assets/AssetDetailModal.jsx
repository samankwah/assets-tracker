import { useState } from 'react'
import { X, MapPin, Home, Calendar, Edit2, Trash2, Image as ImageIcon, ChevronLeft, ChevronRight, ArrowRight, TrendingUp } from 'lucide-react'
import { useAssetStore } from '../../stores/assetStore'
import { PhaseBadge, PhaseProgress, PhaseTimeline, PhaseTransitionModal } from '../phases'
import { getNextPhases } from '../../utils/phaseValidation'
import toast from 'react-hot-toast'

const AssetDetailModal = ({ isOpen, onClose, asset, onEdit }) => {
  const { deleteAsset } = useAssetStore()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showPhaseTransition, setShowPhaseTransition] = useState(false)
  const [activeTab, setActiveTab] = useState('details')

  if (!isOpen || !asset) return null

  const handleDelete = async () => {
    try {
      deleteAsset(asset.id)
      toast.success('Asset deleted successfully!')
      onClose()
    } catch (error) {
      toast.error('Failed to delete asset')
    }
  }

  const nextImage = () => {
    if (asset.images && asset.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % asset.images.length)
    }
  }

  const prevImage = () => {
    if (asset.images && asset.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + asset.images.length) % asset.images.length)
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Active':
        return 'badge-success'
      case 'Under Maintenance':
        return 'badge-warning'
      case 'Decommissioned':
        return 'badge-error'
      default:
        return 'badge-info'
    }
  }

  const getConditionBadgeClass = (condition) => {
    switch (condition) {
      case 'Good':
      case 'Newly Built':
        return 'badge-success'
      case 'Fair':
        return 'badge-warning'
      case 'Needs Repairs':
        return 'badge-error'
      case 'Critical':
        return 'badge-error'
      default:
        return 'badge-info'
    }
  }

  const getInspectionBadgeClass = (status) => {
    switch (status) {
      case 'Completed':
        return 'badge-success'
      case 'In Progress':
        return 'badge-warning'
      case 'Overdue':
        return 'badge-error'
      default:
        return 'badge-info'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {asset.name}
              </h2>
              {asset.currentPhase && (
                <PhaseBadge phase={asset.currentPhase} size="sm" showIcon />
              )}
            </div>
            <div className="flex items-center space-x-2">
              {asset.currentPhase && getNextPhases(asset.currentPhase).length > 0 && (
                <button
                  onClick={() => setShowPhaseTransition(true)}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  title="Transition Phase"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Transition Phase</span>
                </button>
              )}
              <button
                onClick={() => onEdit(asset)}
                className="p-2 text-gray-500 hover:text-secondary-600 dark:hover:text-secondary-400"
                title="Edit Asset"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                title="Delete Asset"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'details', label: 'Details', icon: Home },
              { id: 'phase', label: 'Phase Management', icon: TrendingUp },
              { id: 'timeline', label: 'Timeline', icon: Calendar }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Left Column - Image Gallery */}
            <div className="space-y-6">
              {/* Main Image */}
              <div className="relative">
                <img
                  src={asset.images?.[currentImageIndex] || '/api/placeholder/400/300'}
                  alt={asset.name}
                  className="w-full h-80 object-cover rounded-lg"
                />
                
                {/* Image Navigation */}
                {asset.images && asset.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {asset.images && asset.images.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {asset.images.length}
                  </div>
                )}
              </div>

              {/* Image Thumbnails */}
              {asset.images && asset.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {asset.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        index === currentImageIndex 
                          ? 'border-secondary-500' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${asset.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Asset Information */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {asset.name}
                </h3>
                <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>
                    {asset.address.street}, {asset.address.city}, {asset.address.state} {asset.address.zipCode}
                  </span>
                </div>
                
                {/* Status Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`badge ${getStatusBadgeClass(asset.status)}`}>
                    {asset.status}
                  </span>
                  <span className={`badge ${getConditionBadgeClass(asset.condition)}`}>
                    {asset.condition}
                  </span>
                  <span className={`badge ${getInspectionBadgeClass(asset.inspectionStatus)}`}>
                    {asset.inspectionStatus}
                  </span>
                </div>
              </div>

              {/* Asset Details */}
              <div className="card">
                <div className="card-header">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <Home className="w-5 h-5 mr-2" />
                    Asset Details
                  </h4>
                </div>
                <div className="card-body">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Type</span>
                      <p className="text-gray-900 dark:text-white font-medium">{asset.type}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Bedrooms</span>
                      <p className="text-gray-900 dark:text-white font-medium">{asset.details.bedrooms || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Bathrooms</span>
                      <p className="text-gray-900 dark:text-white font-medium">{asset.details.bathrooms || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Floors</span>
                      <p className="text-gray-900 dark:text-white font-medium">{asset.details.floors || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Balcony</span>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {asset.details.balcony ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Priority</span>
                      <p className="text-gray-900 dark:text-white font-medium">{asset.priority}</p>
                    </div>
                  </div>

                  {/* Features */}
                  {asset.details.features && asset.details.features.length > 0 && (
                    <div className="mt-4">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Features</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {asset.details.features.map((feature, index) => (
                          <span key={index} className="badge badge-info">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Inspection Information */}
              <div className="card">
                <div className="card-header">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Inspection Information
                  </h4>
                </div>
                <div className="card-body">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Inspection Status</span>
                      <p className="text-gray-900 dark:text-white font-medium">{asset.inspectionStatus}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Last Inspection</span>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {asset.lastInspection ? new Date(asset.lastInspection).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Next Inspection</span>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {asset.nextInspection ? new Date(asset.nextInspection).toLocaleDateString() : 'Not Scheduled'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Frequency</span>
                      <p className="text-gray-900 dark:text-white font-medium">{asset.frequency}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                <p>Created: {new Date(asset.createdAt).toLocaleDateString()}</p>
                <p>Updated: {new Date(asset.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Delete Asset
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete "{asset.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AssetDetailModal