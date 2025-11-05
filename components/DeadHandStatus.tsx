'use client'

import { useState, useEffect } from 'react'
import { getDeadHandStatus, resetDeadHandDate, disableDeadHand, type DeadHandStatus } from '@/lib/dead-hand'
import { TrustCircleDB } from '@/lib/supabase'
import { useIdentity } from '@/lib/hooks'
import { toBase64 } from '@trustcircle/core'

interface DeadHandStatusProps {
  capsuleId: string
}

export function DeadHandStatus({ capsuleId }: DeadHandStatusProps) {
  const { identity } = useIdentity()
  const [status, setStatus] = useState<DeadHandStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [resetting, setResetting] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [showReset, setShowReset] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)

  useEffect(() => {
    if (identity) {
      loadStatus()
    }
  }, [capsuleId, identity])

  const loadStatus = async () => {
    if (!identity) return
    try {
      const db = new TrustCircleDB(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const userPubkey = `ed25519:${toBase64(identity.ed25519.publicKey)}`
      const deadHandStatus = await getDeadHandStatus(db, capsuleId, userPubkey)
      setStatus(deadHandStatus)
    } catch (error) {
      console.error('Failed to load dead hand status:', error)
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    if (!newDate || !identity) return
    setResetting(true)
    setResetError(null)
    try {
      const db = new TrustCircleDB(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const userPubkey = `ed25519:${toBase64(identity.ed25519.publicKey)}`
      await resetDeadHandDate(db, capsuleId, new Date(newDate), userPubkey)
      setShowReset(false)
      setNewDate('')
      setLoading(true)
      await loadStatus()
    } catch (error) {
      setResetError((error as Error).message)
    } finally {
      setResetting(false)
    }
  }

  const handleDisable = async () => {
    if (!confirm('Disable dead hand for this capsule?') || !identity) return
    setResetting(true)
    try {
      const db = new TrustCircleDB(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const userPubkey = `ed25519:${toBase64(identity.ed25519.publicKey)}`
      await disableDeadHand(db, capsuleId, userPubkey)
      setLoading(true)
      await loadStatus()
    } catch (error) {
      alert('Failed to disable: ' + (error as Error).message)
    } finally {
      setResetting(false)
    }
  }

  if (loading) return <div className="text-sm text-gray-500">Loading dead hand status...</div>
  if (!status?.enabled) return null

  const getStatusClasses = () => {
    if (status.status === 'triggered') return {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900',
      badge: 'bg-red-100 text-red-800',
      content: 'text-red-800'
    }
    if (status.status === 'grace_period') return {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-900',
      badge: 'bg-orange-100 text-orange-800',
      content: 'text-orange-800'
    }
    if (status.status === 'warning_sent') return {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-900',
      badge: 'bg-yellow-100 text-yellow-800',
      content: 'text-yellow-800'
    }
    return {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      badge: 'bg-blue-100 text-blue-800',
      content: 'text-blue-800'
    }
  }

  const getStatusText = () => {
    if (status.status === 'triggered') return 'Triggered - Auto Unlocked'
    if (status.status === 'grace_period') return 'Grace Period Active'
    if (status.status === 'warning_sent') return 'Warning Sent'
    return 'Active'
  }

  const classes = getStatusClasses()

  return (
    <div className={`${classes.bg} border ${classes.border} rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className={`font-semibold ${classes.text}`}>Dead Hand Status</h4>
        <span className={`text-xs px-2 py-1 ${classes.badge} rounded`}>
          {getStatusText()}
        </span>
      </div>
      
      <div className={`text-sm ${classes.content} space-y-1`}>
        <p>Trigger Date: {status.triggerDate?.toLocaleString()}</p>
        <p>Warning Date: {status.warningDate?.toLocaleString()}</p>
        {status.daysUntilTrigger !== null && (
          <p className="font-semibold">
            {status.daysUntilTrigger > 0 
              ? `${status.daysUntilTrigger} days until trigger`
              : `${Math.abs(status.daysUntilTrigger)} days past trigger`
            }
          </p>
        )}
      </div>

      {status.status !== 'triggered' && (
        <div className="mt-4 space-y-2">
          {!showReset ? (
            <div className="flex gap-2">
              <button
                onClick={() => setShowReset(true)}
                className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded text-sm font-medium"
              >
                Reset Date
              </button>
              <button
                onClick={handleDisable}
                disabled={resetting}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm font-medium"
              >
                Disable
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="datetime-local"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  disabled={resetting || !newDate}
                  className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded text-sm font-medium disabled:bg-gray-300"
                >
                  {resetting ? 'Resetting...' : 'Confirm Reset'}
                </button>
                <button
                  onClick={() => { setShowReset(false); setResetError(null); }}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
              {resetError && (
                <div className="bg-red-50 border border-red-200 rounded p-2 text-sm text-red-800">
                  {resetError}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
