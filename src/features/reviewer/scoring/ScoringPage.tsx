import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MembershipListPage } from "@/features/reviewer/shared/MembershipListPage";
import { isAcceptedInvitation } from "@/constants/statuses";
import { ROUTES } from "@/constants/routes";

export function ScoringPage() {
  const navigate = useNavigate();

  return (
    <MembershipListPage
      title="Scoring"
      description="Reviews that are open now and awaiting your score."
      emptyIcon={Star}
      emptyTitle="Nothing to score right now"
      emptyDescription="Reviews open for scoring will appear here."
      filter={(m) => isAcceptedInvitation(m.status) && m.roundStatus?.toUpperCase() === "OPEN"}
      renderActions={(membership) => (
        <Button size="sm" onClick={() => navigate(`${ROUTES.ASSIGNED_REVIEWS}/${membership.councilId}`)}>
          <Star />
          Score now
        </Button>
      )}
    />
  );
}
