import { ColorPalette, ColorScale } from './palette';

// Функция для создания семантической палитры (больше оттенков)
export function createSemanticPalette(baseColors: ColorPalette): ColorPalette {
  const semanticPalette: ColorPalette = {} as ColorPalette;
  
  Object.entries(baseColors).forEach(([colorName, colorScale]) => {
    const semanticScale: ColorScale = {} as ColorScale;
    
    // Семантическая палитра использует все 12 оттенков с более тонкими переходами
    Object.entries(colorScale).forEach(([scale, color]) => {
      semanticScale[scale as keyof ColorScale] = color;
    });
    
    semanticPalette[colorName as keyof ColorPalette] = semanticScale;
  });
  
  return semanticPalette;
}

// Функция для создания линейной палитры (меньше оттенков)
export function createLinearPalette(baseColors: ColorPalette): ColorPalette {
  const linearPalette: ColorPalette = {} as ColorPalette;
  
  Object.entries(baseColors).forEach(([colorName, colorScale]) => {
    const linearScale: ColorScale = {} as ColorScale;
    
    // Линейная палитра использует только ключевые оттенки
    const keyScales = [1, 3, 5, 6, 7, 9, 11, 12];
    
    keyScales.forEach((scale, index) => {
      const targetScale = index + 1;
      linearScale[targetScale as keyof ColorScale] = colorScale[scale as keyof ColorScale];
    });
    
    // Заполняем промежуточные оттенки интерполяцией
    for (let i = 1; i <= 12; i++) {
      if (!linearScale[i as keyof ColorScale]) {
        // Находим ближайшие ключевые оттенки для интерполяции
        const prevScale = keyScales.find(s => s >= i) || 1;
        const nextScale = keyScales.find(s => s > i) || 12;
        
        const prevColor = colorScale[prevScale as keyof ColorScale];
        const nextColor = colorScale[nextScale as keyof ColorScale];
        
        // Простая интерполяция между цветами
        const ratio = (i - prevScale) / (nextScale - prevScale);
        linearScale[i as keyof ColorScale] = interpolateColor(prevColor, nextColor, ratio);
      }
    }
    
    linearPalette[colorName as keyof ColorPalette] = linearScale;
  });
  
  return linearPalette;
}

// Функция для интерполяции между двумя цветами
function interpolateColor(color1: string, color2: string, ratio: number): string {
  // Простая интерполяция HSL цветов
  const hsl1 = parseHSL(color1);
  const hsl2 = parseHSL(color2);
  
  if (!hsl1 || !hsl2) return color1;
  
  const h = hsl1.h + (hsl2.h - hsl1.h) * ratio;
  const s = hsl1.s + (hsl2.s - hsl1.s) * ratio;
  const l = hsl1.l + (hsl2.l - hsl1.l) * ratio;
  
  return `hsl(${h} ${s}% ${l}%)`;
}

// Функция для парсинга HSL цвета
function parseHSL(color: string): { h: number; s: number; l: number } | null {
  const match = color.match(/hsl\(([^)]+)\)/);
  if (!match) return null;
  
  const parts = match[1].split(' ').filter(Boolean);
  if (parts.length !== 3) return null;
  
  const h = parseFloat(parts[0]);
  const s = parseFloat(parts[1]);
  const l = parseFloat(parts[2]);
  
  return { h, s, l };
}

// Функция для получения палитры по режиму
export function getPaletteByMode(baseColors: ColorPalette, mode: 'semantic' | 'linear'): ColorPalette {
  switch (mode) {
    case 'semantic':
      return createSemanticPalette(baseColors);
    case 'linear':
      return createLinearPalette(baseColors);
    default:
      return baseColors;
  }
}
