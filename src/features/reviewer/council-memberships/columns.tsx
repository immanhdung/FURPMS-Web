import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { MyMembership } from "@/types/membership";

export function getMembershipColumns(onView: (membership: MyMembership) => void): ColumnDef<MyMembership>[] {
  return [
    {
      id: "proposal",
      accessorFn: (row) => row.proposalTitleVI ?? "Untitled proposal",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Proposal" />,
    },
    {
      accessorKey: "roundType",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Round Type" />,
      cell: ({ row }) => row.original.roundType ?? "-",
    },
    {
      accessorKey: "memberRole",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
      cell: ({ row }) => row.original.memberRole ?? "-",
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Invitation Status" />,
      cell: ({ row }) => (row.original.status ? <StatusBadge status={row.original.status} /> : "-"),
    },
    {
      accessorKey: "roundStatus",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Round Status" />,
      cell: ({ row }) => (row.original.roundStatus ? <StatusBadge status={row.original.roundStatus} /> : "-"),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => onView(row.original)}>
            <Eye />
            View
          </Button>
        </div>
      ),
    },
  ];
}
