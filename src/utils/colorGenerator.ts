import { converter } from 'culori';

// =======================
// ТИПЫ И ИНТЕРФЕЙСЫ
// =======================

export type LightnessValue = number; // 0-1 (OKLCH L)
export type ChromaValue = number; // 0-0.4 (OKLCH C)
export type HueValue = number; // 0-360 (OKLCH H)
export type ColorType = 'brand' | 'accent' | 'info' | 'success' | 'error' | 'warning' | 'neutral';

export interface ColorStep {
  step: number;
  lightness: LightnessValue;
  chroma: ChromaValue;
  hex: string;
  contrast: number; // WCAG contrast ratio
}

export interface ColorPalette {
  baseColor: string;
  steps: ColorStep[];
  type: ColorType;
  accessibility: {
    wcagAA: boolean;
    wcagAAA: boolean;
    minContrast: number;
    maxContrast: number;
  };
}

export interface PaletteOptions {
  baseColor: string;
  type: ColorType;
  steps: number;
  targetContrast?: number;
  ensureAccessibility?: boolean;
}

// =======================
// КОНСТАНТЫ ДОСТУПНОСТИ
// =======================

export const WCAG_LEVELS = {
  AA: {
    normal: 4.5,
    large: 3.0
  },
  AAA: {
    normal: 7.0,
    large: 4.5
  }
} as const;

// =======================
// УТИЛИТЫ ДЛЯ РАБОТЫ С ЦВЕТАМИ
// =======================

/**
 * Конвертирует цвет в OKLCH формат
 */
export function colorToOklch(color: string) {
  return converter('oklch')(color);
}

/**
 * Конвертирует OKLCH в HEX
 */
export function oklchToHex(l: number, c: number, h: number): string {
  const oklchString = `oklch(${(l * 100).toFixed(1)}% ${c} ${h})`;
  return converter('hex')(oklchString);
}

/**
 * Вычисляет контраст между двумя цветами (WCAG)
 */
export function calculateContrast(color1: string, color2: string): number {
  try {
    // Конвертируем в RGB
    const rgb1 = converter('rgb')(color1);
    const rgb2 = converter('rgb')(color2);
    
    if (!rgb1 || !rgb2) return 1;
    
    // Вычисляем относительную яркость
    const luminance1 = calculateRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
    const luminance2 = calculateRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);
    
    // Вычисляем контраст
    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);
    
    return (lighter + 0.05) / (darker + 0.05);
  } catch (error) {
    console.warn('Ошибка вычисления контраста:', error);
    return 1;
  }
}

/**
 * Вычисляет относительную яркость (WCAG формула)
 */
function calculateRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// =======================
// ГЕНЕРАЦИЯ РАВНОМЕРНЫХ КРИВЫХ
// =======================

/**
 * Генерирует равномерную кривую светлоты (OKLCH L)
 * Использует перцептивно равномерное распределение
 */
export function generateUniformLightnessCurve(
  minLightness: number = 0.05,
  maxLightness: number = 0.95,
  steps: number = 11
): LightnessValue[] {
  const values: LightnessValue[] = [];
  
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    
    // Используем кубическую кривую для более естественного восприятия
    // Это дает более равномерные визуальные переходы
    const cubicT = 3 * Math.pow(t, 2) - 2 * Math.pow(t, 3);
    
    const lightness = minLightness + (maxLightness - minLightness) * cubicT;
    values.push(Math.max(0, Math.min(1, lightness)));
  }
  
  return values;
}

/**
 * Генерирует кривую хроматики с учетом светлоты
 * Уменьшает насыщенность для очень светлых и темных оттенков
 */
export function generateChromaCurve(
  lightnessValues: LightnessValue[],
  type: ColorType
): ChromaValue[] {
  const chromaValues: ChromaValue[] = [];
  
  // Настройки хроматики для разных типов цветов
  const chromaConfig = {
    brand: { max: 0.25, min: 0.05 },
    accent: { max: 0.30, min: 0.08 },
    info: { max: 0.20, min: 0.03 },
    success: { max: 0.22, min: 0.05 },
    error: { max: 0.25, min: 0.08 },
    warning: { max: 0.28, min: 0.06 },
    neutral: { max: 0.05, min: 0.01 }
  };
  
  const config = chromaConfig[type];
  
  for (let i = 0; i < lightnessValues.length; i++) {
    const lightness = lightnessValues[i];
    
    // Уменьшаем хроматику для очень светлых и темных оттенков
    let chromaMultiplier = 1;
    
    if (lightness > 0.9 || lightness < 0.1) {
      chromaMultiplier = 0.3; // Сильное уменьшение
    } else if (lightness > 0.8 || lightness < 0.2) {
      chromaMultiplier = 0.6; // Умеренное уменьшение
    } else if (lightness > 0.7 || lightness < 0.3) {
      chromaMultiplier = 0.8; // Легкое уменьшение
    }
    
    // Параболическая кривая для хроматики (максимум в центре)
    const t = i / (lightnessValues.length - 1);
    const parabolicT = 4 * t * (1 - t);
    
    const chroma = (config.min + (config.max - config.min) * parabolicT) * chromaMultiplier;
    chromaValues.push(Math.max(0, Math.min(0.4, chroma)));
  }
  
  return chromaValues;
}

// =======================
// ОСНОВНАЯ ФУНКЦИЯ ГЕНЕРАЦИИ ПАЛИТРЫ
// =======================

/**
 * Генерирует полную цветовую палитру с проверкой доступности
 */
export function generateColorPalette(options: PaletteOptions): ColorPalette {
  const { baseColor, type, steps, targetContrast = 4.5, ensureAccessibility = true } = options;
  
  // Получаем оттенок из базового цвета
  const oklchColor = colorToOklch(baseColor);
  const hue = (oklchColor?.h ?? 0) % 360;
  
  // Генерируем равномерную кривую светлоты
  const lightnessValues = generateUniformLightnessCurve(0.05, 0.95, steps);
  
  // Генерируем кривую хроматики
  const chromaValues = generateChromaCurve(lightnessValues, type);
  
  // Создаем шаги палитры
  const colorSteps: ColorStep[] = [];
  const background = '#ffffff'; // Белый фон для проверки контраста
  
  for (let i = 0; i < steps; i++) {
    const lightness = lightnessValues[i];
    const chroma = chromaValues[i];
    
    // Создаем цвет
    const hex = oklchToHex(lightness, chroma, hue);
    
    // Вычисляем контраст с белым фоном
    const contrast = calculateContrast(hex, background);
    
    colorSteps.push({
      step: i + 1,
      lightness,
      chroma,
      hex,
      contrast
    });
  }
  
  // Проверяем доступность
  const contrasts = colorSteps.map(step => step.contrast);
  const minContrast = Math.min(...contrasts);
  const maxContrast = Math.max(...contrasts);
  
  const accessibility = {
    wcagAA: minContrast >= WCAG_LEVELS.AA.normal,
    wcagAAA: minContrast >= WCAG_LEVELS.AAA.normal,
    minContrast,
    maxContrast
  };
  
  // Если требуется обеспечить доступность, корректируем цвета
  if (ensureAccessibility && !accessibility.wcagAA) {
    return adjustPaletteForAccessibility(colorSteps, hue, type, targetContrast);
  }
  
  return {
    baseColor,
    steps: colorSteps,
    type,
    accessibility
  };
}

/**
 * Корректирует палитру для обеспечения доступности
 */
function adjustPaletteForAccessibility(
  steps: ColorStep[],
  hue: number,
  type: ColorType,
  targetContrast: number
): ColorPalette {
  const adjustedSteps: ColorStep[] = [];
  const background = '#ffffff';
  
  for (const step of steps) {
    let { lightness, chroma } = step;
    let hex = step.hex;
    let contrast = step.contrast;
    
    // Если контраст недостаточный, увеличиваем хроматику
    if (contrast < targetContrast && chroma < 0.4) {
      chroma = Math.min(0.4, chroma * 1.5);
      hex = oklchToHex(lightness, chroma, hue);
      contrast = calculateContrast(hex, background);
    }
    
    // Если все еще недостаточно, корректируем светлоту
    if (contrast < targetContrast) {
      if (lightness > 0.5) {
        lightness = Math.max(0.05, lightness - 0.1);
      } else {
        lightness = Math.min(0.95, lightness + 0.1);
      }
      hex = oklchToHex(lightness, chroma, hue);
      contrast = calculateContrast(hex, background);
    }
    
    adjustedSteps.push({
      ...step,
      lightness,
      chroma,
      hex,
      contrast
    });
  }
  
  const contrasts = adjustedSteps.map(step => step.contrast);
  const minContrast = Math.min(...contrasts);
  const maxContrast = Math.max(...contrasts);
  
  return {
    baseColor: steps[0].hex,
    steps: adjustedSteps,
    type,
    accessibility: {
      wcagAA: minContrast >= WCAG_LEVELS.AA.normal,
      wcagAAA: minContrast >= WCAG_LEVELS.AAA.normal,
      minContrast,
      maxContrast
    }
  };
}

// =======================
// УТИЛИТЫ ДЛЯ РАБОТЫ С ПАЛИТРАМИ
// =======================

/**
 * Проверяет доступность палитры
 */
export function checkPaletteAccessibility(palette: ColorPalette): {
  wcagAA: boolean;
  wcagAAA: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  const { steps, accessibility } = palette;
  
  // Проверяем каждый шаг
  steps.forEach((step) => {
    if (step.contrast < WCAG_LEVELS.AA.normal) {
      issues.push(`Шаг ${step.step}: контраст ${step.contrast.toFixed(2)} ниже WCAG AA (4.5)`);
    }
    if (step.contrast < WCAG_LEVELS.AAA.normal) {
      issues.push(`Шаг ${step.step}: контраст ${step.contrast.toFixed(2)} ниже WCAG AAA (7.0)`);
    }
  });
  
  return {
    wcagAA: accessibility.wcagAA,
    wcagAAA: accessibility.wcagAAA,
    issues
  };
}

/**
 * Экспортирует палитру в различных форматах
 */
export function exportPalette(palette: ColorPalette, format: 'hex' | 'oklch' | 'css' = 'hex'): string[] {
  switch (format) {
    case 'hex':
      return palette.steps.map(step => step.hex);
    case 'oklch':
      return palette.steps.map(step => 
        `oklch(${(step.lightness * 100).toFixed(1)}% ${step.chroma} ${0})`
      );
    case 'css':
      return palette.steps.map(step => 
        `--color-${palette.type}-${step.step}: ${step.hex};`
      );
    default:
      return palette.steps.map(step => step.hex);
  }
}
