import { CalendarClock, Gavel, Mail, TrendingUp, UserPlus, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { KpiCard, KpiCardSkeleton } from "@/components/shared/KpiCard";
import { ChartCard, ChartCardSkeleton } from "@/components/charts/ChartCard";
import { AreaChartCardBody } from "@/components/charts/AreaChartCard";
import { BarChartCardBody } from "@/components/charts/BarChartCard";
import { ActivityFeed } from "@/components/shared/ActivityFeed";
import { RecentNotificationsCard } from "@/components/notifications/RecentNotificationsCard";
import { QuickActions, type QuickAction } from "@/components/shared/QuickActions";
import { ErrorState } from "@/components/shared/ErrorState";
import { useStaffDashboardQuery } from "@/hooks/useDashboard";
import { ROUTES } from "@/constants/routes";

const KPI_ICONS: Record<string, LucideIcon> = {
  "review-progress": TrendingUp,
  "upcoming-meetings": CalendarClock,
  "pending-invitations": Mail,
  "council-performance": Gavel,
};

const QUICK_ACTIONS: QuickAction[] = [
  { labelKey: "dashboard.actions.createCouncil", path: ROUTES.COUNCILS, icon: Gavel },
  { labelKey: "dashboard.actions.scheduleMeeting", path: ROUTES.MEETINGS, icon: CalendarClock },
  { labelKey: "dashboard.actions.inviteReviewer", path: ROUTES.ASSIGNMENTS, icon: UserPlus },
  { labelKey: "nav.proposalReviews", path: ROUTES.PROPOSAL_REVIEWS, icon: TrendingUp },
];

export function StaffDashboardPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch, isRefetching } = useStaffDashboardQuery();

  if (isError) {
    return <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("dashboard.staff.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("dashboard.staff.subtitle")}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => <KpiCardSkeleton key={index} />)
          : data?.kpis.map((kpi, index) => (
              <KpiCard key={kpi.id} datum={kpi} icon={KPI_ICONS[kpi.id] ?? TrendingUp} index={index} />
            ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {isLoading ? (
          <>
            <ChartCardSkeleton />
            <ChartCardSkeleton />
          </>
        ) : (
          <>
            <ChartCard title={t("dashboard.staff.reviewProgress")} description={t("dashboard.staff.reviewProgressDesc")}>
              <AreaChartCardBody
                data={data?.reviewProgress ?? []}
                xKey="label"
                series={[
                  { key: "completed", label: "Completed", color: "#22C55E" },
                  { key: "pending", label: "Pending", color: "#F59E0B" },
                ]}
              />
            </ChartCard>
            <ChartCard title={t("dashboard.staff.councilPerformance")} description={t("dashboard.staff.councilPerformanceDesc")}>
              <BarChartCardBody
                data={data?.councilPerformance ?? []}
                categoryKey="council"
                valueKey="score"
                layout="vertical"
                colorful
              />
            </ChartCard>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ActivityFeed items={data?.activity ?? []} isLoading={isLoading} />
        <RecentNotificationsCard />
        <QuickActions actions={QUICK_ACTIONS} />
      </div>
    </div>
  );
}
