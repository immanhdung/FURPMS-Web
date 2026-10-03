import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/tables/DataTableRowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ResearchKindBadge } from "@/components/shared/ResearchKindBadge";
import { formatCurrency } from "@/utils/format";
import { researchTypeDisplayName } from "@/utils/research-type";
import type { ResearchType } from "@/types/research-type";

interface GetResearchTypeColumnsOptions {
  t: TFunction;
  onEdit: (researchType: ResearchType) => void;
}

export function getResearchTypeColumns({ t, onEdit }: GetResearchTypeColumnsOptions): ColumnDef<ResearchType>[] {
  return [
    {
      accessorKey: "code",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("researchTypes.code")} />,
    },
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("researchTypes.name")} />,
      cell: ({ row }) => researchTypeDisplayName(row.original, t),
    },
    {
      accessorKey: "maxBudgetCap",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("researchTypes.maxBudgetCap")} />,
      cell: ({ row }) => formatCurrency(row.original.maxBudgetCap),
    },
    {
      accessorKey: "requireOrderingUnit",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("researchKind.column")} />,
      cell: ({ row }) => (
        <div className="space-y-1">
          <ResearchKindBadge isApplied={row.original.kind === "APPLIED"} />
        </div>
      ),
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("common.status")} />,
      cell: ({ row }) => <StatusBadge status={row.original.isActive ? "Active" : "Inactive"} />,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DataTableRowActions onEdit={() => onEdit(row.original)} />
        </div>
      ),
    },
  ];
}
