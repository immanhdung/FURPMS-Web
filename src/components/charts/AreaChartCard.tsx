import { memo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_AXIS_STYLE, CHART_PALETTE, CHART_TOOLTIP_STYLE } from "@/components/charts/chart-theme";

export interface ChartSeries<T = Record<string, unknown>> {
  key: keyof T & string;
  label: string;
  color?: string;
}

interface AreaChartCardProps<T> {
  data: T[];
  xKey: keyof T & string;
  series: ChartSeries<T>[];
}

function AreaChartCardBodyImpl<T extends object>({ data, xKey, series }: AreaChartCardProps<T>) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <defs>
          {series.map((s, index) => {
            const color = s.color ?? CHART_PALETTE[index % CHART_PALETTE.length];
            return (
              <linearGradient key={s.key} id={`area-gradient-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            );
          })}
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        {/* recharts' generic dataKey typing can't resolve against an open type parameter T; narrowing to string is safe here since our own props already constrain xKey to keyof T. */}
        <XAxis dataKey={xKey as string} tick={CHART_AXIS_STYLE} axisLine={false} tickLine={false} />
        <YAxis tick={CHART_AXIS_STYLE} axisLine={false} tickLine={false} width={32} />
        <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={{ stroke: "var(--border)" }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {series.map((s, index) => {
          const color = s.color ?? CHART_PALETTE[index % CHART_PALETTE.length];
          return (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key as string}
              name={s.label}
              stroke={color}
              fill={`url(#area-gradient-${s.key})`}
              strokeWidth={2}
              animationDuration={600}
            />
          );
        })}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export const AreaChartCardBody = memo(AreaChartCardBodyImpl) as typeof AreaChartCardBodyImpl;
