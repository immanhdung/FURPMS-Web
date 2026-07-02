import type { ColumnDef } from "@tanstack/react-table";
import { Lock, Unlock } from "lucide-react";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/tables/DataTableRowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CYCLE_STATUS } from "@/constants/statuses";
import { formatDate } from "@/utils/format";
import type { Cycle } from "@/types/cycle";

interface GetCycleColumnsOptions {
  researchTypeNames: Record<number, string>;
  onView: (cycle: Cycle) => void;
  onEdit: (cycle: Cycle) => void;
  onOpen: (cycle: Cycle) => void;
  onClose: (cycle: Cycle) => void;
}

export function getCycleColumns({
  researchTypeNames,
  onView,
  onEdit,
  onOpen,
  onClose,
}: GetCycleColumnsOptions): ColumnDef<Cycle>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    },
    {
      accessorKey: "academicYear",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Academic Year" />,
    },
    {
      id: "researchType",
      accessorFn: (row) => researchTypeNames[row.researchTypeId] ?? row.researchTypeId,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Research Type" />,
    },
    {
      accessorKey: "submissionStartDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Start" />,
      cell: ({ row }) => formatDate(row.original.submissionStartDate),
    },
    {
      accessorKey: "submissionDeadline",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Deadline" />,
      cell: ({ row }) => formatDate(row.original.submissionDeadline),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const cycle = row.original;
        const extraActions = [];
        if (cycle.status !== CYCLE_STATUS.OPEN && cycle.status !== CYCLE_STATUS.CLOSED) {
          extraActions.push({ label: "Open cycle", icon: Unlock, onSelect: () => onOpen(cycle) });
        }
        if (cycle.status === CYCLE_STATUS.OPEN) {
          extraActions.push({ label: "Close cycle", icon: Lock, onSelect: () => onClose(cycle), variant: "destructive" as const });
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
