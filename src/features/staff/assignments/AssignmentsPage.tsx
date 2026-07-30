import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { Mail } from "lucide-react";
import { ProposalsTable } from "@/features/staff/proposal-reviews/ProposalsTable";
import { ROUTES } from "@/constants/routes";
import type { ProposalSummary } from "@/types/proposal-summary";

export function AssignmentsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="flex items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary/15 to-brand-secondary/10 text-primary">
          <Mail className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("staff.assignmentsTitle")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("staff.assignmentsSubtitle")}
          </p>
        </div>
      </motion.div>

      <div className="flex items-start gap-2.5 rounded-lg border border-primary/15 bg-primary/5 p-3 text-xs text-muted-foreground">
        <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
        {t("staff.assignmentsHint")}
      </div>

      <ProposalsTable onOpen={(proposal: ProposalSummary) => navigate(`${ROUTES.PROPOSAL_REVIEWS}/${proposal.id}`)} />
    </div>
  );
}
