import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,

      setUser: (user) => set({ user }),

      setToken: (token) => set({ token }),

      setRefreshToken: (refreshToken) => set({ refreshToken }),

      /**
       * Set all auth data at once (after login/SSO/refresh).
       * @param {{ user: object, token: string, refreshToken: string }} data
       */
      setAuth: (data) =>
        set({
          user: data.user,
          token: data.token,
          refreshToken: data.refreshToken,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          refreshToken: null,
        }),

      /** Check if the current user has any of the specified roles. */
      hasRole: (roles) => {
        const user = get().user;
        if (!user?.roles) return false;
        return user.roles.some((r) => roles.includes(r));
      },

      /** Check if user is authenticated. */
      isAuthenticated: () => !!get().token,
    }),
    {
      name: "furpms-auth-storage", // name of the item in the storage (must be unique)
    }
  )
);