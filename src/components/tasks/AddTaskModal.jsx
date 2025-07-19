import { useState } from 'react'
import { useTaskStore } from '../../stores/taskStore'
import { useAssetStore } from '../../stores/assetStore'
import { X, Calendar, Clock, AlertCircle, User, Building, FileText, CheckCircle } from 'lucide-react'
import TaskTemplateModal from './TaskTemplateModal'
import toast from 'react-hot-toast'

const AddTaskModal = ({ isOpen, onClose }) => {
  const { createTask } = useTaskStore()
  const { assets } = useAssetStore()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assetId: '',
    type: 'Inspection',
    priority: 'Medium',
    dueDate: '',
    time: '09:00',
    assignedTo: '',
    frequency: 'One-time',
    notifications: {
      email: true,
      sms: false,
      inApp: true
    },
    notificationSettings: {
      type: 'Email',
      reminderTime: '1 day before'
    }
  })

  const [previewAsset, setPreviewAsset] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [checklist, setChecklist] = useState([])
  const [notes, setNotes] = useState('')

  const taskTypes = [
    'Inspection',
    'Maintenance',
    'Safety Check',
    'Cleaning',
    'Planning',
    'Repair',
    'Renovation',
    'General'
  ]

  const priorities = [
    { value: 'Low', color: 'text-green-600', bg: 'bg-green-100' },
    { value: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { value: 'High', color: 'text-red-600', bg: 'bg-red-100' }
  ]

  const frequencies = [
    'One-time',
    'Daily',
    'Weekly',
    'Monthly',
    'Quarterly',
    'Annually'
  ]

  const reminderTimes = [
    '1 hour before',
    '2 hours before',
    '1 day before',
    '2 days before',
    '3 days before',
    '1 week before'
  ]

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }

    // Update preview asset when asset selection changes
    if (name === 'assetId' && value) {
      const selectedAsset = assets.find(asset => asset.id.toString() === value)
      setPreviewAsset(selectedAsset)
    }
  }

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template)
    setFormData(prev => ({
      ...prev,
      title: template.name,
      description: template.description,
      type: template.type,
      priority: template.priority,
      frequency: template.frequency
    }))
    setChecklist(template.checklist || [])
    setNotes(template.notes || '')
    setShowTemplateModal(false)
  }

  const handleChecklistToggle = (index) => {
    setChecklist(prev => prev.map((item, i) => 
      i === index ? { ...item, completed: !item.completed } : item
    ))
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      assetId: '',
      type: 'Inspection',
      priority: 'Medium',
      dueDate: '',
      time: '09:00',
      assignedTo: '',
      frequency: 'One-time',
      notifications: {
        email: true,
        sms: false,
        inApp: true
      },
      notificationSettings: {
        type: 'Email',
        reminderTime: '1 day before'
      }
    })
    setPreviewAsset(null)
    setSelectedTemplate(null)
    setChecklist([])
    setNotes('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Combine date and time
      const dueDateTime = new Date(`${formData.dueDate}T${formData.time}:00`)
      
      const taskData = {
        ...formData,
        assetId: parseInt(formData.assetId),
        assetName: previewAsset?.name || '',
        dueDate: dueDateTime.toISOString(),
        templateId: selectedTemplate?.id || null,
        checklist: checklist.map((item, index) => ({
          id: index + 1,
          text: typeof item === 'string' ? item : item.text,
          completed: typeof item === 'object' ? item.completed : false
        })),
        notes: notes,
        requiredTools: selectedTemplate?.requiredTools || []
      }

      createTask(taskData)
      toast.success('Task created successfully!')
      onClose()
      resetForm()
    } catch (error) {
      toast.error('Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Add Task
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Form */}
            <div className="space-y-6">
              {/* Task Template Button */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(true)}
                  className="btn-secondary flex items-center w-full justify-center"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {selectedTemplate ? `Using: ${selectedTemplate.name}` : 'Use Task Template'}
                </button>
                {selectedTemplate && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Template applied: {selectedTemplate.description}
                  </p>
                )}
              </div>

              {/* Task Title */}
              <div>
                <label className="form-label">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Roof Inspection for Block C"
                  className="form-input"
                  required
                />
              </div>

              {/* Select Asset */}
              <div>
                <label className="form-label">Select Asset</label>
                <select
                  name="assetId"
                  value={formData.assetId}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="">Choose an asset...</option>
                  {assets.map(asset => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} - {asset.address.city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Task Type & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Task Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="form-input"
                  >
                    {taskTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Priority Level</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="form-input"
                  >
                    {priorities.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Due Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Time</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              {/* Assigned To & Frequency */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Assigned To</label>
                  <input
                    type="text"
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    placeholder="Agent X"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Frequency</label>
                  <select
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleChange}
                    className="form-input"
                  >
                    {frequencies.map(freq => (
                      <option key={freq} value={freq}>{freq}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the task details..."
                  rows="4"
                  className="form-input"
                />
              </div>

              {/* Notification Settings */}
              <div>
                <label className="form-label">Add Notification</label>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      name="notificationSettings.type"
                      value={formData.notificationSettings.type}
                      onChange={handleChange}
                      className="form-input"
                    >
                      <option value="Email">Email</option>
                      <option value="SMS">SMS</option>
                      <option value="In-App">In-App</option>
                    </select>
                    <select
                      name="notificationSettings.reminderTime"
                      value={formData.notificationSettings.reminderTime}
                      onChange={handleChange}
                      className="form-input"
                    >
                      {reminderTimes.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="notifications.email"
                        checked={formData.notifications.email}
                        onChange={handleChange}
                        className="w-4 h-4 text-secondary-600 border-gray-300 rounded focus:ring-secondary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Email notifications</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="notifications.sms"
                        checked={formData.notifications.sms}
                        onChange={handleChange}
                        className="w-4 h-4 text-secondary-600 border-gray-300 rounded focus:ring-secondary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">SMS notifications</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="notifications.inApp"
                        checked={formData.notifications.inApp}
                        onChange={handleChange}
                        className="w-4 h-4 text-secondary-600 border-gray-300 rounded focus:ring-secondary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">In-app notifications</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Preview */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Preview Task
                </h3>
                <div className="card">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formData.title || 'Task Title'}
                      </h4>
                      <span className={`badge ${
                        formData.priority === 'High' ? 'badge-error' : 
                        formData.priority === 'Medium' ? 'badge-warning' : 'badge-success'
                      }`}>
                        {formData.priority}
                      </span>
                    </div>

                    {previewAsset && (
                      <div className="flex items-center mb-3">
                        <Building className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {previewAsset.name}
                        </span>
                      </div>
                    )}

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-900 dark:text-white">
                          {formData.dueDate ? new Date(formData.dueDate).toLocaleDateString() : 'No date set'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-900 dark:text-white">
                          {formData.time || '09:00 AM'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-900 dark:text-white">
                          {formData.assignedTo || 'Unassigned'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Type:</span>
                        <span className="badge badge-info">{formData.type}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm mt-2">
                        <span className="text-gray-500 dark:text-gray-400">Frequency:</span>
                        <span className="text-gray-900 dark:text-white">{formData.frequency}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm mt-2">
                        <span className="text-gray-500 dark:text-gray-400">Notification:</span>
                        <span className="text-gray-900 dark:text-white">{formData.notificationSettings.type}</span>
                      </div>
                    </div>

                    {formData.description && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formData.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? <div className="spinner mr-2"></div> : null}
              Create Task
            </button>
          </div>

          {/* Template Checklist Section */}
          {checklist.length > 0 && (
            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Task Checklist ({checklist.length} items)
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {checklist.map((item, index) => (
                  <div key={index} className="flex items-start">
                    <button
                      type="button"
                      onClick={() => handleChecklistToggle(index)}
                      className={`mt-0.5 mr-3 ${
                        (typeof item === 'object' ? item.completed : false)
                          ? 'text-green-600'
                          : 'text-gray-400'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <span className={`text-sm ${
                      (typeof item === 'object' ? item.completed : false)
                        ? 'line-through text-gray-500 dark:text-gray-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {typeof item === 'string' ? item : item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Template Notes Section */}
          {notes && (
            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Additional Notes
              </h3>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {notes}
                </p>
              </div>
            </div>
          )}
        </form>

        {/* Task Template Modal */}
        <TaskTemplateModal
          isOpen={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          onSelectTemplate={handleTemplateSelect}
        />
      </div>
    </div>
  )
}

export default AddTaskModal