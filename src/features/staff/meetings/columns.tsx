import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLink, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDateTime } from "@/utils/format";
import type { Meeting } from "@/types/meeting";

interface GetMeetingColumnsOptions {
  onStart: (meeting: Meeting) => void;
  onEnd: (meeting: Meeting) => void;
}

export function getMeetingColumns({ onStart, onEnd }: GetMeetingColumnsOptions): ColumnDef<Meeting>[] {
  return [
    {
      id: "title",
      accessorFn: (row) => row.title ?? "Council meeting",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
    },
    {
      accessorKey: "platform",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Platform" />,
      cell: ({ row }) => row.original.platform ?? "-",
    },
    {
      accessorKey: "scheduledAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Scheduled" />,
      cell: ({ row }) => formatDateTime(row.original.scheduledAt),
    },
    {
      accessorKey: "durationMinutes",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Duration" />,
      cell: ({ row }) => `${row.original.durationMinutes} min`,
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
        <div className="flex justify-end gap-1">
          {row.original.meetingLink && (
            <Button variant="ghost" size="icon-sm" asChild title="Join">
              <a href={row.original.meetingLink} target="_blank" rel="noreferrer">
                <ExternalLink />
              </a>
            </Button>
          )}
          <Button variant="ghost" size="icon-sm" title="Start" onClick={() => onStart(row.original)}>
            <Play />
          </Button>
          <Button variant="ghost" size="icon-sm" title="End" onClick={() => onEnd(row.original)}>
            <Square />
          </Button>
        </div>
      ),
    },
  ];
}
