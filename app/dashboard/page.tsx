'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useIdentity } from '@/lib/hooks'
import { getClient, getStorageUsage } from '@/lib/client'
import { toBase64 } from '@trustcircle/core'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { CopyButton } from '@/components/CopyButton'
import { UnlockConditions } from '@/components/UnlockConditions'
import { DeadHandStatus } from '@/components/DeadHandStatus'
import type { CapsuleMetadata } from '@/lib/capsule'

function DashboardContent() {
  const { identity, loading: identityLoading } = useIdentity()
  const [tab, setTab] = useState<'created' | 'sent' | 'vaults'>('created')
  const [capsules, setCapsules] = useState<any[]>([])
  const [vaults, setVaults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'locked' | 'unlocked'>('all')
  const [storage, setStorage] = useState<{ capsules: number; vaults: number; limit: number } | null>(null)

  useEffect(() => {
    const loadStorage = () => {
      import('@/lib/client').then(({ getStorageUsage, getVaultStorageUsage }) => {
        return Promise.all([getStorageUsage(), getVaultStorageUsage()])
      }).then(([capsulesData, vaultsData]) => {
        setStorage({
          capsules: capsulesData.used,
          vaults: vaultsData.used,
          limit: capsulesData.limit
        })
      }).catch((err) => {
        console.error('[DASHBOARD] Storage error:', err)
      })
    }
    loadStorage()
    const interval = setInterval(loadStorage, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!identity) {
      setLoading(false)
      return
    }

    const loadData = async () => {
      setLoading(true)
      setError(null)

      try {
        const client = getClient()
        const publicKey = `ed25519:${toBase64(identity.ed25519.publicKey)}`

        if (tab === 'vaults') {
          const data = await client['db'].listVaults(publicKey)
          setVaults(data)
        } else {
          const data = await client['db'].listCapsules(
            tab === 'created'
              ? { creator: publicKey }
              : { approver: publicKey }
          )
          setCapsules(data.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()))
        }

        import('@/lib/client').then(({ getStorageUsage, getVaultStorageUsage }) => {
          return Promise.all([getStorageUsage(), getVaultStorageUsage()])
        }).then(([capsulesData, vaultsData]) => {
          setStorage({
            capsules: capsulesData.used,
            vaults: vaultsData.used,
            limit: capsulesData.limit
          })
        }).catch((err) => {
          console.error('[DASHBOARD] Storage refresh error:', err)
        })
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [identity, tab])

  const filteredCapsules = capsules.filter(capsule => {
    const matchesSearch = !search || 
      capsule.title?.toLowerCase().includes(search.toLowerCase()) ||
      capsule.notes?.toLowerCase().includes(search.toLowerCase()) ||
      capsule.id.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || capsule.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredVaults = vaults.filter(vault => {
    return !search ||
      vault.title?.toLowerCase().includes(search.toLowerCase()) ||
      vault.document_type?.toLowerCase().includes(search.toLowerCase()) ||
      vault.issuer?.toLowerCase().includes(search.toLowerCase()) ||
      vault.id.toLowerCase().includes(search.toLowerCase())
  })

  if (identityLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!identity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Identity Required</h3>
          <p className="text-gray-600 mb-6">Generate an identity to view your capsules</p>
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
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Link href="/" className="text-xl sm:text-2xl font-bold text-indigo-600 flex items-center gap-2">
              <span>🔐</span> <span className="hidden sm:inline">TrustCircle</span><span className="sm:hidden">TC</span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3 text-sm">
              {storage && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 shadow-sm">
                  <div className="text-xs font-medium text-gray-700 flex items-center gap-1 sm:gap-2">
                    <span title={`${storage.capsules} bytes (may take 5-10 min to update after deletion)`}>🔒 {(storage.capsules / 1024 / 1024).toFixed(2)}/{(storage.limit / 1024 / 1024).toFixed(0)}MB</span>
                    <span className="text-gray-400">|</span>
                    <span title={`${storage.vaults} bytes (may take 5-10 min to update after deletion)`}>🔐 {(storage.vaults / 1024 / 1024).toFixed(2)}/{(storage.limit / 1024 / 1024).toFixed(0)}MB</span>
                  </div>
                </div>
              )}
              <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm">← Back</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-6 sm:py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Dashboard</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b overflow-x-auto">
            <div className="flex min-w-max">
              <button onClick={() => setTab('created')} className={`px-3 sm:px-6 py-3 sm:py-4 font-medium text-sm sm:text-base whitespace-nowrap ${tab === 'created' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600'}`}>
                🔒 Capsules Created by Me
              </button>
              <button onClick={() => setTab('sent')} className={`px-3 sm:px-6 py-3 sm:py-4 font-medium text-sm sm:text-base whitespace-nowrap ${tab === 'sent' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600'}`}>
                📨 Capsules Sent to Me
              </button>
              <button onClick={() => setTab('vaults')} className={`px-3 sm:px-6 py-3 sm:py-4 font-medium text-sm sm:text-base whitespace-nowrap ${tab === 'vaults' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-gray-600'}`}>
                🔐 Vaults
              </button>
            </div>
          </div>

          <div className="p-6">
            {tab === 'vaults' ? (
              <>
                {vaults.length > 0 && (
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Search by title, type, issuer, or ID"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                )}
                {loading && (
                  <div className="text-center py-8 text-gray-500">Loading vaults...</div>
                )}
                {!loading && vaults.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No vaults found</p>
                    <Link href="/create-vault" className="text-amber-600 hover:text-amber-800">
                      Create your first vault →
                    </Link>
                  </div>
                )}
                {!loading && filteredVaults.length === 0 && vaults.length > 0 && (
                  <div className="text-center py-8 text-gray-500">No vaults match your search</div>
                )}
                {!loading && filteredVaults.length > 0 && (
                  <div className="space-y-4">
                    {filteredVaults.map((vault) => (
                      <div key={vault.id} className="border-2 border-amber-200 rounded-lg p-3 sm:p-4 hover:bg-amber-50 bg-gradient-to-br from-amber-50 to-yellow-50">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-amber-600">🔐</span>
                                <h3 className="font-semibold text-gray-900 text-lg">{vault.title}</h3>
                              </div>
                              {vault.notes && (
                                <p className="text-sm text-gray-600 mt-1">{vault.notes}</p>
                              )}
                              <div className="mt-2 space-y-1">
                                <p className="text-sm text-gray-700">
                                  <span className="font-medium">Type:</span> {vault.document_type}
                                </p>
                                <p className="text-sm text-gray-700">
                                  <span className="font-medium">Issuer:</span> {vault.issuer}
                                </p>
                                {vault.document_id && (
                                  <p className="text-sm text-gray-700">
                                    <span className="font-medium">ID:</span> {vault.document_id}
                                  </p>
                                )}
                                <p className="text-sm text-gray-500">
                                  Created: {new Date(vault.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <span className="px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-800 font-medium">
                              Vault
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <code className="flex-1 text-xs bg-white px-2 py-1 rounded font-mono text-gray-700 border border-amber-200">
                              {vault.id}
                            </code>
                            <CopyButton text={vault.id} label="Copy ID" />
                          </div>

                          <div className="flex gap-2">
                            <Link
                              href={`/vault/${vault.id}`}
                              className="bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm"
                            >
                              Open Vault
                            </Link>
                            <button
                              onClick={async () => {
                                if (!confirm('Delete this vault? This cannot be undone.')) return
                                try {
                                  const client = getClient()
                                  await client['db'].deleteVault(vault.id)
                                  setVaults(vaults.filter(v => v.id !== vault.id))
                                } catch (err) {
                                  setError((err as Error).message)
                                }
                              }}
                              className="bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
            {capsules.length > 0 && (
              <div className="mb-4 space-y-3">
                <input
                  type="text"
                  placeholder="Search by title, notes, or ID"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <div className="flex gap-2">
                  <button onClick={() => setStatusFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === 'all' ? 'bg-gradient-to-r from-indigo-400 to-purple-400 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    All
                  </button>
                  <button onClick={() => setStatusFilter('locked')} className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === 'locked' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    Locked
                  </button>
                  <button onClick={() => setStatusFilter('unlocked')} className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === 'unlocked' ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    Unlocked
                  </button>
                </div>
              </div>
            )}
            {loading && (
              <div className="text-center py-8 text-gray-500">Loading capsules...</div>
            )}
            {!loading && capsules.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No capsules found</p>
                {tab === 'created' && (
                  <Link href="/create" className="text-indigo-600 hover:text-indigo-800">
                    Create your first capsule →
                  </Link>
                )}
              </div>
            )}
            {!loading && filteredCapsules.length === 0 && capsules.length > 0 && (
              <div className="text-center py-8 text-gray-500">No capsules match your filters</div>
            )}
            {!loading && filteredCapsules.length > 0 && (
              <div className="space-y-4">
                {filteredCapsules.map((capsule) => {
                  const metadata = capsule.metadata as CapsuleMetadata
                  const now = new Date()
                  const triggerDate = capsule.dead_hand_trigger_date ? new Date(capsule.dead_hand_trigger_date) : null
                  const daysUntilTrigger = triggerDate ? Math.ceil((triggerDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null
                  const inCriticalPeriod = daysUntilTrigger !== null && daysUntilTrigger >= -2 && daysUntilTrigger <= 2
                  
                  return (
                    <div key={capsule.id} className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 text-lg">{capsule.title || 'Untitled'}</h3>
                              {inCriticalPeriod && (
                                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded animate-pulse">
                                  ⚠️ DEAD HAND ALERT
                                </span>
                              )}
                            </div>
                            {capsule.notes && (
                              <p className="text-sm text-gray-600 mt-1">{capsule.notes}</p>
                            )}
                            <p className="text-sm text-gray-500 mt-2">
                              Created: {new Date(capsule.created_at).toLocaleDateString()}
                            </p>
                            {capsule.expires_at && (
                              <p className={`text-sm mt-1 ${
                                new Date(capsule.expires_at) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                                  ? 'text-red-600 font-medium'
                                  : 'text-gray-500'
                              }`}>
                                Expires: {new Date(capsule.expires_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm ${capsule.status === 'locked' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                            {capsule.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700">
                            {capsule.id}
                          </code>
                          <CopyButton text={capsule.id} label="Copy ID" />
                          <a
                            href={`mailto:?subject=Secure Capsule Shared with You&body=I've shared a secure capsule with you on TrustCircle.%0D%0A%0D%0ACapsule ID: ${capsule.id}%0D%0A%0D%0ATo access it:%0D%0A1. Log in to TrustCircle%0D%0A2. Go to the Unlock page%0D%0A3. Find the capsule in your list%0D%0A4. Unlock it when conditions are met%0D%0A%0D%0AYou'll need your TrustCircle identity to unlock this capsule.`}
                            className="px-3 py-1 bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white text-xs rounded font-medium shadow-sm"
                            title="Send capsule ID via email with instructions"
                          >
                            📧 Share
                          </a>
                        </div>

                        {tab === 'sent' && metadata && (
                          <UnlockConditions policy={metadata.unlock_policy} />
                        )}

                        {tab === 'created' && (
                          <DeadHandStatus capsuleId={capsule.id} />
                        )}

                        <div className="flex gap-2">
                          <Link
                            href={`/capsule/${capsule.id}`}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                          >
                            View Details →
                          </Link>
                          {tab === 'sent' && capsule.status === 'locked' && (
                            <Link
                              href={`/unlock?id=${capsule.id}`}
                              className="text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              Unlock →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
