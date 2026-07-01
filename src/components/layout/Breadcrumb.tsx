import { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { NAV_ITEMS } from "@/constants/nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

function labelForSegment(fullPath: string, segment: string): string {
  const match = NAV_ITEMS.find((item) => item.path === fullPath);
  if (match) return match.label;
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function Breadcrumb() {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  if (pathname === ROUTES.DASHBOARD) {
    return (
      <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
        <Home className="size-3.5 text-muted-foreground" />
        Dashboard
      </div>
    );
  }

  const crumbs = segments.map((segment, index) => {
    const fullPath = `/${segments.slice(0, index + 1).join("/")}`;
    return { path: fullPath, label: labelForSegment(fullPath, segment) };
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
      <Link to={ROUTES.DASHBOARD} className="text-muted-foreground transition-colors hover:text-foreground">
        <Home className="size-3.5" />
      </Link>
      {crumbs.map((crumb, index) => (
        <Fragment key={crumb.path}>
          <ChevronRight className="size-3.5 text-muted-foreground/50" />
          {index === crumbs.length - 1 ? (
            <span className={cn("font-medium text-foreground")}>{crumb.label}</span>
          ) : (
            <Link to={crumb.path} className="text-muted-foreground transition-colors hover:text-foreground">
              {crumb.label}
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
