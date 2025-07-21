import React, { useState } from 'react';
import { Wifi, WifiOff, AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { useWebSocket } from '../../context/WebSocketContext';
import { format } from 'date-fns';

const ConnectionStatus = () => {
  const { isConnected, connectionStatus, lastActivity, getConnectionStatus, reconnect } = useWebSocket();
  const [showDetails, setShowDetails] = useState(false);

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'connecting':
        return <RefreshCw className="w-4 h-4 text-yellow-600 animate-spin" />;
      case 'disconnected':
        return <WifiOff className="w-4 h-4 text-gray-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Wifi className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Real-time';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Offline';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'connecting':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'disconnected':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const connectionDetails = getConnectionStatus();

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center space-x-2 px-3 py-1 text-sm border rounded-lg transition-colors ${getStatusColor()}`}
        title={`WebSocket Status: ${getStatusText()}`}
      >
        {getStatusIcon()}
        <span className="hidden sm:inline">{getStatusText()}</span>
      </button>

      {showDetails && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Real-time Connection</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            {/* Connection Status */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                <div className="flex items-center space-x-2">
                  {getStatusIcon()}
                  <span className={`text-sm font-medium ${getStatusText() === 'Real-time' ? 'text-green-600' : getStatusText() === 'Error' ? 'text-red-600' : 'text-gray-600'}`}>
                    {getStatusText()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Connection</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {isConnected ? 'Active' : 'Inactive'}
                </span>
              </div>

              {connectionDetails.wsStatus && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Subscriptions</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {connectionDetails.wsStatus.subscriptions?.length || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Reconnect Attempts</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {connectionDetails.wsStatus.reconnectAttempts || 0}
                    </span>
                  </div>
                </>
              )}

              {lastActivity && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Last Activity</span>
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Type:</span>
                      <span className="text-gray-900 dark:text-white capitalize">
                        {lastActivity.type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Time:</span>
                      <span className="text-gray-900 dark:text-white">
                        {format(lastActivity.timestamp, 'HH:mm:ss')}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Active Subscriptions */}
              {connectionDetails.wsStatus?.subscriptions && connectionDetails.wsStatus.subscriptions.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Wifi className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Active Channels</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {connectionDetails.wsStatus.subscriptions.map((channel, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded"
                      >
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
                {!isConnected && (
                  <button
                    onClick={reconnect}
                    className="w-full btn-primary text-sm py-2"
                    disabled={connectionStatus === 'connecting'}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${connectionStatus === 'connecting' ? 'animate-spin' : ''}`} />
                    {connectionStatus === 'connecting' ? 'Connecting...' : 'Reconnect'}
                  </button>
                )}

                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Real-time updates for assets, tasks, and notifications
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;