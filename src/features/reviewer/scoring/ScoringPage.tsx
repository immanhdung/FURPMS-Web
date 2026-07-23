import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MembershipListPage } from "@/features/reviewer/shared/MembershipListPage";
import { isAcceptedInvitation } from "@/constants/statuses";
import { ROUTES } from "@/constants/routes";

export function ScoringPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <MembershipListPage
      title={t("reviewer.scoringTitle")}
      description={t("reviewer.scoringSubtitle")}
      emptyIcon={Star}
      emptyTitle={t("reviewer.nothingToScore")}
      emptyDescription={t("reviewer.nothingToScoreDesc")}
      filter={(m) => isAcceptedInvitation(m.status) && m.roundStatus?.toUpperCase() === "OPEN"}
      renderActions={(membership) => (
        <Button size="sm" onClick={() => navigate(`${ROUTES.ASSIGNED_REVIEWS}/${membership.councilId}`)}>
          <Star />
          {t("reviewer.scoreNow")}
        </Button>
      )}
    />
  );
}
