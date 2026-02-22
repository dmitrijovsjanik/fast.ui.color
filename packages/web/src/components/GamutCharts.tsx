import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { OklchPalette, Palette, SemanticHues, SemanticRole, StepIndex } from '@color-tool/core';
import { maxChromaForLH, oklchToRGB } from '@color-tool/core';

interface GamutChartsProps {
  oklchPalette: OklchPalette;
  palette: Palette;
  semanticHues: SemanticHues;
  gamut: 'sRGB' | 'P3';
  secondaryActive: boolean;
  equalizeChroma?: boolean;
  equalizeLightness?: boolean;
}

const MAX_CHROMA = 0.37;
const HL_THRESHOLD = 0.04;

// For HC chart: find max chroma across ALL lightness values for a given hue.
function maxChromaEnvelope(hue: number, gamut: 'sRGB' | 'P3'): number {
  let best = 0;
  for (let li = 5; li <= 95; li++) {
    const c = maxChromaForLH(li / 100, hue, gamut);
    if (c > best) best = c;
  }
  return best;
}

const ROLE_LABELS: Record<string, string> = {
  brand: 'Brand',
  secondary: '2nd',
  success: 'Success',
  warning: 'Warning',
  danger: 'Danger',
  info: 'Info',
};

interface ChartDot {
  role: SemanticRole;
  step: StepIndex;
  l: number;
  c: number;
  h: number;
  color: string;
}

// --- ImageData cache: gamut fills are pure math, cache by type+gamut+size ---
const imageDataCache = new Map<string, ImageData>();

function getCachedImageData(type: 'hc' | 'hl', gamut: 'sRGB' | 'P3', w: number, h: number): ImageData {
  const key = `${type}-${gamut}-${w}-${h}`;
  const cached = imageDataCache.get(key);
  if (cached) return cached;

  const imgData = new ImageData(w, h);
  const data = imgData.data;

  if (type === 'hc') {
    renderHCData(data, w, h, gamut);
  } else {
    renderHLData(data, w, h, gamut);
  }

  imageDataCache.set(key, imgData);
  return imgData;
}

// HC chart: render pixel data at smoothed optimal L for each hue.
function renderHCData(data: Uint8ClampedArray, w: number, h: number, gamut: 'sRGB' | 'P3') {
  // Step 1: Precompute raw optimal L for 360 hue samples
  const rawOptL = new Float32Array(360);
  for (let deg = 0; deg < 360; deg++) {
    let bestL = 0.5, bestC = 0;
    for (let li = 5; li <= 95; li++) {
      const mc = maxChromaForLH(li / 100, deg, gamut);
      if (mc > bestC) { bestC = mc; bestL = li / 100; }
    }
    rawOptL[deg] = bestL;
  }

  // Step 2: Smooth with circular moving average (±15° window)
  const HALF_WIN = 15;
  const smoothOptL = new Float32Array(360);
  for (let deg = 0; deg < 360; deg++) {
    let sum = 0, count = 0;
    for (let d = deg - HALF_WIN; d <= deg + HALF_WIN; d++) {
      sum += rawOptL[((d % 360) + 360) % 360];
      count++;
    }
    smoothOptL[deg] = sum / count;
  }

  // Precompute envelope per column
  const envC = new Float32Array(w);
  for (let px = 0; px < w; px++) {
    envC[px] = maxChromaEnvelope((px / w) * 360, gamut);
  }

  // Step 3: Render
  for (let px = 0; px < w; px++) {
    const hue = (px / w) * 360;
    const deg = Math.round(hue) % 360;
    const optL = smoothOptL[deg];
    const env = envC[px];

    for (let py = 0; py < h; py++) {
      const chroma = (1 - py / h) * MAX_CHROMA;
      const idx = (py * w + px) * 4;

      if (chroma > env) {
        data[idx + 3] = 0;
      } else {
        const [r, g, b] = oklchToRGB(optL, chroma, hue, gamut);
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }
  }
}

function renderHLData(data: Uint8ClampedArray, w: number, h: number, gamut: 'sRGB' | 'P3') {
  for (let px = 0; px < w; px++) {
    const hue = (px / w) * 360;

    for (let py = 0; py < h; py++) {
      const l = 1 - py / h;
      const maxC = maxChromaForLH(l, hue, gamut);
      const idx = (py * w + px) * 4;

      if (maxC < HL_THRESHOLD) {
        data[idx + 3] = 0;
      } else {
        const [r, g, b] = oklchToRGB(l, maxC, hue, gamut);
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }
  }
}

const HUE_TICKS = [0, 60, 120, 180, 240, 300, 360];
const CHROMA_TICKS = [0.1, 0.2, 0.3];
const LIGHTNESS_TICKS = [0.25, 0.5, 0.75];

// --- Tooltip ---
function Tooltip({ dot, x, y, plotW }: { dot: ChartDot; x: number; y: number; plotW: number }) {
  const label = ROLE_LABELS[dot.role] || dot.role;
  const text = `${label}: L=${dot.l.toFixed(2)} C=${dot.c.toFixed(3)} H=${dot.h.toFixed(0)}°`;
  const charW = 5.6;
  const rectW = text.length * charW + 14;
  const above = y > 28;
  const ty = above ? y - 22 : y + 18;
  const rx = Math.max(0, Math.min(plotW - rectW, x - rectW / 2));

  return (
    <g style={{ pointerEvents: 'none' }}>
      <rect x={rx} y={ty - 10} width={rectW} height={18} rx={4}
        className="fill-foreground" />
      <text x={rx + rectW / 2} y={ty - 1} textAnchor="middle" dominantBaseline="central"
        className="text-[9px] fill-background font-mono select-none">{text}</text>
    </g>
  );
}

// --- Single chart: canvas + SVG overlay ---
function GamutChart({
  type,
  gamut,
  dots,
  hoveredDot,
  onHover,
  equalizeLine,
}: {
  type: 'hc' | 'hl';
  gamut: 'sRGB' | 'P3';
  dots: ChartDot[];
  hoveredDot: ChartDot | null;
  onHover: (dot: ChartDot | null) => void;
  equalizeLine?: number; // Y-axis value to draw a dashed horizontal line at
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [plotSize, setPlotSize] = useState({ w: 0, h: 0 });

  // Observe container size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect;
      if (width > 0) {
        // Both charts + gap ≈ IttenWheel height (~280px)
        const h = Math.min(136, Math.round(width * 0.17));
        setPlotSize({ w: Math.round(width), h });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Render canvas at native DPR with cached ImageData
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || plotSize.w === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const pw = Math.round(plotSize.w * dpr);
    const ph = Math.round(plotSize.h * dpr);

    canvas.width = pw;
    canvas.height = ph;
    canvas.style.width = `${plotSize.w}px`;
    canvas.style.height = `${plotSize.h}px`;

    const ctxOptions: CanvasRenderingContext2DSettings = gamut === 'P3'
      ? { colorSpace: 'display-p3' }
      : {};
    const ctx = canvas.getContext('2d', ctxOptions);
    if (!ctx) return;

    const imgData = getCachedImageData(type, gamut, pw, ph);
    ctx.putImageData(imgData, 0, 0);
  }, [type, plotSize, gamut]);

  const dotXY = useCallback((dot: ChartDot) => {
    const x = (dot.h / 360) * plotSize.w;
    const y = type === 'hc'
      ? (1 - dot.c / MAX_CHROMA) * plotSize.h
      : (1 - dot.l) * plotSize.h;
    return { x, y };
  }, [type, plotSize]);

  const yTicks = type === 'hc' ? CHROMA_TICKS : LIGHTNESS_TICKS;

  return (
    <div ref={containerRef} className="w-full" style={{ minHeight: 40 }}>
      {plotSize.w > 0 && (
        <div className="relative rounded overflow-hidden" style={{ height: plotSize.h }}>
          {/* Canvas background */}
          <canvas ref={canvasRef} className="absolute inset-0 rounded" />

          {/* SVG overlay */}
          <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${plotSize.w} ${plotSize.h}`}
            preserveAspectRatio="none" style={{ overflow: 'visible' }}>

            {/* Grid */}
            {HUE_TICKS.slice(1, -1).map(h => (
              <line key={`v-${h}`}
                x1={(h / 360) * plotSize.w} y1={0}
                x2={(h / 360) * plotSize.w} y2={plotSize.h}
                className="stroke-foreground" strokeWidth={0.5} opacity={0.08}
                vectorEffect="non-scaling-stroke" />
            ))}
            {yTicks.map(v => {
              const y = type === 'hc'
                ? (1 - v / MAX_CHROMA) * plotSize.h
                : (1 - v) * plotSize.h;
              return (
                <line key={`h-${v}`}
                  x1={0} y1={y} x2={plotSize.w} y2={y}
                  className="stroke-foreground" strokeWidth={0.5} opacity={0.08}
                  vectorEffect="non-scaling-stroke" />
              );
            })}

            {/* Equalize line — dashed horizontal */}
            {equalizeLine !== undefined && (() => {
              const y = type === 'hc'
                ? (1 - equalizeLine / MAX_CHROMA) * plotSize.h
                : (1 - equalizeLine) * plotSize.h;
              return (
                <line
                  x1={0} y1={y} x2={plotSize.w} y2={y}
                  stroke="white" strokeWidth={1} opacity={0.5}
                  strokeDasharray="6 3"
                  vectorEffect="non-scaling-stroke"
                />
              );
            })()}

            {/* Drop lines + dots */}
            {dots.map(dot => {
              const { x, y } = dotXY(dot);
              const isHovered = hoveredDot?.role === dot.role;
              return (
                <g key={dot.role}
                  onMouseEnter={() => onHover(dot)}
                  onMouseLeave={() => onHover(null)}
                  className="cursor-pointer"
                >
                  <line x1={x} y1={y} x2={x} y2={plotSize.h}
                    stroke="white" strokeWidth={1} opacity={0.6}
                    vectorEffect="non-scaling-stroke" />
                  <circle cx={x} cy={y}
                    r={isHovered ? 9 : 7}
                    fill={dot.color}
                    stroke="white"
                    strokeWidth={2}
                    style={{ transition: 'r 0.15s ease' }}
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              );
            })}

            {/* Tooltip */}
            {hoveredDot && (() => {
              const { x, y } = dotXY(hoveredDot);
              return <Tooltip dot={hoveredDot} x={x} y={y} plotW={plotSize.w} />;
            })()}
          </svg>
        </div>
      )}
    </div>
  );
}

// --- Main ---
export function GamutCharts({
  oklchPalette,
  palette,
  gamut,
  secondaryActive,
  equalizeChroma,
  equalizeLightness,
}: GamutChartsProps) {
  const [hoveredHC, setHoveredHC] = useState<ChartDot | null>(null);
  const [hoveredHL, setHoveredHL] = useState<ChartDot | null>(null);

  const visibleRoles = useMemo(() => {
    const roles: SemanticRole[] = ['brand', 'success', 'warning', 'danger', 'info'];
    if (secondaryActive) roles.splice(1, 0, 'secondary');
    return roles;
  }, [secondaryActive]);

  const step9Dots = useMemo(() => {
    return visibleRoles.map(role => {
      const oklch = oklchPalette[role][9];
      return {
        role,
        step: 9 as StepIndex,
        l: oklch.l,
        c: oklch.c,
        h: oklch.h,
        color: palette[role][9],
      };
    });
  }, [oklchPalette, palette, visibleRoles]);

  // Equalize lines: read actual values from the palette (post-equalization)
  // Chroma equalization uses min of semantic roles — read from any equalized role (e.g., success)
  const hcLine = equalizeChroma ? oklchPalette.success[9].c : undefined;
  // Lightness equalization forces all to brand's step 9 L
  const hlLine = equalizeLightness ? oklchPalette.brand[9].l : undefined;

  return (
    <div className="space-y-2">
      <GamutChart type="hc" gamut={gamut} dots={step9Dots}
        hoveredDot={hoveredHC} onHover={setHoveredHC}
        equalizeLine={hcLine} />
      <GamutChart type="hl" gamut={gamut} dots={step9Dots}
        hoveredDot={hoveredHL} onHover={setHoveredHL}
        equalizeLine={hlLine} />
    </div>
  );
}
