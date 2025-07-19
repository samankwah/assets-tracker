import { addDays, addWeeks, addMonths, addYears, startOfDay, isAfter, isBefore, parseISO } from 'date-fns';

export const recurringTaskUtils = {
  /**
   * Calculate the next occurrence date based on frequency
   */
  calculateNextOccurrence: (lastDate, frequency) => {
    const date = typeof lastDate === 'string' ? parseISO(lastDate) : lastDate;
    
    switch (frequency) {
      case 'Daily':
        return addDays(date, 1);
      case 'Weekly':
        return addWeeks(date, 1);
      case 'Bi-weekly':
        return addWeeks(date, 2);
      case 'Monthly':
        return addMonths(date, 1);
      case 'Quarterly':
        return addMonths(date, 3);
      case 'Bi-annual':
        return addMonths(date, 6);
      case 'Annual':
      case 'Annually':
        return addYears(date, 1);
      default:
        return null;
    }
  },

  /**
   * Generate all occurrences between two dates
   */
  generateOccurrences: (startDate, endDate, frequency, maxOccurrences = 100) => {
    const occurrences = [];
    let currentDate = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
    
    let count = 0;
    while (isBefore(currentDate, end) && count < maxOccurrences) {
      occurrences.push(new Date(currentDate));
      
      const nextDate = recurringTaskUtils.calculateNextOccurrence(currentDate, frequency);
      if (!nextDate) break;
      
      currentDate = nextDate;
      count++;
    }
    
    return occurrences;
  },

  /**
   * Check if a task should be generated based on its frequency and last generated date
   */
  shouldGenerateTask: (lastGeneratedDate, frequency, lookAheadDays = 30) => {
    if (!lastGeneratedDate || frequency === 'One-time') return false;
    
    const now = new Date();
    const lastDate = typeof lastGeneratedDate === 'string' ? parseISO(lastGeneratedDate) : lastGeneratedDate;
    const nextDue = recurringTaskUtils.calculateNextOccurrence(lastDate, frequency);
    
    if (!nextDue) return false;
    
    // Generate if next occurrence is within lookAheadDays
    const lookAheadDate = addDays(now, lookAheadDays);
    return isBefore(nextDue, lookAheadDate) || isAfter(now, nextDue);
  },

  /**
   * Create recurring task data from a template or existing task
   */
  createRecurringTaskData: (baseTask, nextDueDate) => {
    const dueDate = typeof nextDueDate === 'string' ? parseISO(nextDueDate) : nextDueDate;
    
    return {
      ...baseTask,
      id: undefined, // Will be assigned by the store
      dueDate: dueDate.toISOString(),
      status: 'Not Inspected',
      isRecurring: true,
      parentTaskId: baseTask.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notifications: {
        ...baseTask.notifications,
        sent: false
      },
      checklist: baseTask.checklist ? baseTask.checklist.map(item => ({
        ...item,
        completed: false
      })) : []
    };
  },

  /**
   * Generate recurring tasks for a specific period
   */
  generateRecurringTasks: (templates, assets, startDate = new Date(), endDate = addMonths(new Date(), 6)) => {
    const generatedTasks = [];
    
    templates.forEach(template => {
      if (template.frequency === 'One-time') return;
      
      // Generate tasks for each applicable asset
      const applicableAssets = assets.filter(asset => {
        // Filter based on template phase requirements
        if (template.phase && asset.currentPhase !== template.phase) {
          return false;
        }
        
        // Filter based on asset type if template specifies
        if (template.assetTypes && !template.assetTypes.includes(asset.type)) {
          return false;
        }
        
        return true;
      });
      
      applicableAssets.forEach(asset => {
        const occurrences = recurringTaskUtils.generateOccurrences(
          startDate,
          endDate,
          template.frequency
        );
        
        occurrences.forEach(dueDate => {
          const taskData = {
            title: `${template.name} - ${asset.name}`,
            description: template.description,
            assetId: asset.id,
            assetName: asset.name,
            type: template.type,
            priority: template.priority,
            frequency: template.frequency,
            dueDate: dueDate.toISOString(),
            time: '09:00',
            assignedTo: '',
            templateId: template.id,
            isRecurring: true,
            status: 'Not Inspected',
            checklist: template.checklist ? template.checklist.map((item, index) => ({
              id: index + 1,
              text: item,
              completed: false
            })) : [],
            notes: template.notes || '',
            requiredTools: template.requiredTools || [],
            notifications: {
              email: true,
              sms: false,
              inApp: true,
              sent: false
            },
            notificationSettings: {
              type: 'Email',
              reminderTime: '1 day before'
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          generatedTasks.push(taskData);
        });
      });
    });
    
    return generatedTasks;
  },

  /**
   * Get upcoming recurring tasks that need to be generated
   */
  getUpcomingRecurringTasks: (existingTasks, templates, assets, lookAheadDays = 30) => {
    const now = new Date();
    const lookAheadDate = addDays(now, lookAheadDays);
    const upcomingTasks = [];
    
    templates.forEach(template => {
      if (template.frequency === 'One-time') return;
      
      assets.forEach(asset => {
        // Find the latest task for this template + asset combination
        const relatedTasks = existingTasks.filter(task => 
          task.templateId === template.id && 
          task.assetId === asset.id &&
          task.isRecurring
        );
        
        let lastTaskDate = null;
        if (relatedTasks.length > 0) {
          // Find the most recent task
          const sortedTasks = relatedTasks.sort((a, b) => 
            new Date(b.dueDate) - new Date(a.dueDate)
          );
          lastTaskDate = parseISO(sortedTasks[0].dueDate);
        } else {
          // No previous tasks, start from now
          lastTaskDate = now;
        }
        
        // Calculate next occurrence
        const nextOccurrence = recurringTaskUtils.calculateNextOccurrence(lastTaskDate, template.frequency);
        
        if (nextOccurrence && isBefore(nextOccurrence, lookAheadDate)) {
          // Check if this task already exists
          const existingTask = existingTasks.find(task =>
            task.templateId === template.id &&
            task.assetId === asset.id &&
            startOfDay(parseISO(task.dueDate)).getTime() === startOfDay(nextOccurrence).getTime()
          );
          
          if (!existingTask) {
            const taskData = recurringTaskUtils.createRecurringTaskData({
              ...template,
              assetId: asset.id,
              assetName: asset.name,
              title: `${template.name} - ${asset.name}`
            }, nextOccurrence);
            
            upcomingTasks.push(taskData);
          }
        }
      });
    });
    
    return upcomingTasks;
  },

  /**
   * Get recurring task statistics
   */
  getRecurringTaskStats: (tasks) => {
    const recurringTasks = tasks.filter(task => task.isRecurring);
    const now = new Date();
    
    return {
      total: recurringTasks.length,
      overdue: recurringTasks.filter(task => 
        isBefore(parseISO(task.dueDate), now) && task.status !== 'Completed'
      ).length,
      dueToday: recurringTasks.filter(task => {
        const taskDate = startOfDay(parseISO(task.dueDate));
        const today = startOfDay(now);
        return taskDate.getTime() === today.getTime() && task.status !== 'Completed';
      }).length,
      upcoming: recurringTasks.filter(task => {
        const taskDate = parseISO(task.dueDate);
        const weekFromNow = addDays(now, 7);
        return isAfter(taskDate, now) && isBefore(taskDate, weekFromNow) && task.status !== 'Completed';
      }).length,
      completed: recurringTasks.filter(task => task.status === 'Completed').length
    };
  },

  /**
   * Validate recurring task configuration
   */
  validateRecurringConfig: (taskData) => {
    const errors = [];
    
    if (!taskData.frequency || taskData.frequency === 'One-time') {
      errors.push('Frequency must be specified for recurring tasks');
    }
    
    if (!taskData.dueDate) {
      errors.push('Due date is required');
    }
    
    if (!taskData.assetId) {
      errors.push('Asset must be selected');
    }
    
    if (!taskData.title || taskData.title.trim() === '') {
      errors.push('Task title is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Format frequency for display
   */
  formatFrequency: (frequency) => {
    const frequencyMap = {
      'Daily': 'Every day',
      'Weekly': 'Every week',
      'Bi-weekly': 'Every 2 weeks',
      'Monthly': 'Every month',
      'Quarterly': 'Every 3 months',
      'Bi-annual': 'Every 6 months',
      'Annual': 'Every year',
      'Annually': 'Every year',
      'One-time': 'One-time only'
    };
    
    return frequencyMap[frequency] || frequency;
  }
};

export default recurringTaskUtils;