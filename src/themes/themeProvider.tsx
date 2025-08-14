import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { lightColors, darkColors, ColorPalette } from '../colors/palette';

// Типы для темы
export type ThemeMode = 'light' | 'dark' | 'system';

export interface Theme {
  mode: ThemeMode;
  colors: ColorPalette;
  isDark: boolean;
}

// Контекст темы
interface ThemeContextType {
  theme: Theme;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Провайдер темы
interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeMode;
}

export function ThemeProvider({ children, defaultTheme = 'system' }: ThemeProviderProps) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(defaultTheme);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  // Определяем системную тему
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Вычисляем активную тему
  const activeTheme = themeMode === 'system' ? systemTheme : themeMode;
  const isDark = activeTheme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const theme: Theme = {
    mode: themeMode,
    colors,
    isDark,
  };

  // Функция для установки темы
  const setTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
    
    // Сохраняем в localStorage
    localStorage.setItem('theme', mode);
    
    // Обновляем data-theme атрибут для CSS
    const root = document.documentElement;
    if (mode === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', mode);
    }
  };

  // Функция для переключения темы
  const toggleTheme = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setTheme(newMode);
  };

  // Загружаем сохраненную тему при инициализации
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeMode;
    if (savedTheme) {
      setThemeMode(savedTheme);
    }
  }, []);

  // Применяем тему к документу
  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', themeMode);
    }
  }, [themeMode, systemTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Хук для использования темы
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Хук для получения только цветов
export function useColors(): ColorPalette {
  const { theme } = useTheme();
  return theme.colors;
}

// Хук для проверки темной темы
export function useIsDark(): boolean {
  const { theme } = useTheme();
  return theme.isDark;
}
