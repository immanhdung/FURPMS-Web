import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { ProposalsTable } from "@/features/staff/proposal-reviews/ProposalsTable";
import { ROUTES } from "@/constants/routes";
import type { ProposalSummary } from "@/types/proposal-summary";

export function AssignmentsPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Assignments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Assign reviewers to councils and track invitation responses.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-3.5 text-xs text-muted-foreground">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-primary/15 to-brand-secondary/10">
          <Mail className="size-3.5 text-primary" />
        </div>
        <p className="pt-1">
          Pick a proposal below, open a review round's council, then manage members and invitation responses from
          there.
        </p>
      </div>

      <ProposalsTable onOpen={(proposal: ProposalSummary) => navigate(`${ROUTES.PROPOSAL_REVIEWS}/${proposal.id}`)} />
    </div>
  );
}
