import { generateColorPalette, ColorType, ColorPalette, PaletteOptions } from './colorGenerator';
import { converter } from 'culori';

// =======================
// ТИПЫ И ИНТЕРФЕЙСЫ
// =======================

export interface PaletteGenerationConfig {
  brandColor: string;
  scale: 'Linear' | 'Semantic';
  steps: number;
  ensureAccessibility: boolean;
  targetContrast?: number;
}

export interface GeneratedPalettes {
  brand: ColorPalette;
  accent: ColorPalette;
  info: ColorPalette;
  success: ColorPalette;
  error: ColorPalette;
  warning: ColorPalette;
  neutral: ColorPalette;
}

export interface PaletteValidationResult {
  isValid: boolean;
  issues: string[];
  accessibility: {
    wcagAA: boolean;
    wcagAAA: boolean;
    minContrast: number;
    maxContrast: number;
  };
}

// =======================
// КОНСТАНТЫ
// =======================

export const DEFAULT_COLORS: Record<ColorType, string> = {
  brand: '#3b82f6',
  accent: '#f59e0b',
  info: '#06b6d4',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  neutral: '#6b7280'
};

export const SEMANTIC_COLOR_OFFSETS = {
  accent: 30, // Дополнительный цвет (30° от бренд-цвета)
  info: 180, // Информационный (противоположный)
  success: 120, // Успех (зеленый)
  error: 0, // Ошибка (красный)
  warning: 45, // Предупреждение (оранжевый)
  neutral: 0 // Нейтральный (серый)
};

// =======================
// УТИЛИТЫ ДЛЯ РАБОТЫ С ЦВЕТАМИ
// =======================

/**
 * Генерирует дополнительный цвет на основе бренд-цвета
 */
export function generateComplementaryColor(brandColor: string): string {
  try {
    const oklchColor = converter('oklch')(brandColor);
    if (!oklchColor) return DEFAULT_COLORS.accent;
    
    const hue = (oklchColor.h + 180) % 360;
    const complementaryColor = converter('hex')(`oklch(${oklchColor.l * 100}% ${oklchColor.c} ${hue})`);
    
    return complementaryColor || DEFAULT_COLORS.accent;
  } catch (error) {
    console.warn('Ошибка генерации дополнительного цвета:', error);
    return DEFAULT_COLORS.accent;
  }
}

/**
 * Генерирует цвет для определенного типа на основе бренд-цвета
 */
export function generateColorForType(type: ColorType, brandColor: string): string {
  if (type === 'brand') return brandColor;
  if (type === 'neutral') return DEFAULT_COLORS.neutral;
  
  try {
    const oklchColor = converter('oklch')(brandColor);
    if (!oklchColor) return DEFAULT_COLORS[type];
    
    const offset = SEMANTIC_COLOR_OFFSETS[type];
    const hue = (oklchColor.h + offset) % 360;
    
    // Настраиваем яркость и насыщенность в зависимости от типа
    let lightness = oklchColor.l;
    let chroma = oklchColor.c;
    
    switch (type) {
      case 'accent':
        chroma = Math.min(0.3, chroma * 1.2);
        break;
      case 'info':
        lightness = Math.min(0.7, lightness * 1.1);
        chroma = Math.min(0.25, chroma * 0.9);
        break;
      case 'success':
        lightness = Math.min(0.65, lightness * 1.05);
        chroma = Math.min(0.25, chroma * 0.95);
        break;
      case 'error':
        lightness = Math.min(0.6, lightness * 0.95);
        chroma = Math.min(0.3, chroma * 1.1);
        break;
      case 'warning':
        lightness = Math.min(0.7, lightness * 1.05);
        chroma = Math.min(0.3, chroma * 1.15);
        break;
    }
    
    const generatedColor = converter('hex')(`oklch(${lightness * 100}% ${chroma} ${hue})`);
    return generatedColor || DEFAULT_COLORS[type];
  } catch (error) {
    console.warn(`Ошибка генерации цвета для типа ${type}:`, error);
    return DEFAULT_COLORS[type];
  }
}

// =======================
// ОСНОВНАЯ ЛОГИКА ГЕНЕРАЦИИ ПАЛИТР
// =======================

/**
 * Генерирует все палитры на основе конфигурации
 */
export function generateAllPalettes(config: PaletteGenerationConfig): GeneratedPalettes {
  const { brandColor, steps, ensureAccessibility, targetContrast } = config;
  
  // Генерируем цвета для каждого типа
  const colorTypes: ColorType[] = ['brand', 'accent', 'info', 'success', 'error', 'warning', 'neutral'];
  const palettes: Partial<GeneratedPalettes> = {};
  
  colorTypes.forEach(type => {
    const baseColor = generateColorForType(type, brandColor);
    
    const options: PaletteOptions = {
      baseColor,
      type,
      steps,
      targetContrast,
      ensureAccessibility
    };
    
    palettes[type] = generateColorPalette(options);
  });
  
  return palettes as GeneratedPalettes;
}

/**
 * Генерирует палитру для определенного типа
 */
export function generatePaletteForType(
  type: ColorType,
  brandColor: string,
  steps: number = 11,
  ensureAccessibility: boolean = true
): ColorPalette {
  const baseColor = generateColorForType(type, brandColor);
  
  return generateColorPalette({
    baseColor,
    type,
    steps,
    ensureAccessibility
  });
}

/**
 * Обновляет палитру при изменении бренд-цвета
 */
export function updatePalettesOnBrandChange(
  brandColor: string,
  currentPalettes: GeneratedPalettes,
  config: Omit<PaletteGenerationConfig, 'brandColor'>
): GeneratedPalettes {
  const newPalettes: Partial<GeneratedPalettes> = {};
  
  // Обновляем бренд-палитру
  newPalettes.brand = generatePaletteForType('brand', brandColor, config.steps, config.ensureAccessibility);
  
  // Обновляем остальные палитры, если они зависят от бренд-цвета
  const dependentTypes: ColorType[] = ['accent', 'info', 'success', 'error', 'warning'];
  
  dependentTypes.forEach(type => {
    newPalettes[type] = generatePaletteForType(type, brandColor, config.steps, config.ensureAccessibility);
  });
  
  // Нейтральная палитра остается неизменной
  newPalettes.neutral = currentPalettes.neutral;
  
  return newPalettes as GeneratedPalettes;
}

// =======================
// ВАЛИДАЦИЯ И ПРОВЕРКА КАЧЕСТВА
// =======================

/**
 * Валидирует сгенерированные палитры
 */
export function validatePalettes(palettes: GeneratedPalettes): PaletteValidationResult {
  const issues: string[] = [];
  let minContrast = Infinity;
  let maxContrast = 0;
  let wcagAA = true;
  let wcagAAA = true;
  
  // Проверяем каждую палитру
  Object.entries(palettes).forEach(([type, palette]) => {
    // Проверяем доступность
    if (!palette.accessibility.wcagAA) {
      issues.push(`Палитра ${type}: не соответствует WCAG AA`);
      wcagAA = false;
    }
    
    if (!palette.accessibility.wcagAAA) {
      issues.push(`Палитра ${type}: не соответствует WCAG AAA`);
      wcagAAA = false;
    }
    
    // Обновляем общие показатели контраста
    minContrast = Math.min(minContrast, palette.accessibility.minContrast);
    maxContrast = Math.max(maxContrast, palette.accessibility.maxContrast);
    
    // Проверяем равномерность распределения
    const contrasts = palette.steps.map((step: any) => step.contrast);
    const avgContrast = contrasts.reduce((sum: number, c: number) => sum + c, 0) / contrasts.length;
    const variance = contrasts.reduce((sum: number, c: number) => sum + Math.pow(c - avgContrast, 2), 0) / contrasts.length;
    
    if (variance > 100) { // Пороговое значение для неравномерности
      issues.push(`Палитра ${type}: неравномерное распределение контраста (дисперсия: ${variance.toFixed(2)})`);
    }
    
    // Проверяем наличие дублирующихся цветов
    const hexColors = palette.steps.map((step: any) => step.hex);
    const uniqueColors = new Set(hexColors);
    if (uniqueColors.size < hexColors.length * 0.8) { // Допускаем 20% дубликатов
      issues.push(`Палитра ${type}: слишком много дублирующихся цветов`);
    }
  });
  
  return {
    isValid: issues.length === 0,
    issues,
    accessibility: {
      wcagAA,
      wcagAAA,
      minContrast,
      maxContrast
    }
  };
}

/**
 * Проверяет совместимость цветов
 */
export function checkColorCompatibility(palettes: GeneratedPalettes): {
  isCompatible: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // Проверяем контраст между основными цветами
  const mainColors = {
    brand: palettes.brand.steps[5].hex, // Средний оттенок
    accent: palettes.accent.steps[5].hex,
    info: palettes.info.steps[5].hex,
    success: palettes.success.steps[5].hex,
    error: palettes.error.steps[5].hex,
    warning: palettes.warning.steps[5].hex
  };
  
  // Проверяем контраст между всеми парами цветов
  const colorPairs = [
    ['brand', 'accent'],
    ['brand', 'info'],
    ['brand', 'success'],
    ['brand', 'error'],
    ['brand', 'warning'],
    ['accent', 'info'],
    ['accent', 'success'],
    ['accent', 'error'],
    ['accent', 'warning']
  ];
  
  colorPairs.forEach(([color1, color2]) => {
    const contrast = calculateContrast(mainColors[color1 as keyof typeof mainColors], mainColors[color2 as keyof typeof mainColors]);
    if (contrast < 3.0) { // Минимальный контраст для различимости
      issues.push(`Низкий контраст между ${color1} и ${color2}: ${contrast.toFixed(2)}`);
    }
  });
  
  return {
    isCompatible: issues.length === 0,
    issues
  };
}

/**
 * Вычисляет контраст между двумя цветами
 */
function calculateContrast(color1: string, color2: string): number {
  try {
    const rgb1 = converter('rgb')(color1);
    const rgb2 = converter('rgb')(color2);
    
    if (!rgb1 || !rgb2) return 1;
    
    const luminance1 = calculateRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
    const luminance2 = calculateRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);
    
    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);
    
    return (lighter + 0.05) / (darker + 0.05);
  } catch (error) {
    return 1;
  }
}

/**
 * Вычисляет относительную яркость
 */
function calculateRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// =======================
// ЭКСПОРТ И СЕРИАЛИЗАЦИЯ
// =======================

/**
 * Экспортирует палитры в различных форматах
 */
export function exportPalettes(
  palettes: GeneratedPalettes,
  format: 'hex' | 'oklch' | 'css' | 'json' = 'hex'
): Record<ColorType, string[]> | string {
  switch (format) {
    case 'hex':
    case 'oklch':
      const result: Partial<Record<ColorType, string[]>> = {};
      Object.entries(palettes).forEach(([type, palette]) => {
        result[type as ColorType] = palette.steps.map((step: any) => 
          format === 'hex' ? step.hex : `oklch(${(step.lightness * 100).toFixed(1)}% ${step.chroma} ${0})`
        );
      });
      return result as Record<ColorType, string[]>;
      
    case 'css':
      let css = ':root {\n';
      Object.entries(palettes).forEach(([type, palette]) => {
        palette.steps.forEach((step: any) => {
          css += `  --color-${type}-${step.step}: ${step.hex};\n`;
        });
      });
      css += '}\n';
      return css;
      
    case 'json':
      return JSON.stringify(palettes, null, 2);
      
    default:
      return JSON.stringify(palettes, null, 2);
  }
}

/**
 * Создает превью палитр для UI
 */
export function createPalettePreview(palettes: GeneratedPalettes): Record<ColorType, { colors: string[]; contrast: number[] }> {
  const preview: Partial<Record<ColorType, { colors: string[]; contrast: number[] }>> = {};
  
  Object.entries(palettes).forEach(([type, palette]) => {
    preview[type as ColorType] = {
      colors: palette.steps.map((step: any) => step.hex),
      contrast: palette.steps.map((step: any) => step.contrast)
    };
  });
  
  return preview as Record<ColorType, { colors: string[]; contrast: number[] }>;
}
