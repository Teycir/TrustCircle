'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/useAuth'

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

  const handleSignOut = () => {
    signOut()
  }

  return (
    <div className="min-h-screen gradient-bg">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-indigo-600 flex items-center gap-2">
              <span>🔐</span> <span className="hidden sm:inline">TrustCircle</span><span className="sm:hidden">TC</span>
            </h1>
            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
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
            Secure file storage and sharing.
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
                  <p>Vaults and Capsules serve different purposes for secure file management:</p>
                  <div className="space-y-2">
                    <p><strong>Capsules - Time Locked Sharing:</strong></p>
                    <p>• Time and location based unlocking conditions</p>
                    <p>• Shared with designated approver using their public key</p>
                    <p>• Perfect for scheduled secure file delivery</p>
                    <p>• Dead Hand protocol for automatic unlock if inactive</p>
                    <p>• Temporary secure sharing with unlock countdown</p>
                  </div>
                  <div className="space-y-2">
                    <p><strong>Vaults - Professional Document Storage:</strong></p>
                    <p>• Always accessible by you no time locks or waiting</p>
                    <p>• Store professional documents like certifications, contracts, diplomas</p>
                    <p>• Generate public verification links to prove document exists</p>
                    <p>• Document metadata: type, issuer, document ID, timestamp</p>
                    <p>• Separate IPFS storage isolated from capsules</p>
                    <p>• Cryptographic proof with IPFS CID and creation timestamp</p>
                  </div>
                  <p className="pt-2">Use Capsules for sharing files with unlock conditions. Use Vaults for permanent encrypted storage with public verification.</p>
                </div>
              }
            />
            <FAQItem
              question="How do Vault verification links work?"
              answer={
                <div className="space-y-3">
                  <p>Verification links let you prove a document exists without revealing its contents:</p>
                  <div className="space-y-2">
                    <p><strong>What Verification Shows:</strong></p>
                    <p>• Document type and category</p>
                    <p>• Issuer organization or person</p>
                    <p>• Document ID or reference number</p>
                    <p>• Creation timestamp proving when uploaded</p>
                    <p>• IPFS CID file hash for integrity verification</p>
                    <p>• File size and name</p>
                    <p>• Your public key for authenticity</p>
                  </div>
                  <div className="space-y-2">
                    <p><strong>What Verification Does NOT Show:</strong></p>
                    <p>• Encrypted document content</p>
                    <p>• Decryption keys</p>
                    <p>• File preview or download</p>
                    <p>• Any sensitive information from the document</p>
                  </div>
                  <div className="space-y-2">
                    <p><strong>How to Use:</strong></p>
                    <p>• Open your vault from Dashboard</p>
                    <p>• Click Generate Verification Link button</p>
                    <p>• Copy the public URL and share it</p>
                    <p>• Anyone with the link can verify but not access content</p>
                  </div>
                  <p className="pt-2">Perfect for proving credentials to employers, verifying contracts, or demonstrating document authenticity.</p>
                </div>
              }
            />
            <FAQItem
              question="When should I use a Vault instead of a Capsule?"
              answer={
                <div className="space-y-3">
                  <p>Choose based on your use case:</p>
                  <div className="space-y-2">
                    <p><strong>Use Vaults For:</strong></p>
                    <p>• Professional certifications and credentials you need to access anytime</p>
                    <p>• Legal contracts requiring proof of existence and timestamp</p>
                    <p>• Academic diplomas and transcripts for verification</p>
                    <p>• Professional licenses that need public verification</p>
                    <p>• Important business documents you access frequently</p>
                    <p>• Documents where you need to prove authenticity to third parties</p>
                    <p>• Long term storage without unlock conditions</p>
                  </div>
                  <div className="space-y-2">
                    <p><strong>Use Capsules For:</strong></p>
                    <p>• Sharing files that unlock at specific future date and time</p>
                    <p>• Location restricted access requiring GPS verification</p>
                    <p>• Dead Hand scenarios for emergency access if inactive</p>
                    <p>• Temporary secure file sharing with another person</p>
                    <p>• Time sensitive information delivery</p>
                    <p>• Files that need approval from designated recipient</p>
                  </div>
                  <p className="pt-2">Vaults are for your own permanent storage with verification. Capsules are for conditional sharing with others.</p>
                </div>
              }
            />
            <FAQItem
              question="How do I create and manage Vaults?"
              answer={
                <div className="space-y-3">
                  <p>Creating and managing vaults is simple:</p>
                  <div className="space-y-2">
                    <p><strong>Creating a Vault:</strong></p>
                    <p>• Click Create Vault from home page</p>
                    <p>• Upload your document file</p>
                    <p>• Enter title and optional description</p>
                    <p>• Select document type: Certification, Contract, Diploma, License, etc</p>
                    <p>• Enter issuer name: organization or person who issued document</p>
                    <p>• Add document ID or reference number if applicable</p>
                    <p>• Click Create Vault to encrypt and store</p>
                    <p>• File encrypted client side before upload to IPFS</p>
                  </div>
                  <div className="space-y-2">
                    <p><strong>Accessing Your Vaults:</strong></p>
                    <p>• Go to Dashboard and click Vaults tab</p>
                    <p>• See all your vaults with metadata</p>
                    <p>• Click any vault to view and download</p>
                    <p>• No waiting period, instant access anytime</p>
                    <p>• Decrypt happens in your browser with your keys</p>
                  </div>
                  <div className="space-y-2">
                    <p><strong>Verification:</strong></p>
                    <p>• Open vault and click Generate Verification Link</p>
                    <p>• Share link with employers, institutions, or anyone</p>
                    <p>• They can verify document exists without seeing content</p>
                  </div>
                  <p className="pt-2">Vaults use separate IPFS storage from capsules for better organization and quota management.</p>
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
              question="What is the difference between Vault ID and CID?"
              answer={
                <div className="space-y-3">
                  <p>Vaults use two different identifiers that serve distinct purposes:</p>
                  <div className="space-y-2">
                    <p><strong>Vault ID (UUID):</strong></p>
                    <p>• Database identifier like 83353b20-5ca7-43ac-b0e6-5f7433526216</p>
                    <p>• Used to query vault metadata from Supabase database</p>
                    <p>• Mutable - can be deleted from database</p>
                    <p>• Links to application features like dashboard and access control</p>
                    <p>• Needed to access vault through TrustCircle website</p>
                  </div>
                  <div className="space-y-2">
                    <p><strong>CID (Content Identifier):</strong></p>
                    <p>• IPFS hash like QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG</p>
                    <p>• Cryptographic hash of the encrypted file content</p>
                    <p>• Immutable - content cannot be changed</p>
                    <p>• Permanent - exists on IPFS forever</p>
                    <p>• Provides cryptographic proof of file integrity</p>
                  </div>
                  <div className="space-y-2">
                    <p><strong>Why Both?</strong></p>
                    <p>• Vault ID: Application layer for user management and features</p>
                    <p>• CID: Storage layer for immutable content and verification</p>
                    <p>• Separation: Database can be rebuilt from CIDs</p>
                    <p>• CIDs provide eternal proof independent of any database or website</p>
                  </div>
                  <div className="space-y-2">
                    <p><strong>Verification CID:</strong></p>
                    <p>• Each vault also has a verification CID</p>
                    <p>• Points to JSON file on IPFS with document metadata</p>
                    <p>• Contains: type, issuer, timestamp, vault CID, creator key</p>
                    <p>• Eternal proof that survives even if TrustCircle website disappears</p>
                    <p>• Share verification CID to prove document existence forever</p>
                  </div>
                  <p className="pt-2">The verification link uses the verification CID to provide permanent, immutable proof of your document on IPFS.</p>
                </div>
              }
            />
            <FAQItem
              question="What are the two CIDs in my vault?"
              answer={
                <div className="space-y-3">
                  <p>Each vault has two different IPFS Content Identifiers serving different purposes:</p>
                  <div className="space-y-2">
                    <p><strong>Encrypted File CID:</strong></p>
                    <p>• Your actual document stored encrypted on IPFS</p>
                    <p>• Private and secure - only you can decrypt with your keys</p>
                    <p>• Cannot be accessed or viewed by anyone else</p>
                    <p>• Permanent storage of your encrypted file</p>
                  </div>
                  <div className="space-y-2">
                    <p><strong>Verification CID:</strong></p>
                    <p>• Public metadata JSON file on IPFS</p>
                    <p>• Contains document info: type, issuer, timestamp</p>
                    <p>• Does NOT contain your actual document or decryption keys</p>
                    <p>• Shareable proof that document exists</p>
                    <p>• Anyone can view metadata but not the document content</p>
                  </div>
                  <p className="pt-2">This separation lets you prove a document exists without revealing what's inside.</p>
                </div>
              }
            />
            <FAQItem
              question="What is an IPFS gateway and why are there multiple options?"
              answer={
                <div className="space-y-3">
                  <p>IPFS gateways provide web browser access to IPFS content:</p>
                  <div className="space-y-2">
                    <p><strong>What is a Gateway?</strong></p>
                    <p>• Web servers that let you access IPFS through HTTP</p>
                    <p>• Think of them as different doors to the same building</p>
                    <p>• The CID is the permanent address</p>
                    <p>• Gateways are just different ways to access it</p>
                  </div>
                  <div className="space-y-2">
                    <p><strong>Available Gateways:</strong></p>
                    <p>• gateway.pinata.cloud - Pinata's gateway</p>
                    <p>• ipfs.io - Public IPFS gateway</p>
                    <p>• cloudflare-ipfs.com - Cloudflare's gateway</p>
                    <p>• Any other public or private IPFS gateway</p>
                  </div>
                  <div className="space-y-2">
                    <p><strong>Why Multiple Gateways?</strong></p>
                    <p>• No single company controls IPFS</p>
                    <p>• If one gateway is down, use another</p>
                    <p>• True decentralization and independence</p>
                    <p>• Your proof remains accessible even if one service fails</p>
                  </div>
                  <p className="pt-2">Use the CID with any gateway: gateway.example.com/ipfs/[YOUR_CID]</p>
                </div>
              }
            />
            <FAQItem
              question="Is TrustCircle dependent on Pinata?"
              answer={
                <div className="space-y-3">
                  <p>TrustCircle uploads to Pinata but your data is not locked to them:</p>
                  <div className="space-y-2">
                    <p><strong>What Pinata Provides:</strong></p>
                    <p>• Reliable IPFS pinning service for uploads</p>
                    <p>• Fast gateway for accessing content</p>
                    <p>• Storage infrastructure</p>
                  </div>
                  <div className="space-y-2">
                    <p><strong>Your Independence:</strong></p>
                    <p>• Data stored on IPFS, not just Pinata</p>
                    <p>• CIDs work with any IPFS gateway</p>
                    <p>• Can access via ipfs.io, Cloudflare, or any gateway</p>
                    <p>• Verification proof survives even if Pinata disappears</p>
                    <p>• You can run your own IPFS node to access the data</p>
                  </div>
                  <p className="pt-2">The CID is the permanent identifier - gateways are just access methods.</p>
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

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-gray-600">
            Made by <a href="https://teycirbensoltane.tn" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 font-medium">Teycir Ben Soltane</a>
          </p>
        </div>
      </footer>
    </div>
  )
}
