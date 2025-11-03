'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getConfig, saveConfig, AppConfig } from '@/lib/config'

export default function AdminPage() {
  const [config, setConfig] = useState<AppConfig>({})
  const [saved, setSaved] = useState(false)
  const [showKeys, setShowKeys] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = getConfig()
    setConfig({
      pinataJWT: stored.pinataJWT || process.env.NEXT_PUBLIC_PINATA_JWT || '',
      supabaseUrl: stored.supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey: stored.supabaseAnonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    })
  }, [])

  const handleSave = () => {
    saveConfig(config)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleReset = () => {
    if (confirm('Reset to environment variables?')) {
      localStorage.removeItem('trustcircle-config')
      setConfig({})
      window.location.reload()
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
            TrustCircle
          </Link>
          <Link href="/" className="text-gray-600 hover:text-gray-900">← Back</Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Configuration</h2>
          <p className="text-gray-600 mb-8">Update API keys and configuration settings</p>

          {saved && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 font-medium">Configuration saved successfully</p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pinata JWT Token
              </label>
              <input
                type={showKeys ? 'text' : 'password'}
                value={config.pinataJWT || ''}
                onChange={(e) => setConfig({ ...config, pinataJWT: e.target.value })}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supabase URL
              </label>
              <input
                type="text"
                value={config.supabaseUrl || ''}
                onChange={(e) => setConfig({ ...config, supabaseUrl: e.target.value })}
                placeholder="https://xxxxx.supabase.co"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supabase Anon Key
              </label>
              <input
                type={showKeys ? 'text' : 'password'}
                value={config.supabaseAnonKey || ''}
                onChange={(e) => setConfig({ ...config, supabaseAnonKey: e.target.value })}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showKeys"
                checked={showKeys}
                onChange={(e) => setShowKeys(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="showKeys" className="text-sm text-gray-700">
                Show API keys
              </label>
            </div>

            <div className="flex gap-4 pt-8">
              <button
                onClick={handleSave}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700"
              >
                Save Configuration
              </button>
              <button
                onClick={handleReset}
                className="px-6 bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Settings stored in browser localStorage. Env variables override if set.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
