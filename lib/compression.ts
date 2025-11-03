import { gzipSync, gunzipSync } from 'fflate'

export function compress(data: Uint8Array): Uint8Array {
  if (!data || data.length === 0) throw new Error('Data cannot be empty')
  try {
    return gzipSync(data, { level: 6 })
  } catch (error) {
    throw new Error(`Compression failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export function decompress(data: Uint8Array): Uint8Array {
  if (!data || data.length === 0) throw new Error('Data cannot be empty')
  try {
    return gunzipSync(data)
  } catch (error) {
    throw new Error(`Decompression failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}
