import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/tables/DataTableRowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
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
    },
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    },
    {
      accessorKey: "maxBudgetCap",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Max Budget Cap" />,
      cell: ({ row }) => formatCurrency(row.original.maxBudgetCap),
    },
    {
      accessorKey: "requireOrderingUnit",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Requires Ordering Unit" />,
      cell: ({ row }) => (row.original.requireOrderingUnit ? "Yes" : "No"),
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
