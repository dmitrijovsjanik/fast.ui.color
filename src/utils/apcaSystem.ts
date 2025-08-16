import { apcach, crToBg, apcachToCss, cssToApcach } from 'apcach';
import { converter } from 'culori';

// =======================
// ТИПЫ И ИНТЕРФЕЙСЫ
// =======================

export type ApcaValue = number; // 0-108
export type ColorType = 'brand' | 'accent' | 'info' | 'success' | 'error' | 'warning' | 'neutral';

export interface ApcaConfig {
  minContrast: number;
  maxContrast: number;
  chroma: number;
  hue: number;
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
 * Генерирует палитру на основе APCA значений
 */
export function generatePaletteFromApcaValues(options: ApcaPaletteOptions): string[] {
  const { baseColor, apcaValues, colorType, background = '#ffffff' } = options;
  
  // Получаем оттенок и хроматику из базового цвета
  const oklchColor = converter('oklch')(baseColor);
  if (!oklchColor) {
    console.error('Не удалось конвертировать цвет в OKLCH:', baseColor);
    return [];
  }

  const { c, h } = oklchColor;
  const hue = (h ?? 0) % 360;
  const chroma = c || COLOR_CONFIGS[colorType].chroma;

  const palette: string[] = [];

  for (let i = 0; i < apcaValues.length; i++) {
    const apcaValue = apcaValues[i];
    
    try {
      // Генерируем цвет с заданным APCA контрастом
      const apcachColor = apcach(
        crToBg(background, apcaValue, 'apca'),
        chroma,
        hue,
        100,
        'p3'
      );

      // Конвертируем в HEX
      const hexColor = apcachToCss(apcachColor, 'hex');
      palette.push(hexColor);
    } catch (error) {
      console.warn(`Ошибка генерации цвета для APCA ${apcaValue}:`, error);
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
 * Получает конфигурацию для типа цвета
 */
export function getColorConfig(type: ColorType): ApcaConfig {
  return COLOR_CONFIGS[type];
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
