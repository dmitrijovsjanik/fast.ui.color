import { useState, useEffect, useCallback } from 'react';
import { themeService, ThemeConfig } from './themeService';
import { ColorType } from '../utils/colorGenerator';
import { ThemeMode } from './themeProvider';

// =======================
// ХУКИ ДЛЯ РАБОТЫ С ТЕМАМИ
// =======================

/**
 * Хук для работы с сервисом тем
 */
export function useThemeService() {
  const [currentTheme, setCurrentTheme] = useState<string>('light');
  const [availableThemes, setAvailableThemes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Загружаем доступные темы при инициализации
  useEffect(() => {
    setAvailableThemes(themeService.getAllThemes());
    setCurrentTheme(themeService.getCurrentTheme()?.name || 'light');
  }, []);

  // Функция для переключения темы
  const switchTheme = useCallback((themeName: string) => {
    setIsLoading(true);
    try {
      const success = themeService.setCurrentTheme(themeName);
      if (success) {
        setCurrentTheme(themeName);
      }
    } catch (error) {
      console.error('Ошибка переключения темы:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Функция для получения конфигурации темы
  const getThemeConfig = useCallback((themeName: string) => {
    return themeService.getTheme(themeName);
  }, []);

  // Функция для обновления цветовой палитры
  const updateColorPalette = useCallback((themeName: string, type: ColorType, baseColor: string) => {
    setIsLoading(true);
    try {
      const success = themeService.updateColorPalette(themeName, type, baseColor);
      if (success && currentTheme === themeName) {
        // Обновляем состояние, если это текущая тема
        setCurrentTheme(themeName);
      }
      return success;
    } catch (error) {
      console.error('Ошибка обновления палитры:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentTheme]);

  // Функция для создания новой темы
  const createTheme = useCallback((config: ThemeConfig) => {
    setIsLoading(true);
    try {
      themeService.addTheme(config);
      setAvailableThemes(themeService.getAllThemes());
      return true;
    } catch (error) {
      console.error('Ошибка создания темы:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Функция для клонирования темы
  const cloneTheme = useCallback((originalName: string, newName: string) => {
    setIsLoading(true);
    try {
      const success = themeService.cloneTheme(originalName, newName);
      if (success) {
        setAvailableThemes(themeService.getAllThemes());
      }
      return success;
    } catch (error) {
      console.error('Ошибка клонирования темы:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Функция для удаления темы
  const removeTheme = useCallback((themeName: string) => {
    setIsLoading(true);
    try {
      const success = themeService.removeTheme(themeName);
      if (success) {
        setAvailableThemes(themeService.getAllThemes());
        // Если удаляемая тема была текущей, обновляем текущую тему
        if (currentTheme === themeName) {
          setCurrentTheme(themeService.getCurrentTheme()?.name || 'light');
        }
      }
      return success;
    } catch (error) {
      console.error('Ошибка удаления темы:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentTheme]);

  // Функция для экспорта темы в CSS
  const exportThemeCSS = useCallback((themeName: string) => {
    return themeService.exportThemeToCSS(themeName);
  }, []);

  return {
    currentTheme,
    availableThemes,
    isLoading,
    switchTheme,
    getThemeConfig,
    updateColorPalette,
    createTheme,
    cloneTheme,
    removeTheme,
    exportThemeCSS
  };
}

/**
 * Хук для работы с цветовыми палитрами
 */
export function useColorPalettes(themeName: string) {
  const [palettes, setPalettes] = useState<Record<ColorType, any>>({} as Record<ColorType, any>);
  const [isLoading, setIsLoading] = useState(false);

  // Загружаем палитры при изменении темы
  useEffect(() => {
    const theme = themeService.getTheme(themeName);
    if (theme) {
      setPalettes(theme.tokens.colors);
    }
  }, [themeName]);

  // Функция для обновления палитры
  const updatePalette = useCallback((type: ColorType, baseColor: string) => {
    setIsLoading(true);
    try {
      const success = themeService.updateColorPalette(themeName, type, baseColor);
      if (success) {
        const theme = themeService.getTheme(themeName);
        if (theme) {
          setPalettes(theme.tokens.colors);
        }
      }
      return success;
    } catch (error) {
      console.error('Ошибка обновления палитры:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [themeName]);

  return {
    palettes,
    isLoading,
    updatePalette
  };
}

/**
 * Хук для работы с токенами дизайна
 */
export function useDesignTokens(themeName: string) {
  const [tokens, setTokens] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Загружаем токены при изменении темы
  useEffect(() => {
    const theme = themeService.getTheme(themeName);
    if (theme) {
      setTokens(theme.tokens);
    }
  }, [themeName]);

  // Функция для обновления токенов
  const updateTokens = useCallback((newTokens: any) => {
    setIsLoading(true);
    try {
      const theme = themeService.getTheme(themeName);
      if (theme) {
        theme.tokens = { ...theme.tokens, ...newTokens };
        setTokens(theme.tokens);
        
        // Применяем изменения к документу, если это текущая тема
        if (themeService.getCurrentTheme()?.name === themeName) {
          themeService.setCurrentTheme(themeName);
        }
      }
    } catch (error) {
      console.error('Ошибка обновления токенов:', error);
    } finally {
      setIsLoading(false);
    }
  }, [themeName]);

  return {
    tokens,
    isLoading,
    updateTokens
  };
}

/**
 * Хук для работы с режимами тем
 */
export function useThemeModes() {
  const [currentMode, setCurrentMode] = useState<ThemeMode>('light');
  const [isSystemSupported, setIsSystemSupported] = useState(false);

  useEffect(() => {
    // Проверяем поддержку системной темы
    const checkSystemSupport = () => {
      const supported = typeof window !== 'undefined' && 
                       typeof window.matchMedia === 'function' &&
                       window.matchMedia('(prefers-color-scheme: dark)').media !== 'not all';
      setIsSystemSupported(supported);
    };

    checkSystemSupport();
  }, []);

  // Функция для переключения режима
  const switchMode = useCallback((mode: ThemeMode) => {
    setCurrentMode(mode);
    
    // Здесь можно добавить логику для применения режима
    // Например, создание новой темы с нужным режимом
  }, []);

  return {
    currentMode,
    isSystemSupported,
    switchMode
  };
}

/**
 * Хук для работы с доступностью цветов
 */
export function useColorAccessibility() {
  const [accessibilityReport, setAccessibilityReport] = useState<any>(null);

  // Функция для проверки доступности палитры
  const checkPaletteAccessibility = useCallback(() => {
    // Здесь можно добавить логику проверки доступности
    // Например, используя функции из colorGenerator.ts
    const report = {
      wcagAA: true,
      wcagAAA: false,
      issues: []
    };
    
    setAccessibilityReport(report);
    return report;
  }, []);

  return {
    accessibilityReport,
    checkPaletteAccessibility
  };
}

/**
 * Хук для работы с экспортом тем
 */
export function useThemeExport() {
  const [exportData, setExportData] = useState<any>(null);

  // Функция для экспорта темы в различных форматах
  const exportTheme = useCallback((themeName: string, format: 'css' | 'json' | 'tokens' = 'css') => {
    try {
      let data;
      
      switch (format) {
        case 'css':
          data = themeService.exportThemeToCSS(themeName);
          break;
        case 'json':
          data = themeService.getTheme(themeName);
          break;
        case 'tokens':
          const theme = themeService.getTheme(themeName);
          data = theme?.tokens;
          break;
        default:
          data = null;
      }
      
      setExportData(data);
      return data;
    } catch (error) {
      console.error('Ошибка экспорта темы:', error);
      return null;
    }
  }, []);

  // Функция для скачивания файла
  const downloadTheme = useCallback((themeName: string, format: 'css' | 'json' = 'css') => {
    const data = exportTheme(themeName, format);
    if (!data) return;

    const blob = new Blob([typeof data === 'string' ? data : JSON.stringify(data, null, 2)], {
      type: format === 'css' ? 'text/css' : 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${themeName}-theme.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [exportTheme]);

  return {
    exportData,
    exportTheme,
    downloadTheme
  };
}
