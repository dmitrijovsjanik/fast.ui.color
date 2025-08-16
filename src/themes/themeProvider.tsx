import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { lightColors, darkColors, ColorPalette } from '../colors/palette';

// =======================
// ТИПЫ И ИНТЕРФЕЙСЫ
// =======================

export type ThemeMode = 'light' | 'dark' | 'system';

export interface Theme {
  mode: ThemeMode;
  colors: ColorPalette;
  isDark: boolean;
  isSystem: boolean;
}

export interface ThemeContextType {
  theme: Theme;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isSystemSupported: boolean;
}

// =======================
// КОНСТАНТЫ
// =======================

const THEME_STORAGE_KEY = 'fast-ui-theme';
const SYSTEM_THEME_QUERY = '(prefers-color-scheme: dark)';

// =======================
// УТИЛИТЫ
// =======================

/**
 * Проверяет поддержку системной темы
 */
function isSystemThemeSupported(): boolean {
  return typeof window !== 'undefined' && 
         typeof window.matchMedia === 'function' &&
         window.matchMedia(SYSTEM_THEME_QUERY).media !== 'not all';
}

/**
 * Получает системную тему
 */
function getSystemTheme(): 'light' | 'dark' {
  if (!isSystemThemeSupported()) {
    return 'light'; // Fallback
  }
  
  try {
    return window.matchMedia(SYSTEM_THEME_QUERY).matches ? 'dark' : 'light';
  } catch (error) {
    console.warn('Ошибка получения системной темы:', error);
    return 'light'; // Fallback
  }
}

/**
 * Сохраняет тему в localStorage
 */
function saveThemeToStorage(mode: ThemeMode): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    }
  } catch (error) {
    console.warn('Ошибка сохранения темы в localStorage:', error);
  }
}

/**
 * Загружает тему из localStorage
 */
function loadThemeFromStorage(): ThemeMode | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        return saved as ThemeMode;
      }
    }
  } catch (error) {
    console.warn('Ошибка загрузки темы из localStorage:', error);
  }
  return null;
}

/**
 * Применяет тему к документу
 */
function applyThemeToDocument(mode: ThemeMode, systemTheme: 'light' | 'dark'): void {
  try {
    const root = document.documentElement;
    const activeTheme = mode === 'system' ? systemTheme : mode;
    
    // Удаляем старые атрибуты
    root.removeAttribute('data-theme');
    root.classList.remove('theme-light', 'theme-dark');
    
    // Добавляем новые атрибуты
    root.setAttribute('data-theme', activeTheme);
    root.classList.add(`theme-${activeTheme}`);
    
    // Обновляем meta тег для браузеров
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', activeTheme === 'dark' ? '#000000' : '#ffffff');
    }
  } catch (error) {
    console.warn('Ошибка применения темы к документу:', error);
  }
}

// =======================
// КОНТЕКСТ
// =======================

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// =======================
// ПРОВАЙДЕР
// =======================

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
}

export function ThemeProvider({ 
  children, 
  defaultTheme = 'system'
}: ThemeProviderProps) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(defaultTheme);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');
  const [isSystemSupported] = useState(isSystemThemeSupported());

  // Определяем системную тему
  useEffect(() => {
    if (!isSystemSupported) {
      console.warn('Системная тема не поддерживается, используется fallback');
      return;
    }

    const mediaQuery = window.matchMedia(SYSTEM_THEME_QUERY);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    // Устанавливаем начальную системную тему
    setSystemTheme(getSystemTheme());
    
    // Добавляем слушатель изменений
    try {
      mediaQuery.addEventListener('change', handleChange);
    } catch (error) {
      // Fallback для старых браузеров
      mediaQuery.addListener(handleChange);
    }

    return () => {
      try {
        mediaQuery.removeEventListener('change', handleChange);
      } catch (error) {
        // Fallback для старых браузеров
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [isSystemSupported]);

  // Загружаем сохраненную тему при инициализации
  useEffect(() => {
    const savedTheme = loadThemeFromStorage();
    if (savedTheme) {
      setThemeMode(savedTheme);
    }
  }, []);

  // Вычисляем активную тему
  const activeTheme = themeMode === 'system' ? systemTheme : themeMode;
  const isDark = activeTheme === 'dark';
  const isSystem = themeMode === 'system';
  const colors = isDark ? darkColors : lightColors;

  const theme: Theme = {
    mode: themeMode,
    colors,
    isDark,
    isSystem
  };

  // Функция для установки темы
  const setTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
    saveThemeToStorage(mode);
    applyThemeToDocument(mode, systemTheme);
  };

  // Функция для переключения темы
  const toggleTheme = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setTheme(newMode);
  };

  // Применяем тему к документу при изменении
  useEffect(() => {
    applyThemeToDocument(themeMode, systemTheme);
  }, [themeMode, systemTheme]);

  const contextValue: ThemeContextType = {
    theme,
    setTheme,
    toggleTheme,
    isSystemSupported
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// =======================
// ХУКИ
// =======================

/**
 * Хук для использования темы
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Хук для получения только цветов
 */
export function useColors(): ColorPalette {
  const { theme } = useTheme();
  return theme.colors;
}

/**
 * Хук для проверки темной темы
 */
export function useIsDark(): boolean {
  const { theme } = useTheme();
  return theme.isDark;
}

/**
 * Хук для проверки системной темы
 */
export function useIsSystem(): boolean {
  const { theme } = useTheme();
  return theme.isSystem;
}

/**
 * Хук для получения информации о поддержке системной темы
 */
export function useSystemSupport(): boolean {
  const { isSystemSupported } = useTheme();
  return isSystemSupported;
}
