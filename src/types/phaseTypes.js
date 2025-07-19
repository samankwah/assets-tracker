// Phase system type definitions and constants

export const PHASES = {
  PLANNING: 'Planning',
  ACQUISITION: 'Acquisition', 
  DEVELOPMENT: 'Development',
  ACTIVE: 'Active',
  MAINTENANCE: 'Maintenance',
  DISPOSAL: 'Disposal'
}

export const PHASE_ORDER = [
  PHASES.PLANNING,
  PHASES.ACQUISITION,
  PHASES.DEVELOPMENT,
  PHASES.ACTIVE,
  PHASES.MAINTENANCE,
  PHASES.DISPOSAL
]

export const PHASE_COLORS = {
  [PHASES.PLANNING]: {
    bg: 'bg-purple-100 dark:bg-purple-900',
    text: 'text-purple-800 dark:text-purple-200',
    border: 'border-purple-200 dark:border-purple-700',
    dot: 'bg-purple-500'
  },
  [PHASES.ACQUISITION]: {
    bg: 'bg-blue-100 dark:bg-blue-900',
    text: 'text-blue-800 dark:text-blue-200',
    border: 'border-blue-200 dark:border-blue-700',
    dot: 'bg-blue-500'
  },
  [PHASES.DEVELOPMENT]: {
    bg: 'bg-orange-100 dark:bg-orange-900',
    text: 'text-orange-800 dark:text-orange-200',
    border: 'border-orange-200 dark:border-orange-700',
    dot: 'bg-orange-500'
  },
  [PHASES.ACTIVE]: {
    bg: 'bg-green-100 dark:bg-green-900',
    text: 'text-green-800 dark:text-green-200',
    border: 'border-green-200 dark:border-green-700',
    dot: 'bg-green-500'
  },
  [PHASES.MAINTENANCE]: {
    bg: 'bg-yellow-100 dark:bg-yellow-900',
    text: 'text-yellow-800 dark:text-yellow-200',
    border: 'border-yellow-200 dark:border-yellow-700',
    dot: 'bg-yellow-500'
  },
  [PHASES.DISPOSAL]: {
    bg: 'bg-red-100 dark:bg-red-900',
    text: 'text-red-800 dark:text-red-200',
    border: 'border-red-200 dark:border-red-700',
    dot: 'bg-red-500'
  }
}

export const PHASE_DESCRIPTIONS = {
  [PHASES.PLANNING]: 'Initial asset research and acquisition planning',
  [PHASES.ACQUISITION]: 'Asset purchase and legal processes',
  [PHASES.DEVELOPMENT]: 'Renovation, improvement, or initial setup',
  [PHASES.ACTIVE]: 'Operational phase with regular maintenance',
  [PHASES.MAINTENANCE]: 'Major maintenance or renovation period',
  [PHASES.DISPOSAL]: 'Preparing for sale or permanent closure'
}

export const PHASE_REQUIREMENTS = {
  [PHASES.PLANNING]: [
    'Market research completed',
    'Financial analysis done',
    'Location evaluation',
    'Investment goals defined'
  ],
  [PHASES.ACQUISITION]: [
    'Legal documentation complete',
    'Purchase agreement signed',
    'Title transfer completed',
    'Insurance obtained'
  ],
  [PHASES.DEVELOPMENT]: [
    'Development plan approved',
    'Permits obtained',
    'Contractors selected',
    'Timeline established'
  ],
  [PHASES.ACTIVE]: [
    'Property ready for use',
    'Regular maintenance scheduled',
    'Tenant management active',
    'Performance tracking setup'
  ],
  [PHASES.MAINTENANCE]: [
    'Maintenance plan defined',
    'Service providers contracted',
    'Budget allocated',
    'Timeline established'
  ],
  [PHASES.DISPOSAL]: [
    'Market evaluation completed',
    'Legal preparation done',
    'Asset valuation obtained',
    'Sale strategy defined'
  ]
}

export const PHASE_TRANSITIONS = {
  [PHASES.PLANNING]: [PHASES.ACQUISITION, PHASES.DISPOSAL],
  [PHASES.ACQUISITION]: [PHASES.DEVELOPMENT, PHASES.ACTIVE],
  [PHASES.DEVELOPMENT]: [PHASES.ACTIVE, PHASES.MAINTENANCE],
  [PHASES.ACTIVE]: [PHASES.MAINTENANCE, PHASES.DISPOSAL],
  [PHASES.MAINTENANCE]: [PHASES.ACTIVE, PHASES.DEVELOPMENT, PHASES.DISPOSAL],
  [PHASES.DISPOSAL]: [] // End phase
}

export const PHASE_ICONS = {
  [PHASES.PLANNING]: 'clipboard-list',
  [PHASES.ACQUISITION]: 'shopping-cart',
  [PHASES.DEVELOPMENT]: 'hammer',
  [PHASES.ACTIVE]: 'play-circle',
  [PHASES.MAINTENANCE]: 'wrench',
  [PHASES.DISPOSAL]: 'trash-2'
}

// Default phase metadata structure
export const createPhaseMetadata = (phase) => ({
  currentPhase: phase,
  phaseStartDate: new Date().toISOString(),
  phaseProgress: 0,
  requirements: PHASE_REQUIREMENTS[phase] || [],
  completedRequirements: [],
  nextPhaseDate: null,
  notes: '',
  blockedBy: [],
  autoProgress: false
})

// Phase history entry structure
export const createPhaseHistoryEntry = (phase, startDate, endDate = null, notes = '', userId = null) => ({
  id: Date.now() + Math.random(),
  phase,
  startDate,
  endDate,
  duration: endDate ? new Date(endDate) - new Date(startDate) : null,
  notes,
  userId,
  createdAt: new Date().toISOString()
})