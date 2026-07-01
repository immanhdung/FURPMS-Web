import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { formatCurrency } from "@/utils/format";
import type { KpiDatum } from "@/types/dashboard";

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
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      whileHover={{ y: -2 }}
    >
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex items-start justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">{datum.label}</p>
            <p className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground">
              <AnimatedCounter value={datum.value} formatter={(value) => formatValue(datum, value)} />
            </p>
            {datum.deltaLabel && <p className="mt-1 truncate text-xs text-muted-foreground">{datum.deltaLabel}</p>}
          </div>
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4.5" />
          </div>
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
