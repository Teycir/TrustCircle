'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useIdentity } from '@/lib/hooks'
import { getVaultClient, fileToUint8Array } from '@/lib/client'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { CopyButton } from '@/components/CopyButton'

function CreateVaultContent() {
  const { identity } = useIdentity()
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [documentType, setDocumentType] = useState('')
  const [issuer, setIssuer] = useState('')
  const [documentId, setDocumentId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [storageWarning, setStorageWarning] = useState<{ level: 'warning' | 'critical' | null; message: string }>({ level: null, message: '' })
  
  useState(() => {
    import('@/lib/client').then(({ getVaultStorageUsage }) => getVaultStorageUsage())
      .then(({ used, limit }) => {
        const percentage = (used / limit) * 100
        if (percentage >= 95) {
          setStorageWarning({ level: 'critical', message: `Vault storage at ${percentage.toFixed(1)}% (${(used / 1024 / 1024).toFixed(1)}MB/${(limit / 1024 / 1024).toFixed(0)}MB). Uploads blocked.` })
        } else if (percentage >= 80) {
          setStorageWarning({ level: 'warning', message: `Vault storage at ${percentage.toFixed(1)}% (${(used / 1024 / 1024).toFixed(1)}MB/${(limit / 1024 / 1024).toFixed(0)}MB). Consider deleting old vaults.` })
        }
      })
      .catch(() => {})
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identity || !file) return

    setLoading(true)
    setError(null)

    try {
      const vaultClient = getVaultClient()
      const fileData = await fileToUint8Array(file)

      const vaultId = await vaultClient.createVault({
        files: fileData,
        creatorKeys: identity,
        title,
        notes,
        documentType,
        issuer,
        documentId,
        fileName: file.name,
        fileSize: file.size
      })

      setResult(vaultId)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (!identity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Identity Required</h3>
          <p className="text-gray-600 mb-6">You need to generate an identity first</p>
          <Link href="/identity" className="block w-full bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-white py-3 rounded-lg text-center font-semibold shadow-sm">
            Go to Identity
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-amber-600 flex items-center gap-2">
            <span>🔐</span> TrustCircle
          </Link>
          <Link href="/" className="text-gray-600 hover:text-gray-900">← Back</Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-6 sm:py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Create Vault</h2>

        {storageWarning.level && (
          <div className={`border rounded-lg p-4 mb-6 ${
            storageWarning.level === 'critical' ? 'bg-red-50 border-red-500' : 'bg-yellow-50 border-yellow-500'
          }`}>
            <p className={`font-semibold flex items-center gap-2 ${
              storageWarning.level === 'critical' ? 'text-red-900' : 'text-yellow-900'
            }`}>
              {storageWarning.level === 'critical' ? '🚨' : '⚠️'} {storageWarning.message}
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {result ? (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-8 space-y-6 border-2 border-amber-200">
            <div className="text-center">
              <div className="text-6xl mb-4">🔐</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Vault Created Successfully!</h3>
              <p className="text-gray-600">Your document has been encrypted and stored securely</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-amber-900 mb-3">Vault ID</h4>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white p-3 rounded text-sm font-mono break-all">{result}</code>
                <CopyButton text={result} label="Copy ID" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`/vault/${result}`}
                className="flex-1 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-white py-3 rounded-lg text-center font-semibold shadow-sm"
              >
                View Vault
              </Link>
              <button
                onClick={() => setResult(null)}
                className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white py-3 rounded-lg font-semibold shadow-sm"
              >
                Create Another
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-4 sm:p-8 space-y-6 border-2 border-amber-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Document File</label>
              <div className="relative">
                <input id="file" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" required />
                <label htmlFor="file" className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-amber-300 rounded-lg cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors">
                  <span className="text-sm text-gray-600">
                    {file ? `📄 ${file.name}` : '📁 Click to select file'}
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="Professional Certification" required />
            </div>

            <div>
              <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
              <select id="documentType" value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required>
                <option value="">Select type</option>
                <option value="Certification">Certification</option>
                <option value="Contract">Contract</option>
                <option value="Diploma">Diploma</option>
                <option value="Transcript">Transcript</option>
                <option value="License">License</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="issuer" className="block text-sm font-medium text-gray-700 mb-2">Issuer</label>
              <input id="issuer" type="text" value={issuer} onChange={(e) => setIssuer(e.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="Organization or person who issued this document" required />
            </div>

            <div>
              <label htmlFor="documentId" className="block text-sm font-medium text-gray-700 mb-2">Document ID (Optional)</label>
              <input id="documentId" type="text" value={documentId} onChange={(e) => setDocumentId(e.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="Reference number or ID" />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
              <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-4 py-2 border rounded-lg" rows={3} placeholder="Additional information about this document" />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-900 font-semibold mb-2">🔐 Vault Features:</p>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• Always accessible by you no time locks</li>
                <li>• Cryptographic proof of existence</li>
                <li>• Generate public verification links</li>
                <li>• Secure encrypted storage on IPFS</li>
              </ul>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-white py-3 rounded-lg font-semibold disabled:bg-gray-300 disabled:from-gray-300 disabled:to-gray-300 shadow-sm">
              {loading ? 'Creating Vault...' : 'Create Vault'}
            </button>
          </form>
        )}
      </main>
    </div>
  )
}

export default function CreateVault() {
  return (
    <ProtectedRoute>
      <CreateVaultContent />
    </ProtectedRoute>
  )
}
