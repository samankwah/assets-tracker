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

// Default mock assets data
const defaultMockAssets = [
  {
    id: 1,
    name: 'Los Palmas',
    type: 'Apartment',
    status: 'Scheduled for Inspection',
    condition: 'Good',
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
    lastInspection: '2025-05-20',
    nextInspection: '2025-07-20',
    createdAt: '2025-04-10',
    updatedAt: '2025-06-25'
  },
  {
    id: 4,
    name: 'Sunset Boulevard Apartment',
    type: 'Apartment',
    status: 'Active',
    condition: 'Good',
    address: {
      street: '1234 Sunset Boulevard',
      city: 'Los Angeles',
      state: 'California',
      zipCode: '90028'
    },
    details: {
      bedrooms: 3,
      bathrooms: 2,
      floors: 1,
      balcony: true,
      features: ['Pool access', 'Gym', 'Parking garage']
    },
    images: ['/api/placeholder/400/300'],
    inspectionStatus: 'Recently Inspected',
    inspectionDate: '2025-07-18',
    priority: 'Low',
    frequency: 'Quarterly',
    lastInspection: '2025-07-10',
    nextInspection: '2025-10-10',
    createdAt: '2025-05-20',
    updatedAt: '2025-07-18'
  },
  {
    id: 5,
    name: 'Downtown Loft',
    type: 'Apartment',
    status: 'Scheduled for Inspection',
    condition: 'Excellent',
    address: {
      street: '567 Main Street',
      city: 'New York',
      state: 'New York',
      zipCode: '10001'
    },
    details: {
      bedrooms: 2,
      bathrooms: 2,
      floors: 1,
      balcony: false,
      features: ['High ceilings', 'Exposed brick', 'Industrial design']
    },
    images: ['/api/placeholder/400/300'],
    inspectionStatus: 'Scheduled for Inspection',
    inspectionDate: '2025-07-25',
    priority: 'Medium',
    frequency: 'Bi-Annual',
    lastInspection: '2025-01-15',
    nextInspection: '2025-07-25',
    createdAt: '2025-01-10',
    updatedAt: '2025-07-15'
  },
  {
    id: 6,
    name: 'Oakwood Family Home',
    type: 'House',
    status: 'Active',
    condition: 'Good',
    address: {
      street: '789 Oakwood Drive',
      city: 'Dallas',
      state: 'Texas',
      zipCode: '75201'
    },
    details: {
      bedrooms: 4,
      bathrooms: 3,
      floors: 2,
      balcony: true,
      features: ['Large backyard', 'Fireplace', 'Two-car garage']
    },
    images: ['/api/placeholder/400/300'],
    inspectionStatus: 'Recently Inspected',
    inspectionDate: '2025-07-12',
    priority: 'Low',
    frequency: 'Annual',
    lastInspection: '2025-07-12',
    nextInspection: '2026-07-12',
    createdAt: '2025-03-15',
    updatedAt: '2025-07-12'
  },
  {
    id: 7,
    name: 'Riverside Townhouse',
    type: 'Townhouse',
    status: 'Under Maintenance',
    condition: 'Needs Repairs',
    address: {
      street: '321 Riverside Lane',
      city: 'Portland',
      state: 'Oregon',
      zipCode: '97201'
    },
    details: {
      bedrooms: 3,
      bathrooms: 2,
      floors: 2,
      balcony: true,
      features: ['River view', 'Private patio', 'Attached garage']
    },
    images: ['/api/placeholder/400/300'],
    inspectionStatus: 'Under Maintenance',
    inspectionDate: '2025-08-05',
    priority: 'High',
    frequency: 'Monthly',
    lastInspection: '2025-06-20',
    nextInspection: '2025-08-05',
    createdAt: '2025-04-20',
    updatedAt: '2025-07-20'
  },
  {
    id: 8,
    name: 'Beachfront Condo',
    type: 'Apartment',
    status: 'Active',
    condition: 'Excellent',
    address: {
      street: '555 Ocean Drive',
      city: 'Miami',
      state: 'Florida',
      zipCode: '33139'
    },
    details: {
      bedrooms: 2,
      bathrooms: 2,
      floors: 1,
      balcony: true,
      features: ['Ocean view', 'Beach access', 'Concierge service']
    },
    images: ['/api/placeholder/400/300'],
    inspectionStatus: 'Recently Inspected',
    inspectionDate: '2025-07-08',
    priority: 'Low',
    frequency: 'Quarterly',
    lastInspection: '2025-07-08',
    nextInspection: '2025-10-08',
    createdAt: '2025-02-10',
    updatedAt: '2025-07-08'
  },
  {
    id: 9,
    name: 'Mountain View Cabin',
    type: 'House',
    status: 'Scheduled for Inspection',
    condition: 'Good',
    address: {
      street: '999 Pine Ridge Road',
      city: 'Denver',
      state: 'Colorado',
      zipCode: '80202'
    },
    details: {
      bedrooms: 3,
      bathrooms: 2,
      floors: 2,
      balcony: true,
      features: ['Mountain view', 'Fireplace', 'Deck']
    },
    images: ['/api/placeholder/400/300'],
    inspectionStatus: 'Scheduled for Inspection',
    inspectionDate: '2025-07-30',
    priority: 'Medium',
    frequency: 'Bi-Annual',
    lastInspection: '2025-01-30',
    nextInspection: '2025-07-30',
    createdAt: '2025-01-15',
    updatedAt: '2025-07-15'
  },
  {
    id: 10,
    name: 'Historic Brownstone',
    type: 'House',
    status: 'Under Maintenance',
    condition: 'Fair',
    address: {
      street: '123 Heritage Street',
      city: 'Boston',
      state: 'Massachusetts',
      zipCode: '02101'
    },
    details: {
      bedrooms: 4,
      bathrooms: 3,
      floors: 3,
      balcony: false,
      features: ['Historic charm', 'Original hardwood', 'Garden']
    },
    images: ['/api/placeholder/400/300'],
    inspectionStatus: 'Under Maintenance',
    inspectionDate: '2025-08-15',
    priority: 'High',
    frequency: 'Monthly',
    lastInspection: '2025-06-15',
    nextInspection: '2025-08-15',
    createdAt: '2025-03-01',
    updatedAt: '2025-07-01'
  },
  {
    id: 11,
    name: 'Suburban Villa',
    type: 'House',
    status: 'Active',
    condition: 'Excellent',
    address: {
      street: '456 Maple Avenue',
      city: 'Phoenix',
      state: 'Arizona',
      zipCode: '85001'
    },
    details: {
      bedrooms: 5,
      bathrooms: 4,
      floors: 2,
      balcony: true,
      features: ['Swimming pool', 'Three-car garage', 'Guest house']
    },
    images: ['/api/placeholder/400/300'],
    inspectionStatus: 'Recently Inspected',
    inspectionDate: '2025-07-05',
    priority: 'Low',
    frequency: 'Annual',
    lastInspection: '2025-07-05',
    nextInspection: '2026-07-05',
    createdAt: '2025-01-20',
    updatedAt: '2025-07-05'
  },
  {
    id: 12,
    name: 'City Center Penthouse',
    type: 'Apartment',
    status: 'Scheduled for Inspection',
    condition: 'Excellent',
    address: {
      street: '888 Skyline Tower',
      city: 'Chicago',
      state: 'Illinois',
      zipCode: '60601'
    },
    details: {
      bedrooms: 3,
      bathrooms: 3,
      floors: 1,
      balcony: true,
      features: ['City skyline view', 'Rooftop access', 'Luxury finishes']
    },
    images: ['/api/placeholder/400/300'],
    inspectionStatus: 'Scheduled for Inspection',
    inspectionDate: '2025-08-01',
    priority: 'Medium',
    frequency: 'Quarterly',
    lastInspection: '2025-05-01',
    nextInspection: '2025-08-01',
    createdAt: '2025-02-15',
    updatedAt: '2025-07-15'
  },
  {
    id: 13,
    name: 'Lakeside Retreat',
    type: 'House',
    status: 'Active',
    condition: 'Good',
    address: {
      street: '777 Lakeview Circle',
      city: 'Seattle',
      state: 'Washington',
      zipCode: '98101'
    },
    details: {
      bedrooms: 3,
      bathrooms: 2,
      floors: 1,
      balcony: true,
      features: ['Lake access', 'Boat dock', 'Hot tub']
    },
    images: ['/api/placeholder/400/300'],
    inspectionStatus: 'Recently Inspected',
    inspectionDate: '2025-07-14',
    priority: 'Low',
    frequency: 'Bi-Annual',
    lastInspection: '2025-07-14',
    nextInspection: '2026-01-14',
    createdAt: '2025-04-01',
    updatedAt: '2025-07-14'
  },
  {
    id: 14,
    name: 'Garden District Home',
    type: 'House',
    status: 'Overdue For Maintenance',
    condition: 'Critical',
    address: {
      street: '666 Garden Street',
      city: 'New Orleans',
      state: 'Louisiana',
      zipCode: '70112'
    },
    details: {
      bedrooms: 4,
      bathrooms: 3,
      floors: 2,
      balcony: true,
      features: ['Historic architecture', 'Courtyard', 'Wrap-around porch']
    },
    images: ['/api/placeholder/400/300'],
    inspectionStatus: 'Overdue',
    inspectionDate: '2025-06-01',
    priority: 'High',
    frequency: 'Monthly',
    lastInspection: '2025-04-01',
    nextInspection: '2025-06-01',
    createdAt: '2025-01-05',
    updatedAt: '2025-06-01'
  },
  {
    id: 15,
    name: 'Tech Hub Apartment',
    type: 'Apartment',
    status: 'Under Maintenance',
    condition: 'Needs Repairs',
    address: {
      street: '1010 Innovation Drive',
      city: 'San Francisco',
      state: 'California',
      zipCode: '94102'
    },
    details: {
      bedrooms: 1,
      bathrooms: 1,
      floors: 1,
      balcony: false,
      features: ['Smart home features', 'Rooftop garden', 'Gym access']
    },
    images: ['/api/placeholder/400/300'],
    inspectionStatus: 'Under Maintenance',
    inspectionDate: '2025-08-10',
    priority: 'Medium',
    frequency: 'Quarterly',
    lastInspection: '2025-05-10',
    nextInspection: '2025-08-10',
    createdAt: '2025-03-10',
    updatedAt: '2025-07-10'
  }
];

// Mock data for development (when API is not available)
export const mockAssetService = {
  async getAssets(filters = {}) {
    // Return mock data from localStorage or default
    let mockAssets = JSON.parse(localStorage.getItem('mock_assets') || 'null')
    
    // If no data in localStorage, use default and save it
    if (!mockAssets || mockAssets.length === 0) {
      mockAssets = defaultMockAssets
      localStorage.setItem('mock_assets', JSON.stringify(mockAssets))
    }
    
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
    let mockAssets = JSON.parse(localStorage.getItem('mock_assets') || 'null')
    
    // If no data in localStorage, use default
    if (!mockAssets || mockAssets.length === 0) {
      mockAssets = defaultMockAssets
      localStorage.setItem('mock_assets', JSON.stringify(mockAssets))
    }
    
    const asset = mockAssets.find(a => a.id === id)
    
    if (!asset) {
      throw new Error('Asset not found')
    }
    
    return asset
  },

  async createAsset(assetData) {
    let mockAssets = JSON.parse(localStorage.getItem('mock_assets') || 'null')
    
    // If no data in localStorage, use default
    if (!mockAssets || mockAssets.length === 0) {
      mockAssets = defaultMockAssets
    }
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
    let mockAssets = JSON.parse(localStorage.getItem('mock_assets') || 'null')
    
    // If no data in localStorage, use default
    if (!mockAssets || mockAssets.length === 0) {
      mockAssets = defaultMockAssets
    }
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
    let mockAssets = JSON.parse(localStorage.getItem('mock_assets') || 'null')
    
    // If no data in localStorage, use default
    if (!mockAssets || mockAssets.length === 0) {
      mockAssets = defaultMockAssets
    }
    const filteredAssets = mockAssets.filter(a => a.id !== id)
    
    localStorage.setItem('mock_assets', JSON.stringify(filteredAssets))
    return { message: 'Asset deleted successfully' }
  },

  async getAssetStats() {
    let mockAssets = JSON.parse(localStorage.getItem('mock_assets') || 'null')
    
    // If no data in localStorage, use default
    if (!mockAssets || mockAssets.length === 0) {
      mockAssets = defaultMockAssets
      localStorage.setItem('mock_assets', JSON.stringify(mockAssets))
    }
    
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