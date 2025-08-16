import { PlusIcon } from '@heroicons/react/24/outline';

interface AddColorRowProps {
  onAddClick?: () => void;
  placeholderCount?: number;
}

export function AddColorRow({ onAddClick, placeholderCount = 12 }: AddColorRowProps) {
  return (
    <div className="color-row add-row">
      <div className="add-color-button" onClick={onAddClick}>
        <PlusIcon width={20} height={20} />
      </div>
      <div className="color-palette placeholders">
        {Array.from({ length: placeholderCount }, (_, i) => (
          <div key={i} className="color-shade placeholder" />
        ))}
      </div>
    </div>
  );
}
