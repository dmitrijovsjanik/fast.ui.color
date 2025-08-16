import { apcach, crToBg, apcachToCss } from 'apcach';
import { converter } from 'culori';

// Генерация палитры на основе APCA значений
export function generatePaletteFromApcaValues(
  baseColor: string,
  apcaValues: number[],
  background: string = '#ffffff'
): string[] {
  // Конвертируем базовый цвет в OKLCH для получения оттенка и хроматики
  const oklchColor = converter('oklch')(baseColor);
  if (!oklchColor) {
    console.error('Не удалось конвертировать цвет в OKLCH:', baseColor);
    return [];
  }

  const { c, h } = oklchColor;
  const hue = (h ?? 0) % 360;
  const chroma = c || 0.12;

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

// Генерация палитры с равномерным распределением APCA
export function generateUniformApcaPalette(
  baseColor: string,
  steps: number = 11,
  minContrast: number = 20,
  maxContrast: number = 80,
  background: string = '#ffffff'
): string[] {
  // Создаем равномерно распределенные APCA значения
  const apcaValues: number[] = [];
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const contrast = minContrast + (maxContrast - minContrast) * t;
    apcaValues.push(contrast);
  }

  return generatePaletteFromApcaValues(baseColor, apcaValues, background);
}

// Генерация палитры по типу цвета с APCA
export function generateApcaPaletteByType(
  baseColor: string,
  type: 'brand' | 'accent' | 'info' | 'success' | 'error' | 'warning' | 'neutral',
  apcaValues: number[],
  background: string = '#ffffff'
): string[] {
  // Для нейтрального цвета используем очень низкую хроматику
  const oklchColor = converter('oklch')(baseColor);
  const isNeutralColor = type === 'neutral' || (oklchColor && (oklchColor.c ?? 0) < 0.05);
  
  if (isNeutralColor) {
    // Для нейтрального цвета генерируем серые оттенки
    return generateNeutralPalette(apcaValues, background);
  }

  return generatePaletteFromApcaValues(baseColor, apcaValues, background);
}

// Генерация нейтральной палитры (серые оттенки)
function generateNeutralPalette(apcaValues: number[], background: string = '#ffffff'): string[] {
  const palette: string[] = [];

  for (let i = 0; i < apcaValues.length; i++) {
    const apcaValue = apcaValues[i];
    
    try {
      // Генерируем серый цвет с заданным APCA контрастом
      const apcachColor = apcach(
        crToBg(background, apcaValue, 'apca'),
        0.03, // очень низкая хроматика для серого
        0,    // оттенок не важен для серого
        100,
        'p3'
      );

      // Конвертируем в HEX
      const hexColor = apcachToCss(apcachColor, 'hex');
      palette.push(hexColor);
    } catch (error) {
      console.warn(`Ошибка генерации нейтрального цвета для APCA ${apcaValue}:`, error);
      // Fallback к серому
      palette.push('#808080');
    }
  }

  return palette;
}
