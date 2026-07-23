import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/tables/DataTableRowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { ResearchOrder } from "@/types/research-order";

interface GetResearchOrderColumnsOptions {
  t: TFunction;
  cycleNames: Record<number, string>;
  unitNames: Record<number, string>;
  onView: (order: ResearchOrder) => void;
}

export function getResearchOrderColumns({
  t,
  cycleNames,
  unitNames,
  onView,
}: GetResearchOrderColumnsOptions): ColumnDef<ResearchOrder>[] {
  return [
    {
      accessorKey: "researchArea",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("researchOrders.researchArea")} />,
    },
    {
      id: "cycle",
      accessorFn: (row) => cycleNames[row.cycleId] ?? row.cycleId,
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("researchOrders.cycle")} />,
    },
    {
      id: "unit",
      accessorFn: (row) => unitNames[row.orderingUnitId] ?? row.orderingUnitId,
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("researchOrders.orderingUnit")} />,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("common.status")} />,
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
