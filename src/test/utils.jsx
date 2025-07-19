import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '../context/ThemeContext'
import { AuthProvider } from '../context/AuthContext'

// Custom render function that includes providers
export const renderWithProviders = (ui, options = {}) => {
  const { initialEntries = ['/'], ...renderOptions } = options

  const Wrapper = ({ children }) => (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Mock user data
export const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  avatar: '/api/placeholder/32/32'
}

// Mock asset data
export const mockAsset = {
  id: 1,
  name: 'Test Asset',
  type: 'Apartment',
  status: 'Active',
  condition: 'Good',
  address: {
    street: '123 Test St',
    city: 'Test City',
    state: 'Test State',
    zipCode: '12345'
  },
  details: {
    bedrooms: 2,
    bathrooms: 1,
    floors: 1,
    balcony: true,
    features: ['Test Feature']
  },
  images: ['/api/placeholder/400/300'],
  inspectionStatus: 'Not Inspected',
  nextInspection: '2025-08-01',
  createdAt: '2025-07-01',
  updatedAt: '2025-07-01'
}

// Mock task data
export const mockTask = {
  id: 1,
  title: 'Test Task',
  description: 'Test Description',
  assetId: 1,
  assetName: 'Test Asset',
  type: 'Inspection',
  status: 'Not Inspected',
  priority: 'High',
  dueDate: '2025-07-25T09:00:00Z',
  time: '09:00 AM',
  assignedTo: 'Agent X',
  frequency: 'Monthly',
  condition: 'Good',
  notifications: {
    email: true,
    sms: false,
    inApp: true
  },
  createdAt: '2025-07-10T10:00:00Z',
  updatedAt: '2025-07-17T10:00:00Z'
}

// Mock notification data
export const mockNotification = {
  id: '1',
  type: 'task_due',
  title: 'Task Due Today',
  message: 'Test task is due today',
  timestamp: new Date().toISOString(),
  read: false,
  assetId: '1',
  taskId: '1'
}

// Re-export testing utilities
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'