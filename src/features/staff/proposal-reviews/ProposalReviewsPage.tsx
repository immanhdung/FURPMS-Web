import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { FileCheck2 } from "lucide-react";
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
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary/15 to-brand-secondary/10 text-primary">
            <FileCheck2 className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("staff.reviewsTitle")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("staff.reviewsSubtitle")}
            </p>
          </div>
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
      </motion.div>

      <ProposalsTable params={status === ALL_VALUE ? undefined : { status }} onOpen={handleOpen} />
    </div>
  );
}
