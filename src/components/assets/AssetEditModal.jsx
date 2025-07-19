import { useState, useEffect } from 'react'
import { useAssetStore } from '../../stores/assetStore'
import { X, Upload, MapPin, Home, Calendar, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const AssetEditModal = ({ isOpen, onClose, asset }) => {
  const { updateAsset } = useAssetStore()
  const [formData, setFormData] = useState({
    name: '',
    type: 'Apartment',
    status: 'Under Maintenance',
    condition: 'Good',
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

  const [images, setImages] = useState([])
  const [newFeature, setNewFeature] = useState('')
  const [loading, setLoading] = useState(false)

  // Initialize form with asset data
  useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name || '',
        type: asset.type || 'Apartment',
        status: asset.status || 'Under Maintenance',
        condition: asset.condition || 'Good',
        address: {
          street: asset.address?.street || '',
          city: asset.address?.city || '',
          state: asset.address?.state || '',
          zipCode: asset.address?.zipCode || ''
        },
        details: {
          bedrooms: asset.details?.bedrooms || '',
          bathrooms: asset.details?.bathrooms || '',
          floors: asset.details?.floors || '',
          balcony: asset.details?.balcony || false,
          features: asset.details?.features || []
        },
        inspectionDate: asset.nextInspection ? asset.nextInspection.split('T')[0] : '',
        priority: asset.priority || 'Low',
        frequency: asset.frequency || 'Monthly'
      })
      setImages(asset.images || [])
    }
  }, [asset])

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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const addFeature = () => {
    if (newFeature.trim() && !formData.details.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        details: {
          ...prev.details,
          features: [...prev.details.features, newFeature.trim()]
        }
      }))
      setNewFeature('')
    }
  }

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      details: {
        ...prev.details,
        features: prev.details.features.filter((_, i) => i !== index)
      }
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const updatedAsset = {
        ...asset,
        ...formData,
        images,
        nextInspection: formData.inspectionDate,
        updatedAt: new Date().toISOString()
      }

      updateAsset(asset.id, updatedAsset)
      toast.success('Asset updated successfully!')
      onClose()
    } catch (error) {
      toast.error('Failed to update asset')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !asset) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Edit Asset
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
              {/* Images */}
              <div>
                <label className="form-label">Asset Images</label>
                <div className="space-y-4">
                  {/* Current Images */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Asset ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Upload New Images */}
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Click to upload additional images
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="btn-secondary cursor-pointer"
                    >
                      Choose Files
                    </label>
                  </div>
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
                  <input
                    type="text"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleChange}
                    placeholder="ZIP Code"
                    className="form-input"
                  />
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

              {/* Features */}
              <div>
                <label className="form-label">Features</label>
                <div className="space-y-3">
                  {/* Existing Features */}
                  {formData.details.features.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.details.features.map((feature, index) => (
                        <span key={index} className="badge badge-info flex items-center">
                          {feature}
                          <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Add New Feature */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      placeholder="Add a feature"
                      className="form-input flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    />
                    <button
                      type="button"
                      onClick={addFeature}
                      className="btn-secondary"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
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
                    <label className="text-xs text-gray-500 dark:text-gray-400">Next Inspection</label>
                    <input
                      type="date"
                      name="inspectionDate"
                      value={formData.inspectionDate}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Priority</label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="form-input"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Frequency</label>
                    <select
                      name="frequency"
                      value={formData.frequency}
                      onChange={handleChange}
                      className="form-input"
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Annual">Annual</option>
                    </select>
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
                      src={images[0] || '/api/placeholder/400/300'}
                      alt="Asset Preview"
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    {images.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                        +{images.length - 1} more
                      </div>
                    )}
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
                        <span className="w-4 h-4 mr-1">{formData.type}</span>
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
              Update Asset
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AssetEditModal