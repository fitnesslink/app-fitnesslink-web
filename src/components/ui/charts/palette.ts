// Chart-series colors locked to design tokens so every wrapper reads from the
// same palette. Rotate through in insertion order for multi-series charts.
export const CHART_PALETTE = [
  "#23AF8D", // primary
  "#F69833", // accent-orange
  "#8B5CF6", // accent-purple
  "#3B82F6", // accent-blue
  "#10B981", // success
  "#F59E0B", // warning
  "#DC2626", // danger
  "#6B7280", // text-secondary
] as const;

export const CHART_AXIS_COLOR = "#6B7280";
export const CHART_GRID_COLOR = "#E5E7EB";
