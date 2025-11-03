'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getStorageUsage } from '@/lib/client'

export default function Home() {
  const [storage, setStorage] = useState<{ used: number; limit: number; percentage: number } | null>(null)

  useEffect(() => {
    getStorageUsage().then(setStorage).catch(() => setStorage(null))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
            <span>🔐</span> TrustCircle
          </h1>
          {storage && (
            <div className="text-sm text-gray-600">
              Storage: {(storage.used / 1024 / 1024).toFixed(2)} MB / {(storage.limit / 1024 / 1024).toFixed(0)} MB
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Privacy-First Secure Data Sharing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Lock files with time and location conditions. Only the designated approver can unlock them.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Link href="/create" className="block p-8 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow">
            <div className="text-indigo-600 text-4xl mb-4">🔒</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Create Capsule</h3>
            <p className="text-gray-600">
              Encrypt files and set unlock conditions for a designated approver
            </p>
          </Link>

          <Link href="/unlock" className="block p-8 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow">
            <div className="text-green-600 text-4xl mb-4">🔓</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Unlock Capsule</h3>
            <p className="text-gray-600">
              Access capsules when conditions are met and you have the key
            </p>
          </Link>

          <Link href="/dashboard" className="block p-8 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow">
            <div className="text-purple-600 text-4xl mb-4">📊</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Dashboard</h3>
            <p className="text-gray-600">
              View your created and received capsules
            </p>
          </Link>

          <Link href="/identity" className="block p-8 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow">
            <div className="text-orange-600 text-4xl mb-4">🔑</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Identity</h3>
            <p className="text-gray-600">
              Manage your cryptographic keys and identity
            </p>
          </Link>
        </div>

        <div className="mt-16 max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">How It Works</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4 bg-white p-6 rounded-lg">
              <div className="text-2xl">1️⃣</div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Client-Side Encryption</h4>
                <p className="text-gray-600">All encryption happens in your browser before upload</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white p-6 rounded-lg">
              <div className="text-2xl">2️⃣</div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Set Conditions</h4>
                <p className="text-gray-600">Define date/time and location requirements for unlock</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white p-6 rounded-lg">
              <div className="text-2xl">3️⃣</div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Secure Storage</h4>
                <p className="text-gray-600">Encrypted data stored on IPFS, metadata on Supabase</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
