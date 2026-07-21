import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/utils/format";
import type { ProposalSummary } from "@/types/proposal-summary";

interface GetProposalColumnsOptions {
  t: TFunction;
  cycleNames: Record<number, string>;
  trackNames: Record<string, string>;
  onOpen: (proposal: ProposalSummary) => void;
}

export function getProposalColumns({ t, cycleNames, trackNames, onOpen }: GetProposalColumnsOptions): ColumnDef<ProposalSummary>[] {
  return [
    {
      id: "title",
      accessorFn: (row) => row.titleEN || row.titleVI || t("common.untitledProposal"),
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("staff.title")} />,
    },
    {
      id: "cycle",
      accessorFn: (row) => (row.cycleId ? (cycleNames[row.cycleId] ?? row.cycleId) : "-"),
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("staff.cycle")} />,
    },
    {
      id: "track",
      accessorFn: (row) => (row.trackId ? (trackNames[row.trackId] ?? row.trackId) : "-"),
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("staff.researchField")} />,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("common.status")} />,
      cell: ({ row }) => (row.original.status ? <StatusBadge status={row.original.status} /> : "-"),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("staff.submitted")} />,
      cell: ({ row }) => (row.original.createdAt ? formatDate(row.original.createdAt) : "-"),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => onOpen(row.original)}>
            <Eye />
            {t("staff.review")}
          </Button>
        </div>
      ),
    },
  ];
}
