import { lazy, Suspense, useEffect, type ComponentType } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { ComingSoonPage } from "@/components/shared/ComingSoonPage";
import { NotFoundPage } from "@/components/shared/NotFoundPage";
import { UnauthorizedPage } from "@/components/shared/UnauthorizedPage";
import { ForgotPasswordPage } from "@/features/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/features/auth/pages/ResetPasswordPage";
import { PageLoader } from "@/components/shared/PageLoader";
import { useBootstrapAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import { APP_ROUTE_GROUPS } from "@/app/router/routes";
import { ProtectedRoute } from "@/app/router/ProtectedRoute";
import { PublicOnlyRoute } from "@/app/router/PublicOnlyRoute";
import { RoleGuard } from "@/app/router/RoleGuard";
import { NAV_ITEMS } from "@/constants/nav";
import { useAuthStore } from "@/store/auth.store";

const HomePage = lazy(() => import("@/features/home/HomePage").then((m) => ({ default: m.HomePage })));
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage").then((m) => ({ default: m.LoginPage })));
const ChangePasswordPage = lazy(() =>
  import("@/features/auth/pages/ChangePasswordPage").then((m) => ({ default: m.ChangePasswordPage }))
);
const ProfilePage = lazy(() => import("@/features/auth/pages/ProfilePage").then((m) => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import("@/features/settings/SettingsPage").then((m) => ({ default: m.SettingsPage })));
const DashboardPage = lazy(() =>
  import("@/features/dashboard/pages/DashboardPage").then((m) => ({ default: m.DashboardPage }))
);
const NotificationsPage = lazy(() =>
  import("@/features/notification/pages/NotificationsPage").then((m) => ({ default: m.NotificationsPage }))
);
const UsersPage = lazy(() => import("@/features/admin/users/UsersPage").then((m) => ({ default: m.UsersPage })));
const CyclesPage = lazy(() => import("@/features/admin/cycles/CyclesPage").then((m) => ({ default: m.CyclesPage })));
const ResearchTypesPage = lazy(() =>
  import("@/features/admin/research-types/ResearchTypesPage").then((m) => ({ default: m.ResearchTypesPage }))
);
const ResearchOrdersPage = lazy(() =>
  import("@/features/admin/research-orders/ResearchOrdersPage").then((m) => ({ default: m.ResearchOrdersPage }))
);
const BudgetCategoriesPage = lazy(() =>
  import("@/features/admin/budget-categories/BudgetCategoriesPage").then((m) => ({ default: m.BudgetCategoriesPage }))
);
const FinancialConfigsPage = lazy(() =>
  import("@/features/admin/financial-configs/FinancialConfigsPage").then((m) => ({ default: m.FinancialConfigsPage }))
);
const OrganizationalUnitsPage = lazy(() =>
  import("@/features/admin/organizational-units/OrganizationalUnitsPage").then((m) => ({
    default: m.OrganizationalUnitsPage,
  }))
);
const RubricCriteriaPage = lazy(() =>
  import("@/features/admin/rubric-criteria/RubricCriteriaPage").then((m) => ({ default: m.RubricCriteriaPage }))
);
const ProposalReviewsPage = lazy(() =>
  import("@/features/staff/proposal-reviews/ProposalReviewsPage").then((m) => ({ default: m.ProposalReviewsPage }))
);
const ProposalReviewWorkspace = lazy(() =>
  import("@/features/staff/proposal-reviews/ProposalReviewWorkspace").then((m) => ({
    default: m.ProposalReviewWorkspace,
  }))
);
const ReviewBoardPage = lazy(() =>
  import("@/features/staff/review-board/ReviewBoardPage").then((m) => ({ default: m.ReviewBoardPage }))
);
const CouncilsPage = lazy(() => import("@/features/staff/councils/CouncilsPage").then((m) => ({ default: m.CouncilsPage })));
const AssignmentsPage = lazy(() =>
  import("@/features/staff/assignments/AssignmentsPage").then((m) => ({ default: m.AssignmentsPage }))
);
const MeetingsPage = lazy(() => import("@/features/staff/meetings/MeetingsPage").then((m) => ({ default: m.MeetingsPage })));
const ContractsPage = lazy(() =>
  import("@/features/staff/contracts/ContractsPage").then((m) => ({ default: m.ContractsPage }))
);
const MyProposalsPage = lazy(() =>
  import("@/features/pi/proposals/MyProposalsPage").then((m) => ({ default: m.MyProposalsPage }))
);
const ProposalDetailPage = lazy(() =>
  import("@/features/pi/proposals/ProposalDetailPage").then((m) => ({ default: m.ProposalDetailPage }))
);
const ProposalWizardPage = lazy(() =>
  import("@/features/pi/proposals/wizard/ProposalWizardPage").then((m) => ({ default: m.ProposalWizardPage }))
);
const InvitationsPage = lazy(() =>
  import("@/features/reviewer/invitations/InvitationsPage").then((m) => ({ default: m.InvitationsPage }))
);
const AssignedReviewsPage = lazy(() =>
  import("@/features/reviewer/assigned-reviews/AssignedReviewsPage").then((m) => ({ default: m.AssignedReviewsPage }))
);
const ScoringPage = lazy(() => import("@/features/reviewer/scoring/ScoringPage").then((m) => ({ default: m.ScoringPage })));
const CouncilMembershipsPage = lazy(() =>
  import("@/features/reviewer/council-memberships/CouncilMembershipsPage").then((m) => ({
    default: m.CouncilMembershipsPage,
  }))
);
const ReviewerProposalReviewWorkspace = lazy(() =>
  import("@/features/reviewer/proposal-review/ProposalReviewWorkspace").then((m) => ({
    default: m.ProposalReviewWorkspace,
  }))
);
const AnalyticsPage = lazy(() => import("@/features/analytics/AnalyticsPage").then((m) => ({ default: m.AnalyticsPage })));
const SemanticSearchPage = lazy(() =>
  import("@/features/pi/ai-search/SemanticSearchPage").then((m) => ({ default: m.SemanticSearchPage }))
);
const PiProgressReportsPage = lazy(() =>
  import("@/features/pi/progress-reports/ProgressReportsPage").then((m) => ({ default: m.ProgressReportsPage }))
);
const PiFinalReportsPage = lazy(() =>
  import("@/features/pi/final-reports/FinalReportsPage").then((m) => ({ default: m.FinalReportsPage }))
);
const PiMyMeetingsPage = lazy(() =>
  import("@/features/pi/meetings/MyMeetingsPage").then((m) => ({ default: m.MyMeetingsPage }))
);
const PiMyAmendmentsPage = lazy(() =>
  import("@/features/pi/amendments/MyAmendmentsPage").then((m) => ({ default: m.MyAmendmentsPage }))
);
const PiMyTimelinePage = lazy(() =>
  import("@/features/pi/progress-track/MyProjectTimelinePage").then((m) => ({ default: m.MyProjectTimelinePage }))
);
const PiDeliverablesPage = lazy(() =>
  import("@/features/pi/deliverables/DeliverablesPage").then((m) => ({ default: m.DeliverablesPage }))
);
const PendingChangeRequestsPage = lazy(() =>
  import("@/features/staff/proposal-reviews/PendingChangeRequestsPanel").then((m) => ({ default: m.PendingChangeRequestsPanel }))
);
const DocumentRepositoryPage = lazy(() =>
  import("@/features/staff/documents/DocumentRepositoryPage").then((m) => ({ default: m.DocumentRepositoryPage }))
);

const FEATURE_PAGES: Partial<Record<string, ComponentType>> = {
  [ROUTES.NOTIFICATIONS]: NotificationsPage,
  [ROUTES.USERS]: UsersPage,
  [ROUTES.RESEARCH_CYCLES]: CyclesPage,
  [ROUTES.RESEARCH_TYPES]: ResearchTypesPage,
  [ROUTES.RESEARCH_ORDERS]: ResearchOrdersPage,
  [ROUTES.BUDGET_CATEGORIES]: BudgetCategoriesPage,
  [ROUTES.FINANCIAL_CONFIG]: FinancialConfigsPage,
  [ROUTES.ORGANIZATIONAL_UNITS]: OrganizationalUnitsPage,
  [ROUTES.RUBRIC_CRITERIA]: RubricCriteriaPage,
  [ROUTES.PROPOSAL_REVIEWS]: ProposalReviewsPage,
  [ROUTES.REVIEW_BOARD]: ReviewBoardPage,
  [ROUTES.COUNCILS]: CouncilsPage,
  [ROUTES.ASSIGNMENTS]: AssignmentsPage,
  [ROUTES.MEETINGS]: MeetingsPage,
  [ROUTES.CONTRACTS]: ContractsPage,
  [ROUTES.MY_PROPOSALS]: MyProposalsPage,
  [ROUTES.SUBMIT_PROPOSAL]: ProposalWizardPage,
  [ROUTES.INVITATIONS]: InvitationsPage,
  [ROUTES.ASSIGNED_REVIEWS]: AssignedReviewsPage,
  [ROUTES.SCORING]: ScoringPage,
  [ROUTES.COUNCIL_MEMBERSHIPS]: CouncilMembershipsPage,
  [ROUTES.ANALYTICS]: AnalyticsPage,
  [ROUTES.AI_SEARCH]: SemanticSearchPage,
  [ROUTES.SETTINGS]: SettingsPage,
  [ROUTES.PROGRESS_REPORTS]: PiProgressReportsPage,
  [ROUTES.DELIVERABLES]: PiDeliverablesPage,
  [ROUTES.MY_MEETINGS]: PiMyMeetingsPage,
  [ROUTES.FINAL_REPORTS]: PiFinalReportsPage,
  [ROUTES.MY_AMENDMENTS]: PiMyAmendmentsPage,
  [ROUTES.MY_TIMELINE]: PiMyTimelinePage,
  [ROUTES.CHANGE_REQUESTS]: PendingChangeRequestsPage,
  [ROUTES.DOCUMENTS]: DocumentRepositoryPage,
};

const proposalReviewsRoles = NAV_ITEMS.find((item) => item.path === ROUTES.PROPOSAL_REVIEWS)?.roles ?? [];
const myProposalsRoles = NAV_ITEMS.find((item) => item.path === ROUTES.MY_PROPOSALS)?.roles ?? [];
const assignedReviewsRoles = NAV_ITEMS.find((item) => item.path === ROUTES.ASSIGNED_REVIEWS)?.roles ?? [];

function FeaturePage({ path }: { path: string }) {
  const Page = FEATURE_PAGES[path];
  return Page ? <Page /> : <ComingSoonPage />;
}

function RoleAwareDocumentTitle() {
  const { t } = useTranslation();
  const activeRole = useAuthStore((state) => state.activeRole);

  useEffect(() => {
    document.title = activeRole
      ? t("documentTitle.role", {
          role: t(`documentTitle.roles.${activeRole}`, { defaultValue: activeRole }),
        })
      : t("documentTitle.default");
  }, [activeRole, t]);

  return null;
}

export function AppRouter() {
  useBootstrapAuth();

  return (
    /*
     * `useTransitions={false}` — đổi địa chỉ phải commit ĐỒNG BỘ, không đi qua `startTransition`.
     *
     * Lỗi thật: đang ở `/contracts` với vai Cán bộ, bấm đổi sang Giảng viên ở menu avatar → văng
     * ra màn "Bạn không có quyền truy cập trang này" thay vì về bảng điều khiển. `switchRole` chạy
     * hai việc liền nhau: ghi `activeRole` rồi `navigate("/dashboard")`. Từ React Router v7, mặc
     * định mọi thay đổi địa chỉ được bọc trong `React.startTransition` — trong khi store zustand
     * đọc qua `useSyncExternalStore` thì **không hoãn được**, luôn render đồng bộ. Kết quả là React
     * commit một lượt với *(vai MỚI, địa chỉ CŨ)*: `RoleGuard` của trang cũ thấy vai không hợp lệ
     * và bắn `<Navigate to="/unauthorized" replace>`, đè luôn điều hướng về dashboard đang chờ.
     *
     * Toàn bộ code trong app viết theo giả định "đổi state rồi navigate" là một lượt — đây là chỗ
     * duy nhất sửa lại cho đúng giả định đó, thay vì đi vá từng chỗ gọi navigate.
     * Đánh đổi: vào một route lần đầu (route nào cũng `lazy`) sẽ hiện `PageLoader` thay vì giữ màn
     * cũ trong lúc tải chunk. Đổi lại là điều hướng không còn tự ý đá người dùng đi chỗ khác.
     */
    <BrowserRouter useTransitions={false}>
      <RoleAwareDocumentTitle />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path={ROUTES.HOME} element={<HomePage />} />
            <Route element={<AuthLayout />}>
              <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            </Route>
          </Route>

          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
          <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
          <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path={ROUTES.DASHBOARD.slice(1)} element={<DashboardPage />} />
              <Route path={ROUTES.PROFILE.slice(1)} element={<ProfilePage />} />
              <Route path={ROUTES.CHANGE_PASSWORD.slice(1)} element={<ChangePasswordPage />} />

              {APP_ROUTE_GROUPS.map((group) => (
                <Route key={group.path} element={<RoleGuard allowedRoles={group.roles} />}>
                  <Route path={group.path.slice(1)} element={<FeaturePage path={group.path} />} />
                </Route>
              ))}

              <Route element={<RoleGuard allowedRoles={proposalReviewsRoles} />}>
                <Route path={`${ROUTES.PROPOSAL_REVIEWS.slice(1)}/:proposalId`} element={<ProposalReviewWorkspace />} />
              </Route>

              <Route element={<RoleGuard allowedRoles={myProposalsRoles} />}>
                <Route path={`${ROUTES.MY_PROPOSALS.slice(1)}/:proposalId`} element={<ProposalDetailPage />} />
                <Route path={`${ROUTES.SUBMIT_PROPOSAL.slice(1)}/:proposalId`} element={<ProposalWizardPage />} />
              </Route>

              <Route element={<RoleGuard allowedRoles={assignedReviewsRoles} />}>
                <Route
                  path={`${ROUTES.ASSIGNED_REVIEWS.slice(1)}/:councilId`}
                  element={<ReviewerProposalReviewWorkspace />}
                />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
