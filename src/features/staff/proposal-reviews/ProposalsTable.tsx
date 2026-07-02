import { useMemo } from "react";
import { DataTable } from "@/components/tables/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { useProposalsQuery } from "@/hooks/useProposals";
import { useCyclesQuery } from "@/hooks/useCycles";
import { useTracksQuery } from "@/hooks/useTracks";
import { getProposalColumns } from "@/features/staff/proposal-reviews/columns";
import type { ProposalListParams, ProposalSummary } from "@/types/proposal-summary";

interface ProposalsTableProps {
  params?: ProposalListParams;
  onOpen: (proposal: ProposalSummary) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function ProposalsTable({ params, onOpen, emptyTitle, emptyDescription }: ProposalsTableProps) {
  const { data, isLoading, isError, refetch, isRefetching } = useProposalsQuery(params);
  const { data: cycles } = useCyclesQuery();
  const { data: tracks } = useTracksQuery();

  const cycleNames = useMemo(() => Object.fromEntries((cycles ?? []).map((c) => [c.id, c.name])), [cycles]);
  const trackNames = useMemo(
    () => Object.fromEntries((tracks ?? []).map((t) => [t.id.toString(), t.name])),
    [tracks]
  );

  const columns = getProposalColumns({ cycleNames, trackNames, onOpen });

  if (isError) {
    return <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />;
  }

  return (
    <DataTable
      columns={columns}
      data={data ?? []}
      isLoading={isLoading}
      searchPlaceholder="Search proposals..."
      exportFileName="proposals"
      emptyTitle={emptyTitle ?? "No proposals found"}
      emptyDescription={emptyDescription ?? "Proposals will appear here once submitted for this cycle."}
    />
  );
}
