import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProposalsTable } from "@/features/staff/proposal-reviews/ProposalsTable";
import { PROPOSAL_STATUS } from "@/constants/statuses";
import { ROUTES } from "@/constants/routes";
import type { ProposalSummary } from "@/types/proposal-summary";

const ALL_VALUE = "all";

export function ProposalReviewsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [status, setStatus] = useState<string>(ALL_VALUE);

  const handleOpen = (proposal: ProposalSummary) => {
    navigate(`${ROUTES.PROPOSAL_REVIEWS}/${proposal.id}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("staff.reviewsTitle")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("staff.reviewsSubtitle")}
          </p>
        </div>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>{t("staff.allStatuses")}</SelectItem>
            {Object.values(PROPOSAL_STATUS).map((value) => (
              <SelectItem key={value} value={value}>
                {value.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ProposalsTable params={status === ALL_VALUE ? undefined : { status }} onOpen={handleOpen} />
    </div>
  );
}
