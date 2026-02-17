import type { Palette, AlphaPalette } from '../types';
import { SEMANTIC_ROLES, STEP_INDICES } from '../types';

export function exportJSON(palette: Palette, alphaPalette?: AlphaPalette): string {
  const output: Record<string, Record<string, string>> = {};

  for (const role of SEMANTIC_ROLES) {
    output[role] = {};
    for (const step of STEP_INDICES) {
      output[role][String(step)] = palette[role][step];
    }
    if (alphaPalette) {
      for (const step of STEP_INDICES) {
        output[role][`a${step}`] = alphaPalette[role][step].css;
      }
    }
  }

  return JSON.stringify(output, null, 2);
}
