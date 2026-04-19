"use client";

import {
  Bar,
  BarChart as RBarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_AXIS_COLOR, CHART_GRID_COLOR, CHART_PALETTE } from "./palette";

export interface BarSeries {
  key: string;
  label?: string;
  color?: string;
}

interface BarChartProps {
  data: Array<Record<string, unknown>>;
  xKey: string;
  series: BarSeries[];
  height?: number;
  stacked?: boolean;
  showGrid?: boolean;
}

export function BarChart({
  data,
  xKey,
  series,
  height = 240,
  stacked = false,
  showGrid = true,
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RBarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        {showGrid && <CartesianGrid stroke={CHART_GRID_COLOR} vertical={false} />}
        <XAxis dataKey={xKey} stroke={CHART_AXIS_COLOR} fontSize={12} tickLine={false} />
        <YAxis stroke={CHART_AXIS_COLOR} fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip />
        {series.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label ?? s.key}
            stackId={stacked ? "stack" : undefined}
            fill={s.color ?? CHART_PALETTE[i % CHART_PALETTE.length]}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </RBarChart>
    </ResponsiveContainer>
  );
}
