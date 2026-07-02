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
  const { data, isLoading, isError, refetch, isRefetching } = useAnalyticsOverviewQuery();

  if (isError) return <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />;

  const kpis: KpiDatum[] = [
    { id: "cycles", label: "Total Cycles", value: data?.totalCycles ?? 0 },
    { id: "proposals", label: "Total Proposals", value: data?.totalProposals ?? 0 },
    { id: "approved", label: "Approved Proposals", value: data?.approvedProposals ?? 0 },
    { id: "pending-reviews", label: "Pending Reviews", value: data?.pendingReviews ?? 0 },
    { id: "councils", label: "Total Councils", value: data?.totalCouncils ?? 0 },
    { id: "contracts", label: "Total Contracts", value: data?.totalContracts ?? 0 },
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
        <ChartCard title="Monthly Submission Trend" description="Proposals submitted vs. approved">
          <AreaChartCardBody
            data={data.monthlyTrend}
            xKey="label"
            series={[
              { key: "submitted", label: "Submitted" },
              { key: "approved", label: "Approved", color: "#14B8A6" },
            ]}
          />
        </ChartCard>
      ) : (
        <EmptyState title="No trend data available" description="Monthly submission trend will appear once data is available." />
      )}
    </div>
  );
}
