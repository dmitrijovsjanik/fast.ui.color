import React, { useState } from 'react';
import { useTheme, useColors } from '../themes/themeProvider';
import { getColor, ColorPalette as ColorPaletteType, ColorScale } from '../colors/palette';

// Компонент для отображения одного цвета
interface ColorSwatchProps {
  colorName: string;
  colorValue: string;
}

function ColorSwatch({ colorName, colorValue }: ColorSwatchProps) {
  return (
    <div 
      className="color-swatch"
      style={{ backgroundColor: colorValue }}
      title={`${colorName}`}
    />
  );
}

// Компонент настроек
interface SettingsPanelProps {
  theme: any;
  toggleTheme: () => void;
}

function SettingsPanel({ theme, toggleTheme }: SettingsPanelProps) {
  return (
    <div className="settings-panel">
      <div className="theme-controls">
        <span className="current-theme">
          {theme.mode} {theme.isDark ? '(Dark)' : '(Light)'}
        </span>
        <button onClick={toggleTheme} className="theme-toggle-btn">
          Toggle Theme
        </button>
      </div>
    </div>
  );
}

// Основной компонент палитры
export function ColorPalette() {
  const { theme, toggleTheme } = useTheme();
  const colors = useColors();

  // Все цвета в одном массиве
  const allColors = Object.keys(colors) as (keyof ColorPaletteType)[];

  return (
    <div className="color-palette-container">
      <div className="content-area">
        <div className="content-header">
          <div className="header-content">
            <div>
              <h1>Radix UI Color Palette</h1>
              <p>Complete color system with {allColors.length} color scales</p>
            </div>
            <SettingsPanel
              theme={theme}
              toggleTheme={toggleTheme}
            />
          </div>
        </div>

        <div className="palette-content">
          <div className="color-table">
            {/* Заголовок с номерами шагов */}
            <div className="table-header">
              <div className="color-name-header">Color</div>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(scale => (
                <div key={scale} className="scale-header">{scale}</div>
              ))}
            </div>

            {/* Строки с цветами */}
            {allColors.map(colorName => (
              <div key={colorName} className="color-row">
                <div className="color-name">{colorName}</div>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(scale => (
                  <ColorSwatch
                    key={scale}
                    colorName={colorName}
                    colorValue={getColor(colors, colorName, scale as keyof ColorScale)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .color-palette-container {
          height: 100vh;
          background: ${getColor(colors, 'gray', '1')};
          color: ${getColor(colors, 'gray', '12')};
          transition: all 0.3s ease;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .content-area {
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .content-header {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid ${getColor(colors, 'gray', '6')};
          background: ${getColor(colors, 'gray', '1')};
          flex-shrink: 0;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .content-header h1 {
          margin: 0 0 0.5rem 0;
          font-size: 1.75rem;
          font-weight: 600;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .content-header p {
          margin: 0;
          color: ${getColor(colors, 'gray', '11')};
          font-size: 0.9rem;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .palette-content {
          flex: 1;
          overflow-y: auto;
          padding: 2rem;
        }

        .color-table {
          background: ${getColor(colors, 'gray', '2')};
          border-radius: 0.75rem;
          border: 1px solid ${getColor(colors, 'gray', '6')};
          overflow: hidden;
        }

        .table-header {
          display: grid;
          grid-template-columns: 120px repeat(12, 1fr);
          background: ${getColor(colors, 'gray', '3')};
          border-bottom: 1px solid ${getColor(colors, 'gray', '6')};
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .color-name-header, .scale-header {
          padding: 1rem 0.5rem;
          font-weight: 600;
          text-align: center;
          font-size: 0.9rem;
          color: ${getColor(colors, 'gray', '12')};
        }

        .color-name-header {
          text-align: left;
          padding-left: 1rem;
        }

        .color-row {
          display: grid;
          grid-template-columns: 120px repeat(12, 1fr);
          border-bottom: 1px solid ${getColor(colors, 'gray', '5')};
          transition: background 0.2s ease;
        }

        .color-row:hover {
          background: ${getColor(colors, 'gray', '3')};
        }

        .color-row:last-child {
          border-bottom: none;
        }

        .color-name {
          padding: 1rem;
          font-weight: 600;
          text-transform: capitalize;
          color: ${getColor(colors, 'gray', '12')};
          display: flex;
          align-items: center;
        }

        .color-swatch {
          width: 100%;
          height: 3rem;
          border-right: 1px solid ${getColor(colors, 'gray', '5')};
          cursor: pointer;
          transition: transform 0.15s ease;
          position: relative;
        }

        .color-swatch:hover {
          transform: scale(1.02);
          z-index: 5;
        }

        .color-swatch:last-child {
          border-right: none;
        }



        /* Settings Panel Styles */
        .settings-panel {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .theme-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .current-theme {
          font-size: 0.9rem;
          color: ${getColor(colors, 'gray', '11')};
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .theme-toggle-btn {
          padding: 0.5rem 1rem;
          background: ${getColor(colors, 'blue', '9')};
          color: white;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          transition: background 0.2s ease;
        }

        .theme-toggle-btn:hover {
          background: ${getColor(colors, 'blue', '10')};
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .header-content {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .table-header, .color-row {
            grid-template-columns: 100px repeat(12, 1fr);
          }

          .color-swatch {
            height: 2.5rem;
          }
        }

        @media (max-width: 768px) {
          .content-header {
            padding: 1rem;
          }

          .palette-content {
            padding: 1rem;
          }

          .table-header, .color-row {
            grid-template-columns: 80px repeat(12, 1fr);
          }

          .color-name-header, .scale-header {
            padding: 0.75rem 0.25rem;
            font-size: 0.8rem;
          }

          .color-name {
            padding: 0.75rem;
            font-size: 0.9rem;
          }

          .color-swatch {
            height: 2rem;
          }

          .settings-panel {
            flex-direction: column;
            gap: 0.5rem;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
