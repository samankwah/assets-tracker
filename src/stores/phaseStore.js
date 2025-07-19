import { create } from 'zustand'
import { 
  PHASES, 
  PHASE_ORDER, 
  createPhaseMetadata, 
  createPhaseHistoryEntry 
} from '../types/phaseTypes'
import { 
  validatePhaseTransition, 
  getPhaseProgress, 
  getMissingRequirements,
  getPhaseNextSteps,
  estimatePhaseDuration 
} from '../utils/phaseValidation'
import { useNotificationStore } from './notificationStore'

export const usePhaseStore = create((set, get) => ({
  // Phase configuration and metadata
  phases: Object.values(PHASES),
  phaseOrder: PHASE_ORDER,
  
  // Asset phase mappings and history
  assetPhases: {}, // { assetId: phaseMetadata }
  phaseHistory: {}, // { assetId: [phaseHistoryEntries] }
  
  // Active transitions and operations
  activeTransitions: [], // In-progress phase transitions
  loading: false,
  error: null,
  
  // Phase statistics and metrics
  phaseMetrics: {
    distribution: {},
    averageDurations: {},
    transitionSuccess: {},
    lastCalculated: null
  },
  
  // Phase management actions
  initializeAssetPhase: (assetId, initialPhase = PHASES.PLANNING, options = {}) => {
    const { assetPhases, phaseHistory } = get()
    
    // Create phase metadata
    const phaseMetadata = createPhaseMetadata(initialPhase)
    if (options.notes) phaseMetadata.notes = options.notes
    if (options.autoProgress) phaseMetadata.autoProgress = options.autoProgress
    
    // Create initial history entry
    const historyEntry = createPhaseHistoryEntry(
      initialPhase,
      new Date().toISOString(),
      null,
      options.notes || 'Initial phase assignment',
      options.userId
    )
    
    set({
      assetPhases: {
        ...assetPhases,
        [assetId]: phaseMetadata
      },
      phaseHistory: {
        ...phaseHistory,
        [assetId]: [historyEntry]
      }
    })
    
    return phaseMetadata
  },
  
  // Transition asset to new phase
  transitionAssetPhase: async (assetId, targetPhase, options = {}) => {
    const { assetPhases, phaseHistory, activeTransitions } = get()
    
    // Get current asset data (this would typically come from asset store)
    const currentPhaseData = assetPhases[assetId]
    if (!currentPhaseData) {
      throw new Error('Asset phase data not found')
    }
    
    const currentPhase = currentPhaseData.currentPhase
    
    // Validate transition
    const validation = validatePhaseTransition(
      { currentPhase, phaseMetadata: currentPhaseData },
      targetPhase,
      options
    )
    
    if (!validation.isValid && !options.force) {
      throw new Error(`Phase transition failed: ${validation.errors.join(', ')}`)
    }
    
    // Add to active transitions
    const transitionId = `${assetId}_${Date.now()}`
    set({
      activeTransitions: [...activeTransitions, {
        id: transitionId,
        assetId,
        fromPhase: currentPhase,
        toPhase: targetPhase,
        startTime: new Date().toISOString(),
        status: 'in_progress'
      }]
    })
    
    try {
      // Update phase metadata
      const newPhaseMetadata = {
        ...currentPhaseData,
        currentPhase: targetPhase,
        phaseStartDate: new Date().toISOString(),
        phaseProgress: 0,
        requirements: getMissingRequirements(targetPhase, []),
        completedRequirements: [],
        nextPhaseDate: options.nextPhaseDate || null,
        notes: options.notes || '',
        previousPhase: currentPhase
      }
      
      // Close current phase in history
      const currentHistory = phaseHistory[assetId] || []
      const updatedHistory = currentHistory.map(entry => 
        entry.phase === currentPhase && !entry.endDate
          ? { ...entry, endDate: new Date().toISOString() }
          : entry
      )
      
      // Add new phase to history
      const newHistoryEntry = createPhaseHistoryEntry(
        targetPhase,
        new Date().toISOString(),
        null,
        options.notes || `Transitioned from ${currentPhase}`,
        options.userId
      )
      
      // Update state
      set({
        assetPhases: {
          ...assetPhases,
          [assetId]: newPhaseMetadata
        },
        phaseHistory: {
          ...phaseHistory,
          [assetId]: [...updatedHistory, newHistoryEntry]
        },
        activeTransitions: activeTransitions.filter(t => t.id !== transitionId)
      })
      
      // Create notification
      const { createNotification } = useNotificationStore.getState()
      createNotification({
        type: 'success',
        title: 'Phase Transition Complete',
        message: `Asset transitioned from ${currentPhase} to ${targetPhase}`,
        assetId
      })
      
      // Show warnings if any
      if (validation.warnings.length > 0) {
        validation.warnings.forEach(warning => {
          createNotification({
            type: 'warning',
            title: 'Phase Transition Warning',
            message: warning,
            assetId
          })
        })
      }
      
      return newPhaseMetadata
      
    } catch (error) {
      // Remove from active transitions on error
      set({
        activeTransitions: activeTransitions.filter(t => t.id !== transitionId)
      })
      throw error
    }
  },
  
  // Update phase requirements completion
  updatePhaseRequirements: (assetId, completedRequirements, notes = '') => {
    const { assetPhases } = get()
    const currentPhaseData = assetPhases[assetId]
    
    if (!currentPhaseData) return
    
    const progress = getPhaseProgress(currentPhaseData.currentPhase, completedRequirements)
    
    set({
      assetPhases: {
        ...assetPhases,
        [assetId]: {
          ...currentPhaseData,
          completedRequirements,
          phaseProgress: progress,
          notes: notes || currentPhaseData.notes,
          updatedAt: new Date().toISOString()
        }
      }
    })
    
    // Auto-progress if enabled and all requirements met
    if (currentPhaseData.autoProgress && progress === 100) {
      // This would trigger auto-transition logic
      console.log(`Auto-progress triggered for asset ${assetId}`)
    }
  },
  
  // Get phase data for an asset
  getAssetPhase: (assetId) => {
    const { assetPhases } = get()
    return assetPhases[assetId] || null
  },
  
  // Get phase history for an asset
  getAssetPhaseHistory: (assetId) => {
    const { phaseHistory } = get()
    return phaseHistory[assetId] || []
  },
  
  // Get current phase statistics
  getPhaseStatistics: () => {
    const { assetPhases } = get()
    const stats = {
      total: 0,
      byPhase: {},
      avgProgress: 0,
      requirementCompletion: {}
    }
    
    Object.values(PHASES).forEach(phase => {
      stats.byPhase[phase] = 0
      stats.requirementCompletion[phase] = 0
    })
    
    let totalProgress = 0
    let totalAssets = 0
    
    Object.values(assetPhases).forEach(phaseData => {
      const phase = phaseData.currentPhase
      if (phase) {
        stats.byPhase[phase]++
        totalProgress += phaseData.phaseProgress || 0
        totalAssets++
      }
    })
    
    stats.total = totalAssets
    stats.avgProgress = totalAssets > 0 ? Math.round(totalProgress / totalAssets) : 0
    
    return stats
  },
  
  // Get phase distribution for charts
  getPhaseDistribution: () => {
    const { assetPhases } = get()
    const distribution = {}
    
    Object.values(PHASES).forEach(phase => {
      distribution[phase] = 0
    })
    
    Object.values(assetPhases).forEach(phaseData => {
      const phase = phaseData.currentPhase
      if (phase && distribution.hasOwnProperty(phase)) {
        distribution[phase]++
      }
    })
    
    return distribution
  },
  
  // Get assets in specific phase
  getAssetsByPhase: (phase) => {
    const { assetPhases } = get()
    return Object.entries(assetPhases)
      .filter(([_, phaseData]) => phaseData.currentPhase === phase)
      .map(([assetId, phaseData]) => ({ assetId, ...phaseData }))
  },
  
  // Get upcoming phase transitions (based on nextPhaseDate)
  getUpcomingTransitions: (days = 30) => {
    const { assetPhases } = get()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() + days)
    
    return Object.entries(assetPhases)
      .filter(([_, phaseData]) => {
        if (!phaseData.nextPhaseDate) return false
        const nextDate = new Date(phaseData.nextPhaseDate)
        return nextDate <= cutoffDate
      })
      .map(([assetId, phaseData]) => ({
        assetId,
        currentPhase: phaseData.currentPhase,
        nextPhaseDate: phaseData.nextPhaseDate,
        daysUntil: Math.ceil((new Date(phaseData.nextPhaseDate) - new Date()) / (1000 * 60 * 60 * 24))
      }))
      .sort((a, b) => a.daysUntil - b.daysUntil)
  },
  
  // Get phase recommendations for an asset
  getPhaseRecommendations: (assetId) => {
    const { assetPhases } = get()
    const phaseData = assetPhases[assetId]
    
    if (!phaseData) return []
    
    return getPhaseNextSteps(
      phaseData.currentPhase, 
      phaseData.completedRequirements || []
    )
  },
  
  // Calculate metrics and analytics
  calculatePhaseMetrics: () => {
    const { assetPhases, phaseHistory } = get()
    
    const metrics = {
      distribution: get().getPhaseDistribution(),
      averageDurations: {},
      transitionSuccess: {},
      lastCalculated: new Date().toISOString()
    }
    
    // Calculate average durations for each phase
    Object.values(PHASES).forEach(phase => {
      const durations = []
      
      Object.values(phaseHistory).forEach(history => {
        const phaseEntries = history.filter(entry => 
          entry.phase === phase && entry.duration
        )
        phaseEntries.forEach(entry => {
          durations.push(entry.duration / (1000 * 60 * 60 * 24)) // Convert to days
        })
      })
      
      metrics.averageDurations[phase] = durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : estimatePhaseDuration(phase)
    })
    
    set({ phaseMetrics: metrics })
    return metrics
  },
  
  // Bulk operations
  bulkTransitionAssets: async (assetIds, targetPhase, options = {}) => {
    const results = []
    
    for (const assetId of assetIds) {
      try {
        const result = await get().transitionAssetPhase(assetId, targetPhase, options)
        results.push({ assetId, success: true, result })
      } catch (error) {
        results.push({ assetId, success: false, error: error.message })
      }
    }
    
    return results
  },
  
  // Import/Export functionality
  exportPhaseData: (assetIds = null) => {
    const { assetPhases, phaseHistory } = get()
    
    const exportData = {
      timestamp: new Date().toISOString(),
      assetPhases: assetIds 
        ? Object.fromEntries(
            Object.entries(assetPhases).filter(([id]) => assetIds.includes(id))
          )
        : assetPhases,
      phaseHistory: assetIds
        ? Object.fromEntries(
            Object.entries(phaseHistory).filter(([id]) => assetIds.includes(id))
          )
        : phaseHistory
    }
    
    return exportData
  },
  
  // Loading and error states
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  
  // Reset store
  reset: () => set({
    assetPhases: {},
    phaseHistory: {},
    activeTransitions: [],
    loading: false,
    error: null,
    phaseMetrics: {
      distribution: {},
      averageDurations: {},
      transitionSuccess: {},
      lastCalculated: null
    }
  })
}))