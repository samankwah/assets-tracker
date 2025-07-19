// Base API Service - Common utilities for all API services
// This service provides common functionality for API calls

import { API_CONFIG, getApiUrl, shouldUseMockApi } from '../config/apiConfig'
import monitoringService from './monitoringService'

const API_BASE_URL = API_CONFIG.BASE_URL

// API Response handler
export const handleApiResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ 
      message: 'Network error',
      status: response.status 
    }))
    
    // Handle specific error types
    if (response.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('auth_token')
      window.location.href = '/auth/login'
      return
    }
    
    throw new Error(error.message || `HTTP error! status: ${response.status}`)
  }
  
  return response.json()
}

// Get auth token
export const getAuthToken = () => {
  return localStorage.getItem(API_CONFIG.AUTH.TOKEN_KEY)
}

// Get refresh token
export const getRefreshToken = () => {
  return localStorage.getItem(API_CONFIG.AUTH.REFRESH_TOKEN_KEY)
}

// Set auth token
export const setAuthToken = (token) => {
  localStorage.setItem(API_CONFIG.AUTH.TOKEN_KEY, token)
}

// Set refresh token
export const setRefreshToken = (token) => {
  localStorage.setItem(API_CONFIG.AUTH.REFRESH_TOKEN_KEY, token)
}

// Remove auth token
export const removeAuthToken = () => {
  localStorage.removeItem(API_CONFIG.AUTH.TOKEN_KEY)
  localStorage.removeItem(API_CONFIG.AUTH.REFRESH_TOKEN_KEY)
}

// Enhanced API request function with monitoring and retry logic
export const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken()
  const requestId = generateRequestId()
  const startTime = Date.now()
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'X-Request-ID': requestId,
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    },
    timeout: API_CONFIG.TIMEOUT,
    ...options
  }

  // Log request start
  monitoringService.addBreadcrumb(`API Request: ${options.method || 'GET'} ${endpoint}`, 'api', 'info', {
    requestId,
    endpoint,
    method: options.method || 'GET'
  })

  try {
    // Add request timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), config.timeout)
    
    config.signal = controller.signal

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    clearTimeout(timeoutId)
    
    const duration = Date.now() - startTime
    
    // Log successful response
    monitoringService.addBreadcrumb(`API Response: ${response.status}`, 'api', 'info', {
      requestId,
      status: response.status,
      duration
    })

    // Track API performance
    monitoringService.trackEvent('api_request', {
      endpoint,
      method: options.method || 'GET',
      status: response.status,
      duration,
      success: response.ok
    })

    return handleApiResponse(response)
  } catch (error) {
    const duration = Date.now() - startTime
    
    // Enhanced error logging
    const errorData = {
      requestId,
      endpoint,
      method: options.method || 'GET',
      duration,
      error: error.message,
      stack: error.stack
    }

    monitoringService.addBreadcrumb(`API Error: ${error.message}`, 'api', 'error', errorData)
    monitoringService.captureException(error, errorData)

    // Track API errors
    monitoringService.trackEvent('api_error', {
      endpoint,
      method: options.method || 'GET',
      error: error.message,
      duration
    })

    // Handle specific error types
    if (error.name === 'AbortError') {
      throw new NetworkError('Request timeout')
    }

    throw error
  }
}

// Generate unique request ID
const generateRequestId = () => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// HTTP method helpers
export const api = {
  get: (endpoint, params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `${endpoint}?${queryString}` : endpoint
    return apiRequest(url)
  },

  post: (endpoint, data = {}) => {
    return apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  put: (endpoint, data = {}) => {
    return apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },

  patch: (endpoint, data = {}) => {
    return apiRequest(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  },

  delete: (endpoint) => {
    return apiRequest(endpoint, {
      method: 'DELETE'
    })
  },

  // File upload helper
  upload: (endpoint, formData) => {
    const token = getAuthToken()
    
    return fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    }).then(handleApiResponse)
  }
}

// Error types for consistent error handling
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

export class NetworkError extends Error {
  constructor(message) {
    super(message)
    this.name = 'NetworkError'
  }
}

export class ValidationError extends ApiError {
  constructor(message, errors = {}) {
    super(message, 400, errors)
    this.name = 'ValidationError'
    this.errors = errors
  }
}

export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication required') {
    super(message, 401)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends ApiError {
  constructor(message = 'Access denied') {
    super(message, 403)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(message, 404)
    this.name = 'NotFoundError'
  }
}

// Helper functions for common operations
export const buildQueryString = (params) => {
  const queryParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      queryParams.append(key, value)
    }
  })
  
  return queryParams.toString()
}

export const formatApiError = (error) => {
  if (error instanceof ApiError) {
    return {
      message: error.message,
      status: error.status,
      data: error.data
    }
  }
  
  if (error instanceof NetworkError) {
    return {
      message: 'Network connection error. Please check your internet connection.',
      status: 0
    }
  }
  
  return {
    message: error.message || 'An unexpected error occurred',
    status: 500
  }
}

// Request interceptor for common transformations
export const requestInterceptor = (config) => {
  // Add timestamp to prevent caching
  if (config.method === 'GET') {
    const url = new URL(config.url)
    url.searchParams.append('_t', Date.now().toString())
    config.url = url.toString()
  }
  
  return config
}

// Response interceptor for common transformations
export const responseInterceptor = (response) => {
  // Add any common response transformations here
  return response
}

// Retry logic for failed requests
export const retryRequest = async (fn, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === retries - 1 || error.status === 401 || error.status === 403) {
        throw error
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
    }
  }
}

// Check if we're in development mode
export const isDevelopment = () => {
  return import.meta.env.MODE === 'development'
}

// Token refresh functionality
export const refreshAuthToken = async () => {
  const refreshToken = getRefreshToken()
  
  if (!refreshToken) {
    throw new AuthenticationError('No refresh token available')
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken })
    })

    if (!response.ok) {
      throw new AuthenticationError('Failed to refresh token')
    }

    const data = await response.json()
    setAuthToken(data.accessToken)
    
    if (data.refreshToken) {
      setRefreshToken(data.refreshToken)
    }

    return data.accessToken
  } catch (error) {
    removeAuthToken()
    throw error
  }
}

// Enhanced API response handler with token refresh
export const handleApiResponseWithRefresh = async (response, originalRequest) => {
  if (response.status === 401 && getRefreshToken()) {
    try {
      await refreshAuthToken()
      // Retry original request with new token
      const token = getAuthToken()
      originalRequest.headers.Authorization = `Bearer ${token}`
      const retryResponse = await fetch(originalRequest.url, originalRequest)
      return handleApiResponse(retryResponse)
    } catch (refreshError) {
      // Refresh failed, redirect to login
      removeAuthToken()
      window.location.href = '/auth/login'
      return
    }
  }
  
  return handleApiResponse(response)
}

// Re-export config utilities for convenience
export { shouldUseMockApi, getApiUrl } from '../config/apiConfig'

export default api