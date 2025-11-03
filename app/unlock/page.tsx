'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useIdentity } from '@/lib/hooks'
import { getClient, downloadFile } from '@/lib/client'

export default function UnlockCapsule() {
  const { identity } = useIdentity()
  const [capsuleId, setCapsuleId] = useState('')
  const [loading, setLoading] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileData, setFileData] = useState<Uint8Array | null>(null)
  const [filename, setFilename] = useState<string>('unlocked-file')

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identity) return
    
    setLoading(true)
    setError(null)
    
    try {
      const client = getClient()
      const result = await client.unlockCapsule({
        capsuleId,
        approverKeys: identity,
        context: { now: new Date() }
      })
      
      setFileData(result.data)
      setFilename(result.filename || 'unlocked-file')
      setUnlocked(true)
    } catch (err) {
      console.error('Unlock error:', err)
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (fileData) {
      downloadFile(fileData, filename)
    }
  }

  if (!identity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Identity Required</h3>
          <p className="text-gray-600 mb-6">You need to generate an identity first</p>
          <Link href="/identity" className="block w-full bg-indigo-600 text-white py-3 rounded-lg text-center font-semibold hover:bg-indigo-700">
            Go to Identity
          </Link>
        </div>
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
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Unlock Capsule</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {unlocked ? (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Unlocked Successfully</h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800">File size: {fileData?.length} bytes</p>
            </div>
            <div className="flex gap-4">
              <button onClick={handleDownload} className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700">
                Download File
              </button>
              <button onClick={() => { setUnlocked(false); setFileData(null); setFilename('unlocked-file'); setCapsuleId('') }} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200">
                Unlock Another
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUnlock} className="bg-white rounded-lg shadow-md p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Capsule ID</label>
              <input type="text" value={capsuleId} onChange={(e) => setCapsuleId(e.target.value)} className="w-full px-4 py-2 border rounded-lg font-mono text-sm" placeholder="Enter capsule ID" required />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Unlock requires your private key and meeting policy conditions (date/location).
              </p>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400">
              {loading ? 'Unlocking...' : 'Unlock Capsule'}
            </button>
          </form>
        )}
      </main>
    </div>
  )
}
