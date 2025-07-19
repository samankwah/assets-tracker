import { useState } from 'react'
import { ChevronDown, ChevronUp, CheckCircle2, Circle, Clock } from 'lucide-react'
import { PHASE_COLORS, PHASE_REQUIREMENTS } from '../../types/phaseTypes'
import { getPhaseProgress, getMissingRequirements } from '../../utils/phaseValidation'

const PhaseProgress = ({ 
  phase, 
  phaseMetadata, 
  onRequirementToggle,
  editable = false,
  showRequirements = true,
  className = '' 
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  
  if (!phase) return null

  const colors = PHASE_COLORS[phase] || PHASE_COLORS.PLANNING
  const completedRequirements = phaseMetadata?.completedRequirements || []
  const allRequirements = PHASE_REQUIREMENTS[phase] || []
  const progress = getPhaseProgress(phase, completedRequirements)
  const missingRequirements = getMissingRequirements(phase, completedRequirements)

  const handleRequirementToggle = (requirement) => {
    if (!editable || !onRequirementToggle) return
    
    const isCompleted = completedRequirements.includes(requirement)
    const newCompleted = isCompleted
      ? completedRequirements.filter(req => req !== requirement)
      : [...completedRequirements, requirement]
    
    onRequirementToggle(newCompleted)
  }

  const getRequirementIcon = (requirement) => {
    if (completedRequirements.includes(requirement)) {
      return <CheckCircle2 className="w-4 h-4 text-green-500" />
    }
    return editable 
      ? <Circle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
      : <Clock className="w-4 h-4 text-orange-500" />
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full ${colors.dot}`} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {phase} Phase Progress
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {progress}% Complete
            </span>
            {showRequirements && allRequirements.length > 0 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${colors.dot.replace('bg-', 'bg-opacity-80 bg-')}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>{completedRequirements.length} of {allRequirements.length} requirements</span>
            <span>{missingRequirements.length} remaining</span>
          </div>
        </div>
      </div>

      {/* Requirements List */}
      {showRequirements && isExpanded && allRequirements.length > 0 && (
        <div className="p-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Phase Requirements
          </h4>
          <div className="space-y-2">
            {allRequirements.map((requirement, index) => {
              const isCompleted = completedRequirements.includes(requirement)
              return (
                <div
                  key={index}
                  className={`
                    flex items-center gap-3 p-2 rounded-md transition-colors
                    ${editable ? 'hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer' : ''}
                    ${isCompleted ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-700/50'}
                  `}
                  onClick={() => handleRequirementToggle(requirement)}
                >
                  {getRequirementIcon(requirement)}
                  <span
                    className={`
                      flex-1 text-sm
                      ${isCompleted 
                        ? 'text-green-700 dark:text-green-300 line-through' 
                        : 'text-gray-700 dark:text-gray-300'
                      }
                    `}
                  >
                    {requirement}
                  </span>
                  {isCompleted && (
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                      Complete
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Phase Notes */}
          {phaseMetadata?.notes && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <h5 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                Phase Notes
              </h5>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {phaseMetadata.notes}
              </p>
            </div>
          )}

          {/* Phase Timeline */}
          {phaseMetadata?.phaseStartDate && (
            <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>
                Started: {new Date(phaseMetadata.phaseStartDate).toLocaleDateString()}
              </span>
              {phaseMetadata.nextPhaseDate && (
                <span>
                  Target: {new Date(phaseMetadata.nextPhaseDate).toLocaleDateString()}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PhaseProgress