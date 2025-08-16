export type ColorPaletteType = 'brand' | 'accent' | 'positive' | 'warning' | 'negative' | 'neutral';

export type ScaleType = 'Semantic' | 'Linear';

export type NamingType = '1,2,3...' | 'A,B,C...' | 'Custom';

export interface ColorPaletteData {
  type: ColorPaletteType;
  locked: boolean;
  colors?: string[];
}

export interface NavigationState {
  activeMainNav: string;
  activeSecondaryNav: string;
}

export interface SettingsState {
  selectedScale: ScaleType;
  selectedNaming: NamingType;
}
