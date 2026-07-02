import { ClipboardList } from "lucide-react";
import { KpiCard, KpiCardSkeleton } from "@/components/shared/KpiCard";
import { ChartCard, ChartCardSkeleton } from "@/components/charts/ChartCard";
import { LineChartCardBody } from "@/components/charts/LineChartCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { useAnalyticsOverviewQuery } from "@/hooks/useAnalyticsReports";

export function ReviewAnalyticsTab() {
  const { data, isLoading, isError, refetch, isRefetching } = useAnalyticsOverviewQuery();

  if (isError) return <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {isLoading ? (
          <KpiCardSkeleton />
        ) : (
          <KpiCard datum={{ id: "pending-reviews", label: "Pending Reviews", value: data?.pendingReviews ?? 0 }} icon={ClipboardList} />
        )}
      </div>

      {isLoading ? (
        <ChartCardSkeleton />
      ) : data?.reviewProgress && data.reviewProgress.length > 0 ? (
        <ChartCard title="Review Progress" description="Completed vs. pending reviews over time">
          <LineChartCardBody
            data={data.reviewProgress}
            xKey="label"
            series={[
              { key: "completed", label: "Completed", color: "#22C55E" },
              { key: "pending", label: "Pending", color: "#F59E0B" },
            ]}
          />
        </ChartCard>
      ) : (
        <EmptyState title="No review progress data available" description="Review completion trends will appear here." />
      )}
    </div>
  );
}
