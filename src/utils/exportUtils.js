import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

export const exportUtils = {
  exportToCSV: (data, filename = 'export') => {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          
          if (typeof value === 'object') {
            return JSON.stringify(value).replace(/"/g, '""');
          }
          
          const stringValue = String(value);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          
          return stringValue;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  },

  exportToPDF: (data, title = 'Export', columns = null, filename = 'export') => {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text(title, 14, 22);
    
    doc.setFontSize(12);
    doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 14, 32);
    
    const tableColumns = columns || Object.keys(data[0]).map(key => ({
      header: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
      dataKey: key
    }));

    const tableRows = data.map(item => {
      const row = {};
      tableColumns.forEach(col => {
        const value = item[col.dataKey];
        if (value === null || value === undefined) {
          row[col.dataKey] = '';
        } else if (typeof value === 'object') {
          if (value.street && value.city) {
            row[col.dataKey] = `${value.street}, ${value.city}`;
          } else {
            row[col.dataKey] = JSON.stringify(value);
          }
        } else {
          row[col.dataKey] = String(value);
        }
      });
      return row;
    });

    doc.autoTable({
      head: [tableColumns.map(col => col.header)],
      body: tableRows.map(row => tableColumns.map(col => row[col.dataKey])),
      startY: 40,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      margin: { top: 40 },
      didDrawPage: (data) => {
        const pageCount = doc.internal.getNumberOfPages();
        const pageSize = doc.internal.pageSize;
        
        doc.setFontSize(10);
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          pageSize.width - 30,
          pageSize.height - 10
        );
      }
    });

    doc.save(`${filename}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  },

  exportAssetsToPDF: (assets) => {
    const columns = [
      { header: 'Name', dataKey: 'name' },
      { header: 'Type', dataKey: 'type' },
      { header: 'Status', dataKey: 'status' },
      { header: 'Condition', dataKey: 'condition' },
      { header: 'Address', dataKey: 'address' },
      { header: 'Phase', dataKey: 'currentPhase' },
      { header: 'Created', dataKey: 'createdAt' }
    ];

    const processedAssets = assets.map(asset => ({
      ...asset,
      address: asset.address ? `${asset.address.street}, ${asset.address.city}` : '',
      createdAt: asset.createdAt ? format(new Date(asset.createdAt), 'MMM d, yyyy') : ''
    }));

    exportUtils.exportToPDF(processedAssets, 'Assets Report', columns, 'assets');
  },

  exportTasksToPDF: (tasks) => {
    const columns = [
      { header: 'Title', dataKey: 'title' },
      { header: 'Asset', dataKey: 'assetName' },
      { header: 'Type', dataKey: 'type' },
      { header: 'Priority', dataKey: 'priority' },
      { header: 'Status', dataKey: 'status' },
      { header: 'Due Date', dataKey: 'dueDate' },
      { header: 'Assigned To', dataKey: 'assignedTo' }
    ];

    const processedTasks = tasks.map(task => ({
      ...task,
      dueDate: task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : '',
      assignedTo: task.assignedTo || 'Unassigned'
    }));

    exportUtils.exportToPDF(processedTasks, 'Tasks Report', columns, 'tasks');
  },

  formatDataForExport: (data, type = 'assets') => {
    if (type === 'assets') {
      return data.map(asset => ({
        Name: asset.name,
        Type: asset.type,
        Status: asset.status,
        Condition: asset.condition,
        Address: asset.address ? `${asset.address.street}, ${asset.address.city}, ${asset.address.state}` : '',
        'Zip Code': asset.address?.zipCode || '',
        Bedrooms: asset.details?.bedrooms || '',
        Bathrooms: asset.details?.bathrooms || '',
        'Square Feet': asset.details?.squareFeet || '',
        Phase: asset.currentPhase,
        'Phase Progress': asset.phaseMetadata?.progress ? `${asset.phaseMetadata.progress}%` : '',
        Priority: asset.priority,
        'Inspection Status': asset.inspectionStatus,
        'Last Inspection': asset.lastInspection ? format(new Date(asset.lastInspection), 'MMM d, yyyy') : '',
        'Next Inspection': asset.nextInspection ? format(new Date(asset.nextInspection), 'MMM d, yyyy') : '',
        'Created Date': asset.createdAt ? format(new Date(asset.createdAt), 'MMM d, yyyy') : ''
      }));
    }

    if (type === 'tasks') {
      return data.map(task => ({
        Title: task.title,
        Description: task.description || '',
        'Asset Name': task.assetName || '',
        Type: task.type,
        Priority: task.priority,
        Status: task.status,
        'Assigned To': task.assignedTo || 'Unassigned',
        'Due Date': task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : '',
        'Due Time': task.dueTime || '',
        Frequency: task.frequency || '',
        'Email Notifications': task.notifications?.email ? 'Yes' : 'No',
        'SMS Notifications': task.notifications?.sms ? 'Yes' : 'No',
        'Created Date': task.createdAt ? format(new Date(task.createdAt), 'MMM d, yyyy') : ''
      }));
    }

    return data;
  },

  exportFilteredData: (data, filters, type = 'assets') => {
    let filteredData = [...data];

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filteredData = filteredData.filter(item => {
        if (type === 'assets') {
          return (
            item.name?.toLowerCase().includes(searchLower) ||
            item.type?.toLowerCase().includes(searchLower) ||
            item.address?.street?.toLowerCase().includes(searchLower) ||
            item.address?.city?.toLowerCase().includes(searchLower)
          );
        } else if (type === 'tasks') {
          return (
            item.title?.toLowerCase().includes(searchLower) ||
            item.description?.toLowerCase().includes(searchLower) ||
            item.assetName?.toLowerCase().includes(searchLower)
          );
        }
        return false;
      });
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value && key !== 'searchTerm') {
        filteredData = filteredData.filter(item => {
          if (key === 'phase' && type === 'assets') {
            return item.currentPhase === value;
          }
          return item[key] === value;
        });
      }
    });

    return exportUtils.formatDataForExport(filteredData, type);
  }
};

export default exportUtils;