import { apcach, crToBg, apcachToCss, cssToApcach } from 'apcach';
import { converter } from 'culori';

// =======================
// ТИПЫ И ИНТЕРФЕЙСЫ
// =======================

export type ApcaValue = number; // 0-108
export type ChromaValue = number; // 0-0.4 (OKLCH chroma range)
export type ColorType = 'brand' | 'accent' | 'info' | 'success' | 'error' | 'warning' | 'neutral';
export type ChromaCurveType = 'parabolic' | 'linear' | 'custom';

export interface ApcaConfig {
  minContrast: number;
  maxContrast: number;
  chroma: number;
  hue: number;
}

export interface ChromaConfig {
  minChroma: ChromaValue;
  maxChroma: ChromaValue;
  curveType: ChromaCurveType;
  customValues?: ChromaValue[];
}

export interface ApcaPaletteOptions {
  baseColor: string;
  apcaValues: ApcaValue[];
  colorType: ColorType;
  background?: string;
}

// =======================
// КОНФИГУРАЦИИ ДЛЯ ТИПОВ ЦВЕТОВ
// =======================

const COLOR_CONFIGS: Record<ColorType, ApcaConfig> = {
  brand: { minContrast: 30, maxContrast: 90, chroma: 0.2, hue: 220 },
  accent: { minContrast: 25, maxContrast: 85, chroma: 0.25, hue: 45 },
  info: { minContrast: 35, maxContrast: 85, chroma: 0.15, hue: 200 },
  success: { minContrast: 30, maxContrast: 80, chroma: 0.18, hue: 120 },
  error: { minContrast: 40, maxContrast: 90, chroma: 0.2, hue: 0 },
  warning: { minContrast: 35, maxContrast: 85, chroma: 0.22, hue: 45 },
  neutral: { minContrast: 20, maxContrast: 70, chroma: 0.03, hue: 0 }
};

const CHROMA_CONFIGS: Record<ColorType, ChromaConfig> = {
  brand: { 
    minChroma: 0.05, 
    maxChroma: 0.25, 
    curveType: 'parabolic' 
  },
  accent: { 
    minChroma: 0.08, 
    maxChroma: 0.3, 
    curveType: 'parabolic' 
  },
  info: { 
    minChroma: 0.03, 
    maxChroma: 0.2, 
    curveType: 'linear' 
  },
  success: { 
    minChroma: 0.05, 
    maxChroma: 0.22, 
    curveType: 'parabolic' 
  },
  error: { 
    minChroma: 0.08, 
    maxChroma: 0.25, 
    curveType: 'parabolic' 
  },
  warning: { 
    minChroma: 0.06, 
    maxChroma: 0.28, 
    curveType: 'parabolic' 
  },
  neutral: { 
    minChroma: 0.01, 
    maxChroma: 0.05, 
    curveType: 'linear' 
  }
};

// =======================
// ОСНОВНЫЕ ФУНКЦИИ APCA
// =======================

/**
 * Генерирует равномерно распределенные APCA значения
 */
export function generateUniformApcaValues(
  minContrast: number,
  maxContrast: number,
  steps: number
): ApcaValue[] {
  const values: ApcaValue[] = [];
  
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const contrast = minContrast + (maxContrast - minContrast) * t;
    values.push(Math.round(contrast));
  }
  
  return values;
}

/**
 * Генерирует APCA значения для конкретного типа цвета
 */
export function generateApcaValuesForType(
  type: ColorType,
  steps: number = 11
): ApcaValue[] {
  const config = COLOR_CONFIGS[type];
  return generateUniformApcaValues(config.minContrast, config.maxContrast, steps);
}

/**
 * Генерирует параболические хроматические значения
 */
export function generateParabolicChromaValues(
  minChroma: ChromaValue,
  maxChroma: ChromaValue,
  steps: number
): ChromaValue[] {
  const values: ChromaValue[] = [];
  
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    // Параболическая кривая: максимум в центре, минимумы по краям
    const parabolicT = 4 * t * (1 - t); // 4x(1-x) дает максимум 1 при x=0.5
    const chroma = minChroma + (maxChroma - minChroma) * parabolicT;
    values.push(Math.max(minChroma, Math.min(maxChroma, chroma)));
  }
  
  return values;
}

/**
 * Генерирует линейные хроматические значения
 */
export function generateLinearChromaValues(
  minChroma: ChromaValue,
  maxChroma: ChromaValue,
  steps: number
): ChromaValue[] {
  const values: ChromaValue[] = [];
  
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const chroma = minChroma + (maxChroma - minChroma) * t;
    values.push(Math.max(minChroma, Math.min(maxChroma, chroma)));
  }
  
  return values;
}

/**
 * Генерирует хроматические значения для конкретного типа цвета
 */
export function generateChromaValuesForType(
  type: ColorType,
  steps: number = 11,
  customValues?: ChromaValue[]
): ChromaValue[] {
  const config = CHROMA_CONFIGS[type];
  
  if (config.curveType === 'custom' && customValues && customValues.length === steps) {
    return customValues.map(v => Math.max(config.minChroma, Math.min(config.maxChroma, v)));
  }
  
  switch (config.curveType) {
    case 'parabolic':
      return generateParabolicChromaValues(config.minChroma, config.maxChroma, steps);
    case 'linear':
    default:
      return generateLinearChromaValues(config.minChroma, config.maxChroma, steps);
  }
}

/**
 * Генерирует палитру на основе APCA значений
 */
export function generatePaletteFromApcaValues(options: ApcaPaletteOptions): string[] {
  const { baseColor, apcaValues, colorType, background = '#ffffff' } = options;
  
  // Получаем оттенок из базового цвета
  const oklchColor = converter('oklch')(baseColor);
  if (!oklchColor) {
    console.error('Не удалось конвертировать цвет в OKLCH:', baseColor);
    return [];
  }

  const { h } = oklchColor;
  const hue = (h ?? 0) % 360;
  
  // Генерируем хроматические значения для данного типа цвета
  const chromaValues = generateChromaValuesForType(colorType, apcaValues.length);

  const palette: string[] = [];

  for (let i = 0; i < apcaValues.length; i++) {
    const apcaValue = apcaValues[i];
    const chromaValue = chromaValues[i];
    
    try {
      // Генерируем цвет с заданным APCA контрастом и хроматикой
      const apcachColor = apcach(
        crToBg(background, apcaValue, 'apca'),
        chromaValue,
        hue,
        100,
        'p3'
      );

      // Конвертируем в HEX
      const hexColor = apcachToCss(apcachColor, 'hex');
      palette.push(hexColor);
    } catch (error) {
      console.warn(`Ошибка генерации цвета для APCA ${apcaValue}, Chroma ${chromaValue}:`, error);
      // Fallback к базовому цвету
      palette.push(baseColor);
    }
  }

  return palette;
}

/**
 * Генерирует палитру для конкретного типа цвета
 */
export function generatePaletteForType(
  baseColor: string,
  type: ColorType,
  apcaValues: ApcaValue[],
  background: string = '#ffffff'
): string[] {
  return generatePaletteFromApcaValues({
    baseColor,
    apcaValues,
    colorType: type,
    background
  });
}

// =======================
// УТИЛИТЫ ДЛЯ КОНВЕРТАЦИИ
// =======================

/**
 * Конвертирует APCA контраст в lightness (OKLCH L)
 */
export function apcaToLightness(apcaValue: ApcaValue, background: string = '#ffffff'): number {
  try {
    // Создаем цвет с заданным APCA контрастом
    const apcachColor = apcach(
      crToBg(background, apcaValue, 'apca'),
      0.1,
      0,
      100,
      'p3'
    );
    
    // Конвертируем в OKLCH для получения lightness
    const oklchColor = apcachToCss(apcachColor, 'oklch');
    
    // Извлекаем lightness из OKLCH
    const lightnessMatch = oklchColor.match(/oklch\(([^%]+)%/);
    if (lightnessMatch) {
      const lightness = parseFloat(lightnessMatch[1]) / 100;
      return Math.max(0, Math.min(1, lightness));
    }
    
    throw new Error('Не удалось извлечь lightness из OKLCH');
  } catch (error) {
    console.warn('Ошибка конвертации APCA в lightness:', error);
    // Fallback: линейная аппроксимация
    return Math.max(0, Math.min(1, 1 - (apcaValue / 108)));
  }
}

/**
 * Конвертирует lightness (OKLCH L) в APCA контраст
 */
export function lightnessToApca(lightness: number, background: string = '#ffffff'): ApcaValue {
  try {
    // Создаем цвет с заданной lightness
    const oklchColor = `oklch(${(lightness * 100).toFixed(1)}% 0.1 0)`;
    
    // Конвертируем в apcach формат
    const apcachColor = cssToApcach(oklchColor, { bg: background });
    
    // Извлекаем контраст из apcach
    const contrast = parseFloat(apcachColor.split(' ')[0]);
    return Math.max(0, Math.min(108, Math.round(contrast)));
  } catch (error) {
    console.warn('Ошибка конвертации lightness в APCA:', error);
    // Fallback: линейная аппроксимация
    return Math.max(0, Math.min(108, Math.round((1 - lightness) * 108)));
  }
}

// =======================
// ВАЛИДАЦИЯ И УТИЛИТЫ
// =======================

/**
 * Проверяет, является ли значение валидным APCA
 */
export function isValidApcaValue(value: number): value is ApcaValue {
  return Number.isFinite(value) && value >= 0 && value <= 108;
}

/**
 * Ограничивает значение диапазоном APCA
 */
export function clampApcaValue(value: number): ApcaValue {
  return Math.max(0, Math.min(108, Math.round(value)));
}

/**
 * Проверяет, является ли значение валидным хроматическим
 */
export function isValidChromaValue(value: number): value is ChromaValue {
  return Number.isFinite(value) && value >= 0 && value <= 0.4;
}

/**
 * Ограничивает значение диапазоном хроматики
 */
export function clampChromaValue(value: number): ChromaValue {
  return Math.max(0, Math.min(0.4, value));
}

/**
 * Получает конфигурацию для типа цвета
 */
export function getColorConfig(type: ColorType): ApcaConfig {
  return COLOR_CONFIGS[type];
}

/**
 * Получает конфигурацию хроматики для типа цвета
 */
export function getChromaConfig(type: ColorType): ChromaConfig {
  return CHROMA_CONFIGS[type];
}

/**
 * Получает все конфигурации хроматики
 */
export function getAllChromaConfigs(): Record<ColorType, ChromaConfig> {
  return CHROMA_CONFIGS;
}

/**
 * Создает APCA значения для всех типов цветов
 */
export function generateAllApcaValues(steps: number = 11): Record<ColorType, ApcaValue[]> {
  const result: Record<ColorType, ApcaValue[]> = {} as Record<ColorType, ApcaValue[]>;
  
  for (const type of Object.keys(COLOR_CONFIGS) as ColorType[]) {
    result[type] = generateApcaValuesForType(type, steps);
  }
  
  return result;
}
