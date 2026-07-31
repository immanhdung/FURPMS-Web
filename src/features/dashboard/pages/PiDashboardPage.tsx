import { CalendarClock, CheckCircle2, Clock, FileBarChart, FilePlus2, FileText, LayoutDashboard, Sparkles, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { KpiCard, KpiCardSkeleton } from "@/components/shared/KpiCard";
import { ChartCard, ChartCardSkeleton } from "@/components/charts/ChartCard";
import { PieChartCardBody } from "@/components/charts/PieChartCard";
import { BarChartCardBody } from "@/components/charts/BarChartCard";
import { ActivityFeed } from "@/components/shared/ActivityFeed";
import { RecentNotificationsCard } from "@/components/notifications/RecentNotificationsCard";
import { QuickActions, type QuickAction } from "@/components/shared/QuickActions";
import { OpenCyclesCard } from "@/features/dashboard/components/OpenCyclesCard";
import { ErrorState } from "@/components/shared/ErrorState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePiDashboardQuery } from "@/hooks/useDashboard";
import { ROUTES } from "@/constants/routes";

const KPI_ICONS: Record<string, LucideIcon> = {
  "my-proposals": FileText,
  approved: CheckCircle2,
  "under-review": Clock,
  deadlines: CalendarClock,
};

const QUICK_ACTIONS: QuickAction[] = [
  { labelKey: "dashboard.actions.submitProposal", path: ROUTES.SUBMIT_PROPOSAL, icon: FilePlus2 },
  { labelKey: "nav.myProposals", path: ROUTES.MY_PROPOSALS, icon: FileText },
  { labelKey: "nav.progressReports", path: ROUTES.PROGRESS_REPORTS, icon: FileBarChart },
  { labelKey: "nav.aiSearch", path: ROUTES.AI_SEARCH, icon: Sparkles },
];

export function PiDashboardPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch, isRefetching } = usePiDashboardQuery();

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
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-brand-accent/15 to-primary/10 text-brand-accent">
          <LayoutDashboard className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("dashboard.pi.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("dashboard.pi.subtitle")}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => <KpiCardSkeleton key={index} />)
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
            <ChartCard title={t("dashboard.pi.proposalStatus")} description={t("dashboard.pi.proposalStatusDesc")}>
              <PieChartCardBody data={data?.proposalStatus ?? []} nameKey="status" valueKey="count" />
            </ChartCard>
            <ChartCard title={t("dashboard.pi.upcomingDeadlines")} description={t("dashboard.pi.byDeliverableType")}>
              <BarChartCardBody data={data?.upcomingDeadlines ?? []} categoryKey="type" valueKey="count" colorful />
            </ChartCard>
          </>
        )}
      </div>

      {/* Đợt đang mở — thầy 29/07: PI phải thấy ngay "đợt nào / loại nào đang mở". */}
      <OpenCyclesCard />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ActivityFeed items={data?.activity ?? []} isLoading={isLoading} />
        <RecentNotificationsCard />
        <Card variant="glass" className="border-primary/15">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-md bg-linear-to-br from-primary to-brand-secondary text-white">
                <Sparkles className="size-3.5" />
              </div>
              <CardTitle className="text-sm">{t("dashboard.pi.aiSuggestions")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <ul className="space-y-2.5">
                {data?.aiSuggestions.map((suggestion, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="rounded-lg border border-primary/10 bg-primary/5 p-2.5 text-xs text-foreground"
                  >
                    {suggestion}
                  </motion.li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <QuickActions actions={QUICK_ACTIONS} />
    </div>
  );
}
