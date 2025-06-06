import { useState, useEffect } from 'react'
import MainFeature from '../components/MainFeature'
import ApperIcon from '../components/ApperIcon'
import { fileService } from '../services'

const Home = () => {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalSize: 0,
    todayUploads: 0
  })

  useEffect(() => {
    const loadFiles = async () => {
      setLoading(true)
      try {
        const result = await fileService.getAll()
        setFiles(result || [])
        
        // Calculate stats
        const totalSize = result?.reduce((acc, file) => acc + (file.size || 0), 0) || 0
        const today = new Date().toDateString()
        const todayUploads = result?.filter(file => 
          new Date(file.uploadedAt).toDateString() === today
        ).length || 0
        
        setStats({
          totalFiles: result?.length || 0,
          totalSize,
          todayUploads
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadFiles()
  }, [])

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleFilesUpdate = (updatedFiles) => {
    setFiles(updatedFiles)
    
    // Recalculate stats
    const totalSize = updatedFiles.reduce((acc, file) => acc + (file.size || 0), 0)
    const today = new Date().toDateString()
    const todayUploads = updatedFiles.filter(file => 
      new Date(file.uploadedAt).toDateString() === today
    ).length
    
    setStats({
      totalFiles: updatedFiles.length,
      totalSize,
      todayUploads
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-surface-600 dark:text-surface-300">Loading files...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ApperIcon name="AlertCircle" className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-surface-600 dark:text-surface-300">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-surface-800 rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-surface-600 dark:text-surface-400">Total Files</p>
              <p className="text-2xl font-bold text-surface-900 dark:text-surface-50">{stats.totalFiles}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <ApperIcon name="Files" className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-surface-800 rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-surface-600 dark:text-surface-400">Total Size</p>
              <p className="text-2xl font-bold text-surface-900 dark:text-surface-50">
                {formatFileSize(stats.totalSize)}
              </p>
            </div>
            <div className="p-3 bg-secondary/10 rounded-lg">
              <ApperIcon name="HardDrive" className="w-6 h-6 text-secondary" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-surface-800 rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-surface-600 dark:text-surface-400">Today's Uploads</p>
              <p className="text-2xl font-bold text-surface-900 dark:text-surface-50">{stats.todayUploads}</p>
            </div>
            <div className="p-3 bg-accent/10 rounded-lg">
              <ApperIcon name="Upload" className="w-6 h-6 text-accent" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Upload Feature */}
      <MainFeature 
        files={files} 
        onFilesUpdate={handleFilesUpdate}
      />
    </div>
  )
}

export default Home