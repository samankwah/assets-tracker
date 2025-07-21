import { Trash2, CheckCircle, Archive, RotateCcw } from 'lucide-react'
import EnhancedDataTable from '../ui/EnhancedDataTable'
import { useAssetStore } from '../../stores/assetStore'
import toast from 'react-hot-toast'

const TaskTableView = ({ tasks, onView, onDelete, onComplete }) => {
  const { getAssetById } = useAssetStore()

  // Enhance tasks with asset information
  const enhancedTasks = tasks.map(task => {
    const asset = getAssetById(task.assetId)
    return {
      ...task,
      assetType: asset?.type || 'Unknown',
      assetStatus: asset?.status || 'Unknown',
      assetCondition: asset?.condition || 'Unknown'
    }
  })
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
    { 
      id: 'complete', 
      label: 'Mark as Complete', 
      icon: CheckCircle, 
      className: 'bg-green-600 text-white hover:bg-green-700',
      onClick: (selectedTasks) => handleBulkAction('complete', selectedTasks)
    },
    { 
      id: 'archive', 
      label: 'Archive Selected', 
      icon: Archive, 
      className: 'bg-yellow-600 text-white hover:bg-yellow-700',
      onClick: (selectedTasks) => handleBulkAction('archive', selectedTasks)
    },
    { 
      id: 'reset', 
      label: 'Reset to Pending', 
      icon: RotateCcw, 
      className: 'bg-blue-600 text-white hover:bg-blue-700',
      onClick: (selectedTasks) => handleBulkAction('reset', selectedTasks)
    },
    { 
      id: 'delete', 
      label: 'Delete Selected', 
      icon: Trash2, 
      className: 'bg-red-600 text-white hover:bg-red-700',
      onClick: (selectedTasks) => handleBulkAction('delete', selectedTasks)
    }
  ];
  const getAssetStatusBadge = (status) => {
    const badges = {
      'Active': <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Active</span>,
      'Under Maintenance': <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Under Maintenance</span>,
      'Decommissioned': <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Decommissioned</span>
    }
    return badges[status] || <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status}</span>
  }

  const getAssetConditionBadge = (condition) => {
    const badges = {
      'Good': <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Good</span>,
      'Needs Repairs': <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">Needs Repairs</span>,
      'Critical': <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Critical</span>
    }
    return badges[condition] || <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{condition}</span>
  }

  const getTaskTypeBadge = (type) => {
    const badges = {
      'Inspection': <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Inspection</span>,
      'Maintenance': <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">Maintenance</span>,
      'Safety Check': <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Safety Check</span>,
      'Cleaning': <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Cleaning</span>,
      'Planning': <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Planning</span>,
      'Repair': <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Repair</span>
    }
    return badges[type] || <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{type}</span>
  }

  const getPriorityBadge = (priority) => {
    const badges = {
      'High': <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">High</span>,
      'Medium': <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">Medium</span>,
      'Low': <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Low</span>
    }
    return badges[priority] || <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{priority}</span>
  }

  const getInspectionStatusBadge = (status) => {
    const badges = {
      'Not Inspected': <span className="text-gray-600">Not Inspected</span>,
      'Inspected': <span className="text-gray-600">Inspected</span>,
      'Due Soon': <span className="text-gray-600">Due Soon</span>,
      'Overdue': <span className="text-gray-600">Overdue</span>
    }
    return badges[status] || <span className="text-gray-600">{status}</span>
  }

  const columns = [
    {
      key: 'assetName',
      label: 'Asset Name',
      sortable: true,
      width: '200px',
      render: (value) => (
        <div className="min-w-0">
          <span className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium truncate block">
            {value}
          </span>
        </div>
      )
    },
    {
      key: 'assetType',
      label: 'Asset Type',
      sortable: true,
      width: '120px',
      render: (value) => (
        <div className="text-gray-600 truncate">{value}</div>
      )
    },
    {
      key: 'assetStatus',
      label: 'Asset Status',
      sortable: true,
      width: '160px',
      filterable: true,
      filterOptions: ['Active', 'Under Maintenance', 'Decommissioned'],
      render: (value) => (
        <div className="min-w-0">
          {getAssetStatusBadge(value)}
        </div>
      )
    },
    {
      key: 'assetCondition',
      label: 'Asset Condition',
      sortable: true,
      width: '140px',
      filterable: true,
      filterOptions: ['Good', 'Needs Repairs', 'Critical'],
      render: (value) => (
        <div className="min-w-0">
          {getAssetConditionBadge(value)}
        </div>
      )
    },
    {
      key: 'type',
      label: 'Task Type',
      sortable: true,
      width: '130px',
      filterable: true,
      filterOptions: ['Inspection', 'Maintenance', 'Safety Check', 'Cleaning', 'Planning', 'Repair'],
      render: (value) => (
        <div className="min-w-0">
          {getTaskTypeBadge(value)}
        </div>
      )
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      width: '120px',
      filterable: true,
      filterOptions: ['High', 'Medium', 'Low'],
      render: (value) => (
        <div className="min-w-0">
          {getPriorityBadge(value)}
        </div>
      )
    },
    {
      key: 'urgency',
      label: 'Urgency',
      sortable: true,
      width: '140px',
      render: (value, item) => {
        const dueDate = new Date(item.dueDate)
        const today = new Date()
        const isOverdue = dueDate < today && item.status !== 'Completed'
        const isToday = dueDate.toDateString() === today.toDateString()
        
        if (isOverdue) {
          return <div className="text-red-600 text-sm truncate">Overdue</div>
        } else if (isToday) {
          return <div className="text-orange-600 text-sm truncate">Due Today</div>
        } else {
          const diffTime = dueDate - today
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          if (diffDays <= 7) {
            return <div className="text-yellow-600 text-sm truncate">Due in {diffDays} days</div>
          }
          return <div className="text-gray-600 text-sm truncate">Due in {diffDays} days</div>
        }
      }
    },
    {
      key: 'status',
      label: 'Task Status',
      sortable: true,
      width: '140px',
      filterable: true,
      filterOptions: ['Not Inspected', 'Completed', 'In Progress', 'Scheduled', 'Overdue'],
      render: (value, item) => {
        // Generate inspection status based on task data
        const dueDate = new Date(item.dueDate)
        const today = new Date()
        const isOverdue = dueDate < today && item.status !== 'Completed'
        
        if (item.status === 'Completed') {
          return <div className="text-green-600 text-sm truncate">Completed</div>
        } else if (isOverdue) {
          return <div className="text-red-600 text-sm truncate">Overdue</div>
        } else if (item.status === 'In Progress') {
          return <div className="text-blue-600 text-sm truncate">In Progress</div>
        } else if (item.status === 'Scheduled') {
          return <div className="text-orange-600 text-sm truncate">Scheduled</div>
        } else {
          return <div className="text-gray-600 text-sm truncate">{item.status}</div>
        }
      }
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow">
      <EnhancedDataTable
        data={enhancedTasks}
        columns={columns}
        sortable={true}
        pagination={true}
        pageSize={8}
        onRowClick={onView}
        emptyMessage="No tasks found. Create your first task to get started."
        bulkActions={bulkActions}
      />
    </div>
  )
}

export default TaskTableView