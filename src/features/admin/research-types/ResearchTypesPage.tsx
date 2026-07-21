import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch, isRefetching } = useResearchTypesQuery(true);
  const deleteMutation = useDeleteResearchTypeMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editingType, setEditingType] = useState<ResearchType | null>(null);
  const [deletingType, setDeletingType] = useState<ResearchType | null>(null);

  const columns = useMemo(
    () =>
      getResearchTypeColumns({
        t,
        onEdit: (rt) => {
          setEditingType(rt);
          setFormOpen(true);
        },
        onDelete: (rt) => setDeletingType(rt),
      }),
    [t]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("researchTypes.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("researchTypes.subtitle")}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingType(null);
            setFormOpen(true);
          }}
        >
          <Plus />
          {t("researchTypes.newBtn")}
        </Button>
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />
      ) : (
        <DataTable
          columns={columns}
          data={data ?? []}
          isLoading={isLoading}
          searchPlaceholder={t("researchTypes.searchPlaceholder")}
          exportFileName="research-types"
          emptyTitle={t("researchTypes.emptyTitle")}
          emptyDescription={t("researchTypes.emptyDesc")}
        />
      )}

      <ResearchTypeFormSheet open={formOpen} onOpenChange={setFormOpen} researchType={editingType} />

      <ConfirmDialog
        open={Boolean(deletingType)}
        onOpenChange={(open) => !open && setDeletingType(null)}
        title={t("researchTypes.deleteTitle")}
        description={t("researchTypes.deleteDesc", { name: deletingType?.name ?? "" })}
        variant="destructive"
        confirmLabel={t("common.delete")}
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
