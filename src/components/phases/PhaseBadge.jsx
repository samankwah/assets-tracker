import { PHASE_COLORS } from '../../types/phaseTypes'

const PhaseBadge = ({ phase, size = 'sm', showIcon = false, className = '' }) => {
  if (!phase) return null

  const colors = PHASE_COLORS[phase] || PHASE_COLORS.PLANNING
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-2.5 py-1.5 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-2.5 text-lg'
  }

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        ${colors.bg} ${colors.text} ${colors.border} border
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {showIcon && (
        <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
      )}
      {phase}
    </span>
  )
}

export default PhaseBadge