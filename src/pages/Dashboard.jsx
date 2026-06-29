import React, { lazy, Suspense } from "react";
import { useAuthStore } from "../store/authStore";
import { LoadingState } from "../components/shared/LoadingState";

// Lazy-load role-specific dashboards (code-split per vercel-react-best-practices)
const PiDashboard = lazy(() => import("./dashboard/PiDashboard"));
const StaffDashboard = lazy(() => import("./dashboard/StaffDashboard"));
const AdminDashboard = lazy(() => import("./dashboard/AdminDashboard"));
const ReviewerDashboard = lazy(() => import("./dashboard/ReviewerDashboard"));

/**
 * Dashboard Router/Wrapper
 * 
 * Checks user role from authStore and renders the appropriate
 * role-specific dashboard component. Each sub-dashboard is
 * lazy-loaded and handles its own data fetching via React Query hooks.
 */
export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const hasRole = useAuthStore((s) => s.hasRole);

  return (
    <div className="animate-in fade-in duration-500 motion-reduce:animate-none">
      <Suspense fallback={<LoadingState message="Đang tải dashboard…" />}>
        {hasRole(["Admin"]) ? (
          <AdminDashboard user={user} />
        ) : hasRole(["Staff"]) ? (
          <StaffDashboard user={user} />
        ) : hasRole(["ReviewCommittee"]) ? (
          <ReviewerDashboard user={user} />
        ) : (
          <PiDashboard user={user} />
        )}
      </Suspense>
    </div>
  );
}
