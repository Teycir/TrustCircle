import { PinataClient } from './pinata'
import { getConfig } from './config'

interface StorageStatus {
  capsules: { used: number; limit: number; percentage: number } | null
  vaults: { used: number; limit: number; percentage: number } | null
  lastCheck: number
  checking: boolean
  synced: boolean
}

class StorageStatusManager {
  private readonly status: StorageStatus = {
    capsules: null,
    vaults: null,
    lastCheck: 0,
    checking: false,
    synced: false
  }
  private readonly listeners: Set<() => void> = new Set()
  private checkInterval: NodeJS.Timeout | null = null

  async initialize() {
    if (globalThis.window === undefined) return
    if (this.checkInterval) return
    await this.checkStorage()
    this.checkInterval = setInterval(() => this.checkStorage(), 30000)
    setTimeout(() => this.syncDatabaseToIPFS(), 2000)
    setInterval(() => this.syncDatabaseToIPFS(), 60000)
  }

  private async checkStorage() {
    if (this.status.checking) return
    this.status.checking = true

    try {
      const [capsules, vaults] = await Promise.all([
        this.checkCapsuleStorage(),
        this.checkVaultStorage()
      ])

      this.status.capsules = capsules
      this.status.vaults = vaults
      this.status.lastCheck = Date.now()
      this.notifyListeners()
    } catch (error) {
      console.error('[StorageStatus] Check failed:', error)
    } finally {
      this.status.checking = false
    }
  }

  private async checkCapsuleStorage() {
    try {
      const capsuleKey = getConfig('pinataJWT')
      if (!capsuleKey) return null
      const pinata = new PinataClient(capsuleKey)
      return await pinata.getStorageUsage()
    } catch {
      return null
    }
  }

  private async checkVaultStorage() {
    try {
      const vaultKey = getConfig('vaultPinataJWT')
      if (!vaultKey) return null
      const pinata = new PinataClient(vaultKey)
      return await pinata.getStorageUsage()
    } catch {
      return null
    }
  }

  getStatus() {
    return { ...this.status }
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  private notifyListeners() {
    for (const listener of this.listeners) {
      listener()
    }
  }

  private async syncDatabaseToIPFS() {
    try {
      console.log('[StorageStatus] Starting database sync with IPFS')
      const { TrustCircleDB } = await import('./supabase')
      const { PinataClient } = await import('./pinata')
      
      const capsuleKey = getConfig('pinataJWT')
      const vaultKey = getConfig('vaultPinataJWT')
      const supabaseUrl = getConfig('supabaseUrl')
      const supabaseKey = getConfig('supabaseAnonKey')
      
      if (!supabaseUrl || !supabaseKey) {
        console.log('[StorageStatus] Missing Supabase config')
        return
      }

      if (capsuleKey) {
        const pinata = new PinataClient(capsuleKey)
        const db = new TrustCircleDB(supabaseUrl, supabaseKey)
        await db.syncCapsulesWithIPFS(pinata)
        console.log('[StorageStatus] Capsules synced')
      }

      if (vaultKey) {
        const pinata = new PinataClient(vaultKey)
        const db = new TrustCircleDB(supabaseUrl, supabaseKey)
        await db.syncVaultsWithIPFS(pinata)
        console.log('[StorageStatus] Vaults synced')
      }

      this.status.synced = true
      console.log('[StorageStatus] Database sync completed')
    } catch (error) {
      console.error('[StorageStatus] Sync failed:', error)
    }
  }

  destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
    this.listeners.clear()
  }
}

export const storageStatusManager = new StorageStatusManager()
