import type { ComponentType } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { ComingSoonPage } from "@/components/shared/ComingSoonPage";
import { NotFoundPage } from "@/components/shared/NotFoundPage";
import { UnauthorizedPage } from "@/components/shared/UnauthorizedPage";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { ChangePasswordPage } from "@/features/auth/pages/ChangePasswordPage";
import { ProfilePage } from "@/features/auth/pages/ProfilePage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { NotificationsPage } from "@/features/notification/pages/NotificationsPage";
import { UsersPage } from "@/features/admin/users/UsersPage";
import { CyclesPage } from "@/features/admin/cycles/CyclesPage";
import { ResearchTypesPage } from "@/features/admin/research-types/ResearchTypesPage";
import { ResearchOrdersPage } from "@/features/admin/research-orders/ResearchOrdersPage";
import { BudgetCategoriesPage } from "@/features/admin/budget-categories/BudgetCategoriesPage";
import { FinancialConfigsPage } from "@/features/admin/financial-configs/FinancialConfigsPage";
import { OrganizationalUnitsPage } from "@/features/admin/organizational-units/OrganizationalUnitsPage";
import { RubricCriteriaPage } from "@/features/admin/rubric-criteria/RubricCriteriaPage";
import { ProposalReviewsPage } from "@/features/staff/proposal-reviews/ProposalReviewsPage";
import { ProposalReviewWorkspace } from "@/features/staff/proposal-reviews/ProposalReviewWorkspace";
import { CouncilsPage } from "@/features/staff/councils/CouncilsPage";
import { AssignmentsPage } from "@/features/staff/assignments/AssignmentsPage";
import { MeetingsPage } from "@/features/staff/meetings/MeetingsPage";
import { useBootstrapAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import { APP_ROUTE_GROUPS } from "@/app/router/routes";
import { ProtectedRoute } from "@/app/router/ProtectedRoute";
import { PublicOnlyRoute } from "@/app/router/PublicOnlyRoute";
import { RoleGuard } from "@/app/router/RoleGuard";
import { NAV_ITEMS } from "@/constants/nav";

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
  [ROUTES.COUNCILS]: CouncilsPage,
  [ROUTES.ASSIGNMENTS]: AssignmentsPage,
  [ROUTES.MEETINGS]: MeetingsPage,
};

const proposalReviewsRoles = NAV_ITEMS.find((item) => item.path === ROUTES.PROPOSAL_REVIEWS)?.roles ?? [];

function FeaturePage({ path }: { path: string }) {
  const Page = FEATURE_PAGES[path];
  return Page ? <Page /> : <ComingSoonPage />;
}

export function AppRouter() {
  useBootstrapAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route element={<AuthLayout />}>
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          </Route>
        </Route>

        <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
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
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
