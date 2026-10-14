import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

export type User = { id: string; email: string }

type Ctx = {
  user: User | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
}
const AuthContext = createContext<Ctx>({ user: null, loading: true, isAdmin: false, signIn: async () => null, signOut: async () => {} })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // The session lives in an HttpOnly cookie — ask the server who we are
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => (r.ok ? r.json() : { user: null }))
      .then(d => setUser(d.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  // Returns an error message, or null on success
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) return data.error || 'Sign in failed. Please try again.'
      setUser(data.user)
      return null
    } catch {
      return 'Could not reach the server. Check your connection and try again.'
    }
  }, [])

  const signOut = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    setUser(null)
  }, [])

  const isAdmin = !!user // every account in admin_users is an administrator

  return <AuthContext.Provider value={{ user, loading, isAdmin, signIn, signOut }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
