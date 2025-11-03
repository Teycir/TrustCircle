'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useIdentity } from '@/lib/hooks'
import { getClient, downloadFile } from '@/lib/client'
import { toBase64 } from '@/lib/crypto'
import { CopyButton } from '@/components/CopyButton'
import { UnlockConditions } from '@/components/UnlockConditions'
import type { CapsuleMetadata } from '@/lib/capsule'

export default function CapsulePage() {
  const params = useParams()
  const capsuleId = params.id as string
  const { identity } = useIdentity()
  const [capsule, setCapsule] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [unlocking, setUnlocking] = useState(false)
  const [unlockedData, setUnlockedData] = useState<{ data: Uint8Array; filename: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isApprover, setIsApprover] = useState(false)

  useEffect(() => {
    const loadCapsule = async () => {
      try {
        const client = getClient()
        const data = await client['db'].getCapsule(capsuleId)
        setCapsule(data)

        if (identity) {
          const userPubkey = `ed25519:${toBase64(identity.ed25519.publicKey)}`
          const metadata = data.metadata as CapsuleMetadata
          setIsApprover(metadata.approver_pubkey === userPubkey)
        }
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    loadCapsule()
  }, [capsuleId, identity])

  const handleUnlock = async () => {
    if (!identity) return

    setUnlocking(true)
    setError(null)

    try {
      const client = getClient()
      const result = await client.unlockCapsule({
        capsuleId,
        approverKeys: identity,
        context: { now: new Date() }
      })

      await client['db'].updateStatus(capsuleId, 'unlocked')
      setUnlockedData(result)
      setCapsule((prev: any) => ({ ...prev, status: 'unlocked' }))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setUnlocking(false)
    }
  }

  const handleDownload = () => {
    if (unlockedData) {
      downloadFile(unlockedData.data, unlockedData.filename)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-gray-600">Loading capsule...</div>
      </div>
    )
  }

  if (error && !capsule) {
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
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Capsule Not Found</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800 font-medium">
              Go to Dashboard →
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const metadata = capsule.metadata as CapsuleMetadata
  const shareUrl = `${globalThis.location?.origin || ''}/capsule/${capsuleId}`

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
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">📦</span>
              <h1 className="text-3xl font-bold">{capsule.title || 'Untitled Capsule'}</h1>
            </div>
            <p className="text-indigo-100">Secure time capsule</p>
          </div>

          <div className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {capsule.notes && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                <p className="text-gray-700">{capsule.notes}</p>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    capsule.status === 'locked' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {capsule.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Created:</span>
                  <span className="text-gray-900">{new Date(capsule.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Capsule ID</h3>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm font-mono text-gray-700 break-all">
                  {capsuleId}
                </code>
                <CopyButton text={capsuleId} label="Copy ID" />
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Share Capsule</h3>
              <div className="flex gap-2">
                <CopyButton text={capsuleId} label="Copy ID" className="flex-1" />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(capsuleId);
                    const mailtoLink = `mailto:?subject=${encodeURIComponent('TrustCircle Capsule ID Shared')}&body=${encodeURIComponent(`I've shared a secure capsule with you on TrustCircle.\n\nCapsule ID: ${capsuleId}\n\nTo access:\n1. Visit ${shareUrl}\n2. Or go to TrustCircle and use the Capsule ID above\n3. Unlock when conditions are met`)}`;
                    const link = document.createElement('a');
                    link.href = mailtoLink;
                    link.click();
                  }}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 font-medium"
                >
                  📧 Share
                </button>
              </div>
            </div>

            <UnlockConditions policy={metadata.unlock_policy} />

            {!identity && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm mb-3">
                  You need to be logged in to unlock this capsule
                </p>
                <Link
                  href="/login"
                  className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700"
                >
                  Log In
                </Link>
              </div>
            )}

            {identity && !isApprover && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  You are not the designated approver for this capsule
                </p>
              </div>
            )}

            {identity && isApprover && (
              <div className="flex gap-3">
                {unlockedData ? (
                  <button
                    onClick={handleDownload}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
                  >
                    💾 Download
                  </button>
                ) : capsule.status === 'unlocked' ? (
                  <div className="flex-1 bg-green-100 text-green-800 py-3 rounded-lg font-semibold text-center">
                    ✓ Already Unlocked
                  </div>
                ) : (
                  <button
                    onClick={handleUnlock}
                    disabled={unlocking}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400"
                  >
                    {unlocking ? '🔓 Unlocking...' : '🔓 Unlock Capsule'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
