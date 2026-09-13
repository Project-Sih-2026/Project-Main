import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../state/appContext';
import { AreaChart } from '../components/Charts';
import { NetworkFlow3D } from '../components/NetworkFlow3D';
import { CameraFeed } from '../components/CameraFeed';
import { Icon, type IconName } from '../components/Icons';
import { Badge, Btn, Card, Kicker, Select, Tabs, cx, useClock } from '../components/ui';
import { CAMERAS, HOTSPOTS, RANGES, timeAgo, type RangeKey } from '../data/mock';
import { api, BACKEND_STATIC } from '../services/api';
import { getDetectionPortalUrl } from '../utils/navigation';
import type { Detection } from '../types';

const KPIS = (rk: RangeKey, openAlerts: number, vehicleCount: number) => {
  const r = RANGES[rk];
  const online = CAMERAS.filter((c) => c.status === 'online').length;
  return [
    { label: 'Real vehicles tracked', v: String(vehicleCount), d: `${vehicleCount} active in DB`, icon: 'car' as IconName, light: false },
    { label: 'Cameras online', v: `${online} / ${CAMERAS.length}`, d: '+2 restored', icon: 'camera' as IconName, light: false },
    { label: 'Active alerts', v: String(openAlerts), d: openAlerts > 0 ? 'live — triage now' : 'nominal', icon: 'bell' as IconName, light: openAlerts > 0 },
    { label: 'Avg OCR confidence', v: r.kpis.ocr + '%', d: r.kpis.d[2], icon: 'eye' as IconName, light: false },
    { label: 'System status', v: 'Operational', d: 'all feeds synced', icon: 'shield' as IconName, light: false },
  ];
};
function Kpi({ icon, label, v, d, light }: { icon: IconName; label: string; v: string; d: string; light?: boolean }) {
  if (light)
    return (
      <Card tone="strong" className="card-lift block-light p-4">
        <div className="flex items-start justify-between">
            <span className="text-[14px] font-bold uppercase tracking-[0.14em] text-ink/60">{label}</span>
          <Icon name={icon} className="h-4 w-4 text-ink/50" />
        </div>
        <div className="mt-2.5 font-display text-[34px] font-semibold leading-none text-ink">{v}</div>
        <div className="mt-2.5 flex items-center gap-1.5 text-[14px] font-bold text-ink/75">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mauve" />
          <span>{d}</span>
        </div>
      </Card>
    );
  return (
    <Card className="card-lift p-4">
      <div className="flex items-start justify-between">
        <Kicker>{label}</Kicker>
        <Icon name={icon} className="h-4 w-4 text-dusk/70" />
      </div>
      <div className="mt-2.5 font-display text-[34px] leading-none text-ink">{v}</div>
      <div className="mt-2.5 flex items-center gap-1.5 text-[14px] font-semibold text-mauve/80">
        {d.startsWith('+') ? (
          <Icon name="arrowUp" className="h-3 w-3 text-dusk" />
        ) : /^[−-]/.test(d) ? (
          <Icon name="arrowDown" className="h-3 w-3 text-mauve" />
        ) : (
          <span className="h-1.5 w-1.5 rounded-full bg-clay/80" />
        )}
        <span className="font-semibold text-mauve">{d}</span>
        {/^[+−-]/.test(d) && <span>vs previous</span>}
      </div>
    </Card>
  );
}

export function OperationsPage() {
  const app = useApp();
  const [rk, setRk] = useState<RangeKey>('24h');
  const [dimension, setDimension] = useState<'3d' | '2d'>('3d');
  const [flowMode, setFlowMode] = useState<'volume' | 'speed' | 'dual'>('volume');
  const [district, setDistrict] = useState('All districts');
  const [camId, setCamId] = useState('c1');
  const r = RANGES[rk];
  const districts = ['All districts', ...Array.from(new Set(CAMERAS.map((c) => c.district)))];
  const visibleCams = CAMERAS.filter((c) => district === 'All districts' || c.district === district);
  const cam = CAMERAS.find((c) => c.id === camId) ?? visibleCams[0] ?? CAMERAS[0];
  const openAlerts = useMemo(() => app.alerts.filter((a) => a.status === 'open').slice(0, 5), [app.alerts]);
  const tracked = app.vehicles.filter((v) => v.status !== 'clear');
  const openCount = app.alerts.filter((a) => a.status === 'open').length;
  const now = useClock();
  const hour = now.getHours();
  const greet = hour < 5 ? 'Good night' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : hour < 21 ? 'Good evening' : 'Good night';

  const [spot, setSpot] = useState('');
  const runSpot = () => {
    const q = spot.trim();
    if (!q) return;
    const norm = (s: string) => s.replace(/[^a-z0-9]/gi, '').toLowerCase();
    const hit = app.vehicles.find((v) => norm(v.plate).includes(norm(q)) || norm(q).includes(norm(v.plate)));
    if (hit) app.nav({ page: 'vehicles', query: hit.plate, vehicleId: hit.id });
    else {
      app.toast(`No vehicle matches “${q}”`);
      app.nav({ page: 'vehicles', query: q });
    }
  };

  useEffect(() => {
    if (!visibleCams.some((c) => c.id === camId)) setCamId(visibleCams[0]?.id ?? 'c1');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [district]);

  const [liveDetections, setLiveDetections] = useState<Detection[]>([]);

  const fetchRecent = () => {
    api.getDetections({ limit: 6 }).then((data) => {
      if (Array.isArray(data)) setLiveDetections(data);
    }).catch((err) => console.warn('Dashboard failed to load live detections:', err));
  };

  useEffect(() => {
    fetchRecent();
    const interval = setInterval(fetchRecent, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page-shell fade-up">


      <div className="page-hero flex flex-wrap items-end justify-between gap-3 px-5 py-5 sm:px-6 sm:py-6">
        <div>
          <Kicker className="text-sand">{greet}, {app.user?.name.split(' ')[0] ?? 'Operator'}</Kicker>
          <p className="mt-1 font-display text-[34px] font-bold leading-tight text-cream">
            Traffic is flowing at <span className="italic text-sand">{r.kpis.avgSpeed} km/h</span> average.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Btn icon="map" onClick={() => app.nav({ page: 'map' })}>City map</Btn>
          <Btn icon="refresh" onClick={() => app.resetData()}>Sync data</Btn>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          runSpot();
        }}
        className="section-contrast flex h-14 items-center gap-3 px-4 transition-colors focus-within:border-mauve/45"
      >
        <Icon name="search" className="h-4 w-4 shrink-0 text-mauve/70" />
        <input
          value={spot}
          onChange={(e) => setSpot(e.target.value)}
          placeholder="Search vehicle registration number"
          className="h-full flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-mauve/50"
        />
        <span className="hidden text-[14px] font-semibold text-mauve/75 sm:block">e.g. DL-01-AB-4821</span>
        <Btn size="sm" variant="solid" type="submit">
          Search
        </Btn>
      </form>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
        {KPIS(rk, openCount, app.vehicles.length).map((k) => (
          <Kpi key={k.label} {...k} />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <Card tone="strong" className="section-contrast p-4 sm:p-5 relative overflow-hidden">
          {/* Top Bar with Clean Metrics & View Switchers */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-clay/20 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Kicker>Corridor Flow Metrics</Kicker>
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10.5px] font-bold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Live Sync
                </span>
              </div>
              <div className="mt-1 font-display text-[22px] text-ink">
                {dimension === '3d'
                  ? '3D Corridor Volume Distribution'
                  : flowMode === 'volume'
                  ? 'Vehicles per hour · all corridors'
                  : flowMode === 'speed'
                  ? 'Average corridor transit speed'
                  : 'Volume & speed distribution'}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* 3D vs 2D Dimension Switcher */}
              <div className="flex rounded-xl border border-sky-500/30 bg-sky-500/10 p-0.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setDimension('3d')}
                  className={cx(
                    'flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-all',
                    dimension === '3d' ? 'bg-sky-600 text-white shadow-sm' : 'text-sky-800 hover:text-sky-950'
                  )}
                >
                  <Icon name="layers" className="h-3.5 w-3.5" />
                  <span>3D View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDimension('2d')}
                  className={cx(
                    'flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-all',
                    dimension === '2d' ? 'bg-sky-600 text-white shadow-sm' : 'text-sky-800 hover:text-sky-950'
                  )}
                >
                  <Icon name="activity" className="h-3.5 w-3.5" />
                  <span>2D Spline</span>
                </button>
              </div>

              {/* Metric View Mode Toggle (for 2D view) */}
              {dimension === '2d' && (
                <div className="flex rounded-xl border border-clay/30 bg-cream/70 p-0.5 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setFlowMode('volume')}
                    className={cx(
                      'rounded-lg px-2.5 py-1 transition-all',
                      flowMode === 'volume' ? 'bg-sky-600 text-white shadow-sm' : 'text-mauve hover:text-ink'
                    )}
                  >
                    Volume
                  </button>
                  <button
                    type="button"
                    onClick={() => setFlowMode('speed')}
                    className={cx(
                      'rounded-lg px-2.5 py-1 transition-all',
                      flowMode === 'speed' ? 'bg-amber-600 text-white shadow-sm' : 'text-mauve hover:text-ink'
                    )}
                  >
                    Speed
                  </button>
                  <button
                    type="button"
                    onClick={() => setFlowMode('dual')}
                    className={cx(
                      'rounded-lg px-2.5 py-1 transition-all',
                      flowMode === 'dual' ? 'bg-indigo-600 text-white shadow-sm' : 'text-mauve hover:text-ink'
                    )}
                  >
                    Dual
                  </button>
                </div>
              )}

              <Tabs
                items={[
                  { id: '15m', label: '15m Live' },
                  { id: '8h', label: '8h Shift' },
                  { id: '24h', label: '24h Day' },
                  { id: '7d', label: '7d Week' },
                ]}
                value={rk}
                onChange={(id) => setRk(id as RangeKey)}
              />
            </div>
          </div>

          {/* Visualization Area: Interactive 3D WebGL Hologram OR 2D Spline HUD */}
          <div className="mt-4">
            {dimension === '3d' ? (
              <NetworkFlow3D
                data={r.volume}
                secondaryData={r.speed}
                labels={r.labels}
                height={260}
                unit="veh/hr"
                secondaryUnit={app.settings.units === 'mph' ? 'mph' : 'km/h'}
              />
            ) : (
              <>
                <AreaChart
                  data={r.volume}
                  secondaryData={r.speed}
                  labels={r.labels}
                  height={220}
                  color="#0284c7"
                  secondaryColor="#f59e0b"
                  unit="veh/hr"
                  secondaryUnit={app.settings.units === 'mph' ? 'mph' : 'km/h'}
                  mode={flowMode}
                  showGrid={true}
                  showPeakMarker={true}
                  showCapacityLine={true}
                />
                <div className="mt-2 flex justify-between text-[13px] font-semibold tabular-nums text-mauve/70 px-10">
                  <span>{r.labels[0]}</span>
                  <span>{r.labels[Math.floor(r.labels.length / 2)]}</span>
                  <span>{r.labels[r.labels.length - 1]}</span>
                </div>
              </>
            )}
          </div>

          {/* Bottom Telemetry & KPI Ribbon */}
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-clay/25 pt-4 text-[13.5px] font-semibold text-mauve/80">
            <span className="flex items-center gap-1.5">
              <Icon name="clock" className="h-3.5 w-3.5 text-sky-600" />
              Peak: <strong className="text-ink">{Math.max(...r.volume).toLocaleString()}</strong> veh/hr
            </span>
            <span className="flex items-center gap-1.5">
              <Icon name="activity" className="h-3.5 w-3.5 text-indigo-600" />
              Avg: <strong className="text-ink">{Math.round(r.volume.reduce((a, b) => a + b, 0) / r.volume.length).toLocaleString()}</strong> veh/hr
            </span>
            <span className="flex items-center gap-1.5">
              <Icon name="eye" className="h-3.5 w-3.5 text-amber-600" />
              Avg Speed: <strong className="text-ink">{r.kpis.avgSpeed}</strong> km/h
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Flow Health: <strong className="text-emerald-700">Optimal (94%)</strong>
            </span>
            <Btn variant="ghost" size="sm" className="ml-auto" onClick={() => app.nav({ page: 'analytics' })}>
              Full analytics <Icon name="arrowUpRight" className="h-3.5 w-3.5" />
            </Btn>
          </div>
        </Card>

        <Card tone="quiet" className="section-contrast p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Kicker>Camera watch</Kicker>
              <div className="mt-1 font-display text-[22px] text-ink">{cam.name}</div>
            </div>
            <Select value={district} onChange={setDistrict} options={districts} ariaLabel="District filter" className="w-[150px]" />
          </div>
          <CameraFeed cam={cam} className="mt-3 aspect-[16/9] w-full" />
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            {[['Status', cam.status], ['Flow today', cam.vehiclesToday.toLocaleString()], ['Avg speed', cam.avgSpeed + ' km/h']].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-clay/25 bg-cream/80 px-2 py-2">
                <div className="text-[14px] font-bold uppercase tracking-[0.12em] text-mauve">{k}</div>
                <div className="mt-0.5 text-[13.5px] font-bold capitalize text-ink">{v}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {visibleCams.map((c) => (
              <button
                key={c.id}
                onClick={() => setCamId(c.id)}
                className={cx(
                  'rounded-lg px-2.5 py-1.5 text-[13px] font-semibold tabular-nums transition-all duration-150 active:scale-95',
                  c.id === cam.id ? 'bg-mauve text-cream' : 'border border-clay/30 text-mauve/80 hover:border-dusk/45 hover:bg-cream hover:text-ink'
                )}
              >
                {c.code}
              </button>
            ))}
            <Btn variant="ghost" size="sm" className="ml-auto" onClick={() => app.nav({ page: 'cameras', cameraId: cam.id })}>
              All cameras <Icon name="arrowUpRight" className="h-3.5 w-3.5" />
            </Btn>
          </div>
        </Card>
      </div>

      {/* Live AI Detections & Evidence Gallery */}
      <Card tone="strong" className="section-contrast p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-clay/20 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Kicker>Live Database Ingestions</Kicker>
              <span className="rounded bg-blue-600 text-white text-[10px] font-mono font-bold px-1.5 py-0.2">LIVE SYNC</span>
            </div>
            <div className="mt-1 font-display text-[20px] text-ink">
              Recent YOLOv8 Vehicle Detections ({liveDetections.length} Records)
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Btn size="sm" variant="ghost" icon="car" onClick={() => app.nav({ page: 'vehicles' })}>
              View in Vehicle Search <Icon name="arrowRight" className="h-3.5 w-3.5" />
            </Btn>
            <button
              onClick={() => app.nav({ page: 'upload' })}
              className="flex items-center gap-1.5 rounded-xl border border-clay/30 bg-blue-600/10 hover:bg-blue-600/20 px-3 py-1.5 text-xs font-bold text-blue-800 transition-colors cursor-pointer"
            >
              <span>Ingest New Frame</span>
              <Icon name="arrowRight" className="h-3 w-3 text-blue-700" />
            </button>
          </div>
        </div>

        {liveDetections.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {liveDetections.map((d) => (
              <div
                key={d.id}
                onClick={() => app.nav({ page: 'vehicles', query: d.normalized_plate_text })}
                className="group cursor-pointer rounded-xl border border-clay/25 bg-cream/70 hover:border-blue-500/50 hover:bg-blue-500/5 p-2.5 transition-all shadow-sm"
              >
                <div className="h-24 w-full rounded-lg bg-black/90 overflow-hidden flex items-center justify-center border border-clay/30 relative">
                  <img
                    src={d.plate_crop_uri?.startsWith('http') ? d.plate_crop_uri : `${BACKEND_STATIC}${d.plate_crop_uri || d.evidence_image_uri}`}
                    alt="Plate Crop"
                    className="h-full w-full object-contain p-1"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                  <span className="absolute bottom-1 right-1 font-mono text-[9px] bg-black/80 text-blue-400 font-bold px-1 rounded">
                    {d.camera_id}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-ink">{d.normalized_plate_text}</span>
                  <span className="text-[10px] font-bold text-blue-800 bg-blue-500/10 px-1.5 py-0.2 rounded">
                    {d.vehicle_type}
                  </span>
                </div>

                <div className="mt-0.5 flex items-center justify-between text-[11px] text-mauve">
                  <span className="truncate max-w-[100px]">{d.owner_name || 'No name'}</span>
                  <span className="font-mono text-[10px] text-emerald-700 font-bold">{(d.ocr_confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-mauve">
            <p className="font-semibold text-ink">No vehicle frames ingested in the database yet</p>
            <p className="mt-1 text-mauve/75">
              Upload a vehicle image in the <button onClick={() => app.nav({ page: 'upload' })} className="text-blue-700 underline font-bold cursor-pointer">AI Detection Portal</button> to see live ANPR recognition here.
            </p>
          </div>
        )}
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card tone="quiet" className="section-contrast p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <Kicker>Tracked now</Kicker>
            <Btn variant="ghost" size="sm" onClick={() => app.nav({ page: 'vehicles' })}>Vehicle search <Icon name="arrowRight" className="h-3.5 w-3.5" /></Btn>
          </div>
          <div className="mt-3 flex flex-col gap-1">
            {tracked.length > 0 ? (
              tracked.map((v) => (
                <button key={v.id} onClick={() => app.nav({ page: 'vehicles', vehicleId: v.id })} className="hit">
                  <span className="w-[74px] font-display text-[14px] tracking-wide text-ink">{v.plate}</span>
                  <Badge tone={v.status === 'flagged' ? 'critical' : 'medium'}>{v.status}</Badge>
                  <span className="ml-auto text-[14px] font-semibold tabular-nums text-mauve/75">{app.fmtSpeed(v.speed)}</span>
                  <Icon name="locate" className="h-3.5 w-3.5 text-dusk/70" />
                </button>
              ))
            ) : (
              <div className="py-4 text-center text-xs text-mauve/80">
                <span className="font-semibold text-emerald-800">✓ All vehicles cleared</span>
                <p className="mt-0.5 text-[11px] text-mauve/70">No active watchlist or stolen vehicle flags</p>
              </div>
            )}
          </div>
        </Card>

        <Card tone="quiet" className="section-contrast p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <Kicker>Live alerts</Kicker>
            <Btn variant="ghost" size="sm" onClick={() => app.nav({ page: 'alerts', statusFilter: 'open' })}>Alert center <Icon name="arrowRight" className="h-3.5 w-3.5" /></Btn>
          </div>
          <div className="mt-3 flex flex-col gap-1">
            {openAlerts.length > 0 ? (
              openAlerts.map((a) => (
                <button key={a.id} onClick={() => app.nav({ page: 'alerts', alertId: a.id, statusFilter: 'open' })} className="hit items-start">
                  <span className={cx('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', a.severity === 'critical' ? 'bg-sand' : a.severity === 'high' ? 'bg-clay' : 'bg-dusk')} />
                  <span className="flex-1">
                    <span className="block truncate text-[13.5px] font-semibold text-ink/90">{a.title}</span>
                    <span className="text-[14px] font-semibold text-mauve/70">{a.zone} · {timeAgo(a.minsAgo)}</span>
                  </span>
                  <Icon name="chevronRight" className="mt-1 h-3.5 w-3.5 text-dusk/70" />
                </button>
              ))
            ) : (
              <div className="py-4 text-center text-xs text-mauve/80">
                <span className="font-semibold text-emerald-800">✓ Zero active alerts</span>
                <p className="mt-0.5 text-[11px] text-mauve/70">Corridors operating nominally</p>
              </div>
            )}
          </div>
        </Card>

        <Card tone="quiet" className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <Kicker>Congested areas</Kicker>
            <Btn variant="ghost" size="sm" onClick={() => app.nav({ page: 'map' })}>
              City map <Icon name="arrowRight" className="h-3.5 w-3.5" />
            </Btn>
          </div>
          <div className="mt-3 flex flex-col gap-2.5">
            {HOTSPOTS.length === 0 ? (
              <div className="py-6 text-center text-[13px] font-semibold text-mauve/70">
                No active traffic bottlenecks detected. Feeds flowing normally.
              </div>
            ) : (
              HOTSPOTS.map((h) => (
                <button
                  key={h.name}
                  onClick={() => app.nav({ page: 'map' })}
                  className="group rounded-xl border border-clay/25 bg-cream/80 px-3 py-2.5 text-left transition-all duration-150 hover:border-dusk/40 hover:bg-cream active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13.5px] font-medium text-ink/90 transition-colors group-hover:text-ink">{h.name}</span>
                    <Badge tone={h.level === 3 ? 'critical' : h.level === 2 ? 'medium' : 'good'}>
                      {h.level === 3 ? 'Congested' : h.level === 2 ? 'Building' : 'Flowing'}
                    </Badge>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2.5">
                    <span className={cx('flex shrink-0', h.level === 3 ? '-space-x-2' : h.level === 2 ? '-space-x-1' : 'space-x-0.5')}>
                      {Array.from({ length: h.level === 3 ? 10 : h.level === 2 ? 5 : 2 }).map((_, i) => (
                        <Icon key={i} name="car" className={cx('h-3.5 w-3.5', h.level === 3 ? 'text-dusk' : h.level === 2 ? 'text-mauve' : 'text-clay')} />
                      ))}
                    </span>
                    <span className="truncate text-[14px] font-semibold text-mauve/70">
                      {h.veh.toLocaleString()} veh/hr · {h.note}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}