import { useState } from 'react';
import { useTheme, useColors } from '../themes/themeProvider';
import { getColor, ColorPalette as ColorPaletteType } from '../colors/palette';
import { getPaletteByMode } from '../colors/paletteModes';
import { SunIcon, MoonIcon, EyeOpenIcon, EyeClosedIcon } from '@radix-ui/react-icons';

export function PDFDesignInterface() {
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
    <div className="pdf-design-interface">
      {/* Header based on PDF design */}
      <header className="pdf-header">
        <div className="header-left">
          <div className="project-info">
            <h1>Fast UI Kit</h1>
            <span className="version">v1</span>
          </div>
        </div>
        
        <div className="header-center">
          <div className="palette-selector">
            <button
              className={`selector-btn ${paletteMode === 'semantic' ? 'active' : ''}`}
              onClick={() => setPaletteMode('semantic')}
            >
              <span className="btn-icon">🎨</span>
              <span className="btn-text">Semantic</span>
            </button>
            <button
              className={`selector-btn ${paletteMode === 'linear' ? 'active' : ''}`}
              onClick={() => setPaletteMode('linear')}
            >
              <span className="btn-icon">📊</span>
              <span className="btn-text">Linear</span>
            </button>
          </div>
        </div>
        
        <div className="header-right">
          <button 
            onClick={toggleAlpha} 
            className="control-btn"
            title={`${showAlpha ? 'Hide' : 'Show'} alpha colors`}
          >
            {showAlpha ? <EyeClosedIcon width={18} height={18} /> : <EyeOpenIcon width={18} height={18} />}
          </button>
          <button 
            onClick={toggleTheme} 
            className="control-btn"
            title={`Switch to ${theme.isDark ? 'light' : 'dark'} theme`}
          >
            {theme.isDark ? <SunIcon width={18} height={18} /> : <MoonIcon width={18} height={18} />}
          </button>
        </div>
      </header>

      {/* Main content area */}
      <main className="pdf-main">
        <div className="content-header">
          <h2>Color Palette</h2>
          <p className="palette-info">
            {visibleColors.length} colors • {paletteMode === 'semantic' ? 'Semantic' : 'Linear'} mode
          </p>
        </div>

        <div className="palette-container">
          {visibleColors.map(colorName => (
            <div key={colorName} className="color-card">
              <div className="card-header">
                <h3 className="color-name">{colorName}</h3>
                <div className="color-preview" style={{ backgroundColor: getColor(colors, colorName, 6) }} />
              </div>
              
              <div className="color-scales">
                {Array.from({ length: 12 }, (_, i) => i + 1).map(scale => (
                  <div key={scale} className="scale-item">
                    <div className="scale-number">{scale}</div>
                    <div 
                      className="color-swatch"
                      style={{ backgroundColor: getColor(colors, colorName, scale as any) }}
                      title={`${colorName} ${scale}`}
                    />
                    <div className="color-value">
                      {getColor(colors, colorName, scale as any)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      <style>{`
        .pdf-design-interface {
          min-height: 100vh;
          background: ${getColor(baseColors, 'gray', 1)};
          color: ${getColor(baseColors, 'gray', 12)};
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .pdf-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          height: 60px;
          background: ${getColor(baseColors, 'gray', 1)};
          border-bottom: 1px solid ${getColor(baseColors, 'gray', 6)};
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          backdrop-filter: blur(10px);
        }

        .header-left {
          display: flex;
          align-items: center;
        }

        .project-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .project-info h1 {
          font-size: 20px;
          font-weight: 700;
          margin: 0;
          color: ${getColor(baseColors, 'gray', 12)};
        }

        .version {
          background: ${getColor(baseColors, 'blue', 3)};
          color: ${getColor(baseColors, 'blue', 11)};
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .header-center {
          display: flex;
          align-items: center;
        }

        .palette-selector {
          display: flex;
          background: ${getColor(baseColors, 'gray', 3)};
          border: 1px solid ${getColor(baseColors, 'gray', 6)};
          border-radius: 10px;
          padding: 6px;
          gap: 6px;
        }

        .selector-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: transparent;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: ${getColor(baseColors, 'gray', 11)};
          font-size: 14px;
          font-weight: 500;
        }

        .selector-btn.active {
          background: ${getColor(baseColors, 'gray', 5)};
          color: ${getColor(baseColors, 'gray', 12)};
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .selector-btn:hover:not(.active) {
          background: ${getColor(baseColors, 'gray', 4)};
          color: ${getColor(baseColors, 'gray', 12)};
        }

        .btn-icon {
          font-size: 16px;
        }

        .btn-text {
          font-weight: 500;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .control-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: ${getColor(baseColors, 'gray', 3)};
          color: ${getColor(baseColors, 'gray', 11)};
          border: 1px solid ${getColor(baseColors, 'gray', 6)};
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .control-btn:hover {
          background: ${getColor(baseColors, 'gray', 4)};
          border-color: ${getColor(baseColors, 'gray', 7)};
          color: ${getColor(baseColors, 'gray', 12)};
        }

        .pdf-main {
          margin-top: 60px;
          padding: 32px;
          max-width: 1400px;
          margin-left: auto;
          margin-right: auto;
        }

        .content-header {
          margin-bottom: 32px;
        }

        .content-header h2 {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 8px 0;
          color: ${getColor(baseColors, 'gray', 12)};
        }

        .palette-info {
          font-size: 16px;
          color: ${getColor(baseColors, 'gray', 11)};
          margin: 0;
        }

        .palette-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }

        .color-card {
          background: ${getColor(baseColors, 'gray', 2)};
          border: 1px solid ${getColor(baseColors, 'gray', 6)};
          border-radius: 12px;
          padding: 24px;
          transition: all 0.2s ease;
        }

        .color-card:hover {
          border-color: ${getColor(baseColors, 'gray', 7)};
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .color-name {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
          text-transform: capitalize;
          color: ${getColor(baseColors, 'gray', 12)};
        }

        .color-preview {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: 1px solid ${getColor(baseColors, 'gray', 6)};
        }

        .color-scales {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 6px;
        }

        .scale-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .scale-number {
          font-size: 11px;
          font-weight: 600;
          color: ${getColor(baseColors, 'gray', 11)};
          text-align: center;
        }

        .color-swatch {
          width: 100%;
          height: 24px;
          border-radius: 6px;
          cursor: pointer;
          transition: transform 0.15s ease;
          border: 1px solid ${getColor(baseColors, 'gray', 6)};
        }

        .color-swatch:hover {
          transform: scale(1.1);
          z-index: 10;
        }

        .color-value {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 10px;
          color: ${getColor(baseColors, 'gray', 10)};
          text-align: center;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 100%;
        }

        @media (max-width: 768px) {
          .pdf-header {
            padding: 0 16px;
            height: 56px;
          }

          .project-info h1 {
            font-size: 18px;
          }

          .palette-selector {
            padding: 4px;
          }

          .selector-btn {
            padding: 8px 12px;
            font-size: 12px;
            gap: 6px;
          }

          .pdf-main {
            margin-top: 56px;
            padding: 20px;
          }

          .content-header h2 {
            font-size: 24px;
          }

          .palette-container {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .color-card {
            padding: 20px;
          }

          .color-scales {
            gap: 4px;
          }

          .color-swatch {
            height: 20px;
          }

          .color-value {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .header-center {
            display: none;
          }

          .color-scales {
            grid-template-columns: repeat(6, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
