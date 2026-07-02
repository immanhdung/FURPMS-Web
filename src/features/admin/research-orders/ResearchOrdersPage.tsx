import { useMemo, useState } from "react";
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

export function ResearchOrdersPage() {
  const { data, isLoading, isError, refetch, isRefetching } = useResearchOrdersQuery();
  const { data: cycles } = useCyclesQuery();
  const { data: units } = useOrganizationalUnitsQuery();

  const [createOpen, setCreateOpen] = useState(false);
  const [detailOrderId, setDetailOrderId] = useState<number | null>(null);

  const cycleNames = useMemo(() => Object.fromEntries((cycles ?? []).map((c) => [c.id, c.name])), [cycles]);
  const unitNames = useMemo(() => Object.fromEntries((units ?? []).map((u) => [u.id, u.name])), [units]);

  const columns = getResearchOrderColumns({
    cycleNames,
    unitNames,
    onView: (order) => setDetailOrderId(order.id),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Research Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Applied research topics ordered by external units.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus />
          New order
        </Button>
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />
      ) : (
        <DataTable
          columns={columns}
          data={data ?? []}
          isLoading={isLoading}
          searchPlaceholder="Search research orders..."
          exportFileName="research-orders"
          emptyTitle="No research orders found"
          emptyDescription="Create an order to import an applied research topic."
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
