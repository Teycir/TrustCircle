import { CapsuleManager } from './capsule'
import { PinataClient } from './pinata'
import { TrustCircleDB } from './supabase'

let clientInstance: CapsuleManager | null = null

export function getClient(): CapsuleManager {
  if (!clientInstance) {
    const apiKey = process.env.NEXT_PUBLIC_PINATA_JWT || process.env.NEXT_PUBLIC_PINATA_API_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!apiKey) throw new Error('NEXT_PUBLIC_PINATA_JWT not configured')
    if (!supabaseUrl) throw new Error('NEXT_PUBLIC_SUPABASE_URL not configured')
    if (!supabaseKey) throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY not configured')
    
    const pinata = new PinataClient(apiKey, process.env.NEXT_PUBLIC_PINATA_GATEWAY)
    const db = new TrustCircleDB(supabaseUrl, supabaseKey)
    
    clientInstance = new CapsuleManager(pinata, db)
  }
  
  return clientInstance
}

export async function fileToUint8Array(file: File): Promise<Uint8Array> {
  const buffer = await file.arrayBuffer()
  return new Uint8Array(buffer)
}

export function downloadFile(data: Uint8Array, filename: string) {
  if (!data || data.length === 0) throw new Error('Data cannot be empty')
  if (!filename || !filename.trim()) throw new Error('Filename cannot be empty')
  
  const blob = new Blob([data])
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function getStorageUsage(): Promise<{ used: number; limit: number; percentage: number }> {
  const apiKey = process.env.NEXT_PUBLIC_PINATA_JWT || process.env.NEXT_PUBLIC_PINATA_API_KEY
  if (!apiKey) throw new Error('NEXT_PUBLIC_PINATA_JWT not configured')
  
  const pinata = new PinataClient(apiKey)
  return await pinata.getStorageUsage()
}
