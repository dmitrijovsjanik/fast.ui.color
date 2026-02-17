import type { ThemeMode } from '@color-tool/core';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

interface HeaderProps {
  theme: ThemeMode;
  onThemeToggle: () => void;
}

export function Header({ theme, onThemeToggle }: HeaderProps) {
  return (
    <header className="border-b bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="6" cy="6" r="4" fill="white" opacity="0.9" />
              <circle cx="12" cy="6" r="4" fill="white" opacity="0.7" />
              <circle cx="9" cy="12" r="4" fill="white" opacity="0.8" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold">Fast UI</h1>
          <span className="text-xs font-medium text-muted-foreground">/</span>
          <span className="text-sm text-muted-foreground">Color</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onThemeToggle}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  );
}
