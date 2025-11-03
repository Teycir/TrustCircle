import { useState, useEffect } from 'react'
import { generateIdentity, toBase64 } from './crypto'
import { saveIdentity, loadIdentity } from './keystore'

const IDENTITY_KEY = 'default'

export function useIdentity() {
  const [identity, setIdentity] = useState<Awaited<ReturnType<typeof generateIdentity>> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadIdentity(IDENTITY_KEY)
      .then(id => {
        setIdentity(id)
        setLoading(false)
      })
      .catch(error => {
        console.error('Failed to load identity:', error)
        setLoading(false)
      })
  }, [])

  const create = async () => {
    const newIdentity = await generateIdentity()
    await saveIdentity(IDENTITY_KEY, newIdentity)
    setIdentity(newIdentity)
    return newIdentity
  }

  const getPublicKeys = () => {
    if (!identity) return null
    return {
      ed25519: toBase64(identity.ed25519.publicKey),
      x25519: toBase64(identity.x25519.publicKey)
    }
  }

  return { identity, loading, create, getPublicKeys }
}
