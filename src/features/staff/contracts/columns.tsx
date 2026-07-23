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
}

export function getContractColumns({ t, proposalTitles, onView }: GetContractColumnsOptions): ColumnDef<Contract>[] {
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
          <DataTableRowActions onView={() => onView(row.original)} />
        </div>
      ),
    },
  ];
}
