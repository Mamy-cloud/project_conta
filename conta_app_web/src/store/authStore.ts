import { create } from 'zustand'
import type { Tables, Enums } from '../lib/database.types'

type User = Tables<'users'>
type UserRole = Enums<'user_role'>

interface AuthStore {
  user: User | null
  role: UserRole
  setUser: (user: User | null) => void
  setRole: (role: UserRole) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  role: 'anonymous',
  setUser: (user) => set({
    user,
    role: user?.role ?? 'anonymous',
  }),
  setRole: (role) => set({ role }),
}))