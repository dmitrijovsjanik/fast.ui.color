import { ColorPaletteType } from '../../types/FastUI';
import { generateColorPalette, getColorName } from '../../utils/colorUtils';

interface ColorPaletteProps {
  type: ColorPaletteType;
  locked?: boolean;
  colors?: string[];
  onColorClick?: (index: number) => void;
}

export function ColorPalette({ 
  type, 
  locked = false, 
  colors = [], 
  onColorClick 
}: ColorPaletteProps) {
  const colorArray = colors.length > 0 ? colors : generateColorPalette(type);

  return (
    <div className="color-row">
      <div className={`color-picker ${type} ${locked ? 'locked' : ''}`}>
        <div className="color-picker-bg"></div>
        {locked && <div className="lock-icon">🔒</div>}
      </div>
      <div className="color-palette">
        {colorArray.map((color, index) => (
          <div 
            key={index}
            className="color-shade"
            style={{ backgroundColor: color }}
            onClick={() => onColorClick?.(index)}
            title={getColorName(type, index)}
          />
        ))}
      </div>
    </div>
  );
}
