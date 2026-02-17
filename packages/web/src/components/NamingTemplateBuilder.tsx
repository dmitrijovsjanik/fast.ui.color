import { useState, useRef, useCallback } from 'react';
import type { NamingConfig, TemplateVariable, SemanticRole } from '@color-tool/core';
import { TEMPLATE_VARIABLES, SEMANTIC_ROLES, DEFAULT_NAMING_CONFIG, resolveTokenName } from '@color-tool/core';
import { Label } from '@/components/ui/label';
import { GripVertical, X, Plus, RotateCcw } from 'lucide-react';

interface NamingTemplateBuilderProps {
  config: NamingConfig;
  onChange: (config: NamingConfig) => void;
}

// Extract ordered variables from segments
function getVariableOrder(config: NamingConfig): TemplateVariable[] {
  return config.segments
    .filter((s): s is { type: 'variable'; value: TemplateVariable } => s.type === 'variable')
    .map(s => s.value);
}

// Get the separator used between variables (first separator found, or '/')
function getSeparator(config: NamingConfig): string {
  const sep = config.segments.find(s => s.type === 'separator');
  return sep ? sep.value : '/';
}

// Rebuild segments from variable order and separator
function rebuildSegments(order: TemplateVariable[], separator: string): NamingConfig['segments'] {
  const segments: NamingConfig['segments'] = [];
  for (let i = 0; i < order.length; i++) {
    if (i > 0) segments.push({ type: 'separator', value: separator });
    segments.push({ type: 'variable', value: order[i] });
  }
  return segments;
}

export function NamingTemplateBuilder({ config, onChange }: NamingTemplateBuilderProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);
  const dragNodeRef = useRef<HTMLDivElement | null>(null);

  const variableOrder = getVariableOrder(config);
  const separator = getSeparator(config);
  const availableVariables = TEMPLATE_VARIABLES.filter(v => !variableOrder.includes(v));
  const isDefault = JSON.stringify(config.segments) === JSON.stringify(DEFAULT_NAMING_CONFIG.segments);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
    requestAnimationFrame(() => {
      if (dragNodeRef.current) dragNodeRef.current.style.opacity = '0.4';
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setDropTarget(null);
    if (dragNodeRef.current) dragNodeRef.current.style.opacity = '1';
    dragNodeRef.current = null;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragIndex !== null && dragIndex !== index) {
      setDropTarget(index);
    }
  }, [dragIndex]);

  const handleDragLeave = useCallback(() => {
    setDropTarget(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === targetIndex) return;

    const newOrder = [...variableOrder];
    const [moved] = newOrder.splice(dragIndex, 1);
    newOrder.splice(targetIndex, 0, moved);

    onChange({ ...config, segments: rebuildSegments(newOrder, separator) });
    setDragIndex(null);
    setDropTarget(null);
  }, [dragIndex, variableOrder, separator, config, onChange]);

  const removeVariable = useCallback((index: number) => {
    const newOrder = [...variableOrder];
    newOrder.splice(index, 1);
    onChange({ ...config, segments: rebuildSegments(newOrder, separator) });
  }, [variableOrder, separator, config, onChange]);

  const addVariable = useCallback((variable: TemplateVariable) => {
    const newOrder = [...variableOrder, variable];
    onChange({ ...config, segments: rebuildSegments(newOrder, separator) });
  }, [variableOrder, separator, config, onChange]);

  const resetTemplate = useCallback(() => {
    onChange({ ...config, segments: DEFAULT_NAMING_CONFIG.segments });
  }, [config, onChange]);

  const updateSeparator = useCallback((value: string) => {
    onChange({ ...config, segments: rebuildSegments(variableOrder, value) });
  }, [variableOrder, config, onChange]);

  const updateRoleName = (role: SemanticRole, name: string) => {
    onChange({ ...config, roleNames: { ...config.roleNames, [role]: name } });
  };

  const updateThemeName = (theme: 'light' | 'dark', name: string) => {
    onChange({ ...config, themeNames: { ...config.themeNames, [theme]: name } });
  };

  const updateModeName = (mode: 'solid' | 'alpha', name: string) => {
    onChange({ ...config, modeNames: { ...config.modeNames, [mode]: name } });
  };

  const preview = resolveTokenName(config, 'light', 'brand', 'solid', 9);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Token Name Template</Label>
          {!isDefault && (
            <button
              type="button"
              onClick={resetTemplate}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>

        {/* Draggable template builder */}
        <div className="flex items-center gap-1 flex-wrap min-h-9 rounded-md border border-input bg-background px-2 py-1.5">
          {variableOrder.map((variable, i) => (
            <div key={variable} className="flex items-center gap-1">
              {i > 0 && (
                <input
                  type="text"
                  value={separator}
                  onChange={(e) => updateSeparator(e.target.value)}
                  className="w-5 min-w-3 text-center text-xs text-muted-foreground bg-transparent border-none outline-none focus:text-foreground font-mono"
                  style={{ width: `${Math.max(separator.length, 1) * 8 + 4}px` }}
                />
              )}
              <div
                draggable
                onDragStart={(e) => {
                  dragNodeRef.current = e.currentTarget as HTMLDivElement;
                  handleDragStart(e, i);
                }}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, i)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, i)}
                className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium cursor-grab active:cursor-grabbing select-none transition-all ${
                  dropTarget === i
                    ? 'bg-primary/20 text-primary ring-2 ring-primary/30'
                    : dragIndex === i
                      ? 'bg-primary/5 text-primary/50'
                      : 'bg-primary/10 text-primary'
                }`}
              >
                <GripVertical className="h-3 w-3 opacity-40" />
                {variable}
                {variableOrder.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeVariable(i); }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="hover:text-primary/70 -mr-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {availableVariables.length > 0 && (
            <div className="flex items-center gap-1 ml-1">
              {availableVariables.map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => addVariable(v)}
                  className="inline-flex items-center gap-0.5 text-muted-foreground hover:text-foreground rounded px-1.5 py-0.5 text-xs border border-dashed border-muted-foreground/30 hover:border-muted-foreground/60 transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  {v}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Preview */}
        <p className="text-xs text-muted-foreground">
          Preview: <code className="text-xs bg-muted px-1 rounded font-mono">{preview}</code>
        </p>
      </div>

      {/* Variable value renaming */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Variable Values</Label>
        <div className="grid gap-2 text-xs">
          {/* Theme names */}
          <div className="flex items-center gap-2">
            <span className="w-12 text-muted-foreground shrink-0">theme</span>
            <div className="flex items-center gap-1 flex-wrap">
              {(['light', 'dark'] as const).map(theme => (
                <div key={theme} className="flex items-center gap-1">
                  <span className="text-muted-foreground/60">{theme}:</span>
                  <InlineInput
                    value={config.themeNames[theme]}
                    onChange={(v) => updateThemeName(theme, v)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Role names */}
          <div className="flex items-start gap-2">
            <span className="w-12 text-muted-foreground shrink-0 pt-1">role</span>
            <div className="flex items-center gap-1 flex-wrap">
              {SEMANTIC_ROLES.map(role => (
                <div key={role} className="flex items-center gap-1">
                  <span className="text-muted-foreground/60">{role}:</span>
                  <InlineInput
                    value={config.roleNames[role]}
                    onChange={(v) => updateRoleName(role, v)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Mode names */}
          <div className="flex items-center gap-2">
            <span className="w-12 text-muted-foreground shrink-0">mode</span>
            <div className="flex items-center gap-1 flex-wrap">
              {(['solid', 'alpha'] as const).map(mode => (
                <div key={mode} className="flex items-center gap-1">
                  <span className="text-muted-foreground/60">{mode}:</span>
                  <InlineInput
                    value={config.modeNames[mode]}
                    onChange={(v) => updateModeName(mode, v)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InlineInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-6 px-1.5 rounded text-xs font-mono bg-muted border-none outline-none focus:ring-1 focus:ring-ring w-16"
    />
  );
}
