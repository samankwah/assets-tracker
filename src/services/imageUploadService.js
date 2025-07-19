import { toast } from 'react-hot-toast'

/**
 * Service for handling image uploads and management
 */
class ImageUploadService {
  constructor() {
    this.maxFileSize = 10 * 1024 * 1024 // 10MB
    this.allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    this.compressionQuality = 0.8
    this.maxDimensions = { width: 1920, height: 1080 }
  }

  /**
   * Validate image file
   */
  validateFile(file) {
    const errors = []

    if (!file) {
      errors.push('No file provided')
      return { valid: false, errors }
    }

    // Check file type
    if (!this.allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed. Allowed types: ${this.allowedTypes.join(', ')}`)
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      errors.push(`File size ${Math.round(file.size / 1024 / 1024)}MB exceeds maximum ${Math.round(this.maxFileSize / 1024 / 1024)}MB`)
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Compress image if needed
   */
  async compressImage(file, options = {}) {
    const {
      quality = this.compressionQuality,
      maxWidth = this.maxDimensions.width,
      maxHeight = this.maxDimensions.height
    } = options

    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }

        // Set canvas dimensions
        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            }))
          },
          file.type,
          quality
        )
      }

      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Generate thumbnail
   */
  async generateThumbnail(file, size = 200) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Square thumbnail
        canvas.width = size
        canvas.height = size

        // Calculate crop dimensions for square aspect ratio
        const minDimension = Math.min(img.width, img.height)
        const startX = (img.width - minDimension) / 2
        const startY = (img.height - minDimension) / 2

        ctx.drawImage(
          img,
          startX, startY, minDimension, minDimension,
          0, 0, size, size
        )

        canvas.toBlob((blob) => {
          resolve(blob)
        }, 'image/jpeg', 0.7)
      }

      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Extract EXIF data
   */
  async extractMetadata(file) {
    return new Promise((resolve) => {
      const img = new Image()
      
      img.onload = () => {
        const metadata = {
          filename: file.name,
          size: file.size,
          type: file.type,
          dimensions: {
            width: img.naturalWidth,
            height: img.naturalHeight
          },
          aspectRatio: img.naturalWidth / img.naturalHeight,
          lastModified: new Date(file.lastModified).toISOString(),
          uploadedAt: new Date().toISOString()
        }

        resolve(metadata)
      }

      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Upload single image
   */
  async uploadImage(file, options = {}) {
    const {
      assetId = null,
      category = 'general',
      description = '',
      compress = true,
      generateThumbnail = true
    } = options

    // Validate file
    const validation = this.validateFile(file)
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '))
    }

    try {
      // Extract metadata
      const metadata = await this.extractMetadata(file)

      // Compress if needed
      let processedFile = file
      if (compress && file.size > 1024 * 1024) { // Only compress files > 1MB
        processedFile = await this.compressImage(file)
      }

      // Generate thumbnail
      let thumbnailBlob = null
      if (generateThumbnail) {
        thumbnailBlob = await this.generateThumbnail(processedFile)
      }

      // In a real app, you would upload to a cloud service
      // For this demo, we'll create data URLs
      const imageUrl = await this.fileToDataUrl(processedFile)
      const thumbnailUrl = thumbnailBlob ? await this.blobToDataUrl(thumbnailBlob) : null

      const uploadResult = {
        id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        url: imageUrl,
        thumbnailUrl,
        filename: file.name,
        originalFilename: file.name,
        size: processedFile.size,
        originalSize: file.size,
        type: file.type,
        assetId,
        category,
        description,
        metadata,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'current_user', // In real app, get from auth
        status: 'active'
      }

      return uploadResult
    } catch (error) {
      console.error('Upload failed:', error)
      throw new Error(`Upload failed: ${error.message}`)
    }
  }

  /**
   * Upload multiple images
   */
  async uploadMultipleImages(files, options = {}) {
    const results = []
    const errors = []

    for (const file of files) {
      try {
        const result = await this.uploadImage(file, options)
        results.push(result)
      } catch (error) {
        errors.push({
          filename: file.name,
          error: error.message
        })
      }
    }

    return {
      success: results,
      errors,
      total: files.length,
      uploaded: results.length,
      failed: errors.length
    }
  }

  /**
   * Delete image
   */
  async deleteImage(imageId) {
    try {
      // In a real app, you would make an API call to delete from cloud storage
      console.log(`Deleting image: ${imageId}`)
      
      return {
        success: true,
        imageId
      }
    } catch (error) {
      throw new Error(`Failed to delete image: ${error.message}`)
    }
  }

  /**
   * Update image metadata
   */
  async updateImageMetadata(imageId, updates) {
    try {
      // In a real app, you would make an API call
      console.log(`Updating image metadata: ${imageId}`, updates)
      
      return {
        success: true,
        imageId,
        updates
      }
    } catch (error) {
      throw new Error(`Failed to update image: ${error.message}`)
    }
  }

  /**
   * Get images for asset
   */
  async getAssetImages(assetId, options = {}) {
    const {
      category = null,
      limit = 50,
      offset = 0,
      sortBy = 'uploadedAt',
      sortOrder = 'desc'
    } = options

    try {
      // In a real app, you would make an API call
      // For demo, return mock data from localStorage
      const allImages = this.getStoredImages()
      
      let filteredImages = allImages.filter(img => img.assetId === assetId)
      
      if (category) {
        filteredImages = filteredImages.filter(img => img.category === category)
      }

      // Sort
      filteredImages.sort((a, b) => {
        const aVal = a[sortBy]
        const bVal = b[sortBy]
        
        if (sortOrder === 'desc') {
          return bVal > aVal ? 1 : -1
        } else {
          return aVal > bVal ? 1 : -1
        }
      })

      // Paginate
      const paginatedImages = filteredImages.slice(offset, offset + limit)

      return {
        images: paginatedImages,
        total: filteredImages.length,
        limit,
        offset,
        hasMore: offset + limit < filteredImages.length
      }
    } catch (error) {
      throw new Error(`Failed to get images: ${error.message}`)
    }
  }

  /**
   * Search images
   */
  async searchImages(query, options = {}) {
    const {
      assetId = null,
      category = null,
      limit = 50
    } = options

    try {
      const allImages = this.getStoredImages()
      
      let results = allImages.filter(img => {
        const matchesQuery = !query || 
          img.filename.toLowerCase().includes(query.toLowerCase()) ||
          img.description.toLowerCase().includes(query.toLowerCase())
        
        const matchesAsset = !assetId || img.assetId === assetId
        const matchesCategory = !category || img.category === category
        
        return matchesQuery && matchesAsset && matchesCategory
      })

      return {
        images: results.slice(0, limit),
        total: results.length,
        query
      }
    } catch (error) {
      throw new Error(`Search failed: ${error.message}`)
    }
  }

  /**
   * Get image analytics
   */
  async getImageAnalytics(assetId = null) {
    try {
      const allImages = this.getStoredImages()
      const images = assetId ? allImages.filter(img => img.assetId === assetId) : allImages

      const totalSize = images.reduce((sum, img) => sum + img.size, 0)
      const categories = images.reduce((acc, img) => {
        acc[img.category] = (acc[img.category] || 0) + 1
        return acc
      }, {})

      const fileTypes = images.reduce((acc, img) => {
        acc[img.type] = (acc[img.type] || 0) + 1
        return acc
      }, {})

      return {
        total: images.length,
        totalSize,
        totalSizeMB: Math.round(totalSize / 1024 / 1024 * 100) / 100,
        categories,
        fileTypes,
        averageSize: images.length > 0 ? Math.round(totalSize / images.length) : 0,
        oldest: images.length > 0 ? Math.min(...images.map(img => new Date(img.uploadedAt).getTime())) : null,
        newest: images.length > 0 ? Math.max(...images.map(img => new Date(img.uploadedAt).getTime())) : null
      }
    } catch (error) {
      throw new Error(`Failed to get analytics: ${error.message}`)
    }
  }

  /**
   * Helper: Convert file to data URL
   */
  fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  /**
   * Helper: Convert blob to data URL
   */
  blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  /**
   * Helper: Get stored images from localStorage
   */
  getStoredImages() {
    try {
      const stored = localStorage.getItem('assetTracker_images')
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to get stored images:', error)
      return []
    }
  }

  /**
   * Helper: Store images to localStorage
   */
  storeImages(images) {
    try {
      localStorage.setItem('assetTracker_images', JSON.stringify(images))
    } catch (error) {
      console.error('Failed to store images:', error)
    }
  }

  /**
   * Add uploaded image to storage
   */
  addToStorage(imageData) {
    const images = this.getStoredImages()
    images.push(imageData)
    this.storeImages(images)
  }

  /**
   * Remove image from storage
   */
  removeFromStorage(imageId) {
    const images = this.getStoredImages()
    const filtered = images.filter(img => img.id !== imageId)
    this.storeImages(filtered)
  }

  /**
   * Update image in storage
   */
  updateInStorage(imageId, updates) {
    const images = this.getStoredImages()
    const index = images.findIndex(img => img.id === imageId)
    
    if (index !== -1) {
      images[index] = { ...images[index], ...updates, updatedAt: new Date().toISOString() }
      this.storeImages(images)
      return images[index]
    }
    
    return null
  }

  /**
   * Bulk operations
   */
  async bulkDelete(imageIds) {
    const results = []
    const errors = []

    for (const imageId of imageIds) {
      try {
        await this.deleteImage(imageId)
        this.removeFromStorage(imageId)
        results.push(imageId)
      } catch (error) {
        errors.push({ imageId, error: error.message })
      }
    }

    return {
      deleted: results,
      errors,
      total: imageIds.length,
      success: results.length,
      failed: errors.length
    }
  }

  /**
   * Bulk update category
   */
  async bulkUpdateCategory(imageIds, category) {
    const results = []
    const errors = []

    for (const imageId of imageIds) {
      try {
        const updated = this.updateInStorage(imageId, { category })
        if (updated) {
          results.push(updated)
        } else {
          errors.push({ imageId, error: 'Image not found' })
        }
      } catch (error) {
        errors.push({ imageId, error: error.message })
      }
    }

    return {
      updated: results,
      errors,
      total: imageIds.length,
      success: results.length,
      failed: errors.length
    }
  }
}

export default new ImageUploadService()