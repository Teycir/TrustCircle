'use client'

import { useEffect } from 'react'
import { useIdentity } from '@/lib/hooks'
import { getClient } from '@/lib/client'
import { toBase64 } from '@/lib/crypto'
import { useCache } from '@/lib/cache'

export default function ClientInitializer() {
  const { identity } = useIdentity()
  const cache = useCache()

  useEffect(() => {
    if (!identity) return

    const initializeClient = async () => {
      try {
        const client = getClient()
        const publicKey = `ed25519:${toBase64(identity.ed25519.publicKey)}`
        const data = await client['db'].listCapsules({ approver: publicKey })
        cache.set(`capsules:${publicKey}`, data, 30000)
      } catch (err) {
        console.warn('Client initialization failed:', err)
      }
    }

    initializeClient()
  }, [identity, cache])

  return null
}
