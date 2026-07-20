import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/tables/DataTableRowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/utils/format";
import type { Contract } from "@/types/contract";

interface GetContractColumnsOptions {
  proposalTitles: Record<string, string>;
  onView: (contract: Contract) => void;
}

export function getContractColumns({ proposalTitles, onView }: GetContractColumnsOptions): ColumnDef<Contract>[] {
  return [
    {
      accessorKey: "contractNumber",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Contract No." />,
      cell: ({ row }) => row.original.contractNumber ?? "-",
    },
    {
      id: "proposal",
      accessorFn: (row) => proposalTitles[row.proposalId] ?? row.proposalId,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Proposal" />,
    },
    {
      accessorKey: "startDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Start" />,
      cell: ({ row }) => formatDate(row.original.startDate),
    },
    {
      accessorKey: "endDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="End" />,
      cell: ({ row }) => formatDate(row.original.endDate),
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
        <div className="flex justify-end">
          <DataTableRowActions onView={() => onView(row.original)} />
        </div>
      ),
    },
  ];
}
