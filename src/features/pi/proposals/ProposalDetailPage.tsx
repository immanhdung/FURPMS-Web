import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Ban, Pencil, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageLoader } from "@/components/shared/PageLoader";
import { ErrorState } from "@/components/shared/ErrorState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useProposalQuery, useWithdrawProposalMutation } from "@/hooks/useProposals";
import { useCyclesQuery } from "@/hooks/useCycles";
import { useTracksQuery } from "@/hooks/useTracks";
import { useResearchTypesQuery } from "@/hooks/useResearchTypes";
import { ProposalStatusTimeline } from "@/features/pi/proposals/ProposalStatusTimeline";
import { ProposalSummaryView } from "@/features/pi/proposals/ProposalSummaryView";
import { SubmitProposalDialog } from "@/features/pi/proposals/SubmitProposalDialog";
import { AiSummaryCard } from "@/features/pi/proposals/AiSummaryCard";
import { AiFeedbackCard } from "@/features/pi/proposals/AiFeedbackCard";
import { PROPOSAL_STATUS } from "@/constants/statuses";
import { ROUTES } from "@/constants/routes";

export function ProposalDetailPage() {
  const { proposalId } = useParams<{ proposalId: string }>();
  const navigate = useNavigate();

  const { data: proposal, isLoading, isError, refetch, isRefetching } = useProposalQuery(proposalId ?? null);
  const { data: cycles } = useCyclesQuery();
  const { data: tracks } = useTracksQuery();
  const { data: researchTypes } = useResearchTypesQuery();
  const withdrawMutation = useWithdrawProposalMutation();

  const [submitOpen, setSubmitOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  if (isLoading) return <PageLoader label="Loading proposal..." />;
  if (isError || !proposal) return <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />;

  const status = (proposal.status ?? PROPOSAL_STATUS.DRAFT).toUpperCase();
  const isDraft = status === PROPOSAL_STATUS.DRAFT;
  const canWithdraw = status === PROPOSAL_STATUS.SUBMITTED || status === PROPOSAL_STATUS.UNDER_REVIEW;

  const cycleName = cycles?.find((c) => c.id === proposal.cycleId)?.name;
  const trackName = tracks?.find((t) => t.id.toString() === proposal.trackId)?.name;
  const researchTypeName = researchTypes?.find((rt) => rt.id === proposal.researchType)?.name;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Button variant="ghost" size="sm" className="-ml-2" onClick={() => navigate(ROUTES.MY_PROPOSALS)}>
        <ArrowLeft />
        Back to my proposals
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {proposal.titleEN || proposal.titleVI || "Untitled proposal"}
            </h1>
            <StatusBadge status={status} />
          </div>
        </div>

        <div className="flex gap-2">
          {isDraft && (
            <Button variant="outline" onClick={() => navigate(`${ROUTES.SUBMIT_PROPOSAL}/${proposal.id}`)}>
              <Pencil />
              Edit
            </Button>
          )}
          {isDraft && (
            <Button onClick={() => setSubmitOpen(true)}>
              <Send />
              Submit
            </Button>
          )}
          {canWithdraw && (
            <Button variant="destructive" onClick={() => setWithdrawOpen(true)}>
              <Ban />
              Withdraw
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <ProposalStatusTimeline status={status} />
      </div>

      <ProposalSummaryView data={proposal} cycleName={cycleName} trackName={trackName} researchTypeName={researchTypeName} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AiSummaryCard proposalId={proposal.id} />
        <AiFeedbackCard proposalId={proposal.id} />
      </div>

      <SubmitProposalDialog open={submitOpen} onOpenChange={setSubmitOpen} proposalId={proposal.id} />

      <ConfirmDialog
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        title="Withdraw proposal"
        description="Are you sure you want to withdraw this proposal? This cannot be undone."
        variant="destructive"
        confirmLabel="Withdraw"
        isLoading={withdrawMutation.isPending}
        onConfirm={() => withdrawMutation.mutate(proposal.id, { onSuccess: () => setWithdrawOpen(false) })}
      />
    </div>
  );
}
