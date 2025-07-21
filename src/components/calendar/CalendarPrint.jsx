import React, { useState, useRef } from 'react';
import {
  Printer,
  Download,
  Settings,
  Calendar,
  FileText,
  Image,
  RefreshCw,
  Check,
  X
} from 'lucide-react';
import { useCalendarStore } from '../../stores/calendarStore';
import { useTaskStore } from '../../stores/taskStore';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import toast from 'react-hot-toast';

const CalendarPrint = ({ isOpen, onClose }) => {
  const { currentDate, getCalendarEvents } = useCalendarStore();
  const { tasks } = useTaskStore();
  const [printSettings, setPrintSettings] = useState({
    format: 'monthly',
    layout: 'portrait',
    includeEvents: true,
    includeTasks: true,
    includeWeekends: true,
    colorPrint: true,
    fontSize: 'medium',
    pageSize: 'letter'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const printRef = useRef();

  const generatePrintableCalendar = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });
    
    const events = getCalendarEvents();
    const calendarTasks = tasks.filter(task => task.dueDate);

    return {
      title: format(currentDate, 'MMMM yyyy'),
      days,
      events,
      tasks: calendarTasks,
      monthStart: start,
      monthEnd: end
    };
  };

  const handlePrint = () => {
    setIsGenerating(true);
    
    // Create print window
    const printWindow = window.open('', '_blank');
    const calendarData = generatePrintableCalendar();
    
    const printHTML = generatePrintHTML(calendarData);
    
    printWindow.document.write(printHTML);
    printWindow.document.close();
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
      setIsGenerating(false);
      toast.success('Calendar print dialog opened');
    }, 1000);
  };

  const handleExportPDF = () => {
    setIsGenerating(true);
    
    try {
      // In a real implementation, you would use jsPDF or similar
      const calendarData = generatePrintableCalendar();
      const htmlContent = generatePrintHTML(calendarData, true);
      
      // Create a blob and download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `calendar-${format(currentDate, 'yyyy-MM')}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Calendar exported as HTML');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export calendar');
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePrintHTML = (calendarData, isExport = false) => {
    const { title, days, events, tasks } = calendarData;
    
    const styles = `
      <style>
        @media print {
          body { margin: 0; font-family: Arial, sans-serif; }
          .no-print { display: none !important; }
        }
        
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          ${printSettings.fontSize === 'small' ? 'font-size: 12px;' : 
            printSettings.fontSize === 'large' ? 'font-size: 16px;' : 'font-size: 14px;'}
        }
        
        .calendar-header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
        }
        
        .calendar-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .calendar-subtitle {
          color: #666;
          font-size: 14px;
        }
        
        .calendar-grid {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        
        .calendar-grid th,
        .calendar-grid td {
          border: 1px solid #ccc;
          padding: 8px;
          vertical-align: top;
          height: ${printSettings.format === 'monthly' ? '120px' : '80px'};
          width: 14.28%;
        }
        
        .calendar-grid th {
          background-color: ${printSettings.colorPrint ? '#f5f5f5' : '#fff'};
          font-weight: bold;
          text-align: center;
          height: 30px;
        }
        
        .day-number {
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .today .day-number {
          color: ${printSettings.colorPrint ? '#2563eb' : '#000'};
          background-color: ${printSettings.colorPrint ? '#dbeafe' : '#f0f0f0'};
          border-radius: 3px;
          padding: 2px 4px;
        }
        
        .other-month {
          color: #ccc;
        }
        
        .event {
          font-size: 10px;
          margin: 1px 0;
          padding: 1px 3px;
          border-radius: 2px;
          background-color: ${printSettings.colorPrint ? '#dbeafe' : '#f0f0f0'};
          border-left: 3px solid ${printSettings.colorPrint ? '#2563eb' : '#666'};
        }
        
        .task {
          font-size: 10px;
          margin: 1px 0;
          padding: 1px 3px;
          border-radius: 2px;
          background-color: ${printSettings.colorPrint ? '#fef3c7' : '#f0f0f0'};
          border-left: 3px solid ${printSettings.colorPrint ? '#f59e0b' : '#666'};
        }
        
        .legend {
          margin-top: 20px;
          display: flex;
          gap: 20px;
          justify-content: center;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
        }
        
        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }
        
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #ccc;
          padding-top: 10px;
        }
        
        @page {
          size: ${printSettings.pageSize};
          orientation: ${printSettings.layout};
          margin: 0.5in;
        }
      </style>
    `;

    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Filter out weekends if not included
    const displayDays = printSettings.includeWeekends ? weekDays : weekDays.slice(1, 6);
    
    const calendarGrid = `
      <table class="calendar-grid">
        <thead>
          <tr>
            ${displayDays.map(day => `<th>${day}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${generateCalendarRows(days, events, tasks)}
        </tbody>
      </table>
    `;

    const legend = `
      <div class="legend">
        ${printSettings.includeEvents ? `
          <div class="legend-item">
            <div class="legend-color" style="background-color: ${printSettings.colorPrint ? '#dbeafe' : '#f0f0f0'}; border-left: 3px solid ${printSettings.colorPrint ? '#2563eb' : '#666'};"></div>
            <span>Events</span>
          </div>
        ` : ''}
        ${printSettings.includeTasks ? `
          <div class="legend-item">
            <div class="legend-color" style="background-color: ${printSettings.colorPrint ? '#fef3c7' : '#f0f0f0'}; border-left: 3px solid ${printSettings.colorPrint ? '#f59e0b' : '#666'};"></div>
            <span>Tasks</span>
          </div>
        ` : ''}
      </div>
    `;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Calendar - ${title}</title>
          <meta charset="utf-8">
          ${styles}
        </head>
        <body>
          <div class="calendar-header">
            <div class="calendar-title">${title}</div>
            <div class="calendar-subtitle">Asset Tracker Calendar</div>
          </div>
          
          ${calendarGrid}
          
          ${legend}
          
          <div class="footer">
            Generated on ${format(new Date(), 'MMMM dd, yyyy')} by Asset Tracker
          </div>
        </body>
      </html>
    `;
  };

  const generateCalendarRows = (days, events, tasks) => {
    const weeks = [];
    let currentWeek = [];
    
    // Add days from previous month to fill first week
    const firstDay = days[0];
    const startOfWeek = firstDay.getDay();
    
    for (let i = startOfWeek - 1; i >= 0; i--) {
      const prevDay = new Date(firstDay);
      prevDay.setDate(firstDay.getDate() - (i + 1));
      currentWeek.push({ date: prevDay, isOtherMonth: true });
    }
    
    // Add days of current month
    days.forEach(day => {
      currentWeek.push({ date: day, isOtherMonth: !isSameMonth(day, days[0]) });
      
      if (currentWeek.length === 7) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });
    
    // Add days from next month to fill last week
    if (currentWeek.length > 0) {
      const lastDay = days[days.length - 1];
      let nextDay = new Date(lastDay);
      
      while (currentWeek.length < 7) {
        nextDay.setDate(nextDay.getDate() + 1);
        currentWeek.push({ date: new Date(nextDay), isOtherMonth: true });
      }
      weeks.push(currentWeek);
    }
    
    return weeks.map(week => `
      <tr>
        ${week.map(({ date, isOtherMonth }) => {
          const dayEvents = events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.toDateString() === date.toDateString();
          });
          
          const dayTasks = tasks.filter(task => {
            const taskDate = new Date(task.dueDate);
            return taskDate.toDateString() === date.toDateString();
          });
          
          const todayClass = isToday(date) ? 'today' : '';
          const otherMonthClass = isOtherMonth ? 'other-month' : '';
          
          return `
            <td class="${todayClass} ${otherMonthClass}">
              <div class="day-number">${date.getDate()}</div>
              ${printSettings.includeEvents ? dayEvents.map(event => `
                <div class="event">${event.title}</div>
              `).join('') : ''}
              ${printSettings.includeTasks ? dayTasks.map(task => `
                <div class="task">${task.title}</div>
              `).join('') : ''}
            </td>
          `;
        }).join('')}
      </tr>
    `).join('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Print Calendar</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Customize and print your calendar for {format(currentDate, 'MMMM yyyy')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Print Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Format
              </label>
              <select
                value={printSettings.format}
                onChange={(e) => setPrintSettings(prev => ({ ...prev, format: e.target.value }))}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="monthly">Monthly View</option>
                <option value="weekly">Weekly View</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Layout
              </label>
              <select
                value={printSettings.layout}
                onChange={(e) => setPrintSettings(prev => ({ ...prev, layout: e.target.value }))}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Font Size
              </label>
              <select
                value={printSettings.fontSize}
                onChange={(e) => setPrintSettings(prev => ({ ...prev, fontSize: e.target.value }))}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Page Size
              </label>
              <select
                value={printSettings.pageSize}
                onChange={(e) => setPrintSettings(prev => ({ ...prev, pageSize: e.target.value }))}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="letter">Letter (8.5" × 11")</option>
                <option value="legal">Legal (8.5" × 14")</option>
                <option value="a4">A4</option>
              </select>
            </div>
          </div>

          {/* Content Options */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Include</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={printSettings.includeEvents}
                  onChange={(e) => setPrintSettings(prev => ({ ...prev, includeEvents: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Events</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={printSettings.includeTasks}
                  onChange={(e) => setPrintSettings(prev => ({ ...prev, includeTasks: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Tasks</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={printSettings.includeWeekends}
                  onChange={(e) => setPrintSettings(prev => ({ ...prev, includeWeekends: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Weekends</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={printSettings.colorPrint}
                  onChange={(e) => setPrintSettings(prev => ({ ...prev, colorPrint: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Color printing</span>
              </label>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="btn-secondary"
            disabled={isGenerating}
          >
            Cancel
          </button>
          <button
            onClick={handleExportPDF}
            disabled={isGenerating}
            className="btn-secondary flex items-center"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Export HTML
          </button>
          <button
            onClick={handlePrint}
            disabled={isGenerating}
            className="btn-primary flex items-center"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Printer className="w-4 h-4 mr-2" />
            )}
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarPrint;