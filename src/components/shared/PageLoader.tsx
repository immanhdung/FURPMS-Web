import { motion } from "motion/react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export function PageLoader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-3">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col items-center gap-3"
      >
        <LoadingSpinner size={28} />
        <p className="text-sm text-muted-foreground">{label}</p>
      </motion.div>
    </div>
  );
}
