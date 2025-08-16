# Fast UI Components

Модульная система компонентов для интерфейса Fast UI Design.

## Структура

```
src/components/FastUI/
├── Header.tsx          # Заголовок с бейджами Pro/Beta
├── Navigation.tsx      # Навигация (основная и вторичная)
├── Settings.tsx        # Настройки (Scale, Naming)
├── ColorPalette.tsx    # Компонент цветовой палитры
├── AddColorRow.tsx     # Кнопка добавления новой палитры
├── Footer.tsx          # Футер с кнопками действий
├── FastUIDesign.tsx    # Основной компонент
└── index.ts           # Экспорт всех компонентов
```

## Компоненты

### Header
Заголовок с названием "Fast UI" и бейджами Pro/Beta.

```tsx
<Header />
```

### Navigation
Навигация с основной и вторичной панелями.

```tsx
<Navigation 
  activeMainNav="Color"
  activeSecondaryNav="UI Palette"
/>
```

### Settings
Настройки для выбора шкалы и именования.

```tsx
<Settings 
  selectedScale="Semantic"
  selectedNaming="1,2,3..."
  onScaleChange={(scale) => console.log(scale)}
  onNamingChange={(naming) => console.log(naming)}
/>
```

### ColorPalette
Компонент цветовой палитры с 12 оттенками.

```tsx
<ColorPalette 
  type="brand"
  locked={false}
  colors={['#ff0000', '#ff1111', ...]}
  onColorClick={(index) => console.log(`Clicked color ${index}`)}
/>
```

### AddColorRow
Кнопка для добавления новой цветовой палитры.

```tsx
<AddColorRow onAddClick={() => console.log('Add new palette')} />
```

### Footer
Футер с информацией и кнопками действий.

```tsx
<Footer 
  onCopySVG={() => console.log('Copy SVG')}
  onCreate={() => console.log('Create')}
/>
```

## Типы

```tsx
type ColorPaletteType = 'brand' | 'accent' | 'positive' | 'warning' | 'negative' | 'neutral';
type ScaleType = 'Semantic' | 'Linear';
type NamingType = '1,2,3...' | 'A,B,C...' | 'Custom';
```

## Утилиты

### generateColorPalette(type, count)
Генерирует массив цветов для указанного типа палитры.

### getColorName(type, index)
Возвращает название цвета по типу и индексу.

### copyToClipboard(text)
Копирует текст в буфер обмена.

## Стили

Стили находятся в `src/styles/FastUI.css` и включают:
- Адаптивный дизайн
- Hover эффекты
- Анимации переходов
- Мобильная версия

## Использование

```tsx
import { FastUIDesign } from './components/FastUI';

function App() {
  return <FastUIDesign />;
}
```
