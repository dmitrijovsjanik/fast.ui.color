import { apcach, crToBg, apcachToCss } from 'apcach';

// Интерфейс для опций генерации палитр с APCA
interface ApcachPaletteOptions {
  baseColor: string;
  steps: number;
  contrastRatios: number[]; // Массив контрастных соотношений для каждого шага
  background?: string; // Цвет фона для расчета контраста
  chroma?: number | (() => number); // Хроматика (может быть функцией)
  hue?: number; // Оттенок
  searchDirection?: 'lighter' | 'darker' | 'auto';
  colorSpace?: 'p3' | 'srgb';
}

// Генерация палитры с использованием APCA контраста
export function generateApcachPalette(options: ApcachPaletteOptions): string[] {
  const {
    baseColor,
    steps,
    contrastRatios,
    background = '#ffffff',
    chroma = 0.15,
    hue = 220,
    searchDirection = 'auto',
    colorSpace = 'p3'
  } = options;

  const palette: string[] = [];

  for (let i = 0; i < steps; i++) {
    const contrastRatio = contrastRatios[i] || 60; // Дефолтный контраст
    
    try {
      // Генерируем цвет с нужным контрастом
      const apcachColor = apcach(
        crToBg(background, contrastRatio, 'apca', searchDirection),
        typeof chroma === 'function' ? chroma() : chroma,
        hue,
        100,
        colorSpace
      );

      // Конвертируем в HEX
      const hexColor = apcachToCss(apcachColor, 'hex');
      palette.push(hexColor);
    } catch (error) {
      console.warn(`Ошибка генерации цвета для шага ${i}:`, error);
      // Fallback к базовому цвету
      palette.push(baseColor);
    }
  }

  return palette;
}

// Генерация палитры с равномерным распределением контраста
export function generateUniformApcachPalette(
  baseColor: string,
  steps: number,
  minContrast: number = 20,
  maxContrast: number = 80,
  options: Partial<ApcachPaletteOptions> = {}
): string[] {
  // Создаем равномерно распределенные контрастные соотношения
  const contrastRatios: number[] = [];
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const contrast = minContrast + (maxContrast - minContrast) * t;
    contrastRatios.push(contrast);
  }

  return generateApcachPalette({
    baseColor,
    steps,
    contrastRatios,
    ...options
  });
}

// Генерация палитры с APCA для разных типов цветов
export function generateApcachPaletteByType(
  baseColor: string,
  type: 'brand' | 'accent' | 'info' | 'success' | 'error' | 'warning' | 'neutral',
  steps: number = 11
): string[] {
  const typeConfigs = {
    brand: {
      minContrast: 30,
      maxContrast: 90,
      chroma: 0.2,
      hue: 220
    },
    accent: {
      minContrast: 25,
      maxContrast: 85,
      chroma: 0.25,
      hue: 45
    },
    info: {
      minContrast: 35,
      maxContrast: 85,
      chroma: 0.15,
      hue: 200
    },
    success: {
      minContrast: 30,
      maxContrast: 80,
      chroma: 0.18,
      hue: 120
    },
    error: {
      minContrast: 40,
      maxContrast: 90,
      chroma: 0.2,
      hue: 0
    },
    warning: {
      minContrast: 35,
      maxContrast: 85,
      chroma: 0.22,
      hue: 45
    },
    neutral: {
      minContrast: 20,
      maxContrast: 70,
      chroma: 0.05,
      hue: 0
    }
  };

  const config = typeConfigs[type];
  
  return generateUniformApcachPalette(
    baseColor,
    steps,
    config.minContrast,
    config.maxContrast,
    {
      chroma: config.chroma,
      hue: config.hue,
      colorSpace: 'p3'
    }
  );
}

// Функция для проверки контраста между двумя цветами
export function checkContrast(_color1: string, _color2: string): number {
  try {
    // Используем apcach для расчета контраста
    // Это упрощенная версия, в реальности нужно использовать APCA алгоритм
    return 60; // Placeholder
  } catch (error) {
    console.warn('Ошибка проверки контраста:', error);
    return 0;
  }
}

// Генерация палитры с учетом базового цвета
export function generateApcachPaletteFromBase(
  baseColor: string,
  steps: number = 11,
  type: 'brand' | 'accent' | 'info' | 'success' | 'error' | 'warning' | 'neutral' = 'brand'
): string[] {
  // Извлекаем оттенок из базового цвета
  // const tempColor = apcach(60, 0.1, 0, 100, 'p3');
  // const baseHue = 220; // Placeholder, нужно извлечь из baseColor

  return generateApcachPaletteByType(baseColor, type, steps);
}
