import React, { useState, useEffect } from 'react';
import {
  History,
  Calendar,
  Edit,
  Upload,
  FileText,
  User,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Filter,
  Download,
  RefreshCw,
  Clock,
  MapPin,
  DollarSign
} from 'lucide-react';
import { useAssetStore } from '../../stores/assetStore';
import { useTaskStore } from '../../stores/taskStore';
import { format, parseISO, differenceInDays } from 'date-fns';
import { exportUtils } from '../../utils/exportUtils';
import toast from 'react-hot-toast';

const AssetHistory = ({ assetId, isOpen, onClose }) => {
  const { assets, updateAsset } = useAssetStore();
  const { tasks } = useTaskStore();
  const [asset, setAsset] = useState(null);
  const [historyEntries, setHistoryEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (assetId && isOpen) {
      const foundAsset = assets.find(a => a.id === assetId);
      setAsset(foundAsset);
      loadAssetHistory(assetId);
    }
  }, [assetId, isOpen, assets]);

  useEffect(() => {
    filterHistoryEntries();
  }, [historyEntries, activeFilter, dateRange, searchTerm]);

  const loadAssetHistory = (assetId) => {
    setLoading(true);
    
    // Load from localStorage (in real app, this would be from API)
    const savedHistory = localStorage.getItem(`asset_history_${assetId}`);
    let history = savedHistory ? JSON.parse(savedHistory) : [];
    
    // If no history exists, generate initial history from asset and tasks
    if (history.length === 0) {
      history = generateInitialHistory(assetId);
      saveAssetHistory(assetId, history);
    }
    
    setHistoryEntries(history);
    setLoading(false);
  };

  const generateInitialHistory = (assetId) => {
    const foundAsset = assets.find(a => a.id === assetId);
    const assetTasks = tasks.filter(t => t.assetId === assetId);
    
    if (!foundAsset) return [];

    const history = [];

    // Asset creation
    history.push({
      id: `asset_created_${assetId}`,
      type: 'asset_created',
      title: 'Asset Created',
      description: `Asset "${foundAsset.name}" was added to the system`,
      timestamp: foundAsset.createdAt || new Date().toISOString(),
      user: 'System',
      changes: {
        from: null,
        to: {
          name: foundAsset.name,
          type: foundAsset.type,
          status: foundAsset.status,
          condition: foundAsset.condition
        }
      },
      metadata: {
        address: foundAsset.address,
        details: foundAsset.details
      }
    });

    // Property updates (simulated)
    if (foundAsset.updatedAt && foundAsset.updatedAt !== foundAsset.createdAt) {
      history.push({
        id: `asset_updated_${assetId}_${Date.now()}`,
        type: 'asset_updated',
        title: 'Asset Information Updated',
        description: 'Asset details were modified',
        timestamp: foundAsset.updatedAt,
        user: 'Admin User',
        changes: {
          from: { condition: 'Good' },
          to: { condition: foundAsset.condition }
        }
      });
    }

    // Inspections
    if (foundAsset.lastInspection) {
      history.push({
        id: `inspection_${assetId}_${foundAsset.lastInspection}`,
        type: 'inspection',
        title: 'Property Inspection',
        description: 'Routine property inspection completed',
        timestamp: foundAsset.lastInspection,
        user: 'Inspector',
        changes: {
          from: { inspectionStatus: 'Pending' },
          to: { inspectionStatus: 'Completed' }
        },
        metadata: {
          inspectionType: 'Routine',
          findings: 'Property in good condition, minor maintenance needed',
          nextInspection: foundAsset.nextInspection
        }
      });
    }

    // Task completion history
    assetTasks.forEach(task => {
      if (task.status === 'Completed' && task.completedAt) {
        history.push({
          id: `task_completed_${task.id}`,
          type: 'task_completed',
          title: 'Task Completed',
          description: `"${task.title}" was completed`,
          timestamp: task.completedAt,
          user: task.assignedTo || 'Unknown',
          changes: {
            from: { status: 'In Progress' },
            to: { status: 'Completed' }
          },
          metadata: {
            taskType: task.type,
            priority: task.priority,
            dueDate: task.dueDate
          }
        });
      }
    });

    // Phase changes
    if (foundAsset.phaseMetadata?.phaseStartDate) {
      history.push({
        id: `phase_change_${assetId}_${foundAsset.currentPhase}`,
        type: 'phase_change',
        title: 'Phase Transition',
        description: `Asset moved to ${foundAsset.currentPhase} phase`,
        timestamp: foundAsset.phaseMetadata.phaseStartDate,
        user: 'System',
        changes: {
          from: { phase: 'Planning' },
          to: { phase: foundAsset.currentPhase }
        },
        metadata: {
          progress: foundAsset.phaseMetadata.phaseProgress,
          requirements: foundAsset.phaseMetadata.requirements
        }
      });
    }

    // Sort by timestamp (newest first)
    return history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const saveAssetHistory = (assetId, history) => {
    localStorage.setItem(`asset_history_${assetId}`, JSON.stringify(history));
  };

  const addHistoryEntry = (entry) => {
    const newEntry = {
      id: `manual_${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: 'Current User',
      ...entry
    };

    const updatedHistory = [newEntry, ...historyEntries];
    setHistoryEntries(updatedHistory);
    saveAssetHistory(assetId, updatedHistory);
    toast.success('History entry added');
  };

  const filterHistoryEntries = () => {
    let filtered = [...historyEntries];

    // Filter by type
    if (activeFilter !== 'all') {
      filtered = filtered.filter(entry => entry.type === activeFilter);
    }

    // Filter by date range
    if (dateRange !== 'all') {
      const now = new Date();
      const days = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : dateRange === '90days' ? 90 : 365;
      const cutoffDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
      
      filtered = filtered.filter(entry => new Date(entry.timestamp) >= cutoffDate);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(term) ||
        entry.description.toLowerCase().includes(term) ||
        entry.user.toLowerCase().includes(term)
      );
    }

    setFilteredEntries(filtered);
  };

  const getHistoryIcon = (type) => {
    switch (type) {
      case 'asset_created':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'asset_updated':
        return <Edit className="w-5 h-5 text-blue-600" />;
      case 'inspection':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'task_completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'phase_change':
        return <TrendingUp className="w-5 h-5 text-purple-600" />;
      case 'maintenance':
        return <RefreshCw className="w-5 h-5 text-yellow-600" />;
      case 'document_added':
        return <FileText className="w-5 h-5 text-gray-600" />;
      case 'valuation':
        return <DollarSign className="w-5 h-5 text-green-600" />;
      default:
        return <History className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatChanges = (changes) => {
    if (!changes) return null;

    return (
      <div className="mt-2 text-sm">
        {Object.entries(changes.to || {}).map(([key, value]) => {
          const fromValue = changes.from?.[key];
          return (
            <div key={key} className="flex items-center space-x-2">
              <span className="font-medium">{key}:</span>
              {fromValue && (
                <>
                  <span className="text-red-600 line-through">{fromValue}</span>
                  <span>→</span>
                </>
              )}
              <span className="text-green-600">{value}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const exportHistory = () => {
    const exportData = filteredEntries.map(entry => ({
      Date: format(parseISO(entry.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      Type: entry.type.replace('_', ' ').toUpperCase(),
      Title: entry.title,
      Description: entry.description,
      User: entry.user,
      Changes: entry.changes ? JSON.stringify(entry.changes) : ''
    }));

    exportUtils.exportToCSV(exportData, `asset-${assetId}-history`);
    toast.success('History exported successfully');
  };

  const getHistoryStats = () => {
    const stats = {
      total: historyEntries.length,
      thisMonth: historyEntries.filter(entry => 
        differenceInDays(new Date(), parseISO(entry.timestamp)) <= 30
      ).length,
      byType: {}
    };

    historyEntries.forEach(entry => {
      stats.byType[entry.type] = (stats.byType[entry.type] || 0) + 1;
    });

    return stats;
  };

  if (!isOpen) return null;

  const stats = getHistoryStats();
  const filterOptions = [
    { value: 'all', label: 'All Events', count: stats.total },
    { value: 'asset_created', label: 'Asset Created', count: stats.byType.asset_created || 0 },
    { value: 'asset_updated', label: 'Updates', count: stats.byType.asset_updated || 0 },
    { value: 'inspection', label: 'Inspections', count: stats.byType.inspection || 0 },
    { value: 'task_completed', label: 'Tasks', count: stats.byType.task_completed || 0 },
    { value: 'phase_change', label: 'Phase Changes', count: stats.byType.phase_change || 0 }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Asset History
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {asset?.name} • Complete activity timeline
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={exportHistory}
                className="btn-secondary flex items-center"
                disabled={filteredEntries.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {filterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label} ({option.count})
                  </option>
                ))}
              </select>
            </div>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Time</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="365days">Last Year</option>
            </select>

            <input
              type="text"
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading history...</span>
            </div>
          ) : filteredEntries.length > 0 ? (
            <div className="space-y-4">
              {filteredEntries.map(entry => (
                <div key={entry.id} className="flex items-start space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex-shrink-0">
                    {getHistoryIcon(entry.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {entry.title}
                      </h3>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <User className="w-3 h-3" />
                        <span>{entry.user}</span>
                        <Clock className="w-3 h-3 ml-2" />
                        <span>{format(parseISO(entry.timestamp), 'MMM dd, yyyy HH:mm')}</span>
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {entry.description}
                    </p>
                    {entry.changes && formatChanges(entry.changes)}
                    {entry.metadata && (
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {Object.entries(entry.metadata).map(([key, value]) => (
                          <div key={key}>
                            <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : value}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <History className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No History Found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || activeFilter !== 'all' ? 'Try adjusting your filters' : 'No activity recorded for this asset yet'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetHistory;