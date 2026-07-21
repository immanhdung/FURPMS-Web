import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { MyMembership } from "@/types/membership";

export function getMembershipColumns(t: TFunction, onView: (membership: MyMembership) => void): ColumnDef<MyMembership>[] {
  return [
    {
      id: "proposal",
      accessorFn: (row) => row.proposalTitleVI ?? t("common.untitledProposal"),
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("reviewer.proposal")} />,
    },
    {
      accessorKey: "roundType",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("reviewer.roundType")} />,
      cell: ({ row }) => row.original.roundType ?? "-",
    },
    {
      accessorKey: "memberRole",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("reviewer.role")} />,
      cell: ({ row }) => row.original.memberRole ?? "-",
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("reviewer.invitationStatus")} />,
      cell: ({ row }) => (row.original.status ? <StatusBadge status={row.original.status} /> : "-"),
    },
    {
      accessorKey: "roundStatus",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("reviewer.roundStatus")} />,
      cell: ({ row }) => (row.original.roundStatus ? <StatusBadge status={row.original.roundStatus} /> : "-"),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => onView(row.original)}>
            <Eye />
            {t("common.view")}
          </Button>
        </div>
      ),
    },
  ];
}
