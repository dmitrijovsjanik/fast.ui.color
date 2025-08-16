
import { useTheme } from '../themes/themeProvider';
import { getColor, lightColors, darkColors } from '../colors/palette';
import { SunIcon, MoonIcon } from '@radix-ui/react-icons';

export type ViewMode = 'figma' | 'exact' | 'standard' | 'demo' | 'comparison';

interface NavigationProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="navigation">
      <div className="nav-content">
        <div className="nav-brand">
          <h1>Fast UI</h1>
        </div>
        
        <div className="nav-links">
          <button
            className={`nav-link ${currentView === 'figma' ? 'active' : ''}`}
            onClick={() => onViewChange('figma')}
          >
            🎨 Figma Interface
          </button>
          <button
            className={`nav-link ${currentView === 'exact' ? 'active' : ''}`}
            onClick={() => onViewChange('exact')}
          >
            ✨ Exact Figma
          </button>
          <button
            className={`nav-link ${currentView === 'standard' ? 'active' : ''}`}
            onClick={() => onViewChange('standard')}
          >
            📄 PDF Design
          </button>
          <button
            className={`nav-link ${currentView === 'demo' ? 'active' : ''}`}
            onClick={() => onViewChange('demo')}
          >
            📊 Palette Demo
          </button>
          <button
            className={`nav-link ${currentView === 'comparison' ? 'active' : ''}`}
            onClick={() => onViewChange('comparison')}
          >
            ⚖️ Comparison
          </button>
        </div>

        <div className="nav-actions">
          <button 
            onClick={toggleTheme} 
            className="theme-toggle"
            title={`Switch to ${theme.isDark ? 'light' : 'dark'} theme`}
          >
            {theme.isDark ? <SunIcon width={16} height={16} /> : <MoonIcon width={16} height={16} />}
          </button>
        </div>
      </div>

      <style>{`
        .navigation {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: ${getColor(theme.isDark ? darkColors : lightColors, 'gray', 1)};
          border-bottom: 1px solid ${getColor(theme.isDark ? darkColors : lightColors, 'gray', 6)};
          backdrop-filter: blur(10px);
        }

        .nav-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1400px;
          margin: 0 auto;
          padding: 1rem 2rem;
        }

        .nav-brand h1 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
          color: ${getColor(theme.isDark ? darkColors : lightColors, 'gray', 12)};
        }

        .nav-links {
          display: flex;
          gap: 0.5rem;
        }

        .nav-link {
          padding: 0.5rem 1rem;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
          color: ${getColor(theme.isDark ? darkColors : lightColors, 'gray', 11)};
          font-size: 0.875rem;
          font-weight: 500;
        }

        .nav-link:hover {
          background: ${getColor(theme.isDark ? darkColors : lightColors, 'gray', 3)};
          color: ${getColor(theme.isDark ? darkColors : lightColors, 'gray', 12)};
        }

        .nav-link.active {
          background: ${getColor(theme.isDark ? darkColors : lightColors, 'blue', 3)};
          border-color: ${getColor(theme.isDark ? darkColors : lightColors, 'blue', 6)};
          color: ${getColor(theme.isDark ? darkColors : lightColors, 'blue', 11)};
        }

        .nav-actions {
          display: flex;
          gap: 0.5rem;
        }

        .theme-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: ${getColor(theme.isDark ? darkColors : lightColors, 'gray', 3)};
          color: ${getColor(theme.isDark ? darkColors : lightColors, 'gray', 11)};
          border: 1px solid ${getColor(theme.isDark ? darkColors : lightColors, 'gray', 6)};
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .theme-toggle:hover {
          background: ${getColor(theme.isDark ? darkColors : lightColors, 'gray', 4)};
          border-color: ${getColor(theme.isDark ? darkColors : lightColors, 'gray', 7)};
          color: ${getColor(theme.isDark ? darkColors : lightColors, 'gray', 12)};
        }

        @media (max-width: 768px) {
          .nav-content {
            flex-direction: column;
            gap: 1rem;
            padding: 1rem;
          }

          .nav-links {
            flex-wrap: wrap;
            justify-content: center;
          }

          .nav-link {
            font-size: 0.75rem;
            padding: 0.375rem 0.75rem;
          }
        }
      `}</style>
    </nav>
  );
}
