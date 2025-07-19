import { Eye, Edit, Trash2, MapPin, Archive, RefreshCw } from 'lucide-react'
import EnhancedDataTable from '../ui/EnhancedDataTable'
import toast from 'react-hot-toast'

const AssetTableView = ({ assets, onView, onEdit, onDelete }) => {
  const handleBulkAction = (action, selectedAssets) => {
    switch (action) {
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${selectedAssets.length} assets?`)) {
          selectedAssets.forEach(asset => onDelete(asset));
          toast.success(`${selectedAssets.length} assets deleted successfully`);
        }
        break;
      case 'archive':
        // Implement archive functionality
        toast.success(`${selectedAssets.length} assets archived`);
        break;
      case 'refresh':
        // Implement refresh functionality
        toast.success(`${selectedAssets.length} assets refreshed`);
        break;
      default:
        toast.error('Unknown action');
    }
  };

  const bulkActions = [
    { id: 'delete', label: 'Delete Selected', icon: Trash2, className: 'text-red-600 hover:text-red-700' },
    { id: 'archive', label: 'Archive Selected', icon: Archive, className: 'text-yellow-600 hover:text-yellow-700' },
    { id: 'refresh', label: 'Refresh Selected', icon: RefreshCw, className: 'text-blue-600 hover:text-blue-700' }
  ];
  const getStatusBadge = (status) => {
    const badges = {
      'Active': <span className="badge badge-success">Active</span>,
      'Under Maintenance': <span className="badge badge-warning">Under Maintenance</span>,
      'Decommissioned': <span className="badge badge-error">Decommissioned</span>
    }
    return badges[status] || <span className="badge badge-gray">{status}</span>
  }

  const getConditionBadge = (condition) => {
    const badges = {
      'Good': <span className="badge badge-success">Good</span>,
      'Fair': <span className="badge badge-warning">Fair</span>,
      'Needs Repairs': <span className="badge badge-error">Needs Repairs</span>,
      'Critical': <span className="badge badge-error">Critical</span>
    }
    return badges[condition] || <span className="badge badge-gray">{condition}</span>
  }

  const getInspectionBadge = (inspectionStatus) => {
    const badges = {
      'Recently Inspected': <span className="badge badge-success">Recently Inspected</span>,
      'Scheduled for Inspection': <span className="badge badge-info">Scheduled for Inspection</span>,
      'Overdue': <span className="badge badge-error">Overdue</span>,
      'Not Inspected': <span className="badge badge-gray">Not Inspected</span>
    }
    return badges[inspectionStatus] || <span className="badge badge-gray">{inspectionStatus}</span>
  }

  const columns = [
    {
      key: 'name',
      label: 'Asset Name',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center space-x-2 sm:space-x-3">
          <img
            src={item.images?.[0] || '/api/placeholder/40/40'}
            alt={value}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover"
          />
          <div>
            <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{value}</div>
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {item.type}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'address',
      label: 'Location',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center space-x-1">
          <MapPin className="w-4 h-4 text-gray-400" />
          <div>
            <div className="text-sm text-gray-900 dark:text-white">{value.street}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{value.city}, {value.state}</div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Asset Status',
      sortable: true,
      filterable: true,
      filterOptions: ['Active', 'Under Maintenance', 'Decommissioned'],
      render: (value) => getStatusBadge(value)
    },
    {
      key: 'condition',
      label: 'Asset Condition',
      sortable: true,
      filterable: true,
      filterOptions: ['Good', 'Fair', 'Needs Repairs', 'Critical'],
      render: (value) => getConditionBadge(value)
    },
    {
      key: 'inspectionStatus',
      label: 'Inspection Status',
      sortable: true,
      filterable: true,
      filterOptions: ['Recently Inspected', 'Scheduled for Inspection', 'Overdue', 'Not Inspected'],
      render: (value) => getInspectionBadge(value)
    },
    {
      key: 'nextInspection',
      label: 'Next Inspection',
      sortable: true,
      render: (value) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {value ? new Date(value).toLocaleDateString() : 'Not scheduled'}
        </div>
      )
    },
    {
      key: 'details',
      label: 'Details',
      render: (value, item) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {value.bedrooms} bed • {value.bathrooms} bath • {value.floors} floor{value.floors > 1 ? 's' : ''}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, item) => (
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onView(item)
            }}
            className="p-1 text-gray-400 hover:text-secondary-600 transition-colors"
            title="View details"
          >
            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(item)
            }}
            className="p-1 text-gray-400 hover:text-secondary-600 transition-colors"
            title="Edit asset"
          >
            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(item)
            }}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete asset"
          >
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      )
    }
  ]

  return (
    <EnhancedDataTable
      data={assets}
      columns={columns}
      searchable={true}
      filterable={true}
      sortable={true}
      pagination={true}
      pageSize={10}
      onRowClick={onView}
      emptyMessage="No assets found. Add your first asset to get started."
      title="Assets Report"
      type="assets"
      allowExport={true}
      allowBulkOperations={true}
      bulkActions={bulkActions}
      onBulkAction={handleBulkAction}
    />
  )
}

export default AssetTableView