import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { formatCurrency } from "@/utils/format";
import { cn } from "@/lib/utils";
import type { KpiDatum } from "@/types/dashboard";

const KPI_ACCENTS = [
  "from-primary/20 to-primary/5 text-primary",
  "from-brand-secondary/20 to-brand-secondary/5 text-brand-secondary",
  "from-brand-accent-2/20 to-brand-accent-2/5 text-brand-accent-2",
  "from-brand-accent/20 to-brand-accent/5 text-brand-accent",
  "from-warning/20 to-warning/5 text-warning",
];

const KPI_RING_COLORS = ["var(--primary)", "var(--brand-secondary)", "var(--brand-accent-2)", "var(--brand-accent)", "var(--warning)"];

function KpiRing({ percent, color }: { percent: number; color: string }) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div
      className="relative flex size-11 shrink-0 items-center justify-center rounded-full"
      style={{ background: `conic-gradient(${color} ${clamped * 3.6}deg, var(--muted) 0deg)` }}
    >
      <div className="absolute inset-0.75 rounded-full bg-card" />
      <span className="relative text-[10px] font-semibold text-foreground">{Math.round(clamped)}</span>
    </div>
  );
}

function formatValue(datum: KpiDatum, value: number): string {
  switch (datum.format) {
    case "percent":
      return `${Math.round(value)}%`;
    case "currency":
      return formatCurrency(value);
    default:
      return Math.round(value).toLocaleString();
  }
}

interface KpiCardProps {
  datum: KpiDatum;
  icon: LucideIcon;
  index?: number;
}

export function KpiCard({ datum, icon: Icon, index = 0 }: KpiCardProps) {
  const accent = KPI_ACCENTS[index % KPI_ACCENTS.length];
  const ringColor = KPI_RING_COLORS[index % KPI_RING_COLORS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      whileHover={{ y: -2 }}
    >
      <Card
        variant="glass"
        className="relative overflow-hidden transition-all duration-300 hover:shadow-soft-lg"
        style={{ borderLeft: `4px solid ${ringColor}` }}
      >
        <CardContent className="relative flex items-start justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">{datum.label}</p>
            <p className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground">
              <AnimatedCounter value={datum.value} formatter={(value) => formatValue(datum, value)} />
            </p>
            {datum.deltaLabel && <p className="mt-1 truncate text-xs text-muted-foreground">{datum.deltaLabel}</p>}
          </div>
          {datum.format === "percent" ? (
            <KpiRing percent={datum.value} color={ringColor} />
          ) : (
            <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br", accent)}>
              <Icon className="size-4.5" />
            </div>
          )}
          {/* Ambient glow orb at the bottom-right matching the KPI card theme color */}
          <div
            className="pointer-events-none absolute -right-8 -bottom-8 size-20 rounded-full opacity-[0.07] blur-xl transition-all duration-300 group-hover/card:scale-125 group-hover/card:opacity-15"
            style={{ backgroundColor: ringColor }}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function KpiCardSkeleton() {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div className="w-full min-w-0 space-y-2.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="size-9 shrink-0 rounded-lg" />
      </CardContent>
    </Card>
  );
}
