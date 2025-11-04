import { createClient } from '@supabase/supabase-js'
import { openDB } from 'idb'

let globalConfig: {
  pinataJWT?: string
  vaultPinataJWT?: string
  supabaseUrl?: string
  supabaseAnonKey?: string
} = {}

let configLoaded = false

const CONFIG_STORE = 'app-config'

async function loadFromIndexedDB() {
  try {
    const db = await openDB('trustcircle-config', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(CONFIG_STORE)) {
          db.createObjectStore(CONFIG_STORE)
        }
      }
    })
    const stored = await db.get(CONFIG_STORE, 'config')
    if (stored) {
      globalConfig = stored
      return true
    }
  } catch (err) {
    console.error('Failed to load config from IndexedDB:', err)
  }
  return false
}

async function saveToIndexedDB() {
  try {
    const db = await openDB('trustcircle-config', 1)
    await db.put(CONFIG_STORE, globalConfig, 'config')
  } catch (err) {
    console.error('Failed to save config to IndexedDB:', err)
  }
}

export async function loadConfig() {
  if (configLoaded) return

  const hasOfflineConfig = await loadFromIndexedDB()
  if (hasOfflineConfig) {
    configLoaded = true
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) return

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data, error } = await supabase
      .from('app_config')
      .select('key, value')

    if (error) throw error

    data?.forEach(item => {
      if (item.key === 'pinata_jwt') globalConfig.pinataJWT = item.value
      if (item.key === 'vault_pinata_jwt') globalConfig.vaultPinataJWT = item.value
      if (item.key === 'supabase_url') globalConfig.supabaseUrl = item.value
      if (item.key === 'supabase_anon_key') globalConfig.supabaseAnonKey = item.value
    })

    await saveToIndexedDB()
    configLoaded = true
  } catch (err) {
    console.error('Failed to load config from database:', err)
    if (!hasOfflineConfig) {
      throw new Error('No config available offline or online')
    }
  }
}

export function getConfig(key: 'pinataJWT' | 'vaultPinataJWT' | 'supabaseUrl' | 'supabaseAnonKey'): string | undefined {
  return globalConfig[key]
}
