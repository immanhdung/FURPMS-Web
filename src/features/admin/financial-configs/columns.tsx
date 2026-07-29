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
      cell: ({ row }) => (
        <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs font-medium text-foreground">
          {row.original.code}
        </span>
      ),
    },
    {
      accessorKey: "value",
      header: ({ column }) => (
        <div className="flex justify-end">
          <DataTableColumnHeader column={column} title="Value" className="ml-0" />
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-right text-sm tabular-nums text-foreground">{row.original.value}</div>
      ),
    },
    {
      accessorKey: "effectiveDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Effective Date" />,
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(row.original.effectiveDate)}</span>,
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
