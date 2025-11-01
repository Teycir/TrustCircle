import { describe, it, expect } from 'vitest'
import { buildLocationHash } from '../lib/policy'
import { toBase64, fromBase64 } from '../lib/crypto'

describe('Input Validation', () => {
  it('rejects invalid latitude', async () => {
    await expect(buildLocationHash(91, 0, new Date(), 2, 'salt')).rejects.toThrow('Latitude must be between -90 and 90')
    await expect(buildLocationHash(-91, 0, new Date(), 2, 'salt')).rejects.toThrow('Latitude must be between -90 and 90')
  })

  it('rejects invalid longitude', async () => {
    await expect(buildLocationHash(0, 181, new Date(), 2, 'salt')).rejects.toThrow('Longitude must be between -180 and 180')
    await expect(buildLocationHash(0, -181, new Date(), 2, 'salt')).rejects.toThrow('Longitude must be between -180 and 180')
  })

  it('accepts valid coordinates', async () => {
    const hash = await buildLocationHash(37.77, -122.42, new Date(), 2, 'salt')
    expect(hash).toBeTruthy()
  })

  it('handles base64 with special characters', () => {
    const data = new Uint8Array([0, 127, 255, 128, 64])
    const encoded = toBase64(data)
    const decoded = fromBase64(encoded)
    expect(decoded).toEqual(data)
  })
})
