import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/tables/DataTableRowActions";
import type { AdminUser } from "@/types/user";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface GetUserColumnsOptions {
  t: TFunction;
  onView: (user: AdminUser) => void;
  onEdit: (user: AdminUser) => void;
}

export function getUserColumns({ t, onView, onEdit }: GetUserColumnsOptions): ColumnDef<AdminUser>[] {
  return [
    {
      accessorKey: "fullName",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("users.name")} />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <Avatar size="sm">
            <AvatarImage src={row.original.avatarUrl ?? undefined} alt={row.original.fullName} />
            <AvatarFallback>{initials(row.original.fullName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{row.original.fullName}</p>
            <p className="truncate text-xs text-muted-foreground">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "roles",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("users.roles")} />,
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.roles.map((role) => (
            <Badge key={role} variant="secondary">
              {role}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "department",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("users.department")} />,
      cell: ({ row }) => row.original.department ?? "-",
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("common.status")} />,
      cell: ({ row }) => row.original.status ?? "-",
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DataTableRowActions onView={() => onView(row.original)} onEdit={() => onEdit(row.original)} />
        </div>
      ),
    },
  ];
}
