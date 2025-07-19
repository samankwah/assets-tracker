import React, { useState, useEffect } from 'react'
import {
  Calendar,
  Link,
  Unlink,
  Settings,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Zap,
  Shield,
  Download,
  Upload,
  Sync,
  X,
  Plus,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  RotateCcw
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import externalCalendarService from '../../services/externalCalendarService'
import { useCalendarStore } from '../../stores/calendarStore'

const ExternalCalendarSync = () => {
  const [connectedAccounts, setConnectedAccounts] = useState([])
  const [availableProviders, setAvailableProviders] = useState([])
  const [syncStatus, setSyncStatus] = useState([])
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [testing, setTesting] = useState(new Set())
  const [syncSettings, setSyncSettings] = useState({})

  const { getCalendarEvents } = useCalendarStore()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setConnectedAccounts(externalCalendarService.getConnectedAccounts())
    setAvailableProviders(externalCalendarService.getAvailableProviders())
    setSyncStatus(externalCalendarService.getSyncStatus())
  }

  const handleConnect = async (provider) => {
    try {
      // In a real app, this would open OAuth flow
      const redirectUri = `${window.location.origin}/calendar/oauth`
      const authUrl = externalCalendarService.getAuthUrl(provider, redirectUri)
      
      // For demo, simulate OAuth flow
      const mockAuthCode = `mock_auth_code_${provider}_${Date.now()}`
      const connection = await externalCalendarService.connectProvider(provider, mockAuthCode, redirectUri)
      
      toast.success(`Successfully connected to ${connection.providerName}`)
      setShowConnectModal(false)
      loadData()
    } catch (error) {
      console.error('Connection failed:', error)
      toast.error(`Failed to connect: ${error.message}`)
    }
  }

  const handleDisconnect = async (accountId) => {
    try {
      await externalCalendarService.disconnectProvider(accountId)
      toast.success('Account disconnected successfully')
      loadData()
    } catch (error) {
      console.error('Disconnect failed:', error)
      toast.error(`Failed to disconnect: ${error.message}`)
    }
  }

  const handleTestConnection = async (accountId) => {
    setTesting(prev => new Set([...prev, accountId]))
    
    try {
      const result = await externalCalendarService.testConnection(accountId)
      
      if (result.success) {
        toast.success(`Connection test successful (${result.responseTime}ms)`)
      } else {
        toast.error(`Connection test failed: ${result.error}`)
      }
    } catch (error) {
      toast.error('Connection test failed')
    } finally {
      setTesting(prev => {
        const newSet = new Set(prev)
        newSet.delete(accountId)
        return newSet
      })
    }
  }

  const handleSync = async (accountId, direction = 'bidirectional') => {
    setSyncing(true)
    
    try {
      const localEvents = getCalendarEvents()
      let result

      switch (direction) {
        case 'push':
          result = await externalCalendarService.pushEventsToProvider(accountId, localEvents)
          break
        case 'pull':
          result = await externalCalendarService.pullEventsFromProvider(accountId)
          break
        case 'bidirectional':
          result = await externalCalendarService.syncBidirectional(accountId, localEvents)
          break
        default:
          throw new Error('Invalid sync direction')
      }

      if (result.success) {
        let message = 'Sync completed successfully'
        if (result.pulled) message += `. Pulled ${result.pulled} events`
        if (result.pushed) message += `. Pushed ${result.pushed} events`
        if (result.conflicts) message += `. ${result.conflicts} conflicts detected`
        
        toast.success(message)
        
        if (result.needsResolution) {
          toast.warning('Some conflicts need manual resolution')
        }
      } else {
        toast.error(`Sync failed: ${result.reason}`)
      }
    } catch (error) {
      console.error('Sync failed:', error)
      toast.error(`Sync failed: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const handleUpdateSettings = async (accountId, newSettings) => {
    try {
      await externalCalendarService.updateSyncSettings(accountId, newSettings)
      toast.success('Settings updated successfully')
      setShowSettingsModal(false)
      loadData()
    } catch (error) {
      console.error('Settings update failed:', error)
      toast.error(`Failed to update settings: ${error.message}`)
    }
  }

  const ProviderIcon = ({ provider, className = "w-6 h-6" }) => {
    const icons = {
      google: (
        <div className={`${className} bg-blue-500 rounded flex items-center justify-center text-white font-bold text-xs`}>
          G
        </div>
      ),
      outlook: (
        <div className={`${className} bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs`}>
          M
        </div>
      ),
      apple: (
        <div className={`${className} bg-gray-800 rounded flex items-center justify-center text-white font-bold text-xs`}>
          A
        </div>
      )
    }
    
    return icons[provider] || <Calendar className={className} />
  }

  const SyncStatusBadge = ({ status }) => {
    const configs = {
      active: { color: 'green', icon: CheckCircle, text: 'Connected' },
      error: { color: 'red', icon: AlertCircle, text: 'Error' },
      syncing: { color: 'blue', icon: RefreshCw, text: 'Syncing' },
      paused: { color: 'yellow', icon: Clock, text: 'Paused' }
    }
    
    const config = configs[status] || configs.active
    const Icon = config.icon
    
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full space-x-1 bg-${config.color}-100 text-${config.color}-800 dark:bg-${config.color}-900/30 dark:text-${config.color}-400`}>
        <Icon className="w-3 h-3" />
        <span>{config.text}</span>
      </span>
    )
  }

  const AccountCard = ({ account, status }) => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <ProviderIcon provider={account.provider} />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {account.providerName}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {account.email}
            </p>
          </div>
        </div>
        <SyncStatusBadge status={status?.syncEnabled ? 'active' : 'paused'} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-gray-600 dark:text-gray-400">Sync Direction:</span>
          <div className="font-medium text-gray-900 dark:text-white mt-1">
            {status?.syncDirection === 'bidirectional' && (
              <div className="flex items-center space-x-1">
                <ArrowLeft className="w-3 h-3" />
                <ArrowRight className="w-3 h-3" />
                <span>Bidirectional</span>
              </div>
            )}
            {status?.syncDirection === 'push' && (
              <div className="flex items-center space-x-1">
                <Upload className="w-3 h-3" />
                <span>Push Only</span>
              </div>
            )}
            {status?.syncDirection === 'pull' && (
              <div className="flex items-center space-x-1">
                <Download className="w-3 h-3" />
                <span>Pull Only</span>
              </div>
            )}
          </div>
        </div>
        <div>
          <span className="text-gray-600 dark:text-gray-400">Calendars:</span>
          <div className="font-medium text-gray-900 dark:text-white mt-1">
            {status?.selectedCalendars} of {status?.totalCalendars}
          </div>
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => handleSync(account.id, 'bidirectional')}
          disabled={syncing}
          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 transition-colors text-sm flex items-center justify-center space-x-2"
        >
          {syncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sync className="w-4 h-4" />}
          <span>Sync</span>
        </button>
        
        <button
          onClick={() => {
            setSelectedAccount(account)
            setSyncSettings(externalCalendarService.getSyncSettings(account.id))
            setShowSettingsModal(true)
          }}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
        >
          <Settings className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => handleTestConnection(account.id)}
          disabled={testing.has(account.id)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
        >
          {testing.has(account.id) ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Shield className="w-4 h-4" />
          )}
        </button>
        
        <button
          onClick={() => handleDisconnect(account.id)}
          className="px-3 py-2 text-red-600 border border-red-300 dark:border-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm"
        >
          <Unlink className="w-4 h-4" />
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            External Calendar Sync
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Connect and sync with external calendar providers
          </p>
        </div>
        
        <button
          onClick={() => setShowConnectModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Connect Calendar</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Connected</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {connectedAccounts.length}
              </p>
            </div>
            <Link className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Syncs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {syncStatus.filter(s => s.syncEnabled).length}
              </p>
            </div>
            <Sync className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Calendars</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {syncStatus.reduce((sum, s) => sum + s.totalCalendars, 0)}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Last Sync</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {syncStatus.some(s => s.lastSync) ? 'Recent' : 'Never'}
              </p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Connected Accounts */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Connected Accounts
        </h2>
        
        {connectedAccounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {connectedAccounts.map(account => {
              const status = syncStatus.find(s => s.accountId === account.id)
              return (
                <AccountCard key={account.id} account={account} status={status} />
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No connected accounts
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Connect your external calendars to sync events automatically
            </p>
            <button
              onClick={() => setShowConnectModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Connect Your First Calendar
            </button>
          </div>
        )}
      </div>

      {/* Connect Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Connect Calendar
                </h2>
                <button
                  onClick={() => setShowConnectModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {availableProviders.filter(p => !p.isConnected).map(provider => (
                  <button
                    key={provider.id}
                    onClick={() => handleConnect(provider.id)}
                    className="w-full flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                  >
                    <ProviderIcon provider={provider.id} />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {provider.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Sync events with {provider.name}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
                  </button>
                ))}
                
                {availableProviders.every(p => p.isConnected) && (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      All available providers are already connected
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && selectedAccount && syncSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Sync Settings - {selectedAccount.providerName}
                </h2>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Enable Sync */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Enable Sync
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Automatically sync events with this calendar
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={syncSettings.syncEnabled}
                      onChange={(e) => setSyncSettings(prev => ({ ...prev, syncEnabled: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Sync Direction */}
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                    Sync Direction
                  </h3>
                  <div className="space-y-2">
                    {[
                      { value: 'bidirectional', label: 'Bidirectional', desc: 'Sync events both ways' },
                      { value: 'push', label: 'Push Only', desc: 'Send events to external calendar' },
                      { value: 'pull', label: 'Pull Only', desc: 'Import events from external calendar' }
                    ].map(option => (
                      <label key={option.value} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                        <input
                          type="radio"
                          name="syncDirection"
                          value={option.value}
                          checked={syncSettings.syncDirection === option.value}
                          onChange={(e) => setSyncSettings(prev => ({ ...prev, syncDirection: e.target.value }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {option.label}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {option.desc}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sync Categories */}
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                    Event Categories to Sync
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {['Inspection', 'Maintenance', 'Meeting', 'Emergency', 'Task'].map(category => (
                      <label key={category} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={syncSettings.syncCategories?.includes(category)}
                          onChange={(e) => {
                            const categories = syncSettings.syncCategories || []
                            if (e.target.checked) {
                              setSyncSettings(prev => ({
                                ...prev,
                                syncCategories: [...categories, category]
                              }))
                            } else {
                              setSyncSettings(prev => ({
                                ...prev,
                                syncCategories: categories.filter(c => c !== category)
                              }))
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {category}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleUpdateSettings(selectedAccount.id, syncSettings)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Settings
                  </button>
                  <button
                    onClick={() => setShowSettingsModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExternalCalendarSync