'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function UnlockCapsule() {
  const [capsuleId, setCapsuleId] = useState('')
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<string[] | null>(null)

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setFiles(['document.pdf', 'image.jpg'])
    } catch (error) {
      alert('Error: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-indigo-600">TrustCircle Lite</Link>
          <Link href="/" className="text-gray-600 hover:text-gray-900">← Back</Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Unlock Capsule</h2>

        {files ? (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Unlocked Files</h3>
            <ul className="space-y-2 mb-6">
              {files.map((file, i) => (
                <li key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-gray-700">{file}</span>
                  <button className="text-indigo-600 hover:text-indigo-800">Download</button>
                </li>
              ))}
            </ul>
            <button onClick={() => setFiles(null)} className="text-gray-600 hover:text-gray-900">
              Unlock Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleUnlock} className="bg-white rounded-lg shadow-md p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Capsule ID</label>
              <input type="text" value={capsuleId} onChange={(e) => setCapsuleId(e.target.value)} className="w-full px-4 py-2 border rounded-lg font-mono text-sm" placeholder="Enter capsule ID" required />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Unlock requires your private key and meeting policy conditions.
              </p>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400">
              {loading ? 'Unlocking...' : 'Unlock Capsule'}
            </button>
          </form>
        )}
      </main>
    </div>
  )
}
