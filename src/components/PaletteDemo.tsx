import { useState } from 'react';
import { useTheme, useColors } from '../themes/themeProvider';
import { getColor, ColorPalette as ColorPaletteType } from '../colors/palette';
import { PaletteComparison } from './PaletteComparison';
import { SunIcon, MoonIcon } from '@radix-ui/react-icons';

export function PaletteDemo() {
  const { theme, toggleTheme } = useTheme();
  const colors = useColors();
  const [selectedColor, setSelectedColor] = useState<keyof ColorPaletteType>('blue');

  // Все цвета для выбора
  const allColors = Object.keys(colors) as (keyof ColorPaletteType)[];
  const visibleColors = allColors.filter(color => color !== 'black' && color !== 'white');

  return (
    <div className="palette-demo">
      <div className="demo-header">
        <div className="header-content">
          <div>
            <h1>Демонстрация палитр</h1>
            <p>Сравнение семантической и линейной палитр</p>
          </div>
          <button onClick={toggleTheme} className="theme-toggle-btn" title={`Switch to ${theme.isDark ? 'light' : 'dark'} theme`}>
            {theme.isDark ? <SunIcon width={20} height={20} /> : <MoonIcon width={20} height={20} />}
          </button>
        </div>
      </div>

      <div className="demo-content">
        <div className="color-selector">
          <h3>Выберите цвет для сравнения:</h3>
          <div className="color-grid">
            {visibleColors.map(colorName => (
              <button
                key={colorName}
                className={`color-option ${selectedColor === colorName ? 'selected' : ''}`}
                onClick={() => setSelectedColor(colorName)}
                style={{ backgroundColor: getColor(colors, colorName, 6) }}
                title={colorName}
              >
                <span className="color-name">{colorName}</span>
                <div className="color-preview" style={{ backgroundColor: getColor(colors, colorName, 6) }} />
              </button>
            ))}
          </div>
        </div>

        <PaletteComparison selectedColor={selectedColor} />

        <div className="info-section">
          <div className="info-card">
            <h3>🎨 Семантическая палитра</h3>
            <p>Использует все 12 оттенков с тонкими переходами между ними. Идеально подходит для сложных дизайн-систем, где нужна максимальная гибкость в выборе цветов.</p>
            <ul>
              <li>Больше оттенков (12 уровней)</li>
              <li>Тонкие переходы между цветами</li>
              <li>Подходит для сложных интерфейсов</li>
              <li>Максимальная гибкость</li>
            </ul>
          </div>

          <div className="info-card">
            <h3>📊 Линейная палитра</h3>
            <p>Использует ключевые оттенки с интерполяцией. Более простая и понятная система, подходящая для быстрой разработки и простых интерфейсов.</p>
            <ul>
              <li>Меньше оттенков (8 ключевых)</li>
              <li>Четкие переходы между цветами</li>
              <li>Подходит для простых интерфейсов</li>
              <li>Быстрая разработка</li>
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        .palette-demo {
          min-height: 100vh;
          background: ${getColor(colors, 'gray', 1)};
          color: ${getColor(colors, 'gray', 12)};
          transition: all 0.3s ease;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .demo-header {
          background: ${getColor(colors, 'gray', 2)};
          border-bottom: 1px solid ${getColor(colors, 'gray', 6)};
          padding: 1.5rem 2rem;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
        }

        .header-content h1 {
          margin: 0 0 0.5rem 0;
          font-size: 1.875rem;
          font-weight: 700;
        }

        .header-content p {
          margin: 0;
          color: ${getColor(colors, 'gray', 11)};
          font-size: 1rem;
        }

        .theme-toggle-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: ${getColor(colors, 'gray', 3)};
          color: ${getColor(colors, 'gray', 11)};
          border: 1px solid ${getColor(colors, 'gray', 6)};
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .theme-toggle-btn:hover {
          background: ${getColor(colors, 'gray', 4)};
          border-color: ${getColor(colors, 'gray', 7)};
          color: ${getColor(colors, 'gray', 12)};
        }

        .demo-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .color-selector {
          margin-bottom: 2rem;
        }

        .color-selector h3 {
          margin: 0 0 1rem 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .color-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 0.75rem;
        }

        .color-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1rem;
          background: ${getColor(colors, 'gray', 2)};
          border: 2px solid ${getColor(colors, 'gray', 5)};
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .color-option:hover {
          border-color: ${getColor(colors, 'gray', 7)};
          transform: translateY(-1px);
        }

        .color-option.selected {
          border-color: ${getColor(colors, 'blue', 7)};
          background: ${getColor(colors, 'blue', 2)};
        }

        .color-name {
          font-weight: 600;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
          text-transform: capitalize;
        }

        .color-preview {
          width: 100%;
          height: 2rem;
          border-radius: 0.25rem;
          border: 1px solid ${getColor(colors, 'gray', 6)};
        }

        .info-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-top: 2rem;
        }

        .info-card {
          background: ${getColor(colors, 'gray', 2)};
          border: 1px solid ${getColor(colors, 'gray', 6)};
          border-radius: 0.75rem;
          padding: 1.5rem;
        }

        .info-card h3 {
          margin: 0 0 1rem 0;
          font-size: 1.125rem;
          font-weight: 600;
        }

        .info-card p {
          margin: 0 0 1rem 0;
          color: ${getColor(colors, 'gray', 11)};
          line-height: 1.6;
        }

        .info-card ul {
          margin: 0;
          padding-left: 1.5rem;
          color: ${getColor(colors, 'gray', 11)};
        }

        .info-card li {
          margin-bottom: 0.5rem;
        }

        @media (max-width: 768px) {
          .demo-header {
            padding: 1rem;
          }

          .header-content {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .demo-content {
            padding: 1rem;
          }

          .color-grid {
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 0.5rem;
          }

          .info-section {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
