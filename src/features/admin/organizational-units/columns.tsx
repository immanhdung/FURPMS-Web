import type { ColumnDef } from "@tanstack/react-table";
import { Building2, CornerDownRight } from "lucide-react";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/tables/DataTableRowActions";
import { Badge } from "@/components/ui/badge";
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
      cell: ({ row }) => (
        <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs font-medium text-foreground">
          {row.original.code}
        </span>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => {
        const isChild = Boolean(row.original.parentId);
        return (
          <div className={isChild ? "flex items-center gap-2 pl-4" : "flex items-center gap-2"}>
            {isChild && <CornerDownRight className="size-3.5 shrink-0 text-muted-foreground" />}
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Building2 className="size-3.5" />
            </span>
            <span className="text-sm font-medium text-foreground">{row.original.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "unitType",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      cell: ({ row }) => (
        <Badge variant="secondary" className="font-medium">
          {row.original.unitType}
        </Badge>
      ),
    },
    {
      id: "parent",
      accessorFn: (row) => (row.parentId ? (parentNames[row.parentId] ?? row.parentId) : "-"),
      header: ({ column }) => <DataTableColumnHeader column={column} title="Parent Unit" />,
      cell: ({ row }) => {
        const parentLabel = row.original.parentId ? (parentNames[row.original.parentId] ?? row.original.parentId) : null;
        return parentLabel ? (
          <span className="text-sm text-foreground">{parentLabel}</span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        );
      },
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
