/**
 * WebSocket Service for Real-time Updates
 * Handles real-time communication between clients and server
 */

import { API_CONFIG } from '../config/apiConfig';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
    this.isConnecting = false;
    this.isConnected = false;
    this.heartbeatInterval = null;
    this.messageQueue = [];
    this.userId = null;
    this.subscriptions = new Set();
  }

  /**
   * Initialize WebSocket connection
   */
  connect(userId = null) {
    if (this.isConnecting || this.isConnected) {
      return Promise.resolve();
    }

    this.userId = userId;
    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      try {
        const wsUrl = API_CONFIG.REALTIME.WEBSOCKET_URL || 'ws://localhost:3001';
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('🔗 WebSocket connected');
          this.isConnected = true;
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          
          // Start heartbeat
          this.startHeartbeat();
          
          // Send authentication if userId is provided
          if (this.userId) {
            this.send('authenticate', { userId: this.userId });
          }
          
          // Process queued messages
          this.processMessageQueue();
          
          // Emit connection event
          this.emit('connected');
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('🔌 WebSocket disconnected', event.code, event.reason);
          this.isConnected = false;
          this.isConnecting = false;
          this.stopHeartbeat();
          
          // Emit disconnection event
          this.emit('disconnected', { code: event.code, reason: event.reason });
          
          // Attempt to reconnect if not intentionally closed
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          this.emit('error', error);
          
          if (this.isConnecting) {
            reject(error);
          }
        };

      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting');
      this.ws = null;
    }
    this.stopHeartbeat();
    this.isConnected = false;
    this.isConnecting = false;
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
  }

  /**
   * Send message through WebSocket
   */
  send(type, data = {}) {
    const message = {
      type,
      data,
      timestamp: new Date().toISOString(),
      id: this.generateMessageId()
    };

    if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue message for later
      this.messageQueue.push(message);
    }
  }

  /**
   * Subscribe to real-time updates for a specific channel
   */
  subscribe(channel) {
    this.subscriptions.add(channel);
    this.send('subscribe', { channel });
  }

  /**
   * Unsubscribe from a channel
   */
  unsubscribe(channel) {
    this.subscriptions.delete(channel);
    this.send('unsubscribe', { channel });
  }

  /**
   * Add event listener
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to listeners
   */
  emit(event, data = null) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Handle incoming WebSocket message
   */
  handleMessage(message) {
    const { type, data } = message;

    switch (type) {
      case 'heartbeat':
        this.send('heartbeat_ack');
        break;

      case 'asset_updated':
        this.emit('assetUpdated', data);
        break;

      case 'task_updated':
        this.emit('taskUpdated', data);
        break;

      case 'task_created':
        this.emit('taskCreated', data);
        break;

      case 'task_completed':
        this.emit('taskCompleted', data);
        break;

      case 'calendar_event_created':
        this.emit('calendarEventCreated', data);
        break;

      case 'calendar_event_updated':
        this.emit('calendarEventUpdated', data);
        break;

      case 'notification':
        this.emit('notification', data);
        break;

      case 'user_activity':
        this.emit('userActivity', data);
        break;

      case 'inspection_scheduled':
        this.emit('inspectionScheduled', data);
        break;

      case 'maintenance_alert':
        this.emit('maintenanceAlert', data);
        break;

      case 'collaboration_update':
        this.emit('collaborationUpdate', data);
        break;

      case 'document_uploaded':
        this.emit('documentUploaded', data);
        break;

      case 'phase_transition':
        this.emit('phaseTransition', data);
        break;

      default:
        console.log('Unknown WebSocket message type:', type);
        this.emit('message', message);
    }
  }

  /**
   * Schedule reconnection attempt
   */
  scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`⏰ Scheduling WebSocket reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      if (!this.isConnected && this.reconnectAttempts <= this.maxReconnectAttempts) {
        console.log(`🔄 Attempting WebSocket reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect(this.userId);
      }
    }, delay);
  }

  /**
   * Start heartbeat to keep connection alive
   */
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.send('heartbeat');
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  /**
   * Stop heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Process queued messages
   */
  processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Generate unique message ID
   */
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts,
      subscriptions: Array.from(this.subscriptions)
    };
  }

  /**
   * Real-time asset operations
   */
  broadcastAssetUpdate(assetId, changes) {
    this.send('asset_update', {
      assetId,
      changes,
      userId: this.userId,
      timestamp: new Date().toISOString()
    });
  }

  broadcastTaskUpdate(taskId, changes) {
    this.send('task_update', {
      taskId,
      changes,
      userId: this.userId,
      timestamp: new Date().toISOString()
    });
  }

  broadcastTaskCompletion(taskId, completionData) {
    this.send('task_completion', {
      taskId,
      completionData,
      userId: this.userId,
      timestamp: new Date().toISOString()
    });
  }

  broadcastCalendarEvent(eventData) {
    this.send('calendar_event', {
      eventData,
      userId: this.userId,
      timestamp: new Date().toISOString()
    });
  }

  broadcastNotification(notification) {
    this.send('notification_broadcast', {
      notification,
      userId: this.userId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Team collaboration features
   */
  joinCollaborationSession(sessionId) {
    this.send('join_collaboration', {
      sessionId,
      userId: this.userId
    });
  }

  leaveCollaborationSession(sessionId) {
    this.send('leave_collaboration', {
      sessionId,
      userId: this.userId
    });
  }

  sendCollaborationUpdate(sessionId, update) {
    this.send('collaboration_update', {
      sessionId,
      update,
      userId: this.userId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Live user activity tracking
   */
  updateUserActivity(activity) {
    this.send('user_activity', {
      activity,
      userId: this.userId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Request live dashboard updates
   */
  requestDashboardUpdates() {
    this.subscribe('dashboard_updates');
  }

  /**
   * Request real-time analytics updates
   */
  requestAnalyticsUpdates() {
    this.subscribe('analytics_updates');
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;