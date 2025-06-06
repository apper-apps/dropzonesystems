import uploadSessionData from '../mockData/uploadSessions.json'

class UploadSessionService {
  constructor() {
    this.sessions = [...uploadSessionData]
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300))
  }

  async getAll() {
    await this.delay()
    return [...this.sessions]
  }

  async getById(id) {
    await this.delay()
    const session = this.sessions.find(s => s.id === id)
    return session ? { ...session } : null
  }

  async create(sessionData) {
    await this.delay()
    const newSession = {
      id: Date.now().toString(),
      startTime: new Date().toISOString(),
      completed: false,
      ...sessionData
    }
    this.sessions.push(newSession)
    return { ...newSession }
  }

  async update(id, updates) {
    await this.delay()
    const index = this.sessions.findIndex(s => s.id === id)
    if (index === -1) throw new Error('Upload session not found')
    
    this.sessions[index] = { ...this.sessions[index], ...updates }
    return { ...this.sessions[index] }
  }

  async delete(id) {
    await this.delay()
    const index = this.sessions.findIndex(s => s.id === id)
    if (index === -1) throw new Error('Upload session not found')
    
    const deleted = this.sessions.splice(index, 1)[0]
    return { ...deleted }
  }
}

export default new UploadSessionService()