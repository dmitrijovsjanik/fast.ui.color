import { useState, useEffect, useCallback } from 'react';
import { generatePalette, checkAPCAContrast, DEFAULT_NAMING_CONFIG, type GenerationConfig, type GenerationResult, type NamingConfig } from '@color-tool/core';
import { Header } from './components/Header';
import { BrandInput } from './components/BrandInput';
import { PaletteMatrix } from './components/PaletteMatrix';
import { SettingsSidebar } from './components/SettingsSidebar';

const LIGHT_BG = '#ffffff';
const DARK_BG = '#111113';

const DEFAULT_CONFIG: GenerationConfig = {
  brandColor: '#2563EB',
  brandMode: 'auto',
  chromaEqualization: 'independent',
  theme: 'light',
  neutralStyle: 'tinted',
  gamut: 'sRGB',
  backgroundColor: LIGHT_BG,
  lightnessMapping: 'fixed',
};

export function App() {
  const [config, setConfig] = useState<GenerationConfig>(DEFAULT_CONFIG);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [namingConfig, setNamingConfig] = useState<NamingConfig>(DEFAULT_NAMING_CONFIG);

  // Sync dark class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', config.theme === 'dark');
  }, [config.theme]);

  // Generate palette whenever config changes
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const r = generatePalette(config);
        setResult(r);
      } catch (e) {
        console.error('Palette generation failed:', e);
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [config]);

  // Sync generated palette → shadcn CSS custom properties
  useEffect(() => {
    if (!result) return;
    const s = document.documentElement.style;
    const n = result.palette.neutral;
    const b = result.palette.brand;

    // Map palette steps to shadcn tokens
    s.setProperty('--background', n[2]);
    s.setProperty('--foreground', n[12]);
    s.setProperty('--card', config.backgroundColor || (config.theme === 'dark' ? n[3] : '#ffffff'));
    s.setProperty('--card-foreground', n[12]);
    s.setProperty('--popover', n[1]);
    s.setProperty('--popover-foreground', n[12]);
    s.setProperty('--primary', b[9]);
    // APCA contrast check: prefer white, fall back to black
    const APCA_MIN_LC = 45;
    const whiteLc = Math.abs(checkAPCAContrast('#ffffff', b[9]));
    const primaryFg = whiteLc >= APCA_MIN_LC ? '#ffffff' : '#000000';
    s.setProperty('--primary-foreground', primaryFg);
    s.setProperty('--secondary', n[3]);
    s.setProperty('--secondary-foreground', n[12]);
    s.setProperty('--muted', n[3]);
    s.setProperty('--muted-foreground', n[11]);
    s.setProperty('--accent', n[3]);
    s.setProperty('--accent-foreground', n[12]);
    s.setProperty('--border', n[6]);
    s.setProperty('--input', n[6]);
    s.setProperty('--ring', b[9]);
  }, [result]);

  const handleBrandColorChange = useCallback((color: string) => {
    setConfig(prev => ({ ...prev, brandColor: color }));
  }, []);

  const handleBackgroundChange = useCallback((color: string) => {
    setConfig(prev => ({ ...prev, backgroundColor: color }));
  }, []);

  const handleThemeToggle = useCallback(() => {
    setConfig(prev => {
      const newTheme = prev.theme === 'light' ? 'dark' : 'light';
      return {
        ...prev,
        theme: newTheme,
        backgroundColor: newTheme === 'dark' ? DARK_BG : LIGHT_BG,
      };
    });
  }, []);

  const handleConfigChange = useCallback((partial: Partial<GenerationConfig>) => {
    setConfig(prev => ({ ...prev, ...partial }));
  }, []);

  const generateBothThemes = useCallback(() => {
    const lightResult = generatePalette({ ...config, theme: 'light', backgroundColor: LIGHT_BG });
    const darkResult = generatePalette({ ...config, theme: 'dark', backgroundColor: DARK_BG });
    return { lightResult, darkResult };
  }, [config]);

  const handleCopy = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header theme={config.theme} onThemeToggle={handleThemeToggle} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <BrandInput
          color={config.brandColor}
          onChange={handleBrandColorChange}
          backgroundColor={config.backgroundColor}
          defaultBackgroundColor={config.theme === 'dark' ? DARK_BG : LIGHT_BG}
          onBackgroundChange={handleBackgroundChange}
        />
        {result && (
          <>
            <PaletteMatrix
              palette={result.palette}
              oklchPalette={result.oklchPalette}
              alphaPalette={result.alphaPalette}
              onCopy={handleCopy}
            />
            <SettingsSidebar
              config={config}
              result={result}
              onConfigChange={handleConfigChange}
              onCopy={handleCopy}
              namingConfig={namingConfig}
              onNamingConfigChange={setNamingConfig}
              onGenerateBothThemes={generateBothThemes}
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
