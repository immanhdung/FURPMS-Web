import type { ColumnDef } from "@tanstack/react-table";
import { Power, PowerOff } from "lucide-react";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/tables/DataTableRowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/utils/format";
import type { FinancialConfig } from "@/types/financial-config";

interface GetFinancialConfigColumnsOptions {
  onEdit: (config: FinancialConfig) => void;
  onToggleActive: (config: FinancialConfig) => void;
}

export function getFinancialConfigColumns({
  onEdit,
  onToggleActive,
}: GetFinancialConfigColumnsOptions): ColumnDef<FinancialConfig>[] {
  return [
    {
      accessorKey: "code",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
    },
    {
      accessorKey: "value",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Value" />,
    },
    {
      accessorKey: "effectiveDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Effective Date" />,
      cell: ({ row }) => formatDate(row.original.effectiveDate),
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
