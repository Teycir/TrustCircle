import { openDB, DBSchema, IDBPDatabase } from 'idb'

interface OfflineDB extends DBSchema {
  capsules: {
    key: string
    value: {
      id: string
      data: any
      timestamp: number
      synced: boolean
    }
  }
  operations: {
    key: number
    value: {
      id?: number
      type: 'create' | 'update' | 'delete'
      entity: 'capsule'
      data: any
      timestamp: number
    }
    indexes: { timestamp: number }
  }
}

class OfflineManager {
  private db: IDBPDatabase<OfflineDB> | null = null

  async init() {
    if (this.db) return
    this.db = await openDB<OfflineDB>('trustcircle-offline', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('capsules')) {
          db.createObjectStore('capsules', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('operations')) {
          const store = db.createObjectStore('operations', { keyPath: 'id', autoIncrement: true })
          store.createIndex('timestamp', 'timestamp')
        }
      }
    })
  }

  async saveCapsule(id: string, data: any) {
    await this.init()
    await this.db!.put('capsules', { id, data, timestamp: Date.now(), synced: true })
  }

  async getCapsule(id: string) {
    await this.init()
    return await this.db!.get('capsules', id)
  }

  async getAllCapsules() {
    await this.init()
    return await this.db!.getAll('capsules')
  }

  async queueOperation(type: 'create' | 'update' | 'delete', entity: 'capsule', data: any) {
    await this.init()
    await this.db!.add('operations', { type, entity, data, timestamp: Date.now() })
  }

  async getPendingOperations() {
    await this.init()
    return await this.db!.getAll('operations')
  }

  async clearOperation(id: number) {
    await this.init()
    await this.db!.delete('operations', id)
  }

  async sync(syncFn: (ops: any[]) => Promise<void>) {
    const ops = await this.getPendingOperations()
    if (ops.length === 0) return

    try {
      await syncFn(ops)
      for (const op of ops) {
        if (op.id) await this.clearOperation(op.id)
      }
    } catch (err) {
      console.error('Sync failed:', err)
      throw err
    }
  }
}

export const offlineManager = new OfflineManager()

export function isOnline() {
  return navigator.onLine
}

export function onOnline(callback: () => void) {
  window.addEventListener('online', callback)
  return () => window.removeEventListener('online', callback)
}

export function onOffline(callback: () => void) {
  window.addEventListener('offline', callback)
  return () => window.removeEventListener('offline', callback)
}
