import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { signIn, signUp, signOut, getCurrentUser, savePublicKeys } from './auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    savePublicKeys,
    isAuthenticated: !!user
  }
}
