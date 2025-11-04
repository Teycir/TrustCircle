'use client'

import { useEffect, useState } from 'react'
import { loadConfig } from '@/lib/config'
import { offlineManager, isOnline, onOnline } from '@/lib/offline'

export function ConfigLoader() {
  const [online, setOnline] = useState(true)

  useEffect(() => {
    setOnline(isOnline())
    loadConfig().catch(err => {
      console.error('Config load failed:', err)
    })

    const cleanup = onOnline(() => {
      setOnline(true)
      loadConfig().catch(err => {
        console.error('Config reload failed:', err)
      })
      offlineManager.sync(async (ops) => {
        console.log('Syncing pending operations:', ops.length)
      }).catch(err => {
        console.error('Sync failed:', err)
      })
    })

    return cleanup
  }, [])

  return null
}
