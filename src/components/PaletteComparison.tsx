import { useColors } from '../themes/themeProvider';
import { getPaletteByMode } from '../colors/paletteModes';
import { getColor, ColorPalette as ColorPaletteType } from '../colors/palette';

interface PaletteComparisonProps {
  selectedColor: keyof ColorPaletteType;
}

export function PaletteComparison({ selectedColor }: PaletteComparisonProps) {
  const baseColors = useColors();
  const semanticColors = getPaletteByMode(baseColors, 'semantic');
  const linearColors = getPaletteByMode(baseColors, 'linear');

  return (
    <div className="palette-comparison">
      <div className="comparison-header">
        <h3>Сравнение палитр для {selectedColor}</h3>
        <p>Семантическая vs Линейная палитра</p>
      </div>
      
      <div className="comparison-grid">
        <div className="comparison-column">
          <div className="column-header semantic">
            <span className="mode-icon">🎨</span>
            <span className="mode-title">Semantic</span>
            <span className="mode-description">Больше оттенков, тонкие переходы</span>
          </div>
          <div className="color-scales">
            {Array.from({ length: 12 }, (_, i) => i + 1).map(scale => (
              <div key={scale} className="color-scale-item">
                <div className="scale-number">{scale}</div>
                <div 
                  className="color-preview semantic"
                  style={{ backgroundColor: getColor(semanticColors, selectedColor, scale as any) }}
                />
                <div className="color-value">
                  {getColor(semanticColors, selectedColor, scale as any)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="comparison-column">
          <div className="column-header linear">
            <span className="mode-icon">📊</span>
            <span className="mode-title">Linear</span>
            <span className="mode-description">Меньше оттенков, четкие переходы</span>
          </div>
          <div className="color-scales">
            {Array.from({ length: 12 }, (_, i) => i + 1).map(scale => (
              <div key={scale} className="color-scale-item">
                <div className="scale-number">{scale}</div>
                <div 
                  className="color-preview linear"
                  style={{ backgroundColor: getColor(linearColors, selectedColor, scale as any) }}
                />
                <div className="color-value">
                  {getColor(linearColors, selectedColor, scale as any)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .palette-comparison {
          background: ${getColor(baseColors, 'gray', 2)};
          border: 1px solid ${getColor(baseColors, 'gray', 6)};
          border-radius: 0.75rem;
          padding: 1.5rem;
          margin: 1rem 0;
        }

        .comparison-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .comparison-header h3 {
          margin: 0 0 0.5rem 0;
          color: ${getColor(baseColors, 'gray', 12)};
          font-size: 1.25rem;
          font-weight: 600;
        }

        .comparison-header p {
          margin: 0;
          color: ${getColor(baseColors, 'gray', 11)};
          font-size: 0.875rem;
        }

        .comparison-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .comparison-column {
          display: flex;
          flex-direction: column;
        }

        .column-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
          text-align: center;
        }

        .column-header.semantic {
          background: ${getColor(baseColors, 'blue', 3)};
          border: 1px solid ${getColor(baseColors, 'blue', 6)};
        }

        .column-header.linear {
          background: ${getColor(baseColors, 'green', 3)};
          border: 1px solid ${getColor(baseColors, 'green', 6)};
        }

        .mode-icon {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .mode-title {
          font-weight: 600;
          font-size: 1rem;
          margin-bottom: 0.25rem;
          color: ${getColor(baseColors, 'gray', 12)};
        }

        .mode-description {
          font-size: 0.75rem;
          opacity: 0.8;
          color: ${getColor(baseColors, 'gray', 11)};
        }

        .color-scales {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .color-scale-item {
          display: grid;
          grid-template-columns: 40px 1fr auto;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem;
          background: ${getColor(baseColors, 'gray', 1)};
          border: 1px solid ${getColor(baseColors, 'gray', 5)};
          border-radius: 0.375rem;
        }

        .scale-number {
          font-weight: 600;
          font-size: 0.875rem;
          color: ${getColor(baseColors, 'gray', 11)};
          text-align: center;
        }

        .color-preview {
          width: 100%;
          height: 2rem;
          border-radius: 0.25rem;
          border: 1px solid ${getColor(baseColors, 'gray', 6)};
        }

        .color-value {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.75rem;
          color: ${getColor(baseColors, 'gray', 10)};
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        @media (max-width: 768px) {
          .comparison-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .color-scale-item {
            grid-template-columns: 30px 1fr;
            gap: 0.5rem;
          }

          .color-value {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
