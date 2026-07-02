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
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <GraduationCap className="size-4.5" />
      </div>
      {!collapsed && (
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold text-sidebar-foreground">FURPMS</p>
          <p className="truncate text-[11px] text-muted-foreground">Research Management</p>
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
          "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
          collapsed && "justify-center px-0"
        )
      }
    >
      <item.icon className="size-4 shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
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
      animate={{ width: collapsed ? 68 : 248 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex"
    >
      <Brand collapsed={collapsed} />
      <SidebarNav collapsed={collapsed} />
      <div className="border-t border-sidebar-border p-2">
        <Button variant="ghost" size="sm" className="w-full justify-center gap-2" onClick={toggleSidebar}>
          <ChevronsLeft className={cn("size-4 transition-transform", collapsed && "rotate-180")} />
          {!collapsed && "Collapse"}
        </Button>
      </div>
    </motion.aside>
  );
}
