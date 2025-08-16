import { useState } from 'react';

interface SettingsProps {
  selectedScale: 'Linear' | 'Semantic';
  selectedNaming: string;
  onScaleChange: (scale: 'Linear' | 'Semantic') => void;
  onNamingChange: (naming: string) => void;
}

export function Settings({ 
  selectedScale, 
  selectedNaming,
  onScaleChange,
  onNamingChange
}: SettingsProps) {
  const [isScaleOpen, setIsScaleOpen] = useState(false);
  const [isNamingOpen, setIsNamingOpen] = useState(false);

  const scaleOptions: ('Linear' | 'Semantic')[] = ['Linear', 'Semantic'];
  const namingOptions = ['1,2,3...', '50,100,150...', 'A,B,C...'];

  const handleScaleSelect = (scale: 'Linear' | 'Semantic') => {
    onScaleChange(scale);
    setIsScaleOpen(false);
  };

  const handleNamingSelect = (naming: string) => {
    onNamingChange(naming);
    setIsNamingOpen(false);
  };

  return (
    <div className="settings">
      <div className="setting-group">
        <div 
          className="setting-dropdown"
          onClick={() => setIsScaleOpen(!isScaleOpen)}
        >
          <div className="setting-label">Scale</div>
          <div className="setting-value">{selectedScale}</div>
          <div className={`setting-icon ${isScaleOpen ? 'open' : ''}`}>▼</div>
        </div>
        {isScaleOpen && (
          <div className="dropdown-menu">
            {scaleOptions.map((option) => (
              <div
                key={option}
                className={`dropdown-item ${option === selectedScale ? 'selected' : ''}`}
                onClick={() => handleScaleSelect(option)}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="setting-group">
        <div 
          className="setting-dropdown"
          onClick={() => setIsNamingOpen(!isNamingOpen)}
        >
          <div className="setting-label">Naming</div>
          <div className="setting-value">{selectedNaming}</div>
          <div className={`setting-icon ${isNamingOpen ? 'open' : ''}`}>▼</div>
        </div>
        {isNamingOpen && (
          <div className="dropdown-menu">
            {namingOptions.map((option) => (
              <div
                key={option}
                className={`dropdown-item ${option === selectedNaming ? 'selected' : ''}`}
                onClick={() => handleNamingSelect(option)}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
