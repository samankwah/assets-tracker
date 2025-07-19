import React, { useState, useEffect } from 'react'
import {
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  Building,
  Bell,
  Repeat,
  Save,
  Trash2,
  Copy,
  AlertCircle,
  Plus,
  Minus
} from 'lucide-react'
import { useCalendarStore } from '../../stores/calendarStore'
import { useAssetStore } from '../../stores/assetStore'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'

const EnhancedEventModal = ({ 
  isOpen, 
  onClose, 
  event = null, 
  initialDate = null,
  mode = 'create' // 'create', 'edit', 'view'
}) => {
  const {
    createEvent,
    updateEvent,
    deleteEvent,
    createEventFromTemplate,
    getDefaultTemplates,
    createReminder
  } = useCalendarStore()

  const { assets } = useAssetStore()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start: '',
    end: '',
    type: 'custom',
    category: 'general',
    assetId: '',
    assignedTo: '',
    priority: 'Medium',
    status: 'Scheduled',
    location: '',
    allDay: false,
    color: '#3b82f6',
    notes: '',
    recurring: null,
    reminders: []
  })

  const [recurringSettings, setRecurringSettings] = useState({
    enabled: false,
    frequency: 'weekly', // daily, weekly, monthly, yearly
    interval: 1,
    endType: 'never', // never, after, on
    endCount: 10,
    endDate: '',
    daysOfWeek: [], // for weekly: [0,1,2,3,4,5,6] (Sun-Sat)
    monthlyPattern: 'byDate' // byDate, byDay
  })

  const [activeTab, setActiveTab] = useState('details')
  const [errors, setErrors] = useState({})

  const eventTypes = [
    { value: 'custom', label: 'Custom Event' },
    { value: 'Inspection', label: 'Property Inspection' },
    { value: 'Maintenance', label: 'Maintenance Work' },
    { value: 'Meeting', label: 'Client Meeting' },
    { value: 'Emergency', label: 'Emergency Response' },
    { value: 'Cleaning', label: 'Cleaning Service' },
    { value: 'Safety Check', label: 'Safety Check' },
    { value: 'Planning', label: 'Planning Session' }
  ]

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'business', label: 'Business' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'administrative', label: 'Administrative' }
  ]

  const priorities = [
    { value: 'Low', label: 'Low', color: '#6b7280' },
    { value: 'Medium', label: 'Medium', color: '#3b82f6' },
    { value: 'High', label: 'High', color: '#f59e0b' }
  ]

  const statuses = [
    { value: 'Scheduled', label: 'Scheduled' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Cancelled', label: 'Cancelled' }
  ]

  const reminderTypes = [
    { value: 'email', label: 'Email' },
    { value: 'popup', label: 'Popup' },
    { value: 'sms', label: 'SMS' },
    { value: 'push', label: 'Push Notification' }
  ]

  const defaultTemplates = getDefaultTemplates()

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        start: event.start ? format(new Date(event.start), "yyyy-MM-dd'T'HH:mm") : '',
        end: event.end ? format(new Date(event.end), "yyyy-MM-dd'T'HH:mm") : '',
        type: event.type || 'custom',
        category: event.category || 'general',
        assetId: event.assetId || '',
        assignedTo: event.assignedTo || '',
        priority: event.priority || 'Medium',
        status: event.status || 'Scheduled',
        location: event.location || '',
        allDay: event.allDay || false,
        color: event.color || '#3b82f6',
        notes: event.notes || '',
        reminders: event.reminders || []
      })

      if (event.recurring) {
        setRecurringSettings({
          enabled: true,
          frequency: event.recurring.frequency || 'weekly',
          interval: event.recurring.interval || 1,
          endType: event.recurring.endDate ? 'on' : event.recurring.count ? 'after' : 'never',
          endCount: event.recurring.count || 10,
          endDate: event.recurring.endDate ? format(new Date(event.recurring.endDate), 'yyyy-MM-dd') : '',
          daysOfWeek: event.recurring.daysOfWeek || [],
          monthlyPattern: event.recurring.monthlyPattern || 'byDate'
        })
      }
    } else if (initialDate) {
      const startDate = new Date(initialDate)
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // 1 hour later
      
      setFormData(prev => ({
        ...prev,
        start: format(startDate, "yyyy-MM-dd'T'HH:mm"),
        end: format(endDate, "yyyy-MM-dd'T'HH:mm")
      }))
    }
  }, [event, initialDate])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }))
    }

    // Auto-set end time when start time changes
    if (field === 'start' && value) {
      const startDate = new Date(value)
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000)
      setFormData(prev => ({
        ...prev,
        end: format(endDate, "yyyy-MM-dd'T'HH:mm")
      }))
    }

    // Update asset name when asset changes
    if (field === 'assetId' && value) {
      const asset = assets.find(a => a.id.toString() === value)
      setFormData(prev => ({
        ...prev,
        assetName: asset?.name || ''
      }))
    }
  }

  const handleRecurringChange = (field, value) => {
    setRecurringSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addReminder = () => {
    const newReminder = {
      id: Date.now(),
      type: 'email',
      timing: 15, // 15 minutes before
      message: ''
    }

    setFormData(prev => ({
      ...prev,
      reminders: [...prev.reminders, newReminder]
    }))
  }

  const updateReminder = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      reminders: prev.reminders.map((reminder, i) =>
        i === index ? { ...reminder, [field]: value } : reminder
      )
    }))
  }

  const removeReminder = (index) => {
    setFormData(prev => ({
      ...prev,
      reminders: prev.reminders.filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.start) {
      newErrors.start = 'Start date and time is required'
    }

    if (!formData.end) {
      newErrors.end = 'End date and time is required'
    }

    if (formData.start && formData.end && new Date(formData.start) >= new Date(formData.end)) {
      newErrors.end = 'End time must be after start time'
    }

    if (recurringSettings.enabled && recurringSettings.endType === 'after' && recurringSettings.endCount < 1) {
      newErrors.endCount = 'Count must be at least 1'
    }

    if (recurringSettings.enabled && recurringSettings.endType === 'on' && !recurringSettings.endDate) {
      newErrors.endDate = 'End date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) {
      toast.error('Please fix the errors before saving')
      return
    }

    try {
      const eventData = {
        ...formData,
        start: new Date(formData.start),
        end: new Date(formData.end),
        assetName: formData.assetId ? assets.find(a => a.id.toString() === formData.assetId)?.name : '',
        recurring: recurringSettings.enabled ? {
          frequency: recurringSettings.frequency,
          interval: recurringSettings.interval,
          endDate: recurringSettings.endType === 'on' ? new Date(recurringSettings.endDate) : null,
          count: recurringSettings.endType === 'after' ? recurringSettings.endCount : null,
          daysOfWeek: recurringSettings.daysOfWeek,
          monthlyPattern: recurringSettings.monthlyPattern
        } : null
      }

      let savedEvent
      if (mode === 'edit' && event) {
        updateEvent(event.id, eventData)
        savedEvent = { ...event, ...eventData }
        toast.success('Event updated successfully')
      } else {
        savedEvent = createEvent(eventData)
        toast.success(recurringSettings.enabled ? 'Recurring event series created successfully' : 'Event created successfully')
      }

      onClose()
    } catch (error) {
      toast.error('Failed to save event')
      console.error('Event save error:', error)
    }
  }

  const handleDelete = () => {
    if (!event) return

    if (event.recurring && !event.recurring.isInstance) {
      // Ask if user wants to delete entire series
      if (window.confirm('This is a recurring event. Delete entire series?')) {
        deleteEvent(event.id, { deleteAll: true })
        toast.success('Recurring event series deleted')
      } else {
        deleteEvent(event.id)
        toast.success('Event deleted')
      }
    } else {
      deleteEvent(event.id)
      toast.success('Event deleted')
    }

    onClose()
  }

  const handleCreateFromTemplate = (templateId) => {
    const template = defaultTemplates.find(t => t.id === templateId)
    if (!template) return

    setFormData(prev => ({
      ...prev,
      title: template.name,
      description: template.description,
      type: template.type,
      category: template.category,
      priority: template.priority,
      color: template.color
    }))

    // Set end time based on template duration
    if (formData.start) {
      const startDate = new Date(formData.start)
      const endDate = new Date(startDate.getTime() + template.duration * 60000)
      setFormData(prev => ({
        ...prev,
        end: format(endDate, "yyyy-MM-dd'T'HH:mm")
      }))
    }

    toast.success('Template applied successfully')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {mode === 'create' ? 'Create Event' : mode === 'edit' ? 'Edit Event' : 'Event Details'}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            {mode !== 'view' && (
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
            )}
            {mode === 'edit' && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'details', label: 'Event Details' },
              { key: 'recurring', label: 'Recurring' },
              { key: 'reminders', label: 'Reminders' },
              { key: 'templates', label: 'Templates' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Event Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                      errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter event title"
                    disabled={mode === 'view'}
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter event description"
                    disabled={mode === 'view'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.start}
                    onChange={(e) => handleInputChange('start', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                      errors.start ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    disabled={mode === 'view'}
                  />
                  {errors.start && <p className="text-red-500 text-sm mt-1">{errors.start}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.end}
                    onChange={(e) => handleInputChange('end', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                      errors.end ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    disabled={mode === 'view'}
                  />
                  {errors.end && <p className="text-red-500 text-sm mt-1">{errors.end}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Event Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    disabled={mode === 'view'}
                  >
                    {eventTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    disabled={mode === 'view'}
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    disabled={mode === 'view'}
                  >
                    {priorities.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    disabled={mode === 'view'}
                  >
                    {statuses.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Related Asset
                  </label>
                  <select
                    value={formData.assetId}
                    onChange={(e) => handleInputChange('assetId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    disabled={mode === 'view'}
                  >
                    <option value="">Select an asset</option>
                    {assets.map(asset => (
                      <option key={asset.id} value={asset.id}>
                        {asset.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Assigned To
                  </label>
                  <input
                    type="text"
                    value={formData.assignedTo}
                    onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter assignee name"
                    disabled={mode === 'view'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter event location"
                    disabled={mode === 'view'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Color
                  </label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={mode === 'view'}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.allDay}
                      onChange={(e) => handleInputChange('allDay', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={mode === 'view'}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">All Day Event</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Recurring Tab */}
          {activeTab === 'recurring' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={recurringSettings.enabled}
                  onChange={(e) => handleRecurringChange('enabled', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={mode === 'view'}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Make this a recurring event
                </span>
              </div>

              {recurringSettings.enabled && (
                <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Frequency
                      </label>
                      <select
                        value={recurringSettings.frequency}
                        onChange={(e) => handleRecurringChange('frequency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        disabled={mode === 'view'}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Every
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={recurringSettings.interval}
                        onChange={(e) => handleRecurringChange('interval', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        disabled={mode === 'view'}
                      />
                    </div>
                  </div>

                  {recurringSettings.frequency === 'weekly' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Days of Week
                      </label>
                      <div className="flex space-x-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                          <label key={day} className="flex items-center space-x-1">
                            <input
                              type="checkbox"
                              checked={recurringSettings.daysOfWeek.includes(index)}
                              onChange={(e) => {
                                const newDays = e.target.checked
                                  ? [...recurringSettings.daysOfWeek, index]
                                  : recurringSettings.daysOfWeek.filter(d => d !== index)
                                handleRecurringChange('daysOfWeek', newDays)
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              disabled={mode === 'view'}
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{day}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Recurrence
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="endType"
                          value="never"
                          checked={recurringSettings.endType === 'never'}
                          onChange={(e) => handleRecurringChange('endType', e.target.value)}
                          className="text-blue-600 focus:ring-blue-500"
                          disabled={mode === 'view'}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Never</span>
                      </label>

                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="endType"
                          value="after"
                          checked={recurringSettings.endType === 'after'}
                          onChange={(e) => handleRecurringChange('endType', e.target.value)}
                          className="text-blue-600 focus:ring-blue-500"
                          disabled={mode === 'view'}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">After</span>
                        <input
                          type="number"
                          min="1"
                          value={recurringSettings.endCount}
                          onChange={(e) => handleRecurringChange('endCount', parseInt(e.target.value))}
                          className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                          disabled={mode === 'view' || recurringSettings.endType !== 'after'}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">occurrences</span>
                      </label>

                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="endType"
                          value="on"
                          checked={recurringSettings.endType === 'on'}
                          onChange={(e) => handleRecurringChange('endType', e.target.value)}
                          className="text-blue-600 focus:ring-blue-500"
                          disabled={mode === 'view'}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">On</span>
                        <input
                          type="date"
                          value={recurringSettings.endDate}
                          onChange={(e) => handleRecurringChange('endDate', e.target.value)}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                          disabled={mode === 'view' || recurringSettings.endType !== 'on'}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reminders Tab */}
          {activeTab === 'reminders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Reminders</h3>
                {mode !== 'view' && (
                  <button
                    onClick={addReminder}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Reminder</span>
                  </button>
                )}
              </div>

              {formData.reminders.length > 0 ? (
                <div className="space-y-3">
                  {formData.reminders.map((reminder, index) => (
                    <div key={reminder.id || index} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Type
                          </label>
                          <select
                            value={reminder.type}
                            onChange={(e) => updateReminder(index, 'type', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            disabled={mode === 'view'}
                          >
                            {reminderTypes.map(type => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Minutes Before
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={reminder.timing}
                            onChange={(e) => updateReminder(index, 'timing', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            disabled={mode === 'view'}
                          />
                        </div>

                        <div className="flex items-end">
                          {mode !== 'view' && (
                            <button
                              onClick={() => removeReminder(index)}
                              className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center space-x-2"
                            >
                              <Minus className="w-4 h-4" />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No reminders configured</p>
                </div>
              )}
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && mode === 'create' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Event Templates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {defaultTemplates.map(template => (
                  <div key={template.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-500 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{template.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{template.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>Duration: {template.duration} min</span>
                          <span>Priority: {template.priority}</span>
                        </div>
                      </div>
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: template.color }}
                      />
                    </div>
                    <button
                      onClick={() => handleCreateFromTemplate(template.id)}
                      className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Use Template</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EnhancedEventModal