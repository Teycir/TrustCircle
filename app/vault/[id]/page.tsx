'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useIdentity } from '@/lib/hooks'
import { getClient, downloadFile } from '@/lib/client'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { CopyButton } from '@/components/CopyButton'
import { aesGcmDecrypt, fromBase64 } from '@/lib/crypto'
import { decompress } from '@/lib/compression'

function VaultViewContent() {
  const params = useParams()
  const vaultId = params.id as string
  const { identity } = useIdentity()
  const [vault, setVault] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [decrypting, setDecrypting] = useState(false)

  useEffect(() => {
    if (!identity) return

    const loadVault = async () => {
      try {
        const client = getClient()
        const data = await client['db'].getVault(vaultId)
        setVault(data)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    loadVault()
  }, [identity, vaultId])

  const handleDownload = async () => {
    if (!vault || !identity) return

    setDecrypting(true)
    setError(null)

    try {
      const client = getClient()
      const cipherArchive = await client['pinata'].getBytes(vault.payload_cid)
      const cmk = fromBase64(vault.metadata.encrypted_cmk)
      const compressed = await aesGcmDecrypt(cmk, cipherArchive)
      const archive = decompress(compressed)

      downloadFile(archive, vault.file_name || vault.title)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setDecrypting(false)
    }
  }

  if (!identity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Identity Required</h3>
          <p className="text-gray-600 mb-6">You need an identity to access vaults</p>
          <Link href="/identity" className="block w-full bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-white py-3 rounded-lg text-center font-semibold shadow-sm">
            Go to Identity
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center">
        <div className="text-gray-600">Loading vault...</div>
      </div>
    )
  }

  if (error && !vault) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md">
          <h3 className="text-xl font-semibold text-red-600 mb-4">Error</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/dashboard" className="block w-full bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-white py-3 rounded-lg text-center font-semibold shadow-sm">
            Back to Dashboard
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
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">← Back to Dashboard</Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-6 sm:py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Vault Details</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-8 space-y-6 border-2 border-amber-200">
          <div className="text-center">
            <div className="text-6xl mb-4">🔐</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{vault.title}</h3>
            {vault.notes && (
              <p className="text-gray-600">{vault.notes}</p>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-amber-900 mb-3">Document Information</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Document Type:</span>
                <span className="text-sm text-gray-900">{vault.document_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Issuer:</span>
                <span className="text-sm text-gray-900">{vault.issuer}</span>
              </div>
              {vault.document_id && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Document ID:</span>
                  <span className="text-sm text-gray-900">{vault.document_id}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Created:</span>
                <span className="text-sm text-gray-900">{new Date(vault.created_at).toLocaleString()}</span>
              </div>
              {vault.file_size && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">File Size:</span>
                  <span className="text-sm text-gray-900">{(vault.file_size / 1024).toFixed(2)} KB</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Cryptographic Proof</h4>
            <div className="space-y-2">
              <div>
                <span className="text-xs font-medium text-gray-600">IPFS CID:</span>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 text-xs bg-white p-2 rounded font-mono text-gray-700 break-all">{vault.payload_cid}</code>
                  <CopyButton text={vault.payload_cid} label="Copy" />
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-600">Vault ID:</span>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 text-xs bg-white p-2 rounded font-mono text-gray-700 break-all">{vault.id}</code>
                  <CopyButton text={vault.id} label="Copy" />
                </div>
              </div>
            </div>
          </div>

          {vault.metadata?.verification_cid && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-3">🌐 Eternal Verification Link</h4>
              <p className="text-sm text-blue-800 mb-3">This verification proof is stored permanently on IPFS and will exist forever, independent of any website.</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-white p-2 rounded font-mono text-gray-700 break-all">
                  {`https://gateway.pinata.cloud/ipfs/${vault.metadata.verification_cid}`}
                </code>
                <CopyButton text={`https://gateway.pinata.cloud/ipfs/${vault.metadata.verification_cid}`} label="Copy" />
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownload}
              disabled={decrypting}
              className="flex-1 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-white py-3 rounded-lg font-semibold disabled:bg-gray-300 disabled:from-gray-300 disabled:to-gray-300 shadow-sm"
            >
              {decrypting ? 'Decrypting...' : '📥 Download Document'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function VaultView() {
  return (
    <ProtectedRoute>
      <VaultViewContent />
    </ProtectedRoute>
  )
}
