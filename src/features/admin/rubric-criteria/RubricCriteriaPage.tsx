import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch, isRefetching } = useRubricCriteriaQuery();
  const deleteMutation = useDeleteRubricCriterionMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCriterion, setEditingCriterion] = useState<RubricCriterion | null>(null);
  const [deletingCriterion, setDeletingCriterion] = useState<RubricCriterion | null>(null);

  const columns = useMemo(
    () =>
      getRubricCriterionColumns({
        t,
        onEdit: (criterion) => {
          setEditingCriterion(criterion);
          setFormOpen(true);
        },
        onDelete: (criterion) => setDeletingCriterion(criterion),
      }),
    [t]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("rubricCriteria.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("rubricCriteria.subtitle")}</p>
        </div>
        <Button
          onClick={() => {
            setEditingCriterion(null);
            setFormOpen(true);
          }}
        >
          <Plus />
          {t("rubricCriteria.newBtn")}
        </Button>
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />
      ) : (
        <DataTable
          columns={columns}
          data={data ?? []}
          isLoading={isLoading}
          searchPlaceholder={t("rubricCriteria.searchPlaceholder")}
          exportFileName="rubric-criteria"
          emptyTitle={t("rubricCriteria.emptyTitle")}
          emptyDescription={t("rubricCriteria.emptyDesc")}
        />
      )}

      <RubricCriterionFormSheet open={formOpen} onOpenChange={setFormOpen} criterion={editingCriterion} />

      <ConfirmDialog
        open={Boolean(deletingCriterion)}
        onOpenChange={(open) => !open && setDeletingCriterion(null)}
        title={t("rubricCriteria.deleteTitle")}
        description={t("rubricCriteria.deleteDesc", { name: deletingCriterion?.name ?? "" })}
        variant="destructive"
        confirmLabel={t("common.delete")}
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
