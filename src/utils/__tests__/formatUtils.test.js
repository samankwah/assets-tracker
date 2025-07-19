import { describe, it, expect } from 'vitest'
import { 
  formatCurrency, 
  formatDate, 
  formatPhase, 
  formatPriority,
  formatFileSize,
  formatDuration,
  formatPercentage,
  truncateText,
  capitalizeFirst,
  formatPhoneNumber,
  formatAddress
} from '../formatUtils'

describe('formatUtils', () => {
  describe('formatCurrency', () => {
    it('formats positive numbers correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
      expect(formatCurrency(0)).toBe('$0.00')
      expect(formatCurrency(1000000)).toBe('$1,000,000.00')
    })

    it('formats negative numbers correctly', () => {
      expect(formatCurrency(-1234.56)).toBe('-$1,234.56')
    })

    it('handles edge cases', () => {
      expect(formatCurrency(null)).toBe('$0.00')
      expect(formatCurrency(undefined)).toBe('$0.00')
      expect(formatCurrency('')).toBe('$0.00')
    })

    it('supports different currencies', () => {
      expect(formatCurrency(1234.56, 'EUR')).toBe('€1,234.56')
      expect(formatCurrency(1234.56, 'GBP')).toBe('£1,234.56')
    })
  })

  describe('formatDate', () => {
    it('formats date objects correctly', () => {
      const date = new Date('2025-01-15T10:30:00Z')
      expect(formatDate(date)).toBe('Jan 15, 2025')
      expect(formatDate(date, 'full')).toBe('January 15, 2025')
      expect(formatDate(date, 'short')).toBe('1/15/25')
    })

    it('formats date strings correctly', () => {
      expect(formatDate('2025-01-15')).toBe('Jan 15, 2025')
      expect(formatDate('2025-01-15T10:30:00Z')).toBe('Jan 15, 2025')
    })

    it('handles invalid dates', () => {
      expect(formatDate(null)).toBe('--')
      expect(formatDate(undefined)).toBe('--')
      expect(formatDate('invalid-date')).toBe('--')
    })

    it('supports time formatting', () => {
      const date = new Date('2025-01-15T10:30:00Z')
      expect(formatDate(date, 'datetime')).toBe('Jan 15, 2025 10:30 AM')
      expect(formatDate(date, 'time')).toBe('10:30 AM')
    })
  })

  describe('formatPhase', () => {
    it('formats phase names correctly', () => {
      expect(formatPhase('planning')).toBe('Planning')
      expect(formatPhase('development')).toBe('Development')
      expect(formatPhase('testing')).toBe('Testing')
      expect(formatPhase('active')).toBe('Active')
      expect(formatPhase('maintenance')).toBe('Maintenance')
    })

    it('handles unknown phases', () => {
      expect(formatPhase('unknown-phase')).toBe('Unknown Phase')
      expect(formatPhase('')).toBe('')
      expect(formatPhase(null)).toBe('')
    })

    it('preserves multi-word phases', () => {
      expect(formatPhase('pre_construction')).toBe('Pre Construction')
      expect(formatPhase('post_deployment')).toBe('Post Deployment')
    })
  })

  describe('formatPriority', () => {
    it('formats priority levels correctly', () => {
      expect(formatPriority('high')).toBe('High')
      expect(formatPriority('medium')).toBe('Medium')
      expect(formatPriority('low')).toBe('Low')
      expect(formatPriority('urgent')).toBe('Urgent')
    })

    it('handles unknown priorities', () => {
      expect(formatPriority('unknown')).toBe('Unknown')
      expect(formatPriority('')).toBe('')
      expect(formatPriority(null)).toBe('')
    })

    it('returns priority with color class', () => {
      expect(formatPriority('high', true)).toMatchObject({
        text: 'High',
        className: 'text-red-600 bg-red-50'
      })
      expect(formatPriority('medium', true)).toMatchObject({
        text: 'Medium',
        className: 'text-yellow-600 bg-yellow-50'
      })
      expect(formatPriority('low', true)).toMatchObject({
        text: 'Low',
        className: 'text-green-600 bg-green-50'
      })
    })
  })

  describe('formatFileSize', () => {
    it('formats bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 B')
      expect(formatFileSize(512)).toBe('512 B')
      expect(formatFileSize(1023)).toBe('1023 B')
    })

    it('formats kilobytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB')
      expect(formatFileSize(1536)).toBe('1.5 KB')
      expect(formatFileSize(2048)).toBe('2.0 KB')
    })

    it('formats megabytes correctly', () => {
      expect(formatFileSize(1048576)).toBe('1.0 MB')
      expect(formatFileSize(1572864)).toBe('1.5 MB')
    })

    it('formats gigabytes correctly', () => {
      expect(formatFileSize(1073741824)).toBe('1.0 GB')
      expect(formatFileSize(2147483648)).toBe('2.0 GB')
    })

    it('handles edge cases', () => {
      expect(formatFileSize(null)).toBe('0 B')
      expect(formatFileSize(undefined)).toBe('0 B')
      expect(formatFileSize(-1)).toBe('0 B')
    })
  })

  describe('formatDuration', () => {
    it('formats minutes correctly', () => {
      expect(formatDuration(30)).toBe('30 min')
      expect(formatDuration(59)).toBe('59 min')
    })

    it('formats hours correctly', () => {
      expect(formatDuration(60)).toBe('1h 0m')
      expect(formatDuration(90)).toBe('1h 30m')
      expect(formatDuration(120)).toBe('2h 0m')
    })

    it('formats days correctly', () => {
      expect(formatDuration(1440)).toBe('1 day')
      expect(formatDuration(2880)).toBe('2 days')
      expect(formatDuration(1500)).toBe('1 day 1h')
    })

    it('handles edge cases', () => {
      expect(formatDuration(0)).toBe('0 min')
      expect(formatDuration(null)).toBe('0 min')
      expect(formatDuration(undefined)).toBe('0 min')
    })
  })

  describe('formatPercentage', () => {
    it('formats percentages correctly', () => {
      expect(formatPercentage(0.5)).toBe('50%')
      expect(formatPercentage(0.333)).toBe('33%')
      expect(formatPercentage(1)).toBe('100%')
      expect(formatPercentage(0)).toBe('0%')
    })

    it('handles numbers already as percentages', () => {
      expect(formatPercentage(50, true)).toBe('50%')
      expect(formatPercentage(33.33, true)).toBe('33%')
    })

    it('handles edge cases', () => {
      expect(formatPercentage(null)).toBe('0%')
      expect(formatPercentage(undefined)).toBe('0%')
      expect(formatPercentage(-0.1)).toBe('0%')
      expect(formatPercentage(1.5)).toBe('100%')
    })

    it('supports decimal places', () => {
      expect(formatPercentage(0.333, false, 1)).toBe('33.3%')
      expect(formatPercentage(0.333, false, 2)).toBe('33.33%')
    })
  })

  describe('truncateText', () => {
    it('truncates long text correctly', () => {
      const longText = 'This is a very long text that should be truncated'
      expect(truncateText(longText, 20)).toBe('This is a very long...')
    })

    it('preserves short text', () => {
      const shortText = 'Short text'
      expect(truncateText(shortText, 20)).toBe('Short text')
    })

    it('handles edge cases', () => {
      expect(truncateText('', 10)).toBe('')
      expect(truncateText(null, 10)).toBe('')
      expect(truncateText(undefined, 10)).toBe('')
    })

    it('supports custom ellipsis', () => {
      const text = 'This is a long text'
      expect(truncateText(text, 10, '...')).toBe('This is a...')
      expect(truncateText(text, 10, ' →')).toBe('This is a →')
    })
  })

  describe('capitalizeFirst', () => {
    it('capitalizes first letter correctly', () => {
      expect(capitalizeFirst('hello')).toBe('Hello')
      expect(capitalizeFirst('HELLO')).toBe('HELLO')
      expect(capitalizeFirst('hELLO')).toBe('HELLO')
    })

    it('handles edge cases', () => {
      expect(capitalizeFirst('')).toBe('')
      expect(capitalizeFirst(null)).toBe('')
      expect(capitalizeFirst(undefined)).toBe('')
      expect(capitalizeFirst('a')).toBe('A')
    })

    it('preserves rest of string', () => {
      expect(capitalizeFirst('hello world')).toBe('Hello world')
      expect(capitalizeFirst('firstName')).toBe('FirstName')
    })
  })

  describe('formatPhoneNumber', () => {
    it('formats US phone numbers correctly', () => {
      expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890')
      expect(formatPhoneNumber('12345678901')).toBe('+1 (234) 567-8901')
    })

    it('handles formatted input', () => {
      expect(formatPhoneNumber('(123) 456-7890')).toBe('(123) 456-7890')
      expect(formatPhoneNumber('+1 (123) 456-7890')).toBe('+1 (123) 456-7890')
    })

    it('handles invalid input', () => {
      expect(formatPhoneNumber('123')).toBe('123')
      expect(formatPhoneNumber('')).toBe('')
      expect(formatPhoneNumber(null)).toBe('')
    })

    it('strips non-numeric characters', () => {
      expect(formatPhoneNumber('123-456-7890')).toBe('(123) 456-7890')
      expect(formatPhoneNumber('123.456.7890')).toBe('(123) 456-7890')
      expect(formatPhoneNumber('123 456 7890')).toBe('(123) 456-7890')
    })
  })

  describe('formatAddress', () => {
    it('formats complete address correctly', () => {
      const address = {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001'
      }
      expect(formatAddress(address)).toBe('123 Main St, New York, NY 10001')
    })

    it('handles partial addresses', () => {
      expect(formatAddress({ street: '123 Main St', city: 'New York' }))
        .toBe('123 Main St, New York')
      
      expect(formatAddress({ city: 'New York', state: 'NY' }))
        .toBe('New York, NY')
    })

    it('handles single-line format', () => {
      const address = {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001'
      }
      expect(formatAddress(address, true)).toBe('123 Main St, New York, NY 10001')
    })

    it('handles multi-line format', () => {
      const address = {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001'
      }
      expect(formatAddress(address, false)).toBe('123 Main St\nNew York, NY 10001')
    })

    it('handles empty or null addresses', () => {
      expect(formatAddress({})).toBe('')
      expect(formatAddress(null)).toBe('')
      expect(formatAddress(undefined)).toBe('')
    })

    it('trims whitespace', () => {
      const address = {
        street: '  123 Main St  ',
        city: '  New York  ',
        state: '  NY  '
      }
      expect(formatAddress(address)).toBe('123 Main St, New York, NY')
    })
  })
})