"use client";

import {
  Area,
  AreaChart as RAreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_AXIS_COLOR, CHART_GRID_COLOR, CHART_PALETTE } from "./palette";

export interface AreaSeries {
  key: string;
  label?: string;
  color?: string;
}

interface AreaChartProps {
  data: Array<Record<string, unknown>>;
  xKey: string;
  series: AreaSeries[];
  height?: number;
  showGrid?: boolean;
}

export function AreaChart({
  data,
  xKey,
  series,
  height = 240,
  showGrid = true,
}: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RAreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        {showGrid && <CartesianGrid stroke={CHART_GRID_COLOR} vertical={false} />}
        <XAxis dataKey={xKey} stroke={CHART_AXIS_COLOR} fontSize={12} tickLine={false} />
        <YAxis stroke={CHART_AXIS_COLOR} fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip />
        {series.map((s, i) => {
          const color = s.color ?? CHART_PALETTE[i % CHART_PALETTE.length];
          return (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label ?? s.key}
              stroke={color}
              strokeWidth={2}
              fill={color}
              fillOpacity={0.15}
            />
          );
        })}
      </RAreaChart>
    </ResponsiveContainer>
  );
}
