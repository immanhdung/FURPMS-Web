import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, LayoutGrid, ListTree, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageLoader } from "@/components/shared/PageLoader";
import { ErrorState } from "@/components/shared/ErrorState";
import { cn } from "@/lib/utils";
import { useProposalQuery } from "@/hooks/useProposals";
import { useReviewRoundsQuery } from "@/hooks/useReviewRounds";
import { RoundKanbanBoard } from "@/features/staff/proposal-reviews/RoundKanbanBoard";
import { RoundTimeline } from "@/features/staff/proposal-reviews/RoundTimeline";
import { RoundDetailSheet } from "@/features/staff/proposal-reviews/RoundDetailSheet";
import { CreateReviewRoundSheet } from "@/features/staff/proposal-reviews/CreateReviewRoundSheet";
import { ROUTES } from "@/constants/routes";

type ViewMode = "kanban" | "timeline";

export function ProposalReviewWorkspace() {
  const { proposalId } = useParams<{ proposalId: string }>();
  const navigate = useNavigate();

  const { data: proposal, isLoading: isProposalLoading } = useProposalQuery(proposalId ?? null);
  const { data: rounds, isLoading, isError, refetch, isRefetching } = useReviewRoundsQuery(proposalId ?? null);

  const [view, setView] = useState<ViewMode>("kanban");
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);
  const [createRoundOpen, setCreateRoundOpen] = useState(false);

  const selectedRound = rounds?.find((round) => round.id === selectedRoundId) ?? null;

  if (!proposalId) return null;

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" className="-ml-2" onClick={() => navigate(ROUTES.PROPOSAL_REVIEWS)}>
        <ArrowLeft />
        Back to proposals
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {isProposalLoading ? (
            <PageLoader label="Loading proposal..." />
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  {proposal?.titleEN || proposal?.titleVI || "Proposal"}
                </h1>
                {proposal?.status && <StatusBadge status={proposal.status} />}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Manage review rounds, councils, and meetings.</p>
            </>
          )}
        </div>

        <Button onClick={() => setCreateRoundOpen(true)}>
          <Plus />
          New round
        </Button>
      </div>

      <div className="inline-flex items-center gap-1 rounded-lg bg-muted p-1">
        <button
          onClick={() => setView("kanban")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            view === "kanban" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <LayoutGrid className="size-3.5" />
          Kanban
        </button>
        <button
          onClick={() => setView("timeline")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            view === "timeline" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <ListTree className="size-3.5" />
          Timeline
        </button>
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />
      ) : isLoading ? (
        <PageLoader label="Loading review rounds..." />
      ) : view === "kanban" ? (
        <RoundKanbanBoard rounds={rounds ?? []} onSelect={(round) => setSelectedRoundId(round.id)} />
      ) : (
        <RoundTimeline rounds={rounds ?? []} onSelect={(round) => setSelectedRoundId(round.id)} />
      )}

      <RoundDetailSheet
        open={Boolean(selectedRound)}
        onOpenChange={(open) => !open && setSelectedRoundId(null)}
        proposalId={proposalId}
        round={selectedRound}
      />

      <CreateReviewRoundSheet
        open={createRoundOpen}
        onOpenChange={setCreateRoundOpen}
        proposalId={proposalId}
        existingRounds={rounds ?? []}
      />
    </div>
  );
}
