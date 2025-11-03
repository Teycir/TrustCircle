'use client'

import { useIdentity } from '@/lib/hooks'
import Link from 'next/link'

export default function Identity() {
  const { identity, loading, create, getPublicKeyString } = useIdentity()

  const handleGenerate = async () => {
    await create()
  }

  const publicKey = getPublicKeyString()

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
          <Link href="/" className="text-2xl font-bold text-indigo-600">TrustCircle Lite</Link>
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
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Public Key</h3>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <code className="text-sm text-gray-800 break-all">{publicKey}</code>
                </div>
                <p className="text-sm text-gray-600 mt-2">Share this key with others to receive capsules</p>
              </div>

              <div className="flex gap-4">
                <button onClick={() => navigator.clipboard.writeText(publicKey)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200">
                  Copy Key
                </button>
                <button onClick={() => alert('Export functionality coming soon')} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200">
                  Export Keys
                </button>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                    <span className="text-sm text-gray-700">Keys stored in browser</span>
                    <span className="text-green-600">✓</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                    <span className="text-sm text-gray-700">Client-side encryption</span>
                    <span className="text-green-600">✓</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                  Delete Identity
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
