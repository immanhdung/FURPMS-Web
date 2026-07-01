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
