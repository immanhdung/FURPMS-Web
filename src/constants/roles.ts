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
 * The backend's CreateUserRequest/UpdateUserRequest take `roles` as integer IDs, but no
 * /api/roles lookup endpoint exists to confirm the mapping. This is a best-effort guess based
 * on declaration order in CLAUDE.md — verify against the real DB and adjust once known.
 */
export const ROLE_ID_MAP: Record<Role, number> = {
  [ROLES.ADMIN]: 1,
  [ROLES.STAFF]: 2,
  [ROLES.FACULTY]: 3,
  [ROLES.REVIEW_COMMITTEE]: 4,
};
