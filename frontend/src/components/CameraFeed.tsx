import { useEffect, useState, useMemo } from 'react';
import { Icon } from './Icons';
import { Badge, cx } from './ui';
import type { Camera } from '../data/mock';

/**
 * Realistic Tactical CCTV Keyframe Surveillance Stream Viewer.
 * Features realistic ANPR bounding boxes, camera telemetry HUD, optical crosshairs,
 * live millisecond timecode, frame counter, and tactical night/day surveillance rendering.
 */
export function CameraFeed({
  cam,
  className,
  playing = true,
  showGrid = false
}: {
  cam: Camera;
  className?: string;
  playing?: boolean;
  showGrid?: boolean;
}) {
  const [frameIndex, setFrameIndex] = useState(1420);
  const [timeStr, setTimeStr] = useState('');
  const [ms, setMs] = useState(240);

  useEffect(() => {
    const updateClock = () => {
      const d = new Date();
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      const s = String(d.getSeconds()).padStart(2, '0');
      setTimeStr(`${h}:${m}:${s}`);
      setMs(d.getMilliseconds());
    };
    updateClock();
    const timer = setInterval(updateClock, 100);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!playing || cam.status === 'offline') return;
    const interval = setInterval(() => {
      setFrameIndex((f) => f + 1);
    }, 1800);
    return () => clearInterval(interval);
  }, [playing, cam.status]);

  // Synthetic vehicle bounding boxes tailored to the camera's location
  const detections = useMemo(() => {
    if (cam.status === 'offline') return [];
    const seed = cam.id.charCodeAt(cam.id.length - 1) + frameIndex;
    const samplePlates = [
      { plate: 'DL-01-AB-1234', type: 'AUDI A4', conf: 98.4, status: 'flagged' },
      { plate: 'HR-38-T-1103', type: 'TATA TIPPER', conf: 96.1, status: 'flagged' },
      { plate: 'DL-03-CC-7702', type: 'TOYOTA CAMRY', conf: 99.2, status: 'clear' },
      { plate: 'HR-26-DK-2258', type: 'CRETA SX', conf: 97.8, status: 'watchlist' },
      { plate: 'DL-04-NA-9041', type: 'YAMAHA MT-15', conf: 94.5, status: 'clear' },
      { plate: 'UP-16-AX-5177', type: 'FORTUNER', conf: 98.9, status: 'flagged' }
    ];

    const d1 = samplePlates[(seed) % samplePlates.length];
    const d2 = samplePlates[(seed + 2) % samplePlates.length];

    return [
      {
        ...d1,
        x: 22 + (seed % 14),
        y: 42 + (seed % 10),
        w: 24,
        h: 22,
        speed: cam.avgSpeed + (seed % 9) - 4
      },
      {
        ...d2,
        x: 58 + ((seed * 3) % 18),
        y: 52 + (seed % 8),
        w: 20,
        h: 18,
        speed: cam.avgSpeed + ((seed * 2) % 11) - 5
      }
    ];
  }, [cam.id, cam.status, cam.avgSpeed, frameIndex]);

  return (
    <div
      className={cx(
        'relative overflow-hidden rounded-xl border border-clay/35 bg-[#0C1017] shadow-[0_12px_36px_rgba(0,0,0,0.4)] select-none',
        className
      )}
    >
      {cam.status === 'offline' ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0C1017] text-cream">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-950/40 border border-red-500/30 mb-2">
            <Icon name="camera" className="h-6 w-6 text-red-400" />
          </div>
          <span className="text-[12px] font-mono font-bold tracking-widest text-red-400 uppercase">
            NO SIGNAL — CAMERA OFFLINE
          </span>
          <span className="text-[11px] text-cream/50 mt-1 font-mono">
            {cam.code} ({cam.district}) · SENSOR UNREACHABLE
          </span>
        </div>
      ) : (
        <>
          {/* Tactical CCTV Road Perspective Canvas Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#111827] via-[#1F2937] to-[#0B0F19]">
            {/* Road Perspective Lines */}
            <svg className="absolute inset-0 h-full w-full opacity-60" preserveAspectRatio="none" viewBox="0 0 100 100">
              {/* Vanishing Point Perspective Sky & Road */}
              <polygon points="0,40 100,40 100,100 0,100" fill="#182234" />
              <polygon points="15,100 45,40 55,40 85,100" fill="#0F172A" />
              
              {/* Lane Divider Lines */}
              <line x1="50" y1="40" x2="50" y2="100" stroke="#F59E0B" strokeWidth="0.6" strokeDasharray="3 2" opacity="0.8" />
              <line x1="45" y1="40" x2="28" y2="100" stroke="#FFFFFF" strokeWidth="0.4" strokeDasharray="2 2" opacity="0.5" />
              <line x1="55" y1="40" x2="72" y2="100" stroke="#FFFFFF" strokeWidth="0.4" strokeDasharray="2 2" opacity="0.5" />
              
              {/* Road Shoulders / Curbs */}
              <line x1="45" y1="40" x2="15" y2="100" stroke="#64748B" strokeWidth="0.8" />
              <line x1="55" y1="40" x2="85" y2="100" stroke="#64748B" strokeWidth="0.8" />
              
              {/* Horizon Line */}
              <line x1="0" y1="40" x2="100" y2="40" stroke="#334155" strokeWidth="0.5" />
            </svg>

            {/* Vehicle ANPR Bounding Box Overlays */}
            {detections.map((det, idx) => {
              const isFlagged = det.status === 'flagged';
              const isWatch = det.status === 'watchlist';
              const boxColor = isFlagged ? '#EF4444' : isWatch ? '#F59E0B' : '#10B981';

              return (
                <div
                  key={idx}
                  className="absolute transition-all duration-700 ease-out"
                  style={{
                    left: `${det.x}%`,
                    top: `${det.y}%`,
                    width: `${det.w}%`,
                    height: `${det.h}%`,
                  }}
                >
                  {/* Outer Bounding Box with Corner Brackets */}
                  <div
                    className="relative h-full w-full rounded-[2px]"
                    style={{
                      border: `1.5px solid ${boxColor}`,
                      backgroundColor: `${boxColor}15`,
                      boxShadow: `0 0 12px ${boxColor}40`
                    }}
                  >
                    {/* Corner Accent Brackets */}
                    <span className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2" style={{ borderColor: boxColor }} />
                    <span className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2" style={{ borderColor: boxColor }} />
                    <span className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2" style={{ borderColor: boxColor }} />
                    <span className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2" style={{ borderColor: boxColor }} />

                    {/* Laser Scanner Bar */}
                    <div
                      className="absolute inset-x-0 h-0.5 animate-pulse"
                      style={{
                        top: '50%',
                        backgroundColor: boxColor,
                        boxShadow: `0 0 8px ${boxColor}`
                      }}
                    />

                    {/* Floating ANPR Detection Tag */}
                    <div
                      className="absolute -top-6 left-0 flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold whitespace-nowrap shadow-md"
                      style={{
                        backgroundColor: boxColor,
                        color: '#0F172A'
                      }}
                    >
                      <span>🔍 {det.plate}</span>
                      <span className="opacity-80">[{det.conf}%]</span>
                    </div>

                    {/* Telemetry Sub-Tag */}
                    <div
                      className="absolute -bottom-5 left-0 px-1 py-0.2 rounded text-[9px] font-mono bg-black/75 text-white/90 border border-white/10 whitespace-nowrap"
                    >
                      {det.type} · {det.speed} km/h
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Optical Grid & Crosshair Reticle Overlay */}
          {showGrid && (
            <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-35" viewBox="0 0 100 100" preserveAspectRatio="none">
              <line x1="25" y1="0" x2="25" y2="100" stroke="#06B6D4" strokeWidth="0.3" strokeDasharray="1 1" />
              <line x1="50" y1="0" x2="50" y2="100" stroke="#06B6D4" strokeWidth="0.4" strokeDasharray="2 1" />
              <line x1="75" y1="0" x2="75" y2="100" stroke="#06B6D4" strokeWidth="0.3" strokeDasharray="1 1" />
              <line x1="0" y1="33" x2="100" y2="33" stroke="#06B6D4" strokeWidth="0.3" strokeDasharray="1 1" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="#06B6D4" strokeWidth="0.4" strokeDasharray="2 1" />
              <line x1="0" y1="66" x2="100" y2="66" stroke="#06B6D4" strokeWidth="0.3" strokeDasharray="1 1" />
              
              {/* Center Crosshairs */}
              <circle cx="50" cy="50" r="4" fill="none" stroke="#06B6D4" strokeWidth="0.5" />
              <line x1="44" y1="50" x2="56" y2="50" stroke="#06B6D4" strokeWidth="0.5" />
              <line x1="50" y1="44" x2="50" y2="56" stroke="#06B6D4" strokeWidth="0.5" />
            </svg>
          )}

          {/* CRT Scanline Texture Effect */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(10,20,34,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-40" />

          {/* TOP OSD BAR: Live REC Indicator & Camera Code */}
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-2.5 sm:p-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 border border-white/10 backdrop-blur-sm">
                <span className={cx(
                  'h-2 w-2 rounded-full',
                  cam.status === 'online' ? 'bg-red-500 animate-pulse' : 'bg-blue-400'
                )} />
                <span className="font-mono text-[11px] font-extrabold tracking-widest text-red-400">REC</span>
              </div>
              <span className="font-mono text-[11.5px] font-bold text-white tracking-wider drop-shadow">
                {cam.code} · {cam.name}
              </span>
            </div>

            {/* High Precision Live Timecode */}
            <div className="flex items-center gap-2">
              <div className="font-mono text-[11.5px] text-emerald-400 font-semibold bg-black/60 px-2 py-0.5 rounded border border-emerald-500/20 tabular-nums">
                {timeStr}.{String(ms).padStart(3, '0')}
              </div>
              <Badge tone={cam.status === 'online' ? 'good' : 'medium'} className="text-[10px]">
                {cam.status.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* BOTTOM OSD BAR: Telemetry & Optical Specifications */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between p-2.5 sm:p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-[10.5px] font-mono text-slate-300">
            <div className="flex items-center gap-3">
              <span className="text-blue-300">GPS: {cam.lat.toFixed(4)}°N, {cam.lng.toFixed(4)}°E</span>
              <span className="hidden sm:inline text-slate-400">DIR: {cam.heading}</span>
            </div>
            <div className="flex items-center gap-3 tabular-nums">
              <span>{cam.res} @ {cam.fps}fps</span>
              <span className="text-cyan-300">FRM #{frameIndex}</span>
              <span className="hidden sm:inline text-emerald-400">NET: 4.6 Mbps</span>
            </div>
          </div>

          {/* Paused Overlay */}
          {!playing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
              <div className="flex items-center gap-2 rounded-lg border border-blue-500/40 bg-black/80 px-4 py-2 font-mono text-[13px] font-bold tracking-widest text-blue-300">
                <Icon name="pause" className="h-4 w-4" /> FEED PAUSED (KEYFRAME HOLD)
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}