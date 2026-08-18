import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { proposalTitle, formatDate } from "@/utils/format";
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
      // `meta.label` là nhãn cho menu "Bật/tắt cột" — không có thì nó hiện `id` thô ("Title",
      // "CreatedAt") giữa giao diện tiếng Việt.
      meta: { label: t("staff.title") },
      accessorFn: (row) => proposalTitle(row, t("common.untitledProposal")),
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("staff.title")} />,
    },
    {
      id: "cycle",
      meta: { label: t("staff.cycle") },
      // BE trả sẵn cycleName/trackName (semester code + tên lĩnh vực); summary KHÔNG có cycleId/trackId
      // nên cột cũ luôn ra "-". Ưu tiên tên trực tiếp, giữ lookup theo id làm fallback.
      accessorFn: (row) => row.cycleName ?? (row.cycleId ? cycleNames[row.cycleId] : undefined) ?? "-",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("staff.cycle")} />,
    },
    {
      id: "track",
      meta: { label: t("staff.researchField") },
      accessorFn: (row) => row.trackName ?? (row.trackId ? trackNames[row.trackId] : undefined) ?? "-",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("staff.researchField")} />,
    },
    {
      id: "pi",
      meta: { label: t("staff.pi") },
      accessorFn: (row) => row.principalInvestigatorName || "-",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("staff.pi")} />,
    },
    {
      accessorKey: "status",
      meta: { label: t("common.status") },
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("common.status")} />,
      cell: ({ row }) => (row.original.status ? <StatusBadge status={row.original.status} /> : "-"),
    },
    {
      accessorKey: "createdAt",
      meta: { label: t("staff.submitted") },
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
            {t("staff.viewDetail")}
          </Button>
        </div>
      ),
    },
  ];
}
