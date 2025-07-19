import { MapPin, Home, Eye, Edit, Trash2, ArrowRight, TrendingUp } from 'lucide-react'
import { PhaseBadge } from '../phases'
import { getPhaseProgress, getNextPhases } from '../../utils/phaseValidation'

const AssetCard = ({ asset, onView, onEdit, onDelete, onPhaseTransition }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'badge-success'
      case 'Under Maintenance': return 'badge-warning'
      case 'Decommissioned': return 'badge-error'
      default: return 'badge-gray'
    }
  }

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'Good': return 'badge-success'
      case 'Fair': return 'badge-warning'
      case 'Needs Repairs': return 'badge-error'
      case 'Critical': return 'badge-error'
      default: return 'badge-info'
    }
  }

  const getInspectionStatusColor = (status) => {
    switch (status) {
      case 'Recently Inspected': return 'badge-success'
      case 'Scheduled for Inspection': return 'badge-info'
      case 'Overdue': return 'badge-error'
      case 'Due For Maintenance': return 'badge-warning'
      default: return 'badge-gray'
    }
  }

  return (
    <div className="card hover:shadow-card-hover transition-shadow duration-200">
      <div className="relative">
        <img
          src={asset.images?.[0] || '/api/placeholder/400/300'}
          alt={asset.name}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <span className={`badge ${getStatusColor(asset.status)}`}>
            {asset.status}
          </span>
          {asset.currentPhase && (
            <PhaseBadge phase={asset.currentPhase} size="xs" showIcon />
          )}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {asset.name}
          </h3>
          <div className="flex space-x-1">
            <button
              onClick={() => onView(asset)}
              className="p-1 text-gray-400 hover:text-secondary-600 transition-colors"
              title="View Asset Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(asset)}
              className="p-1 text-gray-400 hover:text-secondary-600 transition-colors"
              title="Edit Asset"
            >
              <Edit className="w-4 h-4" />
            </button>
            {asset.currentPhase && onPhaseTransition && getNextPhases(asset.currentPhase).length > 0 && (
              <button
                onClick={() => onPhaseTransition(asset)}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="Transition Phase"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => onDelete(asset)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete Asset"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          {asset.address.street}, {asset.address.city}
        </div>

        {/* Phase Progress */}
        {asset.currentPhase && asset.phaseMetadata && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Phase Progress
              </span>
              <span>{getPhaseProgress(asset.currentPhase, asset.phaseMetadata.completedRequirements || [])}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                style={{ 
                  width: `${getPhaseProgress(asset.currentPhase, asset.phaseMetadata.completedRequirements || [])}%` 
                }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Home className="w-4 h-4 mr-1" />
            {asset.details.bedrooms} Beds
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {asset.type}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {asset.details.floors} Floors
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {asset.details.balcony ? 'Balcony' : 'No Balcony'}
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400">Condition:</span>
            <span className={`badge ${getConditionColor(asset.condition)}`}>
              {asset.condition}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400">Inspection:</span>
            <span className={`badge ${getInspectionStatusColor(asset.inspectionStatus)}`}>
              {asset.inspectionStatus}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400">Next Inspection:</span>
            <span className="text-gray-900 dark:text-white">
              {asset.nextInspection ? new Date(asset.nextInspection).toLocaleDateString() : 'Not Scheduled'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssetCard