import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_AXIS_STYLE, CHART_COLORS, CHART_PALETTE, CHART_TOOLTIP_STYLE } from "@/components/charts/chart-theme";

interface BarChartCardProps<T> {
  data: T[];
  categoryKey: keyof T & string;
  valueKey: keyof T & string;
  layout?: "horizontal" | "vertical";
  colorful?: boolean;
}

export function BarChartCardBody<T extends object>({
  data,
  categoryKey,
  valueKey,
  layout = "horizontal",
  colorful = false,
}: BarChartCardProps<T>) {
  const isVertical = layout === "vertical";

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout={layout}
        margin={{ top: 4, right: 16, left: isVertical ? 8 : -16, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={!isVertical} vertical={isVertical} />
        {isVertical ? (
          <>
            <XAxis type="number" tick={CHART_AXIS_STYLE} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey={categoryKey as string}
              tick={CHART_AXIS_STYLE}
              axisLine={false}
              tickLine={false}
              width={110}
            />
          </>
        ) : (
          <>
            <XAxis dataKey={categoryKey as string} tick={CHART_AXIS_STYLE} axisLine={false} tickLine={false} />
            <YAxis tick={CHART_AXIS_STYLE} axisLine={false} tickLine={false} width={32} />
          </>
        )}
        <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={{ fill: "var(--muted)" }} />
        <Bar dataKey={valueKey as string} radius={[6, 6, 6, 6]} maxBarSize={36} animationDuration={600}>
          {data.map((_, index) => (
            <Cell key={index} fill={colorful ? CHART_PALETTE[index % CHART_PALETTE.length] : CHART_COLORS.primary} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
