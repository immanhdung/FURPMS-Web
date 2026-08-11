import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/tables/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { DetailSheet } from "@/components/shared/DetailSheet";
import {
  useOrganizationalUnitsQuery,
  useDeleteOrganizationalUnitMutation,
} from "@/hooks/useOrganizationalUnits";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { getOrgUnitColumns } from "@/features/admin/organizational-units/columns";
import { OrgUnitFormSheet } from "@/features/admin/organizational-units/OrgUnitFormSheet";
import type { OrganizationalUnit } from "@/types/organizational-unit";

export function OrganizationalUnitsPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch, isRefetching } = useOrganizationalUnitsQuery();

  const [formOpen, setFormOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<OrganizationalUnit | null>(null);
  const [viewingUnit, setViewingUnit] = useState<OrganizationalUnit | null>(null);
  const [deletingUnit, setDeletingUnit] = useState<OrganizationalUnit | null>(null);
  const deleteMutation = useDeleteOrganizationalUnitMutation();

  const parentNames = useMemo(() => Object.fromEntries((data ?? []).map((u) => [u.id, u.name])), [data]);

  const columns = useMemo(
    () =>
      getOrgUnitColumns({
        parentNames,
        onView: (unit) => setViewingUnit(unit),
        onEdit: (unit) => {
          setEditingUnit(unit);
          setFormOpen(true);
        },
        onDelete: (unit) => setDeletingUnit(unit),
        t,
      }),
    [parentNames, t]
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
            <Building2 className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("orgUnits.title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("orgUnits.subtitle")}</p>
          </div>
        </div>
        <Button
          onClick={() => {
            setEditingUnit(null);
            setFormOpen(true);
          }}
        >
          <Plus />
          {t("orgUnits.newBtn")}
        </Button>
      </motion.div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />
      ) : (
        <DataTable
          columns={columns}
          data={data ?? []}
          isLoading={isLoading}
          searchPlaceholder={t("orgUnits.searchPlaceholder")}
          exportFileName="organizational-units"
          emptyTitle={t("orgUnits.emptyTitle")}
          emptyDescription={t("orgUnits.emptyDesc")}
        />
      )}

      <OrgUnitFormSheet open={formOpen} onOpenChange={setFormOpen} orgUnit={editingUnit} />

      <DetailSheet
        open={Boolean(viewingUnit)}
        onOpenChange={(open) => !open && setViewingUnit(null)}
        title={viewingUnit?.name ?? t("orgUnits.detailsTitle")}
        description={viewingUnit?.code}
        fields={[
          { label: t("orgUnits.type"), value: viewingUnit?.unitType },
          { label: t("orgUnits.parentUnit"), value: viewingUnit?.parentId ? parentNames[viewingUnit.parentId] : "-" },
          { label: t("orgUnits.sortOrder"), value: viewingUnit?.sortOrder ?? "-" },
        ]}
      />
      <ConfirmDialog
        open={Boolean(deletingUnit)}
        onOpenChange={(open) => !open && setDeletingUnit(null)}
        title={t("orgUnits.deleteTitle")}
        description={t("orgUnits.deleteDesc", { name: deletingUnit?.name ?? "" })}
        variant="destructive"
        confirmLabel={t("common.delete")}
        isLoading={deleteMutation.isPending}
        onConfirm={() =>
          deletingUnit &&
          deleteMutation.mutate(deletingUnit.id, { onSuccess: () => setDeletingUnit(null) })
        }
      />
    </div>
  );
}
