# Fast UI - Система генерации дизайн-токенов

Современная система для создания и управления дизайн-токенами с поддержкой цветовых палитр, типографики, отступов и других элементов дизайн-системы.

## 🚀 Возможности

### 🎨 Генерация цветовых палитр
- **Равномерные кривые светлоты** на основе OKLCH цветового пространства
- **Автоматическая проверка доступности** (WCAG AA/AAA)
- **Семантические цветовые схемы** (brand, accent, info, success, error, warning, neutral)
- **Адаптивная хроматика** с учетом светлоты
- **Валидация качества** и совместимости цветов

### 🌓 Управление темами
- **Поддержка светлой и темной тем**
- **Автоматическое определение системной темы**
- **Сохранение настроек в localStorage**
- **Fallback для старых браузеров**
- **Создание и клонирование пользовательских тем**

### 🎯 Дизайн-токены
- **Цвета** - полные палитры с контрастом
- **Типографика** - размеры, веса, межстрочные интервалы
- **Отступы** - система spacing (xs, sm, md, lg, xl, xxl)
- **Границы** - радиусы и толщины
- **Тени** - многоуровневая система теней
- **Анимации** - длительности и easing функции

### 📤 Экспорт и интеграция
- **CSS переменные** для прямого использования
- **JSON формат** для интеграции с другими системами
- **Токены** для Figma, Sketch и других инструментов
- **Автоматическое скачивание** файлов

## 🏗️ Архитектура

### Структура проекта
```
src/
├── components/
│   └── FastUI/
│       ├── ThemeManager.tsx      # Управление темами
│       ├── FastUIDesign.tsx      # Основной интерфейс
│       ├── ColorPalette.tsx      # Отображение палитр
│       └── ...
├── themes/
│   ├── themeProvider.tsx         # Провайдер тем
│   ├── themeService.ts           # Сервис управления темами
│   └── useThemeService.ts        # React хуки
├── utils/
│   ├── colorGenerator.ts         # Генерация цветов
│   ├── paletteGenerator.ts       # Бизнес-логика палитр
│   └── ...
└── types/
    └── ...
```

### Ключевые компоненты

#### `ThemeManager`
Основной компонент для управления темами и дизайн-токенами:
```tsx
import { ThemeManager } from './components/FastUI/ThemeManager';

<ThemeManager 
  onThemeChange={(themeName) => console.log('Тема изменена:', themeName)}
  onPaletteUpdate={(palettes) => console.log('Палитры обновлены:', palettes)}
/>
```

#### `ThemeService`
Сервис для работы с темами:
```tsx
import { themeService } from './themes/themeService';

// Создание новой темы
themeService.addTheme({
  name: 'custom-theme',
  mode: 'light',
  tokens: { /* токены */ }
});

// Переключение темы
themeService.setCurrentTheme('custom-theme');

// Экспорт в CSS
const css = themeService.exportThemeToCSS('custom-theme');
```

#### `useThemeService`
React хуки для работы с темами:
```tsx
import { useThemeService, useColorPalettes } from './themes/useThemeService';

function MyComponent() {
  const { currentTheme, switchTheme, isLoading } = useThemeService();
  const { palettes, updatePalette } = useColorPalettes(currentTheme);
  
  // Использование...
}
```

## 🎨 Алгоритмы генерации цветов

### Равномерная кривая светлоты
Используется кубическая кривая для перцептивно равномерного распределения:
```typescript
const cubicT = 3 * Math.pow(t, 2) - 2 * Math.pow(t, 3);
const lightness = minLightness + (maxLightness - minLightness) * cubicT;
```

### Адаптивная хроматика
Хроматика автоматически уменьшается для очень светлых и темных оттенков:
```typescript
if (lightness > 0.9 || lightness < 0.1) {
  chromaMultiplier = 0.3; // Сильное уменьшение
} else if (lightness > 0.8 || lightness < 0.2) {
  chromaMultiplier = 0.6; // Умеренное уменьшение
}
```

### Проверка доступности
Автоматическая проверка контраста по WCAG стандартам:
```typescript
const contrast = (lighter + 0.05) / (darker + 0.05);
const wcagAA = contrast >= 4.5;
const wcagAAA = contrast >= 7.0;
```

## 🔧 Установка и запуск

### Требования
- Node.js 16+
- npm или yarn

### Установка
```bash
npm install
```

### Запуск в режиме разработки
```bash
npm run dev
```

### Сборка для продакшена
```bash
npm run build
```

## 📖 Использование

### Базовое использование
```tsx
import { ThemeProvider } from './themes/themeProvider';
import { FastUIDesign } from './components/FastUI/FastUIDesign';

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <FastUIDesign />
    </ThemeProvider>
  );
}
```

### Интеграция с существующим проектом
```tsx
import { ThemeManager } from './components/FastUI/ThemeManager';
import { themeService } from './themes/themeService';

function MyApp() {
  const handleThemeChange = (themeName: string) => {
    // Применяем тему к вашему приложению
    themeService.setCurrentTheme(themeName);
  };

  return (
    <div>
      <ThemeManager onThemeChange={handleThemeChange} />
      {/* Ваш контент */}
    </div>
  );
}
```

### Использование CSS переменных
После применения темы, CSS переменные автоматически доступны:
```css
.my-component {
  background-color: var(--color-brand-6);
  color: var(--color-neutral-11);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
}
```

## 🎯 API Reference

### ThemeService

#### Методы
- `addTheme(config: ThemeConfig): void` - Добавить новую тему
- `getTheme(name: string): ThemeConfig | undefined` - Получить тему
- `setCurrentTheme(name: string): boolean` - Установить текущую тему
- `getAllThemes(): string[]` - Получить список всех тем
- `updateColorPalette(themeName: string, type: ColorType, baseColor: string): boolean` - Обновить палитру
- `exportThemeToCSS(themeName: string): string` - Экспорт в CSS
- `cloneTheme(originalName: string, newName: string): boolean` - Клонировать тему
- `removeTheme(name: string): boolean` - Удалить тему

### useThemeService

#### Возвращаемые значения
- `currentTheme: string` - Текущая тема
- `availableThemes: string[]` - Доступные темы
- `isLoading: boolean` - Состояние загрузки
- `switchTheme: (themeName: string) => void` - Переключить тему
- `getThemeConfig: (themeName: string) => ThemeConfig | undefined` - Получить конфигурацию
- `updateColorPalette: (themeName: string, type: ColorType, baseColor: string) => boolean` - Обновить палитру
- `createTheme: (config: ThemeConfig) => boolean` - Создать тему
- `cloneTheme: (originalName: string, newName: string) => boolean` - Клонировать тему
- `removeTheme: (themeName: string) => boolean` - Удалить тему
- `exportThemeCSS: (themeName: string) => string` - Экспорт в CSS

### generateColorPalette

#### Параметры
```typescript
interface PaletteOptions {
  baseColor: string;           // Базовый цвет
  type: ColorType;            // Тип цвета (brand, accent, info, etc.)
  steps: number;              // Количество шагов
  targetContrast?: number;    // Целевой контраст (по умолчанию 4.5)
  ensureAccessibility?: boolean; // Обеспечить доступность (по умолчанию true)
}
```

#### Возвращаемое значение
```typescript
interface ColorPalette {
  baseColor: string;
  steps: ColorStep[];
  type: ColorType;
  accessibility: {
    wcagAA: boolean;
    wcagAAA: boolean;
    minContrast: number;
    maxContrast: number;
  };
}
```

## 🎨 Типы цветов

- `brand` - Основной бренд-цвет
- `accent` - Дополнительный цвет (30° от бренд-цвета)
- `info` - Информационный цвет (180° от бренд-цвета)
- `success` - Цвет успеха (зеленый)
- `error` - Цвет ошибки (красный)
- `warning` - Цвет предупреждения (оранжевый)
- `neutral` - Нейтральный цвет (серый)

## 🔍 Валидация и качество

### Проверка доступности
- Автоматическая проверка контраста по WCAG AA (4.5:1) и AAA (7.0:1)
- Визуальные индикаторы соответствия стандартам
- Автоматическая корректировка цветов при недостаточном контрасте

### Проверка совместимости
- Анализ контраста между основными цветами
- Проверка на дублирующиеся цвета
- Валидация равномерности распределения

### Метрики качества
- Дисперсия контраста между шагами
- Количество уникальных цветов
- Соответствие целевым показателям контраста

## 🚀 Расширение функциональности

### Добавление новых типов цветов
```typescript
// В colorGenerator.ts
export type ColorType = 'brand' | 'accent' | 'info' | 'success' | 'error' | 'warning' | 'neutral' | 'custom';

// В paletteGenerator.ts
export const SEMANTIC_COLOR_OFFSETS = {
  // ... существующие
  custom: 90, // Новый тип
};
```

### Создание кастомных алгоритмов генерации
```typescript
export function generateCustomPalette(baseColor: string, options: CustomOptions): ColorPalette {
  // Ваша логика генерации
  return generateColorPalette({
    baseColor,
    type: 'custom',
    steps: options.steps,
    ensureAccessibility: options.ensureAccessibility
  });
}
```

### Интеграция с внешними системами
```typescript
// Экспорт для Figma
export function exportForFigma(palettes: GeneratedPalettes): FigmaTokens {
  // Логика экспорта
}

// Экспорт для Sketch
export function exportForSketch(palettes: GeneratedPalettes): SketchTokens {
  // Логика экспорта
}
```

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте изменения (`git commit -m 'Add amazing feature'`)
4. Отправьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 🆘 Поддержка

Если у вас есть вопросы или проблемы:
1. Проверьте [Issues](../../issues) на GitHub
2. Создайте новое issue с описанием проблемы
3. Опишите шаги для воспроизведения
4. Укажите версию браузера и операционной системы

---

**Fast UI** - создано с ❤️ для дизайнеров и разработчиков
