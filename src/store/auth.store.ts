import { create } from "zustand";
import type { User } from "@/types/auth";
import type { Role } from "@/constants/roles";
import { getPrimaryRole } from "@/constants/roles";

const ACTIVE_ROLE_KEY = "furpms-active-role";

function readStoredActiveRole(): Role | null {
  return (localStorage.getItem(ACTIVE_ROLE_KEY) as Role | null) ?? null;
}

/**
 * Pick the role the app should render for. Prefer a previously chosen role (persisted) as long as
 * the user still holds it; otherwise fall back to the highest-priority role. Keeps a multi-role
 * user's chosen "workspace" sticky across reloads without ever landing on a role they don't have.
 */
function resolveActiveRole(user: User | null): Role | null {
  if (!user) return null;
  const stored = readStoredActiveRole();
  if (stored && user.roles.includes(stored)) return stored;
  return getPrimaryRole(user.roles) ?? null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  /** The role currently being viewed (multi-role users switch this from the header). */
  activeRole: Role | null;
  setUser: (user: User | null) => void;
  setActiveRole: (role: Role) => void;
  setInitializing: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitializing: true,
  activeRole: null,

  setUser: (user) => set({ user, isAuthenticated: Boolean(user), activeRole: resolveActiveRole(user) }),

  setActiveRole: (role) => {
    localStorage.setItem(ACTIVE_ROLE_KEY, role);
    set({ activeRole: role });
  },

  setInitializing: (value) => set({ isInitializing: value }),

  logout: () => {
    localStorage.removeItem(ACTIVE_ROLE_KEY);
    set({ user: null, isAuthenticated: false, activeRole: null });
  },
}));
