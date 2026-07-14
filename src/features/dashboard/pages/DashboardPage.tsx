import { useAuthStore } from "@/store/auth.store";
import { ROLES, getPrimaryRole } from "@/constants/roles";
import { AdminDashboardPage } from "@/features/dashboard/pages/AdminDashboardPage";
import { StaffDashboardPage } from "@/features/dashboard/pages/StaffDashboardPage";
import { PiDashboardPage } from "@/features/dashboard/pages/PiDashboardPage";
import { ReviewerDashboardPage } from "@/features/dashboard/pages/ReviewerDashboardPage";
import { PageLoader } from "@/components/shared/PageLoader";
import { EmptyState } from "@/components/shared/EmptyState";
import { LayoutDashboard } from "lucide-react";

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <PageLoader label="Loading your dashboard..." />;
  }

  const primaryRole = getPrimaryRole(user.roles);

  switch (primaryRole) {
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
            title="No dashboard configured"
            description="Your account doesn't have a role with an associated dashboard yet. Contact your administrator."
          />
        </div>
      );
  }
}
