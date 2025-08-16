interface NavigationProps {
  activeMainNav?: string;
  activeSecondaryNav?: string;
}

export function Navigation({ 
  activeMainNav = 'Color', 
  activeSecondaryNav = 'UI Palette' 
}: NavigationProps) {
  const mainNavItems = ['Color', 'Typography', 'Misc', 'Tokens', 'Guide', 'Export'];
  const secondaryNavItems = ['UI Palette', 'Graphic Palette'];

  return (
    <div className="body-header">
      <div className="main-nav">
        {mainNavItems.map(item => (
          <div 
            key={item}
            className={`nav-item ${item === activeMainNav ? 'active' : 'disabled'}`}
          >
            {item}
          </div>
        ))}
      </div>
      <div className="secondary-nav">
        {secondaryNavItems.map(item => (
          <div 
            key={item}
            className={`nav-item ${item === activeSecondaryNav ? 'active' : 'disabled'}`}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
