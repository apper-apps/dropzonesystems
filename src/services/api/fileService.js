import fileData from '../mockData/files.json'

class FileService {
  constructor() {
    this.files = [...fileData]
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300))
  }

  async getAll() {
    await this.delay()
    return [...this.files]
  }

  async getById(id) {
    await this.delay()
    const file = this.files.find(f => f.id === id)
    return file ? { ...file } : null
  }

  async create(fileData) {
    await this.delay()
    const newFile = {
      id: Date.now().toString(),
      uploadedAt: new Date().toISOString(),
      ...fileData
    }
    this.files.push(newFile)
    return { ...newFile }
  }

  async update(id, updates) {
    await this.delay()
    const index = this.files.findIndex(f => f.id === id)
    if (index === -1) throw new Error('File not found')
    
    this.files[index] = { ...this.files[index], ...updates }
    return { ...this.files[index] }
  }

  async delete(id) {
    await this.delay()
    const index = this.files.findIndex(f => f.id === id)
    if (index === -1) throw new Error('File not found')
    
    const deleted = this.files.splice(index, 1)[0]
    return { ...deleted }
  }

  async getByStatus(status) {
    await this.delay()
    return this.files.filter(f => f.status === status).map(f => ({ ...f }))
  }
}

export default new FileService()