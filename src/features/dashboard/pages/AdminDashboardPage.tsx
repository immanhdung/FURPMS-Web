import {
  BarChart3,
  CalendarRange,
  CheckCircle2,
  ClipboardList,
  FileSignature,
  FileText,
  FolderPlus,
  Gavel,
  UsersRound,
} from "lucide-react";
import { KpiCard, KpiCardSkeleton } from "@/components/shared/KpiCard";
import { ChartCard, ChartCardSkeleton } from "@/components/charts/ChartCard";
import { AreaChartCardBody } from "@/components/charts/AreaChartCard";
import { BarChartCardBody } from "@/components/charts/BarChartCard";
import { PieChartCardBody } from "@/components/charts/PieChartCard";
import { LineChartCardBody } from "@/components/charts/LineChartCard";
import { ActivityFeed } from "@/components/shared/ActivityFeed";
import { RecentNotificationsCard } from "@/components/notifications/RecentNotificationsCard";
import { QuickActions, type QuickAction } from "@/components/shared/QuickActions";
import { ErrorState } from "@/components/shared/ErrorState";
import { useAdminDashboardQuery } from "@/hooks/useDashboard";
import { ROUTES } from "@/constants/routes";
import type { LucideIcon } from "lucide-react";

const KPI_ICONS: Record<string, LucideIcon> = {
  cycles: CalendarRange,
  proposals: FileText,
  approved: CheckCircle2,
  "pending-reviews": ClipboardList,
  councils: Gavel,
  contracts: FileSignature,
};

const QUICK_ACTIONS: QuickAction[] = [
  { label: "New Research Cycle", path: ROUTES.RESEARCH_CYCLES, icon: CalendarRange },
  { label: "Import Topics", path: ROUTES.RESEARCH_TYPES, icon: FolderPlus },
  { label: "Manage Users", path: ROUTES.USERS, icon: UsersRound },
  { label: "View Analytics", path: ROUTES.ANALYTICS, icon: BarChart3 },
];

export function AdminDashboardPage() {
  const { data, isLoading, isError, refetch, isRefetching } = useAdminDashboardQuery();

  if (isError) {
    return <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">System-wide overview across all research cycles.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => <KpiCardSkeleton key={index} />)
          : data?.kpis.map((kpi, index) => (
              <KpiCard key={kpi.id} datum={kpi} icon={KPI_ICONS[kpi.id] ?? FileText} index={index} />
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
            <ChartCard title="Monthly Submission Trend" description="Proposals submitted vs. approved">
              <AreaChartCardBody
                data={data?.monthlyTrend ?? []}
                xKey="label"
                series={[
                  { key: "submitted", label: "Submitted" },
                  { key: "approved", label: "Approved", color: "#14B8A6" },
                ]}
              />
            </ChartCard>
            <ChartCard title="Proposals by Research Field" description="Distribution across active fields">
              <BarChartCardBody data={data?.proposalsByField ?? []} categoryKey="field" valueKey="count" colorful />
            </ChartCard>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {isLoading ? (
          <>
            <ChartCardSkeleton />
            <ChartCardSkeleton />
          </>
        ) : (
          <>
            <ChartCard title="Review Progress" description="Completed vs. pending reviews per week">
              <LineChartCardBody
                data={data?.reviewProgress ?? []}
                xKey="label"
                series={[
                  { key: "completed", label: "Completed", color: "#22C55E" },
                  { key: "pending", label: "Pending", color: "#F59E0B" },
                ]}
              />
            </ChartCard>
            <ChartCard title="Budget Distribution" description="Allocated budget by category">
              <PieChartCardBody data={data?.budgetDistribution ?? []} nameKey="category" valueKey="amount" />
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
