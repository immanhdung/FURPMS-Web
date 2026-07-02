import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/tables/DataTableRowActions";
import type { OrganizationalUnit } from "@/types/organizational-unit";

interface GetOrgUnitColumnsOptions {
  parentNames: Record<number, string>;
  onView: (unit: OrganizationalUnit) => void;
  onEdit: (unit: OrganizationalUnit) => void;
}

export function getOrgUnitColumns({ parentNames, onView, onEdit }: GetOrgUnitColumnsOptions): ColumnDef<OrganizationalUnit>[] {
  return [
    {
      accessorKey: "code",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
    },
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    },
    {
      accessorKey: "unitType",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
    },
    {
      id: "parent",
      accessorFn: (row) => (row.parentId ? (parentNames[row.parentId] ?? row.parentId) : "-"),
      header: ({ column }) => <DataTableColumnHeader column={column} title="Parent Unit" />,
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
