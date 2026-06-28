import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
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
} from "lucide-react";
import { Button } from "../ui/button";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Proposals", path: "/proposals", icon: FileText },
  { name: "Councils", path: "/meetings", icon: Users },
  { name: "Contracts", path: "/contracts", icon: FileSignature },
  { name: "Analytics", path: "/analytics", icon: BarChart3 },
];

function SidebarContent({ onClose }) {
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

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
      <nav className="flex flex-col gap-1 flex-1" aria-label="Điều hướng chính">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              aria-current={isActive ? "page" : undefined}
            >
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon size={20} aria-hidden="true" />
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-sidebar-border pt-4 mt-auto flex flex-col gap-2">
        <Button
          className="w-full justify-start gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
          size="default"
          asChild
        >
          <Link to="/proposals" onClick={onClose}>
            <PlusCircle size={18} aria-hidden="true" />
            New Proposal
          </Link>
        </Button>
        <div className="flex flex-col gap-1 mt-2">
          <Link to="/support" onClick={onClose}>
            <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
              <HelpCircle size={20} aria-hidden="true" />
              <span>Support</span>
            </div>
          </Link>
          <Link to="/settings" onClick={onClose}>
            <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
              <Settings size={20} aria-hidden="true" />
              <span>Settings</span>
            </div>
          </Link>
          <button
            onClick={() => { logout(); onClose?.(); }}
            className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
          >
            <div className="flex items-center gap-3 px-3 py-2 rounded-md text-destructive hover:bg-destructive/10 transition-colors">
              <LogOut size={20} aria-hidden="true" />
              <span>Sign Out</span>
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
