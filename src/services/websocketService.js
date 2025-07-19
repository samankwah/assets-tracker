/**
 * WebSocket Service for Real-time Features
 * Handles real-time updates for assets, tasks, and notifications
 */

import { API_CONFIG } from '../config/apiConfig'

class WebSocketService {
  constructor() {
    this.ws = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
    this.isConnected = false
    this.listeners = new Map()
    this.subscriptions = new Set()
    this.heartbeatInterval = null
    this.messageQueue = []
  }

  /**
   * Connect to WebSocket server
   */
  connect(token) {
    if (!API_CONFIG.FEATURES.REAL_TIME || !API_CONFIG.REALTIME.ENABLE_WEBSOCKETS) {
      console.log('WebSocket disabled in configuration')
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `${API_CONFIG.REALTIME.WEBSOCKET_URL}?token=${token}`
        this.ws = new WebSocket(wsUrl)

        this.ws.onopen = () => {
          console.log('🔌 WebSocket connected')
          this.isConnected = true
          this.reconnectAttempts = 0
          this.startHeartbeat()
          this.flushMessageQueue()
          resolve()
        }

        this.ws.onmessage = (event) => {
          this.handleMessage(event)
        }

        this.ws.onclose = (event) => {
          console.log('🔌 WebSocket disconnected:', event.code, event.reason)
          this.isConnected = false
          this.stopHeartbeat()
          
          if (event.code !== 1000) { // Not a normal closure
            this.handleReconnect()
          }
        }

        this.ws.onerror = (error) => {
          console.error('🔌 WebSocket error:', error)
          reject(error)
        }

        // Connection timeout
        setTimeout(() => {
          if (!this.isConnected) {
            reject(new Error('WebSocket connection timeout'))
          }
        }, 10000)

      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.ws) {
      this.isConnected = false
      this.stopHeartbeat()
      this.ws.close(1000, 'Client disconnecting')
      this.ws = null
    }
  }

  /**
   * Send message to server
   */
  send(message) {
    if (!this.isConnected) {
      // Queue message for when connection is restored
      this.messageQueue.push(message)
      return false
    }

    try {
      this.ws.send(JSON.stringify(message))
      return true
    } catch (error) {
      console.error('Failed to send WebSocket message:', error)
      return false
    }
  }

  /**
   * Subscribe to real-time updates for a specific type
   */
  subscribe(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    
    this.listeners.get(type).add(callback)
    this.subscriptions.add(type)

    // Send subscription message to server
    this.send({
      type: 'subscribe',
      channel: type,
      timestamp: new Date().toISOString()
    })

    return () => this.unsubscribe(type, callback)
  }

  /**
   * Unsubscribe from updates
   */
  unsubscribe(type, callback) {
    if (this.listeners.has(type)) {
      this.listeners.get(type).delete(callback)
      
      if (this.listeners.get(type).size === 0) {
        this.listeners.delete(type)
        this.subscriptions.delete(type)
        
        // Send unsubscribe message to server
        this.send({
          type: 'unsubscribe',
          channel: type,
          timestamp: new Date().toISOString()
        })
      }
    }
  }

  /**
   * Handle incoming messages
   */
  handleMessage(event) {
    try {
      const message = JSON.parse(event.data)
      
      // Handle heartbeat response
      if (message.type === 'pong') {
        return
      }

      // Handle error messages
      if (message.type === 'error') {
        console.error('WebSocket server error:', message.error)
        return
      }

      // Dispatch to listeners
      if (this.listeners.has(message.type)) {
        this.listeners.get(message.type).forEach(callback => {
          try {
            callback(message.data)
          } catch (error) {
            console.error('Error in WebSocket listener:', error)
          }
        })
      }

    } catch (error) {
      console.error('Failed to parse WebSocket message:', error)
    }
  }

  /**
   * Handle reconnection logic
   */
  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max WebSocket reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    
    console.log(`🔌 Attempting WebSocket reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`)
    
    setTimeout(() => {
      // Get current auth token
      const token = localStorage.getItem(API_CONFIG.AUTH.TOKEN_KEY)
      if (token) {
        this.connect(token).catch(error => {
          console.error('WebSocket reconnection failed:', error)
        })
      }
    }, delay)
  }

  /**
   * Start heartbeat to keep connection alive
   */
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.send({ type: 'ping', timestamp: new Date().toISOString() })
      }
    }, 30000) // Send ping every 30 seconds
  }

  /**
   * Stop heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  /**
   * Flush queued messages
   */
  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()
      this.send(message)
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      subscriptions: Array.from(this.subscriptions),
      queuedMessages: this.messageQueue.length
    }
  }

  // Real-time update methods for specific features

  /**
   * Subscribe to asset updates
   */
  subscribeToAssetUpdates(callback) {
    return this.subscribe('asset_update', callback)
  }

  /**
   * Subscribe to task updates
   */
  subscribeToTaskUpdates(callback) {
    return this.subscribe('task_update', callback)
  }

  /**
   * Subscribe to notification updates
   */
  subscribeToNotificationUpdates(callback) {
    return this.subscribe('notification_update', callback)
  }

  /**
   * Subscribe to user activity updates
   */
  subscribeToUserActivity(callback) {
    return this.subscribe('user_activity', callback)
  }

  /**
   * Subscribe to system alerts
   */
  subscribeToSystemAlerts(callback) {
    return this.subscribe('system_alert', callback)
  }

  /**
   * Broadcast asset update
   */
  broadcastAssetUpdate(asset) {
    this.send({
      type: 'asset_update',
      data: asset,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Broadcast task update
   */
  broadcastTaskUpdate(task) {
    this.send({
      type: 'task_update',
      data: task,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Broadcast notification
   */
  broadcastNotification(notification) {
    this.send({
      type: 'notification_update',
      data: notification,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Join a room for collaborative features
   */
  joinRoom(roomId) {
    this.send({
      type: 'join_room',
      roomId,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Leave a room
   */
  leaveRoom(roomId) {
    this.send({
      type: 'leave_room',
      roomId,
      timestamp: new Date().toISOString()
    })
  }
}

// Create singleton instance
const websocketService = new WebSocketService()

// Mock WebSocket for development/testing
class MockWebSocketService {
  constructor() {
    this.isConnected = false
    this.listeners = new Map()
    this.subscriptions = new Set()
  }

  connect() {
    console.log('🔌 Mock WebSocket connected')
    this.isConnected = true
    return Promise.resolve()
  }

  disconnect() {
    console.log('🔌 Mock WebSocket disconnected')
    this.isConnected = false
  }

  send(message) {
    console.log('📤 Mock WebSocket message:', message)
    return true
  }

  subscribe(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    this.listeners.get(type).add(callback)
    this.subscriptions.add(type)
    
    console.log(`📡 Mock WebSocket subscribed to: ${type}`)
    
    return () => this.unsubscribe(type, callback)
  }

  unsubscribe(type, callback) {
    if (this.listeners.has(type)) {
      this.listeners.get(type).delete(callback)
      console.log(`📡 Mock WebSocket unsubscribed from: ${type}`)
    }
  }

  getStatus() {
    return {
      connected: this.isConnected,
      reconnectAttempts: 0,
      subscriptions: Array.from(this.subscriptions),
      queuedMessages: 0
    }
  }

  // Mock versions of subscription methods
  subscribeToAssetUpdates(callback) { return this.subscribe('asset_update', callback) }
  subscribeToTaskUpdates(callback) { return this.subscribe('task_update', callback) }
  subscribeToNotificationUpdates(callback) { return this.subscribe('notification_update', callback) }
  subscribeToUserActivity(callback) { return this.subscribe('user_activity', callback) }
  subscribeToSystemAlerts(callback) { return this.subscribe('system_alert', callback) }
  broadcastAssetUpdate(asset) { this.send({ type: 'asset_update', data: asset }) }
  broadcastTaskUpdate(task) { this.send({ type: 'task_update', data: task }) }
  broadcastNotification(notification) { this.send({ type: 'notification_update', data: notification }) }
  joinRoom(roomId) { this.send({ type: 'join_room', roomId }) }
  leaveRoom(roomId) { this.send({ type: 'leave_room', roomId }) }
}

// Export the appropriate service based on configuration
export default API_CONFIG.FEATURES.REAL_TIME && !API_CONFIG.USE_MOCK_API 
  ? websocketService 
  : new MockWebSocketService()

export { WebSocketService, MockWebSocketService }