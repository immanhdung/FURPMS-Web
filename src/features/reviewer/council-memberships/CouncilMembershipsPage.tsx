import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import { DataTable } from "@/components/tables/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { useMyMembershipsQuery } from "@/hooks/useMemberships";
import { getMembershipColumns } from "@/features/reviewer/council-memberships/columns";
import { ROUTES } from "@/constants/routes";

export function CouncilMembershipsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch, isRefetching } = useMyMembershipsQuery();

  const columns = useMemo(
    () => getMembershipColumns((membership) => navigate(`${ROUTES.ASSIGNED_REVIEWS}/${membership.councilId}`)),
    [navigate]
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary/10 to-brand-secondary/10 text-primary">
          <Users className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Council Memberships</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Your full history of council memberships, past and present.</p>
        </div>
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />
      ) : (
        <DataTable
          columns={columns}
          data={data ?? []}
          isLoading={isLoading}
          searchPlaceholder="Search memberships..."
          exportFileName="council-memberships"
          emptyTitle="No council memberships yet"
          emptyDescription="Your council memberships will appear here once you accept an invitation."
        />
      )}
    </div>
  );
}
