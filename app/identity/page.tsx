'use client'

import { useIdentity } from '@/lib/hooks'
import { useAuth } from '@/lib/useAuth'
import { toBase64 } from '@/lib/crypto'
import Link from 'next/link'
import { useState } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { QRCodeSVG } from 'qrcode.react'

function IdentityContent() {
  const { identity, loading, create, getPublicKeyString, exportKeys, importKeys, deleteIdentity } = useIdentity()
  const { user, savePublicKeys: savePublicKeysToServer } = useAuth()
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')
  const [showQR, setShowQR] = useState(false)

  const handleGenerate = async () => {
    const newIdentity = await create()
    if (user && newIdentity) {
      const ed25519Pub = toBase64(newIdentity.ed25519.publicKey)
      const x25519Pub = toBase64(newIdentity.x25519.publicKey)
      await savePublicKeysToServer(user.id, ed25519Pub, x25519Pub)
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    setError('')
    try {
      await importKeys(file)
      if (user && identity) {
        const ed25519Pub = toBase64(identity.ed25519.publicKey)
        const x25519Pub = toBase64(identity.x25519.publicKey)
        await savePublicKeysToServer(user.id, ed25519Pub, x25519Pub)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import keys')
    } finally {
      setImporting(false)
      e.target.value = ''
    }
  }

  const publicKey = getPublicKeyString()

  const exportPublicKey = () => {
    const blob = new Blob([publicKey], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trustcircle-public-key-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
            <span>🔐</span> TrustCircle
          </Link>
          <Link href="/" className="text-gray-600 hover:text-gray-900">← Back</Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Identity Management</h2>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          {!identity ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🔑</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Identity Found</h3>
              <p className="text-gray-600 mb-6">Generate a new cryptographic identity or import existing keys</p>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
              
              <div className="flex flex-col gap-3 max-w-xs mx-auto">
                <button onClick={handleGenerate} className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700">
                  Generate New Identity
                </button>
                
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    disabled={importing}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    id="import-keys"
                  />
                  <label
                    htmlFor="import-keys"
                    className="block bg-white border-2 border-indigo-600 text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 cursor-pointer text-center"
                  >
                    {importing ? 'Importing...' : '📥 Import Keys from File'}
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-2xl">📤</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Share Your Public Key</h3>
                    <p className="text-sm text-gray-600">
                      Give this to others so they can send you encrypted capsules
                    </p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                  <code className="text-sm text-gray-800 break-all">{publicKey}</code>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => navigator.clipboard.writeText(publicKey)} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 font-medium">
                    📋 Copy to Clipboard
                  </button>
                  <button onClick={exportPublicKey} className="flex-1 bg-white border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 font-medium">
                    💾 Save as File
                  </button>
                </div>
                <button onClick={() => setShowQR(!showQR)} className="w-full mt-3 bg-white border border-indigo-300 text-indigo-600 py-2.5 rounded-lg hover:bg-indigo-50 font-medium">
                  {showQR ? '🔼 Hide QR Code' : '📱 Show QR Code'}
                </button>
                {showQR && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 flex justify-center">
                    <QRCodeSVG value={publicKey} size={200} />
                  </div>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-2xl">🔐</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Backup Your Keys</h3>
                    <p className="text-sm text-gray-600">
                      Export all keys including private keys for backup or transfer to another device
                    </p>
                  </div>
                </div>
                <button onClick={exportKeys} className="w-full bg-amber-600 text-white py-2.5 rounded-lg hover:bg-amber-700 font-medium">
                  📦 Export Full Backup (JSON)
                </button>
                <p className="text-xs text-amber-700 mt-2">⚠️ Keep this file secure - it contains your private keys</p>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Security Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-green-600">✓</span>
                    <span>Keys stored locally in your browser</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-green-600">✓</span>
                    <span>All encryption happens client-side</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-green-600">✓</span>
                    <span>Private keys never leave your device</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete your identity? This cannot be undone and you will lose access to all your capsules unless you have a backup.')) {
                      deleteIdentity();
                    }
                  }}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  🗑️ Delete Identity
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default function Identity() {
  return (
    <ProtectedRoute>
      <IdentityContent />
    </ProtectedRoute>
  )
}
