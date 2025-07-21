import React, { useState } from 'react';
import { Download, FileText, Sheet } from 'lucide-react';
import { exportUtils } from '../../utils/exportUtils';
import { useClickOutside } from '../../hooks/useClickOutside';
import toast from 'react-hot-toast';

const ExportMenu = ({ 
  data = [], 
  type = 'assets', 
  filters = {},
  title = 'Export Data',
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Add click outside functionality
  const exportMenuRef = useClickOutside(() => {
    setIsOpen(false);
  }, isOpen);

  const handleExport = async (format) => {
    if (!data || data.length === 0) {
      toast.error('No data available to export');
      return;
    }

    setIsExporting(true);
    
    try {
      const processedData = exportUtils.formatDataForExport(data, type);
      
      if (format === 'csv') {
        exportUtils.exportToCSV(processedData, type);
        toast.success(`CSV file exported successfully (${processedData.length} records)`);
      } else if (format === 'pdf') {
        if (type === 'assets') {
          exportUtils.exportAssetsToPDF(data);
        } else if (type === 'tasks') {
          exportUtils.exportTasksToPDF(data);
        } else {
          exportUtils.exportToPDF(processedData, `${title} Report`, null, type);
        }
        toast.success(`PDF file exported successfully (${processedData.length} records)`);
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Failed to export ${format.toUpperCase()}: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const exportCount = data.length;

  return (
    <div ref={exportMenuRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting || exportCount === 0}
        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
      >
        <Download className="h-4 w-4 mr-2" />
        Export
        {exportCount > 0 && (
          <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
            ({exportCount})
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu">
            <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
              Export {exportCount} {type}
            </div>
            
            <button
              onClick={() => handleExport('csv')}
              disabled={isExporting}
              className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
              role="menuitem"
            >
              <Sheet className="h-4 w-4 mr-3 text-green-600" />
              Export as CSV
              <span className="ml-auto text-xs text-gray-500">Excel</span>
            </button>
            
            <button
              onClick={() => handleExport('pdf')}
              disabled={isExporting}
              className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
              role="menuitem"
            >
              <FileText className="h-4 w-4 mr-3 text-red-600" />
              Export as PDF
              <span className="ml-auto text-xs text-gray-500">Report</span>
            </button>
          </div>
        </div>
      )}

      {isExporting && (
        <div className="absolute inset-0 bg-white dark:bg-gray-700 bg-opacity-75 flex items-center justify-center rounded-md">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Exporting...
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ExportMenu;