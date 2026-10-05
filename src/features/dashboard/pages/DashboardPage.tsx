import { useAuthStore } from "@/store/auth.store";
import { useTranslation } from "react-i18next";
import { ROLES } from "@/constants/roles";
import { AdminDashboardPage } from "@/features/dashboard/pages/AdminDashboardPage";
import { StaffDashboardPage } from "@/features/dashboard/pages/StaffDashboardPage";
import { PiDashboardPage } from "@/features/dashboard/pages/PiDashboardPage";
import { ReviewerDashboardPage } from "@/features/dashboard/pages/ReviewerDashboardPage";
import { PageLoader } from "@/components/shared/PageLoader";
import { EmptyState } from "@/components/shared/EmptyState";
import { LayoutDashboard } from "lucide-react";

export function DashboardPage() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const activeRole = useAuthStore((state) => state.activeRole);

  if (!user) {
    return <PageLoader label={t("dashboard.loading")} />;
  }

  switch (activeRole) {
    case ROLES.ADMIN:
      return <AdminDashboardPage />;
    case ROLES.STAFF:
      return <StaffDashboardPage />;
    case ROLES.FACULTY:
      return <PiDashboardPage />;
    case ROLES.REVIEW_COMMITTEE:
      return <ReviewerDashboardPage />;
    default:
      return (
        <div className="flex min-h-[70vh] items-center justify-center">
          <EmptyState
            icon={LayoutDashboard}
            title={t("dashboard.notConfigured")}
            description={t("dashboard.notConfiguredDesc")}
          />
        </div>
      );
  }
}
