import { Construction } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/shared/EmptyState";
import { NAV_ITEMS } from "@/constants/nav";

export function ComingSoonPage() {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const navItem = NAV_ITEMS.find((item) => item.path === pathname);
  const moduleName = navItem ? t(navItem.labelKey) : t("pages.thisModule");

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <EmptyState
        icon={Construction}
        title={t("pages.comingSoon", { module: moduleName })}
        description={t("pages.comingSoonDesc")}
      />
    </div>
  );
}
