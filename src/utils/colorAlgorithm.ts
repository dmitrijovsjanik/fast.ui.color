// Алгоритм автоматического подбора цветов на основе "A Nice Red"
// https://medium.com/@Jahallahan/a-nice-red-instantly-generate-ui-colours-that-complement-your-brand-b06a566b4159

interface HSLColor {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

// Конвертация HEX в HSL
function hexToHsl(hex: string): HSLColor {
  // Убираем # если есть
  hex = hex.replace('#', '');
  
  // Конвертируем в RGB
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

// Конвертация HSL в HEX
function hslToHex(h: number, s: number, l: number): string {
  h = h / 360;
  s = s / 100;
  l = l / 100;
  
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Алгоритм для Success (Green) цвета
function getSuccessColor(brandColor: string): string {
  const hsl = hexToHsl(brandColor);
  
  const getSuccessH = (h: number): number => {
    if (h < 25 || h >= 335) return 120;
    if (h >= 25 && h < 75) return 80;
    if (h >= 150 && h < 210) return 90;
    if (h >= 210 && h < 285) return 100;
    if (h >= 285 && h < 335) return 130;
    return h;
  };
  
  const getSuccessS = (s: number): number => {
    if (s - 5 < 55) return 55;
    if (s - 5 > 70) return 70;
    return s - 5;
  };
  
  const getSuccessL = (l: number): number => {
    if (l + 5 < 45) return 45;
    if (l + 5 > 60) return 60;
    return l + 5;
  };
  
  const newH = getSuccessH(hsl.h);
  const newS = getSuccessS(hsl.s);
  const newL = getSuccessL(hsl.l);
  
  return hslToHex(newH, newS, newL);
}

// Алгоритм для Error (Red) цвета
function getErrorColor(brandColor: string): string {
  const hsl = hexToHsl(brandColor);
  
  const getErrorH = (h: number): number => {
    if (h >= 15 && h < 60) return 5;
    if (h >= 60 && h < 140) return 10;
    if (h >= 140 && h < 190) return 357;
    if (h >= 190 && h < 240) return 0;
    if (h >= 240 && h < 350) return 355;
    return h;
  };
  
  const getErrorS = (s: number): number => {
    if (s < 75) return 75;
    if (s > 85) return 85;
    return s;
  };
  
  const getErrorL = (l: number): number => {
    if (l + 5 < 45) return 45;
    if (l + 5 > 55) return 55;
    return l + 5;
  };
  
  const newH = getErrorH(hsl.h);
  const newS = getErrorS(hsl.s);
  const newL = getErrorL(hsl.l);
  
  return hslToHex(newH, newS, newL);
}

// Алгоритм для Warning (Amber) цвета
function getWarningColor(brandColor: string): string {
  const hsl = hexToHsl(brandColor);
  
  const getWarningH = (h: number): number => {
    if (h >= 240 || h < 60) return 42;
    if (h >= 60 && h < 140) return 40;
    if (h >= 140 && h < 240) return 38;
    return h;
  };
  
  const getWarningS = (s: number): number => {
    if (s + 5 < 80) return 80;
    if (s + 5 > 100) return 100;
    return s + 5;
  };
  
  const getWarningL = (l: number): number => {
    if (l + 15 < 55) return 55;
    if (l + 15 > 65) return 65;
    return l + 15;
  };
  
  const newH = getWarningH(hsl.h);
  const newS = getWarningS(hsl.s);
  const newL = getWarningL(hsl.l);
  
  return hslToHex(newH, newS, newL);
}

// Алгоритм для Info (Blue) цвета - используем Apple за основу
function getInfoColor(brandColor: string): string {
  const hsl = hexToHsl(brandColor);
  
  // Apple использует синие оттенки для Info
  const getInfoH = (h: number): number => {
    // Если бренд-цвет уже синий, делаем небольшое отклонение
    if (h >= 200 && h <= 260) {
      return h + (h < 230 ? 10 : -10); // Слегка смещаем оттенок
    }
    // Для других цветов используем классический Apple синий
    if (h < 60 || h >= 300) return 210; // Apple Blue
    if (h >= 60 && h < 120) return 200; // Более голубой
    if (h >= 120 && h < 180) return 220; // Более синий
    if (h >= 180 && h < 240) return 205; // Средний синий
    if (h >= 240 && h < 300) return 215; // Темно-синий
    return 210; // По умолчанию Apple Blue
  };
  
  const getInfoS = (s: number): number => {
    // Apple использует умеренную насыщенность для Info
    if (s < 60) return 60;
    if (s > 80) return 80;
    return s;
  };
  
  const getInfoL = (l: number): number => {
    // Apple использует среднюю яркость для Info
    if (l < 40) return 40;
    if (l > 60) return 60;
    return l;
  };
  
  const newH = getInfoH(hsl.h);
  const newS = getInfoS(hsl.s);
  const newL = getInfoL(hsl.l);
  
  return hslToHex(newH, newS, newL);
}

// Алгоритм для Neutral (Grey) цвета
function getNeutralColor(brandColor: string): string {
  const hsl = hexToHsl(brandColor);
  
  // Для нейтрального цвета используем тот же оттенок, но с низкой насыщенностью
  const getNeutralH = (h: number): number => {
    return h; // Сохраняем тот же оттенок
  };
  
  const getNeutralS = (s: number): number => {
    // Низкая насыщенность для нейтрального цвета
    return Math.max(5, Math.min(15, s * 0.1));
  };
  
  const getNeutralL = (l: number): number => {
    // Слегка темнее для лучшего контраста
    if (l + 10 < 40) return 40;
    if (l + 10 > 60) return 60;
    return l + 10;
  };
  
  const newH = getNeutralH(hsl.h);
  const newS = getNeutralS(hsl.s);
  const newL = getNeutralL(hsl.l);
  
  return hslToHex(newH, newS, newL);
}

// Основная функция для генерации всех статусных цветов
export function generateStatusColors(brandColor: string): {
  info: string;
  success: string;
  error: string;
  warning: string;
  neutral: string;
} {
  return {
    info: getInfoColor(brandColor),
    success: getSuccessColor(brandColor),
    error: getErrorColor(brandColor),
    warning: getWarningColor(brandColor),
    neutral: getNeutralColor(brandColor)
  };
}

// Функция для проверки, был ли цвет изменен вручную
export function isColorManuallyChanged(originalColor: string, currentColor: string): boolean {
  return originalColor.toLowerCase() !== currentColor.toLowerCase();
}
