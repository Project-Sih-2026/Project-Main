import { useEffect, useState } from 'react';
import { Icon } from './Icons';
import { Badge, cx } from './ui';
import type { Camera } from '../data/mock';

const PALETTES: Record<string, [string, string, string]> = {
  online: ['#6B5560', '#C7A9A3', '#E8D2C4'],
  degraded: ['#4A3E44', '#9E8189', '#C7A9A3'],
  offline: ['#2E262B', '#6B5560', '#9E8189'],
};

/** Cinematic simulated camera feed — pure CSS/SVG scenery, no network. */
export function CameraFeed({ cam, className, playing = true, showGrid = false }: { cam: Camera; className?: string; playing?: boolean; showGrid?: boolean }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setTick((t) => t + 1), 2000);
    return () => clearInterval(id);
  }, [playing]);
  useEffect(() => setTick(0), [cam.id]);

  const [b1, b2, b3] = PALETTES[cam.status];
  const seed = cam.id.charCodeAt(1);
  const cars = cam.status === 'offline' ? [] : Array.from({ length: 4 }, (_, i) => ({
    top: 26 + i * 16 + (seed % 7),
    dur: 4 + ((seed + i * 3) % 5),
    delay: (i * 1.7 + tick * 0.9) % 8,
    w: 20 + ((seed + i * 5) % 18),
    op: 0.35 + ((i + seed) % 4) * 0.12,
  }));

  return (
    <div className={cx('grain relative overflow-hidden rounded-xl border border-clay/35 shadow-[0_10px_32px_rgba(62,50,57,0.12)]', className)}>
      <svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id={`sky-${cam.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={b1} />
            <stop offset="100%" stopColor={b2} stopOpacity="0.55" />
          </linearGradient>
        </defs>
        <rect width="400" height="220" fill={`url(#sky-${cam.id})`} />
        {/* skyline */}
        {[40, 90, 55, 120, 70, 100, 50, 85].map((h, i) => (
          <rect key={i} x={i * 52 - 10} y={118 - h} width={40 + (i % 3) * 8} height={h} fill={b1} opacity="0.85" />
        ))}
        {/* windows */}
        {cam.status !== 'offline' &&
          Array.from({ length: 26 }, (_, i) => (
            <rect key={i} x={8 + (i % 13) * 30} y={62 + Math.floor(i / 13) * 14} width="4" height="5" fill={b3} opacity={(i * 37 + tick * 13) % 5 > 2 ? 0.5 : 0.15} />
          ))}
        {/* road */}
        <rect x="0" y="118" width="400" height="102" fill={b1} opacity="0.95" />
        <line x1="0" y1="150" x2="400" y2="150" stroke={b3} strokeWidth="1.4" strokeDasharray="16 12" opacity="0.5" />
        <line x1="0" y1="185" x2="400" y2="185" stroke={b3} strokeWidth="1" strokeDasharray="12 14" opacity="0.3" />
        {/* traffic */}
        {cars.map((c, i) => (
          <rect key={i} x={`${(c.delay / 8) * 110}%`} y={c.top + 30} width={c.w} height="7" rx="2.5" fill={b3} opacity={c.op} />
        ))}
      </svg>

      <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-cream/5" />
      {showGrid && (
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 400 220" preserveAspectRatio="none">
          {[1, 2, 3].map((i) => (
            <line key={i} x1={i * 100} x2={i * 100} y1="0" y2="220" stroke="rgba(247,239,231,0.16)" strokeWidth="1" strokeDasharray="4 6" />
          ))}
          <line x1="0" x2="400" y1="110" y2="110" stroke="rgba(247,239,231,0.16)" strokeWidth="1" strokeDasharray="4 6" />
        </svg>
      )}
      {!playing && cam.status !== 'offline' && (
        <div className="pointer-events-none absolute right-3 top-10 rounded-md border border-sand/50 bg-cream/90 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink">
          Paused
        </div>
      )}
      {cam.status === 'offline' ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <Icon name="camera" className="h-6 w-6 text-clay/50" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-clay/60">Signal lost</span>
          <span className="text-[11px] text-dusk/70">Reconnecting — maintenance ticket open</span>
        </div>
      ) : (
        <>
          <span className="feed-scan" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between p-3">
            <span className="flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.18em] text-cream">
              <span className={cx('h-1.5 w-1.5 rounded-full', cam.status === 'online' ? 'bg-sand' : 'bg-dusk animate-pulse')} />
              {cam.code}
            </span>
            <span className="text-[11px] tabular-nums text-sand/90">{cam.res} · {cam.fps}fps</span>
          </div>
          <div className="pointer-events-none absolute left-3 top-3">
            <Badge tone={cam.status === 'online' ? 'good' : 'medium'}>{cam.status}</Badge>
          </div>
          <div className="pointer-events-none absolute right-3 top-3 rounded-md border border-sand/25 bg-ink/55 px-1.5 py-0.5 text-[11px] tabular-nums tracking-widest text-cream/85">
            {cam.status === 'degraded' ? '--:--:--' : new Date().toLocaleTimeString([], { hour12: false })}
          </div>
        </>
      )}
    </div>
  );
}