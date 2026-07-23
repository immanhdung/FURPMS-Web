import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";
import { Power, PowerOff } from "lucide-react";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/tables/DataTableRowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { BudgetCategory } from "@/types/budget-category";

interface GetBudgetCategoryColumnsOptions {
  t: TFunction;
  onEdit: (category: BudgetCategory) => void;
  onToggleActive: (category: BudgetCategory) => void;
}

export function getBudgetCategoryColumns({
  t,
  onEdit,
  onToggleActive,
}: GetBudgetCategoryColumnsOptions): ColumnDef<BudgetCategory>[] {
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
      accessorKey: "sequence",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("common.sequence")} />,
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("common.status")} />,
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
                ? { label: t("common.deactivate"), icon: PowerOff, onSelect: () => onToggleActive(row.original), variant: "destructive" }
                : { label: t("common.activate"), icon: Power, onSelect: () => onToggleActive(row.original) },
            ]}
          />
        </div>
      ),
    },
  ];
}
