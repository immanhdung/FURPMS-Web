import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { cn } from "../../lib/utils";
import {
  LayoutDashboard,
  FileText,
  Users,
  FileSignature,
  BarChart3,
  Settings,
  HelpCircle,
  PlusCircle,
  LogOut,
  FlaskConical,
  X,
  UserCog,
  CalendarDays,
  Search,
} from "lucide-react";
import { Button } from "../ui/button";

const navGroups = [
  {
    title: "Nghiệp vụ",
    items: [
      { name: "Tổng quan", path: "/dashboard", icon: LayoutDashboard },
      { name: "Đề xuất", path: "/proposals", icon: FileText },
      { name: "Hợp đồng", path: "/contracts", icon: FileSignature },
    ],
  },
  {
    title: "Hội đồng & Đánh giá",
    roles: ["ReviewCommittee", "Staff", "Admin"],
    items: [
      { name: "Kỳ họp", path: "/meetings", icon: Users },
      { name: "Tìm kiếm AI", path: "/search", icon: Search, roles: ["Staff", "Admin", "ReviewCommittee", "Faculty"] },
    ],
  },
  {
    title: "Hệ thống",
    roles: ["Staff", "Admin"],
    items: [
      { name: "Người dùng", path: "/users", icon: UserCog, roles: ["Admin"] },
      { name: "Chu kỳ", path: "/settings/cycles", icon: CalendarDays },
      { name: "Danh mục", path: "/settings/lookups", icon: Settings, roles: ["Admin"] },
      { name: "Thống kê", path: "/analytics", icon: BarChart3 },
    ],
  },
];

function SidebarContent({ onClose }) {
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const hasRole = useAuthStore((state) => state.hasRole);

  return (
    <>
      {/* Logo Area */}
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground shadow-md" aria-hidden="true">
            <FlaskConical size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-sidebar-primary leading-tight tracking-tight">FURPMS</h2>
            <span className="text-xs text-sidebar-foreground/70 font-medium">Research Excellence</span>
          </div>
        </div>
        {/* Close button — only visible on mobile (when onClose is provided inside Sheet) */}
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-sidebar-foreground"
            onClick={onClose}
            aria-label="Đóng menu"
          >
            <X size={20} />
          </Button>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex flex-col gap-6 flex-1 overflow-y-auto pr-2 custom-scrollbar" aria-label="Điều hướng chính">
        {navGroups.map((group) => {
          // Check group level role
          if (group.roles && !hasRole(group.roles)) return null;

          return (
            <div key={group.title} className="flex flex-col gap-1">
              <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 mb-1">
                {group.title}
              </h3>
              {group.items.map((item) => {
                // Check item level role
                if (item.roles && !hasRole(item.roles)) return null;
                
                // Active state logic
                const isActive = item.path === "/dashboard" 
                  ? location.pathname === "/dashboard" 
                  : location.pathname.startsWith(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors group",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-sm"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <item.icon size={20} aria-hidden="true" className={cn(!isActive && "text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground")} />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-sidebar-border pt-4 mt-4 flex flex-col gap-2">
        <Button
          className="w-full justify-start gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
          size="default"
          asChild
        >
          <Link to="/proposals/new" onClick={onClose}>
            <PlusCircle size={18} aria-hidden="true" />
            Đề xuất mới
          </Link>
        </Button>
        <div className="flex flex-col gap-1 mt-2">
          <Link to="/notifications" onClick={onClose}>
            <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors group">
              <HelpCircle size={20} aria-hidden="true" className="text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground" />
              <span>Hỗ trợ</span>
            </div>
          </Link>
          <Link to="/profile" onClick={onClose}>
            <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors group">
              <Settings size={20} aria-hidden="true" className="text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground" />
              <span>Hồ sơ cá nhân</span>
            </div>
          </Link>
          <button
            onClick={() => { logout(); onClose?.(); }}
            className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
          >
            <div className="flex items-center gap-3 px-3 py-2 rounded-md text-destructive hover:bg-destructive/10 transition-colors group">
              <LogOut size={20} aria-hidden="true" className="text-destructive/80 group-hover:text-destructive" />
              <span>Đăng xuất</span>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}

export default function Sidebar({ mobileOpen = false, onClose }) {
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    if (mobileOpen && onClose) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <>
      {/* Desktop sidebar — always visible on md+ */}
      <aside
        className="hidden md:flex w-64 bg-sidebar border-r border-sidebar-border h-full flex-col p-4 shadow-sm z-10 transition-all duration-300"
        aria-label="Sidebar"
      >
        <SidebarContent />
      </aside>

      {/* Mobile overlay sidebar */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Drawer */}
          <aside
            className="fixed inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-sidebar-border flex flex-col p-4 shadow-xl md:hidden animate-in slide-in-from-left duration-200 motion-reduce:animate-none"
            aria-label="Sidebar"
            role="dialog"
            aria-modal="true"
          >
            <SidebarContent onClose={onClose} />
          </aside>
        </>
      )}
    </>
  );
}
