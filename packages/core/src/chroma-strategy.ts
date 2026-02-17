import type { GenerationConfig, OklchColor, SemanticHues, SemanticRole } from './types';
import { maxChromaForLH } from './gamut-mapper';
import { computeStep9Lightness } from './scale-generator';

// Estimate the actual step 9 lightness for a semantic role,
// accounting for: (1) per-hue optimal L (bright hues like teal/amber get boosted)
// and (2) brand lightness shift (semantics blend 35% toward brand L).
function estimateSemanticStep9L(
  hue: number,
  brandStep9L: number,
  gamut: 'sRGB' | 'P3'
): number {
  let baseL = computeStep9Lightness(hue, gamut);

  const blendFactor = 0.35;
  baseL = baseL + (brandStep9L - baseL) * blendFactor;
  return Math.max(0.45, Math.min(0.90, baseL));
}

// Resolve peak chroma for each semantic role based on config
export function resolveChromaStrategy(
  config: GenerationConfig,
  brandOklch: OklchColor,
  hues: SemanticHues,
  gamut: 'sRGB' | 'P3',
  secondaryOklch?: OklchColor,
): Record<SemanticRole, number> {
  const { brandMode, chromaEqualization, neutralStyle } = config;
  const isSecondaryCustom = config.secondary?.mode === 'custom' && secondaryOklch;

  const neutralChroma = neutralStyle === 'tinted' ? 0.011 : 0;

  // Brand step 9 L depends on brandMode:
  // fixed = exact user input L, auto = computed algorithmically
  const brandStep9L = brandMode === 'fixed'
    ? brandOklch.l
    : computeStep9Lightness(hues.brand, gamut);

  // Per-role step 9 L (hue-aware + brand-blended)
  const roleLightness: Record<Exclude<SemanticRole, 'neutral'>, number> = {
    brand: brandStep9L,
    secondary: isSecondaryCustom
      ? secondaryOklch.l
      : estimateSemanticStep9L(hues.secondary, brandStep9L, gamut),
    success: estimateSemanticStep9L(hues.success, brandStep9L, gamut),
    warning: estimateSemanticStep9L(hues.warning, brandStep9L, gamut),
    danger: estimateSemanticStep9L(hues.danger, brandStep9L, gamut),
    info: estimateSemanticStep9L(hues.info, brandStep9L, gamut),
  };

  // Compute max chroma for each role at its lightness
  const maxChromas: Record<Exclude<SemanticRole, 'neutral'>, number> = {
    brand: brandMode === 'fixed' ? brandOklch.c : maxChromaForLH(brandStep9L, hues.brand, gamut),
    secondary: isSecondaryCustom
      ? secondaryOklch.c
      : maxChromaForLH(roleLightness.secondary, hues.secondary, gamut),
    success: maxChromaForLH(roleLightness.success, hues.success, gamut),
    warning: maxChromaForLH(roleLightness.warning, hues.warning, gamut),
    danger: maxChromaForLH(roleLightness.danger, hues.danger, gamut),
    info: maxChromaForLH(roleLightness.info, hues.info, gamut),
  };

  // Apply equalization if requested
  if (chromaEqualization === 'equal') {
    const allValues = Object.values(maxChromas);
    const minChroma = Math.min(...allValues);
    return {
      brand: minChroma,
      secondary: minChroma,
      success: minChroma,
      warning: minChroma,
      danger: minChroma,
      info: minChroma,
      neutral: neutralChroma,
    };
  }

  // Independent — each role gets its own max chroma
  return {
    brand: maxChromas.brand,
    secondary: maxChromas.secondary,
    success: maxChromas.success,
    warning: maxChromas.warning,
    danger: maxChromas.danger,
    info: maxChromas.info,
    neutral: neutralChroma,
  };
}
