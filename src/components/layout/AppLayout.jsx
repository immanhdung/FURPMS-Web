import React, { useState, useCallback } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { SkipLink } from "../ui/skip-link";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function AppLayout() {
  const token = useAuthStore((state) => state.token);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMenuToggle = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const handleMenuClose = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans">
      <SkipLink />

      {/* Sidebar — desktop always visible, mobile as overlay */}
      <Sidebar mobileOpen={mobileMenuOpen} onClose={handleMenuClose} />
      
      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <TopBar onMenuToggle={handleMenuToggle} />
        
        <main
          id="main-content"
          className="flex-1 overflow-y-auto bg-surface/50 p-4 sm:p-6"
          tabIndex={-1}
        >
          <div className="mx-auto max-w-7xl" aria-live="polite" aria-atomic="false">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
