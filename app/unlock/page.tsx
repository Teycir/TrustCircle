'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useIdentity } from '@/lib/hooks'
import { getClient, downloadFile } from '@/lib/client'
import { toBase64 } from '@/lib/crypto'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { CopyButton } from '@/components/CopyButton'
import { UnlockConditions } from '@/components/UnlockConditions'
import type { CapsuleMetadata } from '@/lib/capsule'

function UnlockCapsuleContent() {
  const { identity } = useIdentity()
  const [capsules, setCapsules] = useState<any[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [unlockingId, setUnlockingId] = useState('')
  const [unlockedData, setUnlockedData] = useState<Map<string, { data: Uint8Array; filename: string }>>(new Map())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!identity) return

    const loadCapsules = async () => {
      try {
        const client = getClient()
        const publicKey = `ed25519:${toBase64(identity.ed25519.publicKey)}`
        const data = await client['db'].listCapsules({ approver: publicKey })
        setCapsules(data)
      } catch (err) {
        console.error('Failed to load capsules:', err)
      } finally {
        setLoadingList(false)
      }
    }

    loadCapsules()
  }, [identity])

  const handleToggleLock = async (capsuleId: string, currentStatus: string) => {
    if (!identity) return

    setUnlockingId(capsuleId)
    setError(null)

    try {
      const client = getClient()
      
      if (currentStatus === 'locked') {
        const result = await client.unlockCapsule({
          capsuleId,
          approverKeys: identity,
          context: { now: new Date() }
        })

        await client['db'].updateStatus(capsuleId, 'unlocked')

        setUnlockedData(prev => new Map(prev).set(capsuleId, {
          data: result.data,
          filename: result.filename || 'unlocked-file'
        }))

        setCapsules(prev => prev.map(c => 
          c.id === capsuleId ? { ...c, status: 'unlocked' } : c
        ))
      } else {
        await client['db'].updateStatus(capsuleId, 'locked')

        setUnlockedData(prev => {
          const newMap = new Map(prev)
          newMap.delete(capsuleId)
          return newMap
        })

        setCapsules(prev => prev.map(c => 
          c.id === capsuleId ? { ...c, status: 'locked' } : c
        ))
      }
    } catch (err) {
      console.error('Toggle lock error:', err)
      setError((err as Error).message)
    } finally {
      setUnlockingId('')
    }
  }

  const handleDownload = async (capsuleId: string) => {
    if (!identity) return

    const cached = unlockedData.get(capsuleId)
    if (cached) {
      downloadFile(cached.data, cached.filename)
      return
    }

    setUnlockingId(capsuleId)
    setError(null)

    try {
      const client = getClient()
      const result = await client.unlockCapsule({
        capsuleId,
        approverKeys: identity,
        context: { now: new Date() }
      })

      setUnlockedData(prev => new Map(prev).set(capsuleId, {
        data: result.data,
        filename: result.filename || 'unlocked-file'
      }))

      downloadFile(result.data, result.filename || 'unlocked-file')
    } catch (err) {
      console.error('Download error:', err)
      setError((err as Error).message)
    } finally {
      setUnlockingId('')
    }
  }



  const handleDelete = async (capsuleId: string) => {
    if (!confirm('Are you sure you want to delete this capsule?')) return

    try {
      const client = getClient()
      await client['db'].deleteCapsule(capsuleId)
      setCapsules(capsules.filter(c => c.id !== capsuleId))
    } catch (err) {
      console.error('Delete error:', err)
      setError((err as Error).message)
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

      <main className="max-w-5xl mx-auto px-4 py-6 sm:py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Unlock Capsule</h2>
        <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">Select a capsule from your list to unlock and download</p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">❌</span>
              <div className="flex-1">
                <p className="font-semibold text-red-900 mb-2">Unable to Unlock Capsule</p>
                <p className="text-red-800 text-sm mb-3">{error}</p>
                <div className="bg-red-100 rounded p-3 text-sm text-red-900">
                  <p className="font-semibold mb-1">Common reasons:</p>
                  <ul className="space-y-1 text-red-800">
                    <li>• The unlock date/time has not been reached yet</li>
                    <li>• You are not at the required location (if location was set)</li>
                    <li>• You are not the designated approver for this capsule</li>
                    <li>• The capsule data may be corrupted or unavailable</li>
                  </ul>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="mt-3 text-sm text-red-700 hover:text-red-900 font-medium"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md">
          {loadingList && (
              <div className="p-12 text-center text-gray-500">Loading capsules...</div>
            )}
            {!loadingList && capsules.length === 0 && (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Capsules Found</h3>
                <p className="text-gray-600 mb-6">You don't have any capsules sent to you yet</p>
                <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800 font-medium">
                  Go to Dashboard →
                </Link>
              </div>
            )}
            {!loadingList && capsules.length > 0 && (
              <div>
                <div className="p-6 border-b bg-gray-50">
                  <h3 className="font-semibold text-gray-900">Available Capsules ({capsules.length})</h3>
                  <p className="text-sm text-gray-600 mt-1">Unlock capsules to access their contents</p>
                </div>
                <div className="divide-y max-h-[600px] overflow-y-auto">
                  {capsules.map((capsule) => {
                    const metadata = capsule.metadata as CapsuleMetadata
                    return (
                      <div key={capsule.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                        <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold text-gray-900 text-lg">{capsule.title || 'Untitled'}</h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  capsule.status === 'locked' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                }`}>
                                  {capsule.status}
                                </span>
                              </div>
                              {capsule.notes && (
                                <p className="text-sm text-gray-600 mb-3">{capsule.notes}</p>
                              )}
                              <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                                <span>📅 {new Date(capsule.created_at).toLocaleDateString()}</span>
                                <span>🕐 {new Date(capsule.created_at).toLocaleTimeString()}</span>
                              </div>
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs text-gray-500">ID:</span>
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700">{capsule.id}</code>
                                <CopyButton text={capsule.id} label="Copy" className="text-xs" />
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                              <button
                                onClick={() => handleToggleLock(capsule.id, capsule.status)}
                                disabled={unlockingId === capsule.id}
                                className={`${capsule.status === 'locked' ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'} text-white rounded-lg font-semibold disabled:bg-gray-400 whitespace-nowrap min-w-28 px-4 py-2.5`}
                              >
                                {capsule.status === 'locked' ? '🔓 Unlock' : '🔒 Lock'}
                              </button>
                              <button
                                onClick={() => handleDownload(capsule.id)}
                                disabled={unlockingId === capsule.id || capsule.status === 'locked'}
                                className="bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 whitespace-nowrap min-w-36 px-4 py-2.5"
                              >
                                💾 Download
                              </button>
                              <button
                                onClick={() => handleDelete(capsule.id)}
                                className="bg-red-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-red-700 whitespace-nowrap"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>

                          {metadata && capsule.status === 'locked' && (
                            <UnlockConditions policy={metadata.unlock_policy} />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
        </div>
      </main>
    </div>
  )
}

export default function UnlockCapsule() {
  return (
    <ProtectedRoute>
      <UnlockCapsuleContent />
    </ProtectedRoute>
  )
}
