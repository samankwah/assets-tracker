import React, { useState, useEffect, useRef } from 'react'
import {
  Package,
  Play,
  Pause,
  Square,
  CheckCircle,
  AlertCircle,
  Clock,
  Trash2,
  Edit3,
  Users,
  Calendar,
  Download,
  Mail,
  Tag,
  Copy,
  BarChart3,
  History,
  Settings,
  X,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  FileText,
  Filter
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import bulkOperationsService from '../../services/bulkOperationsService'
import { useAssetStore } from '../../stores/assetStore'
import { useTaskStore } from '../../stores/taskStore'

const BulkOperationsManager = () => {
  const [selectedItems, setSelectedItems] = useState([])
  const [selectedOperation, setSelectedOperation] = useState('')
  const [operationOptions, setOperationOptions] = useState({})
  const [showOptionsModal, setShowOptionsModal] = useState(false)
  const [activeOperations, setActiveOperations] = useState([])
  const [operationHistory, setOperationHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [itemType, setItemType] = useState('assets') // 'assets' or 'tasks'
  const [selectedItemIds, setSelectedItemIds] = useState([])
  const [filterType, setFilterType] = useState('all')
  const [stats, setStats] = useState(null)

  const { assets } = useAssetStore()
  const { tasks } = useTaskStore()
  const intervalRef = useRef(null)

  const availableOperations = bulkOperationsService.getAvailableOperations()

  useEffect(() => {
    loadData()
    startPolling()
    bulkOperationsService.loadHistory()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const loadData = () => {
    setActiveOperations(bulkOperationsService.getActiveOperations())
    setOperationHistory(bulkOperationsService.getOperationHistory())
    setStats(bulkOperationsService.getOperationStats())
  }

  const startPolling = () => {
    intervalRef.current = setInterval(() => {
      setActiveOperations(bulkOperationsService.getActiveOperations())
    }, 1000)
  }

  const getFilteredItems = () => {
    const items = itemType === 'assets' ? assets : tasks
    
    if (filterType === 'all') {
      return items
    }
    
    return items.filter(item => {
      if (itemType === 'assets') {
        return item.status === filterType || item.condition === filterType
      } else {
        return item.status === filterType || item.priority === filterType
      }
    })
  }

  const handleSelectItem = (itemId) => {
    setSelectedItemIds(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId)
      } else {
        return [...prev, itemId]
      }
    })
  }

  const handleSelectAll = () => {
    const items = getFilteredItems()
    if (selectedItemIds.length === items.length) {
      setSelectedItemIds([])
    } else {
      setSelectedItemIds(items.map(item => item.id))
    }
  }

  const handleExecuteOperation = async () => {
    if (!selectedOperation || selectedItemIds.length === 0) {
      toast.error('Please select an operation and items')
      return
    }

    const items = getFilteredItems().filter(item => selectedItemIds.includes(item.id))
    
    // Validate operation
    const validation = bulkOperationsService.validateBulkOperation(
      selectedOperation,
      items,
      operationOptions
    )

    if (!validation.valid) {
      toast.error(`Validation failed: ${validation.errors.join(', ')}`)
      return
    }

    try {
      const result = await bulkOperationsService.executeBulkOperation(
        selectedOperation,
        items,
        operationOptions
      )

      if (result.success) {
        toast.success(`Operation completed: ${result.results.length}/${result.total} items processed`)
        
        if (result.errors.length > 0) {
          toast.warning(`${result.errors.length} items failed to process`)
        }

        setSelectedItemIds([])
        setSelectedOperation('')
        setOperationOptions({})
        loadData()
      }
    } catch (error) {
      console.error('Bulk operation failed:', error)
      toast.error(`Operation failed: ${error.message}`)
    }
  }

  const handleCancelOperation = (operationId) => {
    const success = bulkOperationsService.cancelOperation(operationId)
    if (success) {
      toast.success('Operation cancelled')
      loadData()
    } else {
      toast.error('Failed to cancel operation')
    }
  }

  const openOptionsModal = () => {
    const operation = availableOperations.find(op => op.id === selectedOperation)
    if (operation && operation.requiresData) {
      setShowOptionsModal(true)
    } else {
      handleExecuteOperation()
    }
  }

  const ProgressBar = ({ progress, status }) => {
    const getColor = () => {
      switch (status) {
        case 'completed': return 'bg-green-500'
        case 'failed': return 'bg-red-500'
        case 'cancelled': return 'bg-gray-500'
        default: return 'bg-blue-500'
      }
    }

    return (
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getColor()}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    )
  }

  const StatusIcon = ({ status }) => {
    const icons = {
      in_progress: <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />,
      completed: <CheckCircle className="w-4 h-4 text-green-500" />,
      failed: <AlertCircle className="w-4 h-4 text-red-500" />,
      cancelled: <X className="w-4 h-4 text-gray-500" />
    }
    
    return icons[status] || <Clock className="w-4 h-4 text-gray-400" />
  }

  const OperationOptionsModal = () => {
    const operation = availableOperations.find(op => op.id === selectedOperation)
    if (!operation) return null

    const renderOperationOptions = () => {
      switch (selectedOperation) {
        case 'update_assets':
        case 'update_tasks':
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={operationOptions.updateData?.status || ''}
                  onChange={(e) => setOperationOptions(prev => ({
                    ...prev,
                    updateData: { ...prev.updateData, status: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              
              {selectedOperation === 'update_assets' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Condition
                  </label>
                  <select
                    value={operationOptions.updateData?.condition || ''}
                    onChange={(e) => setOperationOptions(prev => ({
                      ...prev,
                      updateData: { ...prev.updateData, condition: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select condition</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              )}
            </div>
          )

        case 'assign_tasks':
          return (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assignee
              </label>
              <input
                type="text"
                value={operationOptions.assignee || ''}
                onChange={(e) => setOperationOptions(prev => ({ ...prev, assignee: e.target.value }))}
                placeholder="Enter assignee name or email"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          )

        case 'move_phase':
          return (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Phase
              </label>
              <select
                value={operationOptions.targetPhase || ''}
                onChange={(e) => setOperationOptions(prev => ({ ...prev, targetPhase: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select phase</option>
                <option value="planning">Planning</option>
                <option value="acquisition">Acquisition</option>
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="disposal">Disposal</option>
              </select>
            </div>
          )

        case 'bulk_inspect':
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Inspection Type
                </label>
                <select
                  value={operationOptions.inspectionData?.type || ''}
                  onChange={(e) => setOperationOptions(prev => ({
                    ...prev,
                    inspectionData: { ...prev.inspectionData, type: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select inspection type</option>
                  <option value="Safety Check">Safety Check</option>
                  <option value="Maintenance Inspection">Maintenance Inspection</option>
                  <option value="Compliance Audit">Compliance Audit</option>
                  <option value="Condition Assessment">Condition Assessment</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Scheduled Date
                </label>
                <input
                  type="date"
                  value={operationOptions.inspectionData?.date || ''}
                  onChange={(e) => setOperationOptions(prev => ({
                    ...prev,
                    inspectionData: { ...prev.inspectionData, date: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          )

        case 'export_data':
          return (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Export Format
              </label>
              <select
                value={operationOptions.format || ''}
                onChange={(e) => setOperationOptions(prev => ({ ...prev, format: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select format</option>
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="xml">XML</option>
              </select>
            </div>
          )

        case 'send_notifications':
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notification Type
                </label>
                <select
                  value={operationOptions.notificationData?.type || ''}
                  onChange={(e) => setOperationOptions(prev => ({
                    ...prev,
                    notificationData: { ...prev.notificationData, type: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select type</option>
                  <option value="reminder">Reminder</option>
                  <option value="alert">Alert</option>
                  <option value="update">Update</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  value={operationOptions.notificationData?.message || ''}
                  onChange={(e) => setOperationOptions(prev => ({
                    ...prev,
                    notificationData: { ...prev.notificationData, message: e.target.value }
                  }))}
                  placeholder="Enter notification message"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          )

        case 'tag_items':
          return (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={operationOptions.tagsInput || ''}
                onChange={(e) => {
                  const tagsInput = e.target.value
                  const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag)
                  setOperationOptions(prev => ({ ...prev, tagsInput, tags }))
                }}
                placeholder="urgent, maintenance, inspection"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          )

        default:
          return (
            <div className="text-center py-4">
              <p className="text-gray-600 dark:text-gray-400">
                No additional options required for this operation.
              </p>
            </div>
          )
      }
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {operation.name} Options
              </h2>
              <button
                onClick={() => setShowOptionsModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {operation.description}
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Selected items: {selectedItemIds.length}
              </p>
            </div>

            <div className="mb-6">
              {renderOperationOptions()}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowOptionsModal(false)
                  handleExecuteOperation()
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Execute Operation
              </button>
              <button
                onClick={() => setShowOptionsModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Bulk Operations
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Perform operations on multiple items simultaneously
          </p>
        </div>
        
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
        >
          <History className="w-4 h-4" />
          <span>History</span>
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Operations</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Failed</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Items Processed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalItemsProcessed}</p>
              </div>
              <Package className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>
      )}

      {/* Active Operations */}
      {activeOperations.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Active Operations
            </h2>
          </div>
          <div className="p-4 space-y-4">
            {activeOperations.map(operation => (
              <div key={operation.id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <StatusIcon status={operation.status} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {availableOperations.find(op => op.id === operation.type)?.name || operation.type}
                    </h3>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {operation.progress}%
                    </span>
                  </div>
                  <ProgressBar progress={operation.progress} status={operation.status} />
                  <div className="flex items-center justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>{operation.itemCount} items</span>
                    <span>Started {new Date(operation.startedAt).toLocaleTimeString()}</span>
                  </div>
                </div>
                {operation.status === 'in_progress' && (
                  <button
                    onClick={() => handleCancelOperation(operation.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  >
                    <Square className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Item Selection */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Select Items
                </h2>
                <div className="flex items-center space-x-4">
                  {/* Item Type Toggle */}
                  <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => {
                        setItemType('assets')
                        setSelectedItemIds([])
                      }}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        itemType === 'assets'
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      Assets
                    </button>
                    <button
                      onClick={() => {
                        setItemType('tasks')
                        setSelectedItemIds([])
                      }}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        itemType === 'tasks'
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      Tasks
                    </button>
                  </div>

                  {/* Filter */}
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All</option>
                    {itemType === 'assets' ? (
                      <>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Good">Good Condition</option>
                        <option value="Poor">Poor Condition</option>
                      </>
                    ) : (
                      <>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="High">High Priority</option>
                        <option value="Low">Low Priority</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {selectedItemIds.length === getFilteredItems().length ? 'Deselect All' : 'Select All'}
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedItemIds.length} of {getFilteredItems().length} selected
                </span>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {getFilteredItems().map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectItem(item.id)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedItemIds.includes(item.id)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {item.name || item.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {itemType === 'assets' 
                            ? `${item.type} • ${item.condition}` 
                            : `${item.type} • ${item.priority}`
                          }
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded ${
                          item.status === 'Active' || item.status === 'Completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : item.status === 'Inactive' || item.status === 'Cancelled'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {item.status}
                        </span>
                        <input
                          type="checkbox"
                          checked={selectedItemIds.includes(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Operation Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Operations
              </h2>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Operation
                </label>
                <select
                  value={selectedOperation}
                  onChange={(e) => setSelectedOperation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Choose operation</option>
                  {availableOperations
                    .filter(op => 
                      itemType === 'assets' 
                        ? ['update_assets', 'delete_assets', 'move_phase', 'bulk_inspect', 'export_data', 'update_status', 'tag_items', 'duplicate_items'].includes(op.id)
                        : ['update_tasks', 'delete_tasks', 'assign_tasks', 'export_data', 'update_status', 'tag_items', 'duplicate_items'].includes(op.id)
                    )
                    .map(operation => (
                      <option key={operation.id} value={operation.id}>
                        {operation.name}
                      </option>
                    ))
                  }
                </select>
              </div>

              {selectedOperation && (
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {availableOperations.find(op => op.id === selectedOperation)?.description}
                  </p>
                  {availableOperations.find(op => op.id === selectedOperation)?.destructive && (
                    <div className="flex items-center space-x-2 mt-2 text-red-600 dark:text-red-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">This operation cannot be undone</span>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={openOptionsModal}
                disabled={!selectedOperation || selectedItemIds.length === 0}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>Execute Operation</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* History Panel */}
      {showHistory && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Operation History
              </h2>
              <button
                onClick={() => {
                  bulkOperationsService.clearHistory()
                  loadData()
                }}
                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Clear History
              </button>
            </div>
          </div>
          
          <div className="p-4">
            {operationHistory.length > 0 ? (
              <div className="space-y-4">
                {operationHistory.slice(0, 10).map(operation => (
                  <div key={operation.id} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <StatusIcon status={operation.status} />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {operation.summary}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(operation.startedAt).toLocaleString()}
                      </p>
                    </div>
                    {operation.status === 'completed' && (
                      <span className="text-sm text-green-600 dark:text-green-400">
                        {operation.results?.length || 0} success
                      </span>
                    )}
                    {operation.errors?.length > 0 && (
                      <span className="text-sm text-red-600 dark:text-red-400">
                        {operation.errors.length} errors
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No operation history</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Options Modal */}
      {showOptionsModal && <OperationOptionsModal />}
    </div>
  )
}

export default BulkOperationsManager