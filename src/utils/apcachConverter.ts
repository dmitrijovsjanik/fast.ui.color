import { apcach, crToBg, apcachToCss, cssToApcach } from 'apcach';

// Конвертация APCA контраста в lightness (OKLCH L)
export function apcaToLightness(apcaValue: number, background: string = '#ffffff'): number {
  try {
    // Создаем цвет с заданным APCA контрастом относительно белого фона
    const apcachColor = apcach(
      crToBg(background, apcaValue, 'apca'),
      0.1, // базовая хроматика
      0,   // базовый оттенок
      100, // базовая яркость
      'p3'
    );
    
    // Конвертируем в OKLCH для получения lightness
    const oklchColor = apcachToCss(apcachColor, 'oklch');
    
    // Извлекаем lightness из OKLCH (формат: oklch(L% C H))
    const lightnessMatch = oklchColor.match(/oklch\(([^%]+)%/);
    if (lightnessMatch) {
      const lightness = parseFloat(lightnessMatch[1]) / 100;
      return Math.max(0, Math.min(1, lightness));
    }
    
    throw new Error('Не удалось извлечь lightness из OKLCH');
  } catch (error) {
    console.warn('Ошибка конвертации APCA в lightness:', error);
    // Fallback: линейная аппроксимация (инвертированная)
    return Math.max(0, Math.min(1, 1 - (apcaValue / 108)));
  }
}

// Конвертация lightness (OKLCH L) в APCA контраст
export function lightnessToApca(lightness: number, background: string = '#ffffff'): number {
  try {
    // Создаем цвет с заданной lightness
    const oklchColor = `oklch(${(lightness * 100).toFixed(1)}% 0.1 0)`;
    
    // Конвертируем в apcach формат
    const apcachColor = cssToApcach(oklchColor, { bg: background });
    
    // Извлекаем контраст из apcach (формат: "contrast chroma hue")
    const contrast = parseFloat(apcachColor.split(' ')[0]);
    return Math.max(0, Math.min(108, contrast));
  } catch (error) {
    console.warn('Ошибка конвертации lightness в APCA:', error);
    // Fallback: линейная аппроксимация (инвертированная)
    return Math.max(0, Math.min(108, (1 - lightness) * 108));
  }
}

// Генерация равномерно распределенных APCA значений
export function generateUniformApcaValues(
  minContrast: number = 20,
  maxContrast: number = 80,
  steps: number = 11
): number[] {
  const values: number[] = [];
  
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const contrast = minContrast + (maxContrast - minContrast) * t;
    values.push(contrast);
  }
  
  return values;
}

// Генерация APCA значений с учетом типа цвета
export function generateApcaValuesByType(
  type: 'brand' | 'accent' | 'info' | 'success' | 'error' | 'warning' | 'neutral',
  steps: number = 11
): number[] {
  const typeConfigs = {
    brand: { min: 30, max: 90 },
    accent: { min: 25, max: 85 },
    info: { min: 35, max: 85 },
    success: { min: 30, max: 80 },
    error: { min: 40, max: 90 },
    warning: { min: 35, max: 85 },
    neutral: { min: 20, max: 70 }
  };
  
  const config = typeConfigs[type];
  return generateUniformApcaValues(config.min, config.max, steps);
}

// Конвертация массива APCA значений в lightness
export function convertApcaArrayToLightness(apcaValues: number[]): number[] {
  return apcaValues.map(apca => apcaToLightness(apca));
}

// Конвертация массива lightness в APCA значения
export function convertLightnessArrayToApca(lightnessValues: number[]): number[] {
  return lightnessValues.map(lightness => lightnessToApca(lightness));
}
