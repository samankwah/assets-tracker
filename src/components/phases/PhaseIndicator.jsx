import { CheckCircle2, Clock, AlertCircle, Activity } from 'lucide-react'
import { PHASE_COLORS, PHASE_DESCRIPTIONS } from '../../types/phaseTypes'
import { getPhaseProgress } from '../../utils/phaseValidation'

const PhaseIndicator = ({ 
  phase, 
  phaseMetadata, 
  showProgress = true, 
  showDescription = false, 
  orientation = 'horizontal',
  size = 'md',
  className = '' 
}) => {
  if (!phase) return null

  const colors = PHASE_COLORS[phase] || PHASE_COLORS.PLANNING
  const progress = phaseMetadata?.phaseProgress || getPhaseProgress(phase, phaseMetadata?.completedRequirements || [])
  const description = PHASE_DESCRIPTIONS[phase] || ''

  const getStatusIcon = () => {
    if (progress === 100) return CheckCircle2
    if (progress > 50) return Activity
    if (progress > 0) return Clock
    return AlertCircle
  }

  const StatusIcon = getStatusIcon()
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const containerClasses = orientation === 'vertical' 
    ? 'flex flex-col items-center gap-2'
    : 'flex items-center gap-3'

  return (
    <div className={`${containerClasses} ${className}`}>
      {/* Phase Icon and Badge */}
      <div className="flex items-center gap-2">
        <StatusIcon 
          className={`${sizeClasses[size]} ${colors.text}`}
        />
        <span
          className={`
            px-3 py-1.5 rounded-full text-sm font-medium
            ${colors.bg} ${colors.text} ${colors.border} border
          `}
        >
          {phase}
        </span>
      </div>

      {/* Progress Bar (if enabled) */}
      {showProgress && (
        <div className={`
          ${orientation === 'vertical' ? 'w-full' : 'flex-1 min-w-[100px]'}
        `}>
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${colors.dot.replace('bg-', 'bg-opacity-80 bg-')}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Description (if enabled) */}
      {showDescription && (
        <p className={`
          text-sm text-gray-600 dark:text-gray-400
          ${orientation === 'vertical' ? 'text-center' : ''}
        `}>
          {description}
        </p>
      )}
    </div>
  )
}

export default PhaseIndicator