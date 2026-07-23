import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";
import { ExternalLink, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDateTime } from "@/utils/format";
import type { Meeting } from "@/types/meeting";

interface GetMeetingColumnsOptions {
  t: TFunction;
  onStart: (meeting: Meeting) => void;
  onEnd: (meeting: Meeting) => void;
}

export function getMeetingColumns({ t, onStart, onEnd }: GetMeetingColumnsOptions): ColumnDef<Meeting>[] {
  return [
    {
      id: "title",
      accessorFn: (row) => row.title ?? t("staff.councilMeeting"),
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("staff.meetingTitle")} />,
    },
    {
      accessorKey: "platform",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("staff.platform")} />,
      cell: ({ row }) => row.original.platform ?? "-",
    },
    {
      accessorKey: "scheduledAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("staff.scheduled")} />,
      cell: ({ row }) => formatDateTime(row.original.scheduledAt),
    },
    {
      accessorKey: "durationMinutes",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("staff.duration")} />,
      cell: ({ row }) => t("staff.durationMin", { min: row.original.durationMinutes }),
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
        <div className="flex justify-end gap-1">
          {row.original.meetingLink && (
            <Button variant="ghost" size="icon-sm" asChild title={t("staff.join")} aria-label={t("staff.join")}>
              <a href={row.original.meetingLink} target="_blank" rel="noreferrer">
                <ExternalLink />
              </a>
            </Button>
          )}
          <Button variant="ghost" size="icon-sm" title={t("staff.startMeeting")} aria-label={t("staff.startMeeting")} onClick={() => onStart(row.original)}>
            <Play />
          </Button>
          <Button variant="ghost" size="icon-sm" title={t("staff.endMeeting")} aria-label={t("staff.endMeeting")} onClick={() => onEnd(row.original)}>
            <Square />
          </Button>
        </div>
      ),
    },
  ];
}
