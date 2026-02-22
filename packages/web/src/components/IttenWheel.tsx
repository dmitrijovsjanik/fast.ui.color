import { useState, useMemo } from 'react';
import { formatHex } from 'culori';
import type { SemanticHues, Palette, SemanticRole } from '@color-tool/core';

interface IttenWheelProps {
  semanticHues: SemanticHues;
  palette: Palette;
  secondaryActive: boolean;
  harmonicAnchors?: number[];
}

const SIZE = 240;
const CENTER = SIZE / 2;
const OUTER_R = SIZE / 2 - 16; // leave room for labels
const INNER_R = OUTER_R - 28;
const MARKER_R = (OUTER_R + INNER_R) / 2; // mid-ring radius
const SEGMENTS = 72;
const SEGMENT_ANGLE = 360 / SEGMENTS;

const ROLE_LABELS: Record<string, string> = {
  brand: 'Brand',
  secondary: '2nd',
  success: 'Success',
  warning: 'Warning',
  danger: 'Danger',
  info: 'Info',
};

// Compute OKLCH hue ring colors at build time (static — hue wheel doesn't change)
function computeRingColors(): string[] {
  const colors: string[] = [];
  for (let i = 0; i < SEGMENTS; i++) {
    const hue = i * SEGMENT_ANGLE;
    const hex = formatHex({ mode: 'oklch', l: 0.65, c: 0.18, h: hue });
    colors.push(hex ?? '#888888');
  }
  return colors;
}

// SVG arc path for a segment of the ring
function arcPath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number,
): string {
  // Convert degrees to radians, offset by -90° so 0° is at top
  const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180;
  const s = toRad(startAngle);
  const e = toRad(endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  const outerStart = { x: cx + outerR * Math.cos(s), y: cy + outerR * Math.sin(s) };
  const outerEnd = { x: cx + outerR * Math.cos(e), y: cy + outerR * Math.sin(e) };
  const innerStart = { x: cx + innerR * Math.cos(e), y: cy + innerR * Math.sin(e) };
  const innerEnd = { x: cx + innerR * Math.cos(s), y: cy + innerR * Math.sin(s) };

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
    'Z',
  ].join(' ');
}

// Position on the circle at a given hue angle
function posOnCircle(hue: number, radius: number) {
  const rad = ((hue - 90) * Math.PI) / 180;
  return { x: CENTER + radius * Math.cos(rad), y: CENTER + radius * Math.sin(rad) };
}

export function IttenWheel({ semanticHues, palette, secondaryActive, harmonicAnchors }: IttenWheelProps) {
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);

  const ringColors = useMemo(computeRingColors, []);

  const visibleRoles: { role: SemanticRole; label: string }[] = useMemo(() => {
    const roles: { role: SemanticRole; label: string }[] = [
      { role: 'brand', label: ROLE_LABELS.brand },
      { role: 'success', label: ROLE_LABELS.success },
      { role: 'warning', label: ROLE_LABELS.warning },
      { role: 'danger', label: ROLE_LABELS.danger },
      { role: 'info', label: ROLE_LABELS.info },
    ];
    if (secondaryActive) {
      roles.splice(1, 0, { role: 'secondary', label: ROLE_LABELS.secondary });
    }
    return roles;
  }, [secondaryActive]);

  const LABEL_R = OUTER_R + 14;

  return (
    <div className="flex justify-center">
      <svg
          width={SIZE + 80}
          height={SIZE + 40}
          viewBox={`-40 -20 ${SIZE + 80} ${SIZE + 40}`}
        >
          {/* OKLCH hue ring */}
          {ringColors.map((color, i) => {
            const start = i * SEGMENT_ANGLE;
            const end = start + SEGMENT_ANGLE + 0.5; // +0.5 overlap to avoid gaps
            return (
              <path
                key={i}
                d={arcPath(CENTER, CENTER, OUTER_R, INNER_R, start, end)}
                fill={color}
              />
            );
          })}

          {/* Harmonic anchor markers (dashed lines) */}
          {harmonicAnchors && harmonicAnchors.map((anchorHue, i) => {
            const inner = posOnCircle(anchorHue, INNER_R - 6);
            const outer = posOnCircle(anchorHue, OUTER_R + 6);
            return (
              <line
                key={`anchor-${i}`}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke="rgba(255,255,255,0.4)"
                strokeWidth={1.5}
                strokeDasharray="3 3"
              />
            );
          })}

          {/* Marker lines (thin radial lines from inner to outer ring edge) */}
          {visibleRoles.map(({ role }) => {
            const hue = semanticHues[role];
            const inner = posOnCircle(hue, INNER_R - 2);
            const outer = posOnCircle(hue, OUTER_R + 2);
            return (
              <line
                key={`line-${role}`}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke="rgba(255,255,255,0.5)"
                strokeWidth={1}
              />
            );
          })}

          {/* Markers */}
          {visibleRoles.map(({ role, label }) => {
            const hue = semanticHues[role];
            const pos = posOnCircle(hue, MARKER_R);
            const isHovered = hoveredRole === role;

            return (
              <g
                key={role}
                onMouseEnter={() => setHoveredRole(role)}
                onMouseLeave={() => setHoveredRole(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isHovered ? 9 : 7}
                  fill={palette[role][9]}
                  stroke="white"
                  strokeWidth={2}
                  style={{ transition: 'r 0.15s ease' }}
                />

                {/* Label outside ring */}
                {(() => {
                  const labelPos = posOnCircle(hue, LABEL_R);
                  // Determine text-anchor based on position
                  const anchor = labelPos.x < CENTER - 10
                    ? 'end'
                    : labelPos.x > CENTER + 10
                      ? 'start'
                      : 'middle';
                  return (
                    <text
                      x={labelPos.x}
                      y={labelPos.y}
                      textAnchor={anchor}
                      dominantBaseline="central"
                      className="text-[10px] fill-muted-foreground select-none"
                      style={{ fontFamily: 'inherit' }}
                    >
                      {label}
                    </text>
                  );
                })()}

                {/* Tooltip on hover */}
                {isHovered && (
                  <g>
                    <rect
                      x={pos.x - 36}
                      y={pos.y - 28}
                      width={72}
                      height={20}
                      rx={4}
                      className="fill-foreground"
                    />
                    <text
                      x={pos.x}
                      y={pos.y - 18}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="text-[10px] fill-background font-mono select-none"
                    >
                      {`${label}: ${Math.round(hue)}°`}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
    </div>
  );
}
