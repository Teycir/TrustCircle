'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getStorageUsage } from '@/lib/client'
import { useAuth } from '@/lib/useAuth'

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 px-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900 pr-8">{question}</span>
        <span className={`text-indigo-600 text-xl transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="px-6 pb-5 text-gray-600 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  )
}

export default function Home() {
  const [storage, setStorage] = useState<{ used: number; limit: number; percentage: number } | null>(null)
  const { user, signOut } = useAuth()

  useEffect(() => {
    getStorageUsage().then(setStorage).catch(() => setStorage(null))
  }, [])

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen gradient-bg">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
            <span>🔐</span> TrustCircle
          </h1>
          <div className="flex items-center gap-4">
            {storage && (
              <div className="text-sm text-gray-600">
                Storage: {(storage.used / 1024 / 1024).toFixed(2)} MB / {(storage.limit / 1024 / 1024).toFixed(0)} MB
              </div>
            )}
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">{user.email}</span>
                <button onClick={handleSignOut} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                  Sign Out
                </button>
              </div>
            ) : (
              <Link href="/login" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                Sign In
              </Link>
            )}
          </div>
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

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Link href="/admin" className="card-hover block p-8 glass rounded-xl shadow-lg">
            <div className="text-red-600 text-4xl mb-4">⚙️</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Admin</h3>
            <p className="text-gray-600">
              Configure API keys and settings
            </p>
          </Link>

          <Link href="/create" className="card-hover block p-8 glass rounded-xl shadow-lg">
            <div className="text-indigo-600 text-4xl mb-4">🔒</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Create Capsule</h3>
            <p className="text-gray-600">
              Encrypt files and set unlock conditions for a designated approver
            </p>
          </Link>

          <Link href="/unlock" className="card-hover block p-8 glass rounded-xl shadow-lg">
            <div className="text-green-600 text-4xl mb-4">🔓</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Unlock Capsule</h3>
            <p className="text-gray-600">
              Access capsules when conditions are met and you have the key
            </p>
          </Link>

          <Link href="/dashboard" className="card-hover block p-8 glass rounded-xl shadow-lg">
            <div className="text-purple-600 text-4xl mb-4">📊</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Dashboard</h3>
            <p className="text-gray-600">
              View your created and received capsules
            </p>
          </Link>

          <Link href="/identity" className="card-hover block p-8 glass rounded-xl shadow-lg">
            <div className="text-orange-600 text-4xl mb-4">🔑</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Identity</h3>
            <p className="text-gray-600">
              Manage your cryptographic keys and identity
            </p>
          </Link>

          <Link href="/analytics" className="card-hover block p-8 glass rounded-xl shadow-lg">
            <div className="text-blue-600 text-4xl mb-4">📈</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Analytics</h3>
            <p className="text-gray-600">
              View usage statistics and insights
            </p>
          </Link>
        </div>

        <div className="mt-16 max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h3>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <FAQItem
              question="How does TrustCircle work?"
              answer="TrustCircle encrypts your files in your browser before uploading. You set unlock conditions like date and location, and only the designated approver can decrypt the files when conditions are met."
            />
            <FAQItem
              question="Is my data secure?"
              answer="Yes. All encryption happens client-side in your browser using AES-256-GCM. Your files are encrypted before leaving your device, and only you and the designated approver have the keys."
            />
            <FAQItem
              question="What are unlock conditions?"
              answer="You can set a date and time when the capsule becomes unlockable, and optionally require the approver to be within a certain distance of a specific location."
            />
            <FAQItem
              question="Where is my data stored?"
              answer="Encrypted files are stored on IPFS via Pinata for decentralized storage. Metadata is stored on Supabase. Your encryption keys never leave your browser."
            />
            <FAQItem
              question="What happens to my keys?"
              answer="Your cryptographic keys are stored locally in your browser using IndexedDB. You can export them for backup and import them on other devices."
            />
            <FAQItem
              question="How do I send a capsule to someone?"
              answer="To send a capsule: 1) Ask the recipient to share their public key from their Identity page. 2) Create a capsule and paste their public key in the Approver field. 3) Share the Capsule ID with them. They can then view it in their Dashboard under Sent to Me and unlock it when conditions are met."
            />
            <FAQItem
              question="Do I need an API key to use TrustCircle?"
              answer="No. As a user, you don't need any API keys. Key generation happens entirely in your browser. API keys are only needed by whoever deploys the website for Pinata and Supabase, not by end users."
            />
            <FAQItem
              question="Can I use TrustCircle on multiple devices?"
              answer="Yes. Each device will have its own identity by default. You can either use different identities on each device with their own public keys, or export your keys from one device and import them on another to use the same identity everywhere."
            />
            <FAQItem
              question="Can I share capsules with multiple people?"
              answer="Currently, each capsule has one creator and one approver. The approver is the person who can unlock and access the encrypted files."
            />
          </div>
        </div>
      </main>
    </div>
  )
}
