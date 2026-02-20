import type { Palette, AlphaPalette, OklchPalette, NamingConfig, SemanticRole } from '../types';
import { SEMANTIC_ROLES, STEP_INDICES } from '../types';

export interface DTCGExportInput {
  light: { palette: Palette; oklchPalette: OklchPalette; alphaPalette?: AlphaPalette };
  dark: { palette: Palette; oklchPalette: OklchPalette; alphaPalette?: AlphaPalette };
  naming: NamingConfig;
  excludeRoles?: SemanticRole[];
}

function hexToComponents(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [round(r), round(g), round(b)];
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}

export function exportDTCG(input: DTCGExportInput): string {
  const { naming, excludeRoles } = input;
  const roles = excludeRoles
    ? SEMANTIC_ROLES.filter(r => !excludeRoles.includes(r))
    : SEMANTIC_ROLES;
  const tokens: Record<string, unknown> = {};

  for (const theme of ['light', 'dark'] as const) {
    const data = input[theme];
    const themeName = naming.themeNames[theme];

    tokens[themeName] = {
      $description: `${themeName} theme color tokens`,
    };

    for (const role of roles) {
      const roleName = naming.roleNames[role];
      const solidName = naming.modeNames.solid;
      const alphaName = naming.modeNames.alpha;

      const solidGroup: Record<string, unknown> = {
        $type: 'color',
      };

      for (const step of STEP_INDICES) {
        const hex = data.palette[role][step];
        const oklch = data.oklchPalette[role][step];
        const [r, g, b] = hexToComponents(hex);

        solidGroup[String(step)] = {
          $value: {
            colorSpace: 'srgb',
            components: [r, g, b],
            hex,
          },
          $extensions: {
            'com.fast-ui': {
              oklch: {
                l: round(oklch.l),
                c: round(oklch.c),
                h: round(oklch.h),
              },
            },
          },
        };
      }

      (tokens[themeName] as Record<string, unknown>)[roleName] = {
        [solidName]: solidGroup,
      };

      if (data.alphaPalette) {
        const alphaGroup: Record<string, unknown> = {
          $type: 'color',
        };

        for (const step of STEP_INDICES) {
          const alpha = data.alphaPalette[role][step];
          alphaGroup[String(step)] = {
            $value: {
              colorSpace: 'srgb',
              components: [round(alpha.r / 255), round(alpha.g / 255), round(alpha.b / 255)],
              alpha: round(alpha.a),
            },
          };
        }

        ((tokens[themeName] as Record<string, unknown>)[roleName] as Record<string, unknown>)[alphaName] = alphaGroup;
      }
    }
  }

  return JSON.stringify(tokens, null, 2);
}
