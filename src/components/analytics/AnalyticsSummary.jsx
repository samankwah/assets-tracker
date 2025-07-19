import React, { useMemo } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, Calendar, Eye } from 'lucide-react';
import { analyticsUtils } from '../../utils/analyticsUtils';

const AnalyticsSummary = ({ assets, tasks, onViewDetails }) => {
  const analytics = useMemo(() => {
    if (!assets.length) return null;
    
    return {
      conditionDistribution: analyticsUtils.getConditionDistribution(assets),
      performanceMetrics: analyticsUtils.getPerformanceMetrics(assets, tasks),
      inspectionAnalysis: analyticsUtils.getInspectionAnalysis(assets, tasks),
      recommendations: analyticsUtils.getAssetRecommendations(assets, tasks)
    };
  }, [assets, tasks]);

  if (!analytics) return null;

  const highPerformers = analytics.performanceMetrics.filter(m => m.performanceScore >= 80).length;
  const atRisk = analytics.performanceMetrics.filter(m => m.riskLevel === 'High' || m.riskLevel === 'Critical').length;
  const needsRepairs = analytics.conditionDistribution.find(d => d.condition === 'Needs Repairs')?.count || 0;
  const critical = analytics.conditionDistribution.find(d => d.condition === 'Critical')?.count || 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Portfolio Analytics</h3>
        <button
          onClick={onViewDetails}
          className="btn-secondary flex items-center text-sm"
        >
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">High Performers</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">{highPerformers}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">At Risk</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">{atRisk}</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Overdue Inspections</p>
              <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{analytics.inspectionAnalysis.overdue}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Need Repairs</p>
              <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{needsRepairs + critical}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Recommendations */}
      {analytics.recommendations.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Top Recommendations</h4>
          <div className="space-y-2">
            {analytics.recommendations.slice(0, 3).map((rec, index) => (
              <div key={index} className={`p-3 rounded-lg text-sm border-l-4 ${
                rec.priority === 'High' ? 'border-red-500 bg-red-50 dark:bg-red-900/10' :
                rec.priority === 'Medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' :
                'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{rec.title}</p>
                    <p className="text-gray-600 dark:text-gray-400">{rec.assetName}</p>
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
          {analytics.recommendations.length > 3 && (
            <button
              onClick={onViewDetails}
              className="mt-3 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              View {analytics.recommendations.length - 3} more recommendations
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyticsSummary;