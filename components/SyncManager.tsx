'use client'

import { useEffect } from 'react'
import { startAutoSync, syncPendingOperations } from '@/lib/sync'
import { onOnline } from '@/lib/offline'

export default function SyncManager() {
  useEffect(() => {
    const cleanupAutoSync = startAutoSync()
    const cleanupOnline = onOnline(() => {
      syncPendingOperations().catch(console.error)
    })
    
    return () => {
      cleanupAutoSync()
      cleanupOnline()
    }
  }, [])

  return null
}
