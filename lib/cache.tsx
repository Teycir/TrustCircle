'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface CacheContextType {
  get: (key: string) => unknown
  set: (key: string, value: unknown, ttl?: number) => void
  invalidate: (key: string) => void
  clear: () => void
}

const CacheContext = createContext<CacheContextType | null>(null)

export function CacheProvider({ children }: { children: ReactNode }) {
  const [cache, setCache] = useState<Map<string, { value: unknown; expires: number }>>(new Map())

  const get = useCallback((key: string) => {
    const item = cache.get(key)
    if (!item) return null
    if (Date.now() > item.expires) {
      setCache(prev => {
        const next = new Map(prev)
        next.delete(key)
        return next
      })
      return null
    }
    return item.value
  }, [cache])

  const set = useCallback((key: string, value: unknown, ttl = 60000) => {
    setCache(prev => new Map(prev).set(key, {
      value,
      expires: Date.now() + ttl
    }))
  }, [])

  const invalidate = useCallback((key: string) => {
    setCache(prev => {
      const next = new Map(prev)
      next.delete(key)
      return next
    })
  }, [])

  const clear = useCallback(() => {
    setCache(new Map())
  }, [])

  return (
    <CacheContext.Provider value={{ get, set, invalidate, clear }}>
      {children}
    </CacheContext.Provider>
  )
}

export function useCache() {
  const context = useContext(CacheContext)
  if (!context) throw new Error('useCache must be used within CacheProvider')
  return context
}
