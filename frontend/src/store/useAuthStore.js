import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      
      login: (userData, token) => set({ user: userData, token }),
      logout: () => set({ user: null, token: null }),
      setUser: (userData) => set({ user: userData }),
      updateUser: (userData) => set({ user: userData })
    }),
    {
      name: 'auth-storage'
    }
  )
);

export default useAuthStore;