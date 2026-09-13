import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import supabase from '../lib/supabase'

type Ctx = { user: User | null; session: Session | null; loading: boolean; isAdmin: boolean; signOut: () => Promise<void> }
const AuthContext = createContext<Ctx>({ user: null, session: null, loading: true, isAdmin: false, signOut: async () => {} })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session); setUser(session?.user ?? null); setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session); setUser(session?.user ?? null); setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  const isAdmin = !!user // all authenticated users are treated as admins for this seed demo
  const signOut = async () => { await supabase.auth.signOut() }

  return <AuthContext.Provider value={{ user, session, loading, isAdmin, signOut }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
