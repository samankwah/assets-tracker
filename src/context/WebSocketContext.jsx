import React, { createContext, useContext, useEffect, useState } from 'react';
import websocketService from '../services/websocketService';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastActivity, setLastActivity] = useState(null);

  useEffect(() => {
    if (user) {
      initializeWebSocket();
    } else {
      disconnectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [user]);

  const initializeWebSocket = async () => {
    try {
      setConnectionStatus('connecting');
      
      // Set up event listeners
      websocketService.on('connected', handleConnected);
      websocketService.on('disconnected', handleDisconnected);
      websocketService.on('error', handleError);
      websocketService.on('assetUpdated', handleAssetUpdated);
      websocketService.on('taskUpdated', handleTaskUpdated);
      websocketService.on('taskCreated', handleTaskCreated);
      websocketService.on('taskCompleted', handleTaskCompleted);
      websocketService.on('calendarEventCreated', handleCalendarEventCreated);
      websocketService.on('calendarEventUpdated', handleCalendarEventUpdated);
      websocketService.on('notification', handleNotification);
      websocketService.on('userActivity', handleUserActivity);
      websocketService.on('inspectionScheduled', handleInspectionScheduled);
      websocketService.on('maintenanceAlert', handleMaintenanceAlert);
      websocketService.on('collaborationUpdate', handleCollaborationUpdate);
      websocketService.on('documentUploaded', handleDocumentUploaded);
      websocketService.on('phaseTransition', handlePhaseTransition);

      // Connect to WebSocket
      await websocketService.connect(user?.id || 'anonymous');
      
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      setConnectionStatus('error');
      toast.error('Failed to establish real-time connection');
    }
  };

  const disconnectWebSocket = () => {
    websocketService.disconnect();
    setIsConnected(false);
    setConnectionStatus('disconnected');
  };

  // Event handlers
  const handleConnected = () => {
    setIsConnected(true);
    setConnectionStatus('connected');
    console.log('🟢 WebSocket connected successfully');
    
    // Subscribe to relevant channels
    websocketService.subscribe('dashboard_updates');
    websocketService.subscribe('analytics_updates');
    websocketService.subscribe('notifications');
    websocketService.subscribe('assets');
    websocketService.subscribe('tasks');
    websocketService.subscribe('calendar');
    
    toast.success('Real-time connection established', { duration: 2000 });
  };

  const handleDisconnected = (data) => {
    setIsConnected(false);
    setConnectionStatus('disconnected');
    console.log('🔴 WebSocket disconnected:', data);
    
    if (data?.code !== 1000) {
      toast.error('Real-time connection lost', { duration: 3000 });
    }
  };

  const handleError = (error) => {
    console.error('WebSocket error:', error);
    setConnectionStatus('error');
    toast.error('Real-time connection error');
  };

  const handleAssetUpdated = (data) => {
    console.log('Asset updated:', data);
    setLastActivity({ type: 'asset_updated', data, timestamp: new Date() });
    toast.success(`Asset "${data.assetId}" was updated`, { duration: 3000 });
  };

  const handleTaskUpdated = (data) => {
    console.log('Task updated:', data);
    setLastActivity({ type: 'task_updated', data, timestamp: new Date() });
    toast.success(`Task updated by ${data.userId}`, { duration: 3000 });
  };

  const handleTaskCreated = (data) => {
    console.log('Task created:', data);
    setLastActivity({ type: 'task_created', data, timestamp: new Date() });
    toast.success(`New task created: ${data.title}`, { duration: 3000 });
  };

  const handleTaskCompleted = (data) => {
    console.log('Task completed:', data);
    setLastActivity({ type: 'task_completed', data, timestamp: new Date() });
    toast.success(`Task completed: ${data.taskId}`, { duration: 3000 });
  };

  const handleCalendarEventCreated = (data) => {
    console.log('Calendar event created:', data);
    setLastActivity({ type: 'calendar_event_created', data, timestamp: new Date() });
    toast.success(`New event scheduled: ${data.title}`, { duration: 3000 });
  };

  const handleCalendarEventUpdated = (data) => {
    console.log('Calendar event updated:', data);
    setLastActivity({ type: 'calendar_event_updated', data, timestamp: new Date() });
    toast.success(`Event updated: ${data.title}`, { duration: 3000 });
  };

  const handleNotification = (data) => {
    console.log('Notification received:', data);
    setLastActivity({ type: 'notification', data, timestamp: new Date() });
    
    // Show toast notification
    const { type, title, message } = data;
    switch (type) {
      case 'success':
        toast.success(`${title}: ${message}`, { duration: 4000 });
        break;
      case 'warning':
        toast.error(`${title}: ${message}`, { duration: 5000 });
        break;
      case 'info':
        toast(`${title}: ${message}`, { duration: 4000 });
        break;
      default:
        toast(message || title, { duration: 3000 });
    }
  };

  const handleUserActivity = (data) => {
    console.log('User activity:', data);
    setLastActivity({ type: 'user_activity', data, timestamp: new Date() });
  };

  const handleInspectionScheduled = (data) => {
    console.log('Inspection scheduled:', data);
    setLastActivity({ type: 'inspection_scheduled', data, timestamp: new Date() });
    toast.success(`Inspection scheduled for ${data.assetName}`, { duration: 4000 });
  };

  const handleMaintenanceAlert = (data) => {
    console.log('Maintenance alert:', data);
    setLastActivity({ type: 'maintenance_alert', data, timestamp: new Date() });
    toast.error(`Maintenance Alert: ${data.message}`, { duration: 5000 });
  };

  const handleCollaborationUpdate = (data) => {
    console.log('Collaboration update:', data);
    setLastActivity({ type: 'collaboration_update', data, timestamp: new Date() });
    
    if (data.action === 'user_joined') {
      toast.success(`${data.userId} joined the collaboration`, { duration: 3000 });
    } else if (data.action === 'user_left') {
      toast(`${data.userId} left the collaboration`, { duration: 3000 });
    }
  };

  const handleDocumentUploaded = (data) => {
    console.log('Document uploaded:', data);
    setLastActivity({ type: 'document_uploaded', data, timestamp: new Date() });
    toast.success(`Document uploaded: ${data.fileName}`, { duration: 3000 });
  };

  const handlePhaseTransition = (data) => {
    console.log('Phase transition:', data);
    setLastActivity({ type: 'phase_transition', data, timestamp: new Date() });
    toast.success(`Asset moved to ${data.newPhase} phase`, { duration: 4000 });
  };

  // Public API methods
  const broadcastAssetUpdate = (assetId, changes) => {
    if (isConnected) {
      websocketService.broadcastAssetUpdate(assetId, changes);
    }
  };

  const broadcastTaskUpdate = (taskId, changes) => {
    if (isConnected) {
      websocketService.broadcastTaskUpdate(taskId, changes);
    }
  };

  const broadcastTaskCompletion = (taskId, completionData) => {
    if (isConnected) {
      websocketService.broadcastTaskCompletion(taskId, completionData);
    }
  };

  const broadcastCalendarEvent = (eventData) => {
    if (isConnected) {
      websocketService.broadcastCalendarEvent(eventData);
    }
  };

  const broadcastNotification = (notification) => {
    if (isConnected) {
      websocketService.broadcastNotification(notification);
    }
  };

  const joinCollaborationSession = (sessionId) => {
    if (isConnected) {
      websocketService.joinCollaborationSession(sessionId);
    }
  };

  const leaveCollaborationSession = (sessionId) => {
    if (isConnected) {
      websocketService.leaveCollaborationSession(sessionId);
    }
  };

  const sendCollaborationUpdate = (sessionId, update) => {
    if (isConnected) {
      websocketService.sendCollaborationUpdate(sessionId, update);
    }
  };

  const updateUserActivity = (activity) => {
    if (isConnected) {
      websocketService.updateUserActivity(activity);
    }
  };

  const subscribe = (channel) => {
    if (isConnected) {
      websocketService.subscribe(channel);
    }
  };

  const unsubscribe = (channel) => {
    if (isConnected) {
      websocketService.unsubscribe(channel);
    }
  };

  const getConnectionStatus = () => {
    return {
      isConnected,
      status: connectionStatus,
      lastActivity,
      wsStatus: websocketService.getStatus()
    };
  };

  const value = {
    isConnected,
    connectionStatus,
    lastActivity,
    broadcastAssetUpdate,
    broadcastTaskUpdate,
    broadcastTaskCompletion,
    broadcastCalendarEvent,
    broadcastNotification,
    joinCollaborationSession,
    leaveCollaborationSession,
    sendCollaborationUpdate,
    updateUserActivity,
    subscribe,
    unsubscribe,
    getConnectionStatus,
    reconnect: initializeWebSocket,
    disconnect: disconnectWebSocket
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};