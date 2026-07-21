import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/tables/DataTableRowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency } from "@/utils/format";
import type { ResearchType } from "@/types/research-type";

interface GetResearchTypeColumnsOptions {
  t: TFunction;
  onEdit: (researchType: ResearchType) => void;
  onDelete: (researchType: ResearchType) => void;
}

export function getResearchTypeColumns({ t, onEdit, onDelete }: GetResearchTypeColumnsOptions): ColumnDef<ResearchType>[] {
  return [
    {
      accessorKey: "code",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("researchTypes.code")} />,
    },
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("researchTypes.name")} />,
    },
    {
      accessorKey: "maxBudgetCap",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("researchTypes.maxBudgetCap")} />,
      cell: ({ row }) => formatCurrency(row.original.maxBudgetCap),
    },
    {
      accessorKey: "requireOrderingUnit",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("researchTypes.requiresOrderingUnit")} />,
      cell: ({ row }) => (row.original.requireOrderingUnit ? t("common.yes") : t("common.no")),
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
          <DataTableRowActions onEdit={() => onEdit(row.original)} onDelete={() => onDelete(row.original)} />
        </div>
      ),
    },
  ];
}
