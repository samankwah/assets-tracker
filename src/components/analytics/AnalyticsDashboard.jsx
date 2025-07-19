import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Calendar,
  DollarSign,
  Home,
  Activity,
  Download,
  RefreshCw,
  Filter,
  Eye
} from 'lucide-react';
import { useAssetStore } from '../../stores/assetStore';
import { useTaskStore } from '../../stores/taskStore';
import { analyticsUtils } from '../../utils/analyticsUtils';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const AnalyticsDashboard = ({ isOpen, onClose }) => {
  const { assets } = useAssetStore();
  const { tasks } = useTaskStore();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('12months');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && assets.length > 0) {
      generateAnalytics();
    }
  }, [isOpen, assets, tasks, dateRange]);

  const generateAnalytics = async () => {
    setLoading(true);
    try {
      const months = dateRange === '6months' ? 6 : dateRange === '12months' ? 12 : 24;
      
      const analyticsData = {
        conditionDistribution: analyticsUtils.getConditionDistribution(assets),
        typeDistribution: analyticsUtils.getTypeDistribution(assets),
        statusDistribution: analyticsUtils.getStatusDistribution(assets),
        phaseDistribution: analyticsUtils.getPhaseDistribution(assets),
        maintenanceTrends: analyticsUtils.getMaintenanceTrends(tasks, months),
        costAnalysis: analyticsUtils.getCostAnalysis(assets, tasks),
        performanceMetrics: analyticsUtils.getPerformanceMetrics(assets, tasks),
        inspectionAnalysis: analyticsUtils.getInspectionAnalysis(assets, tasks),
        quarterlyReport: analyticsUtils.getQuarterlyReport(assets, tasks),
        recommendations: analyticsUtils.getAssetRecommendations(assets, tasks)
      };
      
      setAnalytics(analyticsData);
    } catch (error) {
      toast.error('Failed to generate analytics');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = (format) => {
    try {
      const data = analyticsUtils.exportAnalyticsData(assets, tasks, format);
      
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.json`;
        a.click();
      } else if (format === 'csv') {
        const blob = new Blob([data], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
      }
      
      toast.success(`Analytics exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export analytics');
      console.error(error);
    }
  };

  const COLORS = {
    primary: ['#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE'],
    condition: {
      'Good': '#10B981',
      'Fair': '#F59E0B',
      'Needs Repairs': '#EF4444',
      'Critical': '#DC2626'
    },
    status: {
      'Active': '#10B981',
      'Under Maintenance': '#F59E0B',
      'Decommissioned': '#6B7280'
    }
  };

  const StatCard = ({ icon: Icon, title, value, trend, trendValue, color = 'blue' }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {trend && (
            <div className={`flex items-center mt-1 text-sm ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {trendValue}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/20`}>
          <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-7xl h-full max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <Activity className="w-6 h-6 mr-3 text-blue-600" />
                Portfolio Analytics
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Comprehensive insights into your property portfolio performance
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="6months">Last 6 Months</option>
                <option value="12months">Last 12 Months</option>
                <option value="24months">Last 24 Months</option>
              </select>
              <button
                onClick={() => exportAnalytics('csv')}
                className="btn-secondary flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
              <button
                onClick={() => exportAnalytics('json')}
                className="btn-secondary flex items-center"
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

          {/* Tabs */}
          <div className="flex space-x-8 mt-6">
            {[
              { key: 'overview', label: 'Overview', icon: Eye },
              { key: 'performance', label: 'Performance', icon: TrendingUp },
              { key: 'maintenance', label: 'Maintenance', icon: Calendar },
              { key: 'financial', label: 'Financial', icon: DollarSign }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.key
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Generating analytics...</span>
            </div>
          ) : analytics ? (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                      icon={Home}
                      title="Total Assets"
                      value={assets.length}
                      color="blue"
                    />
                    <StatCard
                      icon={CheckCircle}
                      title="Good Condition"
                      value={analytics.conditionDistribution.find(d => d.condition === 'Good')?.count || 0}
                      color="green"
                    />
                    <StatCard
                      icon={AlertTriangle}
                      title="Need Attention"
                      value={
                        (analytics.conditionDistribution.find(d => d.condition === 'Needs Repairs')?.count || 0) +
                        (analytics.conditionDistribution.find(d => d.condition === 'Critical')?.count || 0)
                      }
                      color="red"
                    />
                    <StatCard
                      icon={Calendar}
                      title="Overdue Inspections"
                      value={analytics.inspectionAnalysis.overdue}
                      color="orange"
                    />
                  </div>

                  {/* Charts Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Condition Distribution */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Asset Condition</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={analytics.conditionDistribution}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="count"
                            nameKey="condition"
                          >
                            {analytics.conditionDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS.condition[entry.condition] || COLORS.primary[index % 4]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Type Distribution */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Asset Types</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={analytics.typeDistribution}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="type" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#3B82F6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Recommendations */}
                  {analytics.recommendations.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recommendations</h3>
                      <div className="space-y-3">
                        {analytics.recommendations.slice(0, 5).map((rec, index) => (
                          <div key={index} className={`p-4 rounded-lg border-l-4 ${
                            rec.priority === 'High' ? 'border-red-500 bg-red-50 dark:bg-red-900/10' :
                            rec.priority === 'Medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' :
                            'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">{rec.title}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{rec.description}</p>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">{rec.action}</p>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded ${
                                rec.priority === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              }`}>
                                {rec.priority}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Performance Tab */}
              {activeTab === 'performance' && (
                <div className="space-y-6">
                  {/* Performance Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                      icon={TrendingUp}
                      title="Avg Performance"
                      value={Math.round(analytics.performanceMetrics.reduce((sum, m) => sum + m.performanceScore, 0) / analytics.performanceMetrics.length) || 0}
                      color="blue"
                    />
                    <StatCard
                      icon={CheckCircle}
                      title="High Performers"
                      value={analytics.performanceMetrics.filter(m => m.performanceScore >= 80).length}
                      color="green"
                    />
                    <StatCard
                      icon={AlertTriangle}
                      title="At Risk"
                      value={analytics.performanceMetrics.filter(m => m.riskLevel === 'High' || m.riskLevel === 'Critical').length}
                      color="red"
                    />
                  </div>

                  {/* Performance Chart */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Asset Performance Scores</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.performanceMetrics.slice(0, 10)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="assetName" angle={-45} textAnchor="end" height={100} />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Bar dataKey="performanceScore" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Maintenance Tab */}
              {activeTab === 'maintenance' && (
                <div className="space-y-6">
                  {/* Maintenance Trends */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Maintenance Trends</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analytics.maintenanceTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="total" stroke="#3B82F6" name="Total Tasks" />
                        <Line type="monotone" dataKey="completed" stroke="#10B981" name="Completed" />
                        <Line type="monotone" dataKey="pending" stroke="#EF4444" name="Pending" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Inspection Analysis */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard
                      icon={AlertTriangle}
                      title="Overdue"
                      value={analytics.inspectionAnalysis.overdue}
                      color="red"
                    />
                    <StatCard
                      icon={Calendar}
                      title="Due 30 Days"
                      value={analytics.inspectionAnalysis.due30Days}
                      color="yellow"
                    />
                    <StatCard
                      icon={Calendar}
                      title="Due 90 Days"
                      value={analytics.inspectionAnalysis.due90Days}
                      color="blue"
                    />
                    <StatCard
                      icon={AlertTriangle}
                      title="Not Scheduled"
                      value={analytics.inspectionAnalysis.noScheduled}
                      color="gray"
                    />
                  </div>
                </div>
              )}

              {/* Financial Tab */}
              {activeTab === 'financial' && (
                <div className="space-y-6">
                  {/* Financial Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                      icon={DollarSign}
                      title="Portfolio Value"
                      value={`$${(analytics.costAnalysis.summary.totalPortfolioValue / 1000000).toFixed(1)}M`}
                      color="green"
                    />
                    <StatCard
                      icon={TrendingUp}
                      title="Annual Maintenance"
                      value={`$${(analytics.costAnalysis.summary.totalAnnualMaintenance / 1000).toFixed(0)}K`}
                      color="blue"
                    />
                    <StatCard
                      icon={Activity}
                      title="Maintenance Ratio"
                      value={`${analytics.costAnalysis.summary.averageMaintenanceRatio.toFixed(1)}%`}
                      color="orange"
                    />
                  </div>

                  {/* Cost Analysis Chart */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Asset Values vs Maintenance Costs</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.costAnalysis.assets.slice(0, 10)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="assetName" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                        <Legend />
                        <Bar dataKey="estimatedValue" fill="#3B82F6" name="Estimated Value" />
                        <Bar dataKey="annualMaintenanceCost" fill="#EF4444" name="Annual Maintenance" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Data Available</h3>
              <p className="text-gray-600 dark:text-gray-400">Add some assets and tasks to see analytics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;