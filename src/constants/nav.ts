import {
  LayoutDashboard,
  CalendarRange,
  FolderKanban,
  ClipboardList,
  Users,
  Building2,
  ListChecks,
  Wallet,
  Settings2,
  BarChart3,
  Bell,
  Settings,
  Gavel,
  CalendarClock,
  UserCheck,
  FileText,
  FilePlus2,
  FileBarChart,
  FileCheck2,
  FileSignature,
  Sparkles,
  Mail,
  ClipboardCheck,
  Star,
  Contact,
} from "lucide-react";
import { ALL_ROLES, ROLES } from "@/constants/roles";
import type { Role } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import type { NavItem } from "@/types/nav";

export const NAV_ITEMS: NavItem[] = [
  // Admin
  { labelKey: "nav.dashboard", path: ROUTES.DASHBOARD, icon: LayoutDashboard, roles: [ROLES.ADMIN] },
  { labelKey: "nav.researchCycles", path: ROUTES.RESEARCH_CYCLES, icon: CalendarRange, roles: [ROLES.ADMIN, ROLES.STAFF] },
  { labelKey: "nav.researchTypes", path: ROUTES.RESEARCH_TYPES, icon: FolderKanban, roles: [ROLES.ADMIN] },
  { labelKey: "nav.researchOrders", path: ROUTES.RESEARCH_ORDERS, icon: ClipboardList, roles: [ROLES.ADMIN, ROLES.STAFF] },
  { labelKey: "nav.users", path: ROUTES.USERS, icon: Users, roles: [ROLES.ADMIN] },
  { labelKey: "nav.organizationalUnits", path: ROUTES.ORGANIZATIONAL_UNITS, icon: Building2, roles: [ROLES.ADMIN] },
  { labelKey: "nav.rubricCriteria", path: ROUTES.RUBRIC_CRITERIA, icon: ListChecks, roles: [ROLES.ADMIN] },
  { labelKey: "nav.budgetCategories", path: ROUTES.BUDGET_CATEGORIES, icon: Wallet, roles: [ROLES.ADMIN] },
  { labelKey: "nav.financialConfig", path: ROUTES.FINANCIAL_CONFIG, icon: Settings2, roles: [ROLES.ADMIN] },
  { labelKey: "nav.analytics", path: ROUTES.ANALYTICS, icon: BarChart3, roles: [ROLES.ADMIN, ROLES.STAFF] },
  { labelKey: "nav.notifications", path: ROUTES.NOTIFICATIONS, icon: Bell, roles: [ROLES.ADMIN, ROLES.STAFF, ROLES.FACULTY, ROLES.REVIEW_COMMITTEE] },
  { labelKey: "nav.settings", path: ROUTES.SETTINGS, icon: Settings, roles: ALL_ROLES },

  // Staff
  { labelKey: "nav.dashboard", path: ROUTES.DASHBOARD, icon: LayoutDashboard, roles: [ROLES.STAFF] },
  { labelKey: "nav.proposalReviews", path: ROUTES.PROPOSAL_REVIEWS, icon: FileCheck2, roles: [ROLES.STAFF] },
  { labelKey: "nav.councils", path: ROUTES.COUNCILS, icon: Gavel, roles: [ROLES.STAFF] },
  { labelKey: "nav.meetings", path: ROUTES.MEETINGS, icon: CalendarClock, roles: [ROLES.STAFF, ROLES.REVIEW_COMMITTEE] },
  { labelKey: "nav.assignments", path: ROUTES.ASSIGNMENTS, icon: UserCheck, roles: [ROLES.STAFF] },
  { labelKey: "nav.contracts", path: ROUTES.CONTRACTS, icon: FileSignature, roles: [ROLES.STAFF] },

  // PI (Faculty)
  { labelKey: "nav.dashboard", path: ROUTES.DASHBOARD, icon: LayoutDashboard, roles: [ROLES.FACULTY] },
  { labelKey: "nav.myProposals", path: ROUTES.MY_PROPOSALS, icon: FileText, roles: [ROLES.FACULTY] },
  { labelKey: "nav.submitProposal", path: ROUTES.SUBMIT_PROPOSAL, icon: FilePlus2, roles: [ROLES.FACULTY] },
  { labelKey: "nav.progressReports", path: ROUTES.PROGRESS_REPORTS, icon: FileBarChart, roles: [ROLES.FACULTY] },
  { labelKey: "nav.finalReports", path: ROUTES.FINAL_REPORTS, icon: FileCheck2, roles: [ROLES.FACULTY] },
  { labelKey: "nav.aiSearch", path: ROUTES.AI_SEARCH, icon: Sparkles, roles: [ROLES.FACULTY] },

  // Review Committee
  { labelKey: "nav.dashboard", path: ROUTES.DASHBOARD, icon: LayoutDashboard, roles: [ROLES.REVIEW_COMMITTEE] },
  { labelKey: "nav.invitations", path: ROUTES.INVITATIONS, icon: Mail, roles: [ROLES.REVIEW_COMMITTEE] },
  { labelKey: "nav.assignedReviews", path: ROUTES.ASSIGNED_REVIEWS, icon: ClipboardCheck, roles: [ROLES.REVIEW_COMMITTEE] },
  { labelKey: "nav.councilMemberships", path: ROUTES.COUNCIL_MEMBERSHIPS, icon: Contact, roles: [ROLES.REVIEW_COMMITTEE] },
  { labelKey: "nav.scoring", path: ROUTES.SCORING, icon: Star, roles: [ROLES.REVIEW_COMMITTEE] },
];

export function getNavItemsForRoles(roles: Role[]): NavItem[] {
  const seen = new Set<string>();
  return NAV_ITEMS.filter((item) => {
    if (!item.roles.some((role) => roles.includes(role))) return false;
    const key = `${item.labelKey}:${item.path}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
