import { useState } from 'react'
import { 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight,
  CheckSquare,
  Square,
  MinusSquare,
  RefreshCw
} from 'lucide-react'

const EnhancedDataTable = ({ 
  data, 
  columns, 
  sortable = true, 
  pagination = true, 
  pageSize = 10,
  bulkActions = [],
  onRowClick,
  className = '',
  emptyMessage = 'No data available',
  loading = false
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [selectedRows, setSelectedRows] = useState(new Set())

  // Handle sorting
  const handleSort = (key) => {
    if (!sortable) return
    
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  // Use data as-is since filtering is handled at page level
  const filteredData = data

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0

    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1
    }
    return 0
  })

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedData = pagination ? sortedData.slice(startIndex, startIndex + pageSize) : sortedData

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(paginatedData.map(item => item.id)))
    }
  }

  const handleRowSelect = (id) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedRows(newSelected)
  }

  const getSelectedData = () => {
    return data.filter(item => selectedRows.has(item.id))
  }

  // Export functions
  const exportToCsv = () => {
    const csvData = filteredData.map(item => {
      const row = {}
      columns.forEach(col => {
        if (columnSettings[col.key]?.visible) {
          row[col.label] = item[col.key]
        }
      })
      return row
    })

    const csvContent = convertToCSV(csvData)
    downloadFile(csvContent, 'export.csv', 'text/csv')
  }

  const exportToJson = () => {
    const jsonData = filteredData.map(item => {
      const row = {}
      columns.forEach(col => {
        if (columnSettings[col.key]?.visible) {
          row[col.key] = item[col.key]
        }
      })
      return row
    })

    const jsonContent = JSON.stringify(jsonData, null, 2)
    downloadFile(jsonContent, 'export.json', 'application/json')
  }

  const convertToCSV = (data) => {
    if (!data.length) return ''

    const headers = Object.keys(data[0])
    const csvHeaders = headers.join(',')
    const csvRows = data.map(item => 
      headers.map(header => {
        const value = item[header]
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
      }).join(',')
    )

    return [csvHeaders, ...csvRows].join('\n')
  }

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }


  // Generate page numbers
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const startPage = Math.max(1, currentPage - 2)
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
    }
    
    return pages
  }

  const getSelectionIcon = () => {
    const selectedCount = selectedRows.size
    const totalCount = paginatedData.length
    
    if (selectedCount === 0) return <Square className="w-4 h-4" />
    if (selectedCount === totalCount) return <CheckSquare className="w-4 h-4" />
    return <MinusSquare className="w-4 h-4" />
  }

  const SortIcon = ({ column }) => {
    if (!sortable || !column.sortable) return null
    
    if (sortConfig.key === column.key) {
      return sortConfig.direction === 'asc' ? 
        <ChevronUp className="w-4 h-4 ml-1" /> : 
        <ChevronDown className="w-4 h-4 ml-1" />
    }
    
    return <ChevronDown className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-50" />
  }

  const visibleColumns = columns

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Simple header with items count and pagination */}
      <div className="px-6 py-3 border-b border-gray-200">
        <div className="flex items-center justify-end gap-4">
          <div className="text-sm text-gray-700">
            {filteredData.length} items
          </div>
          {pagination && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {currentPage} of {totalPages}
              </span>
              {totalPages > 1 && (
                <div className="flex items-center">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {bulkActions.length > 0 && selectedRows.size > 0 && (
        <div className="px-6 py-3 flex items-center space-x-2 border-b border-gray-200">
          <span className="text-sm text-gray-600">
            {selectedRows.size} selected
          </span>
          {bulkActions.map((action, index) => (
            <button
              key={action.id || index}
              onClick={() => {
                // Call the onBulkAction handler passed from parent component
                if (action.onClick) {
                  action.onClick(getSelectedData())
                }
              }}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${action.className || 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              {action.icon && <action.icon className="w-4 h-4 mr-1 inline" />}
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200 dark:divide-gray-700" style={{ tableLayout: 'fixed' }}>
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              {/* Selection column */}
              {bulkActions.length > 0 && (
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={handleSelectAll}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    {getSelectionIcon()}
                  </button>
                </th>
              )}
              
              {visibleColumns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                    sortable && column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 group' : ''
                  }`}
                  style={column.width ? { width: column.width, maxWidth: column.width } : {}}
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center">
                    {column.label}
                    <SortIcon column={column} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={visibleColumns.length + (bulkActions.length > 0 ? 1 : 0)} className="px-6 py-8 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="text-gray-500 dark:text-gray-400">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <tr
                  key={item.id || index}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    onRowClick ? 'cursor-pointer' : ''
                  } ${selectedRows.has(item.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                  onClick={() => onRowClick?.(item)}
                >
                  {/* Selection column */}
                  {bulkActions.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRowSelect(item.id)
                        }}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        {selectedRows.has(item.id) ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  )}
                  
                  {visibleColumns.map((column) => (
                    <td 
                      key={column.key} 
                      className={`px-6 py-4 ${column.key === 'description' ? 'whitespace-normal' : 'whitespace-nowrap'}`}
                      style={column.width ? { width: column.width, maxWidth: column.width } : {}}
                    >
                      {column.render ? column.render(item[column.key], item) : item[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={visibleColumns.length + (bulkActions.length > 0 ? 1 : 0)} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      
    </div>
  )
}

export default EnhancedDataTable