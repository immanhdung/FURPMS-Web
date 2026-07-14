import { useNavigate } from "react-router-dom";
import { ClipboardCheck, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MembershipListPage } from "@/features/reviewer/shared/MembershipListPage";
import { isAcceptedInvitation } from "@/constants/statuses";
import { ROUTES } from "@/constants/routes";

export function AssignedReviewsPage() {
  const navigate = useNavigate();

  return (
    <MembershipListPage
      title="Assigned Reviews"
      description="Proposals you're reviewing as a council member."
      emptyIcon={ClipboardCheck}
      emptyTitle="No assigned reviews"
      emptyDescription="Accepted council invitations will appear here."
      filter={(m) => isAcceptedInvitation(m.status)}
      renderActions={(membership) => (
        <Button size="sm" variant="outline" onClick={() => navigate(`${ROUTES.ASSIGNED_REVIEWS}/${membership.councilId}`)}>
          <Eye />
          Review
        </Button>
      )}
    />
  );
}
