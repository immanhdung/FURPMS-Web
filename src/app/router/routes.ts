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
