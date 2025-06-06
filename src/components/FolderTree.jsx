import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ApperIcon from './ApperIcon'
import { folderService } from '../services'
import { toast } from 'react-toastify'

const FolderTree = ({ selectedFolderId, onFolderSelect, className = '' }) => {
  const [folderTree, setFolderTree] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedFolders, setExpandedFolders] = useState(new Set())

  useEffect(() => {
    loadFolders()
  }, [])

  const loadFolders = async () => {
    try {
      setLoading(true)
      const tree = await folderService.getFolderTree()
      setFolderTree(tree)
      
      // Set initially expanded folders
      const initialExpanded = new Set()
      tree.forEach(folder => {
        if (folder.isExpanded) {
          initialExpanded.add(folder.id)
        }
        // Also expand any nested folders that are marked as expanded
        const addExpandedChildren = (children) => {
          children.forEach(child => {
            if (child.isExpanded) {
              initialExpanded.add(child.id)
            }
            if (child.children) {
              addExpandedChildren(child.children)
            }
          })
        }
        if (folder.children) {
          addExpandedChildren(folder.children)
        }
      })
      setExpandedFolders(initialExpanded)
    } catch (err) {
      setError(err.message)
      toast.error('Failed to load folders')
    } finally {
      setLoading(false)
    }
  }

  const toggleFolder = async (folderId) => {
    try {
      const newExpanded = new Set(expandedFolders)
      if (newExpanded.has(folderId)) {
        newExpanded.delete(folderId)
      } else {
        newExpanded.add(folderId)
      }
      setExpandedFolders(newExpanded)
      
      // Update the folder state in the service
      await folderService.toggleExpanded(folderId)
    } catch (err) {
      toast.error('Failed to toggle folder')
    }
  }

  const handleFolderSelect = (folderId) => {
    onFolderSelect(folderId)
  }

  const renderFolder = (folder, level = 0) => {
    const isExpanded = expandedFolders.has(folder.id)
    const isSelected = selectedFolderId === folder.id
    const hasChildren = folder.children && folder.children.length > 0

    return (
      <div key={folder.id} className="select-none">
        <motion.div
          className={`flex items-center space-x-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
            isSelected 
              ? 'bg-primary/10 text-primary border border-primary/20' 
              : 'hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300'
          }`}
          style={{ paddingLeft: `${(level * 16) + 8}px` }}
          onClick={() => handleFolderSelect(folder.id)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleFolder(folder.id)
              }}
              className="p-0.5 hover:bg-surface-200 dark:hover:bg-surface-600 rounded transition-colors"
            >
              <ApperIcon 
                name={isExpanded ? "ChevronDown" : "ChevronRight"} 
                className="w-4 h-4" 
              />
            </button>
          ) : (
            <div className="w-5 h-5" />
          )}
          
          <ApperIcon 
            name={isExpanded && hasChildren ? "FolderOpen" : "Folder"} 
            className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-surface-500'}`}
          />
          
          <span className={`text-sm font-medium truncate ${
            isSelected ? 'text-primary' : 'text-surface-700 dark:text-surface-300'
          }`}>
            {folder.name}
          </span>
          
          {folder.children && folder.children.length > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              isSelected 
                ? 'bg-primary/20 text-primary' 
                : 'bg-surface-200 dark:bg-surface-600 text-surface-500'
            }`}>
              {folder.children.length}
            </span>
          )}
        </motion.div>

        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {folder.children.map(child => renderFolder(child, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`bg-white dark:bg-surface-800 rounded-xl shadow-card p-4 ${className}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
          <span className="text-sm text-surface-600 dark:text-surface-300">Loading folders...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white dark:bg-surface-800 rounded-xl shadow-card p-4 ${className}`}>
        <div className="text-center">
          <ApperIcon name="AlertCircle" className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-surface-600 dark:text-surface-300">Error loading folders</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-surface-800 rounded-xl shadow-card ${className}`}>
      <div className="p-4 border-b border-surface-200 dark:border-surface-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50 flex items-center space-x-2">
            <ApperIcon name="FolderTree" className="w-5 h-5" />
            <span>Folders</span>
          </h3>
        </div>
      </div>
      
      <div className="p-4">
        <div className="space-y-1">
          {/* All Files Option */}
          <motion.div
            className={`flex items-center space-x-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
              selectedFolderId === null 
                ? 'bg-primary/10 text-primary border border-primary/20' 
                : 'hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300'
            }`}
            onClick={() => handleFolderSelect(null)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-5 h-5" />
            <ApperIcon 
              name="Files" 
              className={`w-4 h-4 ${selectedFolderId === null ? 'text-primary' : 'text-surface-500'}`}
            />
            <span className={`text-sm font-medium ${
              selectedFolderId === null ? 'text-primary' : 'text-surface-700 dark:text-surface-300'
            }`}>
              All Files
            </span>
          </motion.div>

          {/* Folder Tree */}
          {folderTree.map(folder => renderFolder(folder))}
        </div>

        {folderTree.length === 0 && (
          <div className="text-center py-8">
            <ApperIcon name="FolderX" className="w-12 h-12 text-surface-400 mx-auto mb-3" />
            <p className="text-sm text-surface-600 dark:text-surface-300">No folders available</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default FolderTree