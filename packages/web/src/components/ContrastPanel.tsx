import type { AccessibilityReport, ContrastResult } from '@color-tool/core';

interface ContrastPanelProps {
  accessibility: AccessibilityReport;
}

function PassBadge({ pass }: { pass: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
        pass ? 'bg-pass/10 text-pass' : 'bg-fail/10 text-fail'
      }`}
    >
      {pass ? (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M3.5 3.5L8.5 8.5M8.5 3.5L3.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )}
    </span>
  );
}

function ContrastRow({ result }: { result: ContrastResult }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-subtle text-xs">
      <div className="flex items-center gap-2">
        <span className="font-medium text-text-secondary capitalize">{result.role}</span>
        <span className="text-text-tertiary">
          {result.fgStep} on {result.bgStep}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-text-secondary">Lc {Math.abs(result.apca).toFixed(0)}</span>
        <PassBadge pass={result.passAPCA} />
      </div>
    </div>
  );
}

export function ContrastPanel({ accessibility }: ContrastPanelProps) {
  const textPairs = accessibility.results.filter(r => r.fgStep === 11 || r.fgStep === 12);
  const borderPairs = accessibility.results.filter(r => r.fgStep >= 6 && r.fgStep <= 8);

  return (
    <div className="bg-surface rounded-xl border border-border p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-text">Accessibility</h2>
        <div className="flex items-center gap-2">
          <PassBadge pass={accessibility.textPairsPass} />
          <span className="text-xs text-text-secondary">
            {accessibility.textPairsPass ? 'All text pairs pass' : 'Some text pairs fail'}
          </span>
        </div>
      </div>

      {/* Text Contrast */}
      <div className="mb-4">
        <h3 className="text-xs font-medium text-text-secondary mb-2">Text Readability</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {textPairs.map((r, i) => (
            <ContrastRow key={`text-${i}`} result={r} />
          ))}
        </div>
      </div>

      {/* Border Visibility */}
      <div>
        <h3 className="text-xs font-medium text-text-secondary mb-2">Border Visibility</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {borderPairs.map((r, i) => (
            <ContrastRow key={`border-${i}`} result={r} />
          ))}
        </div>
      </div>
    </div>
  );
}
