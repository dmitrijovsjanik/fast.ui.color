import React from 'react';
import { useTheme, useColors } from '../themes/themeProvider';
import { getColor, getColorScales } from '../colors/palette';

// Компонент для отображения одного цвета
interface ColorSwatchProps {
  colorName: string;
  colorValue: string;
  scale: string;
}

function ColorSwatch({ colorName, colorValue, scale }: ColorSwatchProps) {
  return (
    <div className="color-swatch">
      <div 
        className="color-preview" 
        style={{ backgroundColor: colorValue }}
        title={`${colorName} ${scale}: ${colorValue}`}
      />
      <div className="color-info">
        <span className="color-scale">{scale}</span>
        <span className="color-value">{colorValue}</span>
      </div>
    </div>
  );
}

// Компонент для отображения всех оттенков одного цвета
interface ColorScaleProps {
  colorName: string;
  colorScales: Record<string, string>;
}

function ColorScale({ colorName, colorScales }: ColorScaleProps) {
  return (
    <div className="color-scale-container">
      <h3 className="color-name">{colorName}</h3>
      <div className="color-scales">
        {Object.entries(colorScales).map(([scale, value]) => (
          <ColorSwatch
            key={scale}
            colorName={colorName}
            colorValue={value}
            scale={scale}
          />
        ))}
      </div>
    </div>
  );
}

// Основной компонент палитры
export function ColorPalette() {
  const { theme, toggleTheme } = useTheme();
  const colors = useColors();

  // Получаем основные цвета для демонстрации
  const mainColors = ['gray', 'blue', 'green', 'red'] as const;

  return (
    <div className="color-palette-container">
      <div className="palette-header">
        <h1>Radix UI Color Palette</h1>
        <div className="theme-controls">
          <span className="current-theme">
            Current theme: {theme.mode} {theme.isDark ? '(Dark)' : '(Light)'}
          </span>
          <button 
            onClick={toggleTheme}
            className="theme-toggle-btn"
          >
            Toggle Theme
          </button>
        </div>
      </div>

      <div className="palette-grid">
        {mainColors.map(colorName => (
          <ColorScale
            key={colorName}
            colorName={colorName}
            colorScales={getColorScales(colors, colorName)}
          />
        ))}
      </div>

      <style jsx>{`
        .color-palette-container {
          padding: 2rem;
          min-height: 100vh;
          background: ${getColor(colors, 'gray', '1')};
          color: ${getColor(colors, 'gray', '12')};
          transition: all 0.3s ease;
        }

        .palette-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid ${getColor(colors, 'gray', '6')};
        }

        .palette-header h1 {
          margin: 0;
          font-size: 2rem;
          font-weight: 600;
        }

        .theme-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .current-theme {
          font-size: 0.9rem;
          color: ${getColor(colors, 'gray', '11')};
        }

        .theme-toggle-btn {
          padding: 0.5rem 1rem;
          background: ${getColor(colors, 'blue', '9')};
          color: white;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background 0.2s ease;
        }

        .theme-toggle-btn:hover {
          background: ${getColor(colors, 'blue', '10')};
        }

        .palette-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .color-scale-container {
          background: ${getColor(colors, 'gray', '2')};
          border-radius: 0.75rem;
          padding: 1.5rem;
          border: 1px solid ${getColor(colors, 'gray', '6')};
        }

        .color-name {
          margin: 0 0 1rem 0;
          font-size: 1.25rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .color-scales {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 0.5rem;
        }

        .color-swatch {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .color-preview {
          width: 100%;
          height: 2rem;
          border-radius: 0.25rem;
          border: 1px solid ${getColor(colors, 'gray', '6')};
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .color-preview:hover {
          transform: scale(1.05);
        }

        .color-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 0.75rem;
        }

        .color-scale {
          font-weight: 600;
          color: ${getColor(colors, 'gray', '11')};
        }

        .color-value {
          color: ${getColor(colors, 'gray', '10')};
          font-family: monospace;
          word-break: break-all;
        }

        @media (max-width: 768px) {
          .palette-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .color-scales {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
