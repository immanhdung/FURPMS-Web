import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { Users, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/tables/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { useUsersQuery } from "@/hooks/useUsers";
import { getUserColumns } from "@/features/admin/users/columns";
import { CreateUserSheet } from "@/features/admin/users/CreateUserSheet";
import { EditUserSheet } from "@/features/admin/users/EditUserSheet";
import { UserDetailSheet } from "@/features/admin/users/UserDetailSheet";
import { ALL_ROLES, ROLE_PRIORITY } from "@/constants/roles";
import type { Role } from "@/constants/roles";
import { cn } from "@/lib/utils";
import type { AdminUser } from "@/types/user";

export function UsersPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch, isRefetching } = useUsersQuery();

  const [roleFilter, setRoleFilter] = useState<Role | "ALL">("ALL");
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);

  /*
   * Danh sách người dùng trước đây chỉ sắp theo tên nên nhìn rối: Quản trị, Giảng viên, Hội đồng
   * xen kẽ nhau, muốn tìm "còn phản biện nào" phải đọc hết. Nay lọc được theo vai, và trong mỗi
   * nhóm sắp theo VAI CHÍNH rồi mới tới tên.
   */
  const rolePriority = (u: AdminUser) => {
    const idx = ROLE_PRIORITY.findIndex((r) => u.roles.includes(r));
    return idx < 0 ? ROLE_PRIORITY.length : idx;
  };

  const countByRole = useMemo(() => {
    const map = new Map<Role | "ALL", number>([["ALL", data?.length ?? 0]]);
    for (const role of ALL_ROLES) {
      map.set(role, (data ?? []).filter((u) => u.roles.includes(role)).length);
    }
    return map;
  }, [data]);

  const visibleUsers = useMemo(() => {
    const rows = roleFilter === "ALL" ? (data ?? []) : (data ?? []).filter((u) => u.roles.includes(roleFilter));
    return [...rows].sort(
      (a, b) => rolePriority(a) - rolePriority(b) || a.fullName.localeCompare(b.fullName, "vi")
    );
  }, [data, roleFilter]);

  const columns = useMemo(
    () =>
      getUserColumns({
        t,
        onView: (user) => setDetailUserId(user.id),
        onEdit: (user) => setEditUser(user),
      }),
    [t]
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary/15 to-brand-secondary/10 text-primary">
            <Users className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("users.title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("users.subtitle")}</p>
          </div>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <UserPlus />
          {t("users.newBtn")}
        </Button>
      </motion.div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />
      ) : (
        <>
        <div className="flex flex-wrap items-center gap-2">
          {(["ALL", ...ALL_ROLES] as const).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setRoleFilter(role)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition-colors",
                roleFilter === role
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              )}
            >
              {role === "ALL" ? t("users.filterAll") : t(`roleName.${role}`, { defaultValue: role })}
              <span className="ml-1.5 opacity-70">{countByRole.get(role) ?? 0}</span>
            </button>
          ))}
        </div>

        <DataTable
          columns={columns}
          data={visibleUsers}
          isLoading={isLoading}
          searchPlaceholder={t("users.searchPlaceholder")}
          exportFileName="users"
          emptyTitle={t("users.emptyTitle")}
          emptyDescription={t("users.emptyDesc")}
        />
        </>
      )}

      <CreateUserSheet open={createOpen} onOpenChange={setCreateOpen} />
      <EditUserSheet open={Boolean(editUser)} onOpenChange={(open) => !open && setEditUser(null)} user={editUser} />
      <UserDetailSheet
        open={Boolean(detailUserId)}
        onOpenChange={(open) => !open && setDetailUserId(null)}
        userId={detailUserId}
      />
    </div>
  );
}
