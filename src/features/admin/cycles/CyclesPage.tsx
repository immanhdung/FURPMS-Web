import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/tables/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useCloseCycleMutation, useCyclesQuery, useOpenCycleMutation } from "@/hooks/useCycles";
import { useResearchTypesQuery } from "@/hooks/useResearchTypes";
import { getCycleColumns } from "@/features/admin/cycles/columns";
import { CycleFormSheet } from "@/features/admin/cycles/CycleFormSheet";
import { CycleDetailSheet } from "@/features/admin/cycles/CycleDetailSheet";
import type { Cycle } from "@/types/cycle";

export function CyclesPage() {
  const { data, isLoading, isError, refetch, isRefetching } = useCyclesQuery();
  const { data: researchTypes } = useResearchTypesQuery();
  const openMutation = useOpenCycleMutation();
  const closeMutation = useCloseCycleMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCycle, setEditingCycle] = useState<Cycle | null>(null);
  const [detailCycleId, setDetailCycleId] = useState<number | null>(null);
  const [closingCycle, setClosingCycle] = useState<Cycle | null>(null);

  const researchTypeNames = useMemo(
    () => Object.fromEntries((researchTypes ?? []).map((rt) => [rt.id, rt.name])),
    [researchTypes]
  );

  const columns = getCycleColumns({
    researchTypeNames,
    onView: (cycle) => setDetailCycleId(cycle.id),
    onEdit: (cycle) => {
      setEditingCycle(cycle);
      setFormOpen(true);
    },
    onOpen: (cycle) => openMutation.mutate(cycle.id),
    onClose: (cycle) => setClosingCycle(cycle),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Research Cycles</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage submission windows and open/close cycles for proposals.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingCycle(null);
            setFormOpen(true);
          }}
        >
          <Plus />
          New cycle
        </Button>
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />
      ) : (
        <DataTable
          columns={columns}
          data={data ?? []}
          isLoading={isLoading}
          searchPlaceholder="Search cycles..."
          exportFileName="research-cycles"
          emptyTitle="No research cycles found"
          emptyDescription="Create a cycle to open submissions for a research type."
        />
      )}

      <CycleFormSheet open={formOpen} onOpenChange={setFormOpen} cycle={editingCycle} />
      <CycleDetailSheet
        open={Boolean(detailCycleId)}
        onOpenChange={(open) => !open && setDetailCycleId(null)}
        cycleId={detailCycleId}
      />

      <ConfirmDialog
        open={Boolean(closingCycle)}
        onOpenChange={(open) => !open && setClosingCycle(null)}
        title="Close cycle"
        description={`Are you sure you want to close "${closingCycle?.name}"? PIs will no longer be able to submit proposals for this cycle.`}
        variant="destructive"
        confirmLabel="Close cycle"
        isLoading={closeMutation.isPending}
        onConfirm={() =>
          closingCycle &&
          closeMutation.mutate(closingCycle.id, {
            onSuccess: () => setClosingCycle(null),
          })
        }
      />
    </div>
  );
}
