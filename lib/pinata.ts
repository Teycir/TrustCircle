import { withRetry } from './retry'

export class PinataClient {
  private apiKey: string
  private gateway: string

  constructor(apiKey: string, gateway: string = 'https://gateway.pinata.cloud') {
    this.apiKey = apiKey
    this.gateway = gateway
  }

  async uploadBytes(data: Uint8Array, filename?: string): Promise<string> {
    if (!data || data.length === 0) throw new Error('Data cannot be empty')
    
    return withRetry(async () => {
      const formData = new FormData()
      formData.append('file', new Blob([data]), filename || 'capsule.bin')

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.apiKey}` },
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Pinata upload failed: ${response.statusText}`)
      }

      const result = await response.json()
      return result.IpfsHash
    })
  }

  async getBytes(cid: string): Promise<Uint8Array> {
    if (!cid || !cid.trim()) throw new Error('CID cannot be empty')
    
    return withRetry(async () => {
      const response = await fetch(`${this.gateway}/ipfs/${cid}`)

      if (!response.ok) {
        throw new Error(`Pinata fetch failed: ${response.statusText}`)
      }

      const buffer = await response.arrayBuffer()
      return new Uint8Array(buffer)
    })
  }

  async getStorageUsage(): Promise<{ used: number; limit: number; percentage: number }> {
    const response = await fetch('https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=1', {
      headers: { Authorization: `Bearer ${this.apiKey}` }
    })

    if (!response.ok) throw new Error('Failed to get storage usage')

    const data = await response.json()
    const used = data.rows.reduce((sum: number, row: any) => sum + row.size, 0)
    const limit = 1073741824
    
    return { used, limit, percentage: (used / limit) * 100 }
  }

  async purgeOldFiles(threshold: number = 0.9): Promise<void> {
    const usage = await this.getStorageUsage()
    
    if (usage.percentage < threshold * 100) return

    const response = await fetch('https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=1000&sortBy=date_pinned&sortOrder=ASC', {
      headers: { Authorization: `Bearer ${this.apiKey}` }
    })

    if (!response.ok) throw new Error('Failed to list files')

    const data = await response.json()
    const targetSize = usage.limit * 0.7
    let currentSize = usage.used

    for (const file of data.rows) {
      if (currentSize <= targetSize) break

      await fetch(`https://api.pinata.cloud/pinning/unpin/${file.ipfs_pin_hash}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${this.apiKey}` }
      })

      currentSize -= file.size
    }
  }
}
