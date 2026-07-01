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
import { useBootstrapAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import { APP_ROUTE_GROUPS } from "@/app/router/routes";
import { ProtectedRoute } from "@/app/router/ProtectedRoute";
import { PublicOnlyRoute } from "@/app/router/PublicOnlyRoute";
import { RoleGuard } from "@/app/router/RoleGuard";

function FeaturePage({ path }: { path: string }) {
  if (path === ROUTES.NOTIFICATIONS) return <NotificationsPage />;
  return <ComingSoonPage />;
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
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
