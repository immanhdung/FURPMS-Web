import { memo } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CHART_PALETTE, CHART_TOOLTIP_STYLE } from "@/components/charts/chart-theme";

interface PieChartCardProps<T> {
  data: T[];
  nameKey: keyof T & string;
  valueKey: keyof T & string;
}

function PieChartCardBodyImpl<T extends object>({ data, nameKey, valueKey }: PieChartCardProps<T>) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey={valueKey}
          nameKey={nameKey}
          innerRadius="55%"
          outerRadius="85%"
          paddingAngle={2}
          animationDuration={600}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={CHART_PALETTE[index % CHART_PALETTE.length]} stroke="var(--card)" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export const PieChartCardBody = memo(PieChartCardBodyImpl) as typeof PieChartCardBodyImpl;
