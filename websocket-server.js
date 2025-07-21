/**
 * WebSocket Server for Asset Tracker Real-time Features
 */

import { createServer } from 'http';
import { WebSocketServer } from 'ws';

const port = 3001;
const server = createServer();
const wss = new WebSocketServer({ server });

// Store connected clients and their subscriptions
const clients = new Map();
const subscriptions = new Map();

console.log('🚀 Starting WebSocket server...');

wss.on('connection', (ws, request) => {
  const clientId = generateClientId();
  console.log(`🔗 Client connected: ${clientId}`);
  
  // Initialize client
  clients.set(clientId, {
    ws,
    subscriptions: new Set(),
    userId: null,
    isAuthenticated: false,
    lastHeartbeat: Date.now()
  });

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connected',
    data: { clientId, timestamp: new Date().toISOString() }
  }));

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      handleMessage(clientId, message);
    } catch (error) {
      console.error('Error parsing message:', error);
      sendError(clientId, 'Invalid message format');
    }
  });

  ws.on('close', (code, reason) => {
    console.log(`🔌 Client disconnected: ${clientId} (${code}: ${reason})`);
    cleanup(clientId);
  });

  ws.on('error', (error) => {
    console.error(`❌ WebSocket error for ${clientId}:`, error);
    cleanup(clientId);
  });

  // Start heartbeat for this client
  startHeartbeat(clientId);
});

function handleMessage(clientId, message) {
  const client = clients.get(clientId);
  if (!client) return;

  const { type, data } = message;

  switch (type) {
    case 'authenticate':
      handleAuthentication(clientId, data);
      break;

    case 'subscribe':
      handleSubscription(clientId, data.channel);
      break;

    case 'unsubscribe':
      handleUnsubscription(clientId, data.channel);
      break;

    case 'heartbeat':
      handleHeartbeat(clientId);
      break;

    case 'heartbeat_ack':
      client.lastHeartbeat = Date.now();
      break;

    // Asset operations
    case 'asset_update':
      broadcastToSubscribers('assets', {
        type: 'asset_updated',
        data: data
      });
      break;

    // Task operations
    case 'task_update':
      broadcastToSubscribers('tasks', {
        type: 'task_updated',
        data: data
      });
      break;

    case 'task_completion':
      broadcastToSubscribers('tasks', {
        type: 'task_completed',
        data: data
      });
      break;

    // Calendar operations
    case 'calendar_event':
      broadcastToSubscribers('calendar', {
        type: 'calendar_event_created',
        data: data
      });
      break;

    // Notifications
    case 'notification_broadcast':
      broadcastToSubscribers('notifications', {
        type: 'notification',
        data: data.notification
      });
      break;

    // Collaboration
    case 'join_collaboration':
      handleCollaborationJoin(clientId, data);
      break;

    case 'leave_collaboration':
      handleCollaborationLeave(clientId, data);
      break;

    case 'collaboration_update':
      broadcastCollaborationUpdate(data);
      break;

    // User activity
    case 'user_activity':
      broadcastToSubscribers('user_activity', {
        type: 'user_activity',
        data: data
      });
      break;

    default:
      console.log(`Unknown message type: ${type}`);
  }
}

function handleAuthentication(clientId, data) {
  const client = clients.get(clientId);
  if (!client) return;

  client.userId = data.userId;
  client.isAuthenticated = true;

  sendMessage(clientId, {
    type: 'authenticated',
    data: { userId: data.userId, timestamp: new Date().toISOString() }
  });

  console.log(`✅ Client ${clientId} authenticated as user ${data.userId}`);
}

function handleSubscription(clientId, channel) {
  const client = clients.get(clientId);
  if (!client) return;

  client.subscriptions.add(channel);
  
  if (!subscriptions.has(channel)) {
    subscriptions.set(channel, new Set());
  }
  subscriptions.get(channel).add(clientId);

  sendMessage(clientId, {
    type: 'subscribed',
    data: { channel, timestamp: new Date().toISOString() }
  });

  console.log(`📡 Client ${clientId} subscribed to ${channel}`);
}

function handleUnsubscription(clientId, channel) {
  const client = clients.get(clientId);
  if (!client) return;

  client.subscriptions.delete(channel);
  
  if (subscriptions.has(channel)) {
    subscriptions.get(channel).delete(clientId);
    if (subscriptions.get(channel).size === 0) {
      subscriptions.delete(channel);
    }
  }

  sendMessage(clientId, {
    type: 'unsubscribed',
    data: { channel, timestamp: new Date().toISOString() }
  });

  console.log(`📡 Client ${clientId} unsubscribed from ${channel}`);
}

function handleHeartbeat(clientId) {
  const client = clients.get(clientId);
  if (!client) return;

  client.lastHeartbeat = Date.now();
  sendMessage(clientId, {
    type: 'heartbeat',
    data: { timestamp: new Date().toISOString() }
  });
}

function handleCollaborationJoin(clientId, data) {
  const { sessionId } = data;
  handleSubscription(clientId, `collaboration_${sessionId}`);
  
  broadcastToSubscribers(`collaboration_${sessionId}`, {
    type: 'collaboration_update',
    data: {
      action: 'user_joined',
      sessionId,
      userId: clients.get(clientId)?.userId,
      timestamp: new Date().toISOString()
    }
  });
}

function handleCollaborationLeave(clientId, data) {
  const { sessionId } = data;
  handleUnsubscription(clientId, `collaboration_${sessionId}`);
  
  broadcastToSubscribers(`collaboration_${sessionId}`, {
    type: 'collaboration_update',
    data: {
      action: 'user_left',
      sessionId,
      userId: clients.get(clientId)?.userId,
      timestamp: new Date().toISOString()
    }
  });
}

function broadcastCollaborationUpdate(data) {
  const { sessionId } = data;
  broadcastToSubscribers(`collaboration_${sessionId}`, {
    type: 'collaboration_update',
    data: data
  });
}

function broadcastToSubscribers(channel, message) {
  const subscribers = subscriptions.get(channel);
  if (!subscribers) return;

  subscribers.forEach(clientId => {
    sendMessage(clientId, message);
  });

  console.log(`📢 Broadcasted ${message.type} to ${subscribers.size} subscribers on ${channel}`);
}

function sendMessage(clientId, message) {
  const client = clients.get(clientId);
  if (!client || client.ws.readyState !== client.ws.OPEN) return;

  try {
    client.ws.send(JSON.stringify({
      ...message,
      timestamp: message.timestamp || new Date().toISOString()
    }));
  } catch (error) {
    console.error(`Error sending message to ${clientId}:`, error);
    cleanup(clientId);
  }
}

function sendError(clientId, errorMessage) {
  sendMessage(clientId, {
    type: 'error',
    data: { message: errorMessage, timestamp: new Date().toISOString() }
  });
}

function startHeartbeat(clientId) {
  const interval = setInterval(() => {
    const client = clients.get(clientId);
    if (!client) {
      clearInterval(interval);
      return;
    }

    // Check if client is still alive
    const now = Date.now();
    if (now - client.lastHeartbeat > 60000) { // 60 seconds timeout
      console.log(`💔 Client ${clientId} timed out`);
      client.ws.terminate();
      cleanup(clientId);
      clearInterval(interval);
      return;
    }

    // Send heartbeat
    sendMessage(clientId, {
      type: 'heartbeat',
      data: { timestamp: new Date().toISOString() }
    });
  }, 30000); // Send heartbeat every 30 seconds
}

function cleanup(clientId) {
  const client = clients.get(clientId);
  if (!client) return;

  // Remove from all subscriptions
  client.subscriptions.forEach(channel => {
    if (subscriptions.has(channel)) {
      subscriptions.get(channel).delete(clientId);
      if (subscriptions.get(channel).size === 0) {
        subscriptions.delete(channel);
      }
    }
  });

  // Remove client
  clients.delete(clientId);
  console.log(`🧹 Cleaned up client ${clientId}`);
}

function generateClientId() {
  return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Periodic cleanup of dead connections
setInterval(() => {
  const now = Date.now();
  clients.forEach((client, clientId) => {
    if (now - client.lastHeartbeat > 120000) { // 2 minutes
      console.log(`🧹 Cleaning up inactive client ${clientId}`);
      client.ws.terminate();
      cleanup(clientId);
    }
  });
}, 60000); // Check every minute

// Demo: Send periodic updates for testing
setInterval(() => {
  // Send dashboard updates
  broadcastToSubscribers('dashboard_updates', {
    type: 'dashboard_update',
    data: {
      timestamp: new Date().toISOString(),
      stats: {
        activeUsers: clients.size,
        totalConnections: clients.size,
        uptime: process.uptime()
      }
    }
  });

  // Send analytics updates
  broadcastToSubscribers('analytics_updates', {
    type: 'analytics_update',
    data: {
      timestamp: new Date().toISOString(),
      metrics: {
        connectionsCount: clients.size,
        subscriptionsCount: subscriptions.size,
        uptimeSeconds: Math.floor(process.uptime())
      }
    }
  });
}, 30000); // Every 30 seconds

server.listen(port, () => {
  console.log(`🚀 WebSocket server running on port ${port}`);
  console.log(`📡 Ready to accept connections at ws://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔌 Shutting down WebSocket server...');
  
  // Close all client connections
  clients.forEach((client, clientId) => {
    client.ws.close(1000, 'Server shutting down');
  });
  
  // Close server
  server.close(() => {
    console.log('✅ WebSocket server closed');
    process.exit(0);
  });
});

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});