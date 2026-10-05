import { useTranslation } from "react-i18next";
import { ClipboardList } from "lucide-react";
import { KpiCard, KpiCardSkeleton } from "@/components/shared/KpiCard";
import { ChartCard, ChartCardSkeleton } from "@/components/charts/ChartCard";
import { LineChartCardBody } from "@/components/charts/LineChartCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { useAnalyticsOverviewQuery } from "@/hooks/useAnalyticsReports";

export function ReviewAnalyticsTab() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch, isRefetching } = useAnalyticsOverviewQuery();

  if (isError) return <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {isLoading ? (
          <KpiCardSkeleton />
        ) : (
          <KpiCard datum={{ id: "pending-reviews", label: t("analytics.kpiPendingReviews"), value: data?.pendingReviews ?? 0 }} icon={ClipboardList} />
        )}
      </div>

      {isLoading ? (
        <ChartCardSkeleton />
      ) : data?.reviewProgress && data.reviewProgress.length > 0 ? (
        <ChartCard title={t("analytics.reviewProgress")} description={t("analytics.reviewProgressDesc")}>
          <LineChartCardBody
            data={data.reviewProgress}
            xKey="label"
            series={[
              { key: "completed", label: t("analytics.completed"), color: "#22C55E" },
              { key: "pending", label: t("analytics.pending"), color: "#F59E0B" },
            ]}
          />
        </ChartCard>
      ) : (
        <EmptyState title={t("analytics.noReviewProgress")} description={t("analytics.noReviewProgressDesc")} />
      )}
    </div>
  );
}
