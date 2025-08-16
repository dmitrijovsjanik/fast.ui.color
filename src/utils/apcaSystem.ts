import { converter } from 'culori';

// =======================
// ТИПЫ И ИНТЕРФЕЙСЫ
// =======================

export type ApcaValue = number; // 0-108
export type ChromaValue = number; // 0-0.4
export type ColorType = 'brand' | 'accent' | 'info' | 'success' | 'error' | 'warning' | 'neutral';
export type ChromaCurveType = 'parabolic' | 'linear' | 'custom';

interface ApcaPaletteOptions {
  baseColor: string;
  apcaValues: ApcaValue[];
  colorType: ColorType;
  chromaValues?: ChromaValue[];
}

// =======================
// ОСНОВНЫЕ ФУНКЦИИ
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
  steps: number = 11
): ApcaValue[] {
  // Для APCA используем дефолтные значения 10 и 90 для лучшего распределения
  return generateUniformApcaValues(10, 90, steps);
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
  steps: number = 11,
  customValues?: ChromaValue[]
): ChromaValue[] {
  // Для хроматики используем дефолтные значения 5% и 25% (0.05 и 0.25)
  const minChroma = 0.05;
  const maxChroma = 0.25;
  
  if (customValues && customValues.length === steps) {
    return customValues.map(v => Math.max(minChroma, Math.min(maxChroma, v)));
  }
  
  // По умолчанию используем параболическую кривую
  return generateParabolicChromaValues(minChroma, maxChroma, steps);
}

/**
 * Конвертирует APCA контраст в lightness (OKLCH L)
 */
export function apcaToLightness(apcaValue: ApcaValue): number {
  // APCA 0-108 -> Lightness 0-1
  // Используем простую линейную конвертацию
  
  if (apcaValue <= 0) return 1; // Белый
  if (apcaValue >= 108) return 0; // Черный
  
  // Линейная конвертация
  const lightness = 1 - (apcaValue / 108);
  
  return Math.max(0, Math.min(1, lightness));
}

/**
 * Генерирует палитру цветов на основе APCA значений
 */
export function generatePaletteFromApcaValues(options: ApcaPaletteOptions): string[] {
  const { baseColor, apcaValues, chromaValues } = options;

  // Получаем оттенок из базового цвета
  const oklchColor = converter('oklch')(baseColor);
  const hue = (oklchColor?.h ?? 0) % 360;

  // Используем переданные хроматические значения или генерируем по умолчанию
  const finalChromaValues = chromaValues || generateChromaValuesForType(apcaValues.length);

  console.log('generatePaletteFromApcaValues:', {
    baseColor,
    apcaValues,
    chromaValues: finalChromaValues,
    hue
  });

  const palette: string[] = [];

  for (let i = 0; i < apcaValues.length; i++) {
    const apcaValue = apcaValues[i];
    const chromaValue = finalChromaValues[i];
    
    try {
      // Конвертируем APCA в lightness
      const lightness = apcaToLightness(apcaValue);
      
      // Создаем цвет в OKLCH
      const oklchString = `oklch(${(lightness * 100).toFixed(1)}% ${chromaValue} ${hue})`;
      
      // Конвертируем в HEX
      const hexColor = converter('hex')(oklchString);
      palette.push(hexColor);
      
      console.log(`Шаг ${i + 1}: APCA=${apcaValue}, Lightness=${lightness}, Chroma=${chromaValue}, Color=${hexColor}`);
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
  chromaValues?: ChromaValue[]
): string[] {
  return generatePaletteFromApcaValues({
    baseColor,
    apcaValues,
    colorType: type,
    chromaValues
  });
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
 * Создает APCA значения для всех типов цветов
 */
export function generateAllApcaValues(steps: number = 11): Record<ColorType, ApcaValue[]> {
  const result: Record<ColorType, ApcaValue[]> = {} as Record<ColorType, ApcaValue[]>;
  
  const colorTypes: ColorType[] = ['brand', 'accent', 'info', 'success', 'error', 'warning', 'neutral'];
  
  for (const type of colorTypes) {
    result[type] = generateApcaValuesForType(steps);
  }
  
  return result;
}
