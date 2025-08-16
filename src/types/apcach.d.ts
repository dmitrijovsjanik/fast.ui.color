declare module 'apcach' {
  export function apcach(
    contrast: number | string,
    chroma: number | (() => number),
    hue: number,
    lightness?: number,
    colorSpace?: 'p3' | 'srgb'
  ): string;

  export function crToBg(
    color: string,
    contrast: number,
    model?: 'apca' | 'wcag',
    direction?: 'lighter' | 'darker' | 'auto'
  ): number;

  export function crToFg(
    color: string,
    contrast: number,
    model?: 'apca' | 'wcag',
    direction?: 'lighter' | 'darker' | 'auto'
  ): number;

  export function maxChroma(limit?: number): (() => number);

  export function apcachToCss(color: string, format: 'oklch' | 'rgb' | 'hex' | 'p3' | 'figma-p3'): string;

  export function cssToApcach(
    color: string,
    options: { bg: string } | { fg: string }
  ): string;

  export function setContrast(
    color: string,
    contrast: number | ((cr: number) => number)
  ): string;

  export function setChroma(
    color: string,
    chroma: number | ((c: number) => number)
  ): string;

  export function setHue(
    color: string,
    hue: number | ((h: number) => number)
  ): string;
}
