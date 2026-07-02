import type { ColumnDef } from "@tanstack/react-table";
import { Ban, Send } from "lucide-react";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/tables/DataTableRowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PROPOSAL_STATUS } from "@/constants/statuses";
import { formatDate } from "@/utils/format";
import type { ProposalSummary } from "@/types/proposal-summary";

interface GetMyProposalColumnsOptions {
  cycleNames: Record<number, string>;
  trackNames: Record<string, string>;
  onView: (proposal: ProposalSummary) => void;
  onEdit: (proposal: ProposalSummary) => void;
  onSubmit: (proposal: ProposalSummary) => void;
  onWithdraw: (proposal: ProposalSummary) => void;
}

export function getMyProposalColumns({
  cycleNames,
  trackNames,
  onView,
  onEdit,
  onSubmit,
  onWithdraw,
}: GetMyProposalColumnsOptions): ColumnDef<ProposalSummary>[] {
  return [
    {
      id: "title",
      accessorFn: (row) => row.titleEN || row.titleVI || "Untitled proposal",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
    },
    {
      id: "cycle",
      accessorFn: (row) => (row.cycleId ? (cycleNames[row.cycleId] ?? row.cycleId) : "-"),
      header: ({ column }) => <DataTableColumnHeader column={column} title="Cycle" />,
    },
    {
      id: "track",
      accessorFn: (row) => (row.trackId ? (trackNames[row.trackId] ?? row.trackId) : "-"),
      header: ({ column }) => <DataTableColumnHeader column={column} title="Research Field" />,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (row.original.status ? <StatusBadge status={row.original.status} /> : <StatusBadge status={PROPOSAL_STATUS.DRAFT} />),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      cell: ({ row }) => (row.original.createdAt ? formatDate(row.original.createdAt) : "-"),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const status = row.original.status ?? PROPOSAL_STATUS.DRAFT;
        const isDraft = status === PROPOSAL_STATUS.DRAFT;
        const canWithdraw = status === PROPOSAL_STATUS.SUBMITTED || status === PROPOSAL_STATUS.UNDER_REVIEW;

        return (
          <div className="flex justify-end">
            <DataTableRowActions
              onView={() => onView(row.original)}
              onEdit={isDraft ? () => onEdit(row.original) : undefined}
              extraActions={[
                ...(isDraft ? [{ label: "Submit", icon: Send, onSelect: () => onSubmit(row.original) }] : []),
                ...(canWithdraw
                  ? [{ label: "Withdraw", icon: Ban, onSelect: () => onWithdraw(row.original), variant: "destructive" as const }]
                  : []),
              ]}
            />
          </div>
        );
      },
    },
  ];
}
