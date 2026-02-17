import type {
  GenerationConfig,
  GenerationResult,
  Palette,
  OklchPalette,
  AlphaPalette,
} from './types';
import { SEMANTIC_ROLES } from './types';
import { hexToOklch } from './gamut-mapper';
import { resolveSemanticHues } from './semantic-resolver';
import { resolveChromaStrategy } from './chroma-strategy';
import { generateLightThemeScale, generateDarkThemeScale } from './scale-generator';
import { auditPalette } from './contrast-checker';
import { computeAlphaScale } from './alpha-colors';

export function generatePalette(config: GenerationConfig): GenerationResult {
  // 1. Parse brand color
  const brandOklch = hexToOklch(config.brandColor);

  // 2. Resolve semantic hues
  const hues = resolveSemanticHues(brandOklch.h, config.neutralStyle);

  // 3. Resolve chroma strategy
  const chromas = resolveChromaStrategy(config, brandOklch, hues, config.gamut);

  // 4. Select scale generator based on theme
  const isDark = config.theme === 'dark';
  const generateScale = isDark
    ? generateDarkThemeScale
    : generateLightThemeScale;

  // Compute background lightness for offset-based scale (both themes)
  const bgL = config.backgroundColor
    ? hexToOklch(config.backgroundColor).l
    : undefined;

  // 5. Generate scales for each role
  const palette = {} as Palette;
  const oklchPalette = {} as OklchPalette;

  // First, compute the brand scale to know its step 9 L
  const brandScale = generateScale({
    hue: hues.brand,
    peakChroma: chromas.brand,
    gamut: config.gamut,
    fixedStep9: config.brandMode === 'fixed' ? brandOklch : undefined,
    isNeutral: false,
    backgroundLightness: bgL,
    lightnessMapping: config.lightnessMapping,
  });
  const brandStep9L = brandScale.oklchScale[9].l;

  for (const role of SEMANTIC_ROLES) {
    const isBrand = role === 'brand';
    const isNeutral = role === 'neutral';

    if (isBrand) {
      palette[role] = brandScale.hexScale;
      oklchPalette[role] = brandScale.oklchScale;
      continue;
    }

    const { oklchScale, hexScale } = generateScale({
      hue: hues[role],
      peakChroma: chromas[role],
      gamut: config.gamut,
      isNeutral,
      brandLightness: isNeutral ? undefined : brandStep9L,
      backgroundLightness: bgL,
      lightnessMapping: config.lightnessMapping,
    });

    palette[role] = hexScale;
    oklchPalette[role] = oklchScale;
  }

  // 6. Compute alpha palette if background color specified
  let alphaPalette: AlphaPalette | undefined;
  if (config.backgroundColor) {
    alphaPalette = {} as AlphaPalette;
    for (const role of SEMANTIC_ROLES) {
      alphaPalette[role] = computeAlphaScale(palette[role], config.backgroundColor);
    }
  }

  // 7. Audit accessibility
  const accessibility = auditPalette(palette);

  return {
    palette,
    oklchPalette,
    ...(alphaPalette ? { alphaPalette } : {}),
    semanticHues: hues,
    accessibility,
    config,
  };
}

// Re-export everything
export * from './types';
export * from './gamut-mapper';
export * from './semantic-resolver';
export * from './scale-generator';
export * from './chroma-strategy';
export * from './contrast-checker';
export * from './alpha-colors';
export * from './export';
