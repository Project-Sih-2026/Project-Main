import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../state/appContext';
import { Icon } from '../components/Icons';
import { Badge, Btn, Card, Kicker, cx } from '../components/ui';
import { CAMERAS, DISTRICTS, HOTSPOTS, ROADS, VEHICLES, camById, pointAlong, timeAgo } from '../data/mock';

const CONGESTION: Record<string, number> = { r1: 3, r2: 2, r3: 4, r4: 2, r5: 1, r6: 3, r7: 2, r8: 2, r9: 1, r10: 2, r11: 1, r12: 2 };
const LEVEL_STROKE = ['rgba(232,210,196,.28)', 'rgba(199,169,163,.42)', 'rgba(158,129,137,.6)', 'rgba(158,129,137,.95)'];
const ROAD_W = [2.5, 3.5, 5, 7];

export function CityMapPage() {
  const app = useApp();
  const [layers, setLayers] = useState(() => ({ ...app.settings.mapLayers }));
  const [selCam, setSelCam] = useState<string | null>(null);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPulse((p) => p + 1), 900);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (app.target.cameraId) { setSelCam(app.target.cameraId); setLayers((l) => ({ ...l, cameras: true })); }
  }, [app.navSeq, app.target.cameraId]);

  const toggle = (k: keyof typeof layers) => setLayers((l) => ({ ...l, [k]: !l[k] }));

  const trackedVehicles = useMemo(
    () => VEHICLES.filter((v) => (layers.watchlist ? true : v.status === 'clear') && v.speed > 0),
    [layers.watchlist, pulse]
  );
  const focusVeh = app.target.mapVehicle ? VEHICLES.find((v) => v.id === app.target.mapVehicle) : undefined;
  const focusPos = focusVeh && focusVeh.road !== undefined && focusVeh.prog !== undefined
    ? pointAlong(ROADS[focusVeh.road].points, focusVeh.prog)
    : undefined;

  const sel = selCam ? camById(selCam) : undefined;

  return (
    <div className="page-shell fade-up">
      <div className="page-hero flex flex-wrap items-end justify-between gap-3 px-5 py-5 sm:px-6 sm:py-6">
        <div>
          <Kicker className="text-sand">City map</Kicker>
          <p className="mt-1 font-display text-[34px] font-bold leading-tight text-cream">
            Live corridors <span className="italic text-sand">· Meridian Metro</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(layers) as (keyof typeof layers)[]).map((k) => (
            <button
              key={k}
              onClick={() => toggle(k)}
              className={cx(
                'rounded-full border px-3 py-1.5 text-[14px] font-bold capitalize transition-all duration-150 active:scale-95',
                layers[k] ? 'border-sand/40 bg-sand/15 text-sand' : 'border-cream/15 text-sand/75 hover:border-cream/30 hover:bg-cream/10 hover:text-cream'
              )}
            >
              {layers[k] ? '● ' : '○ '}
              {k}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
        <Card tone="strong" className="relative overflow-hidden p-2 sm:p-3">
          <svg viewBox="0 0 1000 660" className="h-auto w-full rounded-xl bg-ink/40">
            <g>
              {DISTRICTS.map((d) => (
                <polygon key={d.id} points={d.points.map((p) => p.join(',')).join(' ')} fill="rgba(199,169,163,0.04)" stroke="rgba(199,169,163,0.14)" strokeWidth="1" strokeDasharray="3 5" />
              ))}
            </g>
            {layers.congestion && (
              <g>
                {ROADS.map((rd) => (
                  <polyline
                    key={rd.id}
                    points={rd.points.map((p) => p.join(',')).join(' ')}
                    fill="none"
                    stroke={LEVEL_STROKE[CONGESTION[rd.id] - 1]}
                    strokeWidth={ROAD_W[CONGESTION[rd.id] - 1]}
                    strokeLinecap="round"
                  />
                ))}
              </g>
            )}
            {layers.cameras && (
              <g>
                {CAMERAS.map((c) => (
                  <g key={c.id} transform={`translate(${c.x},${c.y})`} onClick={() => setSelCam(c.id)} className="cursor-pointer">
                    <circle r="16" fill="transparent" />
                    <circle r={selCam === c.id ? 7 : 5} fill={c.status === 'online' ? 'rgba(232,210,196,.95)' : c.status === 'degraded' ? 'rgba(199,169,163,.8)' : 'rgba(158,129,137,.45)'} className="transition-all" />
                    {c.status === 'online' && <circle r="5" className="ping-ring" />}
                    {selCam === c.id && <circle r="12" fill="none" stroke="rgba(247,239,231,.6)" strokeWidth="1.2" />}
                    <text y="-13" textAnchor="middle" fill="rgba(247,239,231,.55)" fontSize="9">{c.code}</text>
                  </g>
                ))}
              </g>
            )}
            {layers.alerts && (
              <g>
                {app.alerts.filter((a) => a.status === 'open').map((a, i) => {
                  const c = camById(a.cameraId);
                  if (!c) return null;
                  return (
                    <g key={a.id} transform={`translate(${c.x + 14},${c.y - 14 - (i % 3) * 4})`} onClick={() => app.nav({ page: 'alerts', alertId: a.id, statusFilter: 'open' })} className="cursor-pointer">
                      <circle r="4.5" fill="#C7A9A3" stroke="#3E3239" strokeWidth="1.5" />
                      <circle r="4.5" className="ping-ring" />
                    </g>
                  );
                })}
              </g>
            )}
            {layers.congestion && (
              <g>
                {HOTSPOTS.map((h) => (
                  <g key={h.name} transform={`translate(${h.x},${h.y})`} onClick={() => app.toast(`${h.name} — ${h.veh.toLocaleString()} veh/hr · ${h.note}`)} className="cursor-pointer">
                    <title>{`${h.name} — ${h.veh.toLocaleString()} veh/hr`}</title>
                    <circle r={9 + h.level * 3} fill="rgba(158,129,137,.16)" />
                    <circle r={4 + h.level} fill={h.level === 3 ? 'rgba(232,210,196,.92)' : h.level === 2 ? 'rgba(199,169,163,.8)' : 'rgba(158,129,137,.7)'} stroke="#3E3239" strokeWidth="1.2" className="transition-all" />
                    <circle r={4 + h.level} className="ping-ring" opacity={h.level === 3 ? 1 : 0.45} />
                    <text y="-15" textAnchor="middle" fill="rgba(247,239,231,.62)" fontSize="9.5" fontWeight="600">{h.name}</text>
                  </g>
                ))}
              </g>
            )}
            {layers.vehicles && (
              <g>
                {trackedVehicles.map((v) => {
                  if (v.road === undefined || v.prog === undefined) return null;
                  const p = pointAlong(ROADS[v.road].points, v.prog);
                  const isWl = layers.watchlist && v.status !== 'clear';
                  return (
                    <g key={v.id} transform={`translate(${p.x},${p.y})`} onClick={() => app.nav({ page: 'vehicles', vehicleId: v.id })} className="cursor-pointer">
                      <rect x="-9" y="-4.5" width="18" height="9" rx="2.5" fill={isWl ? '#E8D2C4' : 'rgba(247,239,231,.65)'} opacity="0.9" />
                      {isWl && <circle r="11" fill="none" stroke="rgba(232,210,196,.5)" strokeWidth="1" strokeDasharray="2 3" />}
                    </g>
                  );
                })}
              </g>
            )}
            {focusPos && (
              <g transform={`translate(${focusPos.x},${focusPos.y})`}>
                <circle r="15" className="ping-ring" />
                <circle r="5" fill="#F7EFE7" stroke="#3E3239" strokeWidth="2" />
              </g>
            )}
          </svg>
          {sel && (
            <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center gap-3 rounded-xl border border-cream/10 bg-ink/90 px-4 py-3 backdrop-blur sm:right-auto sm:max-w-md">
              <div className="flex-1">
                <div className="text-[15px] font-bold text-cream">{sel.name}</div>
                <div className="text-[13px] font-semibold text-sand/85">{sel.code} · {sel.district} · {sel.heading}</div>
              </div>
              <Badge tone={sel.status === 'online' ? 'good' : sel.status === 'degraded' ? 'medium' : 'critical'}>{sel.status}</Badge>
              <Btn size="sm" variant="soft" icon="camera" onClick={() => app.nav({ page: 'cameras', cameraId: sel.id })}>Open feed</Btn>
              <button aria-label="Close" onClick={() => setSelCam(null)} className="absolute right-2 top-2 text-cream/75 transition hover:text-cream"><Icon name="x" className="h-3.5 w-3.5" /></button>
            </div>
          )}
          <div className="pointer-events-none absolute left-6 top-5 flex flex-col gap-1 text-[13px] font-semibold text-cream/95">
            <span className="flex items-center gap-2"><span className="h-1.5 w-6 rounded-full bg-[rgba(232,210,196,.45)]" /> free</span>
            <span className="flex items-center gap-2"><span className="h-1.5 w-6 rounded-full bg-[rgba(158,129,137,.95)]" /> congested</span>
          </div>
        </Card>
        <div className="flex flex-col gap-4">
          <Card className="p-4">
            <Kicker>Corridor congestion</Kicker>
            <div className="mt-3 flex flex-col gap-2.5">
              {ROADS.slice(0, 6).map((rd) => {
                const lv = CONGESTION[rd.id];
                return (
                  <button key={rd.id} onClick={() => app.toast(`${rd.name} — ${['free', 'light', 'moderate', 'heavy'][lv - 1]} traffic`)} className="group text-left">
                    <div className="flex items-center justify-between text-[14px]">
                      <span className="font-semibold text-ink/85 group-hover:text-ink">{rd.name}</span>
                      <span className="font-semibold tabular-nums text-mauve">{['free', 'light', 'moderate', 'heavy'][lv - 1]}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-clay/20">
                      <div className="h-full rounded-full bg-dusk transition-all duration-500" style={{ width: `${lv * 25}%` }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <Kicker>Open alerts in view</Kicker>
              <Badge tone="critical">{app.alerts.filter((a) => a.status === 'open').length}</Badge>
            </div>
            <div className="mt-2 flex flex-col">
              {app.alerts.filter((a) => a.status === 'open').slice(0, 4).map((a) => (
                <button key={a.id} onClick={() => app.nav({ page: 'alerts', alertId: a.id, statusFilter: 'open' })} className="hit items-start">
                  <span className={cx('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', a.severity === 'critical' ? 'bg-ink' : 'bg-mauve')} />
                  <span className="flex-1 truncate text-[14px] font-semibold text-ink/90">{a.title}</span>
                  <span className="text-[13px] font-semibold text-mauve/70">{timeAgo(a.minsAgo)}</span>
                </button>
              ))}
            </div>
          </Card>
          {focusVeh && (
            <Card className="border-clay/30 bg-sand/45 p-4">
              <Kicker>Tracking focus</Kicker>
              <div className="mt-1 font-display text-[22px] font-bold text-ink">{focusVeh.plate}</div>
              <div className="text-[14px] font-semibold text-mauve/75">{focusVeh.make} {focusVeh.model} · {app.fmtSpeed(focusVeh.speed)}</div>
              <Btn size="sm" variant="soft" className="mt-3" icon="car" onClick={() => app.nav({ page: 'vehicles', vehicleId: focusVeh.id })}>Open vehicle dossier</Btn>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}