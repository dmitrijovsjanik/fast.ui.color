import { useState, useEffect, useRef, useCallback } from 'react';
import { HexColorPicker } from 'react-colorful';
import { parse, formatHex, converter } from 'culori';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Pipette, RotateCcw } from 'lucide-react';

const toHex = converter('rgb');

const supportsEyeDropper = typeof window !== 'undefined' && 'EyeDropper' in window;

interface ColorInputProps {
  label: string;
  color: string; // hex
  onChange: (hex: string) => void;
  defaultColor?: string;
}

function parseAnyColor(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Try parsing as-is (handles hex, rgb(), hsl(), oklch(), named colors, etc.)
  const parsed = parse(trimmed);
  if (parsed) {
    const hex = formatHex(toHex(parsed));
    return hex ?? null;
  }

  // Try adding # for bare hex
  if (/^[0-9a-fA-F]{3,8}$/.test(trimmed)) {
    const withHash = parse(`#${trimmed}`);
    if (withHash) {
      return formatHex(toHex(withHash)) ?? null;
    }
  }

  return null;
}

export function ColorInput({ label, color, onChange, defaultColor }: ColorInputProps) {
  const showReset = defaultColor !== undefined && color !== defaultColor;
  const [inputValue, setInputValue] = useState(color);
  const [isValid, setIsValid] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setInputValue(color);
    setIsValid(true);
  }, [color]);

  const handleTextChange = useCallback((value: string) => {
    setInputValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const hex = parseAnyColor(value);
      if (hex) {
        setIsValid(true);
        onChange(hex);
      } else {
        setIsValid(false);
      }
    }, 200);
  }, [onChange]);

  const handlePickerChange = useCallback((hex: string) => {
    setInputValue(hex);
    setIsValid(true);
    onChange(hex);
  }, [onChange]);

  const handleEyeDropper = useCallback(async () => {
    if (!supportsEyeDropper) return;
    try {
      // @ts-expect-error EyeDropper API not yet in all TS libs
      const dropper = new EyeDropper();
      const result = await dropper.open();
      const hex = parseAnyColor(result.sRGBHex);
      if (hex) {
        setInputValue(hex);
        setIsValid(true);
        onChange(hex);
      }
    } catch {
      // User cancelled — do nothing
    }
  }, [onChange]);

  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="w-9 h-9 rounded-md border border-input shrink-0 cursor-pointer transition-shadow hover:ring-2 hover:ring-ring/30"
              style={{ backgroundColor: color }}
              aria-label={`Pick ${label} color`}
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <HexColorPicker color={color} onChange={handlePickerChange} />
          </PopoverContent>
        </Popover>
        <div className="relative w-[140px]">
          <Input
            value={inputValue}
            onChange={e => handleTextChange(e.target.value)}
            placeholder="#000000 / rgb() / oklch()"
            className={`font-mono text-xs ${showReset && supportsEyeDropper ? 'pr-14' : showReset || supportsEyeDropper ? 'pr-8' : ''} ${
              !isValid ? 'border-destructive focus-visible:ring-destructive' : ''
            }`}
          />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
            {showReset && (
              <button
                type="button"
                onClick={() => onChange(defaultColor!)}
                className="h-7 w-7 flex items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors"
                title="Reset to default"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            )}
            {supportsEyeDropper && (
              <button
                type="button"
                onClick={handleEyeDropper}
                className="h-7 w-7 flex items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors"
                title="Pick color from screen"
              >
                <Pipette className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
