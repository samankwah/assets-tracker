import { useState } from 'react'
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle, 
  Plus, 
  X, 
  Edit3, 
  Save, 
  FileText,
  Calendar,
  User
} from 'lucide-react'
import { PHASE_REQUIREMENTS, PHASE_COLORS } from '../../types/phaseTypes'
import { getPhaseProgress, getMissingRequirements } from '../../utils/phaseValidation'

const PhaseRequirements = ({
  phase,
  completedRequirements = [],
  customRequirements = [],
  onRequirementToggle,
  onCustomRequirementAdd,
  onCustomRequirementEdit,
  onCustomRequirementDelete,
  editable = true,
  showProgress = true,
  showActions = true,
  className = ''
}) => {
  const [isAddingRequirement, setIsAddingRequirement] = useState(false)
  const [newRequirement, setNewRequirement] = useState('')
  const [editingRequirement, setEditingRequirement] = useState(null)
  const [editText, setEditText] = useState('')

  const standardRequirements = PHASE_REQUIREMENTS[phase] || []
  const allRequirements = [...standardRequirements, ...customRequirements]
  const progress = getPhaseProgress(phase, completedRequirements)
  const missingRequirements = getMissingRequirements(phase, completedRequirements)
  const colors = PHASE_COLORS[phase] || PHASE_COLORS.PLANNING

  const handleToggleRequirement = (requirement) => {
    if (!editable || !onRequirementToggle) return
    
    const isCompleted = completedRequirements.includes(requirement)
    const newCompleted = isCompleted
      ? completedRequirements.filter(req => req !== requirement)
      : [...completedRequirements, requirement]
    
    onRequirementToggle(newCompleted)
  }

  const handleAddCustomRequirement = () => {
    if (newRequirement.trim() && onCustomRequirementAdd) {
      onCustomRequirementAdd(newRequirement.trim())
      setNewRequirement('')
      setIsAddingRequirement(false)
    }
  }

  const handleEditRequirement = (requirement) => {
    setEditingRequirement(requirement)
    setEditText(requirement)
  }

  const handleSaveEdit = () => {
    if (editText.trim() && onCustomRequirementEdit) {
      onCustomRequirementEdit(editingRequirement, editText.trim())
    }
    setEditingRequirement(null)
    setEditText('')
  }

  const handleDeleteCustomRequirement = (requirement) => {
    if (onCustomRequirementDelete) {
      onCustomRequirementDelete(requirement)
    }
  }

  const getRequirementIcon = (requirement) => {
    const isCompleted = completedRequirements.includes(requirement)
    const isCustom = customRequirements.includes(requirement)
    
    if (isCompleted) {
      return <CheckCircle2 className="w-5 h-5 text-green-500" />
    }
    
    if (editable) {
      return <Circle className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
    }
    
    return <Clock className="w-5 h-5 text-orange-500" />
  }

  const getRequirementItemClasses = (requirement) => {
    const isCompleted = completedRequirements.includes(requirement)
    const isCustom = customRequirements.includes(requirement)
    
    return `
      flex items-start gap-3 p-3 rounded-lg transition-all duration-200
      ${isCompleted 
        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
        : 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600'
      }
      ${editable ? 'hover:shadow-sm cursor-pointer' : ''}
      ${isCustom ? 'border-l-4 border-l-blue-500' : ''}
    `
  }

  if (!phase) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">
          No phase selected
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${colors.dot}`} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {phase} Phase Requirements
          </h3>
        </div>
        
        {showProgress && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {completedRequirements.length} of {allRequirements.length}
            </span>
            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${colors.dot.replace('bg-', 'bg-opacity-80 bg-')}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {progress}%
            </span>
          </div>
        )}
      </div>

      {/* Progress Summary */}
      {showProgress && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Total Requirements
            </div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {allRequirements.length}
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="text-sm font-medium text-green-700 dark:text-green-300">
              Completed
            </div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {completedRequirements.length}
            </div>
          </div>
          
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
            <div className="text-sm font-medium text-orange-700 dark:text-orange-300">
              Remaining
            </div>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {missingRequirements.length}
            </div>
          </div>
        </div>
      )}

      {/* Requirements List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Requirements Checklist
          </h4>
          {editable && showActions && (
            <button
              onClick={() => setIsAddingRequirement(true)}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Custom
            </button>
          )}
        </div>

        {/* Standard Requirements */}
        {standardRequirements.map((requirement, index) => {
          const isCompleted = completedRequirements.includes(requirement)
          
          return (
            <div
              key={`standard-${index}`}
              className={getRequirementItemClasses(requirement)}
              onClick={() => handleToggleRequirement(requirement)}
            >
              {getRequirementIcon(requirement)}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <span
                    className={`text-sm font-medium ${
                      isCompleted 
                        ? 'text-green-700 dark:text-green-300 line-through' 
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {requirement}
                  </span>
                  
                  {isCompleted && (
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium ml-2">
                      ✓ Complete
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <span className="inline-flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    Standard Requirement
                  </span>
                  {isCompleted && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Completed
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {/* Custom Requirements */}
        {customRequirements.map((requirement, index) => {
          const isCompleted = completedRequirements.includes(requirement)
          const isEditing = editingRequirement === requirement
          
          if (isEditing) {
            return (
              <div key={`custom-${index}`} className="flex items-center gap-3 p-3 border border-blue-300 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  autoFocus
                />
                <button
                  onClick={handleSaveEdit}
                  className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditingRequirement(null)}
                  className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )
          }
          
          return (
            <div
              key={`custom-${index}`}
              className={getRequirementItemClasses(requirement)}
            >
              <div onClick={() => handleToggleRequirement(requirement)}>
                {getRequirementIcon(requirement)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <span
                    className={`text-sm font-medium ${
                      isCompleted 
                        ? 'text-green-700 dark:text-green-300 line-through' 
                        : 'text-gray-900 dark:text-white'
                    }`}
                    onClick={() => handleToggleRequirement(requirement)}
                  >
                    {requirement}
                  </span>
                  
                  <div className="flex items-center gap-1 ml-2">
                    {isCompleted && (
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                        ✓ Complete
                      </span>
                    )}
                    
                    {editable && showActions && (
                      <>
                        <button
                          onClick={() => handleEditRequirement(requirement)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteCustomRequirement(requirement)}
                          className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <span className="inline-flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Custom Requirement
                  </span>
                  {isCompleted && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Completed
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {/* Add Custom Requirement */}
        {isAddingRequirement && (
          <div className="flex items-center gap-3 p-3 border border-blue-300 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Circle className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={newRequirement}
              onChange={(e) => setNewRequirement(e.target.value)}
              placeholder="Enter custom requirement..."
              className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddCustomRequirement()
                }
              }}
            />
            <button
              onClick={handleAddCustomRequirement}
              disabled={!newRequirement.trim()}
              className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setIsAddingRequirement(false)
                setNewRequirement('')
              }}
              className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Empty State */}
        {allRequirements.length === 0 && (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Requirements Defined
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This phase doesn't have any predefined requirements.
            </p>
            {editable && showActions && (
              <button
                onClick={() => setIsAddingRequirement(true)}
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Requirement
              </button>
            )}
          </div>
        )}
      </div>

      {/* Completion Status */}
      {allRequirements.length > 0 && (
        <div className={`
          p-4 rounded-lg border
          ${progress === 100
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
          }
        `}>
          <div className="flex items-center gap-3">
            {progress === 100 ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <Clock className="w-5 h-5 text-orange-500" />
            )}
            
            <div>
              <h4 className={`text-sm font-medium ${
                progress === 100 
                  ? 'text-green-700 dark:text-green-300' 
                  : 'text-orange-700 dark:text-orange-300'
              }`}>
                {progress === 100 
                  ? 'Phase Requirements Complete' 
                  : `${missingRequirements.length} Requirements Remaining`
                }
              </h4>
              <p className={`text-sm ${
                progress === 100 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-orange-600 dark:text-orange-400'
              }`}>
                {progress === 100 
                  ? 'All requirements for this phase have been completed.' 
                  : `Complete the remaining requirements to finish this phase.`
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PhaseRequirements