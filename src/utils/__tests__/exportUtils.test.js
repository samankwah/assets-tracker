import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportUtils } from '../exportUtils'

// Mock file-saver
const mockSaveAs = vi.fn()
vi.mock('file-saver', () => ({
  saveAs: mockSaveAs
}))

// Mock jsPDF
const mockJsPDF = vi.fn(() => ({
  setFontSize: vi.fn(),
  text: vi.fn(),
  autoTable: vi.fn(),
  save: vi.fn(),
  internal: {
    getNumberOfPages: vi.fn(() => 1),
    pageSize: { width: 210, height: 297 }
  }
}))

vi.mock('jspdf', () => ({
  default: mockJsPDF
}))

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn((date, formatStr) => {
    if (formatStr === 'yyyy-MM-dd') return '2025-01-15'
    if (formatStr === 'PPP') return 'January 15th, 2025'
    if (formatStr === 'MMM d, yyyy') return 'Jan 15, 2025'
    return '2025-01-15'
  })
}))

describe('exportUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('exportToCSV', () => {
    it('exports simple data to CSV', () => {
      const data = [
        { name: 'John', age: 30, city: 'New York' },
        { name: 'Jane', age: 25, city: 'Los Angeles' }
      ]

      exportUtils.exportToCSV(data, 'users')

      expect(mockSaveAs).toHaveBeenCalledWith(
        expect.any(Blob),
        'users_2025-01-15.csv'
      )

      const [[blob]] = mockSaveAs.mock.calls
      expect(blob.type).toBe('text/csv;charset=utf-8;')
    })

    it('handles data with commas and quotes in values', () => {
      const data = [
        { name: 'John, Jr.', description: 'He said "Hello"' },
        { name: 'Jane', description: 'Simple text' }
      ]

      exportUtils.exportToCSV(data, 'test')

      expect(mockSaveAs).toHaveBeenCalled()
    })

    it('handles null and undefined values', () => {
      const data = [
        { name: 'John', age: null, city: undefined },
        { name: 'Jane', age: 25, city: 'LA' }
      ]

      exportUtils.exportToCSV(data, 'test')

      expect(mockSaveAs).toHaveBeenCalled()
    })

    it('handles object values by JSON stringifying', () => {
      const data = [
        { name: 'John', address: { street: '123 Main', city: 'NY' } }
      ]

      exportUtils.exportToCSV(data, 'test')

      expect(mockSaveAs).toHaveBeenCalled()
    })

    it('throws error for empty data', () => {
      expect(() => exportUtils.exportToCSV([], 'test')).toThrow('No data to export')
      expect(() => exportUtils.exportToCSV(null, 'test')).toThrow('No data to export')
    })
  })

  describe('exportToPDF', () => {
    const mockDoc = {
      setFontSize: vi.fn(),
      text: vi.fn(),
      autoTable: vi.fn(),
      save: vi.fn(),
      internal: {
        getNumberOfPages: vi.fn(() => 1),
        pageSize: { width: 210, height: 297 }
      }
    }

    beforeEach(() => {
      mockJsPDF.mockReturnValue(mockDoc)
    })

    it('exports data to PDF with default settings', () => {
      const data = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 }
      ]

      exportUtils.exportToPDF(data, 'Users Report', null, 'users')

      expect(mockJsPDF).toHaveBeenCalled()
      expect(mockDoc.setFontSize).toHaveBeenCalledWith(20)
      expect(mockDoc.text).toHaveBeenCalledWith('Users Report', 14, 22)
      expect(mockDoc.autoTable).toHaveBeenCalled()
      expect(mockDoc.save).toHaveBeenCalledWith('users_2025-01-15.pdf')
    })

    it('handles custom columns configuration', () => {
      const data = [{ name: 'John', age: 30 }]
      const columns = [
        { header: 'Full Name', dataKey: 'name' },
        { header: 'Years Old', dataKey: 'age' }
      ]

      exportUtils.exportToPDF(data, 'Test', columns, 'test')

      expect(mockDoc.autoTable).toHaveBeenCalledWith(
        expect.objectContaining({
          head: [['Full Name', 'Years Old']]
        })
      )
    })

    it('formats object values correctly', () => {
      const data = [{
        name: 'John',
        address: { street: '123 Main', city: 'NY' }
      }]

      exportUtils.exportToPDF(data, 'Test', null, 'test')

      expect(mockDoc.autoTable).toHaveBeenCalled()
    })

    it('throws error for empty data', () => {
      expect(() => exportUtils.exportToPDF([], 'Test')).toThrow('No data to export')
    })
  })

  describe('exportAssetsToPDF', () => {
    it('exports assets with proper formatting', () => {
      const mockDoc = {
        setFontSize: vi.fn(),
        text: vi.fn(),
        autoTable: vi.fn(),
        save: vi.fn(),
        internal: {
          getNumberOfPages: vi.fn(() => 1),
          pageSize: { width: 210, height: 297 }
        }
      }
      mockJsPDF.mockReturnValue(mockDoc)

      const assets = [
        {
          id: '1',
          name: 'Downtown Apartment',
          type: 'Apartment',
          status: 'Active',
          condition: 'Good',
          address: { street: '123 Main St', city: 'New York' },
          currentPhase: 'active',
          createdAt: '2025-01-01T00:00:00Z'
        }
      ]

      exportUtils.exportAssetsToPDF(assets)

      expect(mockJsPDF).toHaveBeenCalled()
      expect(mockDoc.save).toHaveBeenCalledWith('assets_2025-01-15.pdf')
    })
  })

  describe('exportTasksToPDF', () => {
    it('exports tasks with proper formatting', () => {
      const mockDoc = {
        setFontSize: vi.fn(),
        text: vi.fn(),
        autoTable: vi.fn(),
        save: vi.fn(),
        internal: {
          getNumberOfPages: vi.fn(() => 1),
          pageSize: { width: 210, height: 297 }
        }
      }
      mockJsPDF.mockReturnValue(mockDoc)

      const tasks = [
        {
          id: '1',
          title: 'Monthly Inspection',
          assetName: 'Downtown Apartment',
          type: 'Inspection',
          priority: 'High',
          status: 'Scheduled',
          dueDate: '2025-01-15T09:00:00Z',
          assignedTo: 'John Doe'
        }
      ]

      exportUtils.exportTasksToPDF(tasks)

      expect(mockJsPDF).toHaveBeenCalled()
      expect(mockDoc.save).toHaveBeenCalledWith('tasks_2025-01-15.pdf')
    })
  })

  describe('formatDataForExport', () => {
    it('formats assets data correctly', () => {
      const assets = [
        {
          id: '1',
          name: 'Downtown Apartment',
          type: 'Apartment',
          status: 'Active',
          condition: 'Good',
          address: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001'
          },
          details: {
            bedrooms: 2,
            bathrooms: 1,
            squareFeet: 850
          },
          currentPhase: 'active',
          priority: 'Medium',
          inspectionStatus: 'Recently Inspected',
          createdAt: '2025-01-01T00:00:00Z'
        }
      ]

      const result = exportUtils.formatDataForExport(assets, 'assets')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        Name: 'Downtown Apartment',
        Type: 'Apartment',
        Status: 'Active',
        Condition: 'Good',
        Address: '123 Main St, New York, NY',
        'Zip Code': '10001',
        Bedrooms: 2,
        Bathrooms: 1,
        'Square Feet': 850,
        Phase: 'active',
        Priority: 'Medium',
        'Inspection Status': 'Recently Inspected'
      })
    })

    it('formats tasks data correctly', () => {
      const tasks = [
        {
          id: '1',
          title: 'Monthly Inspection',
          description: 'Regular inspection',
          assetName: 'Downtown Apartment',
          type: 'Inspection',
          priority: 'High',
          status: 'Scheduled',
          assignedTo: 'John Doe',
          dueDate: '2025-01-15T09:00:00Z',
          dueTime: '09:00 AM',
          frequency: 'Monthly',
          notifications: { email: true, sms: false },
          createdAt: '2025-01-01T00:00:00Z'
        }
      ]

      const result = exportUtils.formatDataForExport(tasks, 'tasks')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        Title: 'Monthly Inspection',
        Description: 'Regular inspection',
        'Asset Name': 'Downtown Apartment',
        Type: 'Inspection',
        Priority: 'High',
        Status: 'Scheduled',
        'Assigned To': 'John Doe',
        'Due Time': '09:00 AM',
        Frequency: 'Monthly',
        'Email Notifications': 'Yes',
        'SMS Notifications': 'No'
      })
    })

    it('handles missing optional fields', () => {
      const assets = [
        {
          id: '1',
          name: 'Basic Asset',
          type: 'Apartment',
          status: 'Active'
        }
      ]

      const result = exportUtils.formatDataForExport(assets, 'assets')

      expect(result[0]).toMatchObject({
        Name: 'Basic Asset',
        Type: 'Apartment',
        Status: 'Active',
        Address: '',
        'Zip Code': '',
        Bedrooms: '',
        Bathrooms: ''
      })
    })

    it('returns original data for unknown types', () => {
      const data = [{ id: 1, name: 'Test' }]
      const result = exportUtils.formatDataForExport(data, 'unknown')

      expect(result).toEqual(data)
    })
  })
})