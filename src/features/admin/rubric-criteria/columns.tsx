import type { ColumnDef } from "@tanstack/react-table";
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
  onEdit: (criterion: RubricCriterion) => void;
  onDelete: (criterion: RubricCriterion) => void;
}

export function getRubricCriterionColumns({
  onEdit,
  onDelete,
}: GetRubricCriterionColumnsOptions): ColumnDef<RubricCriterion>[] {
  return [
    {
      id: "roundType",
      accessorFn: (row) => roundTypeLabel(row.roundType),
      header: ({ column }) => <DataTableColumnHeader column={column} title="Round Type" />,
    },
    {
      accessorKey: "orderIndex",
      header: ({ column }) => (
        <div className="text-right">
          <DataTableColumnHeader column={column} title="Order" className="ml-0" />
        </div>
      ),
      cell: ({ row }) => <div className="text-right tabular-nums text-muted-foreground">{row.original.orderIndex}</div>,
    },
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => <span className="font-medium text-foreground">{row.original.name}</span>,
    },
    {
      accessorKey: "maxScore",
      header: ({ column }) => (
        <div className="text-right">
          <DataTableColumnHeader column={column} title="Max Score" className="ml-0" />
        </div>
      ),
      cell: ({ row }) => <div className="text-right tabular-nums font-medium text-foreground">{row.original.maxScore}</div>,
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
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
