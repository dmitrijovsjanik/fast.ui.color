import { apcach, crToBg, apcachToCss, cssToApcach } from 'apcach';

// Конвертация APCA контраста в lightness (OKLCH L)
export function apcaToLightness(apcaValue: number, background: string = '#ffffff'): number {
  try {
    console.log('apcaToLightness input:', apcaValue);
    
    // Создаем цвет с заданным APCA контрастом относительно белого фона
    const apcachColor = apcach(
      crToBg(background, apcaValue, 'apca'),
      0.1, // базовая хроматика
      0,   // базовый оттенок
      100, // базовая яркость
      'p3'
    );
    
    console.log('apcachColor:', apcachColor);
    
    // Конвертируем в OKLCH для получения lightness
    const oklchColor = apcachToCss(apcachColor, 'oklch');
    
    console.log('oklchColor:', oklchColor);
    
    // Извлекаем lightness из OKLCH (формат: oklch(L% C H))
    const lightnessMatch = oklchColor.match(/oklch\(([^%]+)%/);
    if (lightnessMatch) {
      const lightness = parseFloat(lightnessMatch[1]) / 100;
      console.log('extracted lightness:', lightness);
      return Math.max(0, Math.min(1, lightness));
    }
    
    throw new Error('Не удалось извлечь lightness из OKLCH');
  } catch (error) {
    console.warn('Ошибка конвертации APCA в lightness:', error);
    // Fallback: линейная аппроксимация (инвертированная)
    const fallback = Math.max(0, Math.min(1, 1 - (apcaValue / 108)));
    console.log('fallback lightness:', fallback);
    return fallback;
  }
}

// Конвертация lightness (OKLCH L) в APCA контраст
export function lightnessToApca(lightness: number, background: string = '#ffffff'): number {
  try {
    console.log('lightnessToApca input:', lightness);
    
    // Создаем цвет с заданной lightness
    const oklchColor = `oklch(${(lightness * 100).toFixed(1)}% 0.1 0)`;
    
    console.log('oklchColor:', oklchColor);
    
    // Конвертируем в apcach формат
    const apcachColor = cssToApcach(oklchColor, { bg: background });
    
    console.log('apcachColor:', apcachColor);
    
    // Извлекаем контраст из apcach (формат: "contrast chroma hue")
    const contrast = parseFloat(apcachColor.split(' ')[0]);
    console.log('extracted contrast:', contrast);
    return Math.max(0, Math.min(108, contrast));
  } catch (error) {
    console.warn('Ошибка конвертации lightness в APCA:', error);
    // Fallback: линейная аппроксимация (инвертированная)
    const fallback = Math.max(0, Math.min(108, (1 - lightness) * 108));
    console.log('fallback contrast:', fallback);
    return fallback;
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
