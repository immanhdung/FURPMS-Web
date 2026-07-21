import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ClipboardCheck, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MembershipListPage } from "@/features/reviewer/shared/MembershipListPage";
import { isAcceptedInvitation } from "@/constants/statuses";
import { ROUTES } from "@/constants/routes";

export function AssignedReviewsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <MembershipListPage
      title={t("reviewer.assignedTitle")}
      description={t("reviewer.assignedSubtitle")}
      emptyIcon={ClipboardCheck}
      emptyTitle={t("reviewer.noAssigned")}
      emptyDescription={t("reviewer.noAssignedDesc")}
      filter={(m) => isAcceptedInvitation(m.status)}
      renderActions={(membership) => (
        <Button size="sm" variant="outline" onClick={() => navigate(`${ROUTES.ASSIGNED_REVIEWS}/${membership.councilId}`)}>
          <Eye />
          {t("reviewer.reviewBtn")}
        </Button>
      )}
    />
  );
}
