import { Outlet } from "react-router-dom";
import { motion } from "motion/react";

export function AuthLayout() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">
      {/* Orb để TĨNH — animate liên tục trên layer đã blur(64px) khiến GPU vẽ lại mỗi khung hình. */}
      <div className="aurora-orb -top-40 left-0 h-96 w-96 bg-primary/30" />
      <div className="aurora-orb right-0 bottom-0 h-96 w-96 bg-brand-secondary/30" />
      <div className="aurora-orb top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 bg-brand-accent-2/20" />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <Outlet />
      </motion.div>
    </div>
  );
}
