import { Outlet } from "react-router-dom";
import { motion } from "motion/react";
import campusHero from "@/assets/campus-hero.jpg";

export function AuthLayout() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">
      {/* Fullscreen background image with a dark gradient overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={campusHero}
          alt="FPT Campus"
          className="h-full w-full object-cover opacity-30 dark:opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/45" />
      </div>

      {/* Orbs for ambient colorful glow */}
      <div className="aurora-orb -top-40 left-0 h-96 w-96 bg-primary/20 pointer-events-none" />
      <div className="aurora-orb right-0 bottom-0 h-96 w-96 bg-brand-secondary/20 pointer-events-none" />
      <div className="aurora-orb top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 bg-brand-accent-2/10 pointer-events-none" />

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
