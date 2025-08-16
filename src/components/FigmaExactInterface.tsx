import { useState } from 'react';
import { useTheme, useColors } from '../themes/themeProvider';
import { getColor, ColorPalette as ColorPaletteType } from '../colors/palette';
import { getPaletteByMode } from '../colors/paletteModes';
import { SunIcon, MoonIcon, EyeOpenIcon, EyeClosedIcon } from '@radix-ui/react-icons';

export function FigmaExactInterface() {
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
    <div className="figma-exact-interface">
      {/* Top Navigation Bar */}
      <div className="top-nav">
        <div className="nav-left">
          <div className="logo">
            <span className="logo-icon">🎨</span>
            <span className="logo-text">Fast UI Kit</span>
          </div>
        </div>
        <div className="nav-center">
          <div className="palette-mode-selector">
            <button
              className={`mode-btn ${paletteMode === 'semantic' ? 'active' : ''}`}
              onClick={() => setPaletteMode('semantic')}
            >
              <span className="mode-icon">🎨</span>
              <span className="mode-label">Semantic</span>
            </button>
            <button
              className={`mode-btn ${paletteMode === 'linear' ? 'active' : ''}`}
              onClick={() => setPaletteMode('linear')}
            >
              <span className="mode-icon">📊</span>
              <span className="mode-label">Linear</span>
            </button>
          </div>
        </div>
        <div className="nav-right">
          <button 
            onClick={toggleAlpha} 
            className="nav-btn"
            title={`${showAlpha ? 'Hide' : 'Show'} alpha colors`}
          >
            {showAlpha ? <EyeClosedIcon width={18} height={18} /> : <EyeOpenIcon width={18} height={18} />}
          </button>
          <button 
            onClick={toggleTheme} 
            className="nav-btn"
            title={`Switch to ${theme.isDark ? 'light' : 'dark'} theme`}
          >
            {theme.isDark ? <SunIcon width={18} height={18} /> : <MoonIcon width={18} height={18} />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="content-header">
          <h1 className="page-title">Color Palette</h1>
          <p className="page-subtitle">
            {visibleColors.length} colors • {paletteMode === 'semantic' ? 'Semantic' : 'Linear'} mode
          </p>
        </div>

        <div className="palette-grid">
          {visibleColors.map(colorName => (
            <div key={colorName} className="color-panel">
              <div className="panel-header">
                <h3 className="color-title">{colorName}</h3>
                <div className="color-preview" style={{ backgroundColor: getColor(colors, colorName, 6) }} />
              </div>
              
              <div className="color-scales">
                {Array.from({ length: 12 }, (_, i) => i + 1).map(scale => (
                  <div key={scale} className="scale-item">
                    <div className="scale-label">{scale}</div>
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
      </div>

      <style>{`
        .figma-exact-interface {
          min-height: 100vh;
          background: ${getColor(baseColors, 'gray', 1)};
          color: ${getColor(baseColors, 'gray', 12)};
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .top-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          height: 64px;
          background: ${getColor(baseColors, 'gray', 1)};
          border-bottom: 1px solid ${getColor(baseColors, 'gray', 6)};
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          backdrop-filter: blur(10px);
        }

        .nav-left {
          display: flex;
          align-items: center;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .logo-icon {
          font-size: 24px;
        }

        .logo-text {
          font-size: 18px;
          font-weight: 600;
          color: ${getColor(baseColors, 'gray', 12)};
        }

        .nav-center {
          display: flex;
          align-items: center;
        }

        .palette-mode-selector {
          display: flex;
          background: ${getColor(baseColors, 'gray', 3)};
          border: 1px solid ${getColor(baseColors, 'gray', 6)};
          border-radius: 8px;
          padding: 4px;
          gap: 4px;
        }

        .mode-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: transparent;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: ${getColor(baseColors, 'gray', 11)};
          font-size: 14px;
          font-weight: 500;
        }

        .mode-btn.active {
          background: ${getColor(baseColors, 'gray', 5)};
          color: ${getColor(baseColors, 'gray', 12)};
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .mode-btn:hover:not(.active) {
          background: ${getColor(baseColors, 'gray', 4)};
          color: ${getColor(baseColors, 'gray', 12)};
        }

        .mode-icon {
          font-size: 16px;
        }

        .mode-label {
          font-weight: 500;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: ${getColor(baseColors, 'gray', 3)};
          color: ${getColor(baseColors, 'gray', 11)};
          border: 1px solid ${getColor(baseColors, 'gray', 6)};
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nav-btn:hover {
          background: ${getColor(baseColors, 'gray', 4)};
          border-color: ${getColor(baseColors, 'gray', 7)};
          color: ${getColor(baseColors, 'gray', 12)};
        }

        .main-content {
          margin-top: 64px;
          padding: 32px;
          max-width: 1400px;
          margin-left: auto;
          margin-right: auto;
        }

        .content-header {
          margin-bottom: 32px;
        }

        .page-title {
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 8px 0;
          color: ${getColor(baseColors, 'gray', 12)};
        }

        .page-subtitle {
          font-size: 16px;
          color: ${getColor(baseColors, 'gray', 11)};
          margin: 0;
        }

        .palette-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        .color-panel {
          background: ${getColor(baseColors, 'gray', 2)};
          border: 1px solid ${getColor(baseColors, 'gray', 6)};
          border-radius: 12px;
          padding: 24px;
          transition: all 0.2s ease;
        }

        .color-panel:hover {
          border-color: ${getColor(baseColors, 'gray', 7)};
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .color-title {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
          text-transform: capitalize;
          color: ${getColor(baseColors, 'gray', 12)};
        }

        .color-preview {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid ${getColor(baseColors, 'gray', 6)};
        }

        .color-scales {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 8px;
        }

        .scale-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .scale-label {
          font-size: 12px;
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
          .top-nav {
            padding: 0 16px;
            height: 56px;
          }

          .logo-text {
            display: none;
          }

          .palette-mode-selector {
            padding: 2px;
          }

          .mode-btn {
            padding: 6px 12px;
            font-size: 12px;
            gap: 4px;
          }

          .main-content {
            margin-top: 56px;
            padding: 16px;
          }

          .page-title {
            font-size: 24px;
          }

          .palette-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .color-panel {
            padding: 16px;
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
          .nav-center {
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
