import { NavLink } from "react-router-dom";
import { motion } from "motion/react";
import { ChevronsLeft, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from "@/store/auth.store";
import { useUiStore } from "@/store/ui.store";
import { getNavItemsForRoles } from "@/constants/nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types/nav";

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex h-14 shrink-0 items-center gap-2 border-b border-sidebar-border px-4">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-primary to-brand-secondary text-primary-foreground shadow-soft-sm">
        <GraduationCap className="size-4.5" />
      </div>
      {!collapsed && (
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold text-sidebar-foreground">FURPMS</p>
          <p className="truncate text-[11px] text-sidebar-foreground/50">Research Management</p>
        </div>
      )}
    </div>
  );
}

function NavLinkItem({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const link = (
    <NavLink
      to={item.path}
      end={item.path === ROUTES.DASHBOARD}
      className={({ isActive }) =>
        cn(
          "group relative flex items-center gap-2.5 rounded-full px-3 py-2 text-sm font-medium text-sidebar-foreground/60 transition-colors hover:text-sidebar-accent-foreground",
          isActive && "text-white",
          collapsed && "justify-center px-0"
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive ? (
            <motion.span
              layoutId="sidebar-active-pill"
              className="absolute inset-0 rounded-full bg-linear-to-r from-primary to-brand-secondary shadow-soft-md"
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
            />
          ) : (
            <span className="absolute inset-0 rounded-full bg-transparent transition-colors group-hover:bg-sidebar-accent/70" />
          )}
          <item.icon className="relative z-10 size-4 shrink-0" />
          {!collapsed && <span className="relative z-10 truncate">{item.label}</span>}
          {isActive && !collapsed && (
            <span className="absolute right-3 z-10 size-1.5 rounded-full bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.55)]" />
          )}
        </>
      )}
    </NavLink>
  );

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}

export function SidebarNav({ collapsed = false }: { collapsed?: boolean }) {
  const user = useAuthStore((state) => state.user);
  const items = user ? getNavItemsForRoles(user.roles) : [];

  return (
    <ScrollArea className="flex-1 px-2 py-3">
      <nav className="flex flex-col gap-0.5">
        {items.map((item) => (
          <NavLinkItem key={item.path} item={item} collapsed={collapsed} />
        ))}
      </nav>
    </ScrollArea>
  );
}

export function Sidebar() {
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 256 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="liquid-glass sticky top-3 z-10 m-3 hidden h-[calc(100vh-1.5rem)] shrink-0 flex-col overflow-hidden rounded-2xl border border-sidebar-border md:flex"
    >
      <Brand collapsed={collapsed} />
      <SidebarNav collapsed={collapsed} />
      <div className="border-t border-sidebar-border p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center gap-2 rounded-full text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"
          onClick={toggleSidebar}
        >
          <ChevronsLeft className={cn("size-4 transition-transform", collapsed && "rotate-180")} />
          {!collapsed && "Collapse"}
        </Button>
      </div>
    </motion.aside>
  );
}
