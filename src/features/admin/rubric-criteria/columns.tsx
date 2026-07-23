import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/tables/DataTableRowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ROUND_TYPE_LABELS, rubricRoundTypeToAppType } from "@/constants/statuses";
import type { RubricCriterion } from "@/types/rubric-criterion";

function roundTypeLabel(roundType: string) {
  const type = rubricRoundTypeToAppType(roundType);
  return type ? ROUND_TYPE_LABELS[type] : roundType;
}

interface GetRubricCriterionColumnsOptions {
  t: TFunction;
  onEdit: (criterion: RubricCriterion) => void;
  onDelete: (criterion: RubricCriterion) => void;
}

export function getRubricCriterionColumns({
  t,
  onEdit,
  onDelete,
}: GetRubricCriterionColumnsOptions): ColumnDef<RubricCriterion>[] {
  return [
    {
      id: "roundType",
      accessorFn: (row) => roundTypeLabel(row.roundType),
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("rubricCriteria.roundType")} />,
    },
    {
      accessorKey: "orderIndex",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("rubricCriteria.order")} />,
    },
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("common.name")} />,
    },
    {
      accessorKey: "maxScore",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("rubricCriteria.maxScore")} />,
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
