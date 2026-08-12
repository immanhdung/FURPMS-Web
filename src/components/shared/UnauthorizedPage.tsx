import { ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/store/auth.store";

export function UnauthorizedPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const activeRole = useAuthStore((state) => state.activeRole);
  const setActiveRole = useAuthStore((state) => state.setActiveRole);

  /*
   * Người đa vai bị chặn ở đây thường KHÔNG phải vì thiếu quyền, mà vì đang xem với vai khác —
   * và cách thoát (dropdown trong menu avatar) thì không hiện ra ở màn này. Nói thẳng vai đang
   * xem là gì, kèm nút đổi ngay sang vai chính.
   */
  const otherRoles = (user?.roles ?? []).filter((r) => r !== activeRole);
  const canSwitch = otherRoles.length > 0;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <EmptyState
        icon={ShieldAlert}
        title={t("pages.unauthorized")}
        description={
          canSwitch && activeRole
            ? t("pages.unauthorizedRoleHint", {
                role: t(`roleName.${activeRole}`, { defaultValue: activeRole }),
              })
            : t("pages.unauthorizedDesc")
        }
        action={
          <div className="flex flex-wrap items-center justify-center gap-2">
            {canSwitch &&
              otherRoles.map((role) => (
                <Button
                  key={role}
                  size="sm"
                  onClick={() => {
                    setActiveRole(role);
                    navigate(ROUTES.DASHBOARD);
                  }}
                >
                  {t("pages.switchToRole", {
                    role: t(`roleName.${role}`, { defaultValue: role }),
                  })}
                </Button>
              ))}
            <Button onClick={() => navigate(ROUTES.DASHBOARD)} size="sm" variant={canSwitch ? "outline" : "default"}>
              {t("pages.backToDashboard")}
            </Button>
          </div>
        }
      />
    </div>
  );
}
