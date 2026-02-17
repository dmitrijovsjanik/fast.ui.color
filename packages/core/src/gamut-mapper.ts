import type { OklchColor, HexColor } from './types';
import { converter } from 'culori';

// --- Low-level math ---

function inGamut01(r: number, g: number, b: number): boolean {
  const eps = 1e-6;
  return r >= -eps && r <= 1 + eps &&
         g >= -eps && g <= 1 + eps &&
         b >= -eps && b <= 1 + eps;
}

function linToSRGB(x: number): number {
  return x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(Math.max(0, x), 1 / 2.4) - 0.055;
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

function rgbToHex(r: number, g: number, b: number): HexColor {
  const R = Math.round(r * 255);
  const G = Math.round(g * 255);
  const B = Math.round(b * 255);
  return '#' + [R, G, B].map(v => v.toString(16).padStart(2, '0')).join('');
}

// OKLCH -> linear sRGB (direct math, no library needed)
function oklchToLinearRGB(L: number, C: number, hDeg: number): [number, number, number] {
  const h = (hDeg * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);

  const L_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const M_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const S_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const L3 = L_ * L_ * L_;
  const M3 = M_ * M_ * M_;
  const S3 = S_ * S_ * S_;

  const r = +4.0767416621 * L3 - 3.3077115913 * M3 + 0.2309699292 * S3;
  const g = -1.2684380046 * L3 + 2.6097574011 * M3 - 0.3413193965 * S3;
  const bl = -0.0041960863 * L3 - 0.7034186147 * M3 + 1.7076147010 * S3;

  return [r, g, bl];
}

// Convert OKLCH to HEX. Returns null if out of sRGB gamut.
export function oklchToHex(l: number, c: number, hDeg: number): HexColor | null {
  const [r, g, b] = oklchToLinearRGB(l, c, hDeg);
  if (!inGamut01(r, g, b)) return null;

  const sr = linToSRGB(r);
  const sg = linToSRGB(g);
  const sb = linToSRGB(b);

  if (!isFinite(sr) || !isFinite(sg) || !isFinite(sb)) return null;

  return rgbToHex(clamp01(sr), clamp01(sg), clamp01(sb));
}

// Convert OKLCH to HEX with gamut mapping (binary search chroma reduction).
// Always returns a valid hex color.
export function oklchToHexClamped(l: number, c: number, hDeg: number): HexColor {
  let hex = oklchToHex(l, c, hDeg);
  if (hex) return hex;

  // Binary search: reduce chroma to fit sRGB
  let lo = 0, hi = c;
  let attempts = 18;
  while (attempts-- > 0) {
    const mid = (lo + hi) / 2;
    const candidate = oklchToHex(l, mid, hDeg);
    if (candidate) {
      hex = candidate;
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return hex || oklchToHex(l, 0, hDeg) || '#000000';
}

// Check if an OKLCH color is within the specified gamut
export function isInGamut(color: OklchColor, gamut: 'sRGB' | 'P3' = 'sRGB'): boolean {
  // For MVP, only sRGB is supported
  const [r, g, b] = oklchToLinearRGB(color.l, color.c, color.h);
  return inGamut01(r, g, b);
}

// Gamut map an OKLCH color: reduce chroma to fit gamut, return both OKLCH and HEX
export function gamutMapOklch(
  color: OklchColor,
  gamut: 'sRGB' | 'P3' = 'sRGB'
): { oklch: OklchColor; hex: HexColor } {
  const hex = oklchToHexClamped(color.l, color.c, color.h);

  // Find the actual chroma that was used (may be reduced)
  if (isInGamut(color, gamut)) {
    return { oklch: { ...color }, hex };
  }

  // Binary search for max chroma at this L, H
  let lo = 0, hi = color.c;
  let bestC = 0;
  let attempts = 18;
  while (attempts-- > 0) {
    const mid = (lo + hi) / 2;
    const [r, g, b] = oklchToLinearRGB(color.l, mid, color.h);
    if (inGamut01(r, g, b)) {
      bestC = mid;
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return {
    oklch: { l: color.l, c: bestC, h: color.h },
    hex,
  };
}

// Find the maximum chroma for a given lightness and hue within the gamut.
// This is critical for the equal-chroma strategy.
export function maxChromaForLH(l: number, h: number, gamut: 'sRGB' | 'P3' = 'sRGB'): number {
  let lo = 0, hi = 0.4; // OKLCH chroma max ~0.4
  let bestC = 0;
  let attempts = 20;

  while (attempts-- > 0) {
    const mid = (lo + hi) / 2;
    const [r, g, b] = oklchToLinearRGB(l, mid, h);
    if (inGamut01(r, g, b)) {
      bestC = mid;
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return bestC;
}

// Parse HEX to OKLCH using culori (for input conversion)
const toOklch = converter('oklch');

export function hexToOklch(hex: HexColor): OklchColor {
  const result = toOklch(hex);
  if (!result) throw new Error(`Invalid color: ${hex}`);
  return {
    l: result.l ?? 0,
    c: result.c ?? 0,
    h: result.h ?? 0,
  };
}
