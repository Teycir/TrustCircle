'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { getStorageUsage } from '@/lib/client'
import { useAuth } from '@/lib/useAuth'

function FAQItem({ question, answer }: Readonly<{ question: string; answer: string | React.ReactNode }>) {
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
  const [mounted, setMounted] = useState(false)
  const { user, signOut } = useAuth()

  useEffect(() => {
    setMounted(true)
    getStorageUsage().then(setStorage).catch(() => setStorage(null))
  }, [])

  const handleSignOut = async () => {
    await signOut()
  }

  if (!mounted) {
    return null
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
              question="Complete Workflow Example"
              answer={
                <div className="space-y-3">
                  <p>Alice wants to send a confidential document to Bob that can only be opened on December 1st:</p>
                  <div className="space-y-2">
                    <p><strong>1.</strong> Bob goes to Identity page and copies his public key</p>
                    <p><strong>2.</strong> Bob shares his public key with Alice</p>
                    <p><strong>3.</strong> Alice goes to Create Capsule page</p>
                    <p><strong>4.</strong> Alice uploads her document and sets unlock date to December 1st</p>
                    <p><strong>5.</strong> Alice pastes Bob's public key in the Approver field</p>
                    <p><strong>6.</strong> Alice creates the capsule and copies the Capsule ID</p>
                    <p><strong>7.</strong> Alice shares the Capsule ID with Bob</p>
                    <p><strong>8.</strong> Bob sees the capsule in his Dashboard under Received</p>
                    <p><strong>9.</strong> On December 1st, Bob clicks Unlock and downloads the decrypted document</p>
                  </div>
                  <p className="pt-2">The file was encrypted in Alice's browser and only Bob can decrypt it with his private key.</p>
                </div>
              }
            />
            <FAQItem
              question="How does TrustCircle work?"
              answer={
                <div className="space-y-3">
                  <p>TrustCircle uses end-to-end encryption to secure your files:</p>
                  <div className="space-y-2">
                    <p><strong>1.</strong> Your browser generates unique cryptographic keys locally</p>
                    <p><strong>2.</strong> When you create a capsule, your file is encrypted in your browser using AES-256-GCM</p>
                    <p><strong>3.</strong> You set unlock conditions like date, time, and optional location requirements</p>
                    <p><strong>4.</strong> You specify an approver by their public key who can decrypt the file</p>
                    <p><strong>5.</strong> The encrypted file is uploaded to IPFS for decentralized storage</p>
                    <p><strong>6.</strong> Metadata and unlock conditions are stored in Supabase database</p>
                    <p><strong>7.</strong> When conditions are met, the approver can unlock the capsule</p>
                    <p><strong>8.</strong> The file is decrypted in the approver's browser using their private key</p>
                  </div>
                  <p className="pt-2">Your encryption keys never leave your browser and the server never sees your unencrypted files.</p>
                </div>
              }
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
              answer={
                <div className="space-y-3">
                  <p>To securely send a capsule to someone:</p>
                  <div className="space-y-2">
                    <p><strong>1.</strong> Ask the recipient to visit TrustCircle and go to their Identity page</p>
                    <p><strong>2.</strong> The recipient clicks Copy Public Key button to copy their public key</p>
                    <p><strong>3.</strong> The recipient shares their public key with you via email, message, or any channel</p>
                    <p><strong>4.</strong> You go to Create Capsule page and upload your file</p>
                    <p><strong>5.</strong> You set the unlock date and time when the capsule can be opened</p>
                    <p><strong>6.</strong> You paste the recipient's public key in the Approver Public Key field</p>
                    <p><strong>7.</strong> You click Create Capsule and wait for encryption to complete</p>
                    <p><strong>8.</strong> You copy the generated Capsule ID from the success message</p>
                    <p><strong>9.</strong> You share the Capsule ID with the recipient</p>
                    <p><strong>10.</strong> The recipient sees the capsule in their Dashboard under Received tab</p>
                    <p><strong>11.</strong> When unlock conditions are met, the recipient can unlock and download the file</p>
                  </div>
                  <p className="pt-2">Only the recipient with the matching private key can decrypt and access the file.</p>
                </div>
              }
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
            <FAQItem
              question="How does time-based unlocking work?"
              answer={
                <div className="space-y-3">
                  <p>Time-based unlocking ensures capsules can only be opened after a specific date and time:</p>
                  <div className="space-y-2">
                    <p><strong>1.</strong> When creating a capsule, you set an unlock date and time</p>
                    <p><strong>2.</strong> The unlock condition is stored with the capsule metadata</p>
                    <p><strong>3.</strong> Before the unlock time, the Unlock button is disabled</p>
                    <p><strong>4.</strong> The system checks the current time against the unlock time</p>
                    <p><strong>5.</strong> Once the unlock time is reached, the approver can decrypt the capsule</p>
                    <p><strong>6.</strong> The time check happens in real-time when the approver attempts to unlock</p>
                  </div>
                  <p className="pt-2">This is perfect for scheduled releases, time-sensitive documents, or future delivery of information.</p>
                </div>
              }
            />
            <FAQItem
              question="How does location-based unlocking work?"
              answer={
                <div className="space-y-3">
                  <p>Location-based unlocking restricts capsule access to specific geographic locations:</p>
                  <div className="space-y-2">
                    <p><strong>1.</strong> When creating a capsule, you can optionally set a location requirement</p>
                    <p><strong>2.</strong> You specify coordinates and a radius in meters</p>
                    <p><strong>3.</strong> When the approver tries to unlock, their browser requests location permission</p>
                    <p><strong>4.</strong> The system calculates the distance between their location and the required location</p>
                    <p><strong>5.</strong> If they are within the specified radius, unlocking is allowed</p>
                    <p><strong>6.</strong> If they are outside the radius, unlocking is denied with an error message</p>
                  </div>
                  <p className="pt-2">This is useful for location-specific documents, event access, or geo-restricted content.</p>
                </div>
              }
            />
            <FAQItem
              question="What can I do in the Dashboard?"
              answer={
                <div className="space-y-3">
                  <p>The Dashboard is your central hub for managing all capsules:</p>
                  <div className="space-y-2">
                    <p><strong>1.</strong> View all capsules you created in the Created tab</p>
                    <p><strong>2.</strong> View all capsules sent to you in the Received tab</p>
                    <p><strong>3.</strong> See capsule status: locked, unlocked, or expired</p>
                    <p><strong>4.</strong> Check unlock conditions and expiration dates</p>
                    <p><strong>5.</strong> Copy Capsule IDs to share with others</p>
                    <p><strong>6.</strong> Delete capsules you no longer need</p>
                    <p><strong>7.</strong> Monitor which capsules are approaching expiration</p>
                    <p><strong>8.</strong> Track when capsules were created and unlocked</p>
                  </div>
                  <p className="pt-2">The Dashboard provides a complete overview of your secure file sharing activity.</p>
                </div>
              }
            />
            <FAQItem
              question="How do I manage my Identity and keys?"
              answer={
                <div className="space-y-3">
                  <p>The Identity page lets you manage your cryptographic keys:</p>
                  <div className="space-y-2">
                    <p><strong>1.</strong> Generate new keys if you don't have any yet</p>
                    <p><strong>2.</strong> View your public key that others need to send you capsules</p>
                    <p><strong>3.</strong> Copy your public key with one click to share it</p>
                    <p><strong>4.</strong> Export your keys as a JSON file for backup</p>
                    <p><strong>5.</strong> Import previously exported keys to restore your identity</p>
                    <p><strong>6.</strong> Use the same identity across multiple devices by importing keys</p>
                    <p><strong>7.</strong> Regenerate keys if needed, but this will make old capsules inaccessible</p>
                  </div>
                  <p className="pt-2">Always backup your keys! Without them, you cannot decrypt capsules sent to you.</p>
                </div>
              }
            />
            <FAQItem
              question="What insights does Analytics provide?"
              answer={
                <div className="space-y-3">
                  <p>Analytics gives you detailed statistics about your capsule usage:</p>
                  <div className="space-y-2">
                    <p><strong>1.</strong> Total number of capsules you have created</p>
                    <p><strong>2.</strong> Total number of capsules you have received</p>
                    <p><strong>3.</strong> Number of capsules that have been unlocked</p>
                    <p><strong>4.</strong> Average time between creation and unlocking</p>
                    <p><strong>5.</strong> Number of capsules expiring soon</p>
                    <p><strong>6.</strong> Overall unlock rate percentage</p>
                    <p><strong>7.</strong> Visual cards showing each metric clearly</p>
                  </div>
                  <p className="pt-2">Use Analytics to understand your usage patterns and manage your capsules effectively.</p>
                </div>
              }
            />
            <FAQItem
              question="What is the Admin page for?"
              answer={
                <div className="space-y-3">
                  <p>The Admin page is for configuring API keys and system settings:</p>
                  <div className="space-y-2">
                    <p><strong>1.</strong> Configure Pinata JWT token for IPFS storage</p>
                    <p><strong>2.</strong> Set Supabase URL for database connection</p>
                    <p><strong>3.</strong> Configure Supabase Anon Key for authentication</p>
                    <p><strong>4.</strong> Settings are stored in browser localStorage</p>
                    <p><strong>5.</strong> Environment variables override localStorage settings</p>
                    <p><strong>6.</strong> Toggle visibility of API keys for security</p>
                    <p><strong>7.</strong> Reset to default environment variables if needed</p>
                  </div>
                  <p className="pt-2">Note: Regular users don't need to configure this. It's only for deployment administrators.</p>
                </div>
              }
            />
          </div>
        </div>
      </main>
    </div>
  )
}
