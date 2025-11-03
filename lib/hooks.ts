import { useState, useEffect } from 'react'
import { generateIdentity, toBase64, fromBase64 } from './crypto'
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

  const getPublicKeyString = () => {
    if (!identity) return ''
    return `ed25519:${toBase64(identity.ed25519.publicKey)},x25519:${toBase64(identity.x25519.publicKey)}`
  }

  const exportKeys = () => {
    if (!identity) return
    const exportData = {
      ed25519: {
        privateKey: toBase64(identity.ed25519.privateKey),
        publicKey: toBase64(identity.ed25519.publicKey)
      },
      x25519: {
        privateKey: toBase64(identity.x25519.privateKey),
        publicKey: toBase64(identity.x25519.publicKey)
      }
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trustcircle-keys-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importKeys = async (file: File) => {
    const text = await file.text()
    const data = JSON.parse(text)

    if (!data.ed25519?.privateKey || !data.ed25519?.publicKey || !data.x25519?.privateKey || !data.x25519?.publicKey) {
      throw new Error('Invalid key file format')
    }

    const importedIdentity = {
      ed25519: {
        privateKey: fromBase64(data.ed25519.privateKey),
        publicKey: fromBase64(data.ed25519.publicKey)
      },
      x25519: {
        privateKey: fromBase64(data.x25519.privateKey),
        publicKey: fromBase64(data.x25519.publicKey)
      }
    }

    await saveIdentity(IDENTITY_KEY, importedIdentity)
    setIdentity(importedIdentity)
  }

  return { identity, loading, create, getPublicKeys, getPublicKeyString, exportKeys, importKeys }
}
