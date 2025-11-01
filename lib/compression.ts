import { gzipSync, gunzipSync } from 'fflate'

export function compress(data: Uint8Array): Uint8Array {
  return gzipSync(data, { level: 6 })
}

export function decompress(data: Uint8Array): Uint8Array {
  return gunzipSync(data)
}
