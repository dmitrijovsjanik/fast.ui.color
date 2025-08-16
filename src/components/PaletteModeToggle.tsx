

export type PaletteMode = 'semantic' | 'linear';

interface PaletteModeToggleProps {
  mode: PaletteMode;
  onModeChange: (mode: PaletteMode) => void;
}

export function PaletteModeToggle({ mode, onModeChange }: PaletteModeToggleProps) {
  return (
    <div className="palette-mode-toggle">
      <div className="toggle-container">
        <button
          className={`toggle-button ${mode === 'semantic' ? 'active' : ''}`}
          onClick={() => onModeChange('semantic')}
        >
          <span className="toggle-icon">🎨</span>
          <span className="toggle-label">Semantic</span>
          <span className="toggle-description">Больше оттенков</span>
        </button>
        <button
          className={`toggle-button ${mode === 'linear' ? 'active' : ''}`}
          onClick={() => onModeChange('linear')}
        >
          <span className="toggle-icon">📊</span>
          <span className="toggle-label">Linear</span>
          <span className="toggle-description">Меньше оттенков</span>
        </button>
      </div>
    </div>
  );
}
