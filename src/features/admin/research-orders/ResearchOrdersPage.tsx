import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { ClipboardList, Plus } from "lucide-react";
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
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary/15 to-brand-secondary/10 text-primary">
            <ClipboardList className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("researchOrders.title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("researchOrders.subtitle")}
            </p>
          </div>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus />
          {t("researchOrders.newBtn")}
        </Button>
      </motion.div>

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
