import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";
import { UserCog, PowerOff } from "lucide-react";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/tables/DataTableRowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Track } from "@/types/track";

interface GetTrackColumnsOptions {
  t: TFunction;
  ownerNames: Record<string, string>;
  onEdit: (track: Track) => void;
  onAssignOwner: (track: Track) => void;
  onDeactivate: (track: Track) => void;
}

export function getTrackColumns({
  t,
  ownerNames,
  onEdit,
  onAssignOwner,
  onDeactivate,
}: GetTrackColumnsOptions): ColumnDef<Track>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("common.name")} />,
    },
    {
      accessorKey: "description",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("common.description")} />,
      cell: ({ row }) => row.original.description ?? "-",
    },
    {
      id: "owner",
      accessorFn: (row) => (row.ownerId ? (ownerNames[row.ownerId] ?? row.ownerId) : t("staff.unassigned")),
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("staff.owner")} />,
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
          <DataTableRowActions
            onEdit={() => onEdit(row.original)}
            extraActions={[
              { label: t("staff.assignOwner"), icon: UserCog, onSelect: () => onAssignOwner(row.original) },
              ...(row.original.isActive
                ? [{ label: t("common.deactivate"), icon: PowerOff, onSelect: () => onDeactivate(row.original), variant: "destructive" as const }]
                : []),
            ]}
          />
        </div>
      ),
    },
  ];
}
