import { withRetry } from './retry'

export class PinataClient {
  private readonly apiKey: string
  private readonly gateway: string

  constructor(apiKey: string, gateway: string = 'https://gateway.pinata.cloud') {
    this.apiKey = apiKey
    this.gateway = gateway
  }

  async uploadBytes(data: Uint8Array, filename?: string): Promise<string> {
    if (!data || data.length === 0) throw new Error('Data cannot be empty')

    return withRetry(async () => {
      const formData = new FormData()
      formData.append('file', new Blob([data as BlobPart]), filename || 'capsule.bin')

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.apiKey}` },
        body: formData
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText)
        throw new Error(`Pinata upload failed: ${errorText}`)
      }

      const result = await response.json()
      if (!result?.IpfsHash) throw new Error('Invalid response: missing IpfsHash')
      return result.IpfsHash
    })
  }

  async getBytes(cid: string): Promise<Uint8Array> {
    if (!cid?.trim()) throw new Error('CID cannot be empty')

    return withRetry(async () => {
      const response = await fetch(`${this.gateway}/ipfs/${cid}`)

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText)
        throw new Error(`Pinata fetch failed: ${errorText}`)
      }

      const buffer = await response.arrayBuffer()
      return new Uint8Array(buffer)
    })
  }

  async getStorageUsage(): Promise<{ used: number; limit: number; percentage: number }> {
    const response = await fetch('https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=1000', {
      headers: { Authorization: `Bearer ${this.apiKey}` }
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText)
      console.error('[Pinata] Storage API error:', response.status, errorText)
      throw new Error(`Failed to get storage usage: ${errorText}`)
    }

    const data = await response.json()
    console.log('[Pinata] Storage API response:', { rowCount: data?.rows?.length, data })
    
    if (!data?.rows || !Array.isArray(data.rows)) throw new Error('Invalid response format')

    const used = data.rows.reduce((sum: number, row: any) => sum + (row.size || 0), 0)
    const limit = 1073741824
    
    console.log('[Pinata] Calculated storage:', { used, limit, percentage: (used / limit) * 100, fileCount: data.rows.length })

    return { used, limit, percentage: (used / limit) * 100 }
  }

  async unpin(cid: string): Promise<void> {
    if (!cid?.trim()) throw new Error('CID cannot be empty')

    const response = await fetch(`https://api.pinata.cloud/pinning/unpin/${cid}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${this.apiKey}` }
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText)
      throw new Error(`Failed to unpin file: ${errorText}`)
    }
  }

  async purgeOldFiles(threshold: number = 0.9): Promise<void> {
    const usage = await this.getStorageUsage()

    if (usage.percentage < threshold * 100) return

    const response = await fetch('https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=1000&sortBy=date_pinned&sortOrder=ASC', {
      headers: { Authorization: `Bearer ${this.apiKey}` }
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText)
      throw new Error(`Failed to list files: ${errorText}`)
    }

    const data = await response.json()
    if (!data?.rows || !Array.isArray(data.rows)) throw new Error('Invalid response format')

    const targetSize = usage.limit * 0.7
    let currentSize = usage.used
    const unpinPromises = []

    for (const file of data.rows) {
      if (currentSize <= targetSize) break
      if (!file?.ipfs_pin_hash) continue

      unpinPromises.push(this.unpin(file.ipfs_pin_hash).catch(err =>
        console.error(`Failed to unpin ${file.ipfs_pin_hash}:`, err)
      ))
      currentSize -= file.size || 0
    }

    await Promise.all(unpinPromises)
  }
}
