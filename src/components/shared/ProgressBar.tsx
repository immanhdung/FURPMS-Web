import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Thanh tiến độ theo phần trăm. Rút ra từ khuôn đang lặp lại ở `RubricScoringForm.tsx:189-194`
 * để các màn khác (kinh phí, tiến độ) dùng chung một hình hài, thay vì mỗi chỗ tự dựng một kiểu.
 *
 * Giá trị luôn bị kẹp về 0–100: dữ liệu thật đã có ca vượt 100 (chi nhiều hơn kế hoạch) và ca âm,
 * để nguyên thì thanh tràn ra khỏi khung.
 */
export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const clamped = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className="h-full rounded-full bg-linear-to-r from-primary to-brand-secondary transition-all duration-300"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export function IndeterminateProgressBar({ label }: { label?: string }) {
  return (
    <div className="space-y-1.5">
      {label && <p className="text-xs text-muted-foreground">{label}</p>}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full w-1/3 rounded-full bg-primary"
          animate={{ x: ["-100%", "300%"] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}
