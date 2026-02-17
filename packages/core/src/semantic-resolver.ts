import type { SemanticHues, NeutralStyle } from './types';

// Target hues for each semantic role
const TARGET_HUES = {
  success: 145,
  warning: 80,
  danger: 25,
  info: 245,
} as const;

// Valid ranges for each role
const HUE_RANGES = {
  success: { min: 130, max: 160 },
  warning: { min: 60, max: 90 },
  danger: { min: 15, max: 35 },
  info: { min: 230, max: 260 },
} as const;

// Angular distance on the hue circle (0-180)
function angularDistance(h1: number, h2: number): number {
  const diff = Math.abs(h1 - h2) % 360;
  return diff > 180 ? 360 - diff : diff;
}

// Clamp hue to a range
function clampHue(h: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, h));
}

// Sign of the shortest path from source to target on the hue circle
function hueDirection(from: number, to: number): number {
  const diff = ((to - from) % 360 + 360) % 360;
  return diff <= 180 ? 1 : -1;
}

export function resolveSemanticHues(
  brandHue: number,
  neutralStyle: NeutralStyle = 'tinted'
): SemanticHues {
  const result: Partial<SemanticHues> = {
    brand: brandHue,
  };

  for (const [role, target] of Object.entries(TARGET_HUES) as [keyof typeof TARGET_HUES, number][]) {
    const range = HUE_RANGES[role];
    const distance = angularDistance(brandHue, target);

    let adjustedHue: number;

    if (distance < 30) {
      // Brand is too close — push the semantic hue away to avoid collision
      const pushStrength = (30 - distance) * 0.6;
      const direction = hueDirection(brandHue, target);
      // Push in the same direction (away from brand)
      adjustedHue = target + pushStrength * direction;
    } else {
      // Pull slightly toward brand for harmony
      const pullStrength = Math.min(8, distance * 0.04);
      const direction = hueDirection(target, brandHue);
      adjustedHue = target + pullStrength * direction;
    }

    result[role] = clampHue(adjustedHue, range.min, range.max);
  }

  // Neutral hue
  result.neutral = neutralStyle === 'tinted' ? brandHue : 0;

  return result as SemanticHues;
}
