import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/tables/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { useMyMembershipsQuery } from "@/hooks/useMemberships";
import { getMembershipColumns } from "@/features/reviewer/council-memberships/columns";
import { ROUTES } from "@/constants/routes";

export function CouncilMembershipsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch, isRefetching } = useMyMembershipsQuery();

  const columns = getMembershipColumns((membership) => navigate(`${ROUTES.ASSIGNED_REVIEWS}/${membership.councilId}`));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Council Memberships</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your full history of council memberships, past and present.</p>
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
