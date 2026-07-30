import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { CommandPalette } from "@/components/command/CommandPalette";
import { DevClockWidget } from "@/components/shared/DevClockWidget";

export function AppLayout() {
  const location = useLocation();

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <motion.div
          className="aurora-orb -top-32 -left-24 h-104 w-104 bg-primary/25"
          animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="aurora-orb top-1/4 -right-40 h-120 w-120 bg-brand-secondary/20"
          animate={{ x: [0, -24, 0], y: [0, 24, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="aurora-orb -bottom-32 left-1/4 h-104 w-104 bg-brand-accent-2/18"
          animate={{ x: [0, 24, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="aurora-orb right-1/4 bottom-0 h-80 w-80 bg-brand-accent/16"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <Sidebar />

      <div className="relative z-10 flex min-h-screen flex-1 flex-col">
        <Header />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <CommandPalette />
      {/* Công cụ tua thời gian để test các mốc hạn dài ngày. Tự ẩn với người không phải Admin,
          và BE chặn cứng trên production. */}
      <DevClockWidget />
    </div>
  );
}
