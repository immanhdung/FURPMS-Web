import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { Users, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/tables/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { useUsersQuery, useDeleteUserMutation, useToggleUserActiveMutation } from "@/hooks/useUsers";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useAuthStore } from "@/store/auth.store";
import { getUserColumns } from "@/features/admin/users/columns";
import { CreateUserSheet } from "@/features/admin/users/CreateUserSheet";
import { EditUserSheet } from "@/features/admin/users/EditUserSheet";
import { UserDetailSheet } from "@/features/admin/users/UserDetailSheet";
import { ALL_ROLES, ROLE_PRIORITY } from "@/constants/roles";
import type { Role } from "@/constants/roles";
import { cn } from "@/lib/utils";
import type { AdminUser } from "@/types/user";

const ROLE_STYLING: Record<Role | "ALL", { active: string; inactive: string }> = {
  ALL: {
    active: "bg-linear-to-r from-slate-700 to-slate-800 text-white shadow-soft-sm border-slate-700 dark:from-slate-600 dark:to-slate-700",
    inactive: "bg-card/50 text-slate-600 border-border hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/40 dark:hover:text-slate-100",
  },
  Admin: {
    active: "bg-linear-to-r from-red-500 to-rose-600 text-white shadow-soft-sm border-red-500",
    inactive: "bg-rose-500/10 text-rose-600 border-rose-200/50 hover:bg-rose-500/20 hover:text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-950/40 dark:hover:bg-rose-950/30",
  },
  Staff: {
    active: "bg-linear-to-r from-emerald-500 to-teal-600 text-white shadow-soft-sm border-emerald-500",
    inactive: "bg-emerald-500/10 text-emerald-600 border-emerald-200/50 hover:bg-emerald-500/20 hover:text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-950/40 dark:hover:bg-emerald-950/30",
  },
  Faculty: {
    active: "bg-linear-to-r from-blue-500 to-indigo-600 text-white shadow-soft-sm border-blue-500",
    inactive: "bg-blue-500/10 text-blue-600 border-blue-200/50 hover:bg-blue-500/20 hover:text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-950/40 dark:hover:bg-blue-950/30",
  },
  ReviewCommittee: {
    active: "bg-linear-to-r from-violet-500 to-fuchsia-600 text-white shadow-soft-sm border-violet-500",
    inactive: "bg-violet-500/10 text-violet-600 border-violet-200/50 hover:bg-violet-500/20 hover:text-violet-700 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-950/40 dark:hover:bg-violet-950/30",
  },
};

export function UsersPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch, isRefetching } = useUsersQuery();

  const [roleFilter, setRoleFilter] = useState<Role | "ALL">("ALL");
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  const currentUser = useAuthStore((state) => state.user);
  const deleteMutation = useDeleteUserMutation();
  const toggleMutation = useToggleUserActiveMutation();

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
        onDelete: (user) => setDeleteTarget(user),
        onToggleActive: (user) => toggleMutation.mutate(user.id),
        currentUserId: currentUser?.id,
      }),
    // toggleMutation ổn định giữa các lần render nên không đưa vào deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, currentUser?.id]
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
        <Button variant="gradient" onClick={() => setCreateOpen(true)}>
          <UserPlus />
          {t("users.newBtn")}
        </Button>
      </motion.div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />
      ) : (
        <>
        <div className="flex flex-wrap items-center gap-2">
          {(["ALL", ...ALL_ROLES] as const).map((role) => {
            const styles = ROLE_STYLING[role];
            const isActive = roleFilter === role;
            return (
              <button
                key={role}
                type="button"
                onClick={() => setRoleFilter(role)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-semibold tracking-wide uppercase transition-all duration-200 cursor-pointer shadow-soft-xs hover:scale-[1.02] active:scale-[0.98]",
                  isActive ? styles.active : styles.inactive
                )}
              >
                {role === "ALL" ? t("users.filterAll") : t(`roleName.${role}`, { defaultValue: role })}
                <span className={cn("ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold transition-colors", isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground")}>
                  {countByRole.get(role) ?? 0}
                </span>
              </button>
            );
          })}
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
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        variant="destructive"
        title={t("users.deleteTitle")}
        description={t("users.deleteDesc", { name: deleteTarget?.fullName ?? "" })}
        confirmLabel={t("common.delete")}
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          // Đóng hộp thoại ngay cả khi BE từ chối: lý do từ chối hiện ở toast, giữ hộp thoại mở
          // chỉ che mất thông báo đó.
          deleteMutation.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) });
        }}
      />
    </div>
  );
}
