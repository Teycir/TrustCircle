import { generateIdentity, toBase64, fromBase64 } from '../crypto'

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
  if (!id || !id.trim()) throw new Error('ID cannot be empty')
  if (!keys) throw new Error('Keys cannot be null')

  const serialized = {
    id,
    ed25519_priv: toBase64(keys.ed25519.privateKey),
    ed25519_pub: toBase64(keys.ed25519.publicKey),
    x25519_priv: toBase64(keys.x25519.privateKey),
    x25519_pub: toBase64(keys.x25519.publicKey)
  }

  localStorage.setItem(`${DB_NAME}-${id}`, JSON.stringify(serialized))

  const db = await openDB()
  try {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)

    await new Promise((resolve, reject) => {
      const request = store.put(serialized)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error || new Error('Failed to save identity'))
    })
  } finally {
    db.close()
  }
}

export async function loadIdentity(id: string): Promise<Awaited<ReturnType<typeof generateIdentity>> | null> {
  if (!id || !id.trim()) throw new Error('ID cannot be empty')

  const localData = localStorage.getItem(`${DB_NAME}-${id}`)
  if (localData) {
    const result = JSON.parse(localData)
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

  const db = await openDB()
  try {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)

    const result = await new Promise<any>((resolve, reject) => {
      const request = store.get(id)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error || new Error('Failed to load identity'))
    })

    if (!result) return null

    localStorage.setItem(`${DB_NAME}-${id}`, JSON.stringify(result))

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
  } finally {
    db.close()
  }
}

export async function deleteIdentity(id: string): Promise<void> {
  if (!id || !id.trim()) throw new Error('ID cannot be empty')

  localStorage.removeItem(`${DB_NAME}-${id}`)

  const db = await openDB()
  try {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)

    await new Promise((resolve, reject) => {
      const request = store.delete(id)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error || new Error('Failed to delete identity'))
    })
  } finally {
    db.close()
  }
}
