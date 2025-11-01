import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PinataClient } from '../lib/pinata'

describe('Pinata Client', () => {
  let client: PinataClient

  beforeEach(() => {
    client = new PinataClient('test-api-key')
    global.fetch = vi.fn()
  })

  it('uploads bytes and returns CID', async () => {
    const mockResponse = { IpfsHash: 'QmTest123' }
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    } as Response)

    const data = new TextEncoder().encode('test data')
    const cid = await client.uploadBytes(data)

    expect(cid).toBe('QmTest123')
    expect(fetch).toHaveBeenCalledWith(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      expect.objectContaining({
        method: 'POST',
        headers: { Authorization: 'Bearer test-api-key' }
      })
    )
  })

  it('throws error on upload failure', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      statusText: 'Unauthorized'
    } as Response)

    const data = new Uint8Array([1, 2, 3])
    await expect(client.uploadBytes(data)).rejects.toThrow('Pinata upload failed: Unauthorized')
  })

  it('retrieves bytes by CID', async () => {
    const testData = new TextEncoder().encode('retrieved data')
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      arrayBuffer: async () => testData.buffer
    } as Response)

    const result = await client.getBytes('QmTest123')

    expect(result).toEqual(testData)
    expect(fetch).toHaveBeenCalledWith('https://gateway.pinata.cloud/ipfs/QmTest123')
  })

  it('throws error on fetch failure', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found'
    } as Response)

    await expect(client.getBytes('QmInvalid')).rejects.toThrow('Pinata fetch failed: Not Found')
  })

  it('uses custom gateway', async () => {
    const customClient = new PinataClient('key', 'https://custom.gateway')
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(0)
    } as Response)

    await customClient.getBytes('QmTest')

    expect(fetch).toHaveBeenCalledWith('https://custom.gateway/ipfs/QmTest')
  })

  it('rejects empty data upload', async () => {
    await expect(client.uploadBytes(new Uint8Array([]))).rejects.toThrow('Data cannot be empty')
  })

  it('rejects empty CID', async () => {
    await expect(client.getBytes('')).rejects.toThrow('CID cannot be empty')
    await expect(client.getBytes('  ')).rejects.toThrow('CID cannot be empty')
  })
})
