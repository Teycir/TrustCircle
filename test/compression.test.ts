import { describe, it, expect } from 'vitest'
import { compress, decompress } from '../lib/compression'

describe('Compression', () => {
  it('compresses and decompresses data', () => {
    const original = new TextEncoder().encode('test data '.repeat(100))
    const compressed = compress(original)
    const decompressed = decompress(compressed)
    
    expect(decompressed).toEqual(original)
    expect(compressed.length).toBeLessThan(original.length)
  })

  it('handles small data', () => {
    const original = new TextEncoder().encode('hi')
    const compressed = compress(original)
    const decompressed = decompress(compressed)
    
    expect(decompressed).toEqual(original)
  })
})
