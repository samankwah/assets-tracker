// Asset Service - API layer for asset management
// This service handles all asset-related API calls

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }))
    throw new Error(error.message || `HTTP error! status: ${response.status}`)
  }
  return response.json()
}

// Helper function to make API requests with proper headers
const makeRequest = async (url, options = {}) => {
  const token = localStorage.getItem('auth_token')
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config)
    return handleResponse(response)
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

// Asset Service Class
class AssetService {
  // Get all assets with optional filters
  async getAssets(filters = {}) {
    const queryParams = new URLSearchParams()
    
    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        queryParams.append(key, value)
      }
    })
    
    const queryString = queryParams.toString()
    const url = `/assets${queryString ? `?${queryString}` : ''}`
    
    return makeRequest(url)
  }

  // Get a single asset by ID
  async getAssetById(id) {
    return makeRequest(`/assets/${id}`)
  }

  // Create a new asset
  async createAsset(assetData) {
    return makeRequest('/assets', {
      method: 'POST',
      body: JSON.stringify(assetData)
    })
  }

  // Update an existing asset
  async updateAsset(id, assetData) {
    return makeRequest(`/assets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(assetData)
    })
  }

  // Delete an asset
  async deleteAsset(id) {
    return makeRequest(`/assets/${id}`, {
      method: 'DELETE'
    })
  }

  // Upload asset images
  async uploadAssetImages(assetId, images) {
    const formData = new FormData()
    
    // Add images to form data
    images.forEach((image, index) => {
      formData.append(`images`, image)
    })
    
    return makeRequest(`/assets/${assetId}/images`, {
      method: 'POST',
      headers: {}, // Remove Content-Type header to let browser set it for FormData
      body: formData
    })
  }

  // Delete asset image
  async deleteAssetImage(assetId, imageId) {
    return makeRequest(`/assets/${assetId}/images/${imageId}`, {
      method: 'DELETE'
    })
  }

  // Get asset statistics
  async getAssetStats() {
    return makeRequest('/assets/stats')
  }

  // Get assets by status
  async getAssetsByStatus(status) {
    return this.getAssets({ status })
  }

  // Get assets by type
  async getAssetsByType(type) {
    return this.getAssets({ type })
  }

  // Get assets by condition
  async getAssetsByCondition(condition) {
    return this.getAssets({ condition })
  }

  // Search assets
  async searchAssets(searchTerm) {
    return this.getAssets({ search: searchTerm })
  }

  // Get assets due for inspection
  async getAssetsForInspection() {
    return makeRequest('/assets/inspection/due')
  }

  // Update asset inspection status
  async updateInspectionStatus(assetId, inspectionData) {
    return makeRequest(`/assets/${assetId}/inspection`, {
      method: 'PATCH',
      body: JSON.stringify(inspectionData)
    })
  }

  // Bulk operations
  async bulkDeleteAssets(assetIds) {
    return makeRequest('/assets/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ assetIds })
    })
  }

  async bulkUpdateAssets(updates) {
    return makeRequest('/assets/bulk-update', {
      method: 'POST',
      body: JSON.stringify(updates)
    })
  }

  // Export assets
  async exportAssets(format = 'csv', filters = {}) {
    const queryParams = new URLSearchParams({ format, ...filters })
    const url = `/assets/export?${queryParams.toString()}`
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Export failed')
    }
    
    return response.blob()
  }

  // Import assets
  async importAssets(file) {
    const formData = new FormData()
    formData.append('file', file)
    
    return makeRequest('/assets/import', {
      method: 'POST',
      headers: {}, // Remove Content-Type header for FormData
      body: formData
    })
  }
}

// Create and export a singleton instance
const assetService = new AssetService()
export default assetService

// Also export the class for testing purposes
export { AssetService }

// Mock data for development (when API is not available)
export const mockAssetService = {
  async getAssets(filters = {}) {
    // Return mock data from localStorage or default
    const mockAssets = JSON.parse(localStorage.getItem('mock_assets') || '[]')
    
    // Apply filters if provided
    let filteredAssets = mockAssets
    
    if (filters.status) {
      filteredAssets = filteredAssets.filter(asset => asset.status === filters.status)
    }
    
    if (filters.type) {
      filteredAssets = filteredAssets.filter(asset => asset.type === filters.type)
    }
    
    if (filters.condition) {
      filteredAssets = filteredAssets.filter(asset => asset.condition === filters.condition)
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filteredAssets = filteredAssets.filter(asset => 
        asset.name.toLowerCase().includes(searchTerm) ||
        asset.address.street.toLowerCase().includes(searchTerm) ||
        asset.address.city.toLowerCase().includes(searchTerm)
      )
    }
    
    return {
      assets: filteredAssets,
      total: filteredAssets.length,
      page: 1,
      limit: 50
    }
  },

  async getAssetById(id) {
    const mockAssets = JSON.parse(localStorage.getItem('mock_assets') || '[]')
    const asset = mockAssets.find(a => a.id === id)
    
    if (!asset) {
      throw new Error('Asset not found')
    }
    
    return asset
  },

  async createAsset(assetData) {
    const mockAssets = JSON.parse(localStorage.getItem('mock_assets') || '[]')
    const newAsset = {
      ...assetData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    mockAssets.push(newAsset)
    localStorage.setItem('mock_assets', JSON.stringify(mockAssets))
    
    return newAsset
  },

  async updateAsset(id, assetData) {
    const mockAssets = JSON.parse(localStorage.getItem('mock_assets') || '[]')
    const index = mockAssets.findIndex(a => a.id === id)
    
    if (index === -1) {
      throw new Error('Asset not found')
    }
    
    mockAssets[index] = {
      ...mockAssets[index],
      ...assetData,
      updatedAt: new Date().toISOString()
    }
    
    localStorage.setItem('mock_assets', JSON.stringify(mockAssets))
    return mockAssets[index]
  },

  async deleteAsset(id) {
    const mockAssets = JSON.parse(localStorage.getItem('mock_assets') || '[]')
    const filteredAssets = mockAssets.filter(a => a.id !== id)
    
    localStorage.setItem('mock_assets', JSON.stringify(filteredAssets))
    return { message: 'Asset deleted successfully' }
  },

  async getAssetStats() {
    const mockAssets = JSON.parse(localStorage.getItem('mock_assets') || '[]')
    
    return {
      total: mockAssets.length,
      active: mockAssets.filter(a => a.status === 'Active').length,
      underMaintenance: mockAssets.filter(a => a.status === 'Under Maintenance').length,
      decommissioned: mockAssets.filter(a => a.status === 'Decommissioned').length,
      byType: {
        apartment: mockAssets.filter(a => a.type === 'Apartment').length,
        house: mockAssets.filter(a => a.type === 'House').length,
        condo: mockAssets.filter(a => a.type === 'Condo').length,
        commercial: mockAssets.filter(a => a.type === 'Commercial').length
      },
      byCondition: {
        good: mockAssets.filter(a => a.condition === 'Good').length,
        fair: mockAssets.filter(a => a.condition === 'Fair').length,
        needsRepairs: mockAssets.filter(a => a.condition === 'Needs Repairs').length,
        critical: mockAssets.filter(a => a.condition === 'Critical').length
      }
    }
  }
}