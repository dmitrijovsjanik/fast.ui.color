import type { GenerationConfig, SecondaryConfig, SecondaryMode, HarmonyType, HarmonyVariation, NeutralStyle, BrandMode, ChromaEqualization, LightnessMapping, ThemeMode } from '@color-tool/core';
import { getHarmonyVariations, getHarmonyLabel } from '@color-tool/core';
import { ColorInput } from './ColorInput';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface BrandInputProps {
  color: string;
  onChange: (color: string) => void;
  backgroundColor?: string;
  defaultBackgroundColor?: string;
  onBackgroundChange?: (color: string) => void;
  secondaryConfig?: SecondaryConfig;
  secondaryColor?: string;
  onSecondaryColorChange?: (color: string) => void;
  onSecondaryConfigChange?: (partial: Partial<SecondaryConfig>) => void;
  config?: GenerationConfig;
  onConfigChange?: (partial: Partial<GenerationConfig>) => void;
  displayMode?: 'semantic' | 'fill';
  onDisplayModeChange?: (mode: 'semantic' | 'fill') => void;
  theme?: ThemeMode;
  onThemeToggle?: () => void;
}

const HARMONY_LABELS: Record<HarmonyType, string> = {
  'complementary': 'Compl',
  'analogous': 'Analog',
  'triadic': 'Triad',
  'split-complementary': 'Split',
  'tetradic': 'Tetrad',
};

export function BrandInput({
  color,
  onChange,
  backgroundColor,
  defaultBackgroundColor,
  onBackgroundChange,
  secondaryConfig,
  secondaryColor,
  onSecondaryColorChange,
  onSecondaryConfigChange,
  config,
  onConfigChange,
  displayMode,
  onDisplayModeChange,
  theme,
  onThemeToggle,
}: BrandInputProps) {
  const isSecondaryActive = secondaryConfig && secondaryConfig.mode !== 'off';
  const variations = secondaryConfig ? getHarmonyVariations(secondaryConfig.harmonyType) : [];
  const hasMultipleVariations = variations.length > 1;

  return (
    <div className="rounded-xl bg-card p-6 mb-6">
      {/* Color inputs + secondary brand */}
      <div className="flex flex-wrap items-start gap-6">
        <ColorInput label="Brand Color" color={color} onChange={onChange} />
        {backgroundColor !== undefined && onBackgroundChange && (
          <ColorInput
            label="Background"
            color={backgroundColor}
            onChange={onBackgroundChange}
            defaultColor={defaultBackgroundColor}
          />
        )}

        {secondaryConfig && onSecondaryConfigChange && (
          <>
            <div className="flex flex-col gap-2">
              <Label className="text-xs text-muted-foreground">Secondary Brand</Label>
              <ToggleGroup
                type="single"
                size="sm"
                value={secondaryConfig.mode}
                onValueChange={(v) => v && onSecondaryConfigChange({ mode: v as SecondaryMode })}
              >
                <ToggleGroupItem value="off">Off</ToggleGroupItem>
                <ToggleGroupItem value="auto">Auto</ToggleGroupItem>
                <ToggleGroupItem value="custom">Custom</ToggleGroupItem>
              </ToggleGroup>
            </div>

            {secondaryConfig.mode === 'auto' && (
              <>
                <div className="flex flex-col gap-2">
                  <Label className="text-xs text-muted-foreground">Harmony</Label>
                  <ToggleGroup
                    type="single"
                    size="sm"
                    value={secondaryConfig.harmonyType}
                    onValueChange={(v) => v && onSecondaryConfigChange({ harmonyType: v as HarmonyType })}
                  >
                    {(Object.keys(HARMONY_LABELS) as HarmonyType[]).map(type => (
                      <ToggleGroupItem key={type} value={type}>{HARMONY_LABELS[type]}</ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>

                {hasMultipleVariations && (
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs text-muted-foreground">Variation</Label>
                    <ToggleGroup
                      type="single"
                      size="sm"
                      value={secondaryConfig.harmonyVariation}
                      onValueChange={(v) => v && onSecondaryConfigChange({ harmonyVariation: v as HarmonyVariation })}
                    >
                      {variations.map(v => (
                        <ToggleGroupItem key={v} value={v}>
                          {getHarmonyLabel(secondaryConfig.harmonyType, v)}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </div>
                )}

                {secondaryColor && (
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs text-muted-foreground">Preview</Label>
                    <div
                      className="w-8 h-8 rounded-md border border-border"
                      style={{ backgroundColor: secondaryColor }}
                      title={secondaryColor}
                    />
                  </div>
                )}
              </>
            )}

            {secondaryConfig.mode === 'custom' && onSecondaryColorChange && (
              <ColorInput
                label="Secondary Color"
                color={secondaryConfig.customColor || '#E52563'}
                onChange={onSecondaryColorChange}
              />
            )}
          </>
        )}
      </div>

      {/* Generation settings */}
      {config && onConfigChange && (
        <div className="mt-5 pt-5 border-t border-border">
          <div className="flex flex-wrap items-start gap-6">
            <div className="flex flex-col gap-2">
              <Label className="text-xs text-muted-foreground">Neutral</Label>
              <ToggleGroup
                type="single"
                size="sm"
                value={config.neutralStyle}
                onValueChange={(v) => v && onConfigChange({ neutralStyle: v as NeutralStyle })}
              >
                <ToggleGroupItem value="tinted">Tinted</ToggleGroupItem>
                <ToggleGroupItem value="pure-gray">Pure Gray</ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-xs text-muted-foreground">Brand Step 9</Label>
              <ToggleGroup
                type="single"
                size="sm"
                value={config.brandMode}
                onValueChange={(v) => v && onConfigChange({ brandMode: v as BrandMode })}
              >
                <ToggleGroupItem value="auto">Auto</ToggleGroupItem>
                <ToggleGroupItem value="fixed">Fixed</ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-xs text-muted-foreground">Chroma</Label>
              <ToggleGroup
                type="single"
                size="sm"
                value={config.chromaEqualization}
                onValueChange={(v) => v && onConfigChange({ chromaEqualization: v as ChromaEqualization })}
              >
                <ToggleGroupItem value="independent">Independent</ToggleGroupItem>
                <ToggleGroupItem value="equal">Equal</ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-xs text-muted-foreground">Gamut</Label>
              <ToggleGroup
                type="single"
                size="sm"
                value={config.gamut}
                onValueChange={(v) => v && onConfigChange({ gamut: v as 'sRGB' | 'P3' })}
              >
                <ToggleGroupItem value="sRGB">sRGB</ToggleGroupItem>
                <ToggleGroupItem value="P3">P3</ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-xs text-muted-foreground">Lightness</Label>
              <ToggleGroup
                type="single"
                size="sm"
                value={config.lightnessMapping}
                onValueChange={(v) => v && onConfigChange({ lightnessMapping: v as LightnessMapping })}
              >
                <ToggleGroupItem value="fixed">Fixed</ToggleGroupItem>
                <ToggleGroupItem value="interpolated">Adaptive</ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Palette display — right-aligned */}
            <div className="flex items-end gap-3 ml-auto">
              {displayMode && onDisplayModeChange && (
                <div className="flex flex-col gap-2">
                  <Label className="text-xs text-muted-foreground">Display</Label>
                  <ToggleGroup
                    type="single"
                    size="sm"
                    value={displayMode}
                    onValueChange={(v) => v && onDisplayModeChange(v as 'semantic' | 'fill')}
                  >
                    <ToggleGroupItem value="semantic">Semantic</ToggleGroupItem>
                    <ToggleGroupItem value="fill">Fill</ToggleGroupItem>
                  </ToggleGroup>
                </div>
              )}
              {theme && onThemeToggle && (
                <div className="flex flex-col gap-2">
                  <Label className="text-xs text-muted-foreground">Theme</Label>
                  <ToggleGroup
                    type="single"
                    size="sm"
                    value={theme}
                    onValueChange={(v) => v && v !== theme && onThemeToggle()}
                  >
                    <ToggleGroupItem value="light">Light</ToggleGroupItem>
                    <ToggleGroupItem value="dark">Dark</ToggleGroupItem>
                  </ToggleGroup>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
