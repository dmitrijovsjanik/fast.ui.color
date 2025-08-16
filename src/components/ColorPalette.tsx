import React, { useState } from 'react';
import { useTheme, useColors } from '../themes/themeProvider';
import { getColor, ColorPalette as ColorPaletteType, ColorScale } from '../colors/palette';
import { getPaletteByMode } from '../colors/paletteModes';
import { PaletteModeToggle, PaletteMode } from './PaletteModeToggle';
import { SunIcon, MoonIcon, EyeOpenIcon, EyeClosedIcon } from '@radix-ui/react-icons';

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

// Компонент строки палитры
interface ColorRowProps {
  colorName: string;
  colors: ColorPaletteType;
}

function ColorRow({ colorName, colors }: ColorRowProps) {
  return (
    <div className="color-row">
      <div className="color-name">{colorName}</div>
      {Array.from({ length: 12 }, (_, i) => i + 1).map(scale => (
        <ColorSwatch
          key={scale}
          colorName={colorName}
          colorValue={getColor(colors, colorName as keyof ColorPaletteType, scale as keyof ColorScale)}
        />
      ))}
    </div>
  );
}

// Компонент заголовка таблицы
function TableHeader() {
  return (
    <div className="table-header">
      <div className="color-name-header">Color</div>
      {Array.from({ length: 12 }, (_, i) => i + 1).map(scale => (
        <div key={scale} className="scale-header">{scale}</div>
      ))}
    </div>
  );
}

// Компонент настроек
interface SettingsPanelProps {
  theme: any;
  toggleTheme: () => void;
  showAlpha: boolean;
  toggleAlpha: () => void;
  paletteMode: PaletteMode;
  onPaletteModeChange: (mode: PaletteMode) => void;
}

function SettingsPanel({ theme, toggleTheme, showAlpha, toggleAlpha, paletteMode, onPaletteModeChange }: SettingsPanelProps) {
  return (
    <div className="settings-panel">
      <PaletteModeToggle mode={paletteMode} onModeChange={onPaletteModeChange} />
      <div className="settings-buttons">
        <button onClick={toggleAlpha} className="alpha-toggle-btn" title={`${showAlpha ? 'Hide' : 'Show'} alpha colors`}>
          {showAlpha ? <EyeClosedIcon width={20} height={20} /> : <EyeOpenIcon width={20} height={20} />}
        </button>
        <button onClick={toggleTheme} className="theme-toggle-btn" title={`Switch to ${theme.isDark ? 'light' : 'dark'} theme`}>
          {theme.isDark ? <SunIcon width={20} height={20} /> : <MoonIcon width={20} height={20} />}
        </button>
      </div>
    </div>
  );
}

// Основной компонент палитры
export function ColorPalette() {
  const { theme, toggleTheme } = useTheme();
  const baseColors = useColors();
  const [showAlpha, setShowAlpha] = useState(false);
  const [paletteMode, setPaletteMode] = useState<PaletteMode>('semantic');

  // Получаем палитру в зависимости от выбранного режима
  const colors = getPaletteByMode(baseColors, paletteMode);

  // Все цвета в одном массиве
  const allColors = Object.keys(colors) as (keyof ColorPaletteType)[];

  return (
    <div className="color-palette-container">
      <div className="content-area">
        <div className="content-header">
          <div className="header-content">
            <div>
              <h1>Radix UI Color Palette</h1>
              <p>Complete color system with {allColors.length} color scales • {paletteMode === 'semantic' ? 'Semantic' : 'Linear'} mode</p>
            </div>
            <SettingsPanel
              theme={theme}
              toggleTheme={toggleTheme}
              showAlpha={showAlpha}
              toggleAlpha={() => setShowAlpha(!showAlpha)}
              paletteMode={paletteMode}
              onPaletteModeChange={setPaletteMode}
            />
          </div>
        </div>

        <div className="palette-content">
          <TableHeader />
          <div className="color-rows-container">
            {allColors.map(colorName => (
              <ColorRow
                key={colorName}
                colorName={colorName}
                colors={colors}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .color-palette-container {
          height: 100vh;
          background: ${getColor(colors, 'gray', 1)};
          color: ${getColor(colors, 'gray', 12)};
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
          border-bottom: 1px solid ${getColor(colors, 'gray', 6)};
          background: ${getColor(colors, 'gray', 1)};
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
          font-weight: 700;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .content-header p {
          margin: 0;
          color: ${getColor(colors, 'gray', 11)};
          font-size: 0.9rem;
          font-weight: 400;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .palette-content {
          flex: 1;
          overflow-y: auto;
          padding: 0 2rem 2rem 2rem;
        }

        .table-header {
          display: grid;
          grid-template-columns: 120px repeat(12, 1fr);
          gap: 4px;
          padding: 1rem 2rem;
          position: sticky;
          top: 0;
          z-index: 10;
          background: ${getColor(colors, 'gray', 1)} / 0.8;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid ${getColor(colors, 'gray', 6)};
          margin: 0 -2rem;
        }

        .color-name-header, .scale-header {
          padding: 0.5rem;
          font-weight: 700;
          text-align: center;
          font-size: 0.9rem;
          color: ${getColor(colors, 'gray', 12)};
          text-shadow: 0 1px 2px ${getColor(colors, 'gray', 1)} / 0.8;
        }

        .color-name-header {
          text-align: left;
          padding-left: 0;
        }

        .color-rows-container {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .color-row {
          display: grid;
          grid-template-columns: 120px repeat(12, 1fr);
          gap: 4px;
          transition: background 0.2s ease;
        }

        .color-row:hover {
          background: ${getColor(colors, 'gray', 2)};
        }

        .color-name {
          padding: 0.5rem 0;
          font-weight: 500;
          text-transform: capitalize;
          color: ${getColor(colors, 'gray', 12)};
          display: flex;
          align-items: center;
        }

        .color-swatch {
          width: 100%;
          height: 3rem;
          border-radius: 4px;
          cursor: pointer;
          transition: transform 0.15s ease;
          position: relative;
        }

        .color-swatch:hover {
          transform: scale(1.02);
          z-index: 5;
        }

        /* Settings Panel Styles */
        .settings-panel {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .settings-buttons {
          display: flex;
          align-items: center;
          gap: 0.5rem;
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
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .theme-toggle-btn:hover {
          background: ${getColor(colors, 'gray', 4)};
          border-color: ${getColor(colors, 'gray', 7)};
          color: ${getColor(colors, 'gray', 12)};
        }

        .theme-toggle-btn:focus {
          outline: none;
          box-shadow: 0 0 0 2px ${getColor(colors, 'blue', 7)};
        }

        .alpha-toggle-btn {
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
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .alpha-toggle-btn:hover {
          background: ${getColor(colors, 'gray', 4)};
          border-color: ${getColor(colors, 'gray', 7)};
          color: ${getColor(colors, 'gray', 12)};
        }

        .alpha-toggle-btn:focus {
          outline: none;
          box-shadow: 0 0 0 2px ${getColor(colors, 'blue', 7)};
        }

        /* Palette Mode Toggle Styles */
        .palette-mode-toggle {
          display: flex;
          align-items: center;
        }

        .toggle-container {
          display: flex;
          background: ${getColor(colors, 'gray', 3)};
          border: 1px solid ${getColor(colors, 'gray', 6)};
          border-radius: 0.5rem;
          padding: 0.25rem;
          gap: 0.25rem;
        }

        .toggle-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 1rem;
          background: transparent;
          border: none;
          border-radius: 0.25rem;
          cursor: pointer;
          transition: all 0.2s ease;
          color: ${getColor(colors, 'gray', 11)};
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          min-width: 80px;
        }

        .toggle-button.active {
          background: ${getColor(colors, 'gray', 5)};
          color: ${getColor(colors, 'gray', 12)};
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .toggle-button:hover:not(.active) {
          background: ${getColor(colors, 'gray', 4)};
          color: ${getColor(colors, 'gray', 12)};
        }

        .toggle-icon {
          font-size: 1.2rem;
          margin-bottom: 0.25rem;
        }

        .toggle-label {
          font-weight: 600;
          font-size: 0.875rem;
          margin-bottom: 0.125rem;
        }

        .toggle-description {
          font-size: 0.75rem;
          opacity: 0.7;
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
            padding: 0.5rem 0.25rem;
            font-size: 0.8rem;
          }

          .color-name {
            padding: 0.5rem 0;
            font-size: 0.9rem;
          }

          .color-swatch {
            height: 2rem;
          }

          .settings-panel {
            align-self: flex-end;
          }
        }
      `}</style>
    </div>
  );
}
