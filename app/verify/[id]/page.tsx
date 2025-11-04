'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { CopyButton } from '@/components/CopyButton'

export default function VerifyVault() {
  const params = useParams()
  const vaultId = params.id as string
  const [vault, setVault] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadVault = async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { data, error: fetchError } = await supabase
          .from('vaults')
          .select('id, title, document_type, issuer, document_id, payload_cid, file_name, file_size, created_at')
          .eq('id', vaultId)
          .single()

        if (fetchError) throw fetchError
        if (!data) throw new Error('Vault not found')

        setVault(data)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    loadVault()
  }, [vaultId])

  const verificationUrl = typeof window !== 'undefined' ? window.location.href : ''

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center">
        <div className="text-gray-600">Loading verification...</div>
      </div>
    )
  }

  if (error || !vault) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md border-2 border-red-200">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-xl font-semibold text-red-600 mb-4">Verification Failed</h3>
            <p className="text-gray-600 mb-6">{error || 'Vault not found'}</p>
            <Link href="/" className="block w-full bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-white py-3 rounded-lg text-center font-semibold shadow-sm">
              Go to TrustCircle
            </Link>
          </div>
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
          <Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-6 sm:py-12">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-10 space-y-6 border-4 border-amber-300">
          <div className="text-center">
            <div className="text-7xl mb-4">✅</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Document Verified</h2>
            <p className="text-gray-600">This document exists in TrustCircle vault with cryptographic proof</p>
          </div>

          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-bold text-amber-900 mb-4">Document Information</h3>
            <div className="space-y-3">
              <div className="border-b border-amber-200 pb-3">
                <span className="text-sm font-medium text-gray-600 uppercase">Title</span>
                <p className="text-lg font-semibold text-gray-900 mt-1">{vault.title}</p>
              </div>
              <div className="border-b border-amber-200 pb-3">
                <span className="text-sm font-medium text-gray-600 uppercase">Document Type</span>
                <p className="text-lg text-gray-900 mt-1">{vault.document_type}</p>
              </div>
              <div className="border-b border-amber-200 pb-3">
                <span className="text-sm font-medium text-gray-600 uppercase">Issuer</span>
                <p className="text-lg text-gray-900 mt-1">{vault.issuer}</p>
              </div>
              {vault.document_id && (
                <div className="border-b border-amber-200 pb-3">
                  <span className="text-sm font-medium text-gray-600 uppercase">Document ID</span>
                  <p className="text-lg text-gray-900 mt-1">{vault.document_id}</p>
                </div>
              )}
              <div className="border-b border-amber-200 pb-3">
                <span className="text-sm font-medium text-gray-600 uppercase">Upload Timestamp</span>
                <p className="text-lg text-gray-900 mt-1">{new Date(vault.created_at).toLocaleString()}</p>
              </div>
              {vault.file_size && (
                <div className="pb-3">
                  <span className="text-sm font-medium text-gray-600 uppercase">File Size</span>
                  <p className="text-lg text-gray-900 mt-1">{(vault.file_size / 1024).toFixed(2)} KB</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-300 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Cryptographic Proof</h3>
            <div className="space-y-3">
              <div>
                <span className="text-xs font-medium text-gray-600 uppercase">IPFS Content Hash</span>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 text-xs bg-white p-3 rounded font-mono text-gray-700 break-all border">{vault.payload_cid}</code>
                  <CopyButton text={vault.payload_cid} label="Copy" />
                </div>
                <p className="text-xs text-gray-500 mt-1">This hash proves the document exists and has not been altered</p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-600 uppercase">Vault ID</span>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 text-xs bg-white p-3 rounded font-mono text-gray-700 break-all border">{vault.id}</code>
                  <CopyButton text={vault.id} label="Copy" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">🔒 Privacy Notice</h4>
            <p className="text-xs text-blue-800">
              This verification page only shows document metadata. The actual document content is encrypted and can only be accessed by the vault owner with their private key.
            </p>
          </div>

          <div className="border-t pt-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Share Verification Link</h4>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={verificationUrl}
                readOnly
                className="flex-1 px-4 py-2 border rounded-lg bg-gray-50 text-sm font-mono"
              />
              <CopyButton text={verificationUrl} label="Copy Link" />
            </div>
          </div>

          <div className="text-center pt-4">
            <Link href="/" className="inline-block bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-white px-8 py-3 rounded-lg font-semibold shadow-sm">
              Create Your Own Vault
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
