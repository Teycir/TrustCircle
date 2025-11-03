'use client'

import { useState, useEffect } from 'react'
import { isOnline, onOnline, onOffline } from '@/lib/offline'

export default function OfflineIndicator() {
  const [online, setOnline] = useState(true)

  useEffect(() => {
    setOnline(isOnline())
    const cleanupOnline = onOnline(() => setOnline(true))
    const cleanupOffline = onOffline(() => setOnline(false))
    return () => {
      cleanupOnline()
      cleanupOffline()
    }
  }, [])

  if (online) return null

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white px-4 py-2 text-center text-sm font-medium z-50">
      📡 Offline Mode - Changes will sync when connection is restored
    </div>
  )
}
