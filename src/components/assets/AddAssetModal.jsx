import { useState } from 'react'
import { useAssetStore } from '../../stores/assetStore'
import { X, Upload, MapPin, Home, Calendar, Layers } from 'lucide-react'
import toast from 'react-hot-toast'
import { PHASES, PHASE_DESCRIPTIONS } from '../../types/phaseTypes'
import { PhaseBadge } from '../phases'
import ImageUpload from './ImageUpload'

const AddAssetModal = ({ isOpen, onClose }) => {
  const { createAsset } = useAssetStore()
  const [formData, setFormData] = useState({
    name: '',
    type: 'Apartment',
    status: 'Under Maintenance',
    condition: 'Newly Built',
    currentPhase: PHASES.PLANNING,
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    details: {
      bedrooms: '',
      bathrooms: '',
      floors: '',
      balcony: false,
      features: []
    },
    inspectionDate: '',
    priority: 'Low',
    frequency: 'Monthly',
    phaseNotes: '',
    images: []
  })

  const [loading, setLoading] = useState(false)

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
  }

  const handleImagesChange = (newImages) => {
    setFormData(prev => ({
      ...prev,
      images: newImages
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const assetData = {
        ...formData,
        images: formData.images.length > 0 ? formData.images.map(img => img.preview || img) : ['/api/placeholder/400/300'],
        inspectionStatus: 'Not Inspected',
        lastInspection: null,
        nextInspection: formData.inspectionDate
      }

      createAsset(assetData)
      toast.success('Asset created successfully!')
      onClose()
      resetForm()
    } catch (error) {
      toast.error('Failed to create asset')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'Apartment',
      status: 'Under Maintenance',
      condition: 'Newly Built',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: ''
      },
      details: {
        bedrooms: '',
        bathrooms: '',
        floors: '',
        balcony: false,
        features: []
      },
      inspectionDate: '',
      priority: 'Low',
      frequency: 'Monthly'
    })
    setPreviewImage(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Add New Asset
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
              {/* Upload Images */}
              <div>
                <label className="form-label">Upload Image(s)</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="mx-auto h-32 w-32 object-cover rounded-lg mb-4"
                    />
                  ) : (
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="btn-secondary cursor-pointer"
                  >
                    Choose File
                  </label>
                </div>
              </div>

              {/* Asset Name */}
              <div>
                <label className="form-label">Asset Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Los Palmas"
                  className="form-input"
                  required
                />
              </div>

              {/* Asset Type & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Asset Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="Apartment">Apartment</option>
                    <option value="House">House</option>
                    <option value="Condo">Condo</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Asset Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Active">Active</option>
                    <option value="Decommissioned">Decommissioned</option>
                  </select>
                </div>
              </div>

              {/* Phase Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-gray-500" />
                  <label className="form-label mb-0">Initial Phase</label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.values(PHASES).map((phase) => (
                    <button
                      key={phase}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, currentPhase: phase }))}
                      className={`
                        p-3 border-2 rounded-lg text-left transition-all duration-200
                        ${formData.currentPhase === phase
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <PhaseBadge phase={phase} size="xs" />
                        {formData.currentPhase === phase && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {PHASE_DESCRIPTIONS[phase]}
                      </p>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="form-label">Phase Notes (Optional)</label>
                  <textarea
                    name="phaseNotes"
                    value={formData.phaseNotes}
                    onChange={handleChange}
                    placeholder="Add any notes about the initial phase..."
                    rows={3}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="form-label">Asset Address</label>
                <div className="space-y-3">
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    placeholder="Address Line"
                    className="form-input"
                    required
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      placeholder="City/Town"
                      className="form-input"
                      required
                    />
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleChange}
                      placeholder="State"
                      className="form-input"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Asset Details */}
              <div>
                <label className="form-label">Asset Details</label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Bedrooms</label>
                    <input
                      type="number"
                      name="details.bedrooms"
                      value={formData.details.bedrooms}
                      onChange={handleChange}
                      placeholder="4"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Bathrooms</label>
                    <input
                      type="number"
                      name="details.bathrooms"
                      value={formData.details.bathrooms}
                      onChange={handleChange}
                      placeholder="3"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Floors</label>
                    <input
                      type="number"
                      name="details.floors"
                      value={formData.details.floors}
                      onChange={handleChange}
                      placeholder="2"
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="details.balcony"
                      checked={formData.details.balcony}
                      onChange={handleChange}
                      className="w-4 h-4 text-secondary-600 border-gray-300 rounded focus:ring-secondary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Balcony</span>
                  </label>
                </div>
              </div>

              {/* Monitoring Readiness */}
              <div>
                <label className="form-label">Monitoring Readiness</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Condition</label>
                    <select
                      name="condition"
                      value={formData.condition}
                      onChange={handleChange}
                      className="form-input"
                    >
                      <option value="Newly Built">Newly Built</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Needs Repairs">Needs Repairs</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Inspection Date</label>
                    <input
                      type="date"
                      name="inspectionDate"
                      value={formData.inspectionDate}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Preview */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Preview
                </h3>
                <div className="card">
                  <div className="relative">
                    <img
                      src={previewImage || '/api/placeholder/400/300'}
                      alt="Asset Preview"
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {formData.name || 'Asset Name'}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {formData.address.street || 'Address'}, {formData.address.city || 'City'}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Home className="w-4 h-4 mr-1" />
                        {formData.details.bedrooms || 0} Beds
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <span className="w-4 h-4 mr-1">{formData.type || 'Apartment'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <span className="w-4 h-4 mr-1">{formData.details.floors || 0} Floors</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <span className="w-4 h-4 mr-1">{formData.details.balcony ? 'Balcony' : 'No Balcony'}</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Status:</span>
                        <span className={`badge ${
                          formData.status === 'Active' ? 'badge-success' : 
                          formData.status === 'Under Maintenance' ? 'badge-warning' : 
                          'badge-error'
                        }`}>
                          {formData.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Condition:</span>
                        <span className="badge badge-info">{formData.condition}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Inspection:</span>
                        <span className="text-gray-900 dark:text-white">
                          {formData.inspectionDate || 'Not Scheduled'}
                        </span>
                      </div>
                    </div>
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
              Save Asset
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddAssetModal