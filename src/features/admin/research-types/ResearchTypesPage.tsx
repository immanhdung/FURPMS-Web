import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/tables/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useDeleteResearchTypeMutation, useResearchTypesQuery } from "@/hooks/useResearchTypes";
import { getResearchTypeColumns } from "@/features/admin/research-types/columns";
import { ResearchTypeFormSheet } from "@/features/admin/research-types/ResearchTypeFormSheet";
import type { ResearchType } from "@/types/research-type";

export function ResearchTypesPage() {
  const { data, isLoading, isError, refetch, isRefetching } = useResearchTypesQuery(true);
  const deleteMutation = useDeleteResearchTypeMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editingType, setEditingType] = useState<ResearchType | null>(null);
  const [deletingType, setDeletingType] = useState<ResearchType | null>(null);

  const columns = useMemo(
    () =>
      getResearchTypeColumns({
        onEdit: (rt) => {
          setEditingType(rt);
          setFormOpen(true);
        },
        onDelete: (rt) => setDeletingType(rt),
      }),
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Research Types</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Basic and Applied research categories used when opening a cycle.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingType(null);
            setFormOpen(true);
          }}
        >
          <Plus />
          New research type
        </Button>
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />
      ) : (
        <DataTable
          columns={columns}
          data={data ?? []}
          isLoading={isLoading}
          searchPlaceholder="Search research types..."
          exportFileName="research-types"
          emptyTitle="No research types found"
          emptyDescription="Create Basic or Applied Research to get started."
        />
      )}

      <ResearchTypeFormSheet open={formOpen} onOpenChange={setFormOpen} researchType={editingType} />

      <ConfirmDialog
        open={Boolean(deletingType)}
        onOpenChange={(open) => !open && setDeletingType(null)}
        title="Delete research type"
        description={`Are you sure you want to delete "${deletingType?.name}"? This action cannot be undone.`}
        variant="destructive"
        confirmLabel="Delete"
        isLoading={deleteMutation.isPending}
        onConfirm={() =>
          deletingType &&
          deleteMutation.mutate(deletingType.id, {
            onSuccess: () => setDeletingType(null),
          })
        }
      />
    </div>
  );
}
