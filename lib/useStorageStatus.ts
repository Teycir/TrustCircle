import { useState, useEffect } from 'react'
import { storageStatusManager } from './storage-status'

export function useStorageStatus() {
  const [status, setStatus] = useState(storageStatusManager.getStatus())

  useEffect(() => {
    const unsubscribe = storageStatusManager.subscribe(() => {
      setStatus(storageStatusManager.getStatus())
    })
    return () => unsubscribe()
  }, [])

  return status
}
