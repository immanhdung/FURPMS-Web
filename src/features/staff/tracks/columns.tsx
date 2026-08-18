import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";
import { PowerOff, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/tables/DataTableRowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Track } from "@/types/track";

interface GetTrackColumnsOptions {
  t: TFunction;
  onEdit: (track: Track) => void;
  onDeactivate: (track: Track) => void;
}

export function getTrackColumns({
  t,
  onEdit,
  onDeactivate,
}: GetTrackColumnsOptions): ColumnDef<Track>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("common.name")} />,
    },
    {
      accessorKey: "description",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("common.description")} />,
      cell: ({ row }) => row.original.description ?? "-",
    },
    // Cột "Phụ trách" đã ẩn: `ResearchTrack.OwnerId` chỉ được ghi vào rồi đọc ra để hiện, không có
    // chỗ nào trong hệ thống dùng nó — không gửi thông báo, không phân quyền, không lọc danh sách.
    // QĐ543 cũng không có khái niệm này. Giữ lại cột trong DB (chưa xoá) phòng khi sau này nối
    // thật (vd: nộp đề cương vào lĩnh vực thì báo cho người phụ trách), nhưng KHÔNG bày ra giao
    // diện một chức năng bấm vào không dẫn tới đâu.
    /*
     * Cột "Đợt đang mở" — lĩnh vực là dữ liệu DÙNG CHUNG, tạo xong chưa thuộc đợt nào; PI chỉ chọn
     * được lĩnh vực đã gắn vào đợt. Không có cột này thì màn hình không hề nói ra điều đó: người
     * tạo thấy lĩnh vực nằm trong danh sách là yên tâm, rồi bên PI trống trơn (lỗi báo 18/08).
     */
    {
      accessorKey: "cycleCount",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("staff.cyclesUsing")} />,
      cell: ({ row }) => {
        const count = row.original.cycleCount ?? 0;
        if (count > 0) return <Badge variant="secondary">{t("staff.cycleCount", { count })}</Badge>;
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex cursor-help items-center gap-1 text-xs font-medium text-warning">
                <AlertTriangle className="size-3.5" />
                {t("staff.notInAnyCycle")}
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-72">{t("staff.notInAnyCycleHint")}</TooltipContent>
          </Tooltip>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("common.status")} />,
      cell: ({ row }) => <StatusBadge status={row.original.isActive ? "ACTIVE" : "INACTIVE"} />,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DataTableRowActions
            onEdit={() => onEdit(row.original)}
            extraActions={[
              ...(row.original.isActive
                ? [{ label: t("common.deactivate"), icon: PowerOff, onSelect: () => onDeactivate(row.original), variant: "destructive" as const }]
                : []),
            ]}
          />
        </div>
      ),
    },
  ];
}
