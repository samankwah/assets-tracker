import React, { useState, useCallback, useRef, useEffect } from 'react'
import {
  Upload,
  X,
  Image as ImageIcon,
  File,
  Trash2,
  Download,
  Eye,
  Edit3,
  Grid,
  List,
  Filter,
  Search,
  Plus,
  FolderOpen,
  BarChart3,
  Settings,
  ChevronDown,
  Check,
  AlertCircle,
  Loader
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import imageUploadService from '../../services/imageUploadService'

const ImageUploadManager = ({ assetId, assetName, onImagesChange }) => {
  const [images, setImages] = useState([])
  const [selectedImages, setSelectedImages] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [filterCategory, setFilterCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [analytics, setAnalytics] = useState(null)

  const fileInputRef = useRef(null)
  const dropZoneRef = useRef(null)

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'general', label: 'General' },
    { value: 'exterior', label: 'Exterior' },
    { value: 'interior', label: 'Interior' },
    { value: 'inspection', label: 'Inspection' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'damage', label: 'Damage' },
    { value: 'before_after', label: 'Before/After' },
    { value: 'documentation', label: 'Documentation' }
  ]

  useEffect(() => {
    loadImages()
    loadAnalytics()
  }, [assetId, filterCategory, searchQuery])

  const loadImages = async () => {
    try {
      const result = await imageUploadService.getAssetImages(assetId, {
        category: filterCategory === 'all' ? null : filterCategory
      })
      
      let filteredImages = result.images
      
      if (searchQuery) {
        const searchResult = await imageUploadService.searchImages(searchQuery, {
          assetId,
          category: filterCategory === 'all' ? null : filterCategory
        })
        filteredImages = searchResult.images
      }
      
      setImages(filteredImages)
      onImagesChange?.(filteredImages)
    } catch (error) {
      console.error('Failed to load images:', error)
      toast.error('Failed to load images')
    }
  }

  const loadAnalytics = async () => {
    try {
      const result = await imageUploadService.getImageAnalytics(assetId)
      setAnalytics(result)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    }
  }

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    if (!dropZoneRef.current?.contains(e.relatedTarget)) {
      setIsDragging(false)
    }
  }, [])

  const handleDrop = useCallback(async (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    )
    
    if (files.length > 0) {
      await handleFileUpload(files)
    }
  }, [assetId])

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }

  const handleFileUpload = async (files) => {
    setUploading(true)
    
    try {
      const result = await imageUploadService.uploadMultipleImages(files, {
        assetId,
        category: 'general'
      })
      
      // Store uploaded images
      result.success.forEach(imageData => {
        imageUploadService.addToStorage(imageData)
      })
      
      if (result.success.length > 0) {
        toast.success(`Successfully uploaded ${result.success.length} image(s)`)
        loadImages()
        loadAnalytics()
      }
      
      if (result.errors.length > 0) {
        toast.error(`Failed to upload ${result.errors.length} image(s)`)
        result.errors.forEach(error => {
          console.error(`${error.filename}: ${error.error}`)
        })
      }
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error('Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteImage = async (imageId) => {
    try {
      await imageUploadService.deleteImage(imageId)
      imageUploadService.removeFromStorage(imageId)
      
      setImages(prev => prev.filter(img => img.id !== imageId))
      setSelectedImages(prev => prev.filter(id => id !== imageId))
      
      toast.success('Image deleted successfully')
      loadAnalytics()
    } catch (error) {
      console.error('Delete failed:', error)
      toast.error('Failed to delete image')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedImages.length === 0) return
    
    try {
      const result = await imageUploadService.bulkDelete(selectedImages)
      
      if (result.success > 0) {
        toast.success(`Deleted ${result.success} image(s)`)
        setSelectedImages([])
        loadImages()
        loadAnalytics()
      }
      
      if (result.failed > 0) {
        toast.error(`Failed to delete ${result.failed} image(s)`)
      }
    } catch (error) {
      console.error('Bulk delete failed:', error)
      toast.error('Bulk delete failed')
    }
  }

  const handleBulkUpdateCategory = async (newCategory) => {
    if (selectedImages.length === 0) return
    
    try {
      const result = await imageUploadService.bulkUpdateCategory(selectedImages, newCategory)
      
      if (result.success > 0) {
        toast.success(`Updated category for ${result.success} image(s)`)
        setSelectedImages([])
        loadImages()
      }
      
      if (result.failed > 0) {
        toast.error(`Failed to update ${result.failed} image(s)`)
      }
    } catch (error) {
      console.error('Bulk update failed:', error)
      toast.error('Bulk update failed')
    }
  }

  const handleImageSelect = (imageId) => {
    setSelectedImages(prev => {
      if (prev.includes(imageId)) {
        return prev.filter(id => id !== imageId)
      } else {
        return [...prev, imageId]
      }
    })
  }

  const handleSelectAll = () => {
    if (selectedImages.length === images.length) {
      setSelectedImages([])
    } else {
      setSelectedImages(images.map(img => img.id))
    }
  }

  const ImageCard = ({ image, isSelected, onSelect, onView, onDelete }) => (
    <div className={`relative group border-2 rounded-lg overflow-hidden transition-all ${
      isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'
    }`}>
      {/* Selection checkbox */}
      <div className="absolute top-2 left-2 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(image.id)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      </div>

      {/* Image */}
      <div className="aspect-square bg-gray-100 dark:bg-gray-800">
        <img
          src={image.thumbnailUrl || image.url}
          alt={image.filename}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => onView(image)}
        />
      </div>

      {/* Overlay actions */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
        <div className="flex space-x-2">
          <button
            onClick={() => onView(image)}
            className="p-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(image.id)}
            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Image info */}
      <div className="p-3">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {image.filename}
        </h4>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {(image.size / 1024).toFixed(1)} KB
          </span>
          <span className={`px-2 py-1 text-xs rounded ${
            image.category === 'inspection' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
            image.category === 'maintenance' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
            image.category === 'damage' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
          }`}>
            {image.category}
          </span>
        </div>
      </div>
    </div>
  )

  const ImageListItem = ({ image, isSelected, onSelect, onView, onDelete }) => (
    <div className={`flex items-center p-4 border rounded-lg transition-all ${
      isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'
    }`}>
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onSelect(image.id)}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-4"
      />
      
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden mr-4">
        <img
          src={image.thumbnailUrl || image.url}
          alt={image.filename}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="flex-1">
        <h4 className="font-medium text-gray-900 dark:text-white">
          {image.filename}
        </h4>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {(image.size / 1024).toFixed(1)} KB • {image.type} • {image.category}
        </div>
        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Uploaded {new Date(image.uploadedAt).toLocaleDateString()}
        </div>
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={() => onView(image)}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(image.id)}
          className="p-2 text-red-400 hover:text-red-600"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Image Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {assetName ? `Managing images for ${assetName}` : 'Manage asset images'}
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center space-x-2"
          >
            {uploading ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>{uploading ? 'Uploading...' : 'Upload Images'}</span>
          </button>
        </div>
      </div>

      {/* Analytics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Images</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.total}</p>
              </div>
              <ImageIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Size</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalSizeMB} MB</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Categories</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{Object.keys(analytics.categories).length}</p>
              </div>
              <FolderOpen className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Average Size</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round(analytics.averageSize / 1024)} KB
                </p>
              </div>
              <File className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Category filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-4">
          {/* Bulk actions */}
          {selectedImages.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedImages.length} selected
              </span>
              <div className="relative">
                <button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center space-x-1"
                >
                  <span>Actions</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {showBulkActions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                    <button
                      onClick={handleBulkDelete}
                      className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-t-lg flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Selected</span>
                    </button>
                    
                    {categories.slice(1).map(cat => (
                      <button
                        key={cat.value}
                        onClick={() => {
                          handleBulkUpdateCategory(cat.value)
                          setShowBulkActions(false)
                        }}
                        className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
                      >
                        <FolderOpen className="w-4 h-4" />
                        <span>Move to {cat.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Select all */}
          <button
            onClick={handleSelectAll}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>{selectedImages.length === images.length ? 'Deselect All' : 'Select All'}</span>
          </button>

          {/* View mode */}
          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Drop zone */}
      <div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600'
        }`}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {isDragging ? 'Drop images here' : 'Upload Images'}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Drag and drop images here, or click to browse
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Browse Files
        </button>
      </div>

      {/* Images Grid/List */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        {images.length > 0 ? (
          <div className="p-6">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {images.map(image => (
                  <ImageCard
                    key={image.id}
                    image={image}
                    isSelected={selectedImages.includes(image.id)}
                    onSelect={handleImageSelect}
                    onView={(img) => {
                      setSelectedImage(img)
                      setShowImageModal(true)
                    }}
                    onDelete={handleDeleteImage}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {images.map(image => (
                  <ImageListItem
                    key={image.id}
                    image={image}
                    isSelected={selectedImages.includes(image.id)}
                    onSelect={handleImageSelect}
                    onView={(img) => {
                      setSelectedImage(img)
                      setShowImageModal(true)
                    }}
                    onDelete={handleDeleteImage}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No images found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchQuery || filterCategory !== 'all' 
                ? 'Try adjusting your filters or search terms'
                : 'Upload some images to get started'
              }
            </p>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Image modal */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedImage.filename}
              </h2>
              <button
                onClick={() => setShowImageModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <img
                src={selectedImage.url}
                alt={selectedImage.filename}
                className="w-full max-h-96 object-contain rounded-lg mb-4"
              />
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">File size:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    {(selectedImage.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Dimensions:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    {selectedImage.metadata?.dimensions?.width} × {selectedImage.metadata?.dimensions?.height}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Type:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    {selectedImage.type}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Category:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    {selectedImage.category}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Uploaded:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    {new Date(selectedImage.uploadedAt).toLocaleString()}
                  </span>
                </div>
                {selectedImage.description && (
                  <div className="col-span-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Description:</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                      {selectedImage.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageUploadManager