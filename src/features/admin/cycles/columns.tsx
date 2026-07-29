import type { ColumnDef } from "@tanstack/react-table";
import { CalendarDays, Lock, Unlock } from "lucide-react";
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
      cell: ({ row }) => (
        <span className="block max-w-64 truncate text-sm font-medium text-foreground">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "academicYear",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Academic Year" />,
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.academicYear}</span>,
    },
    {
      id: "researchType",
      accessorFn: (row) => researchTypeNames[row.researchTypeId] ?? row.researchTypeId,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Research Type" />,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.getValue("researchType") as string}</span>
      ),
    },
    {
      accessorKey: "submissionStartDate",
      header: ({ column }) => (
        <div className="flex justify-end">
          <DataTableColumnHeader column={column} title="Start" />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1.5 text-sm text-muted-foreground">
          <CalendarDays className="size-3.5 text-muted-foreground/60" />
          {formatDate(row.original.submissionStartDate)}
        </div>
      ),
    },
    {
      accessorKey: "submissionDeadline",
      header: ({ column }) => (
        <div className="flex justify-end">
          <DataTableColumnHeader column={column} title="Deadline" />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1.5 text-sm text-muted-foreground">
          <CalendarDays className="size-3.5 text-muted-foreground/60" />
          {formatDate(row.original.submissionDeadline)}
        </div>
      ),
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
        const status = cycle.status?.toUpperCase();
        const extraActions = [];
        if (status !== CYCLE_STATUS.OPEN && status !== CYCLE_STATUS.CLOSED) {
          extraActions.push({ label: "Open cycle", icon: Unlock, onSelect: () => onOpen(cycle) });
        }
        if (status === CYCLE_STATUS.OPEN) {
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
