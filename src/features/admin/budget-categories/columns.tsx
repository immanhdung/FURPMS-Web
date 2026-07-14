import type { ColumnDef } from "@tanstack/react-table";
import { Power, PowerOff } from "lucide-react";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/tables/DataTableRowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { BudgetCategory } from "@/types/budget-category";

interface GetBudgetCategoryColumnsOptions {
  onEdit: (category: BudgetCategory) => void;
  onToggleActive: (category: BudgetCategory) => void;
}

export function getBudgetCategoryColumns({
  onEdit,
  onToggleActive,
}: GetBudgetCategoryColumnsOptions): ColumnDef<BudgetCategory>[] {
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
      accessorKey: "sequence",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Sequence" />,
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <StatusBadge status={row.original.isActive ? "Active" : "Inactive"} />,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DataTableRowActions
            onEdit={() => onEdit(row.original)}
            extraActions={[
              row.original.isActive
                ? { label: "Deactivate", icon: PowerOff, onSelect: () => onToggleActive(row.original), variant: "destructive" }
                : { label: "Activate", icon: Power, onSelect: () => onToggleActive(row.original) },
            ]}
          />
        </div>
      ),
    },
  ];
}
