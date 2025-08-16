interface AddColorRowProps {
  onAddClick?: () => void;
}

export function AddColorRow({ onAddClick }: AddColorRowProps) {
  return (
    <div className="color-row add-row">
      <div className="add-color-button" onClick={onAddClick}>
        <div className="plus-icon">+</div>
      </div>
      <div className="color-palette placeholders">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="color-shade placeholder" />
        ))}
      </div>
    </div>
  );
}
