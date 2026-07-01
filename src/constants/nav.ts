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
  Sparkles,
  Mail,
  ClipboardCheck,
  Star,
} from "lucide-react";
import { ROLES } from "@/constants/roles";
import type { Role } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import type { NavItem } from "@/types/nav";

export const NAV_ITEMS: NavItem[] = [
  // Admin
  { label: "Dashboard", path: ROUTES.DASHBOARD, icon: LayoutDashboard, roles: [ROLES.ADMIN] },
  { label: "Research Cycles", path: ROUTES.RESEARCH_CYCLES, icon: CalendarRange, roles: [ROLES.ADMIN, ROLES.STAFF] },
  { label: "Research Types", path: ROUTES.RESEARCH_TYPES, icon: FolderKanban, roles: [ROLES.ADMIN] },
  { label: "Research Orders", path: ROUTES.RESEARCH_ORDERS, icon: ClipboardList, roles: [ROLES.ADMIN, ROLES.STAFF] },
  { label: "Users", path: ROUTES.USERS, icon: Users, roles: [ROLES.ADMIN] },
  { label: "Organizational Units", path: ROUTES.ORGANIZATIONAL_UNITS, icon: Building2, roles: [ROLES.ADMIN] },
  { label: "Rubric Criteria", path: ROUTES.RUBRIC_CRITERIA, icon: ListChecks, roles: [ROLES.ADMIN] },
  { label: "Budget Categories", path: ROUTES.BUDGET_CATEGORIES, icon: Wallet, roles: [ROLES.ADMIN] },
  { label: "Financial Config", path: ROUTES.FINANCIAL_CONFIG, icon: Settings2, roles: [ROLES.ADMIN] },
  { label: "Analytics", path: ROUTES.ANALYTICS, icon: BarChart3, roles: [ROLES.ADMIN, ROLES.STAFF] },
  { label: "Notifications", path: ROUTES.NOTIFICATIONS, icon: Bell, roles: [ROLES.ADMIN, ROLES.STAFF, ROLES.FACULTY, ROLES.REVIEW_COMMITTEE] },
  { label: "Settings", path: ROUTES.SETTINGS, icon: Settings, roles: [ROLES.ADMIN] },

  // Staff
  { label: "Dashboard", path: ROUTES.DASHBOARD, icon: LayoutDashboard, roles: [ROLES.STAFF] },
  { label: "Proposal Reviews", path: ROUTES.PROPOSAL_REVIEWS, icon: FileCheck2, roles: [ROLES.STAFF] },
  { label: "Councils", path: ROUTES.COUNCILS, icon: Gavel, roles: [ROLES.STAFF] },
  { label: "Meetings", path: ROUTES.MEETINGS, icon: CalendarClock, roles: [ROLES.STAFF, ROLES.REVIEW_COMMITTEE] },
  { label: "Assignments", path: ROUTES.ASSIGNMENTS, icon: UserCheck, roles: [ROLES.STAFF] },

  // PI (Faculty)
  { label: "Dashboard", path: ROUTES.DASHBOARD, icon: LayoutDashboard, roles: [ROLES.FACULTY] },
  { label: "My Proposals", path: ROUTES.MY_PROPOSALS, icon: FileText, roles: [ROLES.FACULTY] },
  { label: "Submit Proposal", path: ROUTES.SUBMIT_PROPOSAL, icon: FilePlus2, roles: [ROLES.FACULTY] },
  { label: "Progress Reports", path: ROUTES.PROGRESS_REPORTS, icon: FileBarChart, roles: [ROLES.FACULTY] },
  { label: "Final Reports", path: ROUTES.FINAL_REPORTS, icon: FileCheck2, roles: [ROLES.FACULTY] },
  { label: "AI Search", path: ROUTES.AI_SEARCH, icon: Sparkles, roles: [ROLES.FACULTY] },

  // Review Committee
  { label: "Dashboard", path: ROUTES.DASHBOARD, icon: LayoutDashboard, roles: [ROLES.REVIEW_COMMITTEE] },
  { label: "Invitations", path: ROUTES.INVITATIONS, icon: Mail, roles: [ROLES.REVIEW_COMMITTEE] },
  { label: "Assigned Reviews", path: ROUTES.ASSIGNED_REVIEWS, icon: ClipboardCheck, roles: [ROLES.REVIEW_COMMITTEE] },
  { label: "Scoring", path: ROUTES.SCORING, icon: Star, roles: [ROLES.REVIEW_COMMITTEE] },
];

export function getNavItemsForRoles(roles: Role[]): NavItem[] {
  const seen = new Set<string>();
  return NAV_ITEMS.filter((item) => {
    if (!item.roles.some((role) => roles.includes(role))) return false;
    const key = `${item.label}:${item.path}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
