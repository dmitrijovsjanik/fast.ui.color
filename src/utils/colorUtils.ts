import { ColorPaletteType } from '../types/FastUI';

export const generateColorPalette = (type: ColorPaletteType, count: number = 12): string[] => {
  const baseHues = {
    brand: 0,
    accent: 200,
    positive: 120,
    warning: 60,
    negative: 0,
    neutral: 0
  };
  
  const baseHue = baseHues[type];
  
  if (type === 'neutral') {
    return Array.from({ length: count }, (_, i) => 
      `hsl(0, 0%, ${90 - i * 7}%)`
    );
  }
  
  return Array.from({ length: count }, (_, i) => 
    `hsl(${baseHue + i * 15}, 70%, ${50 + i * 4}%)`
  );
};

export const getColorName = (type: ColorPaletteType, index: number): string => {
  const names = {
    brand: 'Brand',
    accent: 'Accent',
    positive: 'Positive',
    warning: 'Warning',
    negative: 'Negative',
    neutral: 'Neutral'
  };
  
  return `${names[type]} ${index + 1}`;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};
