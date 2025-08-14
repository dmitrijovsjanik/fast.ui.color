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
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

function SettingsPanel({ theme, toggleTheme, selectedCategory, onCategoryChange }: SettingsPanelProps) {
  const categories = [
    { id: 'neutral', name: 'Neutral', colors: ['gray', 'mauve', 'slate', 'sage', 'olive', 'sand'] },
    { id: 'red', name: 'Red', colors: ['tomato', 'red', 'ruby', 'crimson'] },
    { id: 'pink', name: 'Pink', colors: ['pink', 'plum', 'purple', 'violet', 'indigo'] },
    { id: 'blue', name: 'Blue', colors: ['blue', 'cyan', 'teal'] },
    { id: 'green', name: 'Green', colors: ['green', 'grass'] },
    { id: 'brown', name: 'Brown', colors: ['brown'] },
    { id: 'orange', name: 'Orange', colors: ['orange'] },
    { id: 'sky', name: 'Sky', colors: ['sky'] },
    { id: 'mint', name: 'Mint', colors: ['mint'] },
    { id: 'lime', name: 'Lime', colors: ['lime'] },
    { id: 'yellow', name: 'Yellow', colors: ['yellow', 'amber', 'gold', 'bronze'] },
  ];

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h2>Settings</h2>
      </div>
      
      <div className="theme-section">
        <h3>Theme</h3>
        <div className="theme-controls">
          <span className="current-theme">
            {theme.mode} {theme.isDark ? '(Dark)' : '(Light)'}
          </span>
          <button onClick={toggleTheme} className="theme-toggle-btn">
            Toggle
          </button>
        </div>
      </div>

      <div className="category-section">
        <h3>Categories</h3>
        <div className="category-list">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => onCategoryChange(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
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
      <div className="settings-sidebar">
        <SettingsPanel
          theme={theme}
          toggleTheme={toggleTheme}
          selectedCategory=""
          onCategoryChange={() => {}}
        />
      </div>

      <div className="content-area">
        <div className="content-header">
          <h1>Radix UI Color Palette</h1>
          <p>Complete color system with {allColors.length} color scales</p>
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
          display: flex;
          height: 100vh;
          background: ${getColor(colors, 'gray', '1')};
          color: ${getColor(colors, 'gray', '12')};
          transition: all 0.3s ease;
        }

        .settings-sidebar {
          width: 280px;
          background: ${getColor(colors, 'gray', '2')};
          border-right: 1px solid ${getColor(colors, 'gray', '6')};
          overflow-y: auto;
          flex-shrink: 0;
        }

        .content-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .content-header {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid ${getColor(colors, 'gray', '6')};
          background: ${getColor(colors, 'gray', '1')};
        }

        .content-header h1 {
          margin: 0 0 0.5rem 0;
          font-size: 1.75rem;
          font-weight: 600;
        }

        .content-header p {
          margin: 0;
          color: ${getColor(colors, 'gray', '11')};
          font-size: 0.9rem;
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
          padding: 1.5rem;
        }

        .settings-header h2 {
          margin: 0 0 1.5rem 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .theme-section, .category-section {
          margin-bottom: 1.5rem;
        }

        .theme-section h3, .category-section h3 {
          margin: 0 0 0.75rem 0;
          font-size: 0.9rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: ${getColor(colors, 'gray', '11')};
        }

        .theme-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
        }

        .current-theme {
          font-size: 0.85rem;
          color: ${getColor(colors, 'gray', '11')};
        }

        .theme-toggle-btn {
          padding: 0.375rem 0.75rem;
          background: ${getColor(colors, 'blue', '9')};
          color: white;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 500;
          transition: background 0.2s ease;
        }

        .theme-toggle-btn:hover {
          background: ${getColor(colors, 'blue', '10')};
        }

        .category-list {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .category-btn {
          padding: 0.5rem 0.75rem;
          background: transparent;
          border: 1px solid ${getColor(colors, 'gray', '6')};
          border-radius: 0.375rem;
          color: ${getColor(colors, 'gray', '11')};
          cursor: pointer;
          font-size: 0.85rem;
          text-align: left;
          transition: all 0.2s ease;
        }

        .category-btn:hover {
          background: ${getColor(colors, 'gray', '3')};
          border-color: ${getColor(colors, 'gray', '7')};
        }

        .category-btn.active {
          background: ${getColor(colors, 'blue', '9')};
          border-color: ${getColor(colors, 'blue', '9')};
          color: white;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .color-palette-container {
            flex-direction: column;
          }

          .settings-sidebar {
            width: 100%;
            height: auto;
            border-right: none;
            border-bottom: 1px solid ${getColor(colors, 'gray', '6')};
          }

          .settings-panel {
            padding: 1rem;
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
        }
      `}</style>
    </div>
  );
}
