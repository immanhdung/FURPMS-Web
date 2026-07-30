import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { FolderKanban, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/tables/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useDeleteResearchTypeMutation, useResearchTypesQuery } from "@/hooks/useResearchTypes";
import { getResearchTypeColumns } from "@/features/admin/research-types/columns";
import { ResearchTypeFormSheet } from "@/features/admin/research-types/ResearchTypeFormSheet";
import { sortByIdDesc } from "@/utils/sort";
import type { ResearchType } from "@/types/research-type";

export function ResearchTypesPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch, isRefetching } = useResearchTypesQuery(true);
  const deleteMutation = useDeleteResearchTypeMutation();
  const sortedData = useMemo(() => sortByIdDesc(data), [data]);

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
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary/15 to-brand-secondary/10 text-primary">
            <FolderKanban className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("researchTypes.title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("researchTypes.subtitle")}
            </p>
          </div>
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
      </motion.div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />
      ) : (
        <DataTable
          columns={columns}
          data={sortedData}
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
