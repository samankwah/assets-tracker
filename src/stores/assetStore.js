import { create } from 'zustand'
import { useNotificationStore } from './notificationStore'
import { usePhaseStore } from './phaseStore'
import assetService, { mockAssetService } from '../services/assetService'
import assetInspectionService from '../services/assetInspectionService'
import { shouldUseMockApi } from '../services/apiService'
import { PHASES, createPhaseMetadata } from '../types/phaseTypes'

// Mock data for assets
const mockAssets = [
  {
    id: 1,
    name: 'Los Palmas',
    type: 'Apartment',
    status: 'Scheduled for Inspection',
    condition: 'Good',
    currentPhase: PHASES.ACTIVE,
    phaseMetadata: {
      currentPhase: PHASES.ACTIVE,
      phaseStartDate: '2025-05-01T00:00:00Z',
      phaseProgress: 75,
      requirements: ['Property ready for use', 'Regular maintenance scheduled', 'Tenant management active', 'Performance tracking setup'],
      completedRequirements: ['Property ready for use', 'Regular maintenance scheduled', 'Tenant management active'],
      nextPhaseDate: null,
      notes: 'Property performing well, regular maintenance ongoing',
      autoProgress: false
    },
    address: {
      street: 'Off Boundary Road',
      city: 'Los Palmas',
      state: 'California',
      zipCode: '90210'
    },
    details: {
      bedrooms: 4,
      bathrooms: 3,
      floors: 2,
      balcony: true,
      features: ['Spacious', 'Modern appliances', 'Elegant dining area']
    },
    images: ['/api/placeholder/400/300'],
    inspectionStatus: 'Not Inspected',
    inspectionDate: '2025-07-10',
    priority: 'High',
    frequency: 'Monthly',
    condition: 'Needs Repairs',
    lastInspection: '2025-06-15',
    nextInspection: '2025-07-23',
    createdAt: '2025-06-01',
    updatedAt: '2025-07-01'
  },
  {
    id: 2,
    name: 'Gregory Street House',
    type: 'House',
    status: 'Under Maintenance',
    condition: 'Fair',
    currentPhase: PHASES.MAINTENANCE,
    phaseMetadata: {
      currentPhase: PHASES.MAINTENANCE,
      phaseStartDate: '2025-06-15T00:00:00Z',
      phaseProgress: 60,
      requirements: ['Maintenance plan defined', 'Service providers contracted', 'Budget allocated', 'Timeline established'],
      completedRequirements: ['Maintenance plan defined', 'Service providers contracted'],
      nextPhaseDate: '2025-08-15T00:00:00Z',
      notes: 'Major plumbing and electrical work in progress',
      autoProgress: false
    },
    address: {
      street: 'Gregory Street',
      city: 'New Hampshire',
      state: 'New Hampshire',
      zipCode: '03101'
    },
    details: {
      bedrooms: 3,
      bathrooms: 2,
      floors: 1,
      balcony: false,
      features: ['Inviting living room', 'Well-appointed kitchen', 'Modern appliances']
    },
    images: ['/api/placeholder/400/300'],
    inspectionStatus: 'Recently Inspected',
    inspectionDate: '2025-07-15',
    priority: 'Medium',
    frequency: 'Quarterly',
    condition: 'Good',
    lastInspection: '2025-07-01',
    nextInspection: '2025-08-01',
    createdAt: '2025-05-15',
    updatedAt: '2025-07-01'
  },
  {
    id: 3,
    name: 'Calgary Street Condo',
    type: 'Apartment',
    status: 'Overdue For Maintenance',
    condition: 'Critical',
    currentPhase: PHASES.DISPOSAL,
    phaseMetadata: {
      currentPhase: PHASES.DISPOSAL,
      phaseStartDate: '2025-06-01T00:00:00Z',
      phaseProgress: 40,
      requirements: ['Market evaluation completed', 'Legal preparation done', 'Asset valuation obtained', 'Sale strategy defined'],
      completedRequirements: ['Market evaluation completed', 'Asset valuation obtained'],
      nextPhaseDate: null,
      notes: 'Property requires significant repairs, disposal recommended',
      autoProgress: false
    },
    address: {
      street: 'No 4 Calgary Street',
      city: 'Calgary',
      state: 'Alberta',
      zipCode: 'T2P 1N4'
    },
    details: {
      bedrooms: 2,
      bathrooms: 1,
      floors: 1,
      balcony: true,
      features: ['Compact design', 'City view', 'Updated fixtures']
    },
    images: ['/api/placeholder/400/300'],
    inspectionStatus: 'Overdue',
    inspectionDate: '2025-06-20',
    priority: 'High',
    frequency: 'Monthly',
    condition: 'Repair',
    lastInspection: '2025-05-20',
    nextInspection: '2025-07-20',
    createdAt: '2025-04-10',
    updatedAt: '2025-06-25'
  },
  {
    id: 4,
    name: 'Gregory Street, New Hampshire',
    type: 'House',
    status: 'Scheduled for Inspection',
    condition: 'Needs Repairs',
    currentPhase: PHASES.ACTIVE,
    phaseMetadata: {
      currentPhase: PHASES.ACTIVE,
      phaseStartDate: '2025-05-01T00:00:00Z',
      phaseProgress: 80,
      requirements: ['Property ready for use', 'Regular maintenance scheduled'],
      completedRequirements: ['Property ready for use'],
      nextPhaseDate: null,
      notes: 'Recently renovated property',
      autoProgress: false
    },
    address: {
      street: 'Gregory Street',
      city: 'New Hampshire',
      state: 'New Hampshire',
      zipCode: '03102'
    },
    details: {
      bedrooms: 4,
      bathrooms: 3,
      floors: 2,
      balcony: true,
      features: ['Spacious living area', 'Modern kitchen', 'Updated bathrooms']
    },
    images: ['/api/placeholder/400/300'],
    inspectionStatus: 'Recently Inspected',
    inspectionDate: '2025-07-15',
    priority: 'Inspection Due Soon',
    frequency: 'Monthly',
    condition: 'Needs Repairs',
    lastInspection: '2025-07-01',
    nextInspection: '2025-08-01',
    createdAt: '2025-06-01',
    updatedAt: '2025-07-15'
  },
  {
    id: 5,
    name: 'Gregory Street, New Hampshire',
    type: 'House',
    status: 'Due For Maintenance',
    condition: 'Needs Repairs',
    currentPhase: PHASES.MAINTENANCE,
    phaseMetadata: {
      currentPhase: PHASES.MAINTENANCE,
      phaseStartDate: '2025-06-01T00:00:00Z',
      phaseProgress: 45,
      requirements: ['Maintenance plan defined', 'Service providers contracted'],
      completedRequirements: ['Maintenance plan defined'],
      nextPhaseDate: '2025-09-01T00:00:00Z',
      notes: 'Scheduled for major repairs',
      autoProgress: false
    },
    address: {
      street: 'Gregory Street',
      city: 'New Hampshire',
      state: 'New Hampshire',
      zipCode: '03103'
    },
    details: {
      bedrooms: 3,
      bathrooms: 2,
      floors: 2,
      balcony: false,
      features: ['Cozy living room', 'Updated kitchen', 'Hardwood floors']
    },
    images: ['/api/placeholder/400/300'],
    inspectionStatus: 'Inspection Due',
    inspectionDate: '2025-07-20',
    priority: 'High Priority',
    frequency: 'Quarterly',
    condition: 'Needs Repairs',
    lastInspection: '2025-06-20',
    nextInspection: '2025-08-20',
    createdAt: '2025-05-20',
    updatedAt: '2025-07-10'
  },
  {
    id: 6,
    name: 'Gregory Street, New Hampshire',
    type: 'House',
    status: 'Overdue For Maintenance',
    condition: 'Critical',
    currentPhase: PHASES.MAINTENANCE,
    phaseMetadata: {
      currentPhase: PHASES.MAINTENANCE,
      phaseStartDate: '2025-05-15T00:00:00Z',
      phaseProgress: 20,
      requirements: ['Emergency repairs needed', 'Contractor evaluation'],
      completedRequirements: [],
      nextPhaseDate: null,
      notes: 'Critical maintenance required immediately',
      autoProgress: false
    },
    address: {
      street: 'Gregory Street',
      city: 'New Hampshire',
      state: 'New Hampshire',
      zipCode: '03104'
    },
    details: {
      bedrooms: 2,
      bathrooms: 1,
      floors: 1,
      balcony: false,
      features: ['Compact design', 'Needs renovation', 'Original fixtures']
    },
    images: ['/api/placeholder/400/300'],
    inspectionStatus: 'Inspection Overdue',
    inspectionDate: '2025-06-01',
    priority: 'High Priority',
    frequency: 'Quarterly',
    condition: 'Critical',
    lastInspection: '2025-05-01',
    nextInspection: '2025-07-01',
    createdAt: '2025-04-15',
    updatedAt: '2025-06-15'
  },
  {
    id: 7,
    name: 'Gregory Street, New Hampshire',
    type: 'House',
    status: 'Under Maintenance',
    condition: 'Needs Repairs',
    currentPhase: PHASES.MAINTENANCE,
    phaseMetadata: {
      currentPhase: PHASES.MAINTENANCE,
      phaseStartDate: '2025-06-10T00:00:00Z',
      phaseProgress: 65,
      requirements: ['Work in progress', 'Quality inspections'],
      completedRequirements: ['Work in progress'],
      nextPhaseDate: '2025-08-10T00:00:00Z',
      notes: 'Renovation work underway',
      autoProgress: false
    },
    address: {
      street: 'Gregory Street',
      city: 'New Hampshire',
      state: 'New Hampshire',
      zipCode: '03105'
    },
    details: {
      bedrooms: 3,
      bathrooms: 2,
      floors: 1,
      balcony: true,
      features: ['Under renovation', 'Modern appliances', 'New flooring']
    },
    images: ['/api/placeholder/400/300'],
    inspectionStatus: 'Recently Inspected',
    inspectionDate: '2025-07-10',
    priority: 'Inspection Due Soon',
    frequency: 'Monthly',
    condition: 'Needs Repairs',
    lastInspection: '2025-07-05',
    nextInspection: '2025-08-05',
    createdAt: '2025-06-01',
    updatedAt: '2025-07-15'
  },
  {
    id: 8,
    name: 'Gregory Street, New Hampshire',
    type: 'House',
    status: 'Scheduled for Inspection',
    condition: 'Fair',
    currentPhase: PHASES.ACTIVE,
    phaseMetadata: {
      currentPhase: PHASES.ACTIVE,
      phaseStartDate: '2025-05-20T00:00:00Z',
      phaseProgress: 90,
      requirements: ['Property ready for use', 'Regular maintenance scheduled'],
      completedRequirements: ['Property ready for use', 'Regular maintenance scheduled'],
      nextPhaseDate: null,
      notes: 'Well-maintained property',
      autoProgress: false
    },
    address: {
      street: 'Gregory Street',
      city: 'New Hampshire',
      state: 'New Hampshire',
      zipCode: '03106'
    },
    details: {
      bedrooms: 4,
      bathrooms: 3,
      floors: 2,
      balcony: true,
      features: ['Large living spaces', 'Modern appliances', 'Well-maintained']
    },
    images: ['/api/placeholder/400/300'],
    inspectionStatus: 'Recently Inspected',
    inspectionDate: '2025-07-18',
    priority: 'Inspection Due Soon',
    frequency: 'Monthly',
    condition: 'Fair',
    lastInspection: '2025-07-10',
    nextInspection: '2025-08-10',
    createdAt: '2025-05-15',
    updatedAt: '2025-07-18'
  },
  {
    id: 9,
    name: 'Gregory Street, New Hampshire',
    type: 'House',
    status: 'Scheduled for Inspection',
    condition: 'Fair',
    currentPhase: PHASES.ACTIVE,
    phaseMetadata: {
      currentPhase: PHASES.ACTIVE,
      phaseStartDate: '2025-06-01T00:00:00Z',
      phaseProgress: 85,
      requirements: ['Property ready for use', 'Regular maintenance scheduled'],
      completedRequirements: ['Property ready for use'],
      nextPhaseDate: null,
      notes: 'Stable property condition',
      autoProgress: false
    },
    address: {
      street: 'Gregory Street',
      city: 'New Hampshire',
      state: 'New Hampshire',
      zipCode: '03107'
    },
    details: {
      bedrooms: 3,
      bathrooms: 2,
      floors: 1,
      balcony: false,
      features: ['Comfortable layout', 'Updated kitchen', 'Good condition']
    },
    images: ['/api/placeholder/400/300'],
    inspectionStatus: 'Recently Inspected',
    inspectionDate: '2025-07-12',
    priority: 'Inspection Due Soon',
    frequency: 'Monthly',
    condition: 'Fair',
    lastInspection: '2025-07-05',
    nextInspection: '2025-08-05',
    createdAt: '2025-05-25',
    updatedAt: '2025-07-12'
  }
]

export const useAssetStore = create((set, get) => ({
  assets: mockAssets,
  selectedAsset: null,
  loading: false,
  error: null,
  filters: {
    status: '',
    type: '',
    condition: '',
    inspectionStatus: '',
    currentPhase: ''
  },
  searchTerm: '',

  // Asset CRUD operations
  createAsset: (assetData) => {
    const initialPhase = assetData.currentPhase || PHASES.PLANNING
    const phaseMetadata = assetData.phaseMetadata || createPhaseMetadata(initialPhase)
    
    const newAsset = {
      id: Date.now(),
      ...assetData,
      currentPhase: initialPhase,
      phaseMetadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    set(state => ({ assets: [...state.assets, newAsset] }))
    
    // Initialize phase tracking in phase store
    const { initializeAssetPhase } = usePhaseStore.getState()
    initializeAssetPhase(newAsset.id, initialPhase, {
      notes: phaseMetadata.notes,
      autoProgress: phaseMetadata.autoProgress
    })
    
    return newAsset
  },

  updateAsset: (id, assetData) => {
    const { assets } = get()
    const asset = assets.find(a => a.id === id)
    
    set(state => ({
      assets: state.assets.map(asset => 
        asset.id === id 
          ? { ...asset, ...assetData, updatedAt: new Date().toISOString() }
          : asset
      )
    }))
    
    // Create inspection reminder if asset was updated with inspection schedule
    if (asset && assetData.inspectionStatus === 'Scheduled for Inspection') {
      const { createInspectionReminder } = useNotificationStore.getState()
      createInspectionReminder({ ...asset, ...assetData })
    }
  },

  deleteAsset: (id) => {
    set(state => ({
      assets: state.assets.filter(asset => asset.id !== id)
    }))
  },

  // Asset selection
  setSelectedAsset: (asset) => set({ selectedAsset: asset }),

  // Filtering and search
  setFilters: (filters) => set({ filters }),
  setSearchTerm: (searchTerm) => set({ searchTerm }),

  // Computed getters
  getFilteredAssets: () => {
    const { assets, filters, searchTerm } = get()
    
    return assets.filter(asset => {
      const matchesSearch = searchTerm === '' || 
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.address.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.address.city.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = filters.status === '' || asset.status === filters.status
      const matchesType = filters.type === '' || asset.type === filters.type
      const matchesCondition = filters.condition === '' || asset.condition === filters.condition
      const matchesInspectionStatus = filters.inspectionStatus === '' || asset.inspectionStatus === filters.inspectionStatus
      const matchesPhase = filters.currentPhase === '' || asset.currentPhase === filters.currentPhase

      return matchesSearch && matchesStatus && matchesType && matchesCondition && matchesInspectionStatus && matchesPhase
    })
  },

  getAssetById: (id) => {
    const { assets } = get()
    return assets.find(asset => asset.id === id)
  },

  getAssetStats: () => {
    const { assets } = get()
    return {
      total: assets.length,
      active: assets.filter(a => a.status === 'Active').length,
      underMaintenance: assets.filter(a => a.status === 'Under Maintenance').length,
      decommissioned: assets.filter(a => a.status === 'Decommissioned').length,
      needsRepairs: assets.filter(a => a.condition === 'Needs Repairs').length,
      overdue: assets.filter(a => a.inspectionStatus === 'Overdue').length
    }
  },

  // Loading states
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // API integration methods
  fetchAssets: async (filters = {}) => {
    const { setLoading, setError } = get()
    setLoading(true)
    setError(null)

    try {
      const service = shouldUseMockApi() ? mockAssetService : assetService
      const response = await service.getAssets(filters)
      
      set({ 
        assets: response.assets || response,
        loading: false 
      })
      
      return response
    } catch (error) {
      setError(error.message)
      setLoading(false)
      throw error
    }
  },

  fetchAssetById: async (id) => {
    const { setLoading, setError } = get()
    setLoading(true)
    setError(null)

    try {
      const service = shouldUseMockApi() ? mockAssetService : assetService
      const asset = await service.getAssetById(id)
      
      setLoading(false)
      return asset
    } catch (error) {
      setError(error.message)
      setLoading(false)
      throw error
    }
  },

  createAssetApi: async (assetData) => {
    const { setLoading, setError, createAsset } = get()
    setLoading(true)
    setError(null)

    try {
      const service = shouldUseMockApi() ? mockAssetService : assetService
      const newAsset = await service.createAsset(assetData)
      
      // Update local state
      createAsset(newAsset)
      setLoading(false)
      
      return newAsset
    } catch (error) {
      setError(error.message)
      setLoading(false)
      throw error
    }
  },

  updateAssetApi: async (id, assetData) => {
    const { setLoading, setError, updateAsset } = get()
    setLoading(true)
    setError(null)

    try {
      const service = shouldUseMockApi() ? mockAssetService : assetService
      const updatedAsset = await service.updateAsset(id, assetData)
      
      // Update local state
      updateAsset(id, updatedAsset)
      setLoading(false)
      
      return updatedAsset
    } catch (error) {
      setError(error.message)
      setLoading(false)
      throw error
    }
  },

  deleteAssetApi: async (id) => {
    const { setLoading, setError, deleteAsset } = get()
    setLoading(true)
    setError(null)

    try {
      const service = shouldUseMockApi() ? mockAssetService : assetService
      await service.deleteAsset(id)
      
      // Update local state
      deleteAsset(id)
      setLoading(false)
      
      return { success: true }
    } catch (error) {
      setError(error.message)
      setLoading(false)
      throw error
    }
  },

  fetchAssetStats: async () => {
    const { setLoading, setError } = get()
    setLoading(true)
    setError(null)

    try {
      const service = shouldUseMockApi() ? mockAssetService : assetService
      const stats = await service.getAssetStats()
      
      setLoading(false)
      return stats
    } catch (error) {
      setError(error.message)
      setLoading(false)
      throw error
    }
  },

  // Asset inspection integration
  generateInspectionSchedule: (assetId, options = {}) => {
    const asset = get().getAssetById(assetId)
    if (!asset) return []
    
    return assetInspectionService.calculateInspectionSchedule(asset, options.startDate)
  },

  generateAllAssetsInspectionSchedule: (options = {}) => {
    const { assets } = get()
    return assetInspectionService.scheduleAssetsInspections(assets, options)
  },

  updateAssetInspectionConfig: (assetId, inspectionConfig) => {
    const updatedConfig = assetInspectionService.updateAssetInspectionSchedule(assetId, inspectionConfig)
    
    // Update asset with new inspection schedule
    get().updateAsset(assetId, {
      inspectionSchedule: inspectionConfig,
      updatedAt: new Date().toISOString()
    })
    
    return updatedConfig
  },

  completeAssetInspection: (assetId, inspectionId, completionData) => {
    const completion = assetInspectionService.completeInspection(inspectionId, {
      ...completionData,
      assetId
    })
    
    // Update asset status based on inspection results
    const asset = get().getAssetById(assetId)
    if (asset) {
      const updates = {
        lastInspection: new Date().toISOString(),
        inspectionStatus: 'Recently Inspected',
        updatedAt: new Date().toISOString()
      }
      
      // Update condition if provided
      if (completionData.condition) {
        updates.condition = completionData.condition
      }
      
      // Set next inspection date if provided
      if (completionData.nextInspectionDate) {
        updates.nextInspection = completionData.nextInspectionDate
      }
      
      get().updateAsset(assetId, updates)
    }
    
    return completion
  },

  getAssetInspectionHistory: (assetId, options = {}) => {
    return assetInspectionService.getInspectionHistory(assetId, options)
  },

  getInspectionAnalytics: (assetIds = [], dateRange = {}) => {
    const assetList = assetIds.length > 0 ? assetIds : get().assets.map(a => a.id)
    return assetInspectionService.getInspectionAnalytics(assetList, dateRange)
  },

  // Initialize store with data
  initializeStore: async () => {
    const { fetchAssets } = get()
    
    try {
      await fetchAssets()
    } catch (error) {
      console.error('Failed to initialize asset store:', error)
    }
  }
}))