import {
  FilePenLine,
  Route,
  LayoutDashboard,
  CalendarRange,
  FolderKanban,
  ClipboardList,
  Users,
  Building2,
  ListChecks,
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
  // Sparkles,   // dùng lại khi mở lại "Tìm kiếm bằng AI"
  Mail,
  ClipboardCheck,
  // Star,      // dùng lại khi mở lại "Chấm điểm"
  // Contact,   // dùng lại khi mở lại "Thành viên hội đồng"
  Scale,
  Package,
  FileEdit,
} from "lucide-react";
import { ALL_ROLES, ROLES } from "@/constants/roles";
import type { Role } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import type { NavItem } from "@/types/nav";

const PRIMARY_NAV_ITEMS: NavItem[] = [
  // Admin
  { labelKey: "nav.dashboard", path: ROUTES.DASHBOARD, icon: LayoutDashboard, roles: [ROLES.ADMIN] },
  { labelKey: "nav.researchCycles", path: ROUTES.RESEARCH_CYCLES, icon: CalendarRange, roles: [ROLES.ADMIN, ROLES.STAFF] },
  { labelKey: "nav.researchTypes", path: ROUTES.RESEARCH_TYPES, icon: FolderKanban, roles: [ROLES.ADMIN] },
  { labelKey: "nav.researchOrders", path: ROUTES.RESEARCH_ORDERS, icon: ClipboardList, roles: [ROLES.ADMIN, ROLES.STAFF] },
  { labelKey: "nav.users", path: ROUTES.USERS, icon: Users, roles: [ROLES.ADMIN] },
  { labelKey: "nav.organizationalUnits", path: ROUTES.ORGANIZATIONAL_UNITS, icon: Building2, roles: [ROLES.ADMIN] },
  { labelKey: "nav.rubricCriteria", path: ROUTES.RUBRIC_CRITERIA, icon: ListChecks, roles: [ROLES.ADMIN] },
  // Ẩn cấu hình tiền (rule tuần 10 — hệ thống KHÔNG quản tiền; route vẫn còn nhưng bỏ khỏi menu).
  // { labelKey: "nav.budgetCategories", path: ROUTES.BUDGET_CATEGORIES, icon: Wallet, roles: [ROLES.ADMIN] },
  // { labelKey: "nav.financialConfig", path: ROUTES.FINANCIAL_CONFIG, icon: Settings2, roles: [ROLES.ADMIN] },
  { labelKey: "nav.analytics", path: ROUTES.ANALYTICS, icon: BarChart3, roles: [ROLES.ADMIN, ROLES.STAFF] },
  // Thông báo + Cài đặt chuyển xuống BOTTOM_NAV_ITEMS (xem cuối file) để luôn nằm cuối menu.

  // Staff
  { labelKey: "nav.dashboard", path: ROUTES.DASHBOARD, icon: LayoutDashboard, roles: [ROLES.STAFF] },
  { labelKey: "nav.proposalReviews", path: ROUTES.PROPOSAL_REVIEWS, icon: FileCheck2, roles: [ROLES.STAFF] },
  { labelKey: "nav.reviewBoard", path: ROUTES.REVIEW_BOARD, icon: Scale, roles: [ROLES.ADMIN, ROLES.STAFF] },
  { labelKey: "nav.councils", path: ROUTES.COUNCILS, icon: Gavel, roles: [ROLES.STAFF] },
  { labelKey: "nav.meetings", path: ROUTES.MEETINGS, icon: CalendarClock, roles: [ROLES.STAFF, ROLES.REVIEW_COMMITTEE] },
  { labelKey: "nav.assignments", path: ROUTES.ASSIGNMENTS, icon: UserCheck, roles: [ROLES.STAFF] },
  { labelKey: "nav.contracts", path: ROUTES.CONTRACTS, icon: FileSignature, roles: [ROLES.STAFF] },
  { labelKey: "nav.changeRequests", path: ROUTES.CHANGE_REQUESTS, icon: FileEdit, roles: [ROLES.STAFF] },
  // Tạm ẩn: chưa dùng tới, để khỏi rối menu demo — route/page vẫn còn, bật lại chỉ cần bỏ comment.
  // { labelKey: "nav.documents", path: ROUTES.DOCUMENTS, icon: FolderOpen, roles: [ROLES.STAFF, ROLES.ADMIN] },

  // PI (Faculty)
  { labelKey: "nav.dashboard", path: ROUTES.DASHBOARD, icon: LayoutDashboard, roles: [ROLES.FACULTY] },
  { labelKey: "nav.myProposals", path: ROUTES.MY_PROPOSALS, icon: FileText, roles: [ROLES.FACULTY] },
  { labelKey: "nav.submitProposal", path: ROUTES.SUBMIT_PROPOSAL, icon: FilePlus2, roles: [ROLES.FACULTY] },
  { labelKey: "nav.progressReports", path: ROUTES.PROGRESS_REPORTS, icon: FileBarChart, roles: [ROLES.FACULTY] },
  { labelKey: "nav.deliverables", path: ROUTES.DELIVERABLES, icon: Package, roles: [ROLES.FACULTY] },
  { labelKey: "nav.myMeetings", path: ROUTES.MY_MEETINGS, icon: CalendarClock, roles: [ROLES.FACULTY] },
  { labelKey: "nav.finalReports", path: ROUTES.FINAL_REPORTS, icon: FileCheck2, roles: [ROLES.FACULTY] },
  // PI xin điều chỉnh/gia hạn hợp đồng — BE đã cho phép từ lâu, trước đây thiếu màn.
  { labelKey: "nav.myAmendments", path: ROUTES.MY_AMENDMENTS, icon: FilePenLine, roles: [ROLES.FACULTY] },
  // PI xem tiến trình đề tài của chính mình — trước đây timeline chỉ có ở màn Staff.
  { labelKey: "nav.myTimeline", path: ROUTES.MY_TIMELINE, icon: Route, roles: [ROLES.FACULTY] },
  // Tìm kiếm bằng AI: TẠM ẨN 17/08 — xem docs/README.md §A0.
  // Lưu ý: chú thích dòng này cũng bỏ luôn ROUTE (bảng route sinh từ mảng này), nên gõ thẳng
  // /ai-search cũng không vào được. Đúng ý "ẩn hẳn"; `SemanticSearchPage` vẫn còn trong mã nguồn.
  // { labelKey: "nav.aiSearch", path: ROUTES.AI_SEARCH, icon: Sparkles, roles: [ROLES.FACULTY] },

  // Review Committee
  { labelKey: "nav.dashboard", path: ROUTES.DASHBOARD, icon: LayoutDashboard, roles: [ROLES.REVIEW_COMMITTEE] },
  { labelKey: "nav.invitations", path: ROUTES.INVITATIONS, icon: Mail, roles: [ROLES.REVIEW_COMMITTEE] },
  { labelKey: "nav.assignedReviews", path: ROUTES.ASSIGNED_REVIEWS, icon: ClipboardCheck, roles: [ROLES.REVIEW_COMMITTEE] },
  // TẠM ẨN 17/08 — cả hai chỉ là CÁCH BÀY KHÁC của "Đề tài được phân công":
  //   · "Thành viên hội đồng" = cùng dữ liệu, đổi thẻ thành bảng.
  //   · "Chấm điểm"           = cùng dữ liệu, lọc thêm `roundStatus === OPEN` (tập con).
  // Cả ba đều điều hướng tới ĐÚNG một đích `assigned-reviews/{councilId}`, nên người chấm bấm
  // vào đâu cũng ra một màn — chỉ tổ khiến họ tưởng bỏ sót việc ở tab kia.
  // Xem docs/README.md §A0. Bỏ chú thích là bật lại (kèm route).
  // { labelKey: "nav.councilMemberships", path: ROUTES.COUNCIL_MEMBERSHIPS, icon: Contact, roles: [ROLES.REVIEW_COMMITTEE] },
  // { labelKey: "nav.scoring", path: ROUTES.SCORING, icon: Star, roles: [ROLES.REVIEW_COMMITTEE] },
];

/**
 * Hai mục tiện ích, LUÔN nằm cuối menu của mọi vai trò.
 *
 * Danh sách là mảng phẳng lọc theo vai trò, nên vị trí trong menu = vị trí trong mảng. Hai mục này
 * khai báo trong khối Admin (đầu mảng) nhưng mở cho mọi vai, nên với PI và người chấm chúng đứng
 * NGAY ĐẦU — Cài đặt là mục thứ hai, trên cả "Đề tài của tôi". Tách ra rồi nối vào cuối.
 */
const BOTTOM_NAV_ITEMS: NavItem[] = [
  { labelKey: "nav.notifications", path: ROUTES.NOTIFICATIONS, icon: Bell, roles: [ROLES.ADMIN, ROLES.STAFF, ROLES.FACULTY, ROLES.REVIEW_COMMITTEE] },
  { labelKey: "nav.settings", path: ROUTES.SETTINGS, icon: Settings, roles: ALL_ROLES },
];

/**
 * ⚠️ PHẢI chứa MỌI mục có route.
 *
 * `APP_ROUTE_GROUPS` (`app/router/routes.ts`) sinh **bảng route + quyền** từ chính mảng này. Bỏ một
 * mục ra khỏi đây không phải là "ẩn khỏi menu" — nó **xoá luôn đường vào trang đó**. Muốn ẩn khỏi
 * menu mà vẫn vào được thì đừng đụng mảng này; chú thích ở chỗ khai báo mục (như `nav.aiSearch`)
 * thì trang cũng mất route — chỉ chấp nhận được khi thực sự muốn khoá hẳn.
 *
 * (Sáng 17/08 tôi tách Cài đặt + Thông báo sang `BOTTOM_NAV_ITEMS` mà quên nối lại vào đây ⇒ MỌI
 * vai trò mất trang Cài đặt.)
 */
export const NAV_ITEMS: NavItem[] = [...PRIMARY_NAV_ITEMS, ...BOTTOM_NAV_ITEMS];

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
