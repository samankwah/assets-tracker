import { useState } from 'react'
import { Clock, User, FileText, Calendar, ChevronDown, ChevronUp, Eye } from 'lucide-react'
import { PhaseBadge } from '../phases'
import { PHASE_COLORS } from '../../types/phaseTypes'

const PhaseTimeline = ({ 
  phaseHistory = [], 
  currentPhase,
  phaseMetadata,
  showDetails = true,
  compact = false,
  className = ''
}) => {
  const [expandedEntries, setExpandedEntries] = useState(new Set())

  const toggleExpanded = (entryId) => {
    const newExpanded = new Set(expandedEntries)
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId)
    } else {
      newExpanded.add(entryId)
    }
    setExpandedEntries(newExpanded)
  }

  const formatDuration = (startDate, endDate) => {
    if (!startDate) return null
    
    const start = new Date(startDate)
    const end = endDate ? new Date(endDate) : new Date()
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 30) {
      return `${diffDays} days`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `${months} month${months > 1 ? 's' : ''}`
    } else {
      const years = Math.floor(diffDays / 365)
      const remainingMonths = Math.floor((diffDays % 365) / 30)
      return `${years} year${years > 1 ? 's' : ''}${remainingMonths > 0 ? ` ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`
    }
  }

  const getPhaseIcon = (phase) => {
    const colors = PHASE_COLORS[phase]
    return (
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colors?.bg || 'bg-gray-100'}`}>
        <div className={`w-3 h-3 rounded-full ${colors?.dot || 'bg-gray-500'}`} />
      </div>
    )
  }

  // Combine history with current phase
  const timeline = [...phaseHistory]
  
  // Add current phase if it's not in history
  if (currentPhase && !phaseHistory.find(entry => entry.phase === currentPhase && !entry.endDate)) {
    timeline.push({
      id: 'current',
      phase: currentPhase,
      startDate: phaseMetadata?.phaseStartDate || new Date().toISOString(),
      endDate: null,
      notes: phaseMetadata?.notes || 'Current phase',
      userId: 'system',
      createdAt: phaseMetadata?.phaseStartDate || new Date().toISOString()
    })
  }

  // Sort by date
  timeline.sort((a, b) => new Date(a.startDate) - new Date(b.startDate))

  if (timeline.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No Phase History
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Phase history will appear here as the asset progresses through different phases.
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {!compact && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Phase Timeline
          </h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {timeline.length} phase{timeline.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

        <div className="space-y-6">
          {timeline.map((entry, index) => {
            const isExpanded = expandedEntries.has(entry.id)
            const isCurrent = !entry.endDate
            const duration = formatDuration(entry.startDate, entry.endDate)
            const colors = PHASE_COLORS[entry.phase]

            return (
              <div key={entry.id} className="relative flex">
                {/* Timeline Icon */}
                <div className="relative z-10">
                  {getPhaseIcon(entry.phase)}
                </div>

                {/* Content */}
                <div className="ml-4 flex-1 min-w-0">
                  <div className={`
                    bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4
                    ${isCurrent ? 'ring-2 ring-blue-500 ring-opacity-20' : ''}
                  `}>
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <PhaseBadge phase={entry.phase} size="sm" />
                          {isCurrent && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                              Current
                            </span>
                          )}
                        </div>

                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 space-x-4">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>{new Date(entry.startDate).toLocaleDateString()}</span>
                            {entry.endDate && (
                              <>
                                <span className="mx-2">→</span>
                                <span>{new Date(entry.endDate).toLocaleDateString()}</span>
                              </>
                            )}
                          </div>
                          
                          {duration && (
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              <span>{duration}</span>
                            </div>
                          )}

                          {entry.userId && entry.userId !== 'system' && (
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-1" />
                              <span>{entry.userId}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {showDetails && entry.notes && (
                        <button
                          onClick={() => toggleExpanded(entry.id)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Expanded Details */}
                    {showDetails && isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        {entry.notes && (
                          <div className="mb-3">
                            <div className="flex items-center mb-2">
                              <FileText className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Notes
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 ml-6">
                              {entry.notes}
                            </p>
                          </div>
                        )}

                        {entry.documents && entry.documents.length > 0 && (
                          <div className="mb-3">
                            <div className="flex items-center mb-2">
                              <FileText className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Documents
                              </span>
                            </div>
                            <div className="ml-6 space-y-1">
                              {entry.documents.map((doc, docIndex) => (
                                <div key={docIndex} className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                                  <FileText className="w-3 h-3 mr-1" />
                                  <span>{doc.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Created: {new Date(entry.createdAt).toLocaleString()}
                        </div>
                      </div>
                    )}

                    {/* Quick Notes Preview */}
                    {showDetails && !isExpanded && entry.notes && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {entry.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Future Phases Indicator */}
        {currentPhase && phaseMetadata?.nextPhaseDate && (
          <div className="relative flex mt-6">
            <div className="relative z-10">
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                <Clock className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            
            <div className="ml-4 flex-1">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Next Phase Scheduled
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(phaseMetadata.nextPhaseDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Planned
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {!compact && timeline.length > 1 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Total Phases
            </div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {timeline.length}
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="text-sm font-medium text-green-700 dark:text-green-300">
              Current Phase
            </div>
            <div className="text-lg font-semibold text-green-900 dark:text-green-100">
              {currentPhase}
            </div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Total Duration
            </div>
            <div className="text-lg font-semibold text-purple-900 dark:text-purple-100">
              {formatDuration(timeline[0]?.startDate, new Date().toISOString()) || 'N/A'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PhaseTimeline