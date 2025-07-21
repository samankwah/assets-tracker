/**
 * API Configuration for Asset Tracker
 * Handles environment-based configuration for mock vs real API integration
 */

// Environment helper functions
export const isDevelopment = () => import.meta.env.DEV
export const isProduction = () => import.meta.env.PROD

// API Configuration
export const API_CONFIG = {
  // Base API settings
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  VERSION: import.meta.env.VITE_API_VERSION || 'v1',
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
  
  // Force mock mode if explicitly set
  USE_MOCK_API: import.meta.env.VITE_USE_MOCK_API === 'true',
  
  // Authentication
  AUTH: {
    TOKEN_KEY: import.meta.env.VITE_AUTH_TOKEN_KEY || 'asset_tracker_token',
    REFRESH_TOKEN_KEY: import.meta.env.VITE_AUTH_REFRESH_TOKEN_KEY || 'asset_tracker_refresh_token',
    JWT_SECRET: import.meta.env.VITE_JWT_SECRET,
    TOKEN_EXPIRY: parseInt(import.meta.env.VITE_TOKEN_EXPIRY) || 3600,
  },
  
  // File storage
  STORAGE: {
    KEY_PREFIX: import.meta.env.VITE_STORAGE_KEY_PREFIX || 'asset_tracker_',
    CLOUDINARY_CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: import.meta.env.VITE_CLOUDINARY_API_KEY,
    AWS_S3_BUCKET: import.meta.env.VITE_AWS_S3_BUCKET,
    AWS_REGION: import.meta.env.VITE_AWS_REGION || 'us-east-1',
    CDN_URL: import.meta.env.VITE_CDN_URL,
  },
  
  // Email service
  EMAIL: {
    PROVIDER: import.meta.env.VITE_EMAIL_PROVIDER || 'sendgrid',
    API_KEY: import.meta.env.VITE_EMAIL_API_KEY,
    FROM_EMAIL: import.meta.env.VITE_FROM_EMAIL || 'noreply@assettracker.com',
    FROM_NAME: import.meta.env.VITE_FROM_NAME || 'Asset Tracker',
    SUPPORT_EMAIL: import.meta.env.VITE_SUPPORT_EMAIL || 'support@assettracker.com',
  },
  
  // External calendar integration
  CALENDAR: {
    GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CALENDAR_CLIENT_ID,
    MICROSOFT_CLIENT_ID: import.meta.env.VITE_MICROSOFT_OUTLOOK_CLIENT_ID,
    APPLE_API_KEY: import.meta.env.VITE_APPLE_CALENDAR_API_KEY,
  },
  
  // Real-time features
  REALTIME: {
    WEBSOCKET_URL: import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3001',
    ENABLE_WEBSOCKETS: import.meta.env.VITE_ENABLE_WEBSOCKETS === 'true',
  },
  
  // Push notifications
  NOTIFICATIONS: {
    VAPID_PUBLIC_KEY: import.meta.env.VITE_VAPID_PUBLIC_KEY,
    FCM_VAPID_KEY: import.meta.env.VITE_FCM_VAPID_KEY,
  },
  
  // Feature flags
  FEATURES: {
    ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    NOTIFICATIONS: import.meta.env.VITE_ENABLE_NOTIFICATIONS !== 'false',
    DARK_MODE: import.meta.env.VITE_ENABLE_DARK_MODE !== 'false',
    MULTI_TENANT: import.meta.env.VITE_ENABLE_MULTI_TENANT === 'true',
    REAL_TIME: import.meta.env.VITE_ENABLE_REAL_TIME === 'true',
  },
  
  // External services
  EXTERNAL: {
    GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
    STRIPE_PUBLIC_KEY: import.meta.env.VITE_STRIPE_PUBLIC_KEY,
    INTERCOM_APP_ID: import.meta.env.VITE_INTERCOM_APP_ID,
    GOOGLE_ANALYTICS_ID: import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
    HOTJAR_ID: import.meta.env.VITE_HOTJAR_ID,
    MIXPANEL_TOKEN: import.meta.env.VITE_MIXPANEL_TOKEN,
    RECAPTCHA_SITE_KEY: import.meta.env.VITE_RECAPTCHA_SITE_KEY,
  },
  
  // Rate limiting
  RATE_LIMITING: {
    API_RATE_LIMIT: parseInt(import.meta.env.VITE_API_RATE_LIMIT) || 1000,
    API_RATE_WINDOW: parseInt(import.meta.env.VITE_API_RATE_WINDOW) || 3600,
  },
  
  // Development settings
  DEBUG: import.meta.env.VITE_DEBUG === 'true',
  DEV_MODE: import.meta.env.VITE_DEV_MODE === 'true',
}

// API Endpoints configuration
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    CHANGE_PASSWORD: '/auth/change-password',
    PROFILE: '/auth/profile',
    ME: '/auth/me',
    VALIDATE: '/auth/validate',
  },
  
  // Assets
  ASSETS: {
    LIST: '/assets',
    DETAIL: (id) => `/assets/${id}`,
    CREATE: '/assets',
    UPDATE: (id) => `/assets/${id}`,
    DELETE: (id) => `/assets/${id}`,
    IMAGES: (id) => `/assets/${id}/images`,
    DELETE_IMAGE: (id, imageId) => `/assets/${id}/images/${imageId}`,
    STATS: '/assets/stats',
    INSPECTION_DUE: '/assets/inspection/due',
    UPDATE_INSPECTION: (id) => `/assets/${id}/inspection`,
    BULK_DELETE: '/assets/bulk-delete',
    BULK_UPDATE: '/assets/bulk-update',
    EXPORT: '/assets/export',
    IMPORT: '/assets/import',
  },
  
  // Tasks
  TASKS: {
    LIST: '/tasks',
    DETAIL: (id) => `/tasks/${id}`,
    CREATE: '/tasks',
    UPDATE: (id) => `/tasks/${id}`,
    DELETE: (id) => `/tasks/${id}`,
    OVERDUE: '/tasks/overdue',
    DUE_TODAY: '/tasks/due-today',
    DUE_THIS_WEEK: '/tasks/due-this-week',
    COMPLETE: (id) => `/tasks/${id}/complete`,
    INCOMPLETE: (id) => `/tasks/${id}/incomplete`,
    ASSIGN: (id) => `/tasks/${id}/assign`,
    UNASSIGN: (id) => `/tasks/${id}/unassign`,
    COMMENTS: (id) => `/tasks/${id}/comments`,
    PROGRESS: (id) => `/tasks/${id}/progress`,
    STATS: '/tasks/stats',
    BULK_UPDATE: '/tasks/bulk-update',
    BULK_DELETE: '/tasks/bulk-delete',
    EXPORT: '/tasks/export',
  },
  
  // Email notifications
  EMAIL: {
    SEND: '/notifications/email/send',
    BULK_SEND: '/notifications/email/bulk',
    STATUS: (id) => `/notifications/email/${id}/status`,
    ANALYTICS: '/notifications/email/analytics',
    PREFERENCES: '/notifications/email/preferences',
    VALIDATE_TEMPLATE: '/notifications/email/validate',
    SCHEDULE: '/notifications/email/schedule',
    CANCEL_SCHEDULED: (id) => `/notifications/email/scheduled/${id}`,
  },
  
  // Reports
  REPORTS: {
    SCHEDULE: '/reports/schedule',
    HISTORY: '/reports/history',
    DOWNLOAD: (id) => `/reports/${id}/download`,
  },
  
  // File uploads
  UPLOADS: {
    UPLOAD: '/uploads',
    DELETE: (id) => `/uploads/${id}`,
    GET_SIGNED_URL: '/uploads/signed-url',
  },
  
  // Search
  SEARCH: {
    GLOBAL: '/search',
    SAVED: '/search/saved',
    SAVE_SEARCH: '/search/save',
    DELETE_SAVED: (id) => `/search/saved/${id}`,
  },
}

// Determine if we should use mock API
export const shouldUseMockApi = () => {
  // Force mock if explicitly set
  if (API_CONFIG.USE_MOCK_API) return true
  
  // Use mock in development by default (unless explicitly disabled)
  if (isDevelopment()) return true
  
  // Use real API in production
  return false
}

// Get the appropriate base URL
export const getApiBaseUrl = () => {
  if (shouldUseMockApi()) {
    return '/mock-api' // This will be handled by the mock service worker
  }
  return API_CONFIG.BASE_URL
}

// Get full API URL
export const getApiUrl = (endpoint) => {
  const baseUrl = getApiBaseUrl()
  return `${baseUrl}${endpoint}`
}

// API configuration for different environments
export const ENV_CONFIG = {
  development: {
    API_URL: 'http://localhost:3001/api',
    WEBSOCKET_URL: 'ws://localhost:3001',
    USE_MOCK: true,
    DEBUG: true,
  },
  staging: {
    API_URL: 'https://staging-api.assettracker.com/api',
    WEBSOCKET_URL: 'wss://staging-ws.assettracker.com',
    USE_MOCK: false,
    DEBUG: true,
  },
  production: {
    API_URL: 'https://api.assettracker.com/api',
    WEBSOCKET_URL: 'wss://ws.assettracker.com',
    USE_MOCK: false,
    DEBUG: false,
  },
}

// Get environment-specific configuration
export const getEnvConfig = () => {
  const env = import.meta.env.MODE || 'development'
  return ENV_CONFIG[env] || ENV_CONFIG.development
}

// Validation functions
export const validateConfig = () => {
  const errors = []
  
  if (isProduction() && !API_CONFIG.BASE_URL) {
    errors.push('VITE_API_URL must be set in production')
  }
  
  if (API_CONFIG.FEATURES.ANALYTICS && !API_CONFIG.EXTERNAL.GOOGLE_ANALYTICS_ID) {
    errors.push('Google Analytics ID required when analytics is enabled')
  }
  
  if (!shouldUseMockApi() && !API_CONFIG.EMAIL.API_KEY) {
    console.warn('Email API key not configured - email notifications will be disabled')
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration errors: ${errors.join(', ')}`)
  }
  
  return true
}

// Initialize configuration
export const initializeConfig = async () => {
  try {
    validateConfig()
    
    if (API_CONFIG.DEBUG) {
      console.log('🔧 API Configuration:', {
        mode: import.meta.env.MODE,
        useMockApi: shouldUseMockApi(),
        baseUrl: getApiBaseUrl(),
        features: API_CONFIG.FEATURES,
      })
    }
    
    return true
  } catch (error) {
    console.error('Failed to initialize configuration:', error)
    throw error
  }
}

export default API_CONFIG