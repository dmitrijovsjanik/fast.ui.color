import type { Palette, AlphaPalette, NamingConfig } from '../types';
import { SEMANTIC_ROLES, STEP_INDICES, resolveTokenName } from '../types';

export interface SVGExportInput {
  light: { palette: Palette; alphaPalette?: AlphaPalette };
  dark: { palette: Palette; alphaPalette?: AlphaPalette };
  naming: NamingConfig;
}

// Layout constants
const SWATCH_W = 48;
const SWATCH_H = 48;
const GAP = 2;
const LABEL_H = 14;
const ROLE_LABEL_W = 70;
const STEP_HEADER_H = 20;
const SECTION_TITLE_H = 24;
const SECTION_GAP = 32;
const PADDING = 16;

const CELL_W = SWATCH_W + GAP;
const CELL_H = SWATCH_H + LABEL_H + GAP;
const GRID_W = ROLE_LABEL_W + 12 * CELL_W;
const GRID_H = SECTION_TITLE_H + STEP_HEADER_H + 6 * CELL_H;

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

interface SectionDef {
  theme: 'light' | 'dark';
  mode: 'solid' | 'alpha';
  palette: Palette;
  alphaPalette?: AlphaPalette;
  offsetX: number;
  offsetY: number;
}

function renderSection(lines: string[], section: SectionDef, naming: NamingConfig): void {
  const { theme, mode, palette, alphaPalette, offsetX, offsetY } = section;
  const isAlpha = mode === 'alpha';
  const bgColor = theme === 'light' ? '#ffffff' : '#111113';

  lines.push(`<g transform="translate(${offsetX}, ${offsetY})">`);

  // Section title
  lines.push(`<text x="0" y="16" font-family="Inter, system-ui, sans-serif" font-size="13" font-weight="600" fill="#666">${theme.toUpperCase()} / ${mode.toUpperCase()}</text>`);

  const gridY = SECTION_TITLE_H;

  // Step number headers
  for (let i = 0; i < 12; i++) {
    const step = STEP_INDICES[i];
    const x = ROLE_LABEL_W + i * CELL_W + SWATCH_W / 2;
    lines.push(`<text x="${x}" y="${gridY + 14}" font-family="Inter, system-ui, sans-serif" font-size="10" fill="#999" text-anchor="middle">${step}</text>`);
  }

  const rowsY = gridY + STEP_HEADER_H;

  // Background rect for alpha section (so alpha composites visually correctly)
  if (isAlpha) {
    lines.push(`<rect x="${ROLE_LABEL_W}" y="${rowsY}" width="${12 * CELL_W}" height="${6 * CELL_H}" fill="${bgColor}" rx="4" />`);
  }

  // Rows
  for (let r = 0; r < SEMANTIC_ROLES.length; r++) {
    const role = SEMANTIC_ROLES[r];
    const ry = rowsY + r * CELL_H;

    // Role label
    lines.push(`<text x="0" y="${ry + SWATCH_H / 2 + 4}" font-family="Inter, system-ui, sans-serif" font-size="11" fill="#666">${naming.roleNames[role]}</text>`);

    // Swatches
    for (let c = 0; c < 12; c++) {
      const step = STEP_INDICES[c];
      const sx = ROLE_LABEL_W + c * CELL_W;
      const sy = ry;

      if (isAlpha && alphaPalette) {
        const alpha = alphaPalette[role][step];
        lines.push(`<rect x="${sx}" y="${sy}" width="${SWATCH_W}" height="${SWATCH_H}" rx="3" fill="rgb(${alpha.r},${alpha.g},${alpha.b})" fill-opacity="${alpha.a}" />`);
      } else {
        const hex = palette[role][step];
        lines.push(`<rect x="${sx}" y="${sy}" width="${SWATCH_W}" height="${SWATCH_H}" rx="3" fill="${hex}" />`);
      }

      // Name label
      const name = resolveTokenName(naming, theme, role, mode, step);
      const labelX = sx + SWATCH_W / 2;
      const labelY = sy + SWATCH_H + 10;
      lines.push(`<text x="${labelX}" y="${labelY}" font-family="monospace" font-size="6" fill="#999" text-anchor="middle">${escapeXml(name)}</text>`);
    }
  }

  lines.push('</g>');
}

export function exportSVG(input: SVGExportInput): string {
  const totalW = PADDING + GRID_W + SECTION_GAP + GRID_W + PADDING;
  const totalH = PADDING + GRID_H + SECTION_GAP + GRID_H + PADDING;

  const leftX = PADDING;
  const rightX = PADDING + GRID_W + SECTION_GAP;
  const topY = PADDING;
  const bottomY = PADDING + GRID_H + SECTION_GAP;

  const sections: SectionDef[] = [
    { theme: 'light', mode: 'solid', palette: input.light.palette, alphaPalette: input.light.alphaPalette, offsetX: leftX, offsetY: topY },
    { theme: 'light', mode: 'alpha', palette: input.light.palette, alphaPalette: input.light.alphaPalette, offsetX: rightX, offsetY: topY },
    { theme: 'dark', mode: 'solid', palette: input.dark.palette, alphaPalette: input.dark.alphaPalette, offsetX: leftX, offsetY: bottomY },
    { theme: 'dark', mode: 'alpha', palette: input.dark.palette, alphaPalette: input.dark.alphaPalette, offsetX: rightX, offsetY: bottomY },
  ];

  const lines: string[] = [];
  lines.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}">`);
  lines.push(`<rect width="${totalW}" height="${totalH}" fill="#f5f5f5" rx="8" />`);

  for (const section of sections) {
    renderSection(lines, section, input.naming);
  }

  lines.push('</svg>');
  return lines.join('\n');
}
