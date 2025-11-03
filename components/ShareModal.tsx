'use client'

import { useState } from 'react'

interface ShareModalProps {
  capsuleId: string
  title: string
  onClose: () => void
}

export function ShareModal({ capsuleId, title, onClose }: ShareModalProps) {
  const [error, setError] = useState(false)
  const shareUrl = `${globalThis.location?.origin || ''}/capsule/${capsuleId}`

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`TrustCircle Capsule: ${title}`)
    const body = encodeURIComponent(`I've shared a secure capsule with you on TrustCircle.\n\nCapsule ID: ${capsuleId}\n\nAccess it here: ${shareUrl}`)
    const mailtoLink = `mailto:?subject=${subject}&body=${body}`
    
    const emailWindow = globalThis.open(mailtoLink, '_blank')
    if (!emailWindow) {
      setError(true)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Share Capsule</h3>
        
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 text-sm font-semibold mb-2">Unable to open email client</p>
            <p className="text-red-700 text-sm">Please copy the capsule ID below and share it manually.</p>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-900 text-sm font-semibold mb-2">How to share:</p>
            <ol className="text-blue-800 text-sm space-y-1">
              <li>1. Click "Open Email" to compose a message</li>
              <li>2. Add recipient's email address</li>
              <li>3. Send the email with the capsule ID</li>
            </ol>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Capsule ID</label>
          <code className="block bg-gray-100 p-3 rounded text-sm font-mono text-gray-700 break-all">
            {capsuleId}
          </code>
        </div>

        <div className="flex gap-3">
          {!error && (
            <button
              onClick={handleEmailShare}
              className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 font-medium"
            >
              📧 Open Email
            </button>
          )}
          <button
            onClick={() => {
              navigator.clipboard.writeText(capsuleId)
              alert('Capsule ID copied to clipboard!')
            }}
            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 font-medium"
          >
            Copy ID
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
