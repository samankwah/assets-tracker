import { useState } from 'react'
import { 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  Download, 
  FileText, 
  Grid, 
  List,
  CheckSquare,
  Square,
  MinusSquare,
  Settings,
  RefreshCw,
  MoreVertical
} from 'lucide-react'

const EnhancedDataTable = ({ 
  data, 
  columns, 
  searchable = true, 
  filterable = true, 
  sortable = true, 
  pagination = true, 
  pageSize = 10,
  exportable = true,
  bulkActions = [],
  onRowClick,
  onRefresh,
  className = '',
  emptyMessage = 'No data available',
  loading = false
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({})
  const [selectedRows, setSelectedRows] = useState(new Set())
  const [viewMode, setViewMode] = useState('table')
  const [columnSettings, setColumnSettings] = useState(
    columns.reduce((acc, col) => ({ ...acc, [col.key]: { visible: true, width: 'auto' } }), {})
  )
  const [showColumnSettings, setShowColumnSettings] = useState(false)
  const [showExportOptions, setShowExportOptions] = useState(false)

  // Handle sorting
  const handleSort = (key) => {
    if (!sortable) return
    
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  // Filter and search data
  const filteredData = data.filter(item => {
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = columns.some(column => {
        const value = item[column.key]
        return value && value.toString().toLowerCase().includes(searchLower)
      })
      if (!matchesSearch) return false
    }

    // Apply column filters
    for (const [key, value] of Object.entries(filters)) {
      if (value && item[key] !== value) {
        return false
      }
    }

    return true
  })

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

  // Column visibility toggle
  const toggleColumnVisibility = (key) => {
    setColumnSettings(prev => ({
      ...prev,
      [key]: { ...prev[key], visible: !prev[key].visible }
    }))
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

  const visibleColumns = columns.filter(col => columnSettings[col.key]?.visible)

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header with controls */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Search */}
          {searchable && (
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1 rounded-md ${
                  viewMode === 'table' 
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded-md ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>

            {/* Refresh */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}

            {/* Column Settings */}
            <div className="relative">
              <button
                onClick={() => setShowColumnSettings(!showColumnSettings)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Column Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              {showColumnSettings && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                  <div className="p-3">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Show Columns
                    </h4>
                    <div className="space-y-2">
                      {columns.map(col => (
                        <label key={col.key} className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={columnSettings[col.key]?.visible}
                            onChange={() => toggleColumnVisibility(col.key)}
                            className="mr-2 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-gray-700 dark:text-gray-300">
                            {col.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Export */}
            {exportable && (
              <div className="relative">
                <button
                  onClick={() => setShowExportOptions(!showExportOptions)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Export"
                >
                  <Download className="w-4 h-4" />
                </button>
                {showExportOptions && (
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                    <div className="p-2">
                      <button
                        onClick={exportToCsv}
                        className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Export CSV
                      </button>
                      <button
                        onClick={exportToJson}
                        className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Export JSON
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        {filterable && (
          <div className="mt-4 flex flex-wrap gap-2">
            {columns.filter(col => col.filterable).map(column => (
              <select
                key={column.key}
                value={filters[column.key] || ''}
                onChange={(e) => setFilters({ ...filters, [column.key]: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="">All {column.label}</option>
                {column.filterOptions?.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            ))}
          </div>
        )}

        {/* Bulk Actions */}
        {bulkActions.length > 0 && selectedRows.size > 0 && (
          <div className="mt-4 flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedRows.size} selected
            </span>
            {bulkActions.map((action, index) => (
              <button
                key={index}
                onClick={() => action.handler(getSelectedData())}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
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
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap">
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

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
            Showing {startIndex + 1} to {Math.min(startIndex + pageSize, sortedData.length)} of {sortedData.length} results
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {getPageNumbers().map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded-lg text-sm ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
      {/* Click outside handlers */}
      {showColumnSettings && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowColumnSettings(false)}
        />
      )}
      {showExportOptions && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowExportOptions(false)}
        />
      )}
    </div>
  )
}

export default EnhancedDataTable