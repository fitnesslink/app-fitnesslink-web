"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { CHART_PALETTE } from "./palette";

export interface RingSegment {
  key: string;
  value: number;
  label?: string;
  color?: string;
}

interface RingChartProps {
  data: RingSegment[];
  height?: number;
  innerRadius?: number | string;
  outerRadius?: number | string;
  /** Content rendered inside the donut hole (e.g., total + unit) */
  centerLabel?: React.ReactNode;
}

export function RingChart({
  data,
  height = 220,
  innerRadius = "60%",
  outerRadius = "90%",
  centerLabel,
}: RingChartProps) {
  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((seg, i) => (
              <Cell
                key={seg.key}
                fill={seg.color ?? CHART_PALETTE[i % CHART_PALETTE.length]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      {centerLabel && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {centerLabel}
        </div>
      )}
    </div>
  );
}
