import { ChartCard, ChartCardSkeleton } from "@/components/charts/ChartCard";
import { BarChartCardBody } from "@/components/charts/BarChartCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { useAnalyticsByTrackQuery } from "@/hooks/useAnalyticsReports";

export function ResearchFieldTab({ cycleId }: { cycleId?: number }) {
  const { data, isLoading, isError, refetch, isRefetching } = useAnalyticsByTrackQuery(cycleId);

  if (isError) return <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />;
  if (isLoading) return <ChartCardSkeleton height={360} />;

  const tracks = (data ?? []).filter((item) => item.trackName);

  if (tracks.length === 0) {
    return <EmptyState title="No research field data available" description="Proposal distribution by research field will appear here." />;
  }

  return (
    <ChartCard title="Proposals by Research Field" description="Distribution of proposals across active research fields" height={360}>
      <BarChartCardBody data={tracks} categoryKey="trackName" valueKey="proposalCount" colorful />
    </ChartCard>
  );
}
