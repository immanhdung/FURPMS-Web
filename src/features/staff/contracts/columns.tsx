import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/tables/DataTableRowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/utils/format";
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
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("staff.contractNo")} />,
      cell: ({ row }) => row.original.contractNumber ?? "-",
    },
    {
      id: "proposal",
      accessorFn: (row) => proposalTitles[row.proposalId] ?? row.proposalId,
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("staff.proposal")} />,
    },
    {
      id: "pi",
      accessorFn: (row) => row.piName || "-",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("staff.pi")} />,
    },
    {
      accessorKey: "startDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("staff.start")} />,
      cell: ({ row }) => formatDate(row.original.startDate),
    },
    {
      accessorKey: "endDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("staff.end")} />,
      cell: ({ row }) => formatDate(row.original.endDate),
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
