import { ChartCard, ChartCardSkeleton } from "@/components/charts/ChartCard";
import { BarChartCardBody } from "@/components/charts/BarChartCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { useAnalyticsFunnelQuery } from "@/hooks/useAnalyticsReports";

export function FunnelTab({ cycleId }: { cycleId?: number }) {
  const { data, isLoading, isError, refetch, isRefetching } = useAnalyticsFunnelQuery(cycleId);

  if (isError) return <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />;
  if (isLoading) return <ChartCardSkeleton height={360} />;

  const stages = (data ?? []).filter((item) => item.stage);

  if (stages.length === 0) {
    return <EmptyState title="No funnel data available" description="Proposal funnel stages will appear here once proposals move through review." />;
  }

  return (
    <ChartCard title="Proposal Funnel" description="Proposals at each stage of the review pipeline" height={360}>
      <BarChartCardBody data={stages} categoryKey="stage" valueKey="count" layout="vertical" colorful />
    </ChartCard>
  );
}
