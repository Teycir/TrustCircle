'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Dashboard() {
  const [tab, setTab] = useState<'created' | 'received'>('created')

  const mockCapsules = [
    { id: 'abc123', title: 'Tax Documents 2025', status: 'locked', created: '2025-01-15' },
    { id: 'def456', title: 'Contract Files', status: 'unlocked', created: '2025-01-10' },
  ]

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
            {mockCapsules.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No capsules found</p>
            ) : (
              <div className="space-y-4">
                {mockCapsules.map((capsule) => (
                  <div key={capsule.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{capsule.title}</h3>
                        <p className="text-sm text-gray-500">ID: {capsule.id}</p>
                        <p className="text-sm text-gray-500">Created: {capsule.created}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${capsule.status === 'locked' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                          {capsule.status}
                        </span>
                        <Link href={`/unlock?id=${capsule.id}`} className="text-indigo-600 hover:text-indigo-800">
                          View →
                        </Link>
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
