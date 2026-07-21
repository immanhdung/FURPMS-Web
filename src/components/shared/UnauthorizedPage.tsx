import { ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { ROUTES } from "@/constants/routes";

export function UnauthorizedPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <EmptyState
        icon={ShieldAlert}
        title={t("pages.unauthorized")}
        description={t("pages.unauthorizedDesc")}
        action={
          <Button onClick={() => navigate(ROUTES.DASHBOARD)} size="sm">
            {t("pages.backToDashboard")}
          </Button>
        }
      />
    </div>
  );
}
