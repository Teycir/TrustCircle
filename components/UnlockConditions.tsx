'use client'

import { useState, useEffect } from 'react'
import type { UnlockPolicy } from '@/lib/policy'

interface UnlockConditionsProps {
  policy: UnlockPolicy
}

export function UnlockConditions({ policy }: UnlockConditionsProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('')
  const [isUnlockable, setIsUnlockable] = useState(false)

  useEffect(() => {
    const dateCondition = policy.conditions.find(c => c.type === 'DATE_AFTER')
    if (!dateCondition) return

    const updateCountdown = () => {
      const unlockDate = new Date(dateCondition.value)
      const now = new Date()
      const diff = unlockDate.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeRemaining('Available now')
        setIsUnlockable(true)
        return
      }

      const days = Math.floor(diff / 86400000)
      const hours = Math.floor(diff % 86400000 / 3600000)
      const minutes = Math.floor(diff % 3600000 / 60000)
      const seconds = Math.floor(diff % 60000 / 1000)

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m`)
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`)
      } else {
        setTimeRemaining(`${minutes}m ${seconds}s`)
      }
      setIsUnlockable(false)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [policy])

  const dateCondition = policy.conditions.find(c => c.type === 'DATE_AFTER')
  const locationCondition = policy.conditions.find(c => c.type === 'LOCATION_HASH_EQ')

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
      <h4 className="font-semibold text-blue-900 text-sm">Unlock Requirements</h4>
      
      {dateCondition && (
        <div className="flex items-start gap-2">
          <span className={isUnlockable ? '✅' : '⏰'}></span>
          <div className="flex-1">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Time:</span>{' '}
              {new Date(dateCondition.value).toLocaleString()}
            </p>
            {!isUnlockable && timeRemaining && (
              <p className="text-xs text-blue-600 mt-1">
                Unlocks in: <span className="font-mono font-semibold">{timeRemaining}</span>
              </p>
            )}
            {isUnlockable && (
              <p className="text-xs text-green-600 mt-1 font-semibold">Ready to unlock</p>
            )}
          </div>
        </div>
      )}

      {locationCondition && (
        <div className="flex items-start gap-2">
          <span>📍</span>
          <div className="flex-1">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Location:</span> Required
            </p>
            <p className="text-xs text-blue-600 mt-1">
              You must be at the specified location to unlock
            </p>
          </div>
        </div>
      )}

      {policy.logic === 'ALL' && policy.conditions.length > 1 && (
        <p className="text-xs text-blue-700 italic">All conditions must be met</p>
      )}
      {policy.logic === 'ANY' && policy.conditions.length > 1 && (
        <p className="text-xs text-blue-700 italic">Any condition can be met</p>
      )}
    </div>
  )
}
