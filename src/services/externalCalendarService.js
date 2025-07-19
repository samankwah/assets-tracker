/**
 * Service for integrating with external calendar providers (Google, Outlook, Apple)
 */
class ExternalCalendarService {
  constructor() {
    this.providers = {
      google: {
        name: 'Google Calendar',
        icon: 'google',
        authUrl: 'https://accounts.google.com/oauth/authorize',
        apiUrl: 'https://www.googleapis.com/calendar/v3',
        scopes: [
          'https://www.googleapis.com/auth/calendar',
          'https://www.googleapis.com/auth/calendar.events'
        ],
        clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'demo_google_client_id'
      },
      outlook: {
        name: 'Microsoft Outlook',
        icon: 'microsoft',
        authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
        apiUrl: 'https://graph.microsoft.com/v1.0',
        scopes: [
          'https://graph.microsoft.com/calendars.readwrite',
          'https://graph.microsoft.com/calendars.read'
        ],
        clientId: process.env.REACT_APP_OUTLOOK_CLIENT_ID || 'demo_outlook_client_id'
      },
      apple: {
        name: 'Apple Calendar',
        icon: 'apple',
        authUrl: 'https://appleid.apple.com/auth/authorize',
        apiUrl: 'https://caldav.icloud.com',
        scopes: ['calendar'],
        clientId: process.env.REACT_APP_APPLE_CLIENT_ID || 'demo_apple_client_id'
      }
    }

    this.connectedAccounts = new Map()
    this.syncSettings = new Map()
    this.loadStoredConnections()
  }

  /**
   * Load stored connections from localStorage
   */
  loadStoredConnections() {
    try {
      const stored = localStorage.getItem('assetTracker_calendarConnections')
      if (stored) {
        const connections = JSON.parse(stored)
        connections.forEach(conn => {
          this.connectedAccounts.set(conn.id, conn)
        })
      }

      const storedSettings = localStorage.getItem('assetTracker_syncSettings')
      if (storedSettings) {
        const settings = JSON.parse(storedSettings)
        settings.forEach(setting => {
          this.syncSettings.set(setting.accountId, setting)
        })
      }
    } catch (error) {
      console.error('Failed to load stored connections:', error)
    }
  }

  /**
   * Save connections to localStorage
   */
  saveConnections() {
    try {
      const connections = Array.from(this.connectedAccounts.values())
      localStorage.setItem('assetTracker_calendarConnections', JSON.stringify(connections))

      const settings = Array.from(this.syncSettings.values())
      localStorage.setItem('assetTracker_syncSettings', JSON.stringify(settings))
    } catch (error) {
      console.error('Failed to save connections:', error)
    }
  }

  /**
   * Get authorization URL for provider
   */
  getAuthUrl(provider, redirectUri) {
    const providerConfig = this.providers[provider]
    if (!providerConfig) {
      throw new Error(`Unknown provider: ${provider}`)
    }

    const params = new URLSearchParams({
      client_id: providerConfig.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: providerConfig.scopes.join(' '),
      state: `${provider}_${Date.now()}`
    })

    return `${providerConfig.authUrl}?${params.toString()}`
  }

  /**
   * Connect to external calendar provider (mock implementation)
   */
  async connectProvider(provider, authCode, redirectUri) {
    try {
      // In a real implementation, you would exchange auth code for access token
      const mockConnection = {
        id: `${provider}_${Date.now()}`,
        provider,
        providerName: this.providers[provider].name,
        email: `user@${provider === 'google' ? 'gmail.com' : provider === 'outlook' ? 'outlook.com' : 'icloud.com'}`,
        accessToken: `mock_access_token_${provider}_${Date.now()}`,
        refreshToken: `mock_refresh_token_${provider}_${Date.now()}`,
        expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
        connectedAt: new Date().toISOString(),
        status: 'active',
        permissions: this.providers[provider].scopes,
        calendars: await this.getMockCalendars(provider)
      }

      this.connectedAccounts.set(mockConnection.id, mockConnection)
      
      // Set default sync settings
      this.syncSettings.set(mockConnection.id, {
        accountId: mockConnection.id,
        syncEnabled: true,
        syncDirection: 'bidirectional', // 'push', 'pull', 'bidirectional'
        syncFrequency: 'realtime', // 'realtime', 'hourly', 'daily'
        selectedCalendars: mockConnection.calendars.map(cal => cal.id),
        syncCategories: ['Inspection', 'Maintenance', 'Meeting'],
        conflictResolution: 'ask', // 'ask', 'local_wins', 'remote_wins'
        createdAt: new Date().toISOString()
      })

      this.saveConnections()
      return mockConnection
    } catch (error) {
      throw new Error(`Failed to connect to ${provider}: ${error.message}`)
    }
  }

  /**
   * Get mock calendars for provider
   */
  async getMockCalendars(provider) {
    const mockCalendars = {
      google: [
        { id: 'primary', name: 'Primary Calendar', isPrimary: true, canWrite: true },
        { id: 'work_calendar', name: 'Work Calendar', isPrimary: false, canWrite: true },
        { id: 'personal_calendar', name: 'Personal Calendar', isPrimary: false, canWrite: true }
      ],
      outlook: [
        { id: 'calendar', name: 'Calendar', isPrimary: true, canWrite: true },
        { id: 'work_calendar', name: 'Work', isPrimary: false, canWrite: true },
        { id: 'holidays', name: 'Holidays', isPrimary: false, canWrite: false }
      ],
      apple: [
        { id: 'home', name: 'Home', isPrimary: true, canWrite: true },
        { id: 'work', name: 'Work', isPrimary: false, canWrite: true }
      ]
    }

    return mockCalendars[provider] || []
  }

  /**
   * Disconnect provider
   */
  async disconnectProvider(accountId) {
    try {
      const account = this.connectedAccounts.get(accountId)
      if (!account) {
        throw new Error('Account not found')
      }

      // In a real implementation, you would revoke the access token
      console.log(`Revoking access for ${account.provider} account`)

      this.connectedAccounts.delete(accountId)
      this.syncSettings.delete(accountId)
      this.saveConnections()

      return { success: true, accountId }
    } catch (error) {
      throw new Error(`Failed to disconnect provider: ${error.message}`)
    }
  }

  /**
   * Get connected accounts
   */
  getConnectedAccounts() {
    return Array.from(this.connectedAccounts.values())
  }

  /**
   * Get sync settings for account
   */
  getSyncSettings(accountId) {
    return this.syncSettings.get(accountId)
  }

  /**
   * Update sync settings
   */
  updateSyncSettings(accountId, settings) {
    const currentSettings = this.syncSettings.get(accountId)
    if (!currentSettings) {
      throw new Error('Account not found')
    }

    const updatedSettings = {
      ...currentSettings,
      ...settings,
      updatedAt: new Date().toISOString()
    }

    this.syncSettings.set(accountId, updatedSettings)
    this.saveConnections()
    return updatedSettings
  }

  /**
   * Sync events to external calendar
   */
  async pushEventsToProvider(accountId, events) {
    try {
      const account = this.connectedAccounts.get(accountId)
      const settings = this.syncSettings.get(accountId)

      if (!account || !settings || !settings.syncEnabled) {
        return { success: false, reason: 'Account not configured for sync' }
      }

      // Filter events by sync categories
      const filteredEvents = events.filter(event => 
        settings.syncCategories.includes(event.category) || 
        settings.syncCategories.includes(event.type)
      )

      const results = []
      const errors = []

      for (const event of filteredEvents) {
        try {
          const externalEvent = this.convertToExternalFormat(event, account.provider)
          const result = await this.createExternalEvent(account, externalEvent)
          results.push({
            localEventId: event.id,
            externalEventId: result.id,
            status: 'synced'
          })
        } catch (error) {
          errors.push({
            eventId: event.id,
            error: error.message
          })
        }
      }

      return {
        success: true,
        synced: results.length,
        failed: errors.length,
        results,
        errors
      }
    } catch (error) {
      throw new Error(`Failed to push events: ${error.message}`)
    }
  }

  /**
   * Pull events from external calendar
   */
  async pullEventsFromProvider(accountId, dateRange = {}) {
    try {
      const account = this.connectedAccounts.get(accountId)
      const settings = this.syncSettings.get(accountId)

      if (!account || !settings || !settings.syncEnabled) {
        return { success: false, reason: 'Account not configured for sync' }
      }

      const { startDate, endDate } = dateRange
      const externalEvents = await this.getExternalEvents(account, {
        calendarIds: settings.selectedCalendars,
        startDate,
        endDate
      })

      const convertedEvents = externalEvents.map(event => 
        this.convertFromExternalFormat(event, account.provider)
      )

      return {
        success: true,
        events: convertedEvents,
        total: convertedEvents.length,
        source: account.provider
      }
    } catch (error) {
      throw new Error(`Failed to pull events: ${error.message}`)
    }
  }

  /**
   * Bidirectional sync
   */
  async syncBidirectional(accountId, localEvents, options = {}) {
    try {
      const { conflictResolution = 'ask' } = options
      
      // Pull external events
      const pullResult = await this.pullEventsFromProvider(accountId)
      if (!pullResult.success) {
        return pullResult
      }

      // Push local events
      const pushResult = await this.pushEventsToProvider(accountId, localEvents)
      if (!pushResult.success) {
        return pushResult
      }

      // Detect conflicts (events with same title/time)
      const conflicts = this.detectConflicts(localEvents, pullResult.events)

      return {
        success: true,
        pulled: pullResult.events.length,
        pushed: pushResult.synced,
        conflicts: conflicts.length,
        conflictDetails: conflicts,
        needsResolution: conflicts.length > 0 && conflictResolution === 'ask'
      }
    } catch (error) {
      throw new Error(`Failed to sync: ${error.message}`)
    }
  }

  /**
   * Convert internal event to external format
   */
  convertToExternalFormat(event, provider) {
    const baseEvent = {
      title: event.title,
      description: event.description || event.notes || '',
      start: event.start,
      end: event.end,
      location: event.location || ''
    }

    switch (provider) {
      case 'google':
        return {
          summary: baseEvent.title,
          description: baseEvent.description,
          start: {
            dateTime: new Date(baseEvent.start).toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          end: {
            dateTime: new Date(baseEvent.end).toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          location: baseEvent.location,
          source: {
            title: 'Asset Tracker',
            url: window.location.origin
          }
        }

      case 'outlook':
        return {
          subject: baseEvent.title,
          body: {
            contentType: 'text',
            content: baseEvent.description
          },
          start: {
            dateTime: new Date(baseEvent.start).toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          end: {
            dateTime: new Date(baseEvent.end).toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          location: {
            displayName: baseEvent.location
          }
        }

      case 'apple':
        return {
          summary: baseEvent.title,
          description: baseEvent.description,
          dtstart: new Date(baseEvent.start).toISOString(),
          dtend: new Date(baseEvent.end).toISOString(),
          location: baseEvent.location
        }

      default:
        return baseEvent
    }
  }

  /**
   * Convert external event to internal format
   */
  convertFromExternalFormat(externalEvent, provider) {
    let baseEvent = {}

    switch (provider) {
      case 'google':
        baseEvent = {
          title: externalEvent.summary,
          description: externalEvent.description || '',
          start: new Date(externalEvent.start.dateTime || externalEvent.start.date),
          end: new Date(externalEvent.end.dateTime || externalEvent.end.date),
          location: externalEvent.location || '',
          externalId: externalEvent.id,
          externalProvider: 'google'
        }
        break

      case 'outlook':
        baseEvent = {
          title: externalEvent.subject,
          description: externalEvent.body?.content || '',
          start: new Date(externalEvent.start.dateTime),
          end: new Date(externalEvent.end.dateTime),
          location: externalEvent.location?.displayName || '',
          externalId: externalEvent.id,
          externalProvider: 'outlook'
        }
        break

      case 'apple':
        baseEvent = {
          title: externalEvent.summary,
          description: externalEvent.description || '',
          start: new Date(externalEvent.dtstart),
          end: new Date(externalEvent.dtend),
          location: externalEvent.location || '',
          externalId: externalEvent.uid,
          externalProvider: 'apple'
        }
        break

      default:
        baseEvent = externalEvent
    }

    return {
      ...baseEvent,
      id: `external_${provider}_${baseEvent.externalId}`,
      type: 'external',
      category: 'imported',
      status: 'Scheduled',
      priority: 'Medium',
      importedAt: new Date().toISOString()
    }
  }

  /**
   * Mock create external event
   */
  async createExternalEvent(account, event) {
    // Mock API call delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return {
      id: `external_${account.provider}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'confirmed',
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    }
  }

  /**
   * Mock get external events
   */
  async getExternalEvents(account, options = {}) {
    // Mock API call delay
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Return mock events based on provider
    const mockEvents = {
      google: [
        {
          id: 'google_event_1',
          summary: 'Team Meeting',
          description: 'Weekly team sync',
          start: { dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() },
          end: { dateTime: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString() },
          location: 'Conference Room A'
        }
      ],
      outlook: [
        {
          id: 'outlook_event_1',
          subject: 'Client Presentation',
          body: { content: 'Quarterly review presentation' },
          start: { dateTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() },
          end: { dateTime: new Date(Date.now() + 50 * 60 * 60 * 1000).toISOString() },
          location: { displayName: 'Main Office' }
        }
      ],
      apple: [
        {
          uid: 'apple_event_1',
          summary: 'Doctor Appointment',
          description: 'Annual checkup',
          dtstart: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
          dtend: new Date(Date.now() + 73 * 60 * 60 * 1000).toISOString(),
          location: 'Medical Center'
        }
      ]
    }

    return mockEvents[account.provider] || []
  }

  /**
   * Detect conflicts between local and external events
   */
  detectConflicts(localEvents, externalEvents) {
    const conflicts = []
    
    localEvents.forEach(localEvent => {
      externalEvents.forEach(externalEvent => {
        // Check for same title and overlapping time
        if (localEvent.title === externalEvent.title) {
          const localStart = new Date(localEvent.start)
          const localEnd = new Date(localEvent.end)
          const externalStart = new Date(externalEvent.start)
          const externalEnd = new Date(externalEvent.end)
          
          const hasTimeOverlap = (
            localStart < externalEnd && localEnd > externalStart
          )
          
          if (hasTimeOverlap) {
            conflicts.push({
              type: 'time_overlap',
              localEvent,
              externalEvent,
              severity: 'high'
            })
          }
        }
      })
    })
    
    return conflicts
  }

  /**
   * Resolve conflicts
   */
  async resolveConflicts(conflicts, resolutionStrategy) {
    const resolved = []
    
    for (const conflict of conflicts) {
      let resolution = null
      
      switch (resolutionStrategy) {
        case 'local_wins':
          resolution = {
            action: 'keep_local',
            event: conflict.localEvent
          }
          break
          
        case 'remote_wins':
          resolution = {
            action: 'keep_external',
            event: conflict.externalEvent
          }
          break
          
        case 'merge':
          resolution = {
            action: 'merge',
            event: this.mergeEvents(conflict.localEvent, conflict.externalEvent)
          }
          break
          
        default:
          resolution = {
            action: 'ask',
            conflict
          }
      }
      
      resolved.push(resolution)
    }
    
    return resolved
  }

  /**
   * Merge conflicting events
   */
  mergeEvents(localEvent, externalEvent) {
    return {
      ...localEvent,
      title: localEvent.title,
      description: `${localEvent.description}\n\nImported: ${externalEvent.description}`,
      location: localEvent.location || externalEvent.location,
      start: localEvent.start,
      end: localEvent.end,
      externalId: externalEvent.externalId,
      externalProvider: externalEvent.externalProvider,
      mergedAt: new Date().toISOString()
    }
  }

  /**
   * Get sync status for all accounts
   */
  getSyncStatus() {
    const accounts = this.getConnectedAccounts()
    
    return accounts.map(account => {
      const settings = this.getSyncSettings(account.id)
      
      return {
        accountId: account.id,
        provider: account.provider,
        email: account.email,
        status: account.status,
        syncEnabled: settings?.syncEnabled || false,
        lastSync: settings?.lastSync || null,
        syncDirection: settings?.syncDirection || 'bidirectional',
        syncFrequency: settings?.syncFrequency || 'realtime',
        selectedCalendars: settings?.selectedCalendars?.length || 0,
        totalCalendars: account.calendars?.length || 0
      }
    })
  }

  /**
   * Test connection to provider
   */
  async testConnection(accountId) {
    try {
      const account = this.connectedAccounts.get(accountId)
      if (!account) {
        throw new Error('Account not found')
      }

      // Mock API call to test connection
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Simulate occasional failures
      if (Math.random() < 0.1) {
        throw new Error('Connection timeout')
      }

      return {
        success: true,
        provider: account.provider,
        responseTime: Math.floor(Math.random() * 500) + 100,
        lastTested: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        provider: account?.provider || 'unknown',
        error: error.message,
        lastTested: new Date().toISOString()
      }
    }
  }

  /**
   * Get available providers
   */
  getAvailableProviders() {
    return Object.entries(this.providers).map(([key, provider]) => ({
      id: key,
      name: provider.name,
      icon: provider.icon,
      isConnected: Array.from(this.connectedAccounts.values()).some(
        account => account.provider === key
      )
    }))
  }
}

export default new ExternalCalendarService()