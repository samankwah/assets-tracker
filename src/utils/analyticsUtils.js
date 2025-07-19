import { 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear, 
  subMonths, 
  subYears, 
  isWithinInterval,
  parseISO,
  differenceInDays,
  differenceInMonths,
  format,
  eachMonthOfInterval,
  eachQuarterOfInterval,
  startOfQuarter,
  endOfQuarter
} from 'date-fns';

export const analyticsUtils = {
  /**
   * Calculate asset condition distribution
   */
  getConditionDistribution: (assets) => {
    const distribution = assets.reduce((acc, asset) => {
      const condition = asset.condition || 'Unknown';
      acc[condition] = (acc[condition] || 0) + 1;
      return acc;
    }, {});

    const total = assets.length;
    return Object.entries(distribution).map(([condition, count]) => ({
      condition,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }));
  },

  /**
   * Calculate asset type distribution
   */
  getTypeDistribution: (assets) => {
    const distribution = assets.reduce((acc, asset) => {
      const type = asset.type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const total = assets.length;
    return Object.entries(distribution).map(([type, count]) => ({
      type,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }));
  },

  /**
   * Calculate asset status distribution
   */
  getStatusDistribution: (assets) => {
    const distribution = assets.reduce((acc, asset) => {
      const status = asset.status || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const total = assets.length;
    return Object.entries(distribution).map(([status, count]) => ({
      status,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }));
  },

  /**
   * Calculate phase distribution
   */
  getPhaseDistribution: (assets) => {
    const distribution = assets.reduce((acc, asset) => {
      const phase = asset.currentPhase || 'Unknown';
      acc[phase] = (acc[phase] || 0) + 1;
      return acc;
    }, {});

    const total = assets.length;
    return Object.entries(distribution).map(([phase, count]) => ({
      phase,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }));
  },

  /**
   * Calculate maintenance trends over time
   */
  getMaintenanceTrends: (tasks, months = 12) => {
    const endDate = new Date();
    const startDate = subMonths(endDate, months);
    
    const monthsArray = eachMonthOfInterval({ start: startDate, end: endDate });
    
    return monthsArray.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthTasks = tasks.filter(task => {
        const taskDate = parseISO(task.createdAt);
        return isWithinInterval(taskDate, { start: monthStart, end: monthEnd });
      });
      
      const completedTasks = monthTasks.filter(task => task.status === 'Completed').length;
      const totalTasks = monthTasks.length;
      
      return {
        month: format(month, 'MMM yyyy'),
        date: month,
        total: totalTasks,
        completed: completedTasks,
        pending: totalTasks - completedTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      };
    });
  },

  /**
   * Calculate cost analysis
   */
  getCostAnalysis: (assets, tasks) => {
    // Mock cost data - in real implementation, this would come from actual cost tracking
    const assetCosts = assets.map(asset => {
      const maintenanceTasks = tasks.filter(task => 
        task.assetId === asset.id && task.type === 'Maintenance'
      );
      
      // Estimate costs based on asset type and tasks
      const baseCost = {
        'Apartment': 50000,
        'House': 150000,
        'Condo': 80000,
        'Commercial': 300000
      }[asset.type] || 100000;
      
      const maintenanceCost = maintenanceTasks.length * 500; // $500 per maintenance task
      const totalValue = baseCost;
      const annualCosts = maintenanceCost * 2; // Estimate annual costs
      
      return {
        assetId: asset.id,
        assetName: asset.name,
        type: asset.type,
        estimatedValue: totalValue,
        annualMaintenanceCost: annualCosts,
        maintenanceRatio: totalValue > 0 ? (annualCosts / totalValue) * 100 : 0,
        tasksCount: maintenanceTasks.length
      };
    });

    const totalValue = assetCosts.reduce((sum, cost) => sum + cost.estimatedValue, 0);
    const totalMaintenance = assetCosts.reduce((sum, cost) => sum + cost.annualMaintenanceCost, 0);
    
    return {
      assets: assetCosts,
      summary: {
        totalPortfolioValue: totalValue,
        totalAnnualMaintenance: totalMaintenance,
        averageMaintenanceRatio: totalValue > 0 ? (totalMaintenance / totalValue) * 100 : 0,
        mostExpensive: assetCosts.reduce((max, cost) => 
          cost.estimatedValue > max.estimatedValue ? cost : max, assetCosts[0] || {}),
        highestMaintenance: assetCosts.reduce((max, cost) => 
          cost.annualMaintenanceCost > max.annualMaintenanceCost ? cost : max, assetCosts[0] || {})
      }
    };
  },

  /**
   * Calculate asset performance metrics
   */
  getPerformanceMetrics: (assets, tasks) => {
    return assets.map(asset => {
      const assetTasks = tasks.filter(task => task.assetId === asset.id);
      const completedTasks = assetTasks.filter(task => task.status === 'Completed');
      const overdueTasks = assetTasks.filter(task => {
        const dueDate = parseISO(task.dueDate);
        return new Date() > dueDate && task.status !== 'Completed';
      });
      
      const lastInspection = asset.lastInspection ? parseISO(asset.lastInspection) : null;
      const daysSinceInspection = lastInspection ? differenceInDays(new Date(), lastInspection) : null;
      
      // Calculate performance score (0-100)
      let score = 100;
      
      // Deduct points for condition
      if (asset.condition === 'Critical') score -= 40;
      else if (asset.condition === 'Needs Repairs') score -= 25;
      else if (asset.condition === 'Fair') score -= 10;
      
      // Deduct points for overdue tasks
      score -= Math.min(overdueTasks.length * 5, 30);
      
      // Deduct points for old inspections
      if (daysSinceInspection > 365) score -= 20;
      else if (daysSinceInspection > 180) score -= 10;
      
      // Add points for completion rate
      const completionRate = assetTasks.length > 0 ? 
        (completedTasks.length / assetTasks.length) * 100 : 100;
      score += (completionRate - 70) * 0.2; // Bonus for high completion rates
      
      score = Math.max(0, Math.min(100, Math.round(score)));
      
      return {
        assetId: asset.id,
        assetName: asset.name,
        type: asset.type,
        condition: asset.condition,
        performanceScore: score,
        totalTasks: assetTasks.length,
        completedTasks: completedTasks.length,
        overdueTasks: overdueTasks.length,
        completionRate: Math.round(completionRate),
        daysSinceInspection,
        riskLevel: score >= 80 ? 'Low' : score >= 60 ? 'Medium' : score >= 40 ? 'High' : 'Critical'
      };
    });
  },

  /**
   * Get inspection schedule analysis
   */
  getInspectionAnalysis: (assets, tasks) => {
    const now = new Date();
    const upcoming30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const upcoming90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    
    const inspectionTasks = tasks.filter(task => task.type === 'Inspection');
    
    const overdue = assets.filter(asset => {
      if (!asset.nextInspection) return false;
      return parseISO(asset.nextInspection) < now;
    });
    
    const due30Days = assets.filter(asset => {
      if (!asset.nextInspection) return false;
      const nextInspection = parseISO(asset.nextInspection);
      return nextInspection >= now && nextInspection <= upcoming30Days;
    });
    
    const due90Days = assets.filter(asset => {
      if (!asset.nextInspection) return false;
      const nextInspection = parseISO(asset.nextInspection);
      return nextInspection > upcoming30Days && nextInspection <= upcoming90Days;
    });
    
    const noScheduled = assets.filter(asset => !asset.nextInspection);
    
    return {
      overdue: overdue.length,
      due30Days: due30Days.length,
      due90Days: due90Days.length,
      noScheduled: noScheduled.length,
      totalInspections: inspectionTasks.length,
      completedInspections: inspectionTasks.filter(task => task.status === 'Completed').length,
      details: {
        overdue: overdue.map(asset => ({
          id: asset.id,
          name: asset.name,
          nextInspection: asset.nextInspection,
          daysOverdue: differenceInDays(now, parseISO(asset.nextInspection))
        })),
        upcoming30: due30Days.map(asset => ({
          id: asset.id,
          name: asset.name,
          nextInspection: asset.nextInspection,
          daysUntil: differenceInDays(parseISO(asset.nextInspection), now)
        }))
      }
    };
  },

  /**
   * Calculate quarterly reports
   */
  getQuarterlyReport: (assets, tasks, year = new Date().getFullYear()) => {
    const quarters = eachQuarterOfInterval({
      start: new Date(year, 0, 1),
      end: new Date(year, 11, 31)
    });
    
    return quarters.map((quarter, index) => {
      const quarterStart = startOfQuarter(quarter);
      const quarterEnd = endOfQuarter(quarter);
      
      const quarterTasks = tasks.filter(task => {
        const taskDate = parseISO(task.createdAt);
        return isWithinInterval(taskDate, { start: quarterStart, end: quarterEnd });
      });
      
      const completedTasks = quarterTasks.filter(task => task.status === 'Completed');
      const maintenanceTasks = quarterTasks.filter(task => task.type === 'Maintenance');
      const inspectionTasks = quarterTasks.filter(task => task.type === 'Inspection');
      
      return {
        quarter: `Q${index + 1} ${year}`,
        period: `${format(quarterStart, 'MMM d')} - ${format(quarterEnd, 'MMM d, yyyy')}`,
        totalTasks: quarterTasks.length,
        completedTasks: completedTasks.length,
        maintenanceTasks: maintenanceTasks.length,
        inspectionTasks: inspectionTasks.length,
        completionRate: quarterTasks.length > 0 ? 
          Math.round((completedTasks.length / quarterTasks.length) * 100) : 0
      };
    });
  },

  /**
   * Get asset recommendations
   */
  getAssetRecommendations: (assets, tasks) => {
    const recommendations = [];
    const now = new Date();
    
    assets.forEach(asset => {
      const assetTasks = tasks.filter(task => task.assetId === asset.id);
      const overdueTasks = assetTasks.filter(task => {
        const dueDate = parseISO(task.dueDate);
        return now > dueDate && task.status !== 'Completed';
      });
      
      // Critical condition assets
      if (asset.condition === 'Critical') {
        recommendations.push({
          type: 'urgent',
          assetId: asset.id,
          assetName: asset.name,
          title: 'Critical Condition Asset',
          description: `${asset.name} is in critical condition and requires immediate attention.`,
          action: 'Schedule emergency inspection and repairs',
          priority: 'High'
        });
      }
      
      // Overdue inspections
      if (asset.nextInspection && parseISO(asset.nextInspection) < now) {
        const daysOverdue = differenceInDays(now, parseISO(asset.nextInspection));
        recommendations.push({
          type: 'overdue',
          assetId: asset.id,
          assetName: asset.name,
          title: 'Overdue Inspection',
          description: `Inspection is ${daysOverdue} days overdue for ${asset.name}.`,
          action: 'Schedule inspection immediately',
          priority: daysOverdue > 30 ? 'High' : 'Medium'
        });
      }
      
      // Multiple overdue tasks
      if (overdueTasks.length >= 3) {
        recommendations.push({
          type: 'maintenance',
          assetId: asset.id,
          assetName: asset.name,
          title: 'Multiple Overdue Tasks',
          description: `${asset.name} has ${overdueTasks.length} overdue tasks.`,
          action: 'Review and prioritize outstanding tasks',
          priority: 'Medium'
        });
      }
      
      // No recent maintenance
      const lastMaintenance = assetTasks
        .filter(task => task.type === 'Maintenance' && task.status === 'Completed')
        .sort((a, b) => new Date(b.completedAt || b.updatedAt) - new Date(a.completedAt || a.updatedAt))[0];
      
      if (!lastMaintenance || differenceInMonths(now, parseISO(lastMaintenance.completedAt || lastMaintenance.updatedAt)) > 6) {
        recommendations.push({
          type: 'maintenance',
          assetId: asset.id,
          assetName: asset.name,
          title: 'Maintenance Due',
          description: `${asset.name} hasn't had maintenance in over 6 months.`,
          action: 'Schedule preventive maintenance',
          priority: 'Low'
        });
      }
    });
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  },

  /**
   * Calculate asset utilization metrics
   */
  getAssetUtilization: (assets, tasks) => {
    return assets.map(asset => {
      const assetTasks = tasks.filter(task => task.assetId === asset.id)
      const completedTasks = assetTasks.filter(task => task.status === 'Completed')
      const pendingTasks = assetTasks.filter(task => task.status === 'Pending' || task.status === 'In Progress')
      
      // Calculate utilization score based on task activity and completion
      const taskActivity = assetTasks.length
      const completionRate = assetTasks.length > 0 ? (completedTasks.length / assetTasks.length) * 100 : 0
      const utilizationScore = Math.min(taskActivity * 10 + completionRate * 0.5, 100)
      
      return {
        assetId: asset.id,
        assetName: asset.name,
        type: asset.type,
        taskActivity,
        completionRate: Math.round(completionRate),
        pendingTasks: pendingTasks.length,
        utilizationScore: Math.round(utilizationScore),
        lastActivity: assetTasks.length > 0 ? 
          Math.max(...assetTasks.map(task => new Date(task.updatedAt || task.createdAt).getTime())) : null
      }
    })
  },

  /**
   * Calculate maintenance efficiency metrics
   */
  getMaintenanceEfficiency: (tasks) => {
    const maintenanceTasks = tasks.filter(task => task.type === 'Maintenance')
    const completedTasks = maintenanceTasks.filter(task => task.status === 'Completed')
    
    // Calculate average completion time
    const avgCompletionTime = completedTasks.reduce((total, task) => {
      const created = new Date(task.createdAt)
      const completed = new Date(task.completedAt || task.updatedAt)
      return total + (completed - created)
    }, 0) / completedTasks.length || 0
    
    // Convert to days
    const avgDays = Math.round(avgCompletionTime / (1000 * 60 * 60 * 24))
    
    // Calculate efficiency score
    const completionRate = maintenanceTasks.length > 0 ? 
      (completedTasks.length / maintenanceTasks.length) * 100 : 0
    const timeliness = Math.max(0, 100 - (avgDays * 5)) // Penalty for longer completion times
    const efficiencyScore = (completionRate * 0.7) + (timeliness * 0.3)
    
    return {
      totalTasks: maintenanceTasks.length,
      completedTasks: completedTasks.length,
      completionRate: Math.round(completionRate),
      avgCompletionDays: avgDays,
      efficiencyScore: Math.round(efficiencyScore),
      onTimeCompletion: completedTasks.filter(task => {
        const dueDate = new Date(task.dueDate)
        const completedDate = new Date(task.completedAt || task.updatedAt)
        return completedDate <= dueDate
      }).length
    }
  },

  /**
   * Calculate predictive maintenance insights
   */
  getPredictiveInsights: (assets, tasks) => {
    const insights = []
    const now = new Date()
    
    assets.forEach(asset => {
      const assetTasks = tasks.filter(task => task.assetId === asset.id)
      const maintenanceTasks = assetTasks.filter(task => task.type === 'Maintenance')
      
      // Predict next maintenance based on historical patterns
      if (maintenanceTasks.length >= 2) {
        const sortedTasks = maintenanceTasks
          .filter(task => task.completedAt)
          .sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt))
        
        if (sortedTasks.length >= 2) {
          const intervals = []
          for (let i = 1; i < sortedTasks.length; i++) {
            const interval = differenceInDays(
              parseISO(sortedTasks[i].completedAt),
              parseISO(sortedTasks[i-1].completedAt)
            )
            intervals.push(interval)
          }
          
          const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
          const lastMaintenance = parseISO(sortedTasks[sortedTasks.length - 1].completedAt)
          const predictedNext = new Date(lastMaintenance.getTime() + (avgInterval * 24 * 60 * 60 * 1000))
          
          insights.push({
            assetId: asset.id,
            assetName: asset.name,
            type: 'maintenance_prediction',
            predictedDate: predictedNext.toISOString(),
            confidence: Math.min(intervals.length * 20, 90), // Higher confidence with more data
            daysUntil: differenceInDays(predictedNext, now),
            avgMaintenanceInterval: Math.round(avgInterval)
          })
        }
      }
      
      // Predict potential failures based on condition trends
      if (asset.condition === 'Fair' || asset.condition === 'Needs Repairs') {
        const criticalTasks = assetTasks.filter(task => 
          task.priority === 'High' && task.status !== 'Completed'
        )
        
        if (criticalTasks.length >= 2) {
          insights.push({
            assetId: asset.id,
            assetName: asset.name,
            type: 'failure_risk',
            riskLevel: asset.condition === 'Needs Repairs' ? 'High' : 'Medium',
            criticalTasks: criticalTasks.length,
            recommendation: 'Schedule immediate inspection and preventive maintenance'
          })
        }
      }
    })
    
    return insights
  },

  /**
   * Calculate ROI and financial metrics
   */
  getFinancialMetrics: (assets, tasks) => {
    const totalPortfolioValue = assets.reduce((total, asset) => {
      const baseValue = {
        'Apartment': 250000,
        'House': 400000,
        'Condo': 300000,
        'Commercial': 800000
      }[asset.type] || 300000
      return total + baseValue
    }, 0)
    
    const totalMaintenanceCost = tasks
      .filter(task => task.type === 'Maintenance')
      .reduce((total, task) => total + (task.estimatedCost || 500), 0)
    
    const roi = totalPortfolioValue > 0 ? 
      ((totalPortfolioValue - totalMaintenanceCost) / totalPortfolioValue) * 100 : 0
    
    return {
      portfolioValue: totalPortfolioValue,
      maintenanceCost: totalMaintenanceCost,
      roi: Math.round(roi * 100) / 100,
      costPerAsset: Math.round(totalMaintenanceCost / assets.length),
      maintenanceRatio: totalPortfolioValue > 0 ? 
        Math.round((totalMaintenanceCost / totalPortfolioValue) * 10000) / 100 : 0
    }
  },

  /**
   * Generate benchmark comparisons
   */
  getBenchmarkComparisons: (assets, tasks) => {
    const userMetrics = {
      avgMaintenanceCost: tasks.filter(t => t.type === 'Maintenance').length * 500 / assets.length,
      completionRate: tasks.length > 0 ? 
        (tasks.filter(t => t.status === 'Completed').length / tasks.length) * 100 : 0,
      inspectionFrequency: assets.filter(a => a.lastInspection).length / assets.length * 100
    }
    
    // Industry benchmarks (these would come from external data in a real app)
    const benchmarks = {
      avgMaintenanceCost: 2000, // Annual per asset
      completionRate: 85,
      inspectionFrequency: 90
    }
    
    return {
      maintenanceCost: {
        user: Math.round(userMetrics.avgMaintenanceCost),
        benchmark: benchmarks.avgMaintenanceCost,
        comparison: userMetrics.avgMaintenanceCost < benchmarks.avgMaintenanceCost ? 'better' : 'worse',
        difference: Math.abs(userMetrics.avgMaintenanceCost - benchmarks.avgMaintenanceCost)
      },
      completionRate: {
        user: Math.round(userMetrics.completionRate),
        benchmark: benchmarks.completionRate,
        comparison: userMetrics.completionRate > benchmarks.completionRate ? 'better' : 'worse',
        difference: Math.abs(userMetrics.completionRate - benchmarks.completionRate)
      },
      inspectionFrequency: {
        user: Math.round(userMetrics.inspectionFrequency),
        benchmark: benchmarks.inspectionFrequency,
        comparison: userMetrics.inspectionFrequency > benchmarks.inspectionFrequency ? 'better' : 'worse',
        difference: Math.abs(userMetrics.inspectionFrequency - benchmarks.inspectionFrequency)
      }
    }
  },

  /**
   * Export analytics data
   */
  exportAnalyticsData: (assets, tasks, format = 'json') => {
    const data = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalAssets: assets.length,
        totalTasks: tasks.length,
        completedTasks: tasks.filter(task => task.status === 'Completed').length
      },
      conditionDistribution: analyticsUtils.getConditionDistribution(assets),
      typeDistribution: analyticsUtils.getTypeDistribution(assets),
      maintenanceTrends: analyticsUtils.getMaintenanceTrends(tasks),
      performanceMetrics: analyticsUtils.getPerformanceMetrics(assets, tasks),
      inspectionAnalysis: analyticsUtils.getInspectionAnalysis(assets, tasks),
      recommendations: analyticsUtils.getAssetRecommendations(assets, tasks),
      utilization: analyticsUtils.getAssetUtilization(assets, tasks),
      financialMetrics: analyticsUtils.getFinancialMetrics(assets, tasks),
      predictiveInsights: analyticsUtils.getPredictiveInsights(assets, tasks),
      benchmarks: analyticsUtils.getBenchmarkComparisons(assets, tasks)
    };
    
    if (format === 'csv') {
      // Convert to CSV format for key metrics
      const csvData = [
        ['Asset Name', 'Type', 'Condition', 'Performance Score', 'Total Tasks', 'Completed Tasks', 'Risk Level', 'Utilization Score'],
        ...data.performanceMetrics.map(metric => [
          metric.assetName,
          metric.type,
          metric.condition,
          metric.performanceScore,
          metric.totalTasks,
          metric.completedTasks,
          metric.riskLevel,
          data.utilization.find(u => u.assetId === metric.assetId)?.utilizationScore || 0
        ])
      ];
      
      return csvData.map(row => row.join(',')).join('\n');
    }
    
    return data;
  }
};

export default analyticsUtils;