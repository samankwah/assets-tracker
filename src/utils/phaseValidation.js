import { PHASES, PHASE_TRANSITIONS, PHASE_REQUIREMENTS, PHASE_ORDER } from '../types/phaseTypes'

// Validate if a phase transition is allowed
export const canTransitionToPhase = (currentPhase, targetPhase) => {
  if (!currentPhase || !targetPhase) return false
  if (currentPhase === targetPhase) return false
  
  const allowedTransitions = PHASE_TRANSITIONS[currentPhase] || []
  return allowedTransitions.includes(targetPhase)
}

// Get all possible next phases for a current phase
export const getNextPhases = (currentPhase) => {
  return PHASE_TRANSITIONS[currentPhase] || []
}

// Validate if all requirements are met for a phase
export const arePhaseRequirementsMet = (phase, completedRequirements = []) => {
  const requiredItems = PHASE_REQUIREMENTS[phase] || []
  return requiredItems.every(requirement => completedRequirements.includes(requirement))
}

// Get phase completion percentage
export const getPhaseProgress = (phase, completedRequirements = []) => {
  const requiredItems = PHASE_REQUIREMENTS[phase] || []
  if (requiredItems.length === 0) return 100
  
  const completedCount = requiredItems.filter(requirement => 
    completedRequirements.includes(requirement)
  ).length
  
  return Math.round((completedCount / requiredItems.length) * 100)
}

// Get missing requirements for a phase
export const getMissingRequirements = (phase, completedRequirements = []) => {
  const requiredItems = PHASE_REQUIREMENTS[phase] || []
  return requiredItems.filter(requirement => !completedRequirements.includes(requirement))
}

// Validate phase transition with business rules
export const validatePhaseTransition = (asset, targetPhase, options = {}) => {
  const errors = []
  const warnings = []
  
  if (!asset) {
    errors.push('Asset is required for phase transition')
    return { isValid: false, errors, warnings }
  }
  
  const currentPhase = asset.currentPhase || asset.phaseMetadata?.currentPhase
  
  if (!currentPhase) {
    errors.push('Current phase is not defined')
    return { isValid: false, errors, warnings }
  }
  
  // Check if transition is allowed
  if (!canTransitionToPhase(currentPhase, targetPhase)) {
    errors.push(`Cannot transition from ${currentPhase} to ${targetPhase}`)
  }
  
  // Check if current phase requirements are met (unless forcing)
  if (!options.force && !arePhaseRequirementsMet(currentPhase, asset.phaseMetadata?.completedRequirements)) {
    const missing = getMissingRequirements(currentPhase, asset.phaseMetadata?.completedRequirements)
    warnings.push(`Current phase requirements not fully met: ${missing.join(', ')}`)
  }
  
  // Business rule validations
  switch (targetPhase) {
    case PHASES.ACQUISITION:
      if (!asset.address || !asset.address.street) {
        errors.push('Asset address is required for acquisition phase')
      }
      break
      
    case PHASES.DEVELOPMENT:
      if (asset.condition === 'Good' && !options.force) {
        warnings.push('Asset is in good condition - development phase may not be necessary')
      }
      break
      
    case PHASES.ACTIVE:
      if (asset.condition === 'Critical') {
        errors.push('Asset condition is critical - cannot move to active phase')
      }
      break
      
    case PHASES.DISPOSAL:
      if (asset.status === 'Under Maintenance' && !options.force) {
        warnings.push('Asset is under maintenance - consider completing maintenance before disposal')
      }
      break
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// Get phase order index
export const getPhaseOrderIndex = (phase) => {
  return PHASE_ORDER.indexOf(phase)
}

// Check if phase A comes before phase B in the typical workflow
export const isPhaseEarlier = (phaseA, phaseB) => {
  return getPhaseOrderIndex(phaseA) < getPhaseOrderIndex(phaseB)
}

// Calculate estimated phase duration based on historical data
export const estimatePhaseDuration = (phase, assetType = 'Apartment') => {
  // Default estimates in days - these could be made configurable or learned from data
  const estimates = {
    [PHASES.PLANNING]: { 
      'Apartment': 30, 
      'House': 45, 
      'Condo': 25, 
      'Commercial': 60 
    },
    [PHASES.ACQUISITION]: { 
      'Apartment': 60, 
      'House': 90, 
      'Condo': 45, 
      'Commercial': 120 
    },
    [PHASES.DEVELOPMENT]: { 
      'Apartment': 90, 
      'House': 120, 
      'Condo': 75, 
      'Commercial': 180 
    },
    [PHASES.ACTIVE]: { 
      'Apartment': 1825, // 5 years
      'House': 2555, // 7 years
      'Condo': 1460, // 4 years
      'Commercial': 3650 // 10 years
    },
    [PHASES.MAINTENANCE]: { 
      'Apartment': 60, 
      'House': 90, 
      'Condo': 45, 
      'Commercial': 120 
    },
    [PHASES.DISPOSAL]: { 
      'Apartment': 90, 
      'House': 120, 
      'Condo': 75, 
      'Commercial': 150 
    }
  }
  
  return estimates[phase]?.[assetType] || estimates[phase]?.['Apartment'] || 30
}

// Generate recommended next steps for a phase
export const getPhaseNextSteps = (phase, completedRequirements = []) => {
  const allRequirements = PHASE_REQUIREMENTS[phase] || []
  const missingRequirements = getMissingRequirements(phase, completedRequirements)
  
  const nextSteps = []
  
  // Add missing requirements as next steps
  missingRequirements.slice(0, 3).forEach(requirement => {
    nextSteps.push({
      id: `req_${requirement.replace(/\s+/g, '_').toLowerCase()}`,
      title: `Complete: ${requirement}`,
      type: 'requirement',
      priority: 'high',
      description: `Complete the requirement: ${requirement}`
    })
  })
  
  // Add phase-specific recommendations
  switch (phase) {
    case PHASES.PLANNING:
      if (!missingRequirements.includes('Market research completed')) {
        nextSteps.push({
          id: 'schedule_market_research',
          title: 'Schedule market research session',
          type: 'action',
          priority: 'medium',
          description: 'Set up meeting with real estate analyst'
        })
      }
      break
      
    case PHASES.ACTIVE:
      nextSteps.push({
        id: 'schedule_maintenance',
        title: 'Schedule routine maintenance',
        type: 'action',
        priority: 'medium',
        description: 'Set up regular maintenance schedule'
      })
      break
  }
  
  return nextSteps
}