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

// ─── Unit helpers ──────────────────────────────────────────────────────────

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

// ─── Placeholder data ──────────────────────────────────────────────────────

export function placeholderWeight(): WeightEntry[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const out: WeightEntry[] = [];
  // Drift downward from 92 kg over ~12 weeks with some noise.
  for (let i = 84; i >= 0; i -= 3) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const base = 92 - (84 - i) * 0.05;
    const noise = (Math.random() - 0.5) * 0.8;
    out.push({
      id: `w${i}`,
      weight: Math.round((base + noise) * 10) / 10,
      loggedAt: d.toISOString(),
    });
  }
  return out.reverse();
}

export function placeholderMeasurements(): MeasurementEntry[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const baseValues: Record<BodyPart, number> = {
    chest: 108,
    waist: 94,
    hips: 103,
    leftArm: 37,
    rightArm: 37.5,
    leftThigh: 62,
    rightThigh: 62.5,
    neck: 41,
  };
  const out: MeasurementEntry[] = [];
  for (let week = 0; week < 12; week += 2) {
    const d = new Date(today);
    d.setDate(today.getDate() - week * 7);
    const values: Partial<Record<BodyPart, number>> = {};
    for (const part of BODY_PARTS) {
      const drift = week * 0.15;
      const noise = (Math.random() - 0.5) * 0.4;
      values[part] = Math.round((baseValues[part] - drift + noise) * 10) / 10;
    }
    out.push({
      id: `m${week}`,
      loggedAt: d.toISOString(),
      values,
    });
  }
  return out.reverse();
}

export function placeholderPhotos(): ProgressPhoto[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const angles: PhotoAngle[] = ["front", "side", "back"];
  // Swatch-only images (no real images in the repo) so the placeholder gallery
  // is self-contained. The `imageUrl` resolves to a data URI that the <img>
  // tag renders natively — no network dependency.
  function swatch(angle: PhotoAngle, dayOffset: number): string {
    const tone = angle === "front" ? "#E6F6F1" : angle === "side" ? "#FBE9D7" : "#EDE1FB";
    const accent = angle === "front" ? "#23AF8D" : angle === "side" ? "#F69833" : "#8B5CF6";
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600'><rect width='400' height='600' fill='${tone}'/><circle cx='200' cy='220' r='70' fill='${accent}' opacity='0.35'/><rect x='135' y='290' width='130' height='260' rx='40' fill='${accent}' opacity='0.35'/><text x='200' y='570' text-anchor='middle' font-family='sans-serif' font-size='20' fill='${accent}'>${angle.toUpperCase()} · ${dayOffset}d ago</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }
  const out: ProgressPhoto[] = [];
  for (let week = 0; week < 12; week += 3) {
    const d = new Date(today);
    d.setDate(today.getDate() - week * 7);
    for (const angle of angles) {
      out.push({
        id: `ph-${week}-${angle}`,
        loggedAt: d.toISOString(),
        angle,
        imageUrl: swatch(angle, week * 7),
        weightKg: 92 - week * 0.35,
      });
    }
  }
  return out.reverse();
}
