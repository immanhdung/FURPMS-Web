import { create } from "zustand";
import type { User } from "@/types/auth";
import type { Role } from "@/constants/roles";
import { getPrimaryRole } from "@/constants/roles";

/**
 * Vai đang xem lưu theo TỪNG NGƯỜI DÙNG.
 *
 * Trước đây dùng chung một khoá `furpms-active-role`: A chọn xem với vai Giảng viên, đăng xuất, B
 * đăng nhập trên cùng trình duyệt mà cũng có vai Giảng viên ⇒ B bị ném thẳng vào chế độ Giảng viên
 * dù chưa hề chọn. Từ khi `RoleGuard` chặn theo vai đang chọn, hậu quả là B mở màn nào của vai
 * chính cũng ăn "Bạn không có quyền" — không hiểu vì sao và không biết đường ra.
 */
const ACTIVE_ROLE_PREFIX = "furpms-active-role:";
const LEGACY_ACTIVE_ROLE_KEY = "furpms-active-role";

const roleKeyFor = (userId: string) => `${ACTIVE_ROLE_PREFIX}${userId}`;

function readStoredActiveRole(userId: string): Role | null {
  return (localStorage.getItem(roleKeyFor(userId)) as Role | null) ?? null;
}

/**
 * Pick the role the app should render for. Prefer a previously chosen role (persisted) as long as
 * the user still holds it; otherwise fall back to the highest-priority role. Keeps a multi-role
 * user's chosen "workspace" sticky across reloads without ever landing on a role they don't have.
 */
function resolveActiveRole(user: User | null): Role | null {
  if (!user) return null;
  // Dọn khoá dùng chung của bản cũ để không ai còn dính vai của người trước.
  localStorage.removeItem(LEGACY_ACTIVE_ROLE_KEY);

  const stored = readStoredActiveRole(user.id);
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

  setActiveRole: (role) =>
    set((state) => {
      if (state.user) localStorage.setItem(roleKeyFor(state.user.id), role);
      return { activeRole: role };
    }),

  setInitializing: (value) => set({ isInitializing: value }),

  // Đăng xuất KHÔNG xoá vai đã chọn: lần sau người đó đăng nhập lại vẫn về đúng chỗ đang làm dở.
  // Khoá theo userId nên không ảnh hưởng người khác.
  logout: () => set({ user: null, isAuthenticated: false, activeRole: null }),
}));
