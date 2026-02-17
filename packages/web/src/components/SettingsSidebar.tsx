import type { GenerationConfig, GenerationResult, NeutralStyle, BrandMode, ChromaEqualization, LightnessMapping, NamingConfig } from '@color-tool/core';
import { exportCSS, exportHexTable, exportSVG, exportDTCG } from '@color-tool/core';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Copy, Download, Image, Braces } from 'lucide-react';
import { NamingTemplateBuilder } from './NamingTemplateBuilder';

interface SettingsSidebarProps {
  config: GenerationConfig;
  result: GenerationResult;
  onConfigChange: (partial: Partial<GenerationConfig>) => void;
  onCopy: (text: string) => void;
  namingConfig: NamingConfig;
  onNamingConfigChange: (config: NamingConfig) => void;
  onGenerateBothThemes: () => { lightResult: GenerationResult; darkResult: GenerationResult };
}

export function SettingsSidebar({ config, result, onConfigChange, onCopy, namingConfig, onNamingConfigChange, onGenerateBothThemes }: SettingsSidebarProps) {
  const handleExportCSS = () => {
    const css = exportCSS(result.palette, { naming: namingConfig }, result.alphaPalette);
    onCopy(css);
  };

  const handleExportHex = () => {
    const table = exportHexTable(result.palette);
    const blob = new Blob([table], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'palette.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportSVG = () => {
    const { lightResult, darkResult } = onGenerateBothThemes();
    const svg = exportSVG({
      light: { palette: lightResult.palette, alphaPalette: lightResult.alphaPalette },
      dark: { palette: darkResult.palette, alphaPalette: darkResult.alphaPalette },
      naming: namingConfig,
    });
    onCopy(svg);
  };

  const handleExportDTCG = () => {
    const { lightResult, darkResult } = onGenerateBothThemes();
    const dtcg = exportDTCG({
      light: { palette: lightResult.palette, oklchPalette: lightResult.oklchPalette, alphaPalette: lightResult.alphaPalette },
      dark: { palette: darkResult.palette, oklchPalette: darkResult.oklchPalette, alphaPalette: darkResult.alphaPalette },
      naming: namingConfig,
    });
    onCopy(dtcg);
  };

  return (
    <div className="rounded-xl bg-card p-6 mb-6">
      {/* Settings — inline row */}
      <div className="flex flex-wrap items-end gap-6 mb-6">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Neutral Style</Label>
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

        <div className="space-y-2">
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

        <div className="space-y-2">
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

        <div className="space-y-2">
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

        <div className="space-y-2">
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
      </div>

      {/* Naming Template Builder */}
      <div className="mb-6">
        <NamingTemplateBuilder config={namingConfig} onChange={onNamingConfigChange} />
      </div>

      {/* Export */}
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={handleExportCSS}>
          <Copy /> Copy CSS
        </Button>
        <Button variant="secondary" size="sm" onClick={handleExportHex}>
          <Download /> Download HEX
        </Button>
        <Button variant="secondary" size="sm" onClick={handleExportSVG}>
          <Image /> Copy SVG
        </Button>
        <Button variant="secondary" size="sm" onClick={handleExportDTCG}>
          <Braces /> Copy DTCG
        </Button>
      </div>
    </div>
  );
}
