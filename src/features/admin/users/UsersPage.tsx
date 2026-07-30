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
import type { AdminUser } from "@/types/user";

export function UsersPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch, isRefetching } = useUsersQuery();

  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);

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
        <DataTable
          columns={columns}
          data={data ?? []}
          isLoading={isLoading}
          searchPlaceholder={t("users.searchPlaceholder")}
          exportFileName="users"
          emptyTitle={t("users.emptyTitle")}
          emptyDescription={t("users.emptyDesc")}
        />
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
