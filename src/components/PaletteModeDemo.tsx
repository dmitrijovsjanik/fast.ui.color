import { useState } from 'react';
import { useTheme, useColors } from '../themes/themeProvider';
import { getColor, ColorPalette as ColorPaletteType } from '../colors/palette';
import { getPaletteByMode } from '../colors/paletteModes';

export function PaletteModeDemo() {
  const { theme, toggleTheme } = useTheme();
  const baseColors = useColors();
  const [selectedColor, setSelectedColor] = useState<keyof ColorPaletteType>('blue');

  const semanticColors = getPaletteByMode(baseColors, 'semantic');
  const linearColors = getPaletteByMode(baseColors, 'linear');

  const allColors = Object.keys(baseColors) as (keyof ColorPaletteType)[];
  const visibleColors = allColors.filter(color => color !== 'black' && color !== 'white');

  return (
    <div className="palette-mode-demo">
      <div className="demo-header">
        <h1>Сравнение палитр</h1>
        <p>Семантическая vs Линейная палитра</p>
      </div>

      <div className="demo-content">
        <div className="color-selector">
          <h3>Выберите цвет:</h3>
          <div className="color-options">
            {visibleColors.map(colorName => (
              <button
                key={colorName}
                className={`color-option ${selectedColor === colorName ? 'selected' : ''}`}
                onClick={() => setSelectedColor(colorName)}
                style={{ backgroundColor: getColor(baseColors, colorName, 6) }}
              >
                {colorName}
              </button>
            ))}
          </div>
        </div>

        <div className="comparison-section">
          <div className="comparison-card semantic">
            <div className="card-header">
              <h3>🎨 Семантическая палитра</h3>
              <p>Больше оттенков, тонкие переходы</p>
            </div>
            <div className="color-scales">
              {Array.from({ length: 12 }, (_, i) => i + 1).map(scale => (
                <div key={scale} className="scale-item">
                  <div className="scale-number">{scale}</div>
                  <div 
                    className="color-swatch"
                    style={{ backgroundColor: getColor(semanticColors, selectedColor, scale as any) }}
                  />
                  <div className="color-code">
                    {getColor(semanticColors, selectedColor, scale as any)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="comparison-card linear">
            <div className="card-header">
              <h3>📊 Линейная палитра</h3>
              <p>Меньше оттенков, четкие переходы</p>
            </div>
            <div className="color-scales">
              {Array.from({ length: 12 }, (_, i) => i + 1).map(scale => (
                <div key={scale} className="scale-item">
                  <div className="scale-number">{scale}</div>
                  <div 
                    className="color-swatch"
                    style={{ backgroundColor: getColor(linearColors, selectedColor, scale as any) }}
                  />
                  <div className="color-code">
                    {getColor(linearColors, selectedColor, scale as any)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="info-section">
          <div className="info-card">
            <h3>🎨 Семантическая палитра</h3>
            <ul>
              <li>Использует все 12 оттенков</li>
              <li>Тонкие переходы между цветами</li>
              <li>Подходит для сложных интерфейсов</li>
              <li>Максимальная гибкость в выборе</li>
            </ul>
          </div>
          <div className="info-card">
            <h3>📊 Линейная палитра</h3>
            <ul>
              <li>Использует 8 ключевых оттенков</li>
              <li>Четкие переходы между цветами</li>
              <li>Подходит для простых интерфейсов</li>
              <li>Быстрая разработка</li>
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        .palette-mode-demo {
          min-height: 100vh;
          background: ${getColor(baseColors, 'gray', 1)};
          color: ${getColor(baseColors, 'gray', 12)};
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .demo-header {
          text-align: center;
          padding: 3rem 2rem 2rem;
          background: ${getColor(baseColors, 'gray', 2)};
          border-bottom: 1px solid ${getColor(baseColors, 'gray', 6)};
        }

        .demo-header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
        }

        .demo-header p {
          font-size: 1.125rem;
          color: ${getColor(baseColors, 'gray', 11)};
          margin: 0;
        }

        .demo-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .color-selector {
          margin-bottom: 3rem;
        }

        .color-selector h3 {
          font-size: 1.25rem;
          margin: 0 0 1rem 0;
        }

        .color-options {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 0.75rem;
        }

        .color-option {
          padding: 1rem;
          background: ${getColor(baseColors, 'gray', 2)};
          border: 2px solid ${getColor(baseColors, 'gray', 5)};
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 600;
          text-transform: capitalize;
          color: ${getColor(baseColors, 'gray', 12)};
        }

        .color-option:hover {
          border-color: ${getColor(baseColors, 'gray', 7)};
          transform: translateY(-1px);
        }

        .color-option.selected {
          border-color: ${getColor(baseColors, 'blue', 7)};
          background: ${getColor(baseColors, 'blue', 2)};
        }

        .comparison-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .comparison-card {
          background: ${getColor(baseColors, 'gray', 2)};
          border: 1px solid ${getColor(baseColors, 'gray', 6)};
          border-radius: 1rem;
          padding: 2rem;
        }

        .comparison-card.semantic {
          border-color: ${getColor(baseColors, 'blue', 6)};
        }

        .comparison-card.linear {
          border-color: ${getColor(baseColors, 'green', 6)};
        }

        .card-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .card-header h3 {
          font-size: 1.5rem;
          margin: 0 0 0.5rem 0;
        }

        .card-header p {
          color: ${getColor(baseColors, 'gray', 11)};
          margin: 0;
        }

        .color-scales {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .scale-item {
          display: grid;
          grid-template-columns: 40px 1fr auto;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          background: ${getColor(baseColors, 'gray', 1)};
          border: 1px solid ${getColor(baseColors, 'gray', 5)};
          border-radius: 0.5rem;
        }

        .scale-number {
          font-weight: 600;
          text-align: center;
          color: ${getColor(baseColors, 'gray', 11)};
        }

        .color-swatch {
          width: 100%;
          height: 2.5rem;
          border-radius: 0.375rem;
          border: 1px solid ${getColor(baseColors, 'gray', 6)};
        }

        .color-code {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.75rem;
          color: ${getColor(baseColors, 'gray', 10)};
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .info-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .info-card {
          background: ${getColor(baseColors, 'gray', 2)};
          border: 1px solid ${getColor(baseColors, 'gray', 6)};
          border-radius: 0.75rem;
          padding: 1.5rem;
        }

        .info-card h3 {
          font-size: 1.25rem;
          margin: 0 0 1rem 0;
        }

        .info-card ul {
          margin: 0;
          padding-left: 1.5rem;
          color: ${getColor(baseColors, 'gray', 11)};
        }

        .info-card li {
          margin-bottom: 0.5rem;
        }

        @media (max-width: 768px) {
          .demo-header {
            padding: 2rem 1rem 1rem;
          }

          .demo-header h1 {
            font-size: 2rem;
          }

          .demo-content {
            padding: 1rem;
          }

          .comparison-section {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .comparison-card {
            padding: 1.5rem;
          }

          .info-section {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .color-options {
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          }

          .scale-item {
            grid-template-columns: 30px 1fr;
            gap: 0.75rem;
          }

          .color-code {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
