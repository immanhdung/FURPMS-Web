import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { CalendarRange, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/tables/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCloseCycleMutation,
  useDeleteCycleMutation, useCyclesQuery, useOpenCycleMutation } from "@/hooks/useCycles";
import { useResearchTypesQuery } from "@/hooks/useResearchTypes";
import { getCycleColumns } from "@/features/admin/cycles/columns";
import { CycleFormSheet } from "@/features/admin/cycles/CycleFormSheet";
import { CycleDetailSheet } from "@/features/admin/cycles/CycleDetailSheet";
import { TracksTabContent } from "@/features/staff/tracks/TracksTabContent";
import { ManageCycleFieldsDialog } from "@/features/admin/cycles/ManageCycleFieldsDialog";
import { ExtendDeadlineDialog } from "@/features/admin/cycles/ExtendDeadlineDialog";
import { sortByIdDesc } from "@/utils/sort";
import type { Cycle } from "@/types/cycle";

export function CyclesPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch, isRefetching } = useCyclesQuery();
  const { data: researchTypes } = useResearchTypesQuery();
  const openMutation = useOpenCycleMutation();
  const closeMutation = useCloseCycleMutation();
  const deleteMutation = useDeleteCycleMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCycle, setEditingCycle] = useState<Cycle | null>(null);
  const [detailCycleId, setDetailCycleId] = useState<number | null>(null);
  const [closingCycle, setClosingCycle] = useState<Cycle | null>(null);
  const [deletingCycle, setDeletingCycle] = useState<Cycle | null>(null);
  const [addingFieldToCycle, setAddingFieldToCycle] = useState<Cycle | null>(null);
  const [extendingCycle, setExtendingCycle] = useState<Cycle | null>(null);

  const researchTypeNames = useMemo(
    () => Object.fromEntries((researchTypes ?? []).map((rt) => [rt.id, rt.name])),
    [researchTypes]
  );
  const sortedData = useMemo(() => sortByIdDesc(data), [data]);

  const columns = useMemo(
    () =>
      getCycleColumns({
        t,
        researchTypeNames,
        onView: (cycle) => setDetailCycleId(cycle.id),
        onEdit: (cycle) => {
          setEditingCycle(cycle);
          setFormOpen(true);
        },
        onOpen: (cycle) => openMutation.mutate(cycle.id),
        onClose: (cycle) => setClosingCycle(cycle),
        onDelete: (cycle) => setDeletingCycle(cycle),
        onAddField: (cycle) => setAddingFieldToCycle(cycle),
        onExtend: (cycle) => setExtendingCycle(cycle),
      }),
    [t, researchTypeNames, openMutation]
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-3"
      >
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary/15 to-brand-secondary/10 text-primary">
          <CalendarRange className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("cycles.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("cycles.subtitle")}
          </p>
        </div>
      </motion.div>

      <Tabs defaultValue="cycles">
        <TabsList>
          <TabsTrigger value="cycles">{t("cycles.tabCycles")}</TabsTrigger>
          <TabsTrigger value="fields">{t("cycles.tabFields")}</TabsTrigger>
        </TabsList>

        <TabsContent value="cycles" className="space-y-4">
          <div className="flex justify-end">
            <Button
              variant="gradient"
              onClick={() => {
                setEditingCycle(null);
                setFormOpen(true);
              }}
            >
              <Plus />
              {t("cycles.newBtn")}
            </Button>
          </div>

          {isError ? (
            <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />
          ) : (
            <DataTable
              columns={columns}
              data={sortedData}
              isLoading={isLoading}
              searchPlaceholder={t("cycles.searchPlaceholder")}
              exportFileName="research-cycles"
              emptyTitle={t("cycles.emptyTitle")}
              emptyDescription={t("cycles.emptyDesc")}
            />
          )}
        </TabsContent>

        <TabsContent value="fields">
          <TracksTabContent />
        </TabsContent>
      </Tabs>

      <CycleFormSheet open={formOpen} onOpenChange={setFormOpen} cycle={editingCycle} />
      <CycleDetailSheet
        open={Boolean(detailCycleId)}
        onOpenChange={(open) => !open && setDetailCycleId(null)}
        cycleId={detailCycleId}
      />

      <ManageCycleFieldsDialog
        open={Boolean(addingFieldToCycle)}
        onOpenChange={(open) => !open && setAddingFieldToCycle(null)}
        cycle={addingFieldToCycle}
      />

      <ExtendDeadlineDialog
        open={Boolean(extendingCycle)}
        onOpenChange={(open) => !open && setExtendingCycle(null)}
        cycle={extendingCycle}
      />

      <ConfirmDialog
        open={Boolean(closingCycle)}
        onOpenChange={(open) => !open && setClosingCycle(null)}
        title={t("cycles.closeTitle")}
        description={t("cycles.closeDesc", { name: closingCycle?.name ?? "" })}
        variant="destructive"
        confirmLabel={t("cycles.closeBtn")}
        isLoading={closeMutation.isPending}
        onConfirm={() =>
          closingCycle &&
          closeMutation.mutate(closingCycle.id, {
            onSuccess: () => setClosingCycle(null),
          })
        }
      />

      <ConfirmDialog
        open={Boolean(deletingCycle)}
        onOpenChange={(open) => !open && setDeletingCycle(null)}
        title={t("cycles.deleteTitle")}
        description={t("cycles.deleteDesc", { name: deletingCycle?.name ?? "" })}
        variant="destructive"
        confirmLabel={t("cycles.deleteBtn")}
        isLoading={deleteMutation.isPending}
        onConfirm={() =>
          deletingCycle &&
          deleteMutation.mutate(deletingCycle.id, {
            onSuccess: () => setDeletingCycle(null),
          })
        }
      />
    </div>
  );
}
