import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/tables/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useDeleteRubricCriterionMutation, useRubricCriteriaQuery } from "@/hooks/useRubricCriteria";
import { getRubricCriterionColumns } from "@/features/admin/rubric-criteria/columns";
import { RubricCriterionFormSheet } from "@/features/admin/rubric-criteria/RubricCriterionFormSheet";
import type { RubricCriterion } from "@/types/rubric-criterion";

export function RubricCriteriaPage() {
  const { data, isLoading, isError, refetch, isRefetching } = useRubricCriteriaQuery();
  const deleteMutation = useDeleteRubricCriterionMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCriterion, setEditingCriterion] = useState<RubricCriterion | null>(null);
  const [deletingCriterion, setDeletingCriterion] = useState<RubricCriterion | null>(null);

  const columns = useMemo(
    () =>
      getRubricCriterionColumns({
        onEdit: (criterion) => {
          setEditingCriterion(criterion);
          setFormOpen(true);
        },
        onDelete: (criterion) => setDeletingCriterion(criterion),
      }),
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Rubric Criteria</h1>
          <p className="mt-1 text-sm text-muted-foreground">Scoring criteria used by reviewers in each round.</p>
        </div>
        <Button
          onClick={() => {
            setEditingCriterion(null);
            setFormOpen(true);
          }}
        >
          <Plus />
          New criterion
        </Button>
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />
      ) : (
        <DataTable
          columns={columns}
          data={data ?? []}
          isLoading={isLoading}
          searchPlaceholder="Search rubric criteria..."
          exportFileName="rubric-criteria"
          emptyTitle="No rubric criteria found"
          emptyDescription="Create a criterion to score proposals during review."
        />
      )}

      <RubricCriterionFormSheet open={formOpen} onOpenChange={setFormOpen} criterion={editingCriterion} />

      <ConfirmDialog
        open={Boolean(deletingCriterion)}
        onOpenChange={(open) => !open && setDeletingCriterion(null)}
        title="Delete rubric criterion"
        description={`Are you sure you want to delete "${deletingCriterion?.name}"? This action cannot be undone.`}
        variant="destructive"
        confirmLabel="Delete"
        isLoading={deleteMutation.isPending}
        onConfirm={() =>
          deletingCriterion &&
          deleteMutation.mutate(deletingCriterion.id, {
            onSuccess: () => setDeletingCriterion(null),
          })
        }
      />
    </div>
  );
}
