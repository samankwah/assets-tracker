import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Search,
  TrendingUp,
  Clock,
  Star,
  Users,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { useSearchStore } from '../../stores/searchStore';
import { format, parseISO, subDays, isWithinInterval } from 'date-fns';
import { exportUtils } from '../../utils/exportUtils';
import toast from 'react-hot-toast';

const SearchAnalytics = ({ isOpen, onClose }) => {
  const { searchHistory, recentSearches, savedSearches } = useSearchStore();
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState('7days');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      generateAnalytics();
    }
  }, [isOpen, timeRange, searchHistory]);

  const generateAnalytics = () => {
    setIsLoading(true);
    
    try {
      const endDate = new Date();
      const startDate = subDays(endDate, timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90);
      
      // Filter data by time range
      const filteredHistory = searchHistory.filter(search => {
        const searchDate = parseISO(search.timestamp);
        return isWithinInterval(searchDate, { start: startDate, end: endDate });
      });

      // Calculate analytics
      const totalSearches = filteredHistory.length;
      const uniqueTerms = [...new Set(filteredHistory.map(s => s.term.toLowerCase()))].length;
      const avgResultsPerSearch = filteredHistory.length > 0 
        ? filteredHistory.reduce((sum, s) => sum + (s.results?.total || 0), 0) / filteredHistory.length 
        : 0;

      // Top search terms
      const termCounts = {};
      filteredHistory.forEach(search => {
        const term = search.term.toLowerCase();
        termCounts[term] = (termCounts[term] || 0) + 1;
      });
      
      const topTerms = Object.entries(termCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([term, count]) => ({ term, count, percentage: (count / totalSearches * 100).toFixed(1) }));

      // Search patterns by hour
      const hourlyPattern = {};
      for (let hour = 0; hour < 24; hour++) {
        hourlyPattern[hour] = 0;
      }
      
      filteredHistory.forEach(search => {
        const hour = parseISO(search.timestamp).getHours();
        hourlyPattern[hour]++;
      });

      const hourlyData = Object.entries(hourlyPattern).map(([hour, count]) => ({
        hour: parseInt(hour),
        hourLabel: `${hour.padStart(2, '0')}:00`,
        count
      }));

      // Daily search trends
      const dailyTrends = {};
      filteredHistory.forEach(search => {
        const day = format(parseISO(search.timestamp), 'yyyy-MM-dd');
        dailyTrends[day] = (dailyTrends[day] || 0) + 1;
      });

      const trendData = Object.entries(dailyTrends)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({
          date,
          dateLabel: format(parseISO(date), 'MMM dd'),
          count
        }));

      // Result quality analysis
      const resultQuality = filteredHistory.map(search => {
        const total = search.results?.total || 0;
        if (total === 0) return 'no-results';
        if (total <= 3) return 'few-results';
        if (total <= 10) return 'good-results';
        return 'many-results';
      });

      const qualityDistribution = {
        'no-results': resultQuality.filter(q => q === 'no-results').length,
        'few-results': resultQuality.filter(q => q === 'few-results').length,
        'good-results': resultQuality.filter(q => q === 'good-results').length,
        'many-results': resultQuality.filter(q => q === 'many-results').length
      };

      const qualityData = [
        { name: 'No Results', value: qualityDistribution['no-results'], color: '#EF4444' },
        { name: 'Few Results (1-3)', value: qualityDistribution['few-results'], color: '#F59E0B' },
        { name: 'Good Results (4-10)', value: qualityDistribution['good-results'], color: '#10B981' },
        { name: 'Many Results (10+)', value: qualityDistribution['many-results'], color: '#3B82F6' }
      ].filter(item => item.value > 0);

      // Popular filters
      const filterUsage = {};
      filteredHistory.forEach(search => {
        if (search.filters) {
          Object.entries(search.filters).forEach(([key, value]) => {
            if (value && value !== 'all') {
              const filterKey = `${key}:${value}`;
              filterUsage[filterKey] = (filterUsage[filterKey] || 0) + 1;
            }
          });
        }
      });

      const popularFilters = Object.entries(filterUsage)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([filter, count]) => ({ filter, count }));

      setAnalytics({
        overview: {
          totalSearches,
          uniqueTerms,
          avgResultsPerSearch: avgResultsPerSearch.toFixed(1),
          savedSearchesCount: savedSearches.length
        },
        topTerms,
        hourlyPattern: hourlyData,
        dailyTrends: trendData,
        resultQuality: qualityData,
        popularFilters,
        timeRange,
        dateRange: {
          start: format(startDate, 'MMM dd, yyyy'),
          end: format(endDate, 'MMM dd, yyyy')
        }
      });
    } catch (error) {
      console.error('Error generating search analytics:', error);
      toast.error('Failed to generate search analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const exportAnalytics = (format) => {
    if (!analytics) return;

    try {
      const exportData = {
        overview: analytics.overview,
        topSearchTerms: analytics.topTerms,
        dailyTrends: analytics.dailyTrends,
        hourlyPattern: analytics.hourlyPattern,
        resultQuality: analytics.resultQuality,
        popularFilters: analytics.popularFilters,
        generatedAt: new Date().toISOString(),
        timeRange: analytics.timeRange,
        dateRange: analytics.dateRange
      };

      if (format === 'csv') {
        const csvData = analytics.topTerms.map(item => ({
          'Search Term': item.term,
          'Count': item.count,
          'Percentage': `${item.percentage}%`
        }));
        exportUtils.exportToCSV(csvData, 'search-analytics');
      } else {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `search-analytics-${format(new Date(), 'yyyy-MM-dd')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      toast.success(`Search analytics exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Failed to export as ${format.toUpperCase()}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Search Analytics</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Insights into search patterns and performance
                {analytics && ` • ${analytics.dateRange.start} - ${analytics.dateRange.end}`}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
              </select>
              <button
                onClick={() => exportAnalytics('csv')}
                className="btn-secondary flex items-center"
                disabled={!analytics}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
              <button
                onClick={() => exportAnalytics('json')}
                className="btn-secondary flex items-center"
                disabled={!analytics}
              >
                <Download className="w-4 h-4 mr-2" />
                Export JSON
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

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Generating analytics...</span>
            </div>
          ) : analytics ? (
            <div className="space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Searches</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.overview.totalSearches}</p>
                    </div>
                    <Search className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unique Terms</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.overview.uniqueTerms}</p>
                    </div>
                    <Star className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Results</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.overview.avgResultsPerSearch}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Saved Searches</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.overview.savedSearchesCount}</p>
                    </div>
                    <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Search Trends */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Daily Search Trends</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.dailyTrends}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="dateLabel" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#3B82F6"
                        strokeWidth={3}
                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Result Quality */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Search Result Quality</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.resultQuality}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {analytics.resultQuality.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Search Terms */}
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Search Terms</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Search Term
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Count
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Percentage
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {analytics.topTerms.map((term, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {term.term}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {term.count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {term.percentage}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Search Data</h3>
              <p className="text-gray-600 dark:text-gray-400">Start searching to see analytics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchAnalytics;