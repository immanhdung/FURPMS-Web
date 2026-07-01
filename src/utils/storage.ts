import { AUTH_TOKEN_STORAGE_KEY } from "@/constants/env";

/**
 * "Remember me" toggles where the token lives: localStorage survives browser
 * restarts, sessionStorage clears when the tab closes.
 */
export const tokenStorage = {
  get(): string | null {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) ?? sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  },
  set(token: string, remember: boolean) {
    tokenStorage.clear();
    (remember ? localStorage : sessionStorage).setItem(AUTH_TOKEN_STORAGE_KEY, token);
  },
  clear() {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  },
};
