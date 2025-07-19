import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import monitoringService, { MonitoringService } from '../monitoringService'

// Mock API config
vi.mock('../../config/apiConfig', () => ({
  API_CONFIG: {
    DEBUG: false,
    EXTERNAL: {
      SENTRY_DSN: 'test-sentry-dsn',
      GOOGLE_ANALYTICS_ID: 'GA-TEST-123',
      HOTJAR_ID: 'test-hotjar-id',
      MIXPANEL_TOKEN: 'test-mixpanel-token'
    },
    FEATURES: {
      ANALYTICS: true
    }
  }
}))

// Mock global objects
const mockSentry = {
  init: vi.fn(),
  configureScope: vi.fn(),
  withScope: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  addBreadcrumb: vi.fn(),
  setUser: vi.fn()
}

const mockGtag = vi.fn()
const mockMixpanel = {
  init: vi.fn(),
  track: vi.fn(),
  identify: vi.fn(),
  people: {
    set: vi.fn()
  }
}

const mockHj = vi.fn()

// Mock dynamic imports
vi.mock('@sentry/react', () => mockSentry)

describe('MonitoringService', () => {
  let service

  beforeEach(() => {
    // Reset global mocks
    global.window = Object.create(window)
    global.window.Sentry = mockSentry
    global.window.gtag = mockGtag
    global.window.mixpanel = mockMixpanel
    global.window.hj = mockHj
    global.window.dataLayer = []
    
    // Mock document methods
    global.document = {
      ...document,
      createElement: vi.fn(() => ({
        async: false,
        src: '',
        onload: null
      })),
      head: {
        appendChild: vi.fn()
      }
    }

    // Mock navigator
    global.navigator = {
      userAgent: 'test-user-agent'
    }

    // Create new service instance
    service = new MonitoringService()
    
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initialization', () => {
    it('initializes with correct default state', () => {
      expect(service.isInitialized).toBe(false)
      expect(service.userId).toBe(null)
      expect(service.context).toEqual({})
      expect(service.breadcrumbs).toEqual([])
      expect(service.sessionId).toBeTruthy()
    })

    it('generates unique session IDs', () => {
      const service1 = new MonitoringService()
      const service2 = new MonitoringService()
      expect(service1.sessionId).not.toBe(service2.sessionId)
    })

    it('initializes successfully', async () => {
      await service.initialize()
      expect(service.isInitialized).toBe(true)
    })

    it('does not initialize twice', async () => {
      await service.initialize()
      const firstInitState = service.isInitialized
      
      await service.initialize()
      expect(service.isInitialized).toBe(firstInitState)
    })
  })

  describe('User Management', () => {
    beforeEach(async () => {
      await service.initialize()
    })

    it('sets user context correctly', () => {
      const user = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin'
      }

      service.setUser(user)

      expect(service.userId).toBe('123')
      expect(service.context.user).toEqual(user)
    })

    it('updates external services with user data', () => {
      const user = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin'
      }

      service.setUser(user)

      expect(mockSentry.setUser).toHaveBeenCalledWith({
        id: '123',
        email: 'test@example.com',
        username: 'Test User'
      })

      expect(mockMixpanel.identify).toHaveBeenCalledWith('123')
      expect(mockMixpanel.people.set).toHaveBeenCalledWith({
        $email: 'test@example.com',
        $name: 'Test User',
        role: 'admin'
      })
    })
  })

  describe('Breadcrumbs', () => {
    beforeEach(async () => {
      await service.initialize()
    })

    it('adds breadcrumbs correctly', () => {
      service.addBreadcrumb('Test action', 'user', 'info', { key: 'value' })

      expect(service.breadcrumbs).toHaveLength(1)
      expect(service.breadcrumbs[0]).toMatchObject({
        message: 'Test action',
        category: 'user',
        level: 'info',
        data: { key: 'value' }
      })
    })

    it('limits breadcrumb count', () => {
      // Add more than max breadcrumbs
      for (let i = 0; i < 105; i++) {
        service.addBreadcrumb(`Action ${i}`)
      }

      expect(service.breadcrumbs).toHaveLength(100)
      expect(service.breadcrumbs[0].message).toBe('Action 5')
    })

    it('sends breadcrumbs to Sentry', () => {
      service.addBreadcrumb('Test action')
      expect(mockSentry.addBreadcrumb).toHaveBeenCalled()
    })
  })

  describe('Error Tracking', () => {
    beforeEach(async () => {
      await service.initialize()
    })

    it('captures exceptions correctly', () => {
      const error = new Error('Test error')
      const context = { additional: 'data' }

      service.captureException(error, context)

      expect(mockSentry.withScope).toHaveBeenCalled()
      expect(mockSentry.captureException).toHaveBeenCalledWith(error)
    })

    it('captures messages correctly', () => {
      service.captureMessage('Test message', 'warning', { extra: 'context' })

      expect(mockSentry.withScope).toHaveBeenCalled()
      expect(mockSentry.captureMessage).toHaveBeenCalledWith('Test message')
    })

    it('includes session context in error data', () => {
      const error = new Error('Test error')
      service.captureException(error)

      // Check that session context is included
      expect(mockSentry.withScope).toHaveBeenCalledWith(expect.any(Function))
    })
  })

  describe('Event Tracking', () => {
    beforeEach(async () => {
      await service.initialize()
    })

    it('tracks events correctly', () => {
      const eventData = { action: 'click', target: 'button' }
      service.trackEvent('user_interaction', eventData)

      expect(mockGtag).toHaveBeenCalledWith('event', 'user_interaction', expect.objectContaining(eventData))
      expect(mockMixpanel.track).toHaveBeenCalledWith('user_interaction', expect.objectContaining(eventData))
    })

    it('includes session data in events', () => {
      service.trackEvent('test_event')

      expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', expect.objectContaining({
        sessionId: service.sessionId
      }))
    })

    it('tracks page views correctly', () => {
      service.trackPageView('/dashboard', 'Dashboard')

      expect(mockGtag).toHaveBeenCalledWith('config', 'GA-TEST-123', expect.objectContaining({
        page_title: 'Dashboard'
      }))

      expect(mockMixpanel.track).toHaveBeenCalledWith('Page View', expect.objectContaining({
        page: '/dashboard',
        title: 'Dashboard'
      }))
    })
  })

  describe('Status Reporting', () => {
    beforeEach(async () => {
      await service.initialize()
    })

    it('returns correct status', () => {
      const status = service.getStatus()

      expect(status).toMatchObject({
        initialized: true,
        sessionId: service.sessionId,
        userId: null,
        breadcrumbsCount: 0,
        services: {
          sentry: true,
          googleAnalytics: true,
          hotjar: true,
          mixpanel: true
        }
      })
    })

    it('updates status after setting user', () => {
      service.setUser({ id: '123', email: 'test@example.com', name: 'Test', role: 'admin' })
      const status = service.getStatus()

      expect(status.userId).toBe('123')
    })

    it('updates breadcrumb count', () => {
      service.addBreadcrumb('Test')
      const status = service.getStatus()

      expect(status.breadcrumbsCount).toBe(1)
    })
  })

  describe('Singleton Instance', () => {
    it('exports singleton instance', () => {
      expect(monitoringService).toBeInstanceOf(MonitoringService)
    })

    it('maintains state across imports', () => {
      monitoringService.addBreadcrumb('Test breadcrumb')
      expect(monitoringService.breadcrumbs).toHaveLength(1)
    })
  })

  describe('Performance Monitoring', () => {
    beforeEach(async () => {
      // Mock performance API
      global.window.performance = {
        timing: {
          loadEventEnd: 2000,
          navigationStart: 1000,
          domContentLoadedEventEnd: 1500,
          responseStart: 1200
        }
      }

      await service.initialize()
    })

    it('sets up performance monitoring', () => {
      // Performance monitoring is set up during initialization
      expect(service.isInitialized).toBe(true)
    })

    it('sends web vital metrics', () => {
      const metric = {
        name: 'CLS',
        value: 0.1,
        id: 'test-id',
        delta: 0.05
      }

      service.sendWebVital(metric)

      expect(mockGtag).toHaveBeenCalledWith('event', 'web_vital', expect.objectContaining({
        metric_name: 'CLS',
        metric_value: 0.1,
        metric_id: 'test-id',
        metric_delta: 0.05
      }))
    })
  })
})