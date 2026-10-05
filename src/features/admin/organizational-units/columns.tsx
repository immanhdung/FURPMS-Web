import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/tables/DataTableRowActions";
import { Trash2 } from "lucide-react";
import type { OrganizationalUnit } from "@/types/organizational-unit";

interface GetOrgUnitColumnsOptions {
  t: TFunction;
  parentNames: Record<number, string>;
  onView: (unit: OrganizationalUnit) => void;
  onEdit: (unit: OrganizationalUnit) => void;
  onDelete: (unit: OrganizationalUnit) => void;
}

export function getOrgUnitColumns({ t, parentNames, onView, onEdit, onDelete }: GetOrgUnitColumnsOptions): ColumnDef<OrganizationalUnit>[] {
  return [
    {
      accessorKey: "code",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("common.code")} />,
    },
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("common.name")} />,
    },
    {
      accessorKey: "unitType",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("orgUnits.type")} />,
    },
    {
      id: "parent",
      accessorFn: (row) => (row.parentId ? (parentNames[row.parentId] ?? row.parentId) : "-"),
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("orgUnits.parentUnit")} />,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DataTableRowActions
            onView={() => onView(row.original)}
            onEdit={() => onEdit(row.original)}
            extraActions={[
              // BE chặn nếu đơn vị đang được người dùng / đề tài / danh mục đặt hàng / đơn vị con
              // dùng — còn dùng thì vô hiệu hoá chứ không xoá vĩnh viễn.
              {
                label: t("common.delete"),
                icon: Trash2,
                onSelect: () => onDelete(row.original),
                variant: "destructive" as const,
              },
            ]}
          />
        </div>
      ),
    },
  ];
}
