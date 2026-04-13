import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

type User = {
  id: string
  email?: string
}

type AuthContextType = {
  user: User | null
  role: string | null
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Charger session au démarrage
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()

      const sessionUser = data.session?.user

      if (sessionUser) {
        setUser({
          id: sessionUser.id,
          email: sessionUser.email,
        })

        // Exemple : role depuis user_metadata
        setRole(sessionUser.user_metadata?.role || 'user')
      }

      setLoading(false)
    }

    getSession()

    // Écoute changements auth
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        const sessionUser = session?.user

        if (sessionUser) {
          setUser({
            id: sessionUser.id,
            email: sessionUser.email,
          })

          setRole(sessionUser.user_metadata?.role || 'user')
        } else {
          setUser(null)
          setRole(null)
        }
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setRole(null)
  }

  return (
    <AuthContext.Provider value={{ user, role, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook custom
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}