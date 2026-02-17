import { useState } from 'react';
import type { Palette, OklchPalette, AlphaPalette, SemanticRole, StepIndex } from '@color-tool/core';
import { SEMANTIC_ROLES, STEP_INDICES, checkAPCAContrast } from '@color-tool/core';

interface PaletteMatrixProps {
  palette: Palette;
  oklchPalette: OklchPalette;
  alphaPalette?: AlphaPalette;
  onCopy: (text: string) => void;
  secondaryActive?: boolean;
  displayMode: 'semantic' | 'fill';
}

const ROLE_LABELS: Record<SemanticRole, string> = {
  brand: 'Brand',
  secondary: 'Secondary',
  success: 'Success',
  warning: 'Warning',
  danger: 'Danger',
  info: 'Info',
  neutral: 'Neutral',
};

const APCA_MIN_LC = 45;

function getAaColor(step: StepIndex, scale: Record<StepIndex, string>): string | null {
  if (step >= 3 && step <= 5) return scale[11];
  if (step === 9 || step === 10) {
    const bg = scale[9];
    const whiteLc = Math.abs(checkAPCAContrast('#ffffff', bg));
    if (whiteLc >= APCA_MIN_LC) return '#ffffff';
    const blackLc = Math.abs(checkAPCAContrast('#000000', bg));
    return blackLc >= APCA_MIN_LC ? '#000000' : scale[1];
  }
  if (step === 11 || step === 12) return scale[step];
  return null;
}

export function PaletteMatrix({ palette, oklchPalette, alphaPalette, onCopy, secondaryActive, displayMode }: PaletteMatrixProps) {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  const displayRoles = secondaryActive
    ? SEMANTIC_ROLES
    : SEMANTIC_ROLES.filter(r => r !== 'secondary');

  return (
    <div className="rounded-xl bg-card p-6 mb-6">
      {/* Step numbers header */}
      <div className="flex items-center mb-2">
        <div className="w-20 shrink-0" />
        <div className="flex-1 grid grid-cols-12 gap-1">
          {STEP_INDICES.map(step => (
            <div
              key={step}
              className={`text-center text-xs font-medium ${
                step === 9 ? 'text-primary font-bold' : 'text-muted-foreground'
              }`}
            >
              {step}
            </div>
          ))}
        </div>
      </div>

      {/* Color rows */}
      {displayRoles.map(role => (
        <div key={role} className="flex items-center mb-1.5">
          <div className="w-20 shrink-0 flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: palette[role][9] }}
            />
            <span className="text-xs font-medium text-muted-foreground">{ROLE_LABELS[role]}</span>
          </div>

          <div className="flex-1 grid grid-cols-12 gap-1">
            {STEP_INDICES.map(step => {
              const hex = palette[role][step];
              const color = hex;
              const copyValue = hex;
              const oklch = oklchPalette[role][step];
              const cellId = `${role}-${step}`;
              const isHovered = hoveredCell === cellId;

              const isFill = displayMode === 'fill';
              const aaColor = isFill ? null : getAaColor(step, palette[role]);
              const isBorder = !isFill && step >= 6 && step <= 8;
              const isTextOnly = !isFill && (step === 11 || step === 12);

              return (
                <div
                  key={step}
                  className={`relative h-10 rounded-sm cursor-pointer transition-all flex items-center justify-center ${
                    isHovered ? 'scale-110 z-10' : ''
                  }`}
                  style={isTextOnly
                    ? { color }
                    : isBorder
                      ? { border: `2px solid ${color}` }
                      : { backgroundColor: color }
                  }
                  onMouseEnter={() => setHoveredCell(cellId)}
                  onMouseLeave={() => setHoveredCell(null)}
                  onClick={() => onCopy(copyValue)}
                  title={`${role}-${step}: ${hex}\nL: ${oklch.l.toFixed(3)} C: ${oklch.c.toFixed(3)} H: ${oklch.h.toFixed(1)}`}
                >
                  {aaColor && (
                    <span
                      className="relative text-sm font-semibold select-none"
                      style={{ color: aaColor }}
                    >
                      Aa
                    </span>
                  )}
                  {isHovered && (
                    <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] font-mono whitespace-nowrap px-1.5 py-0.5 rounded bg-foreground text-background z-20">
                      {copyValue}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <p className="text-xs text-muted-foreground mt-4">
        Click any swatch to copy HEX value. Step 9 = primary color.
      </p>
    </div>
  );
}
