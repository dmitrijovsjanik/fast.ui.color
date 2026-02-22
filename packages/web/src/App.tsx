import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { generatePalette, checkAPCAContrast, checkBackgroundCompression, hexToOklch, DEFAULT_NAMING_CONFIG, DARK_STEP_POSITIONS, LIGHT_STEP_POSITIONS, computeHarmonicAnchors, type GenerationConfig, type GenerationResult, type NamingConfig, type SecondaryConfig } from '@color-tool/core';
import { Header } from './components/Header';
import { BrandInput } from './components/BrandInput';
import { PaletteMatrix, type CurveDisplayMode } from './components/PaletteMatrix';
import { IttenWheel } from './components/IttenWheel';
import { GamutCharts } from './components/GamutCharts';
import { ComponentShowcase } from './components/ComponentShowcase';
import { SettingsSidebar } from './components/SettingsSidebar';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const LIGHT_BG = '#ffffff';
const DARK_BG = '#111111';
const PAGE_BG_DARK = '#000000';
const PAGE_BG_LIGHT = '#ffffff';

const DEFAULT_CONFIG: GenerationConfig = {
  brandColor: '#2563EB',
  brandMode: 'auto',
  chromaEqualization: 'independent',
  theme: 'light',
  neutralStyle: 'tinted',
  gamut: 'sRGB',
  backgroundColor: LIGHT_BG,
  darkBrandAdaptation: 'adaptive',
  secondary: {
    mode: 'off',
    harmonyType: 'complementary',
    harmonyVariation: 'positive',
  },
  semanticHarmony: {
    mode: 'off',
    harmonyType: 'triadic',
    strength: 0.5,
  },
};

// --- localStorage persistence ---

const LS_KEY = 'color-tool-settings';

interface PerThemeSettings {
  stepPositions?: Record<number, number>;
  backgroundColor: string;
}

interface PersistedState {
  config: GenerationConfig;
  perTheme: { light: PerThemeSettings; dark: PerThemeSettings };
  displayMode: 'semantic' | 'fill';
  colorFormat: 'alpha' | 'solid';
  curveDisplayMode: CurveDisplayMode;
}

const DEFAULT_PER_THEME: { light: PerThemeSettings; dark: PerThemeSettings } = {
  light: { backgroundColor: LIGHT_BG },
  dark: { backgroundColor: DARK_BG },
};

function loadState(): { config: GenerationConfig; perTheme: typeof DEFAULT_PER_THEME; displayMode: 'semantic' | 'fill'; colorFormat: 'alpha' | 'solid'; curveDisplayMode: CurveDisplayMode } {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) throw new Error('no saved state');
    const parsed: PersistedState = JSON.parse(raw);
    // Apply per-theme settings to config
    const theme = parsed.config.theme ?? 'light';
    const themeSettings = parsed.perTheme?.[theme] ?? DEFAULT_PER_THEME[theme];
    const config = {
      ...DEFAULT_CONFIG,
      ...parsed.config,
      stepPositions: themeSettings.stepPositions,
      backgroundColor: themeSettings.backgroundColor,
    };
    return {
      config,
      perTheme: { ...DEFAULT_PER_THEME, ...parsed.perTheme },
      displayMode: parsed.displayMode ?? 'semantic',
      colorFormat: parsed.colorFormat ?? 'alpha',
      curveDisplayMode: parsed.curveDisplayMode ?? 'position',
    };
  } catch {
    return {
      config: DEFAULT_CONFIG,
      perTheme: DEFAULT_PER_THEME,
      displayMode: 'semantic',
      colorFormat: 'alpha',
      curveDisplayMode: 'position',
    };
  }
}

function saveState(state: PersistedState) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch { /* quota exceeded — ignore */ }
}

export function App() {
  const initial = useMemo(() => loadState(), []);
  const [config, setConfig] = useState<GenerationConfig>(initial.config);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [namingConfig, setNamingConfig] = useState<NamingConfig>(DEFAULT_NAMING_CONFIG);
  const [displayMode, setDisplayMode] = useState<'semantic' | 'fill'>(initial.displayMode);
  const [colorFormat, setColorFormat] = useState<'alpha' | 'solid'>(initial.colorFormat);
  const [vizTab, setVizTab] = useState<'hue-map' | 'showcase'>('hue-map');
  const [curveDisplayMode, setCurveDisplayMode] = useState<CurveDisplayMode>(initial.curveDisplayMode);
  const perThemeRef = useRef(initial.perTheme);

  const harmonicAnchors = useMemo(() => {
    const sh = config.semanticHarmony;
    if (!sh || sh.mode === 'off' || !result) return undefined;
    return computeHarmonicAnchors(result.semanticHues.brand, sh.harmonyType);
  }, [config.semanticHarmony, result]);

  // Step position fractions — default from theme
  const defaultPositions = useMemo(() =>
    config.theme === 'dark' ? { ...DARK_STEP_POSITIONS } : { ...LIGHT_STEP_POSITIONS },
    [config.theme]
  );
  const stepPositions = config.stepPositions ?? defaultPositions;

  const handleStepPositionChange = useCallback((step: number, value: number) => {
    setConfig(prev => {
      const base = prev.stepPositions ?? (prev.theme === 'dark' ? { ...DARK_STEP_POSITIONS } : { ...LIGHT_STEP_POSITIONS });
      const clamped = Math.max(0, Math.min(0.999, value));
      const newPositions = { ...base, [step]: clamped };
      perThemeRef.current = { ...perThemeRef.current, [prev.theme]: { ...perThemeRef.current[prev.theme], stepPositions: newPositions } };
      return { ...prev, stepPositions: newPositions };
    });
  }, []);

  const handleResetStepPosition = useCallback((step: number) => {
    setConfig(prev => {
      const defaults = prev.theme === 'dark' ? DARK_STEP_POSITIONS : LIGHT_STEP_POSITIONS;
      if (!prev.stepPositions) return prev;
      const updated = { ...prev.stepPositions, [step]: defaults[step] };
      const allDefault = Object.keys(defaults).every(k => Math.abs(updated[+k] - defaults[+k]) < 0.0001);
      const newPositions = allDefault ? undefined : updated;
      perThemeRef.current = { ...perThemeRef.current, [prev.theme]: { ...perThemeRef.current[prev.theme], stepPositions: newPositions } };
      return { ...prev, stepPositions: newPositions };
    });
  }, []);

  const handleResetAllStepPositions = useCallback(() => {
    setConfig(prev => {
      perThemeRef.current = { ...perThemeRef.current, [prev.theme]: { ...perThemeRef.current[prev.theme], stepPositions: undefined } };
      return { ...prev, stepPositions: undefined };
    });
  }, []);

  // Sync dark class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', config.theme === 'dark');
  }, [config.theme]);

  // Persist settings to localStorage
  useEffect(() => {
    // Keep perThemeRef in sync with current config
    const currentTheme = config.theme;
    perThemeRef.current = {
      ...perThemeRef.current,
      [currentTheme]: {
        stepPositions: config.stepPositions,
        backgroundColor: config.backgroundColor ?? (currentTheme === 'dark' ? DARK_BG : LIGHT_BG),
      },
    };
    // Strip per-theme fields from config before saving
    const { stepPositions: _sp, backgroundColor: _bg, ...configWithoutPerTheme } = config;
    saveState({
      config: configWithoutPerTheme as GenerationConfig,
      perTheme: perThemeRef.current,
      displayMode,
      colorFormat,
      curveDisplayMode,
    });
  }, [config, displayMode, colorFormat, curveDisplayMode]);

  // Check if bg is too bright for the current theme
  const bgCompressed = config.backgroundColor
    ? checkBackgroundCompression(hexToOklch(config.backgroundColor).l, config.theme).compressed
    : false;

  // Generate palette whenever config changes (skip if bg too bright)
  useEffect(() => {
    if (bgCompressed) return;
    const timer = setTimeout(() => {
      try {
        const r = generatePalette(config);
        setResult(r);
      } catch (e) {
        console.error('Palette generation failed:', e);
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [config, bgCompressed]);

  // Sync generated palette → shadcn CSS custom properties
  useEffect(() => {
    if (!result) return;
    const s = document.documentElement.style;
    const n = result.palette.neutral;
    const b = result.palette.brand;

    // Map palette steps to shadcn tokens
    const isDark = config.theme === 'dark';
    s.setProperty('--background', isDark ? PAGE_BG_DARK : n[1]);
    s.setProperty('--foreground', n[12]);
    s.setProperty('--card', config.backgroundColor);
    s.setProperty('--card-foreground', n[12]);
    s.setProperty('--popover', n[1]);
    s.setProperty('--popover-foreground', n[12]);
    s.setProperty('--primary', b[9]);
    // APCA contrast check: prefer white, fall back to black
    const APCA_MIN_LC = 45;
    const whiteLc = Math.abs(checkAPCAContrast('#ffffff', b[9]));
    const primaryFg = whiteLc >= APCA_MIN_LC ? '#ffffff' : '#000000';
    s.setProperty('--primary-foreground', primaryFg);
    const isSecondaryActive = config.secondary && config.secondary.mode !== 'off';
    if (isSecondaryActive) {
      const sec = result.palette.secondary;
      s.setProperty('--secondary', sec[3]);
      s.setProperty('--secondary-foreground', sec[12]);
    } else {
      s.setProperty('--secondary', n[3]);
      s.setProperty('--secondary-foreground', n[12]);
    }
    const na = result.alphaPalette?.neutral;
    s.setProperty('--muted', na ? na[3].css : n[3]);
    s.setProperty('--muted-foreground', n[11]);
    s.setProperty('--accent', na ? na[3].css : n[3]);
    s.setProperty('--accent-foreground', n[12]);
    s.setProperty('--border', n[6]);
    s.setProperty('--input', n[6]);
    s.setProperty('--ring', b[9]);
  }, [result, config.backgroundColor, config.theme]);

  const handleBrandColorChange = useCallback((color: string) => {
    setConfig(prev => ({ ...prev, brandColor: color }));
  }, []);

  const handleBackgroundChange = useCallback((color: string) => {
    setConfig(prev => {
      perThemeRef.current = { ...perThemeRef.current, [prev.theme]: { ...perThemeRef.current[prev.theme], backgroundColor: color } };
      return { ...prev, backgroundColor: color };
    });
  }, []);

  const handleThemeToggle = useCallback(() => {
    setConfig(prev => {
      const newTheme = prev.theme === 'light' ? 'dark' : 'light';
      // Save current theme's per-theme settings
      perThemeRef.current = {
        ...perThemeRef.current,
        [prev.theme]: {
          stepPositions: prev.stepPositions,
          backgroundColor: prev.backgroundColor ?? (prev.theme === 'dark' ? DARK_BG : LIGHT_BG),
        },
      };
      // Restore new theme's per-theme settings
      const newThemeSettings = perThemeRef.current[newTheme];
      return {
        ...prev,
        theme: newTheme,
        stepPositions: newThemeSettings.stepPositions,
        backgroundColor: newThemeSettings.backgroundColor,
      };
    });
  }, []);

  const handleConfigChange = useCallback((partial: Partial<GenerationConfig>) => {
    setConfig(prev => ({ ...prev, ...partial }));
  }, []);

  const handleSecondaryColorChange = useCallback((color: string) => {
    setConfig(prev => ({
      ...prev,
      secondary: { ...prev.secondary!, mode: 'custom' as const, customColor: color },
    }));
  }, []);

  const handleSecondaryConfigChange = useCallback((partial: Partial<SecondaryConfig>) => {
    setConfig(prev => {
      const merged = { ...prev.secondary!, ...partial };
      if (partial.mode === 'custom' && !merged.customColor) {
        merged.customColor = '#E52563';
      }
      return { ...prev, secondary: merged };
    });
  }, []);

  const generateBothThemes = useCallback(() => {
    const pt = perThemeRef.current;
    const lightResult = generatePalette({ ...config, theme: 'light', backgroundColor: pt.light.backgroundColor, stepPositions: pt.light.stepPositions });
    const darkResult = generatePalette({ ...config, theme: 'dark', backgroundColor: pt.dark.backgroundColor, stepPositions: pt.dark.stepPositions });
    return { lightResult, darkResult };
  }, [config]);

  const handleCopy = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <BrandInput
          color={config.brandColor}
          onChange={handleBrandColorChange}
          backgroundColor={config.backgroundColor}
          defaultBackgroundColor={config.theme === 'dark' ? DARK_BG : LIGHT_BG}
          onBackgroundChange={handleBackgroundChange}
          bgCompressed={bgCompressed}
          secondaryConfig={config.secondary}
          secondaryColor={result?.palette.secondary[9]}
          onSecondaryColorChange={handleSecondaryColorChange}
          onSecondaryConfigChange={handleSecondaryConfigChange}
          config={config}
          onConfigChange={handleConfigChange}
          displayMode={displayMode}
          onDisplayModeChange={setDisplayMode}
          theme={config.theme}
          onThemeToggle={handleThemeToggle}
          colorFormat={colorFormat}
          onColorFormatChange={setColorFormat}
        />
        {result && (
          <>
            <PaletteMatrix
              palette={result.palette}
              oklchPalette={result.oklchPalette}
              alphaPalette={result.alphaPalette}
              onCopy={handleCopy}
              secondaryActive={config.secondary?.mode !== 'off'}
              displayMode={displayMode}
              colorFormat={colorFormat}
              stepPositions={stepPositions}
              defaultStepPositions={defaultPositions}
              onStepPositionChange={handleStepPositionChange}
              onResetStepPosition={handleResetStepPosition}
              onResetAllStepPositions={handleResetAllStepPositions}
              curveDisplayMode={curveDisplayMode}
              onCurveDisplayModeChange={setCurveDisplayMode}
              backgroundColor={config.backgroundColor ?? (config.theme === 'dark' ? DARK_BG : LIGHT_BG)}
              theme={config.theme}
            />
            <div className="rounded-xl bg-card p-6 mb-6">
              <ToggleGroup
                type="single"
                size="sm"
                value={vizTab}
                onValueChange={(v) => v && setVizTab(v as 'hue-map' | 'showcase')}
              >
                <ToggleGroupItem value="hue-map">Hue Map</ToggleGroupItem>
                <ToggleGroupItem value="showcase">Showcase</ToggleGroupItem>
              </ToggleGroup>
              {vizTab === 'hue-map' && (
                <div className="flex items-start gap-4 mt-4">
                  <div className="shrink-0">
                    <IttenWheel
                      semanticHues={result.semanticHues}
                      palette={result.palette}
                      secondaryActive={config.secondary?.mode !== 'off'}
                      harmonicAnchors={harmonicAnchors}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <GamutCharts
                      oklchPalette={result.oklchPalette}
                      palette={result.palette}
                      semanticHues={result.semanticHues}
                      gamut={config.gamut}
                      secondaryActive={config.secondary?.mode !== 'off'}
                      equalizeChroma={config.chromaEqualization === 'equal'}
                      equalizeLightness={config.equalizeLightness}
                    />
                  </div>
                </div>
              )}
              {vizTab === 'showcase' && (
                <ComponentShowcase palette={result.palette} alphaPalette={result.alphaPalette} />
              )}
            </div>
            <SettingsSidebar
              result={result}
              onCopy={handleCopy}
              namingConfig={namingConfig}
              onNamingConfigChange={setNamingConfig}
              onGenerateBothThemes={generateBothThemes}
              secondaryActive={config.secondary?.mode !== 'off'}
            />
          </>
        )}
      </main>
      {copiedText && (
        <div className="fixed bottom-6 right-6 bg-foreground text-background px-4 py-2 rounded-lg text-sm font-medium">
          Copied!
        </div>
      )}
    </div>
  );
}
