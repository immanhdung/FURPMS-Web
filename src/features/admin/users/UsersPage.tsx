import { useState } from "react";
import { UserPlus } from "lucide-react";
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
  const { data, isLoading, isError, refetch, isRefetching } = useUsersQuery();

  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);

  const columns = getUserColumns({
    onView: (user) => setDetailUserId(user.id),
    onEdit: (user) => setEditUser(user),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage user accounts and role assignments.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <UserPlus />
          New user
        </Button>
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />
      ) : (
        <DataTable
          columns={columns}
          data={data ?? []}
          isLoading={isLoading}
          searchPlaceholder="Search users..."
          exportFileName="users"
          emptyTitle="No users found"
          emptyDescription="Create a user account to get started."
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
