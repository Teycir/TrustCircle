'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useIdentity } from '@/lib/hooks'
import { getClient } from '@/lib/client'
import { toBase64 } from '@/lib/crypto'

export default function Dashboard() {
  const { identity, loading: identityLoading } = useIdentity()
  const [tab, setTab] = useState<'created' | 'received'>('created')
  const [capsules, setCapsules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!identity) return
    
    const loadCapsules = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const client = getClient()
        const publicKey = `ed25519:${toBase64(identity.ed25519.publicKey)}`
        
        const data = await client['db'].listCapsules(
          tab === 'created' 
            ? { creator: publicKey }
            : { approver: publicKey }
        )
        
        setCapsules(data)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }
    
    loadCapsules()
  }, [identity, tab])

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

      <main className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b">
            <div className="flex">
              <button onClick={() => setTab('created')} className={`px-6 py-4 font-medium ${tab === 'created' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600'}`}>
                Created by Me
              </button>
              <button onClick={() => setTab('received')} className={`px-6 py-4 font-medium ${tab === 'received' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600'}`}>
                Received
              </button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading capsules...</div>
            ) : capsules.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No capsules found</p>
                {tab === 'created' && (
                  <Link href="/create" className="text-indigo-600 hover:text-indigo-800">
                    Create your first capsule →
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {capsules.map((capsule) => (
                  <div key={capsule.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{capsule.title || 'Untitled'}</h3>
                        <p className="text-sm text-gray-500 font-mono">{capsule.id}</p>
                        <p className="text-sm text-gray-500">
                          Created: {new Date(capsule.created_at).toLocaleDateString()}
                        </p>
                        {capsule.notes && (
                          <p className="text-sm text-gray-600 mt-1">{capsule.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${capsule.status === 'locked' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                          {capsule.status}
                        </span>
                        {tab === 'received' && capsule.status === 'locked' && (
                          <Link href={`/unlock?id=${capsule.id}`} className="text-indigo-600 hover:text-indigo-800">
                            Unlock →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
