import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/tables/DataTableRowActions";
import type { OrganizationalUnit } from "@/types/organizational-unit";

interface GetOrgUnitColumnsOptions {
  t: TFunction;
  parentNames: Record<number, string>;
  onView: (unit: OrganizationalUnit) => void;
  onEdit: (unit: OrganizationalUnit) => void;
}

export function getOrgUnitColumns({ t, parentNames, onView, onEdit }: GetOrgUnitColumnsOptions): ColumnDef<OrganizationalUnit>[] {
  return [
    {
      accessorKey: "code",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("common.code")} />,
    },
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("common.name")} />,
    },
    {
      accessorKey: "unitType",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("orgUnits.type")} />,
    },
    {
      id: "parent",
      accessorFn: (row) => (row.parentId ? (parentNames[row.parentId] ?? row.parentId) : "-"),
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("orgUnits.parentUnit")} />,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DataTableRowActions onView={() => onView(row.original)} onEdit={() => onEdit(row.original)} />
        </div>
      ),
    },
  ];
}
