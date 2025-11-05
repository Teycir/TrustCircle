'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useIdentity } from '@/lib/hooks'
import { getClient, fileToUint8Array } from '@/lib/client'
import { getCurrentLocation } from '@/lib/geolocation'
import { buildLocationHash } from '@/lib/policy'
import { fromBase64 } from '@/lib/crypto'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { CopyButton } from '@/components/CopyButton'

function CreateCapsuleContent() {
  const { identity, getPublicKeyString } = useIdentity()
  const [file, setFile] = useState<File | null>(null)
  const [approverKey, setApproverKey] = useState('')
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const defaultDate = yesterday.toISOString().slice(0, 16)
  const [dateAfter, setDateAfter] = useState(defaultDate)
  const [useLocation, setUseLocation] = useState(false)
  const [expiresAt, setExpiresAt] = useState('')
  const [enableDeadHand, setEnableDeadHand] = useState(false)
  const [deadHandDate, setDeadHandDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identity || !file) return

    setLoading(true)
    setError(null)

    try {
      const unlockDate = new Date(dateAfter)
      const now = new Date()

      if (expiresAt) {
        const expiryDate = new Date(expiresAt)

        if (expiryDate <= now) {
          throw new Error('Expiration date must be in the future')
        }
        if (expiryDate <= unlockDate) {
          throw new Error('Expiration date must be after unlock date')
        }
      }

      if (enableDeadHand && deadHandDate) {
        const triggerDate = new Date(deadHandDate)

        if (triggerDate < unlockDate) {
          throw new Error('Dead hand trigger date must be on or after the unlock date')
        }

        if (expiresAt) {
          const expiryDate = new Date(expiresAt)
          if (triggerDate > expiryDate) {
            throw new Error('Dead hand trigger date must be on or before the expiration date')
          }
        }
      }
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
      if (!ed25519Str || !x25519Str) {
        throw new Error('Both ed25519 and x25519 keys are required')
      }
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
        notes,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        fileName: file.name
      })

      if (enableDeadHand && deadHandDate) {
        const { enableDeadHand: enableDeadHandFn } = await import('@/lib/dead-hand')
        const { TrustCircleDB } = await import('@/lib/supabase')
        const db = new TrustCircleDB(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        
        await enableDeadHandFn(db, capsuleId, {
          triggerDate: new Date(deadHandDate)
        })
      }

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
          <Link href="/identity" className="block w-full bg-gradient-to-r from-indigo-400 to-purple-400 hover:from-indigo-500 hover:to-purple-500 text-white py-3 rounded-lg text-center font-semibold shadow-sm">
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

      <main className="max-w-3xl mx-auto px-4 py-6 sm:py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Create Capsule</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {result ? (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-8 space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Capsule Created Successfully!</h3>
              <p className="text-gray-600">Your capsule has been encrypted and stored securely</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-3">Capsule ID</h4>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white p-3 rounded text-sm font-mono break-all">{result}</code>
                <CopyButton text={result} label="Copy ID" />
              </div>
            </div>



            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`/capsule/${result}`}
                className="flex-1 bg-gradient-to-r from-indigo-400 to-purple-400 hover:from-indigo-500 hover:to-purple-500 text-white py-3 rounded-lg text-center font-semibold shadow-sm"
              >
                View Capsule
              </Link>
              <button
                onClick={() => setResult(null)}
                className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white py-3 rounded-lg font-semibold shadow-sm"
              >
                Create Another
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-4 sm:p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">File to Encrypt</label>
              <div className="relative">
                <input id="file" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" required />
                <label htmlFor="file" className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-indigo-300 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
                  <span className="text-sm text-gray-600">
                    {file ? `📄 ${file.name}` : '📁 Click to select file'}
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="My Secret Document" required />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-4 py-2 border rounded-lg" rows={3} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="approverKey" className="block text-sm font-medium text-gray-700">Approver Public Key</label>
                <button
                  type="button"
                  onClick={() => setApproverKey(getPublicKeyString())}
                  className="text-xs bg-gradient-to-r from-indigo-400 to-purple-400 hover:from-indigo-500 hover:to-purple-500 text-white px-3 py-1 rounded font-medium shadow-sm"
                >
                  🔑 Use My Key
                </button>
              </div>
              <input id="approverKey" type="text" value={approverKey} onChange={(e) => setApproverKey(e.target.value)} className="w-full px-4 py-2 border rounded-lg font-mono text-sm" placeholder="ed25519:...,x25519:..." required />
              <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-xs text-blue-900 font-semibold mb-1">How to get the approver's key:</p>
                <ol className="text-xs text-blue-800 space-y-1">
                  <li>1. Ask the recipient to go to their Identity page</li>
                  <li>2. They click "Copy to Clipboard" or "Save as File"</li>
                  <li>3. They share the key with you (via email, message, etc.)</li>
                  <li>4. Paste it here, or click "Use My Key" to test with yourself</li>
                </ol>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Unlock Conditions</h3>
              <div className="mb-4">
                <label htmlFor="dateAfter" className="block text-sm font-medium text-gray-700 mb-2">Available After Date</label>
                <input id="dateAfter" type="datetime-local" value={dateAfter} onChange={(e) => setDateAfter(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
              </div>
              <div className="mb-4">
                <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-2">Expires At (Optional)</label>
                <input id="expiresAt" type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                <p className="text-xs text-gray-500 mt-1">Must be after unlock date. Capsule will be auto-deleted after this date.</p>
              </div>
              <div className="border-t pt-4 mb-4"></div>
              <div className="flex items-center group relative">
                <input type="checkbox" id="useLocation" checked={useLocation} onChange={(e) => setUseLocation(e.target.checked)} className="h-4 w-4 text-indigo-600 rounded" />
                <label htmlFor="useLocation" className="ml-2 text-sm text-gray-700 cursor-pointer">Require current location</label>
                <span className="ml-2 text-gray-400 cursor-help peer">ℹ️</span>
                <span className="invisible peer-hover:visible absolute left-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs text-gray-700 w-80 z-10">Approver must be at this exact location to unlock the capsule. Uses GPS coordinates with 1km radius.</span>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center mb-4 group relative">
                <input type="checkbox" id="enableDeadHand" checked={enableDeadHand} onChange={(e) => setEnableDeadHand(e.target.checked)} className="h-4 w-4 text-indigo-600 rounded" />
                <label htmlFor="enableDeadHand" className="ml-2 text-sm text-gray-700 cursor-pointer">Enable automatic unlock if not reset</label>
                <span className="ml-2 text-gray-400 cursor-help peer">ℹ️</span>
                <span className="invisible peer-hover:visible absolute left-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs text-gray-700 w-80 z-10">Automatically unlock capsule if you become inactive. You will receive warnings before trigger date and can reset anytime to prevent unlock.</span>
              </div>
              {enableDeadHand && (
                <div className="space-y-4 pl-6 border-l-2 border-indigo-200">
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                    <p className="text-xs text-blue-900 font-semibold mb-1">How Dead Hand Works:</p>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• Warning notification in Dashboard 2 days before trigger</li>
                      <li>• 2 day grace period after trigger date</li>
                      <li>• Auto unlock if not reset during grace period</li>
                      <li>• You can reset the date anytime to prevent unlock</li>
                      <li>• No email needed - all notifications in-app</li>
                    </ul>
                  </div>
                  <div>
                    <label htmlFor="deadHandDate" className="block text-sm font-medium text-gray-700 mb-2">Trigger Date</label>
                    <input id="deadHandDate" type="datetime-local" value={deadHandDate} onChange={(e) => setDeadHandDate(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required={enableDeadHand} />
                    <p className="text-xs text-gray-500 mt-1">Check your Dashboard for warnings 2 days before this date</p>
                  </div>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-indigo-400 to-purple-400 hover:from-indigo-500 hover:to-purple-500 text-white py-3 rounded-lg font-semibold disabled:bg-gray-300 disabled:from-gray-300 disabled:to-gray-300 shadow-sm">
              {loading ? 'Creating...' : 'Create Capsule'}
            </button>
          </form>
        )}
      </main>
    </div>
  )
}

export default function CreateCapsule() {
  return (
    <ProtectedRoute>
      <CreateCapsuleContent />
    </ProtectedRoute>
  )
}
