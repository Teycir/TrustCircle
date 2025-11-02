import { CapsuleManager } from './capsule'
import { PinataClient } from './pinata'
import { TrustCircleDB } from './supabase'

let clientInstance: CapsuleManager | null = null

export function getClient(): CapsuleManager {
  if (!clientInstance) {
    const pinata = new PinataClient(
      process.env.NEXT_PUBLIC_PINATA_API_KEY || '',
      process.env.NEXT_PUBLIC_PINATA_GATEWAY
    )
    
    const db = new TrustCircleDB(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )
    
    clientInstance = new CapsuleManager(pinata, db)
  }
  
  return clientInstance
}

export async function fileToUint8Array(file: File): Promise<Uint8Array> {
  const buffer = await file.arrayBuffer()
  return new Uint8Array(buffer)
}

export function downloadFile(data: Uint8Array, filename: string) {
  const blob = new Blob([data])
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
