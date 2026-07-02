import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/tables/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useMyProposalsQuery, useWithdrawProposalMutation } from "@/hooks/useProposals";
import { useCyclesQuery } from "@/hooks/useCycles";
import { useTracksQuery } from "@/hooks/useTracks";
import { getMyProposalColumns } from "@/features/pi/proposals/columns";
import { SubmitProposalDialog } from "@/features/pi/proposals/SubmitProposalDialog";
import { ROUTES } from "@/constants/routes";
import type { ProposalSummary } from "@/types/proposal-summary";

export function MyProposalsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch, isRefetching } = useMyProposalsQuery();
  const { data: cycles } = useCyclesQuery();
  const { data: tracks } = useTracksQuery();
  const withdrawMutation = useWithdrawProposalMutation();

  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [withdrawingProposal, setWithdrawingProposal] = useState<ProposalSummary | null>(null);

  const cycleNames = useMemo(() => Object.fromEntries((cycles ?? []).map((c) => [c.id, c.name])), [cycles]);
  const trackNames = useMemo(() => Object.fromEntries((tracks ?? []).map((t) => [t.id.toString(), t.name])), [tracks]);

  const columns = getMyProposalColumns({
    cycleNames,
    trackNames,
    onView: (proposal) => navigate(`${ROUTES.MY_PROPOSALS}/${proposal.id}`),
    onEdit: (proposal) => navigate(`${ROUTES.SUBMIT_PROPOSAL}/${proposal.id}`),
    onSubmit: (proposal) => setSubmittingId(proposal.id),
    onWithdraw: (proposal) => setWithdrawingProposal(proposal),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">My Proposals</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track and manage your research proposals.</p>
        </div>
        <Button onClick={() => navigate(ROUTES.SUBMIT_PROPOSAL)}>
          <Plus />
          New proposal
        </Button>
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />
      ) : (
        <DataTable
          columns={columns}
          data={data ?? []}
          isLoading={isLoading}
          searchPlaceholder="Search proposals..."
          exportFileName="my-proposals"
          emptyTitle="No proposals yet"
          emptyDescription="Start a new proposal to submit your research idea."
        />
      )}

      <SubmitProposalDialog open={Boolean(submittingId)} onOpenChange={(open) => !open && setSubmittingId(null)} proposalId={submittingId} />

      <ConfirmDialog
        open={Boolean(withdrawingProposal)}
        onOpenChange={(open) => !open && setWithdrawingProposal(null)}
        title="Withdraw proposal"
        description={`Are you sure you want to withdraw "${withdrawingProposal?.titleEN || withdrawingProposal?.titleVI || "this proposal"}"? This cannot be undone.`}
        variant="destructive"
        confirmLabel="Withdraw"
        isLoading={withdrawMutation.isPending}
        onConfirm={() =>
          withdrawingProposal &&
          withdrawMutation.mutate(withdrawingProposal.id, { onSuccess: () => setWithdrawingProposal(null) })
        }
      />
    </div>
  );
}
