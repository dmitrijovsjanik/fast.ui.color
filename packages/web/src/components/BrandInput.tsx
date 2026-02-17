import { ColorInput } from './ColorInput';

interface BrandInputProps {
  color: string;
  onChange: (color: string) => void;
  backgroundColor?: string;
  defaultBackgroundColor?: string;
  onBackgroundChange?: (color: string) => void;
}

export function BrandInput({ color, onChange, backgroundColor, defaultBackgroundColor, onBackgroundChange }: BrandInputProps) {
  return (
    <div className="rounded-xl bg-card p-6 mb-6">
      <div className="flex items-end gap-6">
        <ColorInput label="Brand Color" color={color} onChange={onChange} />
        {backgroundColor !== undefined && onBackgroundChange && (
          <ColorInput
            label="Background"
            color={backgroundColor}
            onChange={onBackgroundChange}
            defaultColor={defaultBackgroundColor}
          />
        )}
      </div>
    </div>
  );
}
