import { useState, useEffect, useRef } from 'react';
import type { Palette, OklchPalette, AlphaPalette, SemanticRole, StepIndex } from '@color-tool/core';
import { SEMANTIC_ROLES, STEP_INDICES, checkAPCAContrast } from '@color-tool/core';

// Parse fraction input: "025" → 0.25, "0" → 0, "0,15" → 0.15, "1" → 1
function parseFractionInput(raw: string): number | null {
  const s = raw.trim();
  if (s === '' || s === ',' || s === '0,') return null;
  // Replace comma with dot for parsing
  const normalized = s.replace(',', '.');
  // "025" or "037" → insert dot after 0: "0.25", "0.37"
  if (/^0\d{2,}$/.test(normalized)) {
    const parsed = parseFloat('0.' + normalized.slice(1));
    return isNaN(parsed) ? null : parsed;
  }
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? null : parsed;
}

// Format number with comma as decimal separator
function formatFraction(n: number): string {
  return n.toFixed(3).replace('.', ',');
}

// Deferred-commit number input with auto "0." insertion
function StepPositionInput({
  value,
  onChange,
  onReset,
  isModified,
}: {
  value: number;
  onChange: (v: number) => void;
  onReset: () => void;
  isModified: boolean;
}) {
  const [localValue, setLocalValue] = useState(formatFraction(value));
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync from parent when not focused
  useEffect(() => {
    if (!isFocused) {
      setLocalValue(formatFraction(value));
    }
  }, [value, isFocused]);

  const commit = () => {
    const parsed = parseFractionInput(localValue);
    if (parsed !== null) {
      const clamped = Math.max(0, Math.min(1, parsed));
      onChange(clamped);
      setLocalValue(formatFraction(clamped));
    } else {
      setLocalValue(formatFraction(value));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value;
    // Auto-insert "0," when user types a single "0"
    if (v === '0') {
      setLocalValue('0,');
      requestAnimationFrame(() => {
        inputRef.current?.setSelectionRange(2, 2);
      });
      return;
    }
    setLocalValue(v);
  };

  return (
    <div className="relative group">
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={localValue}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          commit();
        }}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            commit();
            inputRef.current?.blur();
          }
          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            const step = e.shiftKey ? 0.1 : 0.01;
            const delta = e.key === 'ArrowUp' ? step : -step;
            const current = parseFractionInput(localValue) ?? value;
            const next = Math.max(0, Math.min(1, current + delta));
            onChange(next);
            setLocalValue(formatFraction(next));
          }
        }}
        onKeyPress={e => {
          // Allow only digits, comma, dot
          if (!/[\d,.]/.test(e.key)) {
            e.preventDefault();
          }
        }}
        onDoubleClick={onReset}
        className={`w-full h-10 text-center text-[10px] font-mono border rounded-sm px-0 py-0 focus:outline-none focus:border-primary ${
          isModified
            ? 'bg-primary/10 border-primary/30 text-foreground'
            : 'bg-muted/30 border-border text-foreground'
        }`}
        title={isModified ? 'Double-click to reset' : undefined}
      />
      {isModified && (
        <button
          onClick={onReset}
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-muted border border-border text-muted-foreground text-xs flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors shadow-sm"
          title="Reset to default"
        >
          ×
        </button>
      )}
    </div>
  );
}

interface PaletteMatrixProps {
  palette: Palette;
  oklchPalette: OklchPalette;
  alphaPalette?: AlphaPalette;
  onCopy: (text: string) => void;
  secondaryActive?: boolean;
  displayMode: 'semantic' | 'fill';
  colorFormat: 'alpha' | 'solid';
  stepPositions: Record<number, number>;
  defaultStepPositions: Record<number, number>;
  onStepPositionChange: (step: number, value: number) => void;
  onResetStepPosition: (step: number) => void;
  onResetAllStepPositions: () => void;
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

export function PaletteMatrix({ palette, oklchPalette, alphaPalette, onCopy, secondaryActive, displayMode, colorFormat, stepPositions, defaultStepPositions, onStepPositionChange, onResetStepPosition, onResetAllStepPositions }: PaletteMatrixProps) {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  const displayRoles = secondaryActive
    ? SEMANTIC_ROLES
    : SEMANTIC_ROLES.filter(r => r !== 'secondary');

  const useAlpha = colorFormat === 'alpha' && !!alphaPalette;

  return (
    <div className="rounded-xl bg-card p-6 mb-6">
      {/* Header row: step numbers */}
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
              const alphaColor = useAlpha ? alphaPalette[role][step] : null;
              const color = alphaColor ? alphaColor.css : hex;
              const copyValue = alphaColor ? alphaColor.css : hex;
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
                  title={`${role}-${step}: ${alphaColor ? alphaColor.css : hex}\nL: ${oklch.l.toFixed(3)} C: ${oklch.c.toFixed(3)} H: ${oklch.h.toFixed(1)}`}
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

      {/* Step position fraction inputs */}
      <div className="flex items-center mt-2">
        <div className="w-20 shrink-0 flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground">Curve</span>
          <button
            onClick={onResetAllStepPositions}
            className="px-1.5 py-0.5 text-[10px] rounded bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Reset all step positions"
          >
            Reset
          </button>
        </div>
        <div className="flex-1 grid grid-cols-12 gap-1">
          {STEP_INDICES.map(step => {
            const isEditable = step <= 8;
            const isModified = isEditable && Math.abs((stepPositions[step] ?? 0) - (defaultStepPositions[step] ?? 0)) > 0.0001;
            return (
              <div key={step}>
                {isEditable ? (
                  <StepPositionInput
                    value={stepPositions[step] ?? 0}
                    onChange={v => onStepPositionChange(step, v)}
                    onReset={() => onResetStepPosition(step)}
                    isModified={isModified}
                  />
                ) : (
                  <div className="h-10 flex items-center justify-center text-[10px] font-mono text-muted-foreground/40">—</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        Click any swatch to copy {useAlpha ? 'RGBA' : 'HEX'} value. Step 9 = primary color.
      </p>
    </div>
  );
}
