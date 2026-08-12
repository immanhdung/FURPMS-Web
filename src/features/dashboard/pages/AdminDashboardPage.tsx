import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import {
  BarChart3,
  CalendarRange,
  CheckCircle2,
  ClipboardList,
  FileSignature,
  FileText,
  FolderPlus,
  Gavel,
  LayoutDashboard,
  UsersRound,
} from "lucide-react";
import { KpiCard, KpiCardSkeleton } from "@/components/shared/KpiCard";
import { ChartCard, ChartCardSkeleton } from "@/components/charts/ChartCard";
import { AreaChartCardBody } from "@/components/charts/AreaChartCard";
import { BarChartCardBody } from "@/components/charts/BarChartCard";
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
  { labelKey: "dashboard.actions.newCycle", path: ROUTES.RESEARCH_CYCLES, icon: CalendarRange },
  { labelKey: "dashboard.actions.importTopics", path: ROUTES.RESEARCH_TYPES, icon: FolderPlus },
  { labelKey: "dashboard.actions.manageUsers", path: ROUTES.USERS, icon: UsersRound },
  { labelKey: "dashboard.actions.viewAnalytics", path: ROUTES.ANALYTICS, icon: BarChart3 },
];

export function AdminDashboardPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch, isRefetching } = useAdminDashboardQuery();

  if (isError) {
    return <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />;
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-3"
      >
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary/15 to-brand-secondary/10 text-primary">
          <LayoutDashboard className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("dashboard.admin.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("dashboard.admin.subtitle")}</p>
        </div>
      </motion.div>

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
            <ChartCard title={t("dashboard.admin.monthlyTrend")} description={t("dashboard.admin.monthlyTrendDesc")}>
              <AreaChartCardBody
                data={data?.monthlyTrend ?? []}
                xKey="label"
                series={[
                  { key: "submitted", label: t("analytics.seriesSubmitted") },
                  { key: "approved", label: t("analytics.seriesApproved"), color: "#14B8A6" },
                ]}
              />
            </ChartCard>
            <ChartCard title={t("dashboard.admin.byField")} description={t("dashboard.admin.byFieldDesc")}>
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
            <ChartCard title={t("dashboard.staff.reviewProgress")} description={t("dashboard.staff.reviewProgressDesc")}>
              <LineChartCardBody
                data={data?.reviewProgress ?? []}
                xKey="label"
                series={[
                  { key: "completed", label: t("analytics.seriesCompleted"), color: "#22C55E" },
                  { key: "pending", label: t("analytics.seriesPending"), color: "#F59E0B" },
                ]}
              />
            </ChartCard>
            {/* Ẩn "Phân bổ kinh phí" (rule tuần 10 — hệ thống không quản tiền). */}
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
