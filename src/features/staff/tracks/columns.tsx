import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";
import { PowerOff } from "lucide-react";
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
    {
      accessorKey: "isActive",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("common.status")} />,
      cell: ({ row }) => <StatusBadge status={row.original.isActive ? "Active" : "Inactive"} />,
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
