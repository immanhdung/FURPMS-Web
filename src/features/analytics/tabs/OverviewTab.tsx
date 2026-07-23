import { useTranslation } from "react-i18next";
import {
  CalendarRange,
  CheckCircle2,
  ClipboardList,
  FileSignature,
  FileText,
  Gavel,
  type LucideIcon,
} from "lucide-react";
import { KpiCard, KpiCardSkeleton } from "@/components/shared/KpiCard";
import { ChartCard, ChartCardSkeleton } from "@/components/charts/ChartCard";
import { AreaChartCardBody } from "@/components/charts/AreaChartCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { useAnalyticsOverviewQuery } from "@/hooks/useAnalyticsReports";
import type { KpiDatum } from "@/types/dashboard";

const KPI_ICONS: Record<string, LucideIcon> = {
  cycles: CalendarRange,
  proposals: FileText,
  approved: CheckCircle2,
  "pending-reviews": ClipboardList,
  councils: Gavel,
  contracts: FileSignature,
};

export function OverviewTab() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch, isRefetching } = useAnalyticsOverviewQuery();

  if (isError) return <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />;

  const kpis: KpiDatum[] = [
    { id: "cycles", label: t("analytics.kpiCycles"), value: data?.totalCycles ?? 0 },
    { id: "proposals", label: t("analytics.kpiProposals"), value: data?.totalProposals ?? 0 },
    { id: "approved", label: t("analytics.kpiApproved"), value: data?.approvedProposals ?? 0 },
    { id: "pending-reviews", label: t("analytics.kpiPendingReviews"), value: data?.pendingReviews ?? 0 },
    { id: "councils", label: t("analytics.kpiCouncils"), value: data?.totalCouncils ?? 0 },
    { id: "contracts", label: t("analytics.kpiContracts"), value: data?.totalContracts ?? 0 },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => <KpiCardSkeleton key={index} />)
          : kpis.map((kpi, index) => <KpiCard key={kpi.id} datum={kpi} icon={KPI_ICONS[kpi.id] ?? FileText} index={index} />)}
      </div>

      {isLoading ? (
        <ChartCardSkeleton />
      ) : data?.monthlyTrend && data.monthlyTrend.length > 0 ? (
        <ChartCard title={t("analytics.monthlyTrend")} description={t("analytics.monthlyTrendDesc")}>
          <AreaChartCardBody
            data={data.monthlyTrend}
            xKey="label"
            series={[
              { key: "submitted", label: t("analytics.submitted") },
              { key: "approved", label: t("analytics.approved"), color: "#14B8A6" },
            ]}
          />
        </ChartCard>
      ) : (
        <EmptyState title={t("analytics.noTrend")} description={t("analytics.noTrendDesc")} />
      )}
    </div>
  );
}
