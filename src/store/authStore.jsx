import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,

      setUser: (user) => set({ user }),
      
      setToken: (token) => set({ token }),

      logout: () => set({ user: null, token: null }),
    }),
    {
      name: "furpms-auth-storage", // name of the item in the storage (must be unique)
    }
  )
);