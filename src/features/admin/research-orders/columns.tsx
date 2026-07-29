import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/tables/DataTableRowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { ResearchOrder } from "@/types/research-order";

interface GetResearchOrderColumnsOptions {
  cycleNames: Record<number, string>;
  unitNames: Record<number, string>;
  onView: (order: ResearchOrder) => void;
}

export function getResearchOrderColumns({
  cycleNames,
  unitNames,
  onView,
}: GetResearchOrderColumnsOptions): ColumnDef<ResearchOrder>[] {
  return [
    {
      accessorKey: "researchArea",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Research Area" />,
      cell: ({ row }) => (
        <span className="block max-w-[280px] truncate font-medium text-foreground" title={row.original.researchArea}>
          {row.original.researchArea}
        </span>
      ),
    },
    {
      id: "cycle",
      accessorFn: (row) => cycleNames[row.cycleId] ?? row.cycleId,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Cycle" />,
      cell: ({ getValue }) => (
        <span className="block max-w-[180px] truncate text-muted-foreground">{String(getValue())}</span>
      ),
    },
    {
      id: "unit",
      accessorFn: (row) => unitNames[row.orderingUnitId] ?? row.orderingUnitId,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Ordering Unit" />,
      cell: ({ getValue }) => (
        <span className="block max-w-[180px] truncate text-muted-foreground">{String(getValue())}</span>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (row.original.status ? <StatusBadge status={row.original.status} /> : "-"),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DataTableRowActions onView={() => onView(row.original)} />
        </div>
      ),
    },
  ];
}
