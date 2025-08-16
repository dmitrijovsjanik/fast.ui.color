import { converter, formatHex } from 'culori';

const STEPS = [50,100,200,300,400,500,600,700,800,900,950] as const;

type Bounds = { L:[number,number]; C:[number,number] };

// Предельные диапазоны L и C для каждого шага (OKLCH).
// Подобраны так, чтобы середина была насыщеннее, а края — спокойнее.
// L: 0..1 (0 — чёрный, 1 — белый), C: ~0..0.2 в sRGB.
const BOUNDS: Record<(typeof STEPS)[number], Bounds> = {
  50:  { L:[0.96,0.99], C:[0.01,0.04] },
  100: { L:[0.90,0.96], C:[0.02,0.06] },
  200: { L:[0.84,0.90], C:[0.04,0.08] },
  300: { L:[0.79,0.85], C:[0.06,0.11] },
  400: { L:[0.70,0.78], C:[0.09,0.15] },
  500: { L:[0.60,0.69], C:[0.10,0.16] },
  600: { L:[0.52,0.60], C:[0.09,0.15] },
  700: { L:[0.43,0.51], C:[0.07,0.12] },
  800: { L:[0.36,0.42], C:[0.05,0.10] },
  900: { L:[0.29,0.35], C:[0.03,0.08] },
  950: { L:[0.21,0.27], C:[0.02,0.06] },
};

// Центры диапазонов L (визуально ровная лесенка)
const L_CENTER: Record<(typeof STEPS)[number], number> = Object.fromEntries(
  STEPS.map(s => {
    const [lo, hi] = BOUNDS[s].L;
    return [s, (lo + hi) / 2];
  })
) as any;

// Linear алгоритм - генерирует абсолютно любой цвет в одном из шагов
export function generateCuloriPalette(
  baseHex: string,
  opts: {
    chromaScale?: number;
    hueShift?: number;
    gamut?: 'srgb' | 'p3';
  } = {}
): string[] {
  const toOKLCH = converter('oklch') as (c:any) => { l:number; c:number; h:number };
  const base = toOKLCH(baseHex) || { l:0.5, c:0.08, h:0 };
  const baseHue = normalizeHue(base.h ?? 0);

  // Спец-кейс: почти чистые белый/чёрный → нейтральная шкала
  if ((base.l ?? 0) > 0.985 && (base.c ?? 0) < 0.01) return neutralScale();
  if ((base.l ?? 0) < 0.015 && (base.c ?? 0) < 0.01) return neutralScale();
  
  // Спец-кейс: нейтральные цвета (серые) → нейтральная шкала
  if ((base.c ?? 0) < 0.05) return neutralScale();

  // Более контрастная кривая яркости
  const lightnessCurve = (step: number) => {
    // Используем более крутую кривую для большей контрастности
    const t = step / 10; // 0 до 1
    return 0.98 - (0.98 - 0.08) * Math.pow(t, 2.5); // Более крутая кривая
  };

  // Адаптивная кривая хроматики с защитой от обесцвечивания
  const baseC = base.c ?? 0.08;
  const chromaCurve = (step: number) => {
    const t = step / 10; // 0 до 1
    // Параболическая кривая: максимум в центре, минимум на краях
    const curve = 1 - Math.pow((t - 0.5) * 2, 2); // 1 в центре, 0 на краях
    // Защита от обесцвечивания: минимум 20% от базовой, максимум 120%
    const minChroma = Math.max(0.02, baseC * 0.2); // Минимум 0.02 или 20% от базовой
    const maxChroma = Math.max(0.1, baseC * 1.2); // Максимум 0.1 или 120% от базовой
    return minChroma + (maxChroma - minChroma) * curve;
  };

  // Определяем позицию ключевого цвета на основе его яркости
  let baseStepIndex = 5; // По умолчанию 500
  let minDiff = Infinity;
  
  STEPS.forEach((step, index) => {
    const targetL = lightnessCurve(index);
    const diff = Math.abs((base.l ?? 0.5) - targetL);
    if (diff < minDiff) {
      minDiff = diff;
      baseStepIndex = index;
    }
  });

  const out: string[] = [];

  STEPS.forEach((step, i) => {
    // Если это позиция базового цвета, возвращаем его точно
    if (i === baseStepIndex) {
      out.push(baseHex);
      return;
    }

    // Более контрастная яркость
    const targetL = lightnessCurve(i);
    
    // Адаптивная хроматика с защитой от обесцвечивания
    const targetC = chromaCurve(i);
    
    // ВСЕГДА используем тот же оттенок что и базовый цвет
    const h = baseHue;

    out.push(formatHex({ mode: 'oklch', l: targetL, c: targetC, h }));
  });

  return out;
}

// Semantic алгоритм - простой HSL-based
export function generateSemanticPalette(baseHex: string): string[] {
  const toOKLCH = converter('oklch') as (c:any) => { l:number; c:number; h:number };
  const base = toOKLCH(baseHex) || { l:0.5, c:0.08, h:0 };
  const baseHue = normalizeHue(base.h ?? 0);

  // Спец-кейс: нейтральные цвета
  if ((base.c ?? 0) < 0.05) return neutralScale();

  // Простой алгоритм: фиксированные L значения, адаптивная C
  const semanticSteps = [
    { l: 0.98, c: 0.02 }, // 50
    { l: 0.95, c: 0.04 }, // 100
    { l: 0.90, c: 0.06 }, // 200
    { l: 0.85, c: 0.08 }, // 300
    { l: 0.75, c: 0.10 }, // 400
    { l: 0.65, c: 0.12 }, // 500
    { l: 0.55, c: 0.10 }, // 600
    { l: 0.45, c: 0.08 }, // 700
    { l: 0.35, c: 0.06 }, // 800
    { l: 0.25, c: 0.04 }, // 900
    { l: 0.15, c: 0.02 }  // 950
  ];

  // Находим позицию базового цвета
  let baseIndex = 5;
  let minDiff = Infinity;
  
  semanticSteps.forEach((step, index) => {
    const diff = Math.abs((base.l ?? 0.5) - step.l);
    if (diff < minDiff) {
      minDiff = diff;
      baseIndex = index;
    }
  });

  const out: string[] = [];

  semanticSteps.forEach((step, i) => {
    // Если это позиция базового цвета, возвращаем его точно
    if (i === baseIndex) {
      out.push(baseHex);
      return;
    }

    // Адаптируем хроматику под базовый цвет
    const c = Math.min(step.c, (base.c ?? 0.08) * 1.5);
    
    out.push(formatHex({ 
      mode: 'oklch', 
      l: step.l, 
      c: c, 
      h: baseHue 
    }));
  });

  return out;
}

// Нейтральная (серая) шкала с теми же L-пределами; C → минимальная.
function neutralScale(): string[] {
  const out: string[] = [];
  STEPS.forEach(step => {
    const { L } = BOUNDS[step];
    // Для нейтральной шкалы используем среднюю яркость и очень низкую хроматику
    const l = (L[0] + L[1]) / 2;
    const c = 0.005; // Очень низкая хроматика для настоящего серого
    out.push(formatHex({ mode: 'oklch', l, c, h: 0 }));
  });
  return out;
}

function clamp(v:number, lo:number, hi:number) { return Math.min(hi, Math.max(lo, v)); }
function lerp(a:number, b:number, t:number) { return a + (b - a) * t; }
function normalizeHue(h:number) { let x = h % 360; return x < 0 ? x + 360 : x; }
function defaultHueShift(h:number) {
  // маленькая амплитуда дрейфа тона: тёплые/холодные ведут себя естественнее
  const rad = (h / 180) * Math.PI;
  return 8 * Math.cos(rad); // ~±8°
}
