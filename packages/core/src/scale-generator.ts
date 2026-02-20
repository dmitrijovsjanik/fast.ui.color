import type { OklchColor, OklchScale, StepIndex, ColorScale } from './types';
import { STEP_INDICES } from './types';
import { gamutMapOklch, maxChromaForLH } from './gamut-mapper';
import { apcaLcFromY, reverseAPCA_OklchL } from './contrast-checker';

// --- Hybrid Lightness Generation ---
//
// Two strategies depending on whether APCA contrast is measurable:
//
// Steps 1-4 (surfaces): Bezier transposition from reference scale.
//   These live in APCA's dead zone (Lc=0 vs bg) so contrast-targeting is impossible.
//   Instead, generate at reference bg then transpose with steep bezier falloff.
//   Step 1 absorbs bg change, steps 2-4 shift slightly, preserving visual spacing.
//
// Steps 5-12 (interactive/borders/solid/text): Proportional APCA contrast.
//   These have measurable contrast vs bg. Compute reference Lc at standard bg,
//   then scale proportionally to available contrast at actual bg.
//   APCA reverse-solve finds the L that achieves the target Lc.
//   This preserves contrast ratios across different backgrounds.

// Reference background lightness values
const DARK_REFERENCE_BG_L = 0.178;  // ~#111113
const LIGHT_REFERENCE_BG_L = 1.0;   // #ffffff

// Surface zone power curve exponents — calibrated from Radix reference data.
const DARK_SURFACE_GAMMA = 1.2;
const LIGHT_SURFACE_GAMMA = 1.8;

// Bezier falloff for surface transposition (steps 1-4 only).
// From Radix's [1,0,1,0] cubic bezier evaluated at (1 - i/11).
const SURFACE_TRANSPOSE_FALLOFF: Record<number, number> = {
  1: 1.000,
  2: 0.167,
  3: 0.081,
  4: 0.043,
};

// Adapt surface steps (1-4) from reference to actual background.
// When bg is darker than reference: bezier transposition (Radix approach).
// When bg is lighter than reference: recompute power curve from new bg.
function adaptSurface(
  step9L: number,
  targetBgL: number,
  refBgL: number,
  gamma: number,
  isDark: boolean,
): Record<number, number> {
  const eps = 1e-4;
  const bgDarker = isDark ? (targetBgL < refBgL - eps) : (targetBgL > refBgL + eps);

  // Both themes: bg = virtual step 0 (t=0), steps 1-4 use t = step/5.
  // Step 1 is always distinct from bg.
  // Light step 1 uses t=0.3 to reduce the gap between steps 1 and 2 (gamma=1.8 compresses early steps too much).
  const computeSurface = (bgL: number, s9L: number) => {
    const zb = (bgL + s9L) / 2;
    const result: Record<number, number> = {};
    for (let step = 1; step <= 4; step++) {
      const t = (!isDark && step === 1) ? 0.3 : step / 5;
      result[step] = isDark
        ? bgL + Math.pow(t, gamma) * (zb - bgL)
        : bgL - Math.pow(t, gamma) * (bgL - zb);
    }
    return result;
  };

  if (bgDarker) {
    // Bezier transposition: generate at ref bg, then shift toward actual bg.
    // Use refBgL (not refSurface[1]) as base for diff so each step's offset from bg is preserved.
    const refSurface = computeSurface(refBgL, step9L);
    const bgShift = isDark ? (refBgL - targetBgL) : (targetBgL - refBgL);
    const result: Record<number, number> = {};
    for (let step = 1; step <= 4; step++) {
      const shift = bgShift * SURFACE_TRANSPOSE_FALLOFF[step];
      result[step] = Math.max(0, Math.min(1, isDark ? refSurface[step] - shift : refSurface[step] + shift));
    }
    // Ensure monotonicity
    for (let step = 2; step <= 4; step++) {
      if (isDark && result[step] <= result[step - 1]) result[step] = result[step - 1] + 0.003;
      else if (!isDark && result[step] >= result[step - 1]) result[step] = result[step - 1] - 0.003;
    }
    return result;
  } else {
    // Recompute power curve from new bg
    return computeSurface(targetBgL, step9L);
  }
}

// Compute contrast-preserving lightness for steps 5-12.
// 1. Compute each step's APCA Lc at reference bg (absolute target)
// 2. Reverse-solve to find L that achieves the SAME Lc at actual bg
// This guarantees identical contrast regardless of background.
function computeDarkContrastSteps(
  bgL: number,
  step9L: number,
  step10L: number,
  step11L: number,
  step12L: number,
): Record<number, number> {
  const refBgL = DARK_REFERENCE_BG_L;
  const refBgY = refBgL ** 3;

  // Reference L for each step (at reference bg)
  const refStepL: Record<number, number> = {};
  const zoneBoundary = (refBgL + step9L) / 2;
  // Step 5: power curve at ref bg (t = step/5, bg = virtual step 0)
  const t5 = 5 / 5; // = 1.0, step 5 lands at zoneBoundary
  refStepL[5] = refBgL + Math.pow(t5, DARK_SURFACE_GAMMA) * (zoneBoundary - refBgL);
  // Steps 6-8: APCA fractions of step 9 at ref bg
  const refStep9Lc = apcaLcFromY(step9L ** 3, refBgY);
  const DARK_LC_FRACTIONS: Record<number, number> = { 6: 0.303, 7: 0.443, 8: 0.625 };
  for (let step = 6; step <= 8; step++) {
    const targetLc = refStep9Lc * DARK_LC_FRACTIONS[step];
    if (targetLc >= 7) {
      refStepL[step] = reverseAPCA_OklchL(targetLc, refBgL, 'reverse');
    } else {
      const t = (step - 5) / 4;
      refStepL[step] = refStepL[5] + t * (step9L - refStepL[5]);
    }
  }
  refStepL[9] = step9L;
  refStepL[10] = step10L;
  refStepL[11] = step11L;
  refStepL[12] = step12L;

  // Ensure monotonicity in reference
  for (let step = 6; step <= 8; step++) {
    if (refStepL[step] <= refStepL[step - 1]) {
      refStepL[step] = refStepL[step - 1] + 0.005;
    }
  }

  // Compute absolute Lc targets (at reference bg)
  const targetLcs: Record<number, number> = {};
  for (let step = 5; step <= 12; step++) {
    targetLcs[step] = apcaLcFromY(refStepL[step] ** 3, refBgY);
  }

  // Reverse-solve: find L at actual bg that produces the same Lc
  const result: Record<number, number> = {};
  for (let step = 5; step <= 12; step++) {
    if (targetLcs[step] < 7) {
      result[step] = refStepL[step]; // fallback to reference L
    } else {
      result[step] = reverseAPCA_OklchL(targetLcs[step], bgL, 'reverse');
    }
    result[step] = Math.max(0, Math.min(1, result[step]));
  }

  // Ensure monotonicity
  for (let step = 6; step <= 12; step++) {
    if (result[step] <= result[step - 1]) {
      result[step] = result[step - 1] + 0.003;
    }
  }

  return result;
}

function computeLightContrastSteps(
  bgL: number,
  step9L: number,
  step10L: number,
  step11L: number,
  step12L: number,
): Record<number, number> {
  const refBgL = LIGHT_REFERENCE_BG_L;
  const refBgY = refBgL ** 3;

  // Reference L at ref bg
  const refStepL: Record<number, number> = {};
  const zoneBoundary = (refBgL + step9L) / 2;
  // Light theme: bg = virtual step 0, steps 1-5 use t = step/5
  const t5 = 5 / 5; // = 1.0, step 5 lands at zoneBoundary
  refStepL[5] = refBgL - Math.pow(t5, LIGHT_SURFACE_GAMMA) * (refBgL - zoneBoundary);
  const refStep9Lc = apcaLcFromY(step9L ** 3, refBgY);
  const LIGHT_LC_FRACTIONS: Record<number, number> = { 6: 0.406, 7: 0.567, 8: 0.774 };
  for (let step = 6; step <= 8; step++) {
    const targetLc = refStep9Lc * LIGHT_LC_FRACTIONS[step];
    if (targetLc >= 7) {
      refStepL[step] = reverseAPCA_OklchL(targetLc, refBgL, 'normal');
    } else {
      const t = (step - 5) / 4;
      refStepL[step] = refStepL[5] - t * (refStepL[5] - step9L);
    }
  }
  refStepL[9] = step9L;
  refStepL[10] = step10L;
  refStepL[11] = step11L;
  refStepL[12] = step12L;

  // Ensure monotonicity in reference (light: decreasing L)
  for (let step = 6; step <= 8; step++) {
    if (refStepL[step] >= refStepL[step - 1]) {
      refStepL[step] = refStepL[step - 1] - 0.005;
    }
  }

  // Absolute Lc targets (at reference bg)
  const targetLcs: Record<number, number> = {};
  for (let step = 5; step <= 12; step++) {
    targetLcs[step] = apcaLcFromY(refStepL[step] ** 3, refBgY);
  }

  // Reverse-solve: find L at actual bg that produces the same Lc
  const result: Record<number, number> = {};
  for (let step = 5; step <= 12; step++) {
    if (targetLcs[step] < 7) {
      result[step] = refStepL[step];
    } else {
      result[step] = reverseAPCA_OklchL(targetLcs[step], bgL, 'normal');
    }
    result[step] = Math.max(0, Math.min(1, result[step]));
  }

  // Ensure monotonicity (decreasing L)
  for (let step = 6; step <= 12; step++) {
    if (result[step] >= result[step - 1]) {
      result[step] = result[step - 1] - 0.003;
    }
  }

  return result;
}

// Check if background is within viable range for dark theme.
// Returns headroom (positive = OK, negative = out of range).
export function checkDarkBackgroundViability(bgL: number): { viable: boolean; headroom: number } {
  const bgY = bgL ** 3;
  const maxLc = apcaLcFromY(1.0, bgY);
  const headroom = maxLc - 91.5; // step 12 needs ~91.5 Lc
  return { viable: headroom > 0, headroom };
}

export function checkLightBackgroundViability(bgL: number): { viable: boolean; headroom: number } {
  const bgY = bgL ** 3;
  const maxLc = apcaLcFromY(0, bgY); // black on bg
  const headroom = maxLc - 91.5;
  return { viable: headroom > 0, headroom };
}

// Reference lightness values (kept for step 9 base and step 12)
const LIGHT_STEP9_BASE_L = 0.644;
const LIGHT_STEP12_L = 0.329;
const DARK_STEP12_L = 0.930;

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
  const baseL = LIGHT_STEP9_BASE_L; // 0.644
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
  const baseL = LIGHT_STEP9_BASE_L; // 0.644
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
  brandChromaCeiling?: number; // Max chroma from user's brand (dark adaptive mode)
  backgroundLightness?: number; // L of background color (both themes)
}

// Generate a 12-step OKLCH scale for light theme
export function generateLightThemeScale(options: ScaleGeneratorOptions): {
  oklchScale: OklchScale;
  hexScale: ColorScale;
} {
  const { hue, peakChroma, gamut, fixedStep9, isNeutral = false, brandLightness, backgroundLightness } = options;

  // Background lightness — default to reference
  const bgL = backgroundLightness ?? LIGHT_REFERENCE_BG_L;

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
      ? LIGHT_STEP9_BASE_L
      : computeStep9Lightness(hue, gamut);

    // Shift semantic roles toward brand lightness (attenuated for extreme brands)
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

  // Steps 10, 11 relative to step 9 (Radix pattern)
  const step10L = step9L - 0.028;
  const baseStep11Drop = 0.093;
  const extraDrop = Math.max(0, step9L - LIGHT_STEP9_BASE_L) * 1.15;
  const step11L = step9L - baseStep11Drop - extraDrop;

  // Steps 1-4: surface adaptation
  const surfaceL = adaptSurface(step9L, bgL, LIGHT_REFERENCE_BG_L, LIGHT_SURFACE_GAMMA, false);

  // Steps 5-12: proportional APCA contrast to actual bg
  const contrastL = computeLightContrastSteps(bgL, step9L, step10L, step11L, LIGHT_STEP12_L);

  // Merge: ensure step 5 < step 4 (light theme: decreasing L)
  const finalL: Record<number, number> = { ...surfaceL, ...contrastL };
  if (finalL[5] >= finalL[4]) {
    finalL[5] = finalL[4] - 0.005;
  }

  for (const step of STEP_INDICES) {
    const l = finalL[step];
    const c = step === 9
      ? step9C
      : isNeutral
        ? neutralChromaForStep(step, peakChroma)
        : chromaForStep(step, peakChroma, step9L);

    const mapped = gamutMapOklch({ l, c, h: hue }, gamut);
    oklchScale[step] = mapped.oklch;
    hexScale[step] = mapped.hex;
  }

  return { oklchScale, hexScale };
}

// Dark mode chroma — Hunt effect compensation on steps 3-8.
// Dark backgrounds reduce perceived saturation (Hunt 1952, CIECAM02 F_L factor).
// Steps 1-2: already compensated (2x/1.33x of light).
// Steps 3-8: boosted ~15-20% above light factors to restore perceptual parity.
// Steps 9-10: Helmholtz-Kohlrausch compensation (-15%) — saturated colors
//   appear brighter on dark backgrounds (up to 2.5x for blue hues).
// Step 11-12: text colors, kept lower for readability.
const DARK_CHROMA_FACTORS: Record<StepIndex, number> = {
  1: 0.04,
  2: 0.08,
  3: 0.22,
  4: 0.32,
  5: 0.40,
  6: 0.50,
  7: 0.62,
  8: 0.80,
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
  const { hue, peakChroma, gamut, fixedStep9, isNeutral = false, brandLightness, brandChromaCeiling, backgroundLightness } = options;

  const oklchScale = {} as OklchScale;
  const hexScale = {} as ColorScale;

  // Background lightness — default to reference
  const bgL = backgroundLightness ?? DARK_REFERENCE_BG_L;

  // Step 9 lightness: same logic as light (hue-dependent)
  let step9L: number;
  let step9C: number;

  if (fixedStep9) {
    step9L = fixedStep9.l;
    step9C = fixedStep9.c;
  } else {
    let baseL = isNeutral
      ? LIGHT_STEP9_BASE_L
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
    // In adaptive dark mode, cap chroma to user's brand chroma with H-K compensation
    step9C = brandChromaCeiling !== undefined
      ? Math.min(peakChroma, brandChromaCeiling * 0.85)
      : peakChroma;
  }

  // In dark mode: hover is lighter, text steps are high-lightness
  const step10L = step9L + 0.039;
  const step11L = step9L + 0.115;

  // Steps 1-4: surface adaptation
  const surfaceL = adaptSurface(step9L, bgL, DARK_REFERENCE_BG_L, DARK_SURFACE_GAMMA, true);

  // Steps 5-12: proportional APCA contrast to actual bg
  const contrastL = computeDarkContrastSteps(bgL, step9L, step10L, step11L, DARK_STEP12_L);

  // Merge: ensure step 5 > step 4
  const finalL: Record<number, number> = { ...surfaceL, ...contrastL };
  if (finalL[5] <= finalL[4]) {
    finalL[5] = finalL[4] + 0.005;
  }

  for (const step of STEP_INDICES) {
    const l = finalL[step];
    const c = step === 9
      ? step9C
      : isNeutral
        ? neutralChromaForStep(step, peakChroma)
        : darkChromaForStep(step, peakChroma);

    const mapped = gamutMapOklch({ l, c, h: hue }, gamut);
    oklchScale[step] = mapped.oklch;
    hexScale[step] = mapped.hex;
  }

  return { oklchScale, hexScale };
}
