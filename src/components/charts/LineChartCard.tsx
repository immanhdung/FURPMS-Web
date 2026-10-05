import { ChartEmpty } from "@/components/charts/ChartEmpty";
import { memo } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_AXIS_STYLE, CHART_PALETTE, CHART_TOOLTIP_STYLE } from "@/components/charts/chart-theme";
import type { ChartSeries } from "@/components/charts/AreaChartCard";

interface LineChartCardProps<T> {
  data: T[];
  xKey: keyof T & string;
  series: ChartSeries<T>[];
}

function LineChartCardBodyImpl<T extends object>({ data, xKey, series }: LineChartCardProps<T>) {
  // Không có gì để vẽ thì nói ra, đừng để lại một khung trắng trơn (xem ChartEmpty).
  if (!data || data.length === 0) return <ChartEmpty />;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis dataKey={xKey as string} tick={CHART_AXIS_STYLE} axisLine={false} tickLine={false} />
        <YAxis tick={CHART_AXIS_STYLE} axisLine={false} tickLine={false} width={32} />
        <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={{ stroke: "var(--border)" }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {series.map((s, index) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key as string}
            name={s.label}
            stroke={s.color ?? CHART_PALETTE[index % CHART_PALETTE.length]}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            animationDuration={600}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export const LineChartCardBody = memo(LineChartCardBodyImpl) as typeof LineChartCardBodyImpl;
