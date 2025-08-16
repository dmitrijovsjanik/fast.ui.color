interface FooterProps {
  onCopySVG?: () => void;
  onCreate?: () => void;
}

export function Footer({ onCopySVG, onCreate }: FooterProps) {
  return (
    <div className="footer">
      <div className="footer-left">
        <div className="powered-by">Powered by</div>
        <div className="radix-logo">Radix</div>
        <div className="and">and</div>
        <div className="evil-martians">Evil Martians</div>
      </div>
      <div className="footer-right">
        <button className="copy-svg-btn" onClick={onCopySVG}>
          Copy SVG
        </button>
        <button className="create-btn" onClick={onCreate}>
          Create
        </button>
      </div>
    </div>
  );
}
