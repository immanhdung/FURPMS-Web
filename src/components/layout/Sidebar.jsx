import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Settings,
  HelpCircle,
  PlusCircle,
  LogOut,
  FlaskConical
} from "lucide-react";
import { Button } from "../ui/button";

export default function Sidebar() {
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Proposals", path: "/proposals", icon: FileText },
    { name: "Meetings", path: "/meetings", icon: Users },
    { name: "Analytics", path: "/analytics", icon: BarChart3 },
  ];

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border h-full flex flex-col p-4 shadow-sm z-10 transition-all duration-300">
      {/* Logo Area */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground shadow-md">
          <FlaskConical size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-sidebar-primary leading-tight tracking-tight">FURPMS</h2>
          <span className="text-xs text-sidebar-foreground/70 font-medium">Research Excellence</span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link key={item.path} to={item.path}>
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="border-t border-sidebar-border pt-4 mt-auto flex flex-col gap-2">
        <Button className="w-full justify-start gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm" size="default">
          <PlusCircle size={18} />
          New Proposal
        </Button>
        <div className="flex flex-col gap-1 mt-2">
          <Link to="/support">
            <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
              <HelpCircle size={20} />
              <span>Support</span>
            </div>
          </Link>
          <Link to="/settings">
            <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
              <Settings size={20} />
              <span>Settings</span>
            </div>
          </Link>
          <button onClick={logout} className="w-full text-left">
            <div className="flex items-center gap-3 px-3 py-2 rounded-md text-destructive hover:bg-destructive/10 transition-colors">
              <LogOut size={20} />
              <span>Sign Out</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
