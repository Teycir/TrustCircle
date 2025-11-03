'use client'

import { useIdentity } from '@/lib/hooks'
import Link from 'next/link'

export default function Identity() {
  const { identity, loading, create, getPublicKeyString, exportKeys } = useIdentity()

  const handleGenerate = async () => {
    await create()
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
              <p className="text-gray-600 mb-6">Generate a new cryptographic identity to get started</p>
              <button onClick={handleGenerate} className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700">
                Generate Identity
              </button>
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
                <button className="text-red-600 hover:text-red-800 text-sm font-medium">
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
