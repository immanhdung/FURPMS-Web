import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/tables/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { useResearchOrdersQuery } from "@/hooks/useResearchOrders";
import { useCyclesQuery } from "@/hooks/useCycles";
import { useOrganizationalUnitsQuery } from "@/hooks/useOrganizationalUnits";
import { getResearchOrderColumns } from "@/features/admin/research-orders/columns";
import { CreateResearchOrderSheet } from "@/features/admin/research-orders/CreateResearchOrderSheet";
import { ResearchOrderDetailSheet } from "@/features/admin/research-orders/ResearchOrderDetailSheet";
import { sortByIdDesc } from "@/utils/sort";

export function ResearchOrdersPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch, isRefetching } = useResearchOrdersQuery();
  const { data: cycles } = useCyclesQuery();
  const { data: units } = useOrganizationalUnitsQuery();

  const [createOpen, setCreateOpen] = useState(false);
  const [detailOrderId, setDetailOrderId] = useState<number | null>(null);

  const cycleNames = useMemo(() => Object.fromEntries((cycles ?? []).map((c) => [c.id, c.name])), [cycles]);
  const unitNames = useMemo(() => Object.fromEntries((units ?? []).map((u) => [u.id, u.name])), [units]);
  const sortedData = useMemo(() => sortByIdDesc(data), [data]);

  const columns = useMemo(
    () =>
      getResearchOrderColumns({
        t,
        cycleNames,
        unitNames,
        onView: (order) => setDetailOrderId(order.id),
      }),
    [t, cycleNames, unitNames]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("researchOrders.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("researchOrders.subtitle")}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus />
          {t("researchOrders.newBtn")}
        </Button>
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />
      ) : (
        <DataTable
          columns={columns}
          data={sortedData}
          isLoading={isLoading}
          searchPlaceholder={t("researchOrders.searchPlaceholder")}
          exportFileName="research-orders"
          emptyTitle={t("researchOrders.emptyTitle")}
          emptyDescription={t("researchOrders.emptyDesc")}
        />
      )}

      <CreateResearchOrderSheet open={createOpen} onOpenChange={setCreateOpen} />
      <ResearchOrderDetailSheet
        open={Boolean(detailOrderId)}
        onOpenChange={(open) => !open && setDetailOrderId(null)}
        orderId={detailOrderId}
      />
    </div>
  );
}
