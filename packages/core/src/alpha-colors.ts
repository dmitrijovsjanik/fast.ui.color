import type { HexColor, AlphaColor, AlphaColorScale, ColorScale, StepIndex } from './types';
import { STEP_INDICES } from './types';
import { colorToRGB } from './gamut-mapper';

// Given a solid target color and a background, find the semi-transparent
// RGBA that composites to the same visual result over that background.
// Uses minimum-alpha approach: maximize overlay color channels to minimize alpha.
export function computeAlphaColor(
  solidHex: HexColor,
  backgroundHex: HexColor
): AlphaColor {
  const [sr, sg, sb] = colorToRGB(solidHex);
  const [br, bg, bb] = colorToRGB(backgroundHex);

  // If solid === background, fully transparent
  if (sr === br && sg === bg && sb === bb) {
    return { r: 0, g: 0, b: 0, a: 0, css: 'rgba(0, 0, 0, 0)' };
  }

  // For each channel, find the minimum alpha needed.
  // If S > B: push C to 255, a = (S - B) / (255 - B)
  // If S < B: push C to 0, a = (B - S) / B
  // If S == B: a = 0 for this channel
  const channels: [number, number][] = [[sr, br], [sg, bg], [sb, bb]];
  const alphas = channels.map(([s, b]) => {
    if (s === b) return 0;
    if (s > b) return b === 255 ? 1 : (s - b) / (255 - b);
    return b === 0 ? 1 : (b - s) / b;
  });

  let a = Math.max(...alphas);
  a = Math.min(1, Math.max(1 / 255, a));

  // Round to 3 decimal places
  a = Math.round(a * 1000) / 1000;

  // Back-solve overlay color: C = (S - B * (1 - a)) / a
  const cr = Math.round(Math.min(255, Math.max(0, (sr - br * (1 - a)) / a)));
  const cg = Math.round(Math.min(255, Math.max(0, (sg - bg * (1 - a)) / a)));
  const cb = Math.round(Math.min(255, Math.max(0, (sb - bb * (1 - a)) / a)));

  return {
    r: cr,
    g: cg,
    b: cb,
    a,
    css: `rgba(${cr}, ${cg}, ${cb}, ${a})`,
  };
}

// Compute alpha equivalents for an entire 12-step scale
export function computeAlphaScale(
  solidScale: ColorScale,
  backgroundHex: HexColor
): AlphaColorScale {
  const result = {} as AlphaColorScale;
  for (const step of STEP_INDICES) {
    result[step] = computeAlphaColor(solidScale[step], backgroundHex);
  }
  return result;
}
