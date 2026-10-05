import { useTranslation } from "react-i18next";
import { Wallet } from "lucide-react";
import { KpiCard, KpiCardSkeleton } from "@/components/shared/KpiCard";
import { ChartCard, ChartCardSkeleton } from "@/components/charts/ChartCard";
import { PieChartCardBody } from "@/components/charts/PieChartCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { useAnalyticsOverviewQuery } from "@/hooks/useAnalyticsReports";

export function BudgetAnalyticsTab() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch, isRefetching } = useAnalyticsOverviewQuery();

  if (isError) return <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {isLoading ? (
          <KpiCardSkeleton />
        ) : (
          <KpiCard
            datum={{ id: "budget", label: t("analytics.kpiBudget"), value: data?.totalBudget ?? 0, format: "currency" }}
            icon={Wallet}
          />
        )}
      </div>

      {isLoading ? (
        <ChartCardSkeleton />
      ) : data?.budgetDistribution && data.budgetDistribution.length > 0 ? (
        <ChartCard title={t("analytics.budgetDist")} description={t("analytics.budgetDistDesc")}>
          <PieChartCardBody data={data.budgetDistribution} nameKey="category" valueKey="amount" />
        </ChartCard>
      ) : (
        <EmptyState title={t("analytics.noBudget")} description={t("analytics.noBudgetDesc")} />
      )}
    </div>
  );
}
