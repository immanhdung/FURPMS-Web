import { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronRight, Home } from "lucide-react";
import { NAV_ITEMS } from "@/constants/nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export function Breadcrumb() {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const segments = pathname.split("/").filter(Boolean);

  /**
   * Mảnh đường dẫn là một ID (GUID hoặc số) thì KHÔNG đưa lên breadcrumb.
   * Trước đây màn chấm điểm hiện "E01a2af6 D7e5 4467 8192 2af4536e52fb" — vô nghĩa với người
   * đọc, lại đẩy nhãn thật ra khỏi khung. Tên đề tài đã có ở tiêu đề trang ngay bên dưới.
   */
  const isIdSegment = (segment: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment) ||
    /^\d+$/.test(segment);

  const labelForSegment = (fullPath: string, segment: string): string | null => {
    const match = NAV_ITEMS.find((item) => item.path === fullPath);
    if (match) return t(match.labelKey);
    if (isIdSegment(segment)) return null;
    return segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (pathname === ROUTES.DASHBOARD) {
    return (
      <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
        <Home className="size-3.5 text-muted-foreground" />
        {t("nav.dashboard")}
      </div>
    );
  }

  const crumbs = segments
    .map((segment, index) => {
      const fullPath = `/${segments.slice(0, index + 1).join("/")}`;
      return { path: fullPath, label: labelForSegment(fullPath, segment) };
    })
    .filter((c): c is { path: string; label: string } => c.label !== null);

  // min-w-0 + shrink-0 cho icon + truncate cho nhãn: nếu không, nhãn dài đẩy cả header
  // tràn ngang ở màn hẹp (sidebar vẫn chiếm chỗ từ md) → chữ lòi khỏi khung.
  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
      <Link to={ROUTES.DASHBOARD} className="text-muted-foreground transition-colors hover:text-foreground">
        <Home className="size-3.5" />
      </Link>
      {crumbs.map((crumb, index) => (
        <Fragment key={crumb.path}>
          <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/50" />
          {index === crumbs.length - 1 ? (
            <span className={cn("truncate font-medium text-foreground")}>{crumb.label}</span>
          ) : (
            <Link to={crumb.path} className="hidden truncate text-muted-foreground transition-colors hover:text-foreground sm:block">
              {crumb.label}
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
