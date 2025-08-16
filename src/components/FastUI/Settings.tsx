interface SettingsProps {
  selectedScale: string;
  selectedNaming: string;
  onScaleChange?: (scale: string) => void;
  onNamingChange?: (naming: string) => void;
}

export function Settings({ 
  selectedScale, 
  selectedNaming, 
  onScaleChange, 
  onNamingChange 
}: SettingsProps) {
  return (
    <div className="settings">
      <div className="setting-group">
        <div className="setting-label">Scale</div>
        <div className="setting-value">{selectedScale}</div>
        <div className="setting-icon">▼</div>
      </div>
      <div className="setting-group">
        <div className="setting-label">Naming</div>
        <div className="setting-value">{selectedNaming}</div>
        <div className="setting-icon">▼</div>
      </div>
    </div>
  );
}
