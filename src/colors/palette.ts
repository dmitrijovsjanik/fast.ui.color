// Radix UI Color System - Flexible and Themeable
// Based on @radix-ui/colors and @radix-ui/themes

export interface ColorScale {
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  9: string;
  10: string;
  11: string;
  12: string;
}

export interface ColorPalette {
  gray: ColorScale;
  mauve: ColorScale;
  slate: ColorScale;
  sage: ColorScale;
  olive: ColorScale;
  sand: ColorScale;
  tomato: ColorScale;
  red: ColorScale;
  ruby: ColorScale;
  crimson: ColorScale;
  pink: ColorScale;
  plum: ColorScale;
  purple: ColorScale;
  violet: ColorScale;
  indigo: ColorScale;
  blue: ColorScale;
  cyan: ColorScale;
  teal: ColorScale;
  green: ColorScale;
  grass: ColorScale;
  brown: ColorScale;
  orange: ColorScale;
  sky: ColorScale;
  mint: ColorScale;
  lime: ColorScale;
  yellow: ColorScale;
  amber: ColorScale;
  gold: ColorScale;
  bronze: ColorScale;
}

// Light Theme Colors (Default)
export const lightColors: ColorPalette = {
  gray: {
    1: 'hsl(0 0% 99.0%)',
    2: 'hsl(0 0% 97.3%)',
    3: 'hsl(0 0% 95.1%)',
    4: 'hsl(0 0% 93.0%)',
    5: 'hsl(0 0% 90.9%)',
    6: 'hsl(0 0% 88.7%)',
    7: 'hsl(0 0% 85.8%)',
    8: 'hsl(0 0% 78.0%)',
    9: 'hsl(0 0% 56.1%)',
    10: 'hsl(0 0% 52.3%)',
    11: 'hsl(0 0% 43.5%)',
    12: 'hsl(0 0% 9.0%)',
  },
  blue: {
    1: 'hsl(206 100% 99.2%)',
    2: 'hsl(210 100% 98.0%)',
    3: 'hsl(209 100% 96.6%)',
    4: 'hsl(210 98% 94.0%)',
    5: 'hsl(209 95% 90.1%)',
    6: 'hsl(209 81% 84.5%)',
    7: 'hsl(208 77% 76.9%)',
    8: 'hsl(206 81% 65.3%)',
    9: 'hsl(206 100% 50.0%)',
    10: 'hsl(208 100% 47.3%)',
    11: 'hsl(211 100% 43.2%)',
    12: 'hsl(211 100% 15.0%)',
  },
  green: {
    1: 'hsl(136 50% 98.9%)',
    2: 'hsl(138 62.5% 96.9%)',
    3: 'hsl(139 55.2% 94.5%)',
    4: 'hsl(140 48.7% 91.0%)',
    5: 'hsl(141 43.7% 86.0%)',
    6: 'hsl(143 40.3% 79.0%)',
    7: 'hsl(146 38.5% 69.0%)',
    8: 'hsl(151 40.2% 54.1%)',
    9: 'hsl(151 55.0% 41.5%)',
    10: 'hsl(152 57.5% 37.6%)',
    11: 'hsl(153 67.0% 28.5%)',
    12: 'hsl(155 40.0% 14.0%)',
  },
  red: {
    1: 'hsl(359 100% 99.4%)',
    2: 'hsl(359 100% 98.6%)',
    3: 'hsl(360 100% 96.8%)',
    4: 'hsl(360 100% 94.8%)',
    5: 'hsl(360 100% 91.9%)',
    6: 'hsl(360 100% 87.1%)',
    7: 'hsl(360 100% 80.6%)',
    8: 'hsl(360 100% 71.4%)',
    9: 'hsl(360 100% 50.0%)',
    10: 'hsl(360 100% 45.2%)',
    11: 'hsl(360 100% 39.2%)',
    12: 'hsl(360 100% 15.0%)',
  },
  // Добавлю остальные цвета по мере необходимости
  // Для экономии места показываю основные
} as ColorPalette;

// Dark Theme Colors
export const darkColors: ColorPalette = {
  gray: {
    1: 'hsl(0 0% 9.0%)',
    2: 'hsl(0 0% 10.9%)',
    3: 'hsl(0 0% 13.1%)',
    4: 'hsl(0 0% 15.0%)',
    5: 'hsl(0 0% 17.0%)',
    6: 'hsl(0 0% 19.0%)',
    7: 'hsl(0 0% 21.0%)',
    8: 'hsl(0 0% 25.0%)',
    9: 'hsl(0 0% 43.9%)',
    10: 'hsl(0 0% 47.7%)',
    11: 'hsl(0 0% 56.5%)',
    12: 'hsl(0 0% 91.0%)',
  },
  blue: {
    1: 'hsl(211 100% 15.0%)',
    2: 'hsl(211 100% 18.0%)',
    3: 'hsl(211 100% 21.0%)',
    4: 'hsl(211 100% 24.0%)',
    5: 'hsl(211 100% 27.0%)',
    6: 'hsl(211 100% 30.0%)',
    7: 'hsl(211 100% 33.0%)',
    8: 'hsl(211 100% 36.0%)',
    9: 'hsl(206 100% 50.0%)',
    10: 'hsl(208 100% 47.3%)',
    11: 'hsl(211 100% 43.2%)',
    12: 'hsl(206 100% 99.2%)',
  },
  green: {
    1: 'hsl(155 40.0% 14.0%)',
    2: 'hsl(155 40.0% 16.0%)',
    3: 'hsl(155 40.0% 18.0%)',
    4: 'hsl(155 40.0% 20.0%)',
    5: 'hsl(155 40.0% 22.0%)',
    6: 'hsl(155 40.0% 24.0%)',
    7: 'hsl(155 40.0% 26.0%)',
    8: 'hsl(155 40.0% 28.0%)',
    9: 'hsl(151 55.0% 41.5%)',
    10: 'hsl(152 57.5% 37.6%)',
    11: 'hsl(153 67.0% 28.5%)',
    12: 'hsl(136 50% 98.9%)',
  },
  red: {
    1: 'hsl(360 100% 15.0%)',
    2: 'hsl(360 100% 18.0%)',
    3: 'hsl(360 100% 21.0%)',
    4: 'hsl(360 100% 24.0%)',
    5: 'hsl(360 100% 27.0%)',
    6: 'hsl(360 100% 30.0%)',
    7: 'hsl(360 100% 33.0%)',
    8: 'hsl(360 100% 36.0%)',
    9: 'hsl(360 100% 50.0%)',
    10: 'hsl(360 100% 45.2%)',
    11: 'hsl(360 100% 39.2%)',
    12: 'hsl(359 100% 99.4%)',
  },
} as ColorPalette;

// Utility function to get color by scale
export function getColor(palette: ColorPalette, color: keyof ColorPalette, scale: keyof ColorScale): string {
  return palette[color][scale];
}

// Utility function to get all scales for a color
export function getColorScales(palette: ColorPalette, color: keyof ColorPalette): ColorScale {
  return palette[color];
}
