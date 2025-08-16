import { converter, formatHex } from 'culori';
import { CurveSettings } from '../types/curveEditor';
import { generateCurveValues } from './curveUtils';

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

function normalizeHue(h: number): number {
  let x = h % 360;
  return x < 0 ? x + 360 : x;
}



// Linear алгоритм - генерирует абсолютно любой цвет в одном из шагов
export function generateCuloriPalette(
  baseHex: string,
  opts: {
    chromaScale?: number;
    hueShift?: number;
    gamut?: 'srgb' | 'p3';
    lightnessCurve?: CurveSettings;
    chromaCurve?: CurveSettings;
  } = {}
): string[] {
  const toOKLCH = converter('oklch') as (c:any) => { l:number; c:number; h:number };
  const base = toOKLCH(baseHex) || { l:0.5, c:0.08, h:0 };
  const baseHue = normalizeHue(base.h ?? 0);

  // Спец-кейс: почти чистые белый/чёрный → нейтральная шкала
  // if ((base.l ?? 0) > 0.985 && (base.c ?? 0) < 0.01) return neutralScale();
  // if ((base.l ?? 0) < 0.015 && (base.c ?? 0) < 0.01) return neutralScale();
  
  // Спец-кейс: нейтральные цвета (серые) → нейтральная шкала
  // if ((base.c ?? 0) < 0.05) return neutralScale();

  // Используем настройки кривых или дефолтные значения
  const lightnessValues = opts.lightnessCurve 
    ? generateCurveValues(opts.lightnessCurve)
    : generateDefaultLightnessValues();
  
  // Для нейтрального цвета используем фиксированную низкую хроматику
  const isNeutralColor = (base.c ?? 0) < 0.05;
  const chromaValues = isNeutralColor 
    ? new Array(STEPS.length).fill(0.005) // Фиксированная низкая хроматика для нейтральных цветов
    : generateDefaultChromaValues(base.c ?? 0.08);
  
  console.log('CuloriPalette - lightnessValues:', lightnessValues);
  console.log('CuloriPalette - opts.lightnessCurve:', opts.lightnessCurve);

  // Определяем позицию ключевого цвета на основе его яркости
  let baseStepIndex = 5; // По умолчанию 500
  let minDiff = Infinity;
  
  lightnessValues.forEach((targetL, index) => {
    const diff = Math.abs((base.l ?? 0.5) - targetL);
    if (diff < minDiff) {
      minDiff = diff;
      baseStepIndex = index;
    }
  });

  const out: string[] = [];

  STEPS.forEach((_step, i) => {
    // Если это позиция базового цвета, возвращаем его точно
    if (i === baseStepIndex) {
      out.push(baseHex);
      return;
    }

    // Используем значения из кривых
    const targetL = lightnessValues[i];
    const targetC = chromaValues[i];
    
    // ВСЕГДА используем тот же оттенок что и базовый цвет
    const h = baseHue;

    out.push(formatHex({ mode: 'oklch', l: targetL, c: targetC, h }));
  });

  return out;
}

// Дефолтные значения для яркости (если кривая не настроена)
function generateDefaultLightnessValues(): number[] {
  const values: number[] = [];
  for (let i = 0; i < STEPS.length; i++) {
    const t = i / (STEPS.length - 1);
    values.push(0.98 - (0.98 - 0.08) * Math.pow(t, 2.5));
  }
  return values;
}

// Дефолтные значения для хроматики (если кривая не настроена)
function generateDefaultChromaValues(baseC: number): number[] {
  const values: number[] = [];
  for (let i = 0; i < STEPS.length; i++) {
    const t = i / (STEPS.length - 1);
    const curve = 1 - Math.pow((t - 0.5) * 2, 2);
    const minChroma = Math.max(0.02, baseC * 0.2);
    const maxChroma = Math.max(0.1, baseC * 1.2);
    values.push(minChroma + (maxChroma - minChroma) * curve);
  }
  return values;
}

// Semantic алгоритм - простой алгоритм с фиксированными значениями
export function generateSemanticPalette(
  baseHex: string,
  opts: {
    lightnessCurve?: CurveSettings;
    chromaCurve?: CurveSettings;
  } = {}
): string[] {
  const toOKLCH = converter('oklch') as (c:any) => { l:number; c:number; h:number };
  const base = toOKLCH(baseHex) || { l:0.5, c:0.08, h:0 };
  const baseHue = normalizeHue(base.h ?? 0);

  // Спец-кейс: нейтральные цвета → нейтральная шкала
  // if ((base.c ?? 0) < 0.05) return neutralScale();

  // Фиксированные значения для семантической палитры
  const semanticSteps = [
    { l: 0.95, c: 0.02 },
    { l: 0.90, c: 0.04 },
    { l: 0.85, c: 0.06 },
    { l: 0.80, c: 0.08 },
    { l: 0.75, c: 0.10 },
    { l: 0.70, c: 0.12 },
    { l: 0.65, c: 0.10 },
    { l: 0.60, c: 0.08 },
    { l: 0.55, c: 0.06 },
    { l: 0.50, c: 0.04 },
    { l: 0.45, c: 0.02 },
    { l: 0.40, c: 0.01 }
  ];

  // Используем настройки кривых или дефолтные значения
  const lightnessValues = opts.lightnessCurve 
    ? generateCurveValues(opts.lightnessCurve)
    : semanticSteps.map(step => step.l);
    
  // Для нейтрального цвета используем фиксированную низкую хроматику
  const isNeutralColor = (base.c ?? 0) < 0.05;
  const chromaValues = isNeutralColor
    ? new Array(12).fill(0.005) // Фиксированная низкая хроматика для нейтральных цветов
    : (opts.chromaCurve
        ? generateCurveValues(opts.chromaCurve)
        : semanticSteps.map(step => Math.min(step.c, (base.c ?? 0.08) * 1.5)));

  // Определяем позицию ключевого цвета
  let baseIndex = 5; // По умолчанию середина
  let minDiff = Infinity;
  
  lightnessValues.forEach((targetL, index) => {
    const diff = Math.abs((base.l ?? 0.5) - targetL);
    if (diff < minDiff) {
      minDiff = diff;
      baseIndex = index;
    }
  });

  const out: string[] = [];

  for (let i = 0; i < 12; i++) {
    // Если это позиция базового цвета, возвращаем его точно
    if (i === baseIndex) {
      out.push(baseHex);
      continue;
    }

    const targetL = lightnessValues[i];
    const targetC = chromaValues[i];
    const h = baseHue;

    out.push(formatHex({ mode: 'oklch', l: targetL, c: targetC, h }));
  }

  return out;
}
