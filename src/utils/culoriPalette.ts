import { converter } from 'culori';
import { CurveSettings } from '../types/curveEditor';
import { generateApcachPaletteByType } from './apcachPalette';

// Интерфейс для опций генерации палитры
interface PaletteOptions {
  lightnessCurve?: CurveSettings;
  selectedScale?: 'Linear' | 'Semantic';
  useApcach?: boolean; // Использовать APCA для генерации
  colorType?: 'brand' | 'accent' | 'info' | 'success' | 'error' | 'warning' | 'neutral';
}

// =======================
// Smooth OKLCH Shades → HEX
// =======================

// Интерфейс для опций генерации оттенков
interface ShadeOptions {
  hue?: number;
  chroma?: number;
  steps?: number;
  Lmin?: number;
  Lmax?: number;
  easingK?: number;
}

// Главная функция: генерирует "ровные" шейды
// opts: {
//   hue: 0..360           // оттенок в градусах
//   chroma: 0..0.4        // базовая насыщенность (0.10..0.16 — аккуратно)
//   steps: number         // сколько шейдов
//   Lmin: 0..1            // нижняя светлота (по умолчанию 0.12)
//   Lmax: 0..1            // верхняя светлота (по умолчанию 0.96)
//   easingK: number       // сила toe/shoulder (1..3), 1.4 — мягко
// }
function generateSmoothShades(opts: ShadeOptions = {}) {
  const {
    hue = 220,
    chroma = 0.12,
    steps = 10,
    Lmin = 0.12,
    Lmax = 0.96,
    easingK = 1.4
  } = opts;

  const shades = [];
  for (let i = 0; i < steps; i++) {
    const t = steps === 1 ? 0 : i / (steps - 1);

    // ——— Мягкая равномерность восприятия (toe/shoulder)
    const te = schlickEase(t, easingK);
    let L = Lmin + (Lmax - Lmin) * te;

    // ——— Снижаем хрому на краях светлоты (избегаем клипа/грязи)
    const C = chroma * chromaTaper(L, Lmin, Lmax);

    // ——— Поддерживаем фиксированный оттенок
    const h = hue;

    // ——— Перевод в HEX с бережной подрезкой по гамуту
    const hex = oklchToHexClamped(L, C, h);
    shades.push(hex);
  }
  return shades;
}

// =======================
// Вспомогательные функции
// =======================

// S-образная кривая Шлика. Больше k — сильнее "toe", сгущает низ.
function schlickEase(t: number, k: number = 1.4): number {
  // Ограничим t в [0,1]
  const x = Math.min(1, Math.max(0, t));
  // Вариант Schlick bias/gain: плавная S-кривая
  // gain(x, a) = x < .5 ? bias(2x, a)/2 : 1 - bias(2-2x, a)/2
  // Здесь используем простой bias через k
  const bias = (x: number, a: number) => x / ( (a - 1) * (1 - x) + 1 );
  const g = x < 0.5 ? 0.5 * bias(2*x, k) : 1 - 0.5 * bias(2 - 2*x, k);
  return g;
}

// Плавное сужение хромы у краёв шкалы L
function chromaTaper(L: number, Lmin: number, Lmax: number): number {
  // smoothstep по центру диапазона даёт максимум C; у краёв C падает
  const s = smoothstep(Lmin, (Lmin + Lmax)/2, L) * (1 - smoothstep((Lmin + Lmax)/2, Lmax, L));
  // Нормируем пик в 1 и задаём минимальный порог, чтобы не "серело" рано
  const peak = 0.25; // контролирует ширину "колокола": меньше — шире
  const t = Math.max(0.35, s / Math.max(1e-6, peak));
  return Math.min(1, t);
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

// ——— Конверсия OKLCH → sRGB HEX с подрезкой по гамуту (скейлим C)
function oklchToHexClamped(L: number, C: number, hDeg: number): string {
  // Сначала пытаемся без подрезки
  let hex = oklchToHex(L, C, hDeg);
  if (hex) return hex;

  // Если вылетели из гамута — бинарным поиском уменьшаем C
  let lo = 0, hi = C, mid: number, attempts = 18;
  while (attempts-- > 0) {
    mid = (lo + hi) / 2;
    const candidate = oklchToHex(L, mid, hDeg);
    if (candidate) { // в гамуте
      hex = candidate;
      lo = mid;
    } else {
      hi = mid;
    }
  }
  // Если совсем беда — сведём в серый по L
  return hex || oklchToHex(L, 0, hDeg) || "#000000";
}

// OKLCH → HEX (без внешней подрезки). Вернёт null, если вне sRGB.
function oklchToHex(L: number, C: number, hDeg: number): string | null {
  const h = (hDeg * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);

  // OKLab
  const LabL = L;
  const L_ = LabL + 0.3963377774 * a + 0.2158037573 * b;
  const M_ = LabL - 0.1055613458 * a - 0.0638541728 * b;
  const S_ = LabL - 0.0894841775 * a - 1.2914855480 * b;

  const L3 = L_ * L_ * L_;
  const M3 = M_ * M_ * M_;
  const S3 = S_ * S_ * S_;

  // линейный sRGB
  let r = +4.0767416621 * L3 - 3.3077115913 * M3 + 0.2309699292 * S3;
  let g = -1.2684380046 * L3 + 2.6097574011 * M3 - 0.3413193965 * S3;
  let b_ = -0.0041960863 * L3 - 0.7034186147 * M3 + 1.7076147010 * S3;

  // Проверка гамута до гамма-кривой
  if (!inGamut01(r, g, b_)) return null;

  // Гамма sRGB
  r = linToSRGB(r);
  g = linToSRGB(g);
  b_ = linToSRGB(b_);

  // Повторная проверка и кламп на всякий
  if (!isFinite(r) || !isFinite(g) || !isFinite(b_)) return null;
  r = clamp01(r); g = clamp01(g); b_ = clamp01(b_);

  return rgbToHex(r, g, b_);
}

function inGamut01(r: number, g: number, b: number): boolean {
  // чуть позволяем микроскопическое отрицание/переполнение
  const eps = 1e-6;
  return r >= -eps && r <= 1 + eps &&
         g >= -eps && g <= 1 + eps &&
         b >= -eps && b <= 1 + eps;
}

function linToSRGB(x: number): number {
  return x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(Math.max(0, x), 1/2.4) - 0.055;
}

function clamp01(x: number): number { return Math.min(1, Math.max(0, x)); }

function rgbToHex(r: number, g: number, b: number): string {
  const R = Math.round(r * 255);
  const G = Math.round(g * 255);
  const B = Math.round(b * 255);
  return '#' + [R, G, B].map(v => v.toString(16).padStart(2, '0')).join('');
}

// =======================
// Основная функция генерации палитры
// =======================

// Генерация палитры из базового цвета с использованием нового алгоритма
export function generateCuloriPalette(baseColor: string, opts: PaletteOptions = {}): string[] {
  // Если включен APCA, используем его для генерации
  if (opts.useApcach && opts.colorType) {
    console.log('=== APCA АЛГОРИТМ ===');
    console.log('Базовый цвет:', baseColor);
    console.log('Тип цвета:', opts.colorType);
    
    const steps = opts.selectedScale === 'Linear' ? 11 : 12;
    const apcachPalette = generateApcachPaletteByType(baseColor, opts.colorType, steps);
    
    console.log('APCA палитра:', apcachPalette);
    return apcachPalette;
  }

  // Конвертируем базовый цвет в OKLCH
  const oklchColor = converter('oklch')(baseColor);
  if (!oklchColor) {
    console.error('Не удалось конвертировать цвет в OKLCH:', baseColor);
    return [];
  }

  const { l, c, h } = oklchColor;
  
  // Определяем параметры для генерации
  const steps = opts.selectedScale === 'Linear' ? 11 : 12;
  const hue = (h ?? 0) % 360; // Нормализуем оттенок
  const chroma = c || 0.12;
  
  // Для нейтрального цвета используем очень низкую хроматику
  const isNeutralColor = (c ?? 0) < 0.05;
  const adjustedChroma = isNeutralColor ? 0.03 : chroma;
  
  // Генерируем палитру с новым алгоритмом (от светлого к темному)
  const shades = generateSmoothShades({
    hue: hue,
    chroma: adjustedChroma,
    steps: steps,
    Lmin: 0.98,    // как "25/50" (светлый)
    Lmax: 0.08,    // как "950/900" (темный)
    easingK: 1.4   // сила сгущения в тенях
  });

  // Тестируем линейность (для отладки)
  console.log('=== НОВЫЙ АЛГОРИТМ ===');
  console.log('Базовый цвет:', baseColor);
  console.log('OKLCH:', { l, c, h });
  console.log('Сгенерированные оттенки:', shades);
  
  return shades;
}

// Устаревшие функции (оставляем для совместимости)
export function generateDefaultLightnessValues(): number[] {
  // Используем новый алгоритм для генерации значений яркости (от светлого к темному)
  const steps = 11;
  const values = [];
  
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const te = schlickEase(t, 1.4);
    const L = 0.98 - (0.98 - 0.08) * te; // От светлого к темному
    values.push(L);
  }
  
  return values;
}

export function generateDefaultChromaValues(): number[] {
  // Используем chromaTaper для генерации значений хроматики (от светлого к темному)
  const steps = 11;
  const values = [];
  
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const te = schlickEase(t, 1.4);
    const L = 0.98 - (0.98 - 0.08) * te; // От светлого к темному
    const C = 0.12 * chromaTaper(L, 0.08, 0.98);
    values.push(C);
  }
  
  return values;
}


