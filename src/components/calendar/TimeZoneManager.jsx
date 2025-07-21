import React, { useState, useEffect } from 'react';
import {
  Globe,
  Clock,
  MapPin,
  Settings,
  Check,
  X,
  RefreshCw,
  AlertCircle,
  Info
} from 'lucide-react';
import { format, formatInTimeZone, zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';
import { useCalendarStore } from '../../stores/calendarStore';
import toast from 'react-hot-toast';

const TimeZoneManager = ({ isOpen, onClose }) => {
  const { updateCalendarSettings } = useCalendarStore();
  const [currentTimeZone, setCurrentTimeZone] = useState('');
  const [selectedTimeZone, setSelectedTimeZone] = useState('');
  const [timeZones, setTimeZones] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllTimeZones, setShowAllTimeZones] = useState(false);
  const [worldClocks, setWorldClocks] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Detect current timezone
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setCurrentTimeZone(detected);
    setSelectedTimeZone(detected);
    
    // Load saved timezone from localStorage
    const saved = localStorage.getItem('asset_tracker_timezone');
    if (saved) {
      setSelectedTimeZone(saved);
    }

    // Initialize timezones and world clocks
    initializeTimeZones();
    loadWorldClocks();
    
    // Start clock update
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const initializeTimeZones = () => {
    // Common timezones
    const commonTimeZones = [
      'America/New_York',
      'America/Chicago', 
      'America/Denver',
      'America/Los_Angeles',
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Asia/Kolkata',
      'Australia/Sydney',
      'Pacific/Auckland'
    ];

    // Get all available timezones
    const allTimeZones = Intl.supportedValuesOf('timeZone');
    
    const formattedTimeZones = allTimeZones.map(tz => ({
      value: tz,
      label: formatTimeZoneLabel(tz),
      offset: getTimeZoneOffset(tz),
      isCommon: commonTimeZones.includes(tz)
    })).sort((a, b) => a.offset - b.offset);

    setTimeZones(formattedTimeZones);
  };

  const formatTimeZoneLabel = (timeZone) => {
    const now = new Date();
    const offset = getTimeZoneOffset(timeZone);
    const offsetHours = Math.floor(Math.abs(offset) / 60);
    const offsetMinutes = Math.abs(offset) % 60;
    const offsetSign = offset >= 0 ? '+' : '-';
    const offsetString = `UTC${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`;
    
    // Format city name
    const cityName = timeZone.split('/').pop().replace(/_/g, ' ');
    
    return `${cityName} (${offsetString})`;
  };

  const getTimeZoneOffset = (timeZone) => {
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const targetTime = new Date(utcTime + (getTimezoneOffsetInMinutes(timeZone) * 60000));
    return getTimezoneOffsetInMinutes(timeZone);
  };

  const getTimezoneOffsetInMinutes = (timeZone) => {
    const now = new Date();
    const utcDate = new Date(now.toLocaleString("en-US", {timeZone: "UTC"}));
    const tzDate = new Date(now.toLocaleString("en-US", {timeZone}));
    return (utcDate.getTime() - tzDate.getTime()) / 60000;
  };

  const loadWorldClocks = () => {
    const saved = localStorage.getItem('asset_tracker_world_clocks');
    if (saved) {
      setWorldClocks(JSON.parse(saved));
    } else {
      // Default world clocks
      setWorldClocks([
        { id: 1, timeZone: 'America/New_York', name: 'New York' },
        { id: 2, timeZone: 'Europe/London', name: 'London' },
        { id: 3, timeZone: 'Asia/Tokyo', name: 'Tokyo' }
      ]);
    }
  };

  const saveWorldClocks = (clocks) => {
    setWorldClocks(clocks);
    localStorage.setItem('asset_tracker_world_clocks', JSON.stringify(clocks));
  };

  const handleTimeZoneChange = () => {
    localStorage.setItem('asset_tracker_timezone', selectedTimeZone);
    updateCalendarSettings({ timeZone: selectedTimeZone });
    toast.success('Timezone updated successfully');
    onClose();
  };

  const addWorldClock = (timeZone) => {
    const cityName = timeZone.split('/').pop().replace(/_/g, ' ');
    const newClock = {
      id: Date.now(),
      timeZone,
      name: cityName
    };
    
    const updatedClocks = [...worldClocks, newClock];
    saveWorldClocks(updatedClocks);
    toast.success(`Added ${cityName} to world clocks`);
  };

  const removeWorldClock = (id) => {
    const updatedClocks = worldClocks.filter(clock => clock.id !== id);
    saveWorldClocks(updatedClocks);
    toast.success('World clock removed');
  };

  const convertEventTime = (eventTime, fromTimeZone, toTimeZone) => {
    try {
      const utcTime = zonedTimeToUtc(eventTime, fromTimeZone);
      return utcToZonedTime(utcTime, toTimeZone);
    } catch (error) {
      console.error('Time conversion error:', error);
      return eventTime;
    }
  };

  const getFilteredTimeZones = () => {
    let filtered = timeZones;
    
    if (searchTerm) {
      filtered = filtered.filter(tz => 
        tz.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tz.value.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (!showAllTimeZones) {
      filtered = filtered.filter(tz => tz.isCommon);
    }
    
    return filtered;
  };

  if (!isOpen) return null;

  const filteredTimeZones = getFilteredTimeZones();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Time Zone Settings</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your timezone and world clocks
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Time Zone */}
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Current Time Zone</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                  Detected: {formatTimeZoneLabel(currentTimeZone)}
                </p>
                <p className="text-lg font-mono text-gray-900 dark:text-white">
                  {formatInTimeZone(currentTime, selectedTimeZone, 'PPpp')}
                </p>
              </div>

              {/* Time Zone Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Select Time Zone</h3>
                  <button
                    onClick={() => setShowAllTimeZones(!showAllTimeZones)}
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                  >
                    {showAllTimeZones ? 'Show Common' : 'Show All'}
                  </button>
                </div>
                
                <input
                  type="text"
                  placeholder="Search time zones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 mb-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />

                <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  {filteredTimeZones.map(tz => (
                    <button
                      key={tz.value}
                      onClick={() => setSelectedTimeZone(tz.value)}
                      className={`w-full text-left p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        selectedTimeZone === tz.value ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-900 dark:text-white">{tz.label}</span>
                        {selectedTimeZone === tz.value && (
                          <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatInTimeZone(currentTime, tz.value, 'HH:mm')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* World Clocks */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">World Clocks</h3>
                <button
                  onClick={() => {
                    const timeZone = prompt('Enter timezone (e.g., Europe/Paris):');
                    if (timeZone && timeZones.find(tz => tz.value === timeZone)) {
                      addWorldClock(timeZone);
                    } else if (timeZone) {
                      toast.error('Invalid timezone');
                    }
                  }}
                  className="btn-secondary text-sm"
                >
                  Add Clock
                </button>
              </div>

              <div className="space-y-2">
                {worldClocks.map(clock => (
                  <div
                    key={clock.id}
                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-white">{clock.name}</span>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 ml-6">
                        {formatInTimeZone(currentTime, clock.timeZone, 'PPpp')}
                      </div>
                    </div>
                    <button
                      onClick={() => removeWorldClock(clock.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {worldClocks.length === 0 && (
                  <div className="text-center py-8">
                    <Globe className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No World Clocks</h3>
                    <p className="text-gray-600 dark:text-gray-400">Add world clocks to track multiple timezones.</p>
                  </div>
                )}
              </div>

              {/* Time Zone Info */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Time Zone Changes</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Changing your timezone will affect how all dates and times are displayed in the calendar. 
                      Existing events will be converted to the new timezone automatically.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleTimeZoneChange}
            className="btn-primary flex items-center"
            disabled={selectedTimeZone === currentTimeZone}
          >
            <Check className="w-4 h-4 mr-2" />
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeZoneManager;