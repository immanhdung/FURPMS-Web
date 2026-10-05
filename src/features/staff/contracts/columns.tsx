import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/tables/DataTableRowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, formatDate } from "@/utils/format";
import type { Contract } from "@/types/contract";

interface GetContractColumnsOptions {
  t: TFunction;
  proposalTitles: Record<string, string>;
  onView: (contract: Contract) => void;
  onEdit: (contract: Contract) => void;
  onDelete: (contract: Contract) => void;
}

export function getContractColumns({ t, proposalTitles, onView, onEdit, onDelete }: GetContractColumnsOptions): ColumnDef<Contract>[] {
  return [
    {
      accessorKey: "contractNumber",
      meta: { label: t("staff.contractNo") },
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("staff.contractNo")} />,
      cell: ({ row }) => row.original.contractNumber ?? "-",
    },
    {
      id: "proposal",
      meta: { label: t("staff.proposal") },
      // Ưu tiên tên BE trả kèm hợp đồng; bảng tra `proposalTitles` chỉ chứa các đề cương đang
      // tải trên trang nên hợp đồng của đề cương ngoài trang từng hiện trơ ra GUID.
      accessorFn: (row) => row.proposalTitle || proposalTitles[row.proposalId] || "-",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("staff.proposal")} />,
    },
    {
      id: "pi",
      meta: { label: t("staff.pi") },
      accessorFn: (row) => row.piName || "-",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("staff.pi")} />,
    },
    {
      id: "researchType",
      meta: { label: t("staff.researchType") },
      accessorFn: (row) => row.researchTypeName || row.researchTypeCode || "-",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("staff.researchType")} />,
      cell: ({ row }) => (
        <span className="inline-flex rounded-full border border-border bg-muted/50 px-2 py-0.5 text-xs font-medium">
          {row.original.researchTypeName || row.original.researchTypeCode || "-"}
        </span>
      ),
    },
    {
      id: "classification",
      meta: { label: t("staff.cycleAndTrack") },
      accessorFn: (row) => `${row.cycleCode ?? ""} ${row.trackName ?? row.trackCode ?? ""}`,
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("staff.cycleAndTrack")} />,
      cell: ({ row }) => (
        <div className="min-w-32 text-sm">
          <div className="font-medium">{row.original.cycleCode || "-"}</div>
          <div className="max-w-48 truncate text-xs text-muted-foreground" title={row.original.trackName ?? undefined}>
            {row.original.trackName || row.original.trackCode || "-"}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "startDate",
      meta: { label: t("staff.start") },
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("staff.start")} />,
      cell: ({ row }) => formatDate(row.original.startDate),
    },
    {
      accessorKey: "endDate",
      meta: { label: t("staff.end") },
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("staff.end")} />,
      cell: ({ row }) => formatDate(row.original.endDate),
    },
    {
      accessorKey: "totalAmount",
      meta: { label: t("staff.contractValue") },
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("staff.contractValue")} />,
      // Căn PHẢI + `tabular-nums`: cột tiền phải thẳng hàng số mới so nhanh bằng mắt được.
      cell: ({ row }) => (
        <div className="text-right tabular-nums">
          {row.original.totalAmount != null ? formatCurrency(row.original.totalAmount) : "-"}
        </div>
      ),
    },
    {
      accessorKey: "status",
      meta: { label: t("common.status") },
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("common.status")} />,
      cell: ({ row }) => (row.original.status ? <StatusBadge status={row.original.status} /> : "-"),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
          {/* Xoá chỉ bày ra khi hợp đồng CHƯA KÝ — ký rồi là có hiệu lực pháp lý, BE cũng chặn
              (409). Bày nút để rồi báo lỗi thì chỉ tổ làm người dùng tưởng hệ thống hỏng. */}
          <DataTableRowActions
            onView={() => onView(row.original)}
            onEdit={() => onEdit(row.original)}
            onDelete={
              row.original.status === "PENDING_SIGNATURE" ? () => onDelete(row.original) : undefined
            }
          />
        </div>
      ),
    },
  ];
}
