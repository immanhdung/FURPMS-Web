import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Gavel } from "lucide-react";
import { ProposalsTable } from "@/features/staff/proposal-reviews/ProposalsTable";
import { ROUTES } from "@/constants/routes";
import type { ProposalSummary } from "@/types/proposal-summary";

export function CouncilsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("staff.councilsTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("staff.councilsSubtitle")}
        </p>
      </div>

      <div className="flex items-start gap-2.5 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
        <Gavel className="mt-0.5 size-4 shrink-0" />
        {t("staff.councilsHint")}
      </div>

      <ProposalsTable onOpen={(proposal: ProposalSummary) => navigate(`${ROUTES.PROPOSAL_REVIEWS}/${proposal.id}`)} />
    </div>
  );
}
