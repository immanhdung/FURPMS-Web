import type { ColumnDef } from "@tanstack/react-table";
import { UserCog, PowerOff } from "lucide-react";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/tables/DataTableRowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Track } from "@/types/track";

interface GetTrackColumnsOptions {
  ownerNames: Record<string, string>;
  onEdit: (track: Track) => void;
  onAssignOwner: (track: Track) => void;
  onDeactivate: (track: Track) => void;
}

export function getTrackColumns({
  ownerNames,
  onEdit,
  onAssignOwner,
  onDeactivate,
}: GetTrackColumnsOptions): ColumnDef<Track>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    },
    {
      accessorKey: "description",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
      cell: ({ row }) => row.original.description ?? "-",
    },
    {
      id: "owner",
      accessorFn: (row) => (row.ownerId ? (ownerNames[row.ownerId] ?? row.ownerId) : "Unassigned"),
      header: ({ column }) => <DataTableColumnHeader column={column} title="Owner" />,
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
          <DataTableRowActions
            onEdit={() => onEdit(row.original)}
            extraActions={[
              { label: "Assign owner", icon: UserCog, onSelect: () => onAssignOwner(row.original) },
              ...(row.original.isActive
                ? [{ label: "Deactivate", icon: PowerOff, onSelect: () => onDeactivate(row.original), variant: "destructive" as const }]
                : []),
            ]}
          />
        </div>
      ),
    },
  ];
}
