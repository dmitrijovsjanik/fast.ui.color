import { ThemeMode } from './themeProvider';
import { ColorPalette, ColorType, generateColorPalette } from '../utils/colorGenerator';

// =======================
// ТИПЫ И ИНТЕРФЕЙСЫ
// =======================

export interface DesignToken {
  name: string;
  value: string | number;
  category: 'color' | 'typography' | 'spacing' | 'border' | 'shadow' | 'animation';
  description?: string;
}

export interface TypographyToken {
  fontSize: string;
  fontWeight: number | string;
  lineHeight: number;
  letterSpacing?: string;
  fontFamily?: string;
}

export interface SpacingToken {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
}

export interface BorderToken {
  radius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  width: {
    thin: string;
    normal: string;
    thick: string;
  };
}

export interface ShadowToken {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface AnimationToken {
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  easing: {
    ease: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
}

export interface ThemeTokens {
  colors: Record<ColorType, ColorPalette>;
  typography: TypographyToken;
  spacing: SpacingToken;
  border: BorderToken;
  shadow: ShadowToken;
  animation: AnimationToken;
}

export interface ThemeConfig {
  name: string;
  mode: ThemeMode;
  tokens: ThemeTokens;
  customProperties?: Record<string, string>;
}

// =======================
// КОНСТАНТЫ ПО УМОЛЧАНИЮ
// =======================

export const DEFAULT_TYPOGRAPHY: TypographyToken = {
  fontSize: '16px',
  fontWeight: 400,
  lineHeight: 1.5,
  letterSpacing: '0.01em',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

export const DEFAULT_SPACING: SpacingToken = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px'
};

export const DEFAULT_BORDER: BorderToken = {
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px'
  },
  width: {
    thin: '1px',
    normal: '2px',
    thick: '4px'
  }
};

export const DEFAULT_SHADOW: ShadowToken = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
};

export const DEFAULT_ANIMATION: AnimationToken = {
  duration: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms'
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out'
  }
};

// =======================
// СЕРВИС УПРАВЛЕНИЯ ТЕМАМИ
// =======================

export class ThemeService {
  private themes: Map<string, ThemeConfig> = new Map();
  private currentTheme: string = 'default';

  constructor() {
    this.initializeDefaultThemes();
  }

  /**
   * Инициализирует темы по умолчанию
   */
  private initializeDefaultThemes(): void {
    // Светлая тема
    this.addTheme({
      name: 'light',
      mode: 'light',
      tokens: {
        colors: this.generateDefaultColorTokens('#3b82f6'), // Синий бренд
        typography: DEFAULT_TYPOGRAPHY,
        spacing: DEFAULT_SPACING,
        border: DEFAULT_BORDER,
        shadow: DEFAULT_SHADOW,
        animation: DEFAULT_ANIMATION
      }
    });

    // Темная тема
    this.addTheme({
      name: 'dark',
      mode: 'dark',
      tokens: {
        colors: this.generateDefaultColorTokens('#60a5fa'), // Светло-синий для темной темы
        typography: DEFAULT_TYPOGRAPHY,
        spacing: DEFAULT_SPACING,
        border: DEFAULT_BORDER,
        shadow: {
          sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
          md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
          lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
          xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)'
        },
        animation: DEFAULT_ANIMATION
      }
    });
  }

  /**
   * Генерирует токены цветов по умолчанию
   */
  private generateDefaultColorTokens(brandColor: string): Record<ColorType, ColorPalette> {
    const colorTypes: ColorType[] = ['brand', 'accent', 'info', 'success', 'error', 'warning', 'neutral'];
    const tokens: Record<ColorType, ColorPalette> = {} as Record<ColorType, ColorPalette>;

    colorTypes.forEach(type => {
      const baseColor = type === 'brand' ? brandColor : this.generateBaseColorForType(type, brandColor);
      tokens[type] = generateColorPalette({
        baseColor,
        type,
        steps: 11,
        ensureAccessibility: true
      });
    });

    return tokens;
  }

  /**
   * Генерирует базовый цвет для определенного типа
   */
  private generateBaseColorForType(type: ColorType, brandColor: string): string {
    // Здесь можно добавить логику генерации цветов на основе бренд-цвета
    const colorMap: Record<ColorType, string> = {
      brand: brandColor,
      accent: '#f59e0b', // Оранжевый
      info: '#06b6d4', // Голубой
      success: '#10b981', // Зеленый
      error: '#ef4444', // Красный
      warning: '#f59e0b', // Оранжевый
      neutral: '#6b7280' // Серый
    };

    return colorMap[type];
  }

  /**
   * Добавляет новую тему
   */
  addTheme(config: ThemeConfig): void {
    this.themes.set(config.name, config);
  }

  /**
   * Получает тему по имени
   */
  getTheme(name: string): ThemeConfig | undefined {
    return this.themes.get(name);
  }

  /**
   * Получает текущую тему
   */
  getCurrentTheme(): ThemeConfig | undefined {
    return this.themes.get(this.currentTheme);
  }

  /**
   * Устанавливает текущую тему
   */
  setCurrentTheme(name: string): boolean {
    if (this.themes.has(name)) {
      this.currentTheme = name;
      this.applyThemeToDocument(name);
      return true;
    }
    return false;
  }

  /**
   * Получает список всех тем
   */
  getAllThemes(): string[] {
    return Array.from(this.themes.keys());
  }

  /**
   * Применяет тему к документу
   */
  private applyThemeToDocument(themeName: string): void {
    const theme = this.themes.get(themeName);
    if (!theme) return;

    const root = document.documentElement;
    
    // Применяем CSS переменные
    this.applyTokensToDocument(theme.tokens);
    
    // Применяем кастомные свойства
    if (theme.customProperties) {
      Object.entries(theme.customProperties).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value);
      });
    }
  }

  /**
   * Применяет токены к документу
   */
  private applyTokensToDocument(tokens: ThemeTokens): void {
    const root = document.documentElement;

    // Применяем цвета
    Object.entries(tokens.colors).forEach(([type, palette]) => {
      palette.steps.forEach((step) => {
        root.style.setProperty(`--color-${type}-${step.step}`, step.hex);
        root.style.setProperty(`--color-${type}-${step.step}-contrast`, step.contrast.toString());
      });
    });

    // Применяем типографику
    Object.entries(tokens.typography).forEach(([key, value]) => {
      root.style.setProperty(`--typography-${key}`, value.toString());
    });

    // Применяем отступы
    Object.entries(tokens.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });

    // Применяем границы
    Object.entries(tokens.border.radius).forEach(([key, value]) => {
      root.style.setProperty(`--border-radius-${key}`, value);
    });
    Object.entries(tokens.border.width).forEach(([key, value]) => {
      root.style.setProperty(`--border-width-${key}`, value);
    });

    // Применяем тени
    Object.entries(tokens.shadow).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });

    // Применяем анимации
    Object.entries(tokens.animation.duration).forEach(([key, value]) => {
      root.style.setProperty(`--animation-duration-${key}`, value);
    });
    Object.entries(tokens.animation.easing).forEach(([key, value]) => {
      root.style.setProperty(`--animation-easing-${key}`, value);
    });
  }

  /**
   * Экспортирует тему в CSS
   */
  exportThemeToCSS(themeName: string): string {
    const theme = this.themes.get(themeName);
    if (!theme) return '';

    let css = `/* Theme: ${theme.name} */\n`;
    css += `[data-theme="${theme.mode}"] {\n`;

    // Экспортируем токены
    css += this.exportTokensToCSS(theme.tokens);

    // Экспортируем кастомные свойства
    if (theme.customProperties) {
      Object.entries(theme.customProperties).forEach(([key, value]) => {
        css += `  --${key}: ${value};\n`;
      });
    }

    css += '}\n';
    return css;
  }

  /**
   * Экспортирует токены в CSS
   */
  private exportTokensToCSS(tokens: ThemeTokens): string {
    let css = '';

    // Экспортируем цвета
    Object.entries(tokens.colors).forEach(([type, palette]) => {
      palette.steps.forEach((step) => {
        css += `  --color-${type}-${step.step}: ${step.hex};\n`;
        css += `  --color-${type}-${step.step}-contrast: ${step.contrast};\n`;
      });
    });

    // Экспортируем типографику
    Object.entries(tokens.typography).forEach(([key, value]) => {
      css += `  --typography-${key}: ${value};\n`;
    });

    // Экспортируем отступы
    Object.entries(tokens.spacing).forEach(([key, value]) => {
      css += `  --spacing-${key}: ${value};\n`;
    });

    // Экспортируем границы
    Object.entries(tokens.border.radius).forEach(([key, value]) => {
      css += `  --border-radius-${key}: ${value};\n`;
    });
    Object.entries(tokens.border.width).forEach(([key, value]) => {
      css += `  --border-width-${key}: ${value};\n`;
    });

    // Экспортируем тени
    Object.entries(tokens.shadow).forEach(([key, value]) => {
      css += `  --shadow-${key}: ${value};\n`;
    });

    // Экспортируем анимации
    Object.entries(tokens.animation.duration).forEach(([key, value]) => {
      css += `  --animation-duration-${key}: ${value};\n`;
    });
    Object.entries(tokens.animation.easing).forEach(([key, value]) => {
      css += `  --animation-easing-${key}: ${value};\n`;
    });

    return css;
  }

  /**
   * Обновляет цветовую палитру для определенного типа
   */
  updateColorPalette(themeName: string, type: ColorType, baseColor: string): boolean {
    const theme = this.themes.get(themeName);
    if (!theme) return false;

    const newPalette = generateColorPalette({
      baseColor,
      type,
      steps: 11,
      ensureAccessibility: true
    });

    theme.tokens.colors[type] = newPalette;
    
    // Применяем изменения к документу, если это текущая тема
    if (this.currentTheme === themeName) {
      this.applyThemeToDocument(themeName);
    }

    return true;
  }

  /**
   * Создает копию темы
   */
  cloneTheme(originalName: string, newName: string): boolean {
    const originalTheme = this.themes.get(originalName);
    if (!originalTheme) return false;

    const clonedTheme: ThemeConfig = {
      ...originalTheme,
      name: newName
    };

    this.themes.set(newName, clonedTheme);
    return true;
  }

  /**
   * Удаляет тему
   */
  removeTheme(name: string): boolean {
    if (name === 'light' || name === 'dark') {
      console.warn('Нельзя удалить базовые темы');
      return false;
    }

    const deleted = this.themes.delete(name);
    
    // Если удаляемая тема была текущей, переключаемся на светлую
    if (deleted && this.currentTheme === name) {
      this.setCurrentTheme('light');
    }

    return deleted;
  }
}

// =======================
// ЭКСПОРТ СИНГЛТОНА
// =======================

export const themeService = new ThemeService();
