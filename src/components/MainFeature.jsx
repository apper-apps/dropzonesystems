import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from './ApperIcon'
import FolderTree from './FolderTree'
import { fileService } from '../services'
import { format } from 'date-fns'

const MainFeature = ({ files, onFilesUpdate }) => {
const [isDragging, setIsDragging] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState([])
  const [previewFile, setPreviewFile] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [selectedFolderId, setSelectedFolderId] = useState(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const fileInputRef = useRef(null)

  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'video/mp4', 'video/webm', 'audio/mp3', 'audio/wav'
  ]

  const maxFileSize = 10 * 1024 * 1024 // 10MB

  const handleDragOver = (e) => {
    e.preventDefault()
    if (!isDragging) setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files)
    handleFiles(selectedFiles)
  }

  const validateFile = (file) => {
    if (!allowedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported`
    }
    if (file.size > maxFileSize) {
      return `File size must be less than ${maxFileSize / (1024 * 1024)}MB`
    }
    return null
  }

  const handleFiles = async (fileList) => {
    const validFiles = []
    const errors = []

    fileList.forEach(file => {
      const error = validateFile(file)
      if (error) {
        errors.push(`${file.name}: ${error}`)
      } else {
        validFiles.push(file)
      }
    })

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error))
    }

    if (validFiles.length === 0) return

    // Start upload process
    const uploadPromises = validFiles.map(file => uploadFile(file))
    
    try {
      const uploadedFiles = await Promise.all(uploadPromises)
      const newFiles = [...files, ...uploadedFiles.filter(f => f !== null)]
      onFilesUpdate(newFiles)
      toast.success(`Successfully uploaded ${uploadedFiles.filter(f => f !== null).length} files`)
    } catch (error) {
      toast.error('Some files failed to upload')
    }
  }

  const uploadFile = async (file) => {
    const uploadId = Date.now() + Math.random()
    const uploadingFile = {
      id: uploadId,
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: 'uploading'
    }

    setUploadingFiles(prev => [...prev, uploadingFile])

    // Simulate upload progress
    const updateProgress = (progress) => {
      setUploadingFiles(prev => 
        prev.map(f => f.id === uploadId ? { ...f, progress } : f)
      )
    }

    try {
      // Simulate upload with progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        updateProgress(i)
      }

// Create file object for service
      const fileData = {
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'completed',
        progress: 100,
        folderId: selectedFolderId, // Associate with selected folder
        url: URL.createObjectURL(file) // In real app, this would be server URL
      }

      const savedFile = await fileService.create(fileData)
      
      // Remove from uploading list
      setUploadingFiles(prev => prev.filter(f => f.id !== uploadId))
      
      return savedFile
    } catch (error) {
      setUploadingFiles(prev => 
        prev.map(f => f.id === uploadId ? { ...f, status: 'failed' } : f)
      )
      toast.error(`Failed to upload ${file.name}`)
      return null
    }
  }

  const handleDeleteFile = async (fileId) => {
    try {
      await fileService.delete(fileId)
      const updatedFiles = files.filter(f => f.id !== fileId)
      onFilesUpdate(updatedFiles)
      toast.success('File deleted successfully')
    } catch (error) {
      toast.error('Failed to delete file')
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type) => {
    if (type?.startsWith('image/')) return 'Image'
    if (type?.startsWith('video/')) return 'Video'
    if (type?.startsWith('audio/')) return 'Music'
    if (type === 'application/pdf') return 'FileText'
    return 'File'
  }
const isImageFile = (type) => type?.startsWith('image/')

  // Filter files based on selected folder
  const filteredFiles = selectedFolderId === null 
    ? files
    : files?.filter(file => file.folderId === selectedFolderId) || []

  const handleFolderSelect = (folderId) => {
    setSelectedFolderId(folderId)
  }

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-80 flex-shrink-0"
          >
            <FolderTree 
              selectedFolderId={selectedFolderId}
              onFolderSelect={handleFolderSelect}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 min-w-0 space-y-8">
        {/* Sidebar Toggle */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 rounded-lg transition-colors"
          >
            <ApperIcon 
              name={showSidebar ? "PanelLeftClose" : "PanelLeftOpen"} 
              className="w-5 h-5 text-surface-600 dark:text-surface-300" 
            />
          </button>
          {selectedFolderId && (
            <div className="flex items-center space-x-2 text-sm text-surface-600 dark:text-surface-300">
              <ApperIcon name="Folder" className="w-4 h-4" />
              <span>Folder: {selectedFolderId}</span>
            </div>
          )}
        </div>
{/* Upload Zone */}
        <motion.div
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
          isDragging 
            ? 'border-primary bg-primary/5 scale-105' 
            : 'border-surface-300 dark:border-surface-600 hover:border-primary/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="space-y-4">
          <motion.div
            className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
              isDragging ? 'bg-primary text-white' : 'bg-surface-100 dark:bg-surface-700'
            }`}
            animate={{ rotate: isDragging ? 360 : 0 }}
            transition={{ duration: 0.5 }}
          >
            <ApperIcon 
              name={isDragging ? "Download" : "Upload"} 
              className="w-8 h-8" 
            />
          </motion.div>
          
          <div>
            <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-2">
              {isDragging ? 'Drop files here' : 'Upload your files'}
            </h3>
            <p className="text-surface-600 dark:text-surface-300 mb-4">
              Drag and drop files here, or click to browse
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors"
            >
              <ApperIcon name="FolderOpen" className="w-5 h-5 mr-2" />
              Choose Files
            </button>
          </div>
          
          <p className="text-sm text-surface-500 dark:text-surface-400">
            Supported: Images, PDFs, Videos, Audio, Documents (Max 10MB)
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileInput}
          accept={allowedTypes.join(',')}
        />
</motion.div>

        {/* Upload Progress */}
        <AnimatePresence>
          {uploadingFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-surface-800 rounded-xl p-6 shadow-card"
          >
            <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-4">
              Uploading Files ({uploadingFiles.length})
            </h3>
            <div className="space-y-3">
              {uploadingFiles.map((file) => (
                <div key={file.id} className="flex items-center space-x-4">
                  <ApperIcon name="File" className="w-5 h-5 text-surface-500" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-surface-900 dark:text-surface-50">
                        {file.name}
                      </span>
                      <span className="text-sm text-surface-500">
                        {file.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
</motion.div>
          )}
        </AnimatePresence>

        {/* File Management Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-50">
              {selectedFolderId === null ? 'All Files' : 'Folder Files'} ({filteredFiles?.length || 0})
            </h2>
            {selectedFolderId !== null && (
              <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
                Showing files in selected folder
              </p>
            )}
</div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-primary text-white' 
                  : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300'
              }`}
            >
              <ApperIcon name="Grid3X3" className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-primary text-white' 
                  : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300'
              }`}
            >
              <ApperIcon name="List" className="w-5 h-5" />
            </button>
          </div>
</div>

        {/* Files Display */}
        {filteredFiles?.length === 0 ? (
          <div className="text-center py-12">
            <ApperIcon name="FileX" className="w-16 h-16 text-surface-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-surface-900 dark:text-surface-50 mb-2">
              {selectedFolderId === null ? 'No files uploaded yet' : 'No files in this folder'}
            </h3>
            <p className="text-surface-600 dark:text-surface-300">
              {selectedFolderId === null ? 'Upload your first file to get started' : 'Upload files to this folder or select a different folder'}
            </p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
              : 'space-y-3'
          }>
            {filteredFiles?.map((file) => (
              <motion.div
                key={file.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className={`bg-white dark:bg-surface-800 rounded-xl shadow-card overflow-hidden ${
                  viewMode === 'list' ? 'flex items-center p-4' : 'p-4'
                }`}
              >
              {viewMode === 'grid' ? (
                <>
                  <div className="aspect-square bg-surface-100 dark:bg-surface-700 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    {isImageFile(file.type) ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setPreviewFile(file)}
                      />
                    ) : (
                      <ApperIcon 
                        name={getFileIcon(file.type)} 
                        className="w-8 h-8 text-surface-500" 
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-surface-900 dark:text-surface-50 truncate">
                      {file.name}
                    </h4>
                    <div className="flex items-center justify-between text-sm text-surface-500">
                      <span>{formatFileSize(file.size || 0)}</span>
                      <span>{format(new Date(file.uploadedAt), 'MMM d')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isImageFile(file.type) && (
                        <button
                          onClick={() => setPreviewFile(file)}
                          className="flex-1 px-3 py-1.5 bg-primary/10 text-primary text-xs rounded-md hover:bg-primary/20 transition-colors"
                        >
                          Preview
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="flex-1 px-3 py-1.5 bg-red-50 text-red-600 text-xs rounded-md hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-10 h-10 bg-surface-100 dark:bg-surface-700 rounded-lg flex items-center justify-center">
                      <ApperIcon 
                        name={getFileIcon(file.type)} 
                        className="w-5 h-5 text-surface-500" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-surface-900 dark:text-surface-50 truncate">
                        {file.name}
                      </h4>
                      <p className="text-sm text-surface-500">
                        {formatFileSize(file.size || 0)} • {format(new Date(file.uploadedAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isImageFile(file.type) && (
                      <button
                        onClick={() => setPreviewFile(file)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <ApperIcon name="Eye" className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <ApperIcon name="Trash2" className="w-4 h-4" />
                    </button>
</div>
                </>
              )}
              </motion.div>
            ))}
          </div>
        )}
        {/* File Preview Modal */}
        <AnimatePresence>
          {previewFile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setPreviewFile(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-surface-800 rounded-xl max-w-4xl max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-700">
                  <h3 className="font-semibold text-surface-900 dark:text-surface-50">
                    {previewFile.name}
                  </h3>
                  <button
                    onClick={() => setPreviewFile(null)}
                    className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
                  >
                    <ApperIcon name="X" className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4">
                  <img
                    src={previewFile.url}
                    alt={previewFile.name}
                    className="max-w-full max-h-[70vh] object-contain mx-auto"
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default MainFeature