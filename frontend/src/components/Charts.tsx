import { useState } from 'react';

/** Dependency-free area/line chart with hover readout (SVG + HTML overlay). */
export function AreaChart({
  data,
  height = 200,
  color = '#E8D2C4',
}: {
  data: number[];
  height?: number;
  color?: string;
}) {
  const [hi, setHi] = useState<number | null>(null);
  const W = 600;
  const H = 200;
  const P = 8;
  const max = Math.max(...data, 1) * 1.1;
  const px = (i: number) => (i * (W - P * 2)) / (data.length - 1) + P;
  const py = (v: number) => H - P - (v / max) * (H - P * 2);
  const line = data.map((v, i) => `${i === 0 ? 'M' : 'L'}${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(' ');
  const area = `${line} L${px(data.length - 1).toFixed(1)},${H - P} L${px(0).toFixed(1)},${H - P} Z`;
  const frac = hi === null ? 0 : hi / (data.length - 1);

  return (
    <div className="relative" style={{ height }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-full w-full cursor-crosshair"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const i = Math.round(((e.clientX - r.left) / r.width) * (data.length - 1));
          setHi(Math.max(0, Math.min(data.length - 1, i)));
        }}
        onMouseLeave={() => setHi(null)}
      >
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.26" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.3, 0.6, 0.9].map((g) => (
          <line key={g} x1={0} x2={W} y1={H * g} y2={H * g} stroke="rgba(199,169,163,.26)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}
        <path d={area} fill="url(#areaFill)" />
        <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
      {hi !== null && (
        <>
          <div className="pointer-events-none absolute bottom-0 top-0 w-px border-l border-dashed border-clay/50" style={{ left: `${frac * 100}%` }} />
          <div
            className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] border-ink bg-sand shadow"
            style={{ left: `${frac * 100}%`, top: `${(py(data[hi]) / H) * 100}%` }}
          />
          <div
            className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border border-clay/35 bg-cream px-2.5 py-1 text-[11px] font-semibold tabular-nums text-ink shadow-xl"
            style={{ left: `${Math.min(Math.max(frac, 0.09), 0.91) * 100}%` }}
          >
            {data[hi].toLocaleString()}
          </div>
        </>
      )}
    </div>
  );
}