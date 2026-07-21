import type { ColumnDef } from "@tanstack/react-table";
import { Ban, Send } from "lucide-react";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/tables/DataTableRowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PROPOSAL_STATUS } from "@/constants/statuses";
import { formatDate } from "@/utils/format";
import type { ProposalSummary } from "@/types/proposal-summary";

import type { TFunction } from "i18next";

interface GetMyProposalColumnsOptions {
  t: TFunction;
  cycleNames: Record<number, string>;
  trackNames: Record<string, string>;
  onView: (proposal: ProposalSummary) => void;
  onEdit: (proposal: ProposalSummary) => void;
  onSubmit: (proposal: ProposalSummary) => void;
  onWithdraw: (proposal: ProposalSummary) => void;
}

export function getMyProposalColumns({
  t,
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
      accessorFn: (row) => row.titleVI || row.titleEN || t("proposal.untitled"),
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("proposal.title")} />,
    },
    {
      id: "cycle",
      // Ưu tiên tên BE trả sẵn; nếu thiếu thì resolve qua map, cuối cùng mới hiện dấu "-".
      accessorFn: (row) => row.cycleName ?? (row.cycleId ? cycleNames[row.cycleId] : null) ?? "-",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("proposal.cycle")} />,
    },
    {
      id: "track",
      accessorFn: (row) => row.trackName ?? (row.trackId ? trackNames[row.trackId] : null) ?? "-",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("proposal.researchField")} />,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("common.status")} />,
      cell: ({ row }) => (row.original.status ? <StatusBadge status={row.original.status} /> : <StatusBadge status={PROPOSAL_STATUS.DRAFT} />),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("common.createdAt")} />,
      cell: ({ row }) => (row.original.createdAt ? formatDate(row.original.createdAt) : "-"),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const status = (row.original.status ?? PROPOSAL_STATUS.DRAFT).toUpperCase();
        const isDraft = status === PROPOSAL_STATUS.DRAFT;
        const canWithdraw = status === PROPOSAL_STATUS.SUBMITTED || status === PROPOSAL_STATUS.UNDER_REVIEW;

        return (
          <div className="flex justify-end">
            <DataTableRowActions
              onView={() => onView(row.original)}
              onEdit={isDraft ? () => onEdit(row.original) : undefined}
              extraActions={[
                ...(isDraft ? [{ label: t("common.submit"), icon: Send, onSelect: () => onSubmit(row.original) }] : []),
                ...(canWithdraw
                  ? [{ label: t("proposal.withdraw"), icon: Ban, onSelect: () => onWithdraw(row.original), variant: "destructive" as const }]
                  : []),
              ]}
            />
          </div>
        );
      },
    },
  ];
}
