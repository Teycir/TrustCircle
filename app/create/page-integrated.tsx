'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useIdentity } from '@/lib/hooks'
import { getClient, fileToUint8Array } from '@/lib/client'
import { getCurrentLocation } from '@/lib/geolocation'
import { buildLocationHash } from '@/lib/policy'
import { fromBase64 } from '@/lib/crypto'

export default function CreateCapsule() {
  const { identity } = useIdentity()
  const [file, setFile] = useState<File | null>(null)
  const [approverKey, setApproverKey] = useState('')
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [dateAfter, setDateAfter] = useState('')
  const [useLocation, setUseLocation] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identity || !file) return
    
    setLoading(true)
    setError(null)
    
    try {
      const client = getClient()
      const fileData = await fileToUint8Array(file)
      
      const conditions: any[] = [{
        type: 'DATE_AFTER',
        value: new Date(dateAfter).toISOString()
      }]

      if (useLocation) {
        const location = await getCurrentLocation()
        const salt = crypto.getRandomValues(new Uint8Array(16))
        const saltB64 = btoa(String.fromCharCode(...salt))
        const hash = await buildLocationHash(location.lat, location.lon, new Date(), 2, saltB64)
        
        conditions.push({
          type: 'LOCATION_HASH_EQ',
          value: hash,
          precision: 2,
          salt: saltB64
        })
      }

      const [ed25519Str, x25519Str] = approverKey.split(',').map(k => k.trim())
      const approverPubkey = {
        ed25519: fromBase64(ed25519Str.replace('ed25519:', '')),
        x25519: fromBase64(x25519Str.replace('x25519:', ''))
      }

      const capsuleId = await client.createCapsule({
        files: fileData,
        approverPubkey,
        creatorKeys: identity,
        policy: { conditions, logic: 'ALL' },
        title,
        notes
      })

      setResult(capsuleId)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
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
          <Link href="/" className="text-2xl font-bold text-indigo-600">TrustCircle Lite</Link>
          <Link href="/" className="text-gray-600 hover:text-gray-900">← Back</Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Create Capsule</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {result ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-2">Success!</h3>
            <p className="text-green-700 mb-2">Capsule ID:</p>
            <code className="block bg-white p-3 rounded text-sm mb-4">{result}</code>
            <button onClick={() => setResult(null)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              Create Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">File to Encrypt</label>
              <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="My Secret Document" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-4 py-2 border rounded-lg" rows={3} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Approver Public Keys</label>
              <input type="text" value={approverKey} onChange={(e) => setApproverKey(e.target.value)} className="w-full px-4 py-2 border rounded-lg font-mono text-sm" placeholder="ed25519:..., x25519:..." required />
              <p className="text-xs text-gray-500 mt-1">Format: ed25519:key, x25519:key</p>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Unlock Conditions</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Available After Date</label>
                <input type="datetime-local" value={dateAfter} onChange={(e) => setDateAfter(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="useLocation" checked={useLocation} onChange={(e) => setUseLocation(e.target.checked)} className="h-4 w-4 text-indigo-600 rounded" />
                <label htmlFor="useLocation" className="ml-2 text-sm text-gray-700">Require current location</label>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400">
              {loading ? 'Creating...' : 'Create Capsule'}
            </button>
          </form>
        )}
      </main>
    </div>
  )
}
