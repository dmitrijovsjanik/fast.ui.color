import { useState } from 'react';
import { useTheme, useColors } from '../themes/themeProvider';
import { getColor, ColorPalette as ColorPaletteType } from '../colors/palette';
import { getPaletteByMode } from '../colors/paletteModes';
import { SunIcon, MoonIcon, EyeOpenIcon, EyeClosedIcon } from '@radix-ui/react-icons';

export function FigmaStandardInterface() {
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
    <div className="figma-standard-interface">
      {/* Figma-style Header */}
      <div className="figma-header">
        <div className="header-left">
          <div className="figma-logo">
            <div className="logo-icon">F</div>
            <span className="logo-text">Figma</span>
          </div>
          <div className="breadcrumb">
            <span>Fast UI Kit</span>
            <span className="separator">/</span>
            <span>Color Palette</span>
          </div>
        </div>
        
        <div className="header-center">
          <div className="mode-toggle">
            <button
              className={`toggle-btn ${paletteMode === 'semantic' ? 'active' : ''}`}
              onClick={() => setPaletteMode('semantic')}
            >
              Semantic
            </button>
            <button
              className={`toggle-btn ${paletteMode === 'linear' ? 'active' : ''}`}
              onClick={() => setPaletteMode('linear')}
            >
              Linear
            </button>
          </div>
        </div>
        
        <div className="header-right">
          <button 
            onClick={toggleAlpha} 
            className="header-btn"
            title={`${showAlpha ? 'Hide' : 'Show'} alpha colors`}
          >
            {showAlpha ? <EyeClosedIcon width={16} height={16} /> : <EyeOpenIcon width={16} height={16} />}
          </button>
          <button 
            onClick={toggleTheme} 
            className="header-btn"
            title={`Switch to ${theme.isDark ? 'light' : 'dark'} theme`}
          >
            {theme.isDark ? <SunIcon width={16} height={16} /> : <MoonIcon width={16} height={16} />}
          </button>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="figma-canvas">
        <div className="canvas-header">
          <h1>Color Palette</h1>
          <p>{visibleColors.length} colors • {paletteMode === 'semantic' ? 'Semantic' : 'Linear'} mode</p>
        </div>

        <div className="color-grid">
          {visibleColors.map(colorName => (
            <div key={colorName} className="color-frame">
              <div className="frame-header">
                <h3>{colorName}</h3>
                <div className="color-preview" style={{ backgroundColor: getColor(colors, colorName, 6) }} />
              </div>
              
              <div className="color-strip">
                {Array.from({ length: 12 }, (_, i) => i + 1).map(scale => (
                  <div key={scale} className="color-item">
                    <div className="item-label">{scale}</div>
                    <div 
                      className="color-box"
                      style={{ backgroundColor: getColor(colors, colorName, scale as any) }}
                      title={`${colorName} ${scale}`}
                    />
                    <div className="color-code">
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
        .figma-standard-interface {
          min-height: 100vh;
          background: ${getColor(baseColors, 'gray', 1)};
          color: ${getColor(baseColors, 'gray', 12)};
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .figma-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          height: 48px;
          background: ${getColor(baseColors, 'gray', 1)};
          border-bottom: 1px solid ${getColor(baseColors, 'gray', 6)};
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          backdrop-filter: blur(10px);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .figma-logo {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .logo-icon {
          width: 24px;
          height: 24px;
          background: ${getColor(baseColors, 'blue', 9)};
          color: white;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 12px;
        }

        .logo-text {
          font-size: 14px;
          font-weight: 600;
          color: ${getColor(baseColors, 'gray', 12)};
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: ${getColor(baseColors, 'gray', 11)};
        }

        .separator {
          color: ${getColor(baseColors, 'gray', 8)};
        }

        .header-center {
          display: flex;
          align-items: center;
        }

        .mode-toggle {
          display: flex;
          background: ${getColor(baseColors, 'gray', 3)};
          border: 1px solid ${getColor(baseColors, 'gray', 6)};
          border-radius: 6px;
          overflow: hidden;
        }

        .toggle-btn {
          padding: 6px 12px;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          color: ${getColor(baseColors, 'gray', 11)};
          font-size: 12px;
          font-weight: 500;
        }

        .toggle-btn.active {
          background: ${getColor(baseColors, 'gray', 5)};
          color: ${getColor(baseColors, 'gray', 12)};
        }

        .toggle-btn:hover:not(.active) {
          background: ${getColor(baseColors, 'gray', 4)};
          color: ${getColor(baseColors, 'gray', 12)};
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .header-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: ${getColor(baseColors, 'gray', 3)};
          color: ${getColor(baseColors, 'gray', 11)};
          border: 1px solid ${getColor(baseColors, 'gray', 6)};
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .header-btn:hover {
          background: ${getColor(baseColors, 'gray', 4)};
          border-color: ${getColor(baseColors, 'gray', 7)};
          color: ${getColor(baseColors, 'gray', 12)};
        }

        .figma-canvas {
          margin-top: 48px;
          padding: 24px;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
        }

        .canvas-header {
          margin-bottom: 24px;
        }

        .canvas-header h1 {
          font-size: 24px;
          font-weight: 600;
          margin: 0 0 4px 0;
          color: ${getColor(baseColors, 'gray', 12)};
        }

        .canvas-header p {
          font-size: 14px;
          color: ${getColor(baseColors, 'gray', 11)};
          margin: 0;
        }

        .color-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .color-frame {
          background: ${getColor(baseColors, 'gray', 2)};
          border: 1px solid ${getColor(baseColors, 'gray', 6)};
          border-radius: 8px;
          padding: 16px;
          transition: all 0.2s ease;
        }

        .color-frame:hover {
          border-color: ${getColor(baseColors, 'gray', 7)};
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .frame-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .frame-header h3 {
          font-size: 14px;
          font-weight: 600;
          margin: 0;
          text-transform: capitalize;
          color: ${getColor(baseColors, 'gray', 12)};
        }

        .color-preview {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          border: 1px solid ${getColor(baseColors, 'gray', 6)};
        }

        .color-strip {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 4px;
        }

        .color-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .item-label {
          font-size: 10px;
          font-weight: 600;
          color: ${getColor(baseColors, 'gray', 11)};
          text-align: center;
        }

        .color-box {
          width: 100%;
          height: 20px;
          border-radius: 3px;
          cursor: pointer;
          transition: transform 0.15s ease;
          border: 1px solid ${getColor(baseColors, 'gray', 6)};
        }

        .color-box:hover {
          transform: scale(1.1);
          z-index: 10;
        }

        .color-code {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 9px;
          color: ${getColor(baseColors, 'gray', 10)};
          text-align: center;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 100%;
        }

        @media (max-width: 768px) {
          .figma-header {
            padding: 0 12px;
            height: 44px;
          }

          .breadcrumb {
            display: none;
          }

          .figma-canvas {
            margin-top: 44px;
            padding: 16px;
          }

          .color-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .color-frame {
            padding: 12px;
          }

          .color-strip {
            gap: 2px;
          }

          .color-box {
            height: 16px;
          }

          .color-code {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .header-center {
            display: none;
          }

          .color-strip {
            grid-template-columns: repeat(6, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
