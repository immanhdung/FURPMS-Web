import { useMemo, useState } from "react";
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
      }),
    [parentNames]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Organizational Units</h1>
          <p className="mt-1 text-sm text-muted-foreground">Faculties, departments, and offices structure.</p>
        </div>
        <Button
          onClick={() => {
            setEditingUnit(null);
            setFormOpen(true);
          }}
        >
          <Plus />
          New unit
        </Button>
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />
      ) : (
        <DataTable
          columns={columns}
          data={data ?? []}
          isLoading={isLoading}
          searchPlaceholder="Search organizational units..."
          exportFileName="organizational-units"
          emptyTitle="No organizational units found"
          emptyDescription="Create a unit to build the organization structure."
        />
      )}

      <OrgUnitFormSheet open={formOpen} onOpenChange={setFormOpen} orgUnit={editingUnit} />

      <DetailSheet
        open={Boolean(viewingUnit)}
        onOpenChange={(open) => !open && setViewingUnit(null)}
        title={viewingUnit?.name ?? "Unit details"}
        description={viewingUnit?.code}
        fields={[
          { label: "Type", value: viewingUnit?.unitType },
          { label: "Parent unit", value: viewingUnit?.parentId ? parentNames[viewingUnit.parentId] : "-" },
          { label: "Sort order", value: viewingUnit?.sortOrder ?? "-" },
        ]}
      />
    </div>
  );
}
