import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/components/tables/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { useMyMembershipsQuery } from "@/hooks/useMemberships";
import { getMembershipColumns } from "@/features/reviewer/council-memberships/columns";
import { ROUTES } from "@/constants/routes";

export function CouncilMembershipsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch, isRefetching } = useMyMembershipsQuery();
  // MyMembershipDto has no timestamp field to sort by — the backend returns rows in creation
  // order (oldest first), so reversing approximates "newest first" until it exposes a real one.
  const sortedData = useMemo(() => [...(data ?? [])].reverse(), [data]);

  const columns = useMemo(
    () => getMembershipColumns(t, (membership) => navigate(`${ROUTES.ASSIGNED_REVIEWS}/${membership.councilId}`)),
    [t, navigate]
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("reviewer.membershipsTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("reviewer.membershipsSubtitle")}</p>
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />
      ) : (
        <DataTable
          columns={columns}
          data={sortedData}
          isLoading={isLoading}
          searchPlaceholder={t("reviewer.membershipsSearch")}
          exportFileName="council-memberships"
          emptyTitle={t("reviewer.noMemberships")}
          emptyDescription={t("reviewer.noMembershipsDesc")}
        />
      )}
    </div>
  );
}
