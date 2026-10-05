import { useTranslation } from "react-i18next";
import { Gavel } from "lucide-react";
import { KpiCard, KpiCardSkeleton } from "@/components/shared/KpiCard";
import { ChartCard, ChartCardSkeleton } from "@/components/charts/ChartCard";
import { BarChartCardBody } from "@/components/charts/BarChartCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { useAnalyticsOverviewQuery } from "@/hooks/useAnalyticsReports";

export function CouncilAnalyticsTab() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch, isRefetching } = useAnalyticsOverviewQuery();

  if (isError) return <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {isLoading ? (
          <KpiCardSkeleton />
        ) : (
          <KpiCard datum={{ id: "councils", label: t("analytics.kpiCouncils"), value: data?.totalCouncils ?? 0 }} icon={Gavel} />
        )}
      </div>

      {isLoading ? (
        <ChartCardSkeleton />
      ) : data?.councilPerformance && data.councilPerformance.length > 0 ? (
        <ChartCard title={t("analytics.councilPerformance")} description={t("analytics.councilPerformanceDesc")}>
          <BarChartCardBody data={data.councilPerformance} categoryKey="council" valueKey="score" layout="vertical" colorful />
        </ChartCard>
      ) : (
        <EmptyState title={t("analytics.noCouncilPerf")} description={t("analytics.noCouncilPerfDesc")} />
      )}
    </div>
  );
}
