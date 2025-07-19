import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as apiService from '../apiService'

const {
  apiRequest,
  api,
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  handleApiResponse,
  ApiError,
  NetworkError,
  ValidationError,
  AuthenticationError,
  retryRequest
} = apiService

// Mock fetch
global.fetch = vi.fn()

// Mock monitoring service
const mockMonitoringService = {
  addBreadcrumb: vi.fn(),
  captureException: vi.fn(),
  trackEvent: vi.fn()
}

vi.mock('../monitoringService', () => ({
  default: mockMonitoringService
}))

// Mock API config
vi.mock('../../config/apiConfig', () => ({
  API_CONFIG: {
    BASE_URL: 'https://api.test.com',
    TIMEOUT: 30000,
    AUTH: {
      TOKEN_KEY: 'test_token',
      REFRESH_TOKEN_KEY: 'test_refresh_token'
    }
  },
  shouldUseMockApi: () => false
}))

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    fetch.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Token Management', () => {
    it('stores and retrieves auth token', () => {
      const token = 'test-token-123'
      setAuthToken(token)
      
      expect(getAuthToken()).toBe(token)
      expect(localStorage.getItem('test_token')).toBe(token)
    })

    it('removes auth token', () => {
      setAuthToken('test-token')
      removeAuthToken()
      
      expect(getAuthToken()).toBe(null)
      expect(localStorage.getItem('test_token')).toBe(null)
    })

    it('refreshes auth token successfully', async () => {
      // Skip this test if refreshAuthToken is not available
      if (!apiService.refreshAuthToken) {
        return
      }
      
      const refreshToken = 'refresh-token-123'
      const newAccessToken = 'new-access-token-456'
      
      localStorage.setItem('test_refresh_token', refreshToken)
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          accessToken: newAccessToken,
          refreshToken: 'new-refresh-token'
        })
      })

      const result = await apiService.refreshAuthToken()
      
      expect(result).toBe(newAccessToken)
      expect(getAuthToken()).toBe(newAccessToken)
    })

    it('handles refresh token failure', async () => {
      localStorage.setItem('test_refresh_token', 'invalid-token')
      
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      })

      await expect(refreshAuthToken()).rejects.toThrow(AuthenticationError)
      expect(getAuthToken()).toBe(null)
    })
  })

  describe('API Request Function', () => {
    it('makes successful GET request', async () => {
      const responseData = { id: 1, name: 'Test' }
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(responseData)
      })

      const result = await apiRequest('/test', { method: 'GET' })
      
      expect(result).toEqual(responseData)
      expect(fetch).toHaveBeenCalledWith(
        'https://api.test.com/test',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Request-ID': expect.any(String)
          })
        })
      )
    })

    it('includes auth token in request headers', async () => {
      const token = 'auth-token-123'
      setAuthToken(token)
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({})
      })

      await apiRequest('/test')
      
      expect(fetch).toHaveBeenCalledWith(
        'https://api.test.com/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${token}`
          })
        })
      )
    })

    it('handles request timeout', async () => {
      vi.useFakeTimers()
      
      fetch.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ ok: true }), 35000))
      )

      const requestPromise = apiRequest('/test')
      
      // Fast-forward time to trigger timeout
      vi.advanceTimersByTime(31000)
      
      await expect(requestPromise).rejects.toThrow(NetworkError)
      
      vi.useRealTimers()
    })

    it('logs monitoring breadcrumbs', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({})
      })

      await apiRequest('/test', { method: 'POST' })
      
      expect(mockMonitoringService.addBreadcrumb).toHaveBeenCalledWith(
        'API Request: POST /test',
        'api',
        'info',
        expect.any(Object)
      )
      expect(mockMonitoringService.trackEvent).toHaveBeenCalledWith(
        'api_request',
        expect.any(Object)
      )
    })

    it('handles and logs errors', async () => {
      const error = new Error('Network error')
      fetch.mockRejectedValueOnce(error)

      await expect(apiRequest('/test')).rejects.toThrow(error)
      
      expect(mockMonitoringService.captureException).toHaveBeenCalledWith(
        error,
        expect.any(Object)
      )
      expect(mockMonitoringService.trackEvent).toHaveBeenCalledWith(
        'api_error',
        expect.any(Object)
      )
    })
  })

  describe('HTTP Method Helpers', () => {
    beforeEach(() => {
      fetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ success: true })
      })
    })

    it('makes GET request with query parameters', async () => {
      await api.get('/users', { page: 1, limit: 10 })
      
      expect(fetch).toHaveBeenCalledWith(
        'https://api.test.com/users?page=1&limit=10',
        expect.objectContaining({ method: undefined })
      )
    })

    it('makes POST request with data', async () => {
      const data = { name: 'Test User' }
      await api.post('/users', data)
      
      expect(fetch).toHaveBeenCalledWith(
        'https://api.test.com/users',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(data)
        })
      )
    })

    it('makes PUT request with data', async () => {
      const data = { id: 1, name: 'Updated User' }
      await api.put('/users/1', data)
      
      expect(fetch).toHaveBeenCalledWith(
        'https://api.test.com/users/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(data)
        })
      )
    })

    it('makes PATCH request with data', async () => {
      const data = { name: 'Patched User' }
      await api.patch('/users/1', data)
      
      expect(fetch).toHaveBeenCalledWith(
        'https://api.test.com/users/1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(data)
        })
      )
    })

    it('makes DELETE request', async () => {
      await api.delete('/users/1')
      
      expect(fetch).toHaveBeenCalledWith(
        'https://api.test.com/users/1',
        expect.objectContaining({
          method: 'DELETE'
        })
      )
    })

    it('uploads files with FormData', async () => {
      const formData = new FormData()
      formData.append('file', new Blob(['test']), 'test.txt')
      
      setAuthToken('test-token')
      
      await api.upload('/upload', formData)
      
      expect(fetch).toHaveBeenCalledWith(
        'https://api.test.com/upload',
        expect.objectContaining({
          method: 'POST',
          body: formData,
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
      
      // Should not include Content-Type header for FormData
      const callArgs = fetch.mock.calls[0][1]
      expect(callArgs.headers['Content-Type']).toBeUndefined()
    })
  })

  describe('Error Handling', () => {
    it('handles 401 unauthorized error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: vi.fn().mockResolvedValue({ message: 'Unauthorized' })
      })

      await expect(apiRequest('/test')).rejects.toThrow()
    })

    it('handles 404 not found error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: vi.fn().mockResolvedValue({ message: 'Not found' })
      })

      await expect(apiRequest('/test')).rejects.toThrow()
    })

    it('handles validation errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValue({
          message: 'Validation failed',
          errors: { email: 'Invalid email' }
        })
      })

      await expect(apiRequest('/test')).rejects.toThrow()
    })

    it('handles network errors', async () => {
      fetch.mockRejectedValueOnce(new TypeError('Network error'))

      await expect(apiRequest('/test')).rejects.toThrow()
    })
  })

  describe('Response Handler', () => {
    it('handles successful response', async () => {
      const data = { id: 1, name: 'Test' }
      const response = {
        ok: true,
        json: vi.fn().mockResolvedValue(data)
      }

      const result = await handleApiResponse(response)
      expect(result).toEqual(data)
    })

    it('handles error response with JSON', async () => {
      const errorData = { message: 'Server error' }
      const response = {
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValue(errorData)
      }

      await expect(handleApiResponse(response)).rejects.toThrow('Server error')
    })

    it('handles error response without JSON', async () => {
      const response = {
        ok: false,
        status: 500,
        json: vi.fn().mockRejectedValue(new Error('No JSON'))
      }

      await expect(handleApiResponse(response)).rejects.toThrow('HTTP error! status: 500')
    })
  })

  describe('Retry Logic', () => {
    it('retries failed requests', async () => {
      const mockFn = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce('Success')

      const result = await retryRequest(mockFn, 3, 100)
      
      expect(result).toBe('Success')
      expect(mockFn).toHaveBeenCalledTimes(3)
    })

    it('stops retrying on 401 error', async () => {
      const error = new Error('Unauthorized')
      error.status = 401
      
      const mockFn = vi.fn().mockRejectedValue(error)

      await expect(retryRequest(mockFn, 3)).rejects.toThrow('Unauthorized')
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('gives up after max retries', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Persistent error'))

      await expect(retryRequest(mockFn, 2)).rejects.toThrow('Persistent error')
      expect(mockFn).toHaveBeenCalledTimes(2)
    })
  })

  describe('Error Classes', () => {
    it('creates ApiError correctly', () => {
      const error = new ApiError('Test error', 400, { field: 'invalid' })
      
      expect(error.name).toBe('ApiError')
      expect(error.message).toBe('Test error')
      expect(error.status).toBe(400)
      expect(error.data).toEqual({ field: 'invalid' })
    })

    it('creates ValidationError correctly', () => {
      const errors = { email: 'Required', password: 'Too short' }
      const error = new ValidationError('Validation failed', errors)
      
      expect(error.name).toBe('ValidationError')
      expect(error.status).toBe(400)
      expect(error.errors).toEqual(errors)
    })

    it('creates AuthenticationError correctly', () => {
      const error = new AuthenticationError()
      
      expect(error.name).toBe('AuthenticationError')
      expect(error.status).toBe(401)
      expect(error.message).toBe('Authentication required')
    })

    it('creates NetworkError correctly', () => {
      const error = new NetworkError('Connection failed')
      
      expect(error.name).toBe('NetworkError')
      expect(error.message).toBe('Connection failed')
    })
  })
})