import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Square,
  Clock,
  Calendar,
  User,
  BarChart3,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { useTaskStore } from '../../stores/taskStore';
import { format, parseISO, differenceInMinutes, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import toast from 'react-hot-toast';

const TaskTimeTracker = ({ isOpen, onClose }) => {
  const { tasks, updateTask } = useTaskStore();
  const [activeTimer, setActiveTimer] = useState(null);
  const [timeEntries, setTimeEntries] = useState([]);
  const [weekView, setWeekView] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState(null);
  const [timerStart, setTimerStart] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Load time entries from localStorage
  useEffect(() => {
    const savedEntries = localStorage.getItem('task_time_entries');
    if (savedEntries) {
      setTimeEntries(JSON.parse(savedEntries));
    }
  }, []);

  // Save time entries to localStorage
  useEffect(() => {
    localStorage.setItem('task_time_entries', JSON.stringify(timeEntries));
  }, [timeEntries]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (activeTimer && timerStart) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - timerStart);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer, timerStart]);

  const startTimer = (taskId) => {
    if (activeTimer && activeTimer !== taskId) {
      stopTimer(); // Stop current timer if switching tasks
    }
    
    setActiveTimer(taskId);
    setTimerStart(Date.now());
    setElapsedTime(0);
    toast.success('Timer started');
  };

  const pauseTimer = () => {
    if (activeTimer && timerStart) {
      const duration = Math.floor((Date.now() - timerStart) / 1000);
      addTimeEntry(activeTimer, duration);
      setActiveTimer(null);
      setTimerStart(null);
      setElapsedTime(0);
      toast.success('Timer paused and time logged');
    }
  };

  const stopTimer = () => {
    if (activeTimer && timerStart) {
      const duration = Math.floor((Date.now() - timerStart) / 1000);
      addTimeEntry(activeTimer, duration);
    }
    
    setActiveTimer(null);
    setTimerStart(null);
    setElapsedTime(0);
    toast.success('Timer stopped');
  };

  const addTimeEntry = (taskId, duration) => {
    const task = tasks.find(t => t.id === taskId);
    const entry = {
      id: Date.now(),
      taskId,
      taskTitle: task?.title || 'Unknown Task',
      duration, // in seconds
      date: new Date().toISOString(),
      description: ''
    };

    setTimeEntries(prev => [entry, ...prev]);
    
    // Update task with time tracking
    if (task) {
      const totalTime = getTaskTotalTime(taskId) + duration;
      updateTask(taskId, {
        ...task,
        timeTracked: totalTime,
        lastTimeEntry: new Date().toISOString()
      });
    }
  };

  const deleteTimeEntry = (entryId) => {
    setTimeEntries(prev => prev.filter(entry => entry.id !== entryId));
    toast.success('Time entry deleted');
  };

  const getTaskTotalTime = (taskId) => {
    return timeEntries
      .filter(entry => entry.taskId === taskId)
      .reduce((total, entry) => total + entry.duration, 0);
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const getWeekTimeEntries = () => {
    const start = startOfWeek(selectedWeek);
    const end = endOfWeek(selectedWeek);
    
    return timeEntries.filter(entry => {
      const entryDate = parseISO(entry.date);
      return entryDate >= start && entryDate <= end;
    });
  };

  const getDailyTimeData = () => {
    const start = startOfWeek(selectedWeek);
    const end = endOfWeek(selectedWeek);
    const days = eachDayOfInterval({ start, end });
    
    return days.map(day => {
      const dayEntries = timeEntries.filter(entry => {
        const entryDate = parseISO(entry.date);
        return entryDate.toDateString() === day.toDateString();
      });
      
      const totalMinutes = dayEntries.reduce((sum, entry) => sum + Math.floor(entry.duration / 60), 0);
      
      return {
        date: day,
        label: format(day, 'EEE dd'),
        minutes: totalMinutes,
        hours: Math.floor(totalMinutes / 60),
        entries: dayEntries.length
      };
    });
  };

  const getTopTasks = () => {
    const taskTimeMap = {};
    
    timeEntries.forEach(entry => {
      if (!taskTimeMap[entry.taskId]) {
        taskTimeMap[entry.taskId] = {
          taskId: entry.taskId,
          taskTitle: entry.taskTitle,
          totalTime: 0,
          entries: 0
        };
      }
      taskTimeMap[entry.taskId].totalTime += entry.duration;
      taskTimeMap[entry.taskId].entries++;
    });
    
    return Object.values(taskTimeMap)
      .sort((a, b) => b.totalTime - a.totalTime)
      .slice(0, 5);
  };

  const exportTimeData = () => {
    const exportData = timeEntries.map(entry => ({
      Date: format(parseISO(entry.date), 'yyyy-MM-dd'),
      'Task ID': entry.taskId,
      'Task Title': entry.taskTitle,
      'Duration (minutes)': Math.floor(entry.duration / 60),
      'Duration (formatted)': formatDuration(entry.duration),
      Description: entry.description || ''
    }));

    const csvContent = [
      Object.keys(exportData[0]).join(','),
      ...exportData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time-tracking-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Time tracking data exported');
  };

  if (!isOpen) return null;

  const dailyData = getDailyTimeData();
  const topTasks = getTopTasks();
  const weekEntries = getWeekTimeEntries();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Time Tracking</h2>
              <p className="text-gray-600 dark:text-gray-400">Track time spent on tasks and analyze productivity</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={exportTimeData}
                className="btn-secondary flex items-center"
                disabled={timeEntries.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Timer Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Active Timer */}
              {activeTimer && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Timer</h3>
                    <div className="text-2xl font-mono text-blue-600 dark:text-blue-400">
                      {formatDuration(Math.floor(elapsedTime / 1000))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">
                      {tasks.find(t => t.id === activeTimer)?.title}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={pauseTimer}
                        className="btn-secondary flex items-center"
                      >
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </button>
                      <button
                        onClick={stopTimer}
                        className="btn-danger flex items-center"
                      >
                        <Square className="w-4 h-4 mr-2" />
                        Stop
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Task List with Timers */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tasks</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {tasks.slice(0, 10).map(task => (
                    <div key={task.id} className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{task.title}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Total: {formatDuration(getTaskTotalTime(task.id))}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {activeTimer === task.id ? (
                            <div className="flex items-center text-blue-600 dark:text-blue-400">
                              <Clock className="w-4 h-4 mr-1 animate-pulse" />
                              Running
                            </div>
                          ) : (
                            <button
                              onClick={() => startTimer(task.id)}
                              className="btn-primary flex items-center text-sm"
                              disabled={activeTimer !== null}
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Start
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Time Entries */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Time Entries</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {timeEntries.slice(0, 10).map(entry => (
                    <div key={entry.id} className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{entry.taskTitle}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {format(parseISO(entry.date), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatDuration(entry.duration)}
                          </span>
                          <button
                            onClick={() => deleteTimeEntry(entry.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Analytics Sidebar */}
            <div className="space-y-6">
              {/* Week Overview */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">This Week</h3>
                <div className="space-y-3">
                  {dailyData.map(day => (
                    <div key={day.date.toISOString()} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{day.label}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {day.hours}h {day.minutes % 60}m
                        </span>
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${Math.min((day.minutes / 480) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Tasks */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Tasks</h3>
                <div className="space-y-3">
                  {topTasks.map(task => (
                    <div key={task.taskId} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {task.taskTitle}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDuration(task.totalTime)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                        <div
                          className="bg-green-600 h-1 rounded-full"
                          style={{ 
                            width: `${topTasks.length > 0 ? (task.totalTime / topTasks[0].totalTime) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Stats */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Time</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatDuration(weekEntries.reduce((sum, entry) => sum + entry.duration, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Entries</span>
                    <span className="font-medium text-gray-900 dark:text-white">{weekEntries.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Avg/Day</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatDuration(Math.floor(weekEntries.reduce((sum, entry) => sum + entry.duration, 0) / 7))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskTimeTracker;