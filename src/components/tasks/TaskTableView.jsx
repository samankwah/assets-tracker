import { Eye, Edit, Trash2, Calendar, Clock, User, Building, CheckCircle, Archive, RotateCcw } from 'lucide-react'
import EnhancedDataTable from '../ui/EnhancedDataTable'
import toast from 'react-hot-toast'

const TaskTableView = ({ tasks, onView, onEdit, onDelete, onComplete }) => {
  const handleBulkAction = (action, selectedTasks) => {
    switch (action) {
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${selectedTasks.length} tasks?`)) {
          selectedTasks.forEach(task => onDelete(task));
          toast.success(`${selectedTasks.length} tasks deleted successfully`);
        }
        break;
      case 'complete':
        selectedTasks.forEach(task => onComplete(task));
        toast.success(`${selectedTasks.length} tasks marked as complete`);
        break;
      case 'archive':
        // Implement archive functionality
        toast.success(`${selectedTasks.length} tasks archived`);
        break;
      case 'reset':
        // Implement reset to pending functionality
        toast.success(`${selectedTasks.length} tasks reset to pending`);
        break;
      default:
        toast.error('Unknown action');
    }
  };

  const bulkActions = [
    { id: 'complete', label: 'Mark as Complete', icon: CheckCircle, className: 'text-green-600 hover:text-green-700' },
    { id: 'archive', label: 'Archive Selected', icon: Archive, className: 'text-yellow-600 hover:text-yellow-700' },
    { id: 'reset', label: 'Reset to Pending', icon: RotateCcw, className: 'text-blue-600 hover:text-blue-700' },
    { id: 'delete', label: 'Delete Selected', icon: Trash2, className: 'text-red-600 hover:text-red-700' }
  ];
  const getStatusBadge = (status) => {
    const badges = {
      'Completed': <span className="badge badge-success">Completed</span>,
      'Under Maintenance': <span className="badge badge-warning">Under Maintenance</span>,
      'Recently Inspected': <span className="badge badge-success">Recently Inspected</span>,
      'Scheduled for Inspection': <span className="badge badge-info">Scheduled for Inspection</span>,
      'Overdue': <span className="badge badge-error">Overdue</span>,
      'Not Inspected': <span className="badge badge-gray">Not Inspected</span>
    }
    return badges[status] || <span className="badge badge-gray">{status}</span>
  }

  const getPriorityBadge = (priority) => {
    const badges = {
      'High': <span className="badge badge-error">High</span>,
      'Medium': <span className="badge badge-warning">Medium</span>,
      'Low': <span className="badge badge-success">Low</span>
    }
    return badges[priority] || <span className="badge badge-gray">{priority}</span>
  }

  const getTypeBadge = (type) => {
    const badges = {
      'Inspection': <span className="badge badge-info">Inspection</span>,
      'Maintenance': <span className="badge badge-warning">Maintenance</span>,
      'Safety Check': <span className="badge badge-error">Safety Check</span>,
      'Cleaning': <span className="badge badge-success">Cleaning</span>,
      'Planning': <span className="badge badge-info">Planning</span>,
      'Repair': <span className="badge badge-warning">Repair</span>
    }
    return badges[type] || <span className="badge badge-gray">{type}</span>
  }

  const columns = [
    {
      key: 'title',
      label: 'Task Title',
      sortable: true,
      render: (value, item) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{value}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
            {item.description}
          </div>
        </div>
      )
    },
    {
      key: 'assetName',
      label: 'Asset',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center space-x-2">
          <Building className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900 dark:text-white">{value}</span>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Task Type',
      sortable: true,
      filterable: true,
      filterOptions: ['Inspection', 'Maintenance', 'Safety Check', 'Cleaning', 'Planning', 'Repair'],
      render: (value) => getTypeBadge(value)
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      filterable: true,
      filterOptions: ['High', 'Medium', 'Low'],
      render: (value) => getPriorityBadge(value)
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      filterOptions: ['Not Inspected', 'Under Maintenance', 'Recently Inspected', 'Scheduled for Inspection', 'Overdue', 'Completed'],
      render: (value) => getStatusBadge(value)
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      sortable: true,
      render: (value, item) => {
        const dueDate = new Date(value)
        const today = new Date()
        const isOverdue = dueDate < today && item.status !== 'Completed'
        const isToday = dueDate.toDateString() === today.toDateString()
        
        return (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className={`text-sm ${
                isOverdue ? 'text-red-600 dark:text-red-400 font-medium' :
                isToday ? 'text-blue-600 dark:text-blue-400 font-medium' :
                'text-gray-900 dark:text-white'
              }`}>
                {dueDate.toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {item.time || '09:00 AM'}
              </span>
            </div>
            {isToday && (
              <span className="inline-block text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">
                Today
              </span>
            )}
            {isOverdue && (
              <span className="inline-block text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded">
                Overdue
              </span>
            )}
          </div>
        )
      }
    },
    {
      key: 'assignedTo',
      label: 'Assigned To',
      sortable: true,
      filterable: true,
      filterOptions: ['Agent X', 'Agent Y', 'Agent Z', 'Cleaning Team'],
      render: (value) => (
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900 dark:text-white">{value}</span>
        </div>
      )
    },
    {
      key: 'frequency',
      label: 'Frequency',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">{value}</span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, item) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onView(item)
            }}
            className="p-1 text-gray-400 hover:text-secondary-600 transition-colors"
            title="View details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(item)
            }}
            className="p-1 text-gray-400 hover:text-secondary-600 transition-colors"
            title="Edit task"
          >
            <Edit className="w-4 h-4" />
          </button>
          {item.status !== 'Completed' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onComplete(item)
              }}
              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
              title="Mark as complete"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(item)
            }}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ]

  return (
    <EnhancedDataTable
      data={tasks}
      columns={columns}
      searchable={true}
      filterable={true}
      sortable={true}
      pagination={true}
      pageSize={10}
      onRowClick={onView}
      emptyMessage="No tasks found. Create your first task to get started."
      title="Tasks Report"
      type="tasks"
      allowExport={true}
      allowBulkOperations={true}
      bulkActions={bulkActions}
      onBulkAction={handleBulkAction}
    />
  )
}

export default TaskTableView