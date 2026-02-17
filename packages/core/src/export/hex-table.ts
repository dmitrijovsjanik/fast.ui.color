import type { Palette } from '../types';
import { SEMANTIC_ROLES, STEP_INDICES } from '../types';

export function exportHexTable(palette: Palette): string {
  const header = ['Role', ...STEP_INDICES.map(s => `Step ${s}`)].join('\t');
  const rows = SEMANTIC_ROLES.map(role => {
    const colors = STEP_INDICES.map(step => palette[role][step]);
    return [role, ...colors].join('\t');
  });

  return [header, ...rows].join('\n');
}
