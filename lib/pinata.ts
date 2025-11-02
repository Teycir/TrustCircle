import { withRetry } from './retry'

export class PinataClient {
  private apiKey: string
  private gateway: string

  constructor(apiKey: string, gateway: string = 'https://gateway.pinata.cloud') {
    this.apiKey = apiKey
    this.gateway = gateway
  }

  async uploadBytes(data: Uint8Array): Promise<string> {
    if (!data || data.length === 0) throw new Error('Data cannot be empty')
    
    return withRetry(async () => {
      const formData = new FormData()
      formData.append('file', new Blob([data]))

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
}
