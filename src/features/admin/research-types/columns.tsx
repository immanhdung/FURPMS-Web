import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/tables/DataTableRowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/format";
import type { ResearchType } from "@/types/research-type";

interface GetResearchTypeColumnsOptions {
  onEdit: (researchType: ResearchType) => void;
  onDelete: (researchType: ResearchType) => void;
}

export function getResearchTypeColumns({ onEdit, onDelete }: GetResearchTypeColumnsOptions): ColumnDef<ResearchType>[] {
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
      cell: ({ row }) => <span className="text-sm font-medium text-foreground">{row.original.name}</span>,
    },
    {
      accessorKey: "maxBudgetCap",
      header: ({ column }) => (
        <div className="flex justify-end">
          <DataTableColumnHeader column={column} title="Max Budget Cap" />
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-right text-sm tabular-nums text-foreground">
          {formatCurrency(row.original.maxBudgetCap)}
        </div>
      ),
    },
    {
      accessorKey: "requireOrderingUnit",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Requires Ordering Unit" />,
      cell: ({ row }) => {
        const required = row.original.requireOrderingUnit;
        return (
          <Badge
            variant="secondary"
            className={cn(
              "font-medium",
              required ? "bg-brand-accent/10 text-brand-accent" : "bg-muted text-muted-foreground"
            )}
          >
            {required ? "Yes" : "No"}
          </Badge>
        );
      },
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
          <DataTableRowActions onEdit={() => onEdit(row.original)} onDelete={() => onDelete(row.original)} />
        </div>
      ),
    },
  ];
}
