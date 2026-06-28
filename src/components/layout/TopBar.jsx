import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Bell, Search, ChevronRight, Menu } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useAuthStore } from "../../store/authStore";

export default function TopBar({ onMenuToggle }) {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  // Simple breadcrumb logic based on pathname
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <header className="h-16 border-b border-border bg-surface px-4 sm:px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      {/* Left: hamburger + breadcrumbs */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-muted-foreground"
          onClick={onMenuToggle}
          aria-label="Mở menu điều hướng"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center text-sm text-muted-foreground capitalize">
          <span className="font-medium text-foreground">Home</span>
          {pathnames.map((value, index) => {
            const isLast = index === pathnames.length - 1;
            return (
              <React.Fragment key={value}>
                <ChevronRight size={16} className="mx-1" aria-hidden="true" />
                <span className={isLast ? "font-semibold text-primary" : ""}>
                  {value}
                </span>
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 sm:gap-6">
        <div className="relative hidden md:block w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            name="search"
            autoComplete="off"
            placeholder="Tìm kiếm đề tài…"
            aria-label="Tìm kiếm đề tài"
            className="pl-9 bg-background border-border h-9 text-sm rounded-full focus-visible:ring-primary"
          />
        </div>
        
        <button
          className="relative text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md p-1"
          aria-label="Thông báo — 3 chưa đọc"
        >
          <Bell size={20} aria-hidden="true" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-on-error ring-2 ring-surface" aria-hidden="true">
            3
          </span>
        </button>

        {/* User Profile */}
        <button
          className="flex items-center gap-3 pl-3 sm:pl-4 border-l border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
          aria-label="Tài khoản người dùng"
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-foreground leading-tight">
              {user?.fullName || "Dr. Nguyen"}
            </p>
            <p className="text-xs text-muted-foreground">
              {user?.roles?.[0] || "Principal Investigator"}
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold border border-primary/30 shadow-sm" aria-hidden="true">
            {(user?.fullName || "N")[0].toUpperCase()}
          </div>
        </button>
      </div>
    </header>
  );
}
