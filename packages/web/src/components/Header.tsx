export function Header() {
  return (
    <header className="border-b bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
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
      </div>
    </header>
  );
}
