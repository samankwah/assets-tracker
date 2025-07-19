import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAssetStore } from '../assetStore'

// Mock the notification store
vi.mock('../notificationStore', () => ({
  useNotificationStore: {
    getState: () => ({
      createInspectionReminder: vi.fn()
    })
  }
}))

describe('AssetStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useAssetStore.setState({
      assets: [],
      selectedAsset: null,
      filters: {
        status: '',
        type: '',
        condition: '',
        inspectionStatus: ''
      },
      searchTerm: ''
    })
  })

  it('initializes with default state', () => {
    const store = useAssetStore.getState()
    
    expect(store.assets).toBeDefined()
    expect(store.selectedAsset).toBeNull()
    expect(store.filters).toEqual({
      status: '',
      type: '',
      condition: '',
      inspectionStatus: ''
    })
    expect(store.searchTerm).toBe('')
  })

  it('creates a new asset', () => {
    const store = useAssetStore.getState()
    const newAssetData = {
      name: 'Test Asset',
      type: 'Apartment',
      status: 'Active',
      condition: 'Good',
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345'
      }
    }

    const createdAsset = store.createAsset(newAssetData)
    const assets = useAssetStore.getState().assets

    expect(createdAsset).toMatchObject(newAssetData)
    expect(createdAsset.id).toBeDefined()
    expect(createdAsset.createdAt).toBeDefined()
    expect(createdAsset.updatedAt).toBeDefined()
    expect(assets).toContain(createdAsset)
  })

  it('updates an existing asset', () => {
    const store = useAssetStore.getState()
    
    // Create an asset first
    const createdAsset = store.createAsset({
      name: 'Test Asset',
      type: 'Apartment',
      status: 'Active'
    })

    // Update the asset
    const updateData = {
      name: 'Updated Asset',
      status: 'Under Maintenance'
    }

    store.updateAsset(createdAsset.id, updateData)
    const assets = useAssetStore.getState().assets
    const updatedAsset = assets.find(a => a.id === createdAsset.id)

    expect(updatedAsset.name).toBe('Updated Asset')
    expect(updatedAsset.status).toBe('Under Maintenance')
    expect(updatedAsset.updatedAt).not.toBe(createdAsset.updatedAt)
  })

  it('deletes an asset', () => {
    const store = useAssetStore.getState()
    
    // Create an asset first
    const createdAsset = store.createAsset({
      name: 'Test Asset',
      type: 'Apartment'
    })

    // Delete the asset
    store.deleteAsset(createdAsset.id)
    const assets = useAssetStore.getState().assets

    expect(assets).not.toContain(createdAsset)
    expect(assets.find(a => a.id === createdAsset.id)).toBeUndefined()
  })

  it('sets selected asset', () => {
    const store = useAssetStore.getState()
    const asset = { id: 1, name: 'Test Asset' }

    store.setSelectedAsset(asset)
    const selectedAsset = useAssetStore.getState().selectedAsset

    expect(selectedAsset).toBe(asset)
  })

  it('updates filters', () => {
    const store = useAssetStore.getState()
    const newFilters = {
      status: 'Active',
      type: 'Apartment',
      condition: 'Good',
      inspectionStatus: 'Recently Inspected'
    }

    store.setFilters(newFilters)
    const filters = useAssetStore.getState().filters

    expect(filters).toEqual(newFilters)
  })

  it('updates search term', () => {
    const store = useAssetStore.getState()
    const searchTerm = 'test search'

    store.setSearchTerm(searchTerm)
    const currentSearchTerm = useAssetStore.getState().searchTerm

    expect(currentSearchTerm).toBe(searchTerm)
  })

  it('filters assets correctly', () => {
    const store = useAssetStore.getState()
    
    // Create test assets
    const asset1 = store.createAsset({
      name: 'Test Apartment',
      type: 'Apartment',
      status: 'Active',
      condition: 'Good',
      address: { street: '123 Test St', city: 'Test City', state: 'Test State' }
    })

    const asset2 = store.createAsset({
      name: 'Sample House',
      type: 'House',
      status: 'Under Maintenance',
      condition: 'Fair',
      address: { street: '456 Sample Ave', city: 'Sample City', state: 'Sample State' }
    })

    // Test filtering by status
    store.setFilters({ status: 'Active', type: '', condition: '', inspectionStatus: '' })
    let filteredAssets = store.getFilteredAssets()
    expect(filteredAssets).toContain(asset1)
    expect(filteredAssets).not.toContain(asset2)

    // Test filtering by type
    store.setFilters({ status: '', type: 'House', condition: '', inspectionStatus: '' })
    filteredAssets = store.getFilteredAssets()
    expect(filteredAssets).toContain(asset2)
    expect(filteredAssets).not.toContain(asset1)

    // Test search functionality
    store.setFilters({ status: '', type: '', condition: '', inspectionStatus: '' })
    store.setSearchTerm('Test')
    filteredAssets = store.getFilteredAssets()
    expect(filteredAssets).toContain(asset1)
    expect(filteredAssets).not.toContain(asset2)
  })

  it('gets asset by id', () => {
    const store = useAssetStore.getState()
    const createdAsset = store.createAsset({
      name: 'Test Asset',
      type: 'Apartment'
    })

    const foundAsset = store.getAssetById(createdAsset.id)
    expect(foundAsset).toBe(createdAsset)

    const notFoundAsset = store.getAssetById(999)
    expect(notFoundAsset).toBeUndefined()
  })

  it('calculates asset statistics correctly', () => {
    const store = useAssetStore.getState()
    
    // Create test assets with different statuses
    store.createAsset({ name: 'Asset 1', status: 'Active', condition: 'Good' })
    store.createAsset({ name: 'Asset 2', status: 'Active', condition: 'Fair' })
    store.createAsset({ name: 'Asset 3', status: 'Under Maintenance', condition: 'Needs Repairs' })
    store.createAsset({ name: 'Asset 4', status: 'Decommissioned', condition: 'Critical' })

    const stats = store.getAssetStats()

    expect(stats.total).toBe(4)
    expect(stats.active).toBe(2)
    expect(stats.maintenance).toBe(1)
    expect(stats.decommissioned).toBe(1)
  })

  it('handles empty asset list', () => {
    const store = useAssetStore.getState()
    const filteredAssets = store.getFilteredAssets()
    const stats = store.getAssetStats()

    expect(filteredAssets).toEqual([])
    expect(stats.total).toBe(0)
    expect(stats.active).toBe(0)
    expect(stats.maintenance).toBe(0)
    expect(stats.decommissioned).toBe(0)
  })

  it('handles multiple filter combinations', () => {
    const store = useAssetStore.getState()
    
    // Create test assets
    store.createAsset({
      name: 'Active Good Apartment',
      type: 'Apartment',
      status: 'Active',
      condition: 'Good',
      address: { street: '123 Test St', city: 'Test City', state: 'Test State' }
    })

    store.createAsset({
      name: 'Active Fair House',
      type: 'House',
      status: 'Active',
      condition: 'Fair',
      address: { street: '456 Sample Ave', city: 'Sample City', state: 'Sample State' }
    })

    // Test multiple filters
    store.setFilters({
      status: 'Active',
      type: 'Apartment',
      condition: 'Good',
      inspectionStatus: ''
    })

    const filteredAssets = store.getFilteredAssets()
    expect(filteredAssets).toHaveLength(1)
    expect(filteredAssets[0].name).toBe('Active Good Apartment')
  })
})