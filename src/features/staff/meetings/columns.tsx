import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { externalUrl, formatDateTime } from "@/utils/format";
import type { Meeting } from "@/types/meeting";

interface GetMeetingColumnsOptions {
  t: TFunction;
}

export function getMeetingColumns({ t }: GetMeetingColumnsOptions): ColumnDef<Meeting>[] {
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
              <a href={externalUrl(row.original.meetingLink)} target="_blank" rel="noreferrer">
                <ExternalLink />
              </a>
            </Button>
          )}
          {/*
            KHÔNG còn nút Bắt đầu / Kết thúc họp (bỏ 17/08).
            Không ai bấm chúng trong thực tế: tới giờ họp thì Thư ký ghi biên bản, chẳng ai mở
            phần mềm ra bấm "Bắt đầu". Chúng cũng không gánh gì cả — không luồng nào chờ trạng
            thái ĐANG DIỄN RA (điểm danh, chấm điểm, biên bản đều không kiểm), mà Chủ tịch chốt
            biên bản thì `ReviewScoringService` đã tự đóng mọi buổi họp của hội đồng. Giữ lại chỉ
            tạo bẫy: bấm Bắt đầu rồi Kết thúc là buổi họp "xong" trước cả khi họp.
            Endpoint start/end/undo-start ở máy chủ vẫn còn, chỉ gỡ khỏi giao diện.
          */}
        </div>
      ),
    },
  ];
}
