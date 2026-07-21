import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/tables/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { DetailSheet } from "@/components/shared/DetailSheet";
import { useOrganizationalUnitsQuery } from "@/hooks/useOrganizationalUnits";
import { getOrgUnitColumns } from "@/features/admin/organizational-units/columns";
import { OrgUnitFormSheet } from "@/features/admin/organizational-units/OrgUnitFormSheet";
import type { OrganizationalUnit } from "@/types/organizational-unit";

export function OrganizationalUnitsPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch, isRefetching } = useOrganizationalUnitsQuery();

  const [formOpen, setFormOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<OrganizationalUnit | null>(null);
  const [viewingUnit, setViewingUnit] = useState<OrganizationalUnit | null>(null);

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
        t,
      }),
    [parentNames, t]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("orgUnits.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("orgUnits.subtitle")}</p>
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
      </div>

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
    </div>
  );
}
