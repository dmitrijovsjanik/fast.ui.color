import type { OklchColor, OklchScale, StepIndex, ColorScale, LightnessMapping } from './types';
import { STEP_INDICES } from './types';
import { gamutMapOklch, maxChromaForLH } from './gamut-mapper';

// Lightness targets for light theme — derived from actual Radix Colors data.
// Steps 9, 10, 11 are computed dynamically.
export const LIGHT_THEME_LIGHTNESS: Record<StepIndex, number> = {
  1: 0.993,
  2: 0.981,
  3: 0.958,
  4: 0.932,
  5: 0.899,
  6: 0.859,
  7: 0.805,
  8: 0.731,
  9: 0.644,   // Base — adjusted dynamically per hue
  10: 0.615,  // Computed relative to step 9
  11: 0.551,  // Computed relative to step 9
  12: 0.329,
};

// Find the L where max chroma occurs for this hue in sRGB.
// This determines whether the scale is "bright" (like amber, teal, lime)
// or "standard" (like blue, red).
function optimalLightnessForHue(hue: number, gamut: 'sRGB' | 'P3'): number {
  let bestL = 0.644;
  let bestC = 0;
  // Scan from L=0.30 to L=0.95 in 0.01 steps
  for (let l = 30; l <= 95; l++) {
    const c = maxChromaForLH(l / 100, hue, gamut);
    if (c > bestC) {
      bestC = c;
      bestL = l / 100;
    }
  }
  return bestL;
}

// Determine step 9 lightness for a given hue.
// Blends between the base L (0.644) and the optimal L for max chroma.
// For "standard" hues (blue, red) where optimal L ≈ 0.64, no change.
// For "bright" hues (teal, amber) where optimal L ≈ 0.85+, step 9 is boosted.
export function computeStep9Lightness(hue: number, gamut: 'sRGB' | 'P3'): number {
  const baseL = LIGHT_THEME_LIGHTNESS[9]; // 0.644
  const optimalL = optimalLightnessForHue(hue, gamut);

  if (optimalL <= baseL + 0.05) {
    // Standard hue — optimal L is close to base, no boost needed
    return baseL;
  }

  // Bright hue — blend toward optimal L.
  // Blend factor: how much to shift toward optimal.
  // 0.85 = aggressive (Radix-like), leaves some room to not overshoot.
  const blendFactor = 0.85;
  return baseL + (optimalL - baseL) * blendFactor;
}

// Chroma distribution — matches actual Radix Colors pattern.
// Default curve (blue, green, red average):
//   Radix avg: 2%, 6%, 15%, 25%, 34%, 44%, 55%, 74%, 100%, 96%, 88%, 46%
const CHROMA_FACTORS: Record<StepIndex, number> = {
  1: 0.02,
  2: 0.06,
  3: 0.15,
  4: 0.25,
  5: 0.34,
  6: 0.44,
  7: 0.55,
  8: 0.74,
  9: 1.00,
  10: 0.96,
  11: 0.88,
  12: 0.46,
};

// "Bright" scales (amber, teal, lime, etc.) have higher chroma at early steps.
// Radix amber pattern: 2%, 15%, 44%, 66%, 84%, 78%, 78%, 89%, 100%, 107%, 82%, 31%
const BRIGHT_CHROMA_FACTORS: Record<StepIndex, number> = {
  1: 0.02,
  2: 0.15,
  3: 0.44,
  4: 0.66,
  5: 0.84,
  6: 0.78,
  7: 0.78,
  8: 0.89,
  9: 1.00,
  10: 1.05,
  11: 0.82,
  12: 0.31,
};

// How "bright" a scale is (0 = standard, 1 = fully bright)
// based on how much step 9 L was boosted above the base.
function brightnessBlend(step9L: number): number {
  const baseL = LIGHT_THEME_LIGHTNESS[9]; // 0.644
  const maxBoost = 0.25; // At this boost, fully bright curve
  const boost = Math.max(0, step9L - baseL);
  return Math.min(1, boost / maxBoost);
}

function chromaForStep(step: StepIndex, peakChroma: number, step9L: number): number {
  const bright = brightnessBlend(step9L);
  if (bright <= 0) return peakChroma * CHROMA_FACTORS[step];

  const defaultF = CHROMA_FACTORS[step];
  const brightF = BRIGHT_CHROMA_FACTORS[step];
  const factor = defaultF + (brightF - defaultF) * bright;
  return peakChroma * factor;
}

// Chroma for neutral scales (very low, nearly uniform)
function neutralChromaForStep(step: StepIndex, neutralChroma: number): number {
  const t = (step - 1) / 11;
  const bump = 1 + 0.15 * 4 * t * (1 - t);
  return neutralChroma * bump;
}

export interface ScaleGeneratorOptions {
  hue: number;
  peakChroma: number;
  gamut: 'sRGB' | 'P3';
  fixedStep9?: OklchColor; // Lock step 9 to exact brand color
  isNeutral?: boolean;
  brandLightness?: number; // Brand step 9 L — semantics shift toward it
  backgroundLightness?: number; // L of background color (both themes)
  lightnessMapping?: LightnessMapping; // fixed = offset-based, interpolated = adaptive
}

// Normalized positions of steps 1-8 in the fixed light theme curve.
// Computed from LIGHT_THEME_LIGHTNESS: t = (L - step9BaseL) / (whiteL - step9BaseL)
// where step9BaseL = 0.644, whiteL = 1.0 → range = 0.356
// These represent where each step falls between step9 (0) and bg (1).
const LIGHT_STEP_POSITIONS: Record<number, number> = {
  1: (0.993 - 0.644) / (1.0 - 0.644), // ≈ 0.981
  2: (0.981 - 0.644) / (1.0 - 0.644), // ≈ 0.947
  3: (0.958 - 0.644) / (1.0 - 0.644), // ≈ 0.882
  4: (0.932 - 0.644) / (1.0 - 0.644), // ≈ 0.809
  5: (0.899 - 0.644) / (1.0 - 0.644), // ≈ 0.716
  6: (0.859 - 0.644) / (1.0 - 0.644), // ≈ 0.604
  7: (0.805 - 0.644) / (1.0 - 0.644), // ≈ 0.452
  8: (0.731 - 0.644) / (1.0 - 0.644), // ≈ 0.244
};

// Normalized positions for dark theme adaptive mode.
// Derived from Radix Blue Dark: position = (stepL - bgL) / (step9L - bgL)
// bgL ≈ 0.194, step9L ≈ 0.649, range ≈ 0.455
const DARK_STEP_POSITIONS: Record<number, number> = {
  1: 0.000, // bg
  2: 0.042, // ≈ 0.019/0.455
  3: 0.176, // ≈ 0.080/0.455
  4: 0.277, // ≈ 0.126/0.455
  5: 0.380, // ≈ 0.173/0.455
  6: 0.488, // ≈ 0.222/0.455
  7: 0.615, // ≈ 0.280/0.455
  8: 0.763, // ≈ 0.347/0.455
};

// Reference white L for computing light theme offsets
const WHITE_L = 1.0;

// Generate a 12-step OKLCH scale for light theme
export function generateLightThemeScale(options: ScaleGeneratorOptions): {
  oklchScale: OklchScale;
  hexScale: ColorScale;
} {
  const { hue, peakChroma, gamut, fixedStep9, isNeutral = false, brandLightness, backgroundLightness, lightnessMapping = 'fixed' } = options;

  // Background lightness — default to white (~1.0)
  const bgL = backgroundLightness ?? WHITE_L;

  const oklchScale = {} as OklchScale;
  const hexScale = {} as ColorScale;

  // Determine step 9 lightness
  let step9L: number;
  let step9C: number;

  if (fixedStep9) {
    step9L = fixedStep9.l;
    step9C = fixedStep9.c;
  } else {
    let baseL = isNeutral
      ? LIGHT_THEME_LIGHTNESS[9]
      : computeStep9Lightness(hue, gamut);

    // Shift semantic roles toward brand lightness (attenuated for extreme brands)
    if (brandLightness !== undefined && !isNeutral) {
      const deviation = Math.abs(brandLightness - baseL);
      // Attenuate blend when brand is far from natural lightness (>0.15 deviation)
      const blendFactor = deviation > 0.15
        ? 0.35 * (0.15 / deviation)
        : 0.35;
      baseL = baseL + (brandLightness - baseL) * blendFactor;
      baseL = Math.max(0.55, Math.min(0.85, baseL));
    }

    step9L = baseL;
    step9C = peakChroma;
  }

  // Steps 10, 11 are relative to step 9 (Radix pattern):
  // Step 10 = hover state (small drop)
  // Step 11 = low-contrast text (bigger drop, scales with brightness)
  //   Radix blue:  0.649→0.622→0.556 (Δ10=0.027, Δ11=0.093)
  //   Radix amber: 0.854→0.831→0.571 (Δ10=0.023, Δ11=0.283)
  //   Radix teal:  0.870→0.839→0.512 (Δ10=0.031, Δ11=0.358)
  const step10L = step9L - 0.028;
  const baseStep11Drop = 0.093;
  const extraDrop = Math.max(0, step9L - LIGHT_THEME_LIGHTNESS[9]) * 1.15;
  const step11L = step9L - baseStep11Drop - extraDrop;

  for (const step of STEP_INDICES) {
    let l: number;
    let c: number;

    if (step === 9) {
      l = step9L;
      c = step9C;
    } else if (step === 10) {
      l = step10L;
      c = isNeutral ? neutralChromaForStep(step, peakChroma) : chromaForStep(step, peakChroma, step9L);
    } else if (step === 11) {
      l = step11L;
      c = isNeutral ? neutralChromaForStep(step, peakChroma) : chromaForStep(step, peakChroma, step9L);
    } else if (step === 12) {
      l = LIGHT_THEME_LIGHTNESS[12]; // Absolute — darkest text
      c = isNeutral ? neutralChromaForStep(step, peakChroma) : chromaForStep(step, peakChroma, step9L);
    } else {
      // Steps 1-8
      if (lightnessMapping === 'interpolated') {
        // Interpolate between step9L and bgL using normalized positions
        l = step9L + LIGHT_STEP_POSITIONS[step] * (bgL - step9L);
      } else {
        // Fixed: offset from background lightness
        const offset = LIGHT_THEME_LIGHTNESS[step] - WHITE_L;
        l = bgL + offset;
      }
      c = isNeutral ? neutralChromaForStep(step, peakChroma) : chromaForStep(step, peakChroma, step9L);
    }

    const mapped = gamutMapOklch({ l, c, h: hue }, gamut);
    oklchScale[step] = mapped.oklch;
    hexScale[step] = mapped.hex;
  }

  return { oklchScale, hexScale };
}

// Dark theme lightness — derived from Radix Blue Dark data.
// Steps 1-8 are offsets added to bgL (background lightness).
// Steps 9-12 are absolute values (computed dynamically for 9-11).
export const DARK_THEME_LIGHTNESS_OFFSETS: Record<StepIndex, number> = {
  1: 0.000,   // Step 1 = background color
  2: 0.019,   // Subtle surface
  3: 0.080,   // UI element bg
  4: 0.126,   // Hovered UI element bg
  5: 0.173,   // Active / selected
  6: 0.222,   // Subtle borders
  7: 0.280,   // UI borders
  8: 0.347,   // Strong borders
  9: 0.000,   // Dynamic (absolute, not offset)
  10: 0.000,  // Dynamic
  11: 0.000,  // Dynamic
  12: 0.930,  // High-contrast text (absolute)
};

// Dark mode chroma — surfaces carry more tint than light theme (Radix dark pattern),
// Helmholtz-Kohlrausch compensation on steps 9-10 (-15%).
const DARK_CHROMA_FACTORS: Record<StepIndex, number> = {
  1: 0.04,
  2: 0.08,
  3: 0.16,
  4: 0.26,
  5: 0.34,
  6: 0.42,
  7: 0.55,
  8: 0.74,
  9: 0.85,
  10: 0.80,
  11: 0.65,
  12: 0.26,
};

function darkChromaForStep(step: StepIndex, peakChroma: number): number {
  return peakChroma * DARK_CHROMA_FACTORS[step];
}

// Generate a 12-step OKLCH scale for dark theme
export function generateDarkThemeScale(options: ScaleGeneratorOptions): {
  oklchScale: OklchScale;
  hexScale: ColorScale;
} {
  const { hue, peakChroma, gamut, fixedStep9, isNeutral = false, brandLightness, backgroundLightness, lightnessMapping = 'fixed' } = options;

  const oklchScale = {} as OklchScale;
  const hexScale = {} as ColorScale;

  // Background lightness — default to ~0.18 (#111113)
  const bgL = backgroundLightness ?? 0.178;

  // Step 9 lightness: same logic as light (hue-dependent)
  let step9L: number;
  let step9C: number;

  if (fixedStep9) {
    step9L = fixedStep9.l;
    step9C = fixedStep9.c;
  } else {
    let baseL = isNeutral
      ? 0.644
      : computeStep9Lightness(hue, gamut);

    // Attenuated blend for extreme brand lightness values
    if (brandLightness !== undefined && !isNeutral) {
      const deviation = Math.abs(brandLightness - baseL);
      const blendFactor = deviation > 0.15
        ? 0.35 * (0.15 / deviation)
        : 0.35;
      baseL = baseL + (brandLightness - baseL) * blendFactor;
      baseL = Math.max(0.55, Math.min(0.85, baseL));
    }

    step9L = baseL;
    step9C = peakChroma;
  }

  // In dark mode: hover is lighter, text steps are high-lightness
  // Radix blue dark: step9=0.649, step10=0.688 (Δ=+0.039), step11=0.764 (Δ=+0.115)
  const step10L = step9L + 0.039;
  const step11L = step9L + 0.115;

  for (const step of STEP_INDICES) {
    let l: number;
    let c: number;

    if (step === 9) {
      l = step9L;
      c = step9C;
    } else if (step === 10) {
      l = step10L;
      c = isNeutral ? neutralChromaForStep(step, peakChroma) : darkChromaForStep(step, peakChroma);
    } else if (step === 11) {
      l = step11L;
      c = isNeutral ? neutralChromaForStep(step, peakChroma) : darkChromaForStep(step, peakChroma);
    } else if (step === 12) {
      l = DARK_THEME_LIGHTNESS_OFFSETS[12]; // Absolute
      c = isNeutral ? neutralChromaForStep(step, peakChroma) : darkChromaForStep(step, peakChroma);
    } else {
      // Steps 1-8
      const fixedL = bgL + DARK_THEME_LIGHTNESS_OFFSETS[step as StepIndex];
      if (lightnessMapping === 'interpolated') {
        // Full interpolation between bgL and step9L
        l = bgL + DARK_STEP_POSITIONS[step] * (step9L - bgL);
      } else {
        l = fixedL;
      }
      if (isNeutral) {
        c = neutralChromaForStep(step, peakChroma);
      } else {
        const baseC = darkChromaForStep(step, peakChroma);
        if (lightnessMapping === 'interpolated' && l > fixedL) {
          // Adaptive: chroma scales up as lightness approaches step9.
          const liftRatio = (l - fixedL) / (step9L - fixedL);
          c = baseC + (step9C - baseC) * liftRatio;
        } else {
          c = baseC;
        }
      }
    }

    const mapped = gamutMapOklch({ l, c, h: hue }, gamut);
    oklchScale[step] = mapped.oklch;
    hexScale[step] = mapped.hex;
  }

  return { oklchScale, hexScale };
}
