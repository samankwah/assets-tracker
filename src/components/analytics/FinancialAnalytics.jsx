import React from 'react';
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
  ResponsiveContainer
} from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Calculator } from 'lucide-react';
import { format } from 'date-fns';

const FinancialAnalytics = ({ assets, tasks }) => {
  // Calculate financial metrics
  const calculateFinancialMetrics = () => {
    const totalAssetValue = assets.reduce((sum, asset) => {
      const baseValue = {
        'Apartment': 250000,
        'House': 400000,
        'Condo': 300000,
        'Commercial': 800000
      }[asset.type] || 300000;

      const conditionMultiplier = {
        'Good': 1.0,
        'Fair': 0.85,
        'Needs Repairs': 0.7,
        'Critical': 0.5
      }[asset.condition] || 0.8;

      return sum + (baseValue * conditionMultiplier);
    }, 0);

    const maintenanceTasks = tasks.filter(task => task.type === 'Maintenance');
    const totalMaintenanceCost = maintenanceTasks.reduce((sum, task) => {
      const cost = {
        'Routine Maintenance': 500,
        'Emergency Repair': 1500,
        'Inspection': 300,
        'Cleaning': 200,
        'HVAC Maintenance': 800,
        'Plumbing': 600,
        'Electrical': 700
      }[task.title] || 400;
      return sum + cost;
    }, 0);

    const monthlyMaintenanceCost = totalMaintenanceCost / 12;
    const maintenanceRatio = totalAssetValue > 0 ? (totalMaintenanceCost / totalAssetValue) * 100 : 0;

    return {
      totalAssetValue,
      totalMaintenanceCost,
      monthlyMaintenanceCost,
      maintenanceRatio,
      averageAssetValue: assets.length > 0 ? totalAssetValue / assets.length : 0,
      costPerAsset: assets.length > 0 ? totalMaintenanceCost / assets.length : 0
    };
  };

  // Generate cost breakdown by asset type
  const getCostBreakdownByType = () => {
    const breakdown = {};
    
    assets.forEach(asset => {
      if (!breakdown[asset.type]) {
        breakdown[asset.type] = {
          type: asset.type,
          count: 0,
          totalValue: 0,
          maintenanceCost: 0
        };
      }
      
      breakdown[asset.type].count++;
      
      const baseValue = {
        'Apartment': 250000,
        'House': 400000,
        'Condo': 300000,
        'Commercial': 800000
      }[asset.type] || 300000;

      const conditionMultiplier = {
        'Good': 1.0,
        'Fair': 0.85,
        'Needs Repairs': 0.7,
        'Critical': 0.5
      }[asset.condition] || 0.8;

      breakdown[asset.type].totalValue += baseValue * conditionMultiplier;
      
      // Calculate maintenance costs for this asset
      const assetTasks = tasks.filter(task => task.assetId === asset.id && task.type === 'Maintenance');
      const assetMaintenanceCost = assetTasks.reduce((sum, task) => {
        const cost = {
          'Routine Maintenance': 500,
          'Emergency Repair': 1500,
          'Inspection': 300,
          'Cleaning': 200,
          'HVAC Maintenance': 800,
          'Plumbing': 600,
          'Electrical': 700
        }[task.title] || 400;
        return sum + cost;
      }, 0);
      
      breakdown[asset.type].maintenanceCost += assetMaintenanceCost;
    });

    return Object.values(breakdown).map(item => ({
      ...item,
      averageValue: item.totalValue / item.count,
      averageMaintenanceCost: item.maintenanceCost / item.count,
      maintenanceRatio: (item.maintenanceCost / item.totalValue) * 100
    }));
  };

  // Generate monthly financial trends
  const getMonthlyFinancialTrends = () => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthTasks = tasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate.getMonth() === date.getMonth() && 
               taskDate.getFullYear() === date.getFullYear() &&
               task.type === 'Maintenance';
      });
      
      const monthlyMaintenanceCost = monthTasks.reduce((sum, task) => {
        const cost = {
          'Routine Maintenance': 500,
          'Emergency Repair': 1500,
          'Inspection': 300,
          'Cleaning': 200,
          'HVAC Maintenance': 800,
          'Plumbing': 600,
          'Electrical': 700
        }[task.title] || 400;
        return sum + cost;
      }, 0);
      
      months.push({
        month: format(date, 'MMM yyyy'),
        maintenanceCost: monthlyMaintenanceCost,
        tasksCompleted: monthTasks.filter(t => t.status === 'Completed').length
      });
    }
    
    return months;
  };

  const financialMetrics = calculateFinancialMetrics();
  const costBreakdown = getCostBreakdownByType();
  const monthlyTrends = getMonthlyFinancialTrends();

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
      green: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
      red: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
      orange: 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800'
    };

    const iconColorClasses = {
      blue: 'text-blue-600 dark:text-blue-400',
      green: 'text-green-600 dark:text-green-400',
      red: 'text-red-600 dark:text-red-400',
      orange: 'text-orange-600 dark:text-orange-400'
    };

    return (
      <div className={`p-6 rounded-lg border ${colorClasses[color]}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
            )}
          </div>
          <Icon className={`w-8 h-8 ${iconColorClasses[color]}`} />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={DollarSign}
          title="Total Portfolio Value"
          value={`$${(financialMetrics.totalAssetValue / 1000000).toFixed(1)}M`}
          subtitle={`${assets.length} assets`}
          color="blue"
        />
        <StatCard
          icon={Calculator}
          title="Annual Maintenance"
          value={`$${(financialMetrics.totalMaintenanceCost / 1000).toFixed(0)}K`}
          subtitle={`${financialMetrics.maintenanceRatio.toFixed(1)}% of portfolio`}
          color="orange"
        />
        <StatCard
          icon={TrendingUp}
          title="Average Asset Value"
          value={`$${(financialMetrics.averageAssetValue / 1000).toFixed(0)}K`}
          subtitle="Per asset"
          color="green"
        />
        <StatCard
          icon={TrendingDown}
          title="Cost Per Asset"
          value={`$${financialMetrics.costPerAsset.toFixed(0)}`}
          subtitle="Annual maintenance"
          color="red"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Maintenance Costs */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Monthly Maintenance Costs
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--bg-color)', 
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px'
                }}
                formatter={(value, name) => [
                  name === 'maintenanceCost' ? `$${value}` : value,
                  name === 'maintenanceCost' ? 'Maintenance Cost' : 'Tasks Completed'
                ]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="maintenanceCost"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                name="Maintenance Cost"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Cost Breakdown by Asset Type */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Cost Analysis by Asset Type
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costBreakdown}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="type" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--bg-color)', 
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px'
                }}
                formatter={(value, name) => [
                  `$${(value / 1000).toFixed(0)}K`,
                  name === 'averageValue' ? 'Avg Value' : 'Avg Maintenance Cost'
                ]}
              />
              <Legend />
              <Bar
                dataKey="averageValue"
                fill="#10B981"
                name="Average Value"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="averageMaintenanceCost"
                fill="#F59E0B"
                name="Average Maintenance Cost"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Financial Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Financial Breakdown by Asset Type
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Asset Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Avg Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Maintenance Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Maintenance Ratio
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {costBreakdown.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {item.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {item.count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    ${(item.totalValue / 1000000).toFixed(2)}M
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    ${(item.averageValue / 1000).toFixed(0)}K
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    ${item.averageMaintenanceCost.toFixed(0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.maintenanceRatio > 5 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        : item.maintenanceRatio > 3
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    }`}>
                      {item.maintenanceRatio.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinancialAnalytics;