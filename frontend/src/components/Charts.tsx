import { useId, useState } from 'react';

export interface AreaChartProps {
  data: number[];
  secondaryData?: number[];
  labels?: string[];
  height?: number;
  color?: string;
  secondaryColor?: string;
  unit?: string;
  secondaryUnit?: string;
  showGrid?: boolean;
  showPeakMarker?: boolean;
  showCapacityLine?: boolean;
  capacityValue?: number;
  mode?: 'volume' | 'speed' | 'dual';
}

/** Converts array of points to a smooth cubic Catmull-Rom spline SVG path */
function getSmoothSpline(points: { x: number; y: number }[]): string {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x},${points[0].y}`;
  if (points.length === 2) {
    return `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)} L ${points[1].x.toFixed(1)},${points[1].y.toFixed(1)}`;
  }

  let d = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
}

/** Formats numbers compactly (e.g. 2,450 or 2.5k) */
function formatCompact(val: number): string {
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
  if (val >= 10000) return `${(val / 1000).toFixed(0)}k`;
  if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
  return String(Math.round(val));
}

/** High-definition interactive Area / Spline Chart with dual telemetry & HUD */
export function AreaChart({
  data,
  secondaryData,
  labels,
  height = 220,
  color = '#0284c7',
  secondaryColor = '#f59e0b',
  unit = 'veh/hr',
  secondaryUnit = 'km/h',
  showGrid = true,
  showPeakMarker = true,
  showCapacityLine = false,
  capacityValue,
  mode = 'volume',
}: AreaChartProps) {
  const chartId = useId().replace(/:/g, '');
  const [hi, setHi] = useState<number | null>(null);

  const safeData = data && data.length > 0 ? data : [0, 0, 0, 0, 0, 0];
  const count = safeData.length;

  const W = 800;
  const H = 240;
  const PT = 18;
  const PB = 20;
  const PL = 42;
  const PR = 16;
  const innerW = W - PL - PR;
  const innerH = H - PT - PB;

  // Primary Scale
  const primaryMax = Math.max(...safeData, 1);
  const primaryCeil = Math.ceil(primaryMax * 1.12);
  const px = (i: number) => PL + (i * innerW) / Math.max(count - 1, 1);
  const py = (v: number) => PT + innerH - (Math.max(0, v) / primaryCeil) * innerH;

  // Points & Spline
  const primaryPoints = safeData.map((v, i) => ({ x: px(i), y: py(v) }));
  const primarySpline = getSmoothSpline(primaryPoints);
  const primaryArea = `${primarySpline} L ${px(count - 1).toFixed(1)},${H - PB} L ${px(0).toFixed(1)},${H - PB} Z`;

  // Secondary Scale (e.g. Speed)
  const hasSecondary = (mode === 'dual' || mode === 'speed') && secondaryData && secondaryData.length === count;
  const secMax = hasSecondary ? Math.max(...secondaryData!, 1) : 100;
  const secCeil = Math.ceil(secMax * 1.2);
  const pySec = (v: number) => PT + innerH - (Math.max(0, v) / secCeil) * innerH;

  let secondarySpline = '';
  let secondaryArea = '';
  if (hasSecondary) {
    const secPoints = secondaryData!.map((v, i) => ({ x: px(i), y: pySec(v) }));
    secondarySpline = getSmoothSpline(secPoints);
    secondaryArea = `${secondarySpline} L ${px(count - 1).toFixed(1)},${H - PB} L ${px(0).toFixed(1)},${H - PB} Z`;
  }

  // Peak Point
  const maxIdx = safeData.reduce((maxI, v, i, arr) => (v > arr[maxI] ? i : maxI), 0);
  const peakVal = safeData[maxIdx];
  const peakPt = primaryPoints[maxIdx];

  // Capacity Threshold
  const capY = capacityValue ? py(capacityValue) : py(primaryMax * 0.88);

  // Hover Interpolation
  const activeIdx = hi !== null ? Math.max(0, Math.min(count - 1, hi)) : null;
  const hoverX = activeIdx !== null ? px(activeIdx) : 0;
  const hoverY = activeIdx !== null ? (mode === 'speed' && hasSecondary ? pySec(secondaryData![activeIdx]) : py(safeData[activeIdx])) : 0;
  const hoverSecY = activeIdx !== null && hasSecondary ? pySec(secondaryData![activeIdx]) : 0;
  const frac = activeIdx !== null ? activeIdx / Math.max(count - 1, 1) : 0;

  // Grid steps (4 horizontal bands)
  const gridSteps = [
    { frac: 0, val: primaryCeil },
    { frac: 0.33, val: Math.round(primaryCeil * 0.67) },
    { frac: 0.67, val: Math.round(primaryCeil * 0.33) },
    { frac: 1.0, val: 0 },
  ];

  return (
    <div className="relative w-full select-none" style={{ height }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-full w-full cursor-crosshair overflow-visible"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const relX = (e.clientX - r.left) / r.width;
          const i = Math.round(relX * (count - 1));
          setHi(Math.max(0, Math.min(count - 1, i)));
        }}
        onMouseLeave={() => setHi(null)}
      >
        <defs>
          {/* Primary Volume Fill Gradient */}
          <linearGradient id={`grad-primary-${chartId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color === '#C2CFDF' ? '#38bdf8' : color} stopOpacity="0.45" />
            <stop offset="40%" stopColor="#38bdf8" stopOpacity="0.22" />
            <stop offset="85%" stopColor="#6366f1" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.00" />
          </linearGradient>

          {/* Secondary Speed Fill Gradient */}
          <linearGradient id={`grad-sec-${chartId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={secondaryColor} stopOpacity="0.32" />
            <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.00" />
          </linearGradient>

          {/* Glowing Stroke Shader */}
          <filter id={`glow-${chartId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Primary Stroke Gradient */}
          <linearGradient id={`stroke-grad-${chartId}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="45%" stopColor="#38bdf8" />
            <stop offset="75%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
        </defs>

        {/* Subtle Horizontal Gridlines & Y-Axis Reference Markers */}
        {showGrid &&
          gridSteps.map((g, idx) => {
            const gy = PT + g.frac * innerH;
            return (
              <g key={idx} className="transition-opacity duration-300">
                <line
                  x1={PL}
                  x2={W - PR}
                  y1={gy}
                  y2={gy}
                  stroke="rgba(148, 163, 184, 0.2)"
                  strokeWidth="1"
                  strokeDasharray={idx === 3 ? 'none' : '3 4'}
                  vectorEffect="non-scaling-stroke"
                />
                <text
                  x={PL - 6}
                  y={gy + 3.5}
                  textAnchor="end"
                  fill="rgba(148, 163, 184, 0.7)"
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  {formatCompact(g.val)}
                </text>
              </g>
            );
          })}

        {/* Shaded Capacity Benchmark Line */}
        {showCapacityLine && (
          <g>
            <line
              x1={PL}
              x2={W - PR}
              y1={capY}
              y2={capY}
              stroke="rgba(244, 63, 94, 0.4)"
              strokeWidth="1.2"
              strokeDasharray="4 4"
              vectorEffect="non-scaling-stroke"
            />
            <text
              x={W - PR - 4}
              y={capY - 4}
              textAnchor="end"
              fill="rgba(244, 63, 94, 0.75)"
              fontSize="9"
              fontWeight="700"
              letterSpacing="0.05em"
            >
              85% RUSH CAPACITY CEILING
            </text>
          </g>
        )}

        {/* Secondary Series: Average Speed Profile (if dual view) */}
        {hasSecondary && mode === 'dual' && (
          <g className="transition-all duration-300">
            <path d={secondaryArea} fill={`url(#grad-sec-${chartId})`} />
            <path
              d={secondarySpline}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="4 3"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              opacity="0.85"
            />
          </g>
        )}

        {/* Primary Series: Volume Flow Area & Spline */}
        {mode !== 'speed' && (
          <g>
            {/* Ambient Shadow & Fill */}
            <path d={primaryArea} fill={`url(#grad-primary-${chartId})`} />

            {/* Glowing Accent Stroke */}
            <path
              d={primarySpline}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              filter={`url(#glow-${chartId})`}
              opacity="0.45"
            />

            {/* Main Sharp Crisp Stroke */}
            <path
              d={primarySpline}
              fill="none"
              stroke={`url(#stroke-grad-${chartId})`}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        )}

        {/* Speed Only Mode */}
        {mode === 'speed' && hasSecondary && (
          <g>
            <path d={secondaryArea} fill={`url(#grad-sec-${chartId})`} />
            <path
              d={secondarySpline}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        )}

        {/* Pinned Peak Maxima Badge & Marker */}
        {showPeakMarker && count > 3 && peakVal > 0 && mode !== 'speed' && (
          <g className="transition-all duration-300">
            {/* Outer halo */}
            <circle
              cx={peakPt.x}
              cy={peakPt.y}
              r="7"
              fill="#0284c7"
              fillOpacity="0.25"
              className="animate-ping"
              style={{ transformOrigin: `${peakPt.x}px ${peakPt.y}px` }}
            />
            {/* Solid core */}
            <circle cx={peakPt.x} cy={peakPt.y} r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />

            {/* Floating Peak Label */}
            <g transform={`translate(${Math.min(Math.max(peakPt.x, PL + 50), W - PR - 50)}, ${Math.max(peakPt.y - 12, PT + 10)})`}>
              <rect
                x="-36"
                y="-13"
                width="72"
                height="15"
                rx="4"
                fill="rgba(15, 23, 42, 0.85)"
                stroke="rgba(56, 189, 248, 0.6)"
                strokeWidth="0.8"
              />
              <text x="0" y="-3" textAnchor="middle" fill="#38bdf8" fontSize="8.5" fontWeight="700" fontFamily="sans-serif">
                PEAK {formatCompact(peakVal)}
              </text>
            </g>
          </g>
        )}

        {/* Active Hover Crosshair Line & Target Rings */}
        {activeIdx !== null && (
          <g className="pointer-events-none">
            {/* Vertical Guide Laser */}
            <line
              x1={hoverX}
              x2={hoverX}
              y1={PT}
              y2={H - PB}
              stroke="rgba(56, 189, 248, 0.75)"
              strokeWidth="1.2"
              strokeDasharray="2 3"
              vectorEffect="non-scaling-stroke"
            />

            {/* Top Anchor Dot */}
            <circle cx={hoverX} cy={PT} r="2.5" fill="#38bdf8" />
            <circle cx={hoverX} cy={H - PB} r="2.5" fill="#38bdf8" />

            {/* Primary Target Halo & Dot */}
            {mode !== 'speed' && (
              <>
                <circle cx={hoverX} cy={hoverY} r="8" fill="rgba(56, 189, 248, 0.25)" />
                <circle cx={hoverX} cy={hoverY} r="4.5" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
              </>
            )}

            {/* Secondary Target Dot (if Dual) */}
            {hasSecondary && mode === 'dual' && (
              <>
                <circle cx={hoverX} cy={hoverSecY} r="7" fill="rgba(245, 158, 11, 0.25)" />
                <circle cx={hoverX} cy={hoverSecY} r="4" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
              </>
            )}
          </g>
        )}
      </svg>

      {/* Floating HUD Telemetry Card on Hover */}
      {activeIdx !== null && (
        <div
          className="pointer-events-none absolute top-1 z-30 -translate-x-1/2 transition-all duration-75"
          style={{
            left: `${Math.min(Math.max(frac, 0.14), 0.86) * 100}%`,
          }}
        >
          <div className="rounded-xl border border-sky-500/40 bg-slate-900/95 p-2.5 shadow-2xl backdrop-blur-md text-white min-w-[150px]">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-1.5 text-[10px] font-semibold text-slate-400">
              <span className="font-mono text-sky-400">
                {labels && labels[activeIdx] ? labels[activeIdx] : `Point #${activeIdx + 1}`}
              </span>
              <span className="rounded bg-sky-500/20 px-1.5 py-0.2 text-[9px] font-bold text-sky-300 uppercase">
                {safeData[activeIdx] > primaryMax * 0.8 ? 'Peak Rush' : safeData[activeIdx] > primaryMax * 0.4 ? 'Moderate' : 'Free Flow'}
              </span>
            </div>

            <div className="mt-2 flex items-baseline justify-between gap-3">
              <span className="text-[11px] font-medium text-slate-300">Volume</span>
              <div className="text-right">
                <span className="font-display text-[15px] font-bold text-sky-400">
                  {safeData[activeIdx].toLocaleString()}
                </span>
                <span className="ml-1 text-[10px] text-slate-400">{unit}</span>
              </div>
            </div>

            {hasSecondary && secondaryData && (
              <div className="mt-1 flex items-baseline justify-between gap-3 border-t border-slate-800 pt-1">
                <span className="text-[11px] font-medium text-slate-300">Avg Speed</span>
                <div className="text-right">
                  <span className="font-display text-[14px] font-bold text-amber-400">
                    {secondaryData[activeIdx]}
                  </span>
                  <span className="ml-1 text-[10px] text-slate-400">{secondaryUnit}</span>
                </div>
              </div>
            )}

            {/* Mini Flow Load Bar */}
            <div className="mt-2">
              <div className="flex justify-between text-[9px] text-slate-400 mb-0.5">
                <span>Corridor Load</span>
                <span>{Math.round((safeData[activeIdx] / primaryMax) * 100)}%</span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, Math.round((safeData[activeIdx] / primaryMax) * 100))}%`,
                    background:
                      safeData[activeIdx] > primaryMax * 0.8
                        ? 'linear-gradient(90deg, #38bdf8, #f43f5e)'
                        : 'linear-gradient(90deg, #10b981, #38bdf8)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}