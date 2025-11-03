import { CapsuleManager } from './capsule'
import { PinataClient } from './pinata'
import { TrustCircleDB } from './supabase'
import { getEnvOrConfig } from './config'

let clientInstance: CapsuleManager | null = null
let lastConfig = ''

export function getClient(): CapsuleManager {
  const apiKey = getEnvOrConfig('NEXT_PUBLIC_PINATA_JWT', 'pinataJWT') || getEnvOrConfig('NEXT_PUBLIC_PINATA_API_KEY', 'pinataJWT')
  const supabaseUrl = getEnvOrConfig('NEXT_PUBLIC_SUPABASE_URL', 'supabaseUrl')
  const supabaseKey = getEnvOrConfig('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'supabaseAnonKey')

  if (!apiKey) throw new Error('NEXT_PUBLIC_PINATA_JWT not configured')
  if (!supabaseUrl) throw new Error('NEXT_PUBLIC_SUPABASE_URL not configured')
  if (!supabaseKey) throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY not configured')

  const currentConfig = `${apiKey}|${supabaseUrl}|${supabaseKey}`
  if (!clientInstance || lastConfig !== currentConfig) {
    const pinata = new PinataClient(apiKey, process.env.NEXT_PUBLIC_PINATA_GATEWAY)
    const db = new TrustCircleDB(supabaseUrl, supabaseKey, pinata)
    clientInstance = new CapsuleManager(pinata, db)
    lastConfig = currentConfig
  }

  return clientInstance
}

export async function fileToUint8Array(file: File): Promise<Uint8Array> {
  const buffer = await file.arrayBuffer()
  return new Uint8Array(buffer)
}

export function downloadFile(data: Uint8Array, filename: string) {
  if (!data?.length) throw new Error('Data cannot be empty')
  if (!filename?.trim()) throw new Error('Filename cannot be empty')

  const blob = new Blob([data as BlobPart])
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
