import { useState, useEffect } from 'react'
import { offlineManager, isOnline } from './offline'

export function useOfflineStorage<T>(key: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    offlineManager.getCapsule(key).then((result) => {
      if (result) setData(result.data)
      setLoading(false)
    })
  }, [key])

  const save = async (value: T) => {
    await offlineManager.saveCapsule(key, value)
    setData(value)
  }

  return { data, loading, save, isOnline: isOnline() }
}

export function useOfflineQueue() {
  const queue = async (type: 'create' | 'update' | 'delete', entity: 'capsule', data: any) => {
    await offlineManager.queueOperation(type, entity, data)
  }

  return { queue }
}
