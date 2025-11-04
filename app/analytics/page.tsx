'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useIdentity } from '@/lib/hooks'
import { getClient } from '@/lib/client'
import { toBase64 } from '@/lib/crypto'
import { ProtectedRoute } from '@/components/ProtectedRoute'

function AnalyticsContent() {
  const { identity } = useIdentity()
  const [stats, setStats] = useState({
    totalCreated: 0,
    totalReceived: 0,
    totalUnlocked: 0,
    avgUnlockTime: 0,
    expiringSoon: 0,
    deadHandEnabled: 0,
    deadHandActive: 0,
    deadHandTriggered: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!identity) return

    const loadStats = async () => {
      try {
        const client = getClient()
        const publicKey = `ed25519:${toBase64(identity.ed25519.publicKey)}`
        const analytics = await client['db'].getAnalytics(publicKey)
        setStats(analytics)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [identity])

  if (!identity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Identity Required</h3>
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

      <main className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Analytics</h2>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-4xl mb-2">📤</div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalCreated}</h3>
              <p className="text-gray-600">Capsules Created</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-4xl mb-2">📥</div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalReceived}</h3>
              <p className="text-gray-600">Capsules Received</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-4xl mb-2">🔓</div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalUnlocked}</h3>
              <p className="text-gray-600">Capsules Unlocked</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-4xl mb-2">⏱️</div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.avgUnlockTime.toFixed(1)}</h3>
              <p className="text-gray-600">Avg Days to Unlock</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-4xl mb-2">⚠️</div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.expiringSoon}</h3>
              <p className="text-gray-600">Expiring Soon</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-4xl mb-2">📊</div>
              <h3 className="text-2xl font-bold text-gray-900">
                {stats.totalCreated > 0 ? ((stats.totalUnlocked / stats.totalCreated) * 100).toFixed(0) : 0}%
              </h3>
              <p className="text-gray-600">Unlock Rate</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-4xl mb-2">🤚</div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.deadHandEnabled}</h3>
              <p className="text-gray-600">Dead Hand Enabled</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-4xl mb-2">⏳</div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.deadHandActive}</h3>
              <p className="text-gray-600">Dead Hand Active</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-4xl mb-2">💥</div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.deadHandTriggered}</h3>
              <p className="text-gray-600">Dead Hand Triggered</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default function Analytics() {
  return (
    <ProtectedRoute>
      <AnalyticsContent />
    </ProtectedRoute>
  )
}
