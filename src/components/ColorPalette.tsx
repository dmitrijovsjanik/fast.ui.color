import React, { useState } from 'react';
import { useTheme, useColors } from '../themes/themeProvider';
import { getColor, getColorScales, ColorPalette as ColorPaletteType } from '../colors/palette';

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
        title={`${colorName} ${scale}`}
      />
      <span className="color-scale">{scale}</span>
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
  const [selectedCategory, setSelectedCategory] = useState('neutral');

  // Категории цветов
  const colorCategories = {
    neutral: ['gray', 'mauve', 'slate', 'sage', 'olive', 'sand'],
    red: ['tomato', 'red', 'ruby', 'crimson'],
    pink: ['pink', 'plum', 'purple', 'violet', 'indigo'],
    blue: ['blue', 'cyan', 'teal'],
    green: ['green', 'grass'],
    brown: ['brown'],
    orange: ['orange'],
    sky: ['sky'],
    mint: ['mint'],
    lime: ['lime'],
    yellow: ['yellow', 'amber', 'gold', 'bronze'],
  };

  const currentColors = colorCategories[selectedCategory as keyof typeof colorCategories] || [];

  return (
    <div className="color-palette-container">
      <div className="settings-sidebar">
        <SettingsPanel
          theme={theme}
          toggleTheme={toggleTheme}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </div>

      <div className="content-area">
        <div className="content-header">
          <h1>Radix UI Color Palette</h1>
          <p>Complete color system with {Object.keys(colors).length} color scales</p>
        </div>

        <div className="palette-content">
          <div className="palette-grid">
            {currentColors.map(colorName => (
              <ColorScale
                key={colorName}
                colorName={colorName}
                colorScales={getColorScales(colors, colorName as keyof ColorPaletteType)}
              />
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

        .palette-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .color-scale-container {
          background: ${getColor(colors, 'gray', '2')};
          border-radius: 0.75rem;
          padding: 1.25rem;
          border: 1px solid ${getColor(colors, 'gray', '6')};
        }

        .color-name {
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .color-scales {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 0.375rem;
        }

        .color-swatch {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .color-preview {
          width: 100%;
          height: 1.75rem;
          border-radius: 0.25rem;
          border: 1px solid ${getColor(colors, 'gray', '6')};
          cursor: pointer;
          transition: transform 0.15s ease;
        }

        .color-preview:hover {
          transform: scale(1.05);
        }

        .color-scale {
          font-size: 0.7rem;
          font-weight: 500;
          color: ${getColor(colors, 'gray', '11')};
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

          .palette-grid {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 1rem;
          }

          .color-scales {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        @media (max-width: 768px) {
          .content-header {
            padding: 1rem;
          }

          .palette-content {
            padding: 1rem;
          }

          .palette-grid {
            grid-template-columns: 1fr;
          }

          .color-scales {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
