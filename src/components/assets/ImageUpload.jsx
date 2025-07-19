import { useState, useRef } from 'react'
import { Upload, X, Camera, Image as ImageIcon, Plus, Trash2, Edit } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

const ImageUpload = ({ 
  images = [], 
  onImagesChange, 
  maxImages = 10, 
  maxFileSize = 5 * 1024 * 1024, // 5MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  className = ''
}) => {
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const fileInputRef = useRef(null)

  const onDrop = (acceptedFiles) => {
    const newImages = acceptedFiles.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          resolve({
            id: Date.now() + Math.random(),
            file,
            preview: e.target.result,
            name: file.name,
            size: file.size,
            type: file.type
          })
        }
        reader.readAsDataURL(file)
      })
    })

    Promise.all(newImages).then((imageData) => {
      const updatedImages = [...images, ...imageData].slice(0, maxImages)
      onImagesChange(updatedImages)
    })
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: maxFileSize,
    multiple: true,
    maxFiles: maxImages - images.length
  })

  const removeImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index)
    onImagesChange(updatedImages)
  }

  const reorderImages = (fromIndex, toIndex) => {
    const updatedImages = [...images]
    const [removed] = updatedImages.splice(fromIndex, 1)
    updatedImages.splice(toIndex, 0, removed)
    onImagesChange(updatedImages)
  }

  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, dropIndex) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      reorderImages(draggedIndex, dropIndex)
    }
    setDraggedIndex(null)
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const isImageType = (type) => {
    return type && type.startsWith('image/')
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id || index}
              className={`relative group bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden aspect-square cursor-move ${
                draggedIndex === index ? 'opacity-50' : ''
              }`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              {/* Image Preview */}
              <img
                src={image.preview || image}
                alt={image.name || `Image ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
              
              {/* Fallback for broken images */}
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-600 hidden">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>

              {/* Image overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                  <button
                    onClick={() => setPreviewImage(image)}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                    title="Preview"
                  >
                    <Camera className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => removeImage(index)}
                    className="p-2 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Image info */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-xs">
                <p className="truncate">{image.name || `Image ${index + 1}`}</p>
                {image.size && (
                  <p className="text-gray-300">{formatFileSize(image.size)}</p>
                )}
              </div>

              {/* Primary image indicator */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                  Primary
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
        >
          <input {...getInputProps()} ref={fileInputRef} />
          
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {isDragActive ? 'Drop images here' : 'Upload images'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Drag and drop images or click to browse
              </p>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <p>Maximum {maxImages - images.length} more images</p>
              <p>Supported formats: JPEG, PNG, WebP</p>
              <p>Max size: {formatFileSize(maxFileSize)} per image</p>
            </div>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Choose Files
            </button>
          </div>
        </div>
      )}

      {/* Upload Instructions */}
      {images.length === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            The first image will be used as the primary image for the asset
          </p>
        </div>
      )}

      {/* Reorder Instructions */}
      {images.length > 1 && (
        <div className="text-center py-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Drag and drop images to reorder them
          </p>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={previewImage.preview || previewImage}
              alt={previewImage.name || 'Preview'}
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded">
              <p className="font-medium">{previewImage.name || 'Image'}</p>
              {previewImage.size && (
                <p className="text-sm text-gray-300">
                  {formatFileSize(previewImage.size)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageUpload