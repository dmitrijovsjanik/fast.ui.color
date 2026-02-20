import type { GenerationConfig, SecondaryConfig, SecondaryMode, HarmonyType, HarmonyVariation, ThemeMode } from '@color-tool/core';
import { getHarmonyVariations, getHarmonyLabel } from '@color-tool/core';
import { ColorInput } from './ColorInput';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <div className="flex items-center gap-2">
              <Switch
                id="tinted-neutral"
                checked={config.neutralStyle === 'tinted'}
                onCheckedChange={(checked) => onConfigChange({ neutralStyle: checked ? 'tinted' : 'pure-gray' })}
              />
              <Label htmlFor="tinted-neutral" className="text-xs text-muted-foreground cursor-pointer">
                Tinted Neutral
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="fixed-brand"
                checked={config.brandMode === 'fixed'}
                onCheckedChange={(checked) => onConfigChange({ brandMode: checked ? 'fixed' : 'auto' })}
              />
              <Label htmlFor="fixed-brand" className="text-xs text-muted-foreground cursor-pointer">
                Fixed Brand
              </Label>
            </div>

            {config.brandMode === 'fixed' && (
              <div className="flex items-center gap-2">
                <Switch
                  id="fixed-dark-brand"
                  checked={config.darkBrandAdaptation === 'fixed'}
                  onCheckedChange={(checked) => onConfigChange({ darkBrandAdaptation: checked ? 'fixed' : 'adaptive' })}
                />
                <Label htmlFor="fixed-dark-brand" className="text-xs text-muted-foreground cursor-pointer">
                  Fixed Dark Brand
                </Label>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Switch
                id="equal-chroma"
                checked={config.chromaEqualization === 'equal'}
                onCheckedChange={(checked) => onConfigChange({ chromaEqualization: checked ? 'equal' : 'independent' })}
              />
              <Label htmlFor="equal-chroma" className="text-xs text-muted-foreground cursor-pointer">
                Equal Chroma
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="p3-gamut"
                checked={config.gamut === 'P3'}
                onCheckedChange={(checked) => onConfigChange({ gamut: checked ? 'P3' : 'sRGB' })}
              />
              <Label htmlFor="p3-gamut" className="text-xs text-muted-foreground cursor-pointer">
                P3 Gamut
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="adaptive-lightness"
                checked={config.lightnessMapping === 'interpolated'}
                onCheckedChange={(checked) => onConfigChange({ lightnessMapping: checked ? 'interpolated' : 'fixed' })}
              />
              <Label htmlFor="adaptive-lightness" className="text-xs text-muted-foreground cursor-pointer">
                Adaptive Lightness
              </Label>
            </div>

            {/* Display & Theme — right-aligned */}
            <div className="flex items-center gap-6 ml-auto">
              {displayMode && onDisplayModeChange && (
                <div className="flex items-center gap-2">
                  <Switch
                    id="fill-display"
                    checked={displayMode === 'fill'}
                    onCheckedChange={(checked) => onDisplayModeChange(checked ? 'fill' : 'semantic')}
                  />
                  <Label htmlFor="fill-display" className="text-xs text-muted-foreground cursor-pointer">
                    Fill Display
                  </Label>
                </div>
              )}
              {theme && onThemeToggle && (
                <div className="flex items-center gap-2">
                  <Switch
                    id="dark-theme"
                    checked={theme === 'dark'}
                    onCheckedChange={() => onThemeToggle()}
                  />
                  <Label htmlFor="dark-theme" className="text-xs text-muted-foreground cursor-pointer">
                    Dark Theme
                  </Label>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
