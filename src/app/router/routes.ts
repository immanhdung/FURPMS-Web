import { NAV_ITEMS } from "@/constants/nav";
import { ROUTES } from "@/constants/routes";
import type { Role } from "@/constants/roles";

interface RouteGroup {
  path: string;
  roles: Role[];
}

/** Deduplicated, role-aware route table derived from the sidebar nav config. */
export const APP_ROUTE_GROUPS: RouteGroup[] = Array.from(
  NAV_ITEMS.filter((item) => item.path !== ROUTES.DASHBOARD).reduce((map, item) => {
    const existing = map.get(item.path);
    if (existing) {
      item.roles.forEach((role) => existing.add(role));
    } else {
      map.set(item.path, new Set(item.roles));
    }
    return map;
  }, new Map<string, Set<Role>>())
).map(([path, roles]) => ({ path, roles: Array.from(roles) }));

const SHARED_PROTECTED_ROUTES = new Set<string>([
  ROUTES.DASHBOARD,
  ROUTES.PROFILE,
  ROUTES.CHANGE_PASSWORD,
]);

/**
 * Kiểm tra route mà một vai đang chọn có thể mở trong giao diện.
 *
 * `ProtectedRoute` lưu lại trang người dùng định vào trước khi đăng nhập. Nếu tài khoản trước là
 * Staff đang ở `/contracts`, rồi reviewer đăng nhập trên cùng tab, không được đưa reviewer trở lại
 * `/contracts` — `RoleGuard` sẽ lập tức đá họ sang `/unauthorized`. Các trang chi tiết dùng chung
 * quyền với route cha, nên so cả tiền tố thay vì chỉ so đường dẫn tuyệt đối.
 */
export function canRoleAccessPath(pathname: string, role: Role | null): boolean {
  if (!role) return false;

  const normalizedPath = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  if (SHARED_PROTECTED_ROUTES.has(normalizedPath)) return true;

  const group = APP_ROUTE_GROUPS.find(
    ({ path }) => normalizedPath === path || normalizedPath.startsWith(`${path}/`)
  );

  return group?.roles.includes(role) ?? false;
}
