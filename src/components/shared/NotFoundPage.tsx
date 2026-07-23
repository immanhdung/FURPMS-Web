import { Compass } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { ROUTES } from "@/constants/routes";

export function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <EmptyState
        icon={Compass}
        title={t("pages.notFound")}
        description={t("pages.notFoundDesc")}
        action={
          <Button onClick={() => navigate(ROUTES.DASHBOARD)} size="sm">
            {t("pages.backToDashboard")}
          </Button>
        }
      />
    </div>
  );
}
