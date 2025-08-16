import { generateCuloriPalette, generateSemanticPalette as generateCuloriSemanticPalette } from './culoriPalette';
import { converter, formatHex } from 'culori';

// Генерация палитры оттенков для Linear режима (11 оттенков)
export function generateTailwindPalette(baseColor: string): string[] {
  return generateCuloriPalette(baseColor);
}

// Генерация палитры оттенков для Semantic режима (12 оттенков)
export function generateSemanticPalette(baseColor: string): string[] {
  // Для Semantic режима добавляем дополнительный оттенок
  const linearPalette = generateCuloriSemanticPalette(baseColor);
  
  // Добавляем промежуточный оттенок между 400 и 500
  const additionalShade = generateIntermediateShade(baseColor, 0.70); // между 400 и 500
  
  return [
    linearPalette[0],  // 50
    linearPalette[1],  // 100
    linearPalette[2],  // 200
    linearPalette[3],  // 300
    linearPalette[4],  // 400
    additionalShade,   // дополнительный оттенок
    linearPalette[5],  // 500
    linearPalette[6],  // 600
    linearPalette[7],  // 700
    linearPalette[8],  // 800
    linearPalette[9],  // 900
    linearPalette[10]  // 950
  ];
}

// Функция для генерации промежуточного оттенка
function generateIntermediateShade(baseColor: string, lightness: number): string {
  const toOKLCH = converter('oklch') as (c:any) => { l:number; c:number; h:number };
  const base = toOKLCH(baseColor) || { l:0.5, c:0.08, h:0 };
  
  return formatHex({ 
    mode: 'oklch', 
    l: lightness, 
    c: Math.max(0.01, base.c ?? 0.08), 
    h: base.h ?? 0 
  });
}

// Основная функция генерации палитры (обновленная)
export function generatePaletteFromColor(baseColor: string, _count: number, scale: string): string[] {
  if (scale === 'Linear') {
    return generateTailwindPalette(baseColor);
  } else {
    return generateSemanticPalette(baseColor);
  }
}

// Функция для генерации названий цветов (оставляем как есть)
export function generateColorNames(type: string, count: number): string[] {
  const names: string[] = [];
  
  if (type === 'brand') {
    for (let i = 0; i < count; i++) {
      names.push(`Brand ${i + 1}`);
    }
  } else if (type === 'accent') {
    for (let i = 0; i < count; i++) {
      names.push(`Accent ${i + 1}`);
    }
  } else {
    for (let i = 0; i < count; i++) {
      names.push(`${type.charAt(0).toUpperCase() + type.slice(1)} ${i + 1}`);
    }
  }
  
  return names;
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
