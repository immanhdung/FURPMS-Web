import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTableRowActions } from "@/components/tables/DataTableRowActions";
import { Lock, Unlock } from "lucide-react";
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
  onDelete: (user: AdminUser) => void;
  onToggleActive: (user: AdminUser) => void;
  /** Tài khoản đang đăng nhập — không cho tự xoá chính mình (BE cũng chặn, đây là chặn sớm cho đỡ bực). */
  currentUserId?: string;
}

export function getUserColumns({
  t,
  onView,
  onEdit,
  onDelete,
  onToggleActive,
  currentUserId,
}: GetUserColumnsOptions): ColumnDef<AdminUser>[] {
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
              {/* Bảng nhãn `roleName` đã có sẵn cả vi lẫn en — trước đây cột này in thẳng mã
                  Admin/Staff/Faculty/ReviewCommittee. */}
              {t(`roleName.${role}`, { defaultValue: role })}
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
      id: "status",
      // BE trả `isActive` (bool), không có `status` — cột này trước đây luôn hiện "-".
      accessorFn: (row) => (row.isActive === false ? t("users.locked") : t("users.active")),
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("common.status")} />,
      cell: ({ row }) => (
        <StatusBadge status={row.original.isActive === false ? "INACTIVE" : "ACTIVE"} />
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original;
        const isSelf = Boolean(currentUserId) && user.id === currentUserId;
        const isLocked = user.isActive === false;
        return (
          <div className="flex justify-end">
            <DataTableRowActions
              onView={() => onView(user)}
              onEdit={() => onEdit(user)}
              extraActions={[
                {
                  label: isLocked ? t("users.unlock") : t("users.lock"),
                  icon: isLocked ? Unlock : Lock,
                  onSelect: () => onToggleActive(user),
                },
              ]}
              // Tự xoá mình thì phiên đang dùng thành tài khoản không tồn tại — ẩn luôn cho khỏi bấm nhầm.
              onDelete={isSelf ? undefined : () => onDelete(user)}
            />
          </div>
        );
      },
    },
  ];
}
