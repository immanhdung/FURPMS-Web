import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/tables/DataTableRowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { rubricRoundTypeToAppType } from "@/constants/statuses";
import type { RubricCriterion } from "@/types/rubric-criterion";

/**
 * Nhãn loại vòng phải đi qua i18n như mọi nơi khác trong app.
 * Trước đây dùng `ROUND_TYPE_LABELS` — bảng tiếng Anh hardcode, nên cột này hiện
 * "Review"/"Final" giữa giao diện tiếng Việt; "Final" lại chẳng ai hiểu là Nghiệm thu.
 */
function roundTypeLabel(roundType: string, t: TFunction) {
  const type = rubricRoundTypeToAppType(roundType);
  return type ? t(`reviewBoard.type.${type}`, type) : roundType;
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
      accessorFn: (row) => roundTypeLabel(row.roundType, t),
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
