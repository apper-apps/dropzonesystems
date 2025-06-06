import foldersData from '../mockData/folders.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class FolderService {
  constructor() {
    this.folders = [...foldersData]
  }

  async getAll() {
    await delay(300)
    return [...this.folders]
  }

  async getById(id) {
    await delay(200)
    const folder = this.folders.find(f => f.id === parseInt(id))
    return folder ? { ...folder } : null
  }

  async getByParentId(parentId) {
    await delay(250)
    return this.folders
      .filter(f => f.parentId === parentId)
      .map(f => ({ ...f }))
  }

  async getRootFolders() {
    await delay(250)
    return this.folders
      .filter(f => f.parentId === null)
      .map(f => ({ ...f }))
  }

  async create(folderData) {
    await delay(400)
    const newFolder = {
      id: Date.now(),
      name: folderData.name,
      parentId: folderData.parentId || null,
      isExpanded: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    this.folders.push(newFolder)
    return { ...newFolder }
  }

  async update(id, updates) {
    await delay(350)
    const index = this.folders.findIndex(f => f.id === parseInt(id))
    if (index === -1) {
      throw new Error('Folder not found')
    }
    
    this.folders[index] = {
      ...this.folders[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    return { ...this.folders[index] }
  }

  async delete(id) {
    await delay(300)
    const index = this.folders.findIndex(f => f.id === parseInt(id))
    if (index === -1) {
      throw new Error('Folder not found')
    }
    
    // Also delete any child folders
    const deleteChildFolders = (parentId) => {
      const children = this.folders.filter(f => f.parentId === parentId)
      children.forEach(child => {
        deleteChildFolders(child.id)
        const childIndex = this.folders.findIndex(f => f.id === child.id)
        if (childIndex !== -1) {
          this.folders.splice(childIndex, 1)
        }
      })
    }
    
    deleteChildFolders(parseInt(id))
    this.folders.splice(index, 1)
    return true
  }

  async toggleExpanded(id) {
    await delay(150)
    const folder = this.folders.find(f => f.id === parseInt(id))
    if (folder) {
      folder.isExpanded = !folder.isExpanded
      folder.updatedAt = new Date().toISOString()
      return { ...folder }
    }
    throw new Error('Folder not found')
  }

  buildFolderTree(folders = null) {
    const folderList = folders || this.folders
    const folderMap = {}
    const rootFolders = []

    // Create a map of all folders
    folderList.forEach(folder => {
      folderMap[folder.id] = { ...folder, children: [] }
    })

    // Build the tree structure
    folderList.forEach(folder => {
      if (folder.parentId === null) {
        rootFolders.push(folderMap[folder.id])
      } else if (folderMap[folder.parentId]) {
        folderMap[folder.parentId].children.push(folderMap[folder.id])
      }
    })

    return rootFolders
  }

  async getFolderTree() {
    await delay(250)
    return this.buildFolderTree()
  }

  getFolderPath(folderId) {
    const path = []
    let currentFolder = this.folders.find(f => f.id === parseInt(folderId))
    
    while (currentFolder) {
      path.unshift(currentFolder.name)
      currentFolder = currentFolder.parentId 
        ? this.folders.find(f => f.id === currentFolder.parentId)
        : null
    }
    
    return path.join(' / ')
  }
}

export default new FolderService()