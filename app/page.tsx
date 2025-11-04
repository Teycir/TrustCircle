'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/useAuth'
import { useIdentity } from '@/lib/hooks'
import { toBase64 } from '@/lib/crypto'

function FAQItem({ question, answer }: Readonly<{ question: string; answer: string | React.ReactNode }>) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 px-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <span className="font-semibold text-gray-900 pr-8 pointer-events-none">{question}</span>
        <span className={`text-indigo-600 text-xl transition-transform pointer-events-none ${isOpen ? 'rotate-180' : ''}`}>
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
  const { user, signOut } = useAuth()
  const [storage, setStorage] = useState<{ capsules: number; vaults: number; limit: number } | null>(null)

  useEffect(() => {
    import('@/lib/client').then(({ getStorageUsage, getVaultStorageUsage }) => {
      return Promise.all([getStorageUsage(), getVaultStorageUsage()])
    }).then(([capsulesData, vaultsData]) => {
      setStorage({
        capsules: capsulesData.used,
        vaults: vaultsData.used,
        limit: capsulesData.limit
      })
    }).catch((err) => {
      console.error('[HOME] Storage load error:', err)
    })
  }, [])

  const handleSignOut = () => {
    signOut()
  }

  return (
    <div className="min-h-screen gradient-bg">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
              <span>🔐</span> TrustCircle
            </h1>
            
            {storage && (
              <div className="absolute left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg px-3 py-1.5 shadow-sm">
                  <div className="text-xs font-medium text-gray-700 flex items-center gap-2">
                    <span>🔒 {(storage.capsules / 1024 / 1024).toFixed(2)}/{(storage.limit / 1024 / 1024).toFixed(0)}MB</span>
                    <span className="text-gray-400">|</span>
                    <span>🔐 {(storage.vaults / 1024 / 1024).toFixed(2)}/{(storage.limit / 1024 / 1024).toFixed(0)}MB</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <span className="text-sm text-gray-600">{user.email}</span>
                  <button onClick={handleSignOut} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                    Sign Out
                  </button>
                </>
              ) : (
                <Link href="/login" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                  Sign In
                </Link>
              )}
            </div>
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
          <Link href="/create" className="card-hover block p-8 glass rounded-xl shadow-lg">
            <div className="text-indigo-600 text-4xl mb-4">🔒</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Create Capsule</h3>
            <p className="text-gray-600">
              Encrypt files and set unlock conditions for a designated approver
            </p>
          </Link>

          <Link href="/create-vault" className="card-hover block p-8 glass rounded-xl shadow-lg bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200">
            <div className="text-amber-600 text-4xl mb-4">🔐</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Create Vault</h3>
            <p className="text-gray-600">
              Store professional documents with cryptographic proof
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
              answer="Encrypted files are stored on IPFS via Pinata for decentralized storage. Capsules and Vaults use separate IPFS accounts for isolation. Metadata is stored on Supabase. Your encryption keys never leave your browser."
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
              question="What is a Vault and how is it different from a Capsule?"
              answer={
                <div className="space-y-3">
                  <p>Vaults are designed for professional document storage with cryptographic proof:</p>
                  <div className="space-y-2">
                    <p><strong>Capsules:</strong></p>
                    <p>• Time and location-based unlocking</p>
                    <p>• Designated approver required</p>
                    <p>• Perfect for secure file sharing</p>
                    <p>• Dead Hand protocol support</p>
                  </div>
                  <div className="space-y-2">
                    <p><strong>Vaults:</strong></p>
                    <p>• Permanent encrypted storage</p>
                    <p>• Self-access with your own keys</p>
                    <p>• Cryptographic proof of authenticity</p>
                    <p>• Separate IPFS storage for isolation</p>
                    <p>• Ideal for professional documents, certificates, contracts</p>
                  </div>
                  <p className="pt-2">Both use client-side encryption, but Vaults focus on long-term storage and proof of authenticity.</p>
                </div>
              }
            />
            <FAQItem
              question="What is Dead Hand and how does it work?"
              answer={
                <div className="space-y-3">
                  <p>Dead Hand is an automatic unlock feature that ensures your capsule reaches recipients even if you become inactive:</p>
                  <div className="space-y-2">
                    <p><strong>Setup:</strong></p>
                    <p>• When creating a capsule, enable Dead Hand and set a trigger date</p>
                    <p>• Trigger date must be between unlock date and expiry date</p>
                    <p>• No email configuration needed - uses in-app notifications</p>
                  </div>
                  <div className="space-y-2">
                    <p><strong>Warning Phase (2 days before trigger):</strong></p>
                    <p>• System creates a warning notification in your Dashboard</p>
                    <p>• Check Dashboard to see the warning</p>
                    <p>• You can postpone by resetting the trigger date</p>
                  </div>
                  <div className="space-y-2">
                    <p><strong>Grace Period (trigger date + 2 days):</strong></p>
                    <p>• If you don't reset, grace period begins</p>
                    <p>• You have 2 more days to reset the date</p>
                    <p>• Capsule still locked during grace period</p>
                  </div>
                  <div className="space-y-2">
                    <p><strong>Auto-Unlock (after grace period):</strong></p>
                    <p>• Capsule automatically unlocks</p>
                    <p>• Notification appears in Dashboard</p>
                    <p>• Capsule becomes available in Unlock page</p>
                    <p>• Status changes to triggered</p>
                  </div>
                  <div className="space-y-2">
                    <p><strong>Management:</strong></p>
                    <p>• View status in Dashboard under created capsules</p>
                    <p>• Reset trigger date anytime to postpone</p>
                    <p>• Disable Dead Hand completely if needed</p>
                  </div>
                  <p className="pt-2">Use cases: Estate planning, emergency access, business continuity, digital legacy.</p>
                </div>
              }
            />
            <FAQItem
              question="What are the storage limits?"
              answer={
                <div className="space-y-3">
                  <p>TrustCircle has storage limits to ensure fair usage across all users:</p>
                  <div className="space-y-2">
                    <p><strong>Personal Limits:</strong></p>
                    <p>• Each user has 250MB total storage</p>
                    <p>• Capsules: Up to 250MB</p>
                    <p>• Vaults: Up to 250MB</p>
                  </div>
                  <div className="space-y-2">
                    <p><strong>Global Limits:</strong></p>
                    <p>• Total Capsules across all users: 1GB</p>
                    <p>• Total Vaults across all users: 1GB</p>
                  </div>
                  <div className="space-y-2">
                    <p><strong>Monitoring:</strong></p>
                    <p>• Storage usage shown in navigation bar</p>
                    <p>• Warning appears at 80% personal usage</p>
                    <p>• Warning appears when global storage below 20%</p>
                  </div>
                  <div className="space-y-2">
                    <p><strong>Managing Storage:</strong></p>
                    <p>• Delete old or expired capsules to free space</p>
                    <p>• Storage calculated from encrypted file size</p>
                    <p>• Compression applied before encryption</p>
                  </div>
                  <p className="pt-2">Check the navigation bar to monitor your current usage and available storage.</p>
                </div>
              }
            />

          </div>
        </div>
      </main>
    </div>
  )
}
