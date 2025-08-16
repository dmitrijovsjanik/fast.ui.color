import { generateCuloriPalette } from './culoriPalette';
import { CurveSettings } from '../types/curveEditor';

// Генерация Tailwind-подобной палитры (Linear)
export function generateTailwindPalette(
  baseColor: string, 
  _count: number = 11,
  opts?: {
    lightnessCurve?: CurveSettings;
    chromaCurve?: CurveSettings;
  }
): string[] {
  return generateCuloriPalette(baseColor, opts);
}

// Генерация семантической палитры
export function generateSemanticPalette(
  baseColor: string, 
  opts?: {
    lightnessCurve?: CurveSettings;
    chromaCurve?: CurveSettings;
  }
): string[] {
  return generateCuloriPalette(baseColor, { ...opts, selectedScale: 'Semantic' });
}

// Генерация палитры на основе цвета и режима
export function generatePaletteFromColor(
  color: string, 
  count: number, 
  mode: 'Linear' | 'Semantic',
  lightnessCurve?: CurveSettings,
  chromaCurve?: CurveSettings
): string[] {
  if (mode === 'Linear') {
    return generateTailwindPalette(color, count, { lightnessCurve, chromaCurve });
  } else {
    return generateSemanticPalette(color, { lightnessCurve, chromaCurve });
  }
}

// Генерация названий цветов
export function generateColorNames(palette: string[]): string[] {
  const names = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
  
  if (palette.length === 12) {
    // Для семантической палитры добавляем промежуточный шаг
    names.splice(4, 0, '450');
  }
  
  return names.slice(0, palette.length);
}

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};
