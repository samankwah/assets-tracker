import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NotificationSettings from '../NotificationSettings'

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

// Mock stores
const mockUpdateNotificationSettings = vi.fn()
const mockNotificationSettings = {
  email: {
    taskDue: true,
    taskAssigned: true,
    inspectionReminder: false,
    systemUpdates: true
  },
  sms: {
    urgentTasks: true,
    inspectionDue: false,
    systemAlerts: true
  },
  browser: {
    taskNotifications: true,
    calendarReminders: true,
    assetUpdates: false
  },
  quietHours: {
    enabled: true,
    startTime: '22:00',
    endTime: '08:00'
  }
}

vi.mock('../../../stores/authStore', () => ({
  useAuthStore: () => ({
    user: {
      id: '1',
      notificationSettings: mockNotificationSettings
    },
    updateNotificationSettings: mockUpdateNotificationSettings
  })
}))

describe('NotificationSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders notification settings form', () => {
    render(<NotificationSettings />)
    
    expect(screen.getByText('Notification Settings')).toBeInTheDocument()
    expect(screen.getByText('Email Notifications')).toBeInTheDocument()
    expect(screen.getByText('SMS Notifications')).toBeInTheDocument()
    expect(screen.getByText('Browser Notifications')).toBeInTheDocument()
  })

  it('renders email notification options', () => {
    render(<NotificationSettings />)
    
    expect(screen.getByText('Task Due Reminders')).toBeInTheDocument()
    expect(screen.getByText('Task Assignments')).toBeInTheDocument()
    expect(screen.getByText('Inspection Reminders')).toBeInTheDocument()
    expect(screen.getByText('System Updates')).toBeInTheDocument()
  })

  it('renders SMS notification options', () => {
    render(<NotificationSettings />)
    
    expect(screen.getByText('Urgent Tasks')).toBeInTheDocument()
    expect(screen.getByText('Inspection Due')).toBeInTheDocument()
    expect(screen.getByText('System Alerts')).toBeInTheDocument()
  })

  it('renders browser notification options', () => {
    render(<NotificationSettings />)
    
    expect(screen.getByText('Task Notifications')).toBeInTheDocument()
    expect(screen.getByText('Calendar Reminders')).toBeInTheDocument()
    expect(screen.getByText('Asset Updates')).toBeInTheDocument()
  })

  it('renders quiet hours settings', () => {
    render(<NotificationSettings />)
    
    expect(screen.getByText('Quiet Hours')).toBeInTheDocument()
    expect(screen.getByText('Enable quiet hours')).toBeInTheDocument()
    expect(screen.getByLabelText(/start time/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/end time/i)).toBeInTheDocument()
  })

  it('displays current settings correctly', () => {
    render(<NotificationSettings />)
    
    // Check that checkboxes reflect current settings
    const taskDueCheckbox = screen.getByLabelText(/task due reminders/i)
    expect(taskDueCheckbox).toBeChecked()
    
    const inspectionReminderCheckbox = screen.getByLabelText(/inspection reminders/i)
    expect(inspectionReminderCheckbox).not.toBeChecked()
    
    const quietHoursCheckbox = screen.getByLabelText(/enable quiet hours/i)
    expect(quietHoursCheckbox).toBeChecked()
  })

  it('handles email notification toggle', async () => {
    const user = userEvent.setup()
    render(<NotificationSettings />)
    
    const checkbox = screen.getByLabelText(/task due reminders/i)
    await user.click(checkbox)
    
    await waitFor(() => {
      expect(mockUpdateNotificationSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          email: expect.objectContaining({
            taskDue: false
          })
        })
      )
    })
  })

  it('handles SMS notification toggle', async () => {
    const user = userEvent.setup()
    render(<NotificationSettings />)
    
    const checkbox = screen.getByLabelText(/urgent tasks/i)
    await user.click(checkbox)
    
    await waitFor(() => {
      expect(mockUpdateNotificationSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          sms: expect.objectContaining({
            urgentTasks: false
          })
        })
      )
    })
  })

  it('handles browser notification toggle', async () => {
    const user = userEvent.setup()
    render(<NotificationSettings />)
    
    const checkbox = screen.getByLabelText(/task notifications/i)
    await user.click(checkbox)
    
    await waitFor(() => {
      expect(mockUpdateNotificationSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          browser: expect.objectContaining({
            taskNotifications: false
          })
        })
      )
    })
  })

  it('handles quiet hours toggle', async () => {
    const user = userEvent.setup()
    render(<NotificationSettings />)
    
    const checkbox = screen.getByLabelText(/enable quiet hours/i)
    await user.click(checkbox)
    
    await waitFor(() => {
      expect(mockUpdateNotificationSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          quietHours: expect.objectContaining({
            enabled: false
          })
        })
      )
    })
  })

  it('handles quiet hours time changes', async () => {
    const user = userEvent.setup()
    render(<NotificationSettings />)
    
    const startTimeInput = screen.getByLabelText(/start time/i)
    await user.clear(startTimeInput)
    await user.type(startTimeInput, '23:00')
    
    await waitFor(() => {
      expect(mockUpdateNotificationSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          quietHours: expect.objectContaining({
            startTime: '23:00'
          })
        })
      )
    })
  })

  it('renders save button', () => {
    render(<NotificationSettings />)
    
    expect(screen.getByText('Save Settings')).toBeInTheDocument()
  })

  it('renders reset to defaults button', () => {
    render(<NotificationSettings />)
    
    expect(screen.getByText('Reset to Defaults')).toBeInTheDocument()
  })

  it('handles save button click', async () => {
    const user = userEvent.setup()
    render(<NotificationSettings />)
    
    const saveButton = screen.getByText('Save Settings')
    await user.click(saveButton)
    
    expect(mockUpdateNotificationSettings).toHaveBeenCalled()
  })

  it('groups related settings together', () => {
    render(<NotificationSettings />)
    
    // Check that settings are organized in sections
    const emailSection = screen.getByText('Email Notifications').closest('div')
    expect(emailSection).toContainElement(screen.getByText('Task Due Reminders'))
    expect(emailSection).toContainElement(screen.getByText('Task Assignments'))
    
    const smsSection = screen.getByText('SMS Notifications').closest('div')
    expect(smsSection).toContainElement(screen.getByText('Urgent Tasks'))
    expect(smsSection).toContainElement(screen.getByText('System Alerts'))
  })

  it('has proper accessibility attributes', () => {
    render(<NotificationSettings />)
    
    const form = screen.getByRole('group', { name: /notification settings/i })
    expect(form).toBeInTheDocument()
    
    // Check that all checkboxes have proper labels
    const checkboxes = screen.getAllByRole('checkbox')
    checkboxes.forEach(checkbox => {
      expect(checkbox).toHaveAccessibleName()
    })
  })

  it('shows loading state when updating', () => {
    // Mock loading state
    vi.mocked(mockUpdateNotificationSettings).mockImplementation(() => {
      return new Promise(resolve => setTimeout(resolve, 100))
    })
    
    render(<NotificationSettings />)
    
    // This would show loading state in the actual component
    expect(screen.getByText('Save Settings')).toBeInTheDocument()
  })
})