import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";
import { Lock, Unlock } from "lucide-react";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/tables/DataTableRowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CYCLE_STATUS } from "@/constants/statuses";
import { formatDate } from "@/utils/format";
import type { Cycle } from "@/types/cycle";

interface GetCycleColumnsOptions {
  t: TFunction;
  researchTypeNames: Record<number, string>;
  onView: (cycle: Cycle) => void;
  onEdit: (cycle: Cycle) => void;
  onOpen: (cycle: Cycle) => void;
  onClose: (cycle: Cycle) => void;
}

export function getCycleColumns({
  t,
  researchTypeNames,
  onView,
  onEdit,
  onOpen,
  onClose,
}: GetCycleColumnsOptions): ColumnDef<Cycle>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("common.name")} />,
    },
    {
      accessorKey: "academicYear",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("cycles.academicYear")} />,
    },
    {
      id: "researchType",
      accessorFn: (row) => researchTypeNames[row.researchTypeId] ?? row.researchTypeId,
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("cycles.researchType")} />,
    },
    {
      accessorKey: "submissionStartDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("cycles.start")} />,
      cell: ({ row }) => formatDate(row.original.submissionStartDate),
    },
    {
      accessorKey: "submissionDeadline",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("cycles.deadline")} />,
      cell: ({ row }) => formatDate(row.original.submissionDeadline),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("common.status")} />,
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const cycle = row.original;
        const status = cycle.status?.toUpperCase();
        const extraActions = [];
        if (status !== CYCLE_STATUS.OPEN && status !== CYCLE_STATUS.CLOSED) {
          extraActions.push({ label: t("cycles.openCycle"), icon: Unlock, onSelect: () => onOpen(cycle) });
        }
        if (status === CYCLE_STATUS.OPEN) {
          extraActions.push({ label: t("cycles.closeBtn"), icon: Lock, onSelect: () => onClose(cycle), variant: "destructive" as const });
        }
        return (
          <div className="flex justify-end">
            <DataTableRowActions
              onView={() => onView(cycle)}
              onEdit={() => onEdit(cycle)}
              extraActions={extraActions}
            />
          </div>
        );
      },
    },
  ];
}
