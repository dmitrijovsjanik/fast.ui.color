import type { HexColor, Palette, SemanticRole, StepIndex, ContrastResult, AccessibilityReport } from './types';
import { SEMANTIC_ROLES } from './types';

// --- WCAG 2.x Contrast ---

function hexToRGB(hex: HexColor): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function checkWCAGContrast(fg: HexColor, bg: HexColor): number {
  const [r1, g1, b1] = hexToRGB(fg);
  const [r2, g2, b2] = hexToRGB(bg);
  const l1 = relativeLuminance(r1, g1, b1);
  const l2 = relativeLuminance(r2, g2, b2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// --- APCA-like Contrast (simplified) ---
// Based on APCA W3 draft - simplified version using sRGB luminance
// Returns Lc value (0-106 range, negative means reversed polarity)

function sRGBtoY(hex: HexColor): number {
  const [r, g, b] = hexToRGB(hex);
  // Linearize with sRGB TRC (piecewise)
  const lin = (c: number) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  // APCA uses different coefficients than WCAG
  return 0.2126729 * lin(r) + 0.7151522 * lin(g) + 0.0721750 * lin(b);
}

export function checkAPCAContrast(text: HexColor, bg: HexColor): number {
  let txtY = sRGBtoY(text);
  let bgY = sRGBtoY(bg);

  // Soft clamp near black
  const blkThrs = 0.022;
  const blkClmp = 1.414;
  txtY = txtY > blkThrs ? txtY : txtY + Math.pow(blkThrs - txtY, blkClmp);
  bgY = bgY > blkThrs ? bgY : bgY + Math.pow(blkThrs - bgY, blkClmp);

  // APCA contrast
  const normBG = 0.56;
  const normTXT = 0.57;
  const revBG = 0.65;
  const revTXT = 0.62;
  const scaleBoW = 1.14;
  const scaleWoB = 1.14;
  const loBoWoffset = 0.027;
  const loWoBoffset = 0.027;
  const loClip = 0.1;

  let SAPC: number;
  if (bgY > txtY) {
    // Normal polarity (dark on light)
    SAPC = (Math.pow(bgY, normBG) - Math.pow(txtY, normTXT)) * scaleBoW;
    return SAPC < loClip ? 0 : (SAPC - loBoWoffset) * 100;
  } else {
    // Reverse polarity (light on dark)
    SAPC = (Math.pow(bgY, revBG) - Math.pow(txtY, revTXT)) * scaleWoB;
    return SAPC > -loClip ? 0 : (SAPC + loWoBoffset) * 100;
  }
}

// --- Palette Audit ---

// Standard contrast pairs to check (from product doc)
interface ContrastPair {
  fgStep: StepIndex;
  bgStep: StepIndex;
  label: string;
  minAPCA: number;
  minWCAG: number;
}

const STANDARD_PAIRS: ContrastPair[] = [
  // Text readability
  { fgStep: 12, bgStep: 1, label: 'High-contrast text on app bg', minAPCA: 90, minWCAG: 7.0 },
  { fgStep: 12, bgStep: 2, label: 'High-contrast text on subtle bg', minAPCA: 75, minWCAG: 4.5 },
  { fgStep: 11, bgStep: 1, label: 'Low-contrast text on app bg', minAPCA: 75, minWCAG: 4.5 },
  { fgStep: 11, bgStep: 2, label: 'Low-contrast text on subtle bg', minAPCA: 60, minWCAG: 3.0 },
  // Component visibility
  { fgStep: 3, bgStep: 1, label: 'UI element bg on app bg', minAPCA: 15, minWCAG: 1.1 },
  // Border visibility
  { fgStep: 6, bgStep: 1, label: 'Subtle border on app bg', minAPCA: 30, minWCAG: 1.5 },
  { fgStep: 7, bgStep: 1, label: 'UI border on app bg', minAPCA: 45, minWCAG: 2.0 },
  { fgStep: 8, bgStep: 1, label: 'Strong border on app bg', minAPCA: 45, minWCAG: 3.0 },
];

function auditRolePalette(
  role: SemanticRole,
  scale: Record<StepIndex, HexColor>
): ContrastResult[] {
  return STANDARD_PAIRS.map(pair => {
    const fg = scale[pair.fgStep];
    const bg = scale[pair.bgStep];
    const apca = Math.abs(checkAPCAContrast(fg, bg));
    const wcag = checkWCAGContrast(fg, bg);

    return {
      role,
      fgStep: pair.fgStep,
      bgStep: pair.bgStep,
      apca: Math.round(apca * 10) / 10,
      wcag: Math.round(wcag * 100) / 100,
      passAPCA: apca >= pair.minAPCA,
      passWCAG_AA: wcag >= pair.minWCAG,
      label: pair.label,
    };
  });
}

export function auditPalette(palette: Palette): AccessibilityReport {
  const results: ContrastResult[] = [];

  for (const role of SEMANTIC_ROLES) {
    const scale = palette[role];
    results.push(...auditRolePalette(role, scale));
  }

  const textPairs = results.filter(r =>
    r.fgStep === 11 || r.fgStep === 12
  );
  const borderPairs = results.filter(r =>
    r.fgStep === 6 || r.fgStep === 7 || r.fgStep === 8
  );

  return {
    results,
    overallPass: results.every(r => r.passAPCA && r.passWCAG_AA),
    textPairsPass: textPairs.every(r => r.passAPCA),
    borderPairsPass: borderPairs.every(r => r.passAPCA),
  };
}
