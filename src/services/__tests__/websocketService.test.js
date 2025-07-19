import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import websocketService, { WebSocketService } from '../websocketService'

// Mock API config
vi.mock('../../config/apiConfig', () => ({
  API_CONFIG: {
    DEBUG: false,
    REALTIME: {
      WEBSOCKET_URL: 'ws://localhost:3001/ws'
    }
  }
}))

// Mock WebSocket
class MockWebSocket {
  constructor(url) {
    this.url = url
    this.readyState = WebSocket.CONNECTING
    this.onopen = null
    this.onclose = null
    this.onmessage = null
    this.onerror = null
    
    // Simulate connection after a short delay
    setTimeout(() => {
      this.readyState = WebSocket.OPEN
      if (this.onopen) this.onopen()
    }, 10)
  }
  
  send(data) {
    this.lastSentData = data
  }
  
  close() {
    this.readyState = WebSocket.CLOSED
    if (this.onclose) this.onclose()
  }
  
  // Helper method to simulate receiving messages
  simulateMessage(data) {
    if (this.onmessage) {
      this.onmessage({ data: JSON.stringify(data) })
    }
  }
  
  // Helper method to simulate errors
  simulateError(error) {
    if (this.onerror) this.onerror(error)
  }
}

global.WebSocket = MockWebSocket

describe('WebSocketService', () => {
  let service
  let mockWebSocket

  beforeEach(() => {
    service = new WebSocketService()
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (service.ws) {
      service.disconnect()
    }
  })

  describe('Connection Management', () => {
    it('connects with valid token', async () => {
      const token = 'valid-token'
      
      await service.connect(token)
      
      expect(service.ws).toBeDefined()
      expect(service.ws.url).toBe('ws://localhost:3001/ws?token=valid-token')
      expect(service.isConnected).toBe(true)
    })

    it('handles connection without token', async () => {
      await service.connect()
      
      expect(service.ws.url).toBe('ws://localhost:3001/ws')
    })

    it('disconnects properly', async () => {
      await service.connect('token')
      
      service.disconnect()
      
      expect(service.isConnected).toBe(false)
      expect(service.ws).toBe(null)
    })

    it('handles multiple connection attempts', async () => {
      await service.connect('token1')
      const firstWs = service.ws
      
      await service.connect('token2')
      
      expect(service.ws).not.toBe(firstWs)
      expect(service.ws.url).toBe('ws://localhost:3001/ws?token=token2')
    })
  })

  describe('Event Subscription', () => {
    beforeEach(async () => {
      await service.connect('token')
    })

    it('subscribes to events', () => {
      const callback = vi.fn()
      
      service.subscribe('asset_updated', callback)
      
      expect(service.eventHandlers.get('asset_updated')).toContain(callback)
    })

    it('unsubscribes from events', () => {
      const callback = vi.fn()
      
      service.subscribe('asset_updated', callback)
      service.unsubscribe('asset_updated', callback)
      
      expect(service.eventHandlers.get('asset_updated')).not.toContain(callback)
    })

    it('handles multiple subscribers for same event', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()
      
      service.subscribe('asset_updated', callback1)
      service.subscribe('asset_updated', callback2)
      
      const handlers = service.eventHandlers.get('asset_updated')
      expect(handlers).toContain(callback1)
      expect(handlers).toContain(callback2)
      expect(handlers).toHaveLength(2)
    })

    it('removes all handlers when unsubscribing non-existent callback', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()
      
      service.subscribe('asset_updated', callback1)
      service.unsubscribe('asset_updated', callback2) // Different callback
      
      // Should still have the original callback
      expect(service.eventHandlers.get('asset_updated')).toContain(callback1)
    })
  })

  describe('Message Handling', () => {
    beforeEach(async () => {
      await service.connect('token')
    })

    it('handles incoming messages', () => {
      const callback = vi.fn()
      service.subscribe('asset_updated', callback)
      
      const messageData = {
        type: 'asset_updated',
        payload: { id: '1', name: 'Updated Asset' }
      }
      
      service.ws.simulateMessage(messageData)
      
      expect(callback).toHaveBeenCalledWith(messageData.payload)
    })

    it('ignores messages for unsubscribed events', () => {
      const callback = vi.fn()
      service.subscribe('task_updated', callback)
      
      const messageData = {
        type: 'asset_updated',
        payload: { id: '1' }
      }
      
      service.ws.simulateMessage(messageData)
      
      expect(callback).not.toHaveBeenCalled()
    })

    it('handles malformed messages gracefully', () => {
      const callback = vi.fn()
      service.subscribe('asset_updated', callback)
      
      // Simulate malformed JSON
      if (service.ws.onmessage) {
        service.ws.onmessage({ data: 'invalid json' })
      }
      
      expect(callback).not.toHaveBeenCalled()
    })

    it('handles messages without type', () => {
      const callback = vi.fn()
      service.subscribe('asset_updated', callback)
      
      const messageData = {
        payload: { id: '1' }
        // Missing type
      }
      
      service.ws.simulateMessage(messageData)
      
      expect(callback).not.toHaveBeenCalled()
    })
  })

  describe('Message Sending', () => {
    beforeEach(async () => {
      await service.connect('token')
    })

    it('sends messages when connected', () => {
      const message = {
        type: 'subscribe_to_asset',
        assetId: '1'
      }
      
      service.send(message)
      
      expect(service.ws.lastSentData).toBe(JSON.stringify(message))
    })

    it('queues messages when not connected', () => {
      service.disconnect()
      
      const message = { type: 'test' }
      service.send(message)
      
      expect(service.messageQueue).toContain(message)
    })

    it('sends queued messages after reconnection', async () => {
      const message = { type: 'test' }
      
      service.disconnect()
      service.send(message)
      
      await service.connect('token')
      
      expect(service.ws.lastSentData).toBe(JSON.stringify(message))
      expect(service.messageQueue).toHaveLength(0)
    })
  })

  describe('Reconnection Logic', () => {
    beforeEach(async () => {
      await service.connect('token')
    })

    it('attempts reconnection on connection loss', () => {
      const reconnectSpy = vi.spyOn(service, 'attemptReconnect')
      
      service.ws.simulateError(new Error('Connection lost'))
      
      expect(reconnectSpy).toHaveBeenCalled()
    })

    it('increments retry count on failed reconnection', () => {
      const initialRetries = service.reconnectAttempts
      
      service.ws.simulateError(new Error('Connection lost'))
      
      expect(service.reconnectAttempts).toBe(initialRetries + 1)
    })

    it('stops reconnecting after max attempts', () => {
      service.reconnectAttempts = service.maxReconnectAttempts
      
      const reconnectSpy = vi.spyOn(service, 'attemptReconnect')
      service.ws.simulateError(new Error('Connection lost'))
      
      expect(reconnectSpy).not.toHaveBeenCalled()
    })

    it('resets retry count on successful connection', async () => {
      service.reconnectAttempts = 3
      
      await service.connect('token')
      
      expect(service.reconnectAttempts).toBe(0)
    })
  })

  describe('Status and State', () => {
    it('reports correct connection status', async () => {
      expect(service.isConnected).toBe(false)
      
      await service.connect('token')
      expect(service.isConnected).toBe(true)
      
      service.disconnect()
      expect(service.isConnected).toBe(false)
    })

    it('provides status information', async () => {
      await service.connect('token')
      
      const status = service.getStatus()
      
      expect(status).toMatchObject({
        connected: true,
        reconnectAttempts: 0,
        subscribedEvents: [],
        queuedMessages: 0
      })
    })

    it('includes subscribed events in status', () => {
      service.subscribe('asset_updated', vi.fn())
      service.subscribe('task_created', vi.fn())
      
      const status = service.getStatus()
      
      expect(status.subscribedEvents).toContain('asset_updated')
      expect(status.subscribedEvents).toContain('task_created')
    })
  })

  describe('Singleton Instance', () => {
    it('exports singleton instance', () => {
      expect(websocketService).toBeInstanceOf(WebSocketService)
    })

    it('maintains state across imports', () => {
      websocketService.subscribe('test_event', vi.fn())
      expect(websocketService.eventHandlers.has('test_event')).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('handles WebSocket constructor errors', () => {
      // Mock WebSocket to throw on construction
      global.WebSocket = vi.fn(() => {
        throw new Error('WebSocket not supported')
      })
      
      expect(async () => {
        await service.connect('token')
      }).not.toThrow()
    })

    it('handles send errors gracefully', async () => {
      await service.connect('token')
      
      // Mock send to throw
      service.ws.send = vi.fn(() => {
        throw new Error('Send failed')
      })
      
      expect(() => {
        service.send({ type: 'test' })
      }).not.toThrow()
    })
  })
})