import { useTranslation } from "react-i18next";
import { ChartCard, ChartCardSkeleton } from "@/components/charts/ChartCard";
import { BarChartCardBody } from "@/components/charts/BarChartCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { useAnalyticsFunnelQuery } from "@/hooks/useAnalyticsReports";

export function FunnelTab({ cycleId }: { cycleId?: number }) {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch, isRefetching } = useAnalyticsFunnelQuery(cycleId);

  if (isError) return <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />;
  if (isLoading) return <ChartCardSkeleton height={360} />;

  const stages = (data ?? []).filter((item) => item.stage);

  if (stages.length === 0) {
    return <EmptyState title={t("analytics.noFunnel")} description={t("analytics.noFunnelDesc")} />;
  }

  return (
    <ChartCard title={t("analytics.funnelTitle")} description={t("analytics.funnelDesc")} height={360}>
      <BarChartCardBody data={stages} categoryKey="stage" valueKey="count" layout="vertical" colorful />
    </ChartCard>
  );
}
