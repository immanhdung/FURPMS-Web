export const ROLES = {
  ADMIN: "Admin",
  STAFF: "Staff",
  FACULTY: "Faculty",
  REVIEW_COMMITTEE: "ReviewCommittee",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ALL_ROLES: Role[] = Object.values(ROLES);

/** Priority order used to pick a single default dashboard/view for users with multiple roles. */
export const ROLE_PRIORITY: Role[] = [ROLES.ADMIN, ROLES.STAFF, ROLES.FACULTY, ROLES.REVIEW_COMMITTEE];

export function getPrimaryRole(roles: Role[]): Role | undefined {
  return ROLE_PRIORITY.find((role) => roles.includes(role));
}

/**
 * `CreateUserRequest`/`UpdateUserRequest` của BE nhận `roles` là **id số**, mà không có endpoint
 * `/api/roles` để tra. Bảng dưới **đã đối chiếu với bảng `roles` trong DB thật (12/08)** — khớp,
 * không còn là phỏng đoán theo thứ tự khai báo.
 */
export const ROLE_ID_MAP: Record<Role, number> = {
  [ROLES.ADMIN]: 1,
  [ROLES.STAFF]: 2,
  [ROLES.FACULTY]: 3,
  [ROLES.REVIEW_COMMITTEE]: 4,
};
