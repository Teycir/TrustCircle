import { PolicyError } from '@/lib/policy'

export function ErrorMessage({ error }: { error: Error | string | null | undefined }) {
  if (!error) return null
  
  const message = typeof error === 'string' ? error : error.message || 'Unknown error'
  
  const getUserFriendlyMessage = (err: Error | string): string => {
    const msg = typeof err === 'string' ? err : (err.message || 'Unknown error')
    
    if (err instanceof PolicyError) {
      return msg
    }
    
    if (msg.includes('fetch')) return 'Network error. Please check your connection.'
    if (msg.includes('IPFS') || msg.includes('Pinata')) return 'Storage service unavailable. Please try again.'
    if (msg.includes('Supabase') || msg.includes('database')) return 'Database error. Please try again later.'
    if (msg.includes('permission')) return 'Permission denied. Please check your browser settings.'
    if (msg.includes('Geolocation')) return 'Location access required. Please enable location services.'
    
    return msg
  }
  
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <span className="text-red-600 text-xl">⚠️</span>
        <div className="flex-1">
          <p className="text-red-800 font-medium">{getUserFriendlyMessage(error)}</p>
          <details className="mt-2">
            <summary className="text-sm text-red-600 cursor-pointer">Technical details</summary>
            <p className="text-xs text-red-700 mt-1 font-mono">{message}</p>
          </details>
        </div>
      </div>
    </div>
  )
}
