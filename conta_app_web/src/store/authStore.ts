import { create } from 'zustand'
 
interface AuthStore {
  user: User | null;
  role: UserRole;
  setUser: (user: User | null) => void;
}
 
export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  role: 'anonymous',
  setUser: (user) => set({ user }),
}));