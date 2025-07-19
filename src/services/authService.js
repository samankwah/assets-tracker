// Authentication Service - API layer for authentication
// This service handles all authentication-related API calls

import { api, setAuthToken, removeAuthToken } from './apiService'

class AuthService {
  // Login user
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials)
      
      if (response.token) {
        setAuthToken(response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
      }
      
      return response
    } catch (error) {
      throw error
    }
  }

  // Register new user
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData)
      
      if (response.token) {
        setAuthToken(response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
      }
      
      return response
    } catch (error) {
      throw error
    }
  }

  // Logout user
  async logout() {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      // Continue with local logout even if API call fails
      console.warn('Logout API call failed:', error)
    } finally {
      removeAuthToken()
      localStorage.removeItem('user')
    }
  }

  // Forgot password
  async forgotPassword(email) {
    return api.post('/auth/forgot-password', { email })
  }

  // Reset password
  async resetPassword(token, newPassword) {
    return api.post('/auth/reset-password', { token, newPassword })
  }

  // Verify email
  async verifyEmail(token) {
    return api.post('/auth/verify-email', { token })
  }

  // Refresh token
  async refreshToken() {
    try {
      const response = await api.post('/auth/refresh')
      
      if (response.token) {
        setAuthToken(response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
      }
      
      return response
    } catch (error) {
      // If refresh fails, logout user
      this.logout()
      throw error
    }
  }

  // Get current user
  async getCurrentUser() {
    return api.get('/auth/me')
  }

  // Update user profile
  async updateProfile(userData) {
    const response = await api.put('/auth/profile', userData)
    localStorage.setItem('user', JSON.stringify(response.user))
    return response
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    return api.post('/auth/change-password', {
      currentPassword,
      newPassword
    })
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('auth_token')
  }

  // Get stored user data
  getUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  }

  // Validate token
  async validateToken() {
    try {
      const response = await api.post('/auth/validate')
      return response.valid
    } catch (error) {
      return false
    }
  }
}

// Create and export singleton instance
const authService = new AuthService()
export default authService

// Mock service for development
export const mockAuthService = {
  async login(credentials) {
    const { email, password } = credentials
    
    // Simple mock validation
    if (email === 'demo@example.com' && password === 'password') {
      const user = {
        id: 1,
        email: 'demo@example.com',
        name: 'Demo User',
        role: 'admin',
        avatar: null,
        emailVerified: true,
        createdAt: new Date().toISOString()
      }
      
      const token = 'mock-jwt-token-' + Date.now()
      
      setAuthToken(token)
      localStorage.setItem('user', JSON.stringify(user))
      
      return { user, token }
    }
    
    throw new Error('Invalid credentials')
  },

  async register(userData) {
    const { email, password, name } = userData
    
    // Simple mock validation
    if (email && password && name) {
      const user = {
        id: Date.now(),
        email,
        name,
        role: 'user',
        avatar: null,
        emailVerified: false,
        createdAt: new Date().toISOString()
      }
      
      const token = 'mock-jwt-token-' + Date.now()
      
      setAuthToken(token)
      localStorage.setItem('user', JSON.stringify(user))
      
      return { user, token }
    }
    
    throw new Error('Invalid registration data')
  },

  async logout() {
    removeAuthToken()
    localStorage.removeItem('user')
    return { message: 'Logged out successfully' }
  },

  async forgotPassword(email) {
    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (email) {
      return { message: 'Password reset email sent' }
    }
    
    throw new Error('Email is required')
  },

  async resetPassword(token, newPassword) {
    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (token && newPassword) {
      return { message: 'Password reset successful' }
    }
    
    throw new Error('Invalid reset token or password')
  },

  async getCurrentUser() {
    const user = localStorage.getItem('user')
    
    if (user) {
      return JSON.parse(user)
    }
    
    throw new Error('User not authenticated')
  },

  async updateProfile(userData) {
    const currentUser = this.getUser()
    
    if (!currentUser) {
      throw new Error('User not authenticated')
    }
    
    const updatedUser = {
      ...currentUser,
      ...userData,
      updatedAt: new Date().toISOString()
    }
    
    localStorage.setItem('user', JSON.stringify(updatedUser))
    
    return { user: updatedUser }
  },

  async changePassword(currentPassword, newPassword) {
    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (currentPassword && newPassword) {
      return { message: 'Password changed successfully' }
    }
    
    throw new Error('Current password and new password are required')
  },

  isAuthenticated() {
    return !!localStorage.getItem('auth_token')
  },

  getUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  async validateToken() {
    return this.isAuthenticated()
  }
}

export { AuthService }