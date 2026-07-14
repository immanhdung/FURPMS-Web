import { Construction } from "lucide-react";
import { useLocation } from "react-router-dom";
import { EmptyState } from "@/components/shared/EmptyState";
import { NAV_ITEMS } from "@/constants/nav";

export function ComingSoonPage() {
  const { pathname } = useLocation();
  const navItem = NAV_ITEMS.find((item) => item.path === pathname);

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <EmptyState
        icon={Construction}
        title={`${navItem?.label ?? "This module"} is coming soon`}
        description="This module is on our roadmap and will be available once its business workflow is implemented."
      />
    </div>
  );
}
