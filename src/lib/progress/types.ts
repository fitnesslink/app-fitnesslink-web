export type WeightUnit = "lbs" | "kg";
export type LengthUnit = "in" | "cm";
export type PhotoAngle = "front" | "side" | "back";

export interface WeightEntry {
  id: string;
  weight: number; // stored in kg internally
  loggedAt: string; // ISO date
  notes?: string;
}

export const BODY_PARTS = [
  "chest",
  "waist",
  "hips",
  "leftArm",
  "rightArm",
  "leftThigh",
  "rightThigh",
  "neck",
] as const;

export type BodyPart = (typeof BODY_PARTS)[number];

export const BODY_PART_LABELS: Record<BodyPart, string> = {
  chest: "Chest",
  waist: "Waist",
  hips: "Hips",
  leftArm: "Left arm",
  rightArm: "Right arm",
  leftThigh: "Left thigh",
  rightThigh: "Right thigh",
  neck: "Neck",
};

export interface MeasurementEntry {
  id: string;
  loggedAt: string;
  values: Partial<Record<BodyPart, number>>; // stored in cm
}

export interface ProgressPhoto {
  id: string;
  loggedAt: string;
  angle: PhotoAngle;
  imageUrl: string;
  weightKg?: number;
  note?: string;
}

export const KG_PER_LB = 0.453_592_37;
export const CM_PER_IN = 2.54;

export function kgToUnit(kg: number, unit: WeightUnit): number {
  return unit === "kg" ? kg : kg / KG_PER_LB;
}
export function unitToKg(value: number, unit: WeightUnit): number {
  return unit === "kg" ? value : value * KG_PER_LB;
}
export function cmToUnit(cm: number, unit: LengthUnit): number {
  return unit === "cm" ? cm : cm / CM_PER_IN;
}
export function unitToCm(value: number, unit: LengthUnit): number {
  return unit === "cm" ? value : value * CM_PER_IN;
}
