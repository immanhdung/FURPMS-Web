import { useNavigate } from "react-router-dom";
import { Gavel } from "lucide-react";
import { ProposalsTable } from "@/features/staff/proposal-reviews/ProposalsTable";
import { ROUTES } from "@/constants/routes";
import type { ProposalSummary } from "@/types/proposal-summary";

export function CouncilsPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Councils</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Councils are created per proposal review round. Select a proposal to establish or manage its council.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-3.5 text-xs text-muted-foreground">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-primary/15 to-brand-secondary/10">
          <Gavel className="size-3.5 text-primary" />
        </div>
        <p className="pt-1">Pick a proposal below, then open a review round to establish its council, add members, and send invitations.</p>
      </div>

      <ProposalsTable onOpen={(proposal: ProposalSummary) => navigate(`${ROUTES.PROPOSAL_REVIEWS}/${proposal.id}`)} />
    </div>
  );
}
