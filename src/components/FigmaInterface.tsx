import { useState } from 'react';
import { useTheme, useColors } from '../themes/themeProvider';
import { getColor, ColorPalette as ColorPaletteType } from '../colors/palette';
import { getPaletteByMode } from '../colors/paletteModes';
import { SunIcon, MoonIcon, EyeOpenIcon, EyeClosedIcon } from '@radix-ui/react-icons';

export function FigmaInterface() {
  const { theme, toggleTheme } = useTheme();
  const baseColors = useColors();
  const [paletteMode, setPaletteMode] = useState<'semantic' | 'linear'>('semantic');
  const [showAlpha, setShowAlpha] = useState(false);

  // Получаем палитру в зависимости от выбранного режима
  const colors = getPaletteByMode(baseColors, paletteMode);

  // Все цвета в одном массиве
  const allColors = Object.keys(colors) as (keyof ColorPaletteType)[];
  const visibleColors = showAlpha 
    ? allColors 
    : allColors.filter(color => color !== 'black' && color !== 'white');

  const toggleAlpha = () => setShowAlpha(!showAlpha);

  return (
    <div className="figma-interface">
      {/* Header */}
      <header className="figma-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="header-title">Color Palette</h1>
            <p className="header-subtitle">
              {visibleColors.length} colors • {paletteMode === 'semantic' ? 'Semantic' : 'Linear'} mode
            </p>
          </div>
          <div className="header-right">
            <div className="palette-mode-toggle">
              <button
                className={`mode-button ${paletteMode === 'semantic' ? 'active' : ''}`}
                onClick={() => setPaletteMode('semantic')}
              >
                <span className="mode-icon">🎨</span>
                <span className="mode-text">Semantic</span>
              </button>
              <button
                className={`mode-button ${paletteMode === 'linear' ? 'active' : ''}`}
                onClick={() => setPaletteMode('linear')}
              >
                <span className="mode-icon">📊</span>
                <span className="mode-text">Linear</span>
              </button>
            </div>
            <div className="header-actions">
              <button 
                onClick={toggleAlpha} 
                className="action-button"
                title={`${showAlpha ? 'Hide' : 'Show'} alpha colors`}
              >
                {showAlpha ? <EyeClosedIcon width={16} height={16} /> : <EyeOpenIcon width={16} height={16} />}
              </button>
              <button 
                onClick={toggleTheme} 
                className="action-button"
                title={`Switch to ${theme.isDark ? 'light' : 'dark'} theme`}
              >
                {theme.isDark ? <SunIcon width={16} height={16} /> : <MoonIcon width={16} height={16} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="figma-main">
        <div className="color-grid">
          {visibleColors.map(colorName => (
            <div key={colorName} className="color-card">
              <div className="color-header">
                <h3 className="color-name">{colorName}</h3>
                <div className="color-preview" style={{ backgroundColor: getColor(colors, colorName, 6) }} />
              </div>
              <div className="color-scales">
                {Array.from({ length: 12 }, (_, i) => i + 1).map(scale => (
                  <div
                    key={scale}
                    className="color-swatch"
                    style={{ backgroundColor: getColor(colors, colorName, scale as any) }}
                    title={`${colorName} ${scale}`}
                  />
                ))}
              </div>
              <div className="color-values">
                {Array.from({ length: 12 }, (_, i) => i + 1).map(scale => (
                  <div key={scale} className="color-value">
                    {getColor(colors, colorName, scale as any)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      <style>{`
        .figma-interface {
          min-height: 100vh;
          background: ${getColor(baseColors, 'gray', 1)};
          color: ${getColor(baseColors, 'gray', 12)};
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .figma-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: ${getColor(baseColors, 'gray', 1)};
          border-bottom: 1px solid ${getColor(baseColors, 'gray', 6)};
          padding: 1rem 2rem;
          backdrop-filter: blur(10px);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1400px;
          margin: 0 auto;
        }

        .header-left {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .header-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
          color: ${getColor(baseColors, 'gray', 12)};
        }

        .header-subtitle {
          font-size: 0.875rem;
          margin: 0;
          color: ${getColor(baseColors, 'gray', 11)};
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .palette-mode-toggle {
          display: flex;
          background: ${getColor(baseColors, 'gray', 3)};
          border: 1px solid ${getColor(baseColors, 'gray', 6)};
          border-radius: 0.5rem;
          padding: 0.25rem;
          gap: 0.25rem;
        }

        .mode-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: transparent;
          border: none;
          border-radius: 0.25rem;
          cursor: pointer;
          transition: all 0.2s ease;
          color: ${getColor(baseColors, 'gray', 11)};
          font-size: 0.875rem;
          font-weight: 500;
        }

        .mode-button.active {
          background: ${getColor(baseColors, 'gray', 5)};
          color: ${getColor(baseColors, 'gray', 12)};
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .mode-button:hover:not(.active) {
          background: ${getColor(baseColors, 'gray', 4)};
          color: ${getColor(baseColors, 'gray', 12)};
        }

        .mode-icon {
          font-size: 1rem;
        }

        .mode-text {
          font-weight: 500;
        }

        .header-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: ${getColor(baseColors, 'gray', 3)};
          color: ${getColor(baseColors, 'gray', 11)};
          border: 1px solid ${getColor(baseColors, 'gray', 6)};
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-button:hover {
          background: ${getColor(baseColors, 'gray', 4)};
          border-color: ${getColor(baseColors, 'gray', 7)};
          color: ${getColor(baseColors, 'gray', 12)};
        }

        .figma-main {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .color-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .color-card {
          background: ${getColor(baseColors, 'gray', 2)};
          border: 1px solid ${getColor(baseColors, 'gray', 6)};
          border-radius: 0.75rem;
          padding: 1.5rem;
          transition: all 0.2s ease;
        }

        .color-card:hover {
          border-color: ${getColor(baseColors, 'gray', 7)};
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .color-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .color-name {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0;
          text-transform: capitalize;
          color: ${getColor(baseColors, 'gray', 12)};
        }

        .color-preview {
          width: 2rem;
          height: 2rem;
          border-radius: 0.375rem;
          border: 1px solid ${getColor(baseColors, 'gray', 6)};
        }

        .color-scales {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 0.25rem;
          margin-bottom: 1rem;
        }

        .color-swatch {
          width: 100%;
          height: 2rem;
          border-radius: 0.25rem;
          cursor: pointer;
          transition: transform 0.15s ease;
          border: 1px solid ${getColor(baseColors, 'gray', 6)};
        }

        .color-swatch:hover {
          transform: scale(1.05);
          z-index: 10;
        }

        .color-values {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 0.25rem;
        }

        .color-value {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.75rem;
          color: ${getColor(baseColors, 'gray', 10)};
          text-align: center;
          padding: 0.25rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        @media (max-width: 768px) {
          .figma-header {
            padding: 1rem;
          }

          .header-content {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .header-right {
            width: 100%;
            justify-content: space-between;
          }

          .figma-main {
            padding: 1rem;
          }

          .color-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .color-card {
            padding: 1rem;
          }

          .color-scales {
            gap: 0.125rem;
          }

          .color-swatch {
            height: 1.5rem;
          }

          .color-values {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .palette-mode-toggle {
            flex-direction: column;
            gap: 0.125rem;
          }

          .mode-button {
            padding: 0.375rem 0.75rem;
            font-size: 0.75rem;
          }

          .color-scales {
            grid-template-columns: repeat(6, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
