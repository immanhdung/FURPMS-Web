import { CalendarClock, ClipboardCheck, Gavel, Mail, Star, TrendingUp, type LucideIcon } from "lucide-react";
import { KpiCard, KpiCardSkeleton } from "@/components/shared/KpiCard";
import { ChartCard, ChartCardSkeleton } from "@/components/charts/ChartCard";
import { LineChartCardBody } from "@/components/charts/LineChartCard";
import { PieChartCardBody } from "@/components/charts/PieChartCard";
import { ActivityFeed } from "@/components/shared/ActivityFeed";
import { RecentNotificationsCard } from "@/components/notifications/RecentNotificationsCard";
import { QuickActions, type QuickAction } from "@/components/shared/QuickActions";
import { ErrorState } from "@/components/shared/ErrorState";
import { ReviewerLiveQueueCard } from "@/features/dashboard/reviewer/ReviewerLiveQueueCard";
import { useReviewerDashboardQuery } from "@/hooks/useDashboard";
import { ROUTES } from "@/constants/routes";

const KPI_ICONS: Record<string, LucideIcon> = {
  "pending-reviews": ClipboardCheck,
  "assigned-councils": Gavel,
  "completion-rate": TrendingUp,
  "upcoming-meetings": CalendarClock,
};

const QUICK_ACTIONS: QuickAction[] = [
  { label: "Invitations", path: ROUTES.INVITATIONS, icon: Mail },
  { label: "Assigned Reviews", path: ROUTES.ASSIGNED_REVIEWS, icon: ClipboardCheck },
  { label: "Scoring", path: ROUTES.SCORING, icon: Star },
  { label: "Meetings", path: ROUTES.MEETINGS, icon: CalendarClock },
];

export function ReviewerDashboardPage() {
  const { data, isLoading, isError, refetch, isRefetching } = useReviewerDashboardQuery();

  if (isError) {
    return <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Reviewer Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your assigned reviews, councils, and meetings.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => <KpiCardSkeleton key={index} />)
          : data?.kpis.map((kpi, index) => (
              <KpiCard key={kpi.id} datum={kpi} icon={KPI_ICONS[kpi.id] ?? ClipboardCheck} index={index} />
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
            <ChartCard title="Review Completion Trend" description="Completed vs. pending per week">
              <LineChartCardBody
                data={data?.reviewCompletionTrend ?? []}
                xKey="label"
                series={[
                  { key: "completed", label: "Completed", color: "#22C55E" },
                  { key: "pending", label: "Pending", color: "#F59E0B" },
                ]}
              />
            </ChartCard>
            <ChartCard title="Review Decisions" description="Breakdown of your submitted decisions">
              <PieChartCardBody data={data?.reviewDecisions ?? []} nameKey="decision" valueKey="count" />
            </ChartCard>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <ReviewerLiveQueueCard />
        <ActivityFeed items={data?.activity ?? []} isLoading={isLoading} />
        <RecentNotificationsCard />
        <QuickActions actions={QUICK_ACTIONS} />
      </div>
    </div>
  );
}
