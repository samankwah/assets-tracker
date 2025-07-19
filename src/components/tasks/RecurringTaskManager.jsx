import React, { useState, useEffect } from 'react';
import { 
  RotateCcw, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Play,
  Pause,
  Settings,
  TrendingUp,
  Users,
  Building
} from 'lucide-react';
import { useTaskStore } from '../../stores/taskStore';
import { useAssetStore } from '../../stores/assetStore';
import { taskTemplates } from '../../data/taskTemplates';
import { recurringTaskUtils } from '../../utils/recurringTaskUtils';
import { format, addDays, addMonths } from 'date-fns';
import toast from 'react-hot-toast';

const RecurringTaskManager = ({ isOpen, onClose }) => {
  const { 
    generateRecurringTasks, 
    getRecurringTaskStats, 
    autoGenerateRecurringTasks,
    getUpcomingRecurringTasks,
    loading 
  } = useTaskStore();
  const { assets } = useAssetStore();
  
  const [selectedTemplates, setSelectedTemplates] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(addMonths(new Date(), 6), 'yyyy-MM-dd')
  });
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [lookAheadDays, setLookAheadDays] = useState(30);
  const [stats, setStats] = useState(null);
  const [upcomingTasks, setUpcomingTasks] = useState([]);

  useEffect(() => {
    if (isOpen) {
      loadStats();
      loadUpcomingTasks();
    }
  }, [isOpen]);

  const loadStats = () => {
    const recurringStats = getRecurringTaskStats();
    setStats(recurringStats);
  };

  const loadUpcomingTasks = () => {
    const upcoming = getUpcomingRecurringTasks(lookAheadDays);
    setUpcomingTasks(upcoming);
  };

  const handleTemplateToggle = (templateId) => {
    setSelectedTemplates(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const handleSelectAllTemplates = () => {
    const recurringTemplates = taskTemplates.filter(t => t.frequency !== 'One-time');
    if (selectedTemplates.length === recurringTemplates.length) {
      setSelectedTemplates([]);
    } else {
      setSelectedTemplates(recurringTemplates.map(t => t.id));
    }
  };

  const handleGenerateTasks = async () => {
    try {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      
      const templateIds = selectedTemplates.length > 0 ? selectedTemplates : null;
      const generatedTasks = await generateRecurringTasks(startDate, endDate, templateIds);
      
      toast.success(`Generated ${generatedTasks.length} recurring tasks successfully!`);
      loadStats();
      loadUpcomingTasks();
    } catch (error) {
      toast.error('Failed to generate recurring tasks');
      console.error(error);
    }
  };

  const handleAutoGenerate = async () => {
    try {
      const generatedTasks = await autoGenerateRecurringTasks(lookAheadDays);
      
      if (generatedTasks.length > 0) {
        toast.success(`Auto-generated ${generatedTasks.length} upcoming recurring tasks!`);
      } else {
        toast.info('No new recurring tasks needed at this time');
      }
      
      loadStats();
      loadUpcomingTasks();
    } catch (error) {
      toast.error('Failed to auto-generate recurring tasks');
      console.error(error);
    }
  };

  const getFrequencyBadge = (frequency) => {
    const colors = {
      'Daily': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Weekly': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Monthly': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Quarterly': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Annual': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Annually': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    
    return colors[frequency] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const recurringTemplates = taskTemplates.filter(t => t.frequency !== 'One-time');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <RotateCcw className="w-6 h-6 mr-3 text-blue-600" />
                Recurring Task Manager
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Automate maintenance tasks with intelligent recurring schedules
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Configuration */}
          <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Stats Cards */}
              {stats && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Recurring</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.overdue}</p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Due Today</p>
                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.dueToday}</p>
                      </div>
                      <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </div>
              )}

              {/* Auto-generation Settings */}
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Auto-generation Settings
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Auto-generate tasks</span>
                    <button
                      onClick={() => setAutoGenerate(!autoGenerate)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        autoGenerate ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          autoGenerate ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Look-ahead days
                    </label>
                    <input
                      type="number"
                      value={lookAheadDays}
                      onChange={(e) => setLookAheadDays(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      min="1"
                      max="365"
                    />
                  </div>
                  
                  <button
                    onClick={handleAutoGenerate}
                    disabled={loading}
                    className="w-full btn-primary flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    Generate Upcoming Tasks
                  </button>
                </div>
              </div>

              {/* Manual Generation */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Manual Generation</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm text-gray-600 dark:text-gray-400">
                        Select Templates ({selectedTemplates.length} selected)
                      </label>
                      <button
                        onClick={handleSelectAllTemplates}
                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        {selectedTemplates.length === recurringTemplates.length ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                    
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {recurringTemplates.map(template => (
                        <label key={template.id} className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedTemplates.includes(template.id)}
                            onChange={() => handleTemplateToggle(template.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {template.name}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded ${getFrequencyBadge(template.frequency)}`}>
                                {template.frequency}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {template.type} • {template.priority} Priority
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateTasks}
                    disabled={loading}
                    className="w-full btn-secondary flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2" />
                    ) : (
                      <Calendar className="w-4 h-4 mr-2" />
                    )}
                    Generate Tasks for Date Range
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="w-1/2 flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Upcoming Tasks Preview ({upcomingTasks.length})
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tasks that will be generated automatically
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {upcomingTasks.length > 0 ? (
                <div className="space-y-3">
                  {upcomingTasks.map((task, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {task.title}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded ${
                          task.priority === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 space-x-4">
                        <div className="flex items-center">
                          <Building className="w-3 h-3 mr-1" />
                          {task.assetName}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {format(new Date(task.dueDate), 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center">
                          <RotateCcw className="w-3 h-3 mr-1" />
                          {task.frequency}
                        </div>
                      </div>
                      
                      {task.checklist && task.checklist.length > 0 && (
                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          {task.checklist.length} checklist items
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Upcoming Tasks
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    All recurring tasks are up to date for the next {lookAheadDays} days.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecurringTaskManager;