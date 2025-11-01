import { generateIdentity, toBase64, fromBase64 } from './crypto'

const DB_NAME = 'trustcircle-keys'
const STORE_NAME = 'identities'

async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

export async function saveIdentity(id: string, keys: Awaited<ReturnType<typeof generateIdentity>>): Promise<void> {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)
  
  const serialized = {
    id,
    ed25519_priv: toBase64(keys.ed25519.privateKey),
    ed25519_pub: toBase64(keys.ed25519.publicKey),
    x25519_priv: toBase64(keys.x25519.privateKey),
    x25519_pub: toBase64(keys.x25519.publicKey)
  }
  
  await new Promise((resolve, reject) => {
    const request = store.put(serialized)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
  
  db.close()
}

export async function loadIdentity(id: string): Promise<Awaited<ReturnType<typeof generateIdentity>> | null> {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readonly')
  const store = tx.objectStore(STORE_NAME)
  
  const result = await new Promise<any>((resolve, reject) => {
    const request = store.get(id)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
  
  db.close()
  
  if (!result) return null
  
  return {
    ed25519: {
      privateKey: fromBase64(result.ed25519_priv),
      publicKey: fromBase64(result.ed25519_pub)
    },
    x25519: {
      privateKey: fromBase64(result.x25519_priv),
      publicKey: fromBase64(result.x25519_pub)
    }
  }
}

export async function deleteIdentity(id: string): Promise<void> {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)
  
  await new Promise((resolve, reject) => {
    const request = store.delete(id)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
  
  db.close()
}
