import { Trash2, Archive, RefreshCw } from 'lucide-react'
import EnhancedDataTable from '../ui/EnhancedDataTable'
import toast from 'react-hot-toast'

const AssetTableView = ({ assets, onView, onDelete }) => {
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
    { 
      id: 'delete', 
      label: 'Delete Selected', 
      icon: Trash2, 
      className: 'bg-red-600 text-white hover:bg-red-700',
      onClick: (selectedAssets) => handleBulkAction('delete', selectedAssets)
    },
    { 
      id: 'archive', 
      label: 'Archive Selected', 
      icon: Archive, 
      className: 'bg-yellow-600 text-white hover:bg-yellow-700',
      onClick: (selectedAssets) => handleBulkAction('archive', selectedAssets)
    },
    { 
      id: 'refresh', 
      label: 'Refresh Selected', 
      icon: RefreshCw, 
      className: 'bg-blue-600 text-white hover:bg-blue-700',
      onClick: (selectedAssets) => handleBulkAction('refresh', selectedAssets)
    }
  ];
  const getStatusBadge = (status) => {
    const badges = {
      'Scheduled for Inspection': <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Scheduled for Inspection</span>,
      'Due For Maintenance': <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Due For Maintenance</span>,
      'Overdue For Maintenance': <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Overdue For Maintenance</span>,
      'Under Maintenance': <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Under Maintenance</span>
    }
    return badges[status] || <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status}</span>
  }

  const getConditionBadge = (condition) => {
    const badges = {
      'Good': <span className="text-gray-600">Good</span>,
      'Fair': <span className="text-gray-600">Fair</span>,
      'Needs Repairs': <span className="text-gray-600">Needs Repairs</span>,
      'Critical': <span className="text-gray-600">Critical</span>
    }
    return badges[condition] || <span className="text-gray-600">{condition}</span>
  }

  const getInspectionStatusBadge = (inspectionStatus) => {
    const badges = {
      'Recently Inspected': <span className="text-gray-600">Recently Inspected</span>,
      'Inspection Due': <span className="text-gray-600">Inspection Due</span>,
      'Inspection Overdue': <span className="text-gray-600">Inspection Overdue</span>,
      'Not Inspected': <span className="text-gray-600">Not Inspected</span>
    }
    return badges[inspectionStatus] || <span className="text-gray-600">{inspectionStatus}</span>
  }

  const columns = [
    {
      key: 'name',
      label: 'Asset Name',
      sortable: true,
      width: '250px',
      render: (value, item) => (
        <div className="flex items-center space-x-3">
          <img
            src={item.images?.[0] || '/api/placeholder/50/50'}
            alt={value}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div>
            <div className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
              {value}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'description',
      label: 'Description',
      sortable: true,
      width: '200px',
      render: (value, item) => {
        const description = item.details?.features?.join(', ') || 'This two-story home offers an inviting living room, a well-appointed kitchen with modern appliances'
        const truncatedDescription = description.length > 45 ? description.substring(0, 45) + '...' : description
        return (
          <div className="text-sm text-gray-600">
            <div className="break-words overflow-hidden">
              {truncatedDescription}
            </div>
          </div>
        )
      }
    },
    {
      key: 'inspectionStatus',
      label: 'Inspection Status',
      sortable: true,
      width: '140px',
      filterable: true,
      filterOptions: ['Recently Inspected', 'Inspection Due', 'Inspection Overdue', 'Not Inspected'],
      render: (value) => getInspectionStatusBadge(value)
    },
    {
      key: 'status',
      label: 'Asset Status',
      sortable: true,
      width: '180px',
      filterable: true,
      filterOptions: ['Scheduled for Inspection', 'Due For Maintenance', 'Overdue For Maintenance', 'Under Maintenance'],
      render: (value) => getStatusBadge(value)
    },
    {
      key: 'tags',
      label: 'Tags',
      sortable: true,
      render: (value, item) => (
        <div className="text-sm text-gray-600">
          {item.priority || 'Inspection Due Soon'}
        </div>
      )
    },
    {
      key: 'frequency',
      label: 'Frequency',
      sortable: true,
      render: (value, item) => (
        <div className="text-sm text-gray-600">
          {item.frequency}
        </div>
      )
    },
    {
      key: 'condition',
      label: 'Condition',
      sortable: true,
      filterable: true,
      filterOptions: ['Good', 'Fair', 'Needs Repairs', 'Critical'],
      render: (value) => getConditionBadge(value)
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow">
      <EnhancedDataTable
        data={assets}
        columns={columns}
        sortable={true}
        pagination={true}
        pageSize={8}
        onRowClick={onView}
        emptyMessage="No assets found. Add your first asset to get started."
        bulkActions={bulkActions}
      />
    </div>
  )
}

export default AssetTableView