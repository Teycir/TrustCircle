'use client'

import { useEffect } from 'react'
import { storageStatusManager } from '@/lib/storage-status'

export default function StorageStatusProvider() {
  useEffect(() => {
    storageStatusManager.initialize()
    return () => storageStatusManager.destroy()
  }, [])

  return null
}
