import { ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { ROUTES } from "@/constants/routes";

export function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <EmptyState
        icon={ShieldAlert}
        title="You don't have access to this page"
        description="Your role does not have permission to view this resource. If you believe this is a mistake, contact your administrator."
        action={
          <Button onClick={() => navigate(ROUTES.DASHBOARD)} size="sm">
            Back to dashboard
          </Button>
        }
      />
    </div>
  );
}
