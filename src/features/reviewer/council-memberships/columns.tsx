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
      cell: ({ row }) => (
        <span className="max-w-64 truncate text-sm font-medium text-foreground">
          {row.original.proposalTitleVI ?? "Untitled proposal"}
        </span>
      ),
    },
    {
      accessorKey: "roundType",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Round Type" />,
      cell: ({ row }) =>
        row.original.roundType ? (
          <span className="text-sm text-foreground">{row.original.roundType}</span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        ),
    },
    {
      accessorKey: "memberRole",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
      cell: ({ row }) =>
        row.original.memberRole ? (
          <span className="text-sm text-foreground">{row.original.memberRole}</span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Invitation Status" />,
      cell: ({ row }) =>
        row.original.status ? <StatusBadge status={row.original.status} /> : <span className="text-sm text-muted-foreground">-</span>,
    },
    {
      accessorKey: "roundStatus",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Round Status" />,
      cell: ({ row }) =>
        row.original.roundStatus ? (
          <StatusBadge status={row.original.roundStatus} />
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        ),
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
