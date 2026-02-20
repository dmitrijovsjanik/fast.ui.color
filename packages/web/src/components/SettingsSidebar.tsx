import type { GenerationResult, NamingConfig, SemanticRole } from '@color-tool/core';
import { exportCSS, exportHexTable, exportSVG, exportDTCG } from '@color-tool/core';
import { Button } from '@/components/ui/button';
import { Copy, Download, Image, Braces } from 'lucide-react';
import { NamingTemplateBuilder } from './NamingTemplateBuilder';

interface SettingsSidebarProps {
  result: GenerationResult;
  onCopy: (text: string) => void;
  namingConfig: NamingConfig;
  onNamingConfigChange: (config: NamingConfig) => void;
  onGenerateBothThemes: () => { lightResult: GenerationResult; darkResult: GenerationResult };
  secondaryActive: boolean;
}

export function SettingsSidebar({ result, onCopy, namingConfig, onNamingConfigChange, onGenerateBothThemes, secondaryActive }: SettingsSidebarProps) {
  const excludeRoles: SemanticRole[] | undefined = secondaryActive ? undefined : ['secondary'];

  const handleExportCSS = () => {
    const css = exportCSS(result.palette, { naming: namingConfig, excludeRoles }, result.alphaPalette);
    onCopy(css);
  };

  const handleExportHex = () => {
    const table = exportHexTable(result.palette, excludeRoles);
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
      excludeRoles,
    });
    onCopy(svg);
  };

  const handleExportDTCG = () => {
    const { lightResult, darkResult } = onGenerateBothThemes();
    const dtcg = exportDTCG({
      light: { palette: lightResult.palette, oklchPalette: lightResult.oklchPalette, alphaPalette: lightResult.alphaPalette },
      dark: { palette: darkResult.palette, oklchPalette: darkResult.oklchPalette, alphaPalette: darkResult.alphaPalette },
      naming: namingConfig,
      excludeRoles,
    });
    onCopy(dtcg);
  };

  return (
    <div className="rounded-xl bg-card p-6 mb-6">
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
