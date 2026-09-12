import { useEffect, useState } from 'react';
import { useApp } from '../state/appContext';
import { CameraFeed } from '../components/CameraFeed';
import { Icon } from '../components/Icons';
import { getDetectionPortalUrl } from '../utils/navigation';
import { Badge, Btn, Card, Empty, Kicker, Tabs, cx } from '../components/ui';
import { CAMERAS, CAMERA_GROUPS, UPTIME, VEHICLES, camById, type CameraStatus } from '../data/mock';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'online', label: 'Online' },
  { id: 'degraded', label: 'Degraded' },
  { id: 'offline', label: 'Offline' },
];

const statusBadge = (s: CameraStatus): 'good' | 'medium' | 'critical' =>
  s === 'online' ? 'good' : s === 'degraded' ? 'medium' : 'critical';

const SCOPE_WINDOWS = [
  { id: '5m', label: '5m Live' },
  { id: '30m', label: '30m Scope' },
  { id: '60m', label: '60m Flow' },
  { id: '8h', label: '8h Shift' },
  { id: '24h', label: '24h Total' },
];

export function CamerasPage() {
  const app = useApp();
  const [filter, setFilter] = useState('all');
  const [scopeWindow, setScopeWindow] = useState('30m');
  const [selId, setSelId] = useState('c1');
  const [playing, setPlaying] = useState(true);
  const [showVeh, setShowVeh] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const cam = camById(selId) ?? CAMERAS[0];
  const list = CAMERAS.filter((c) => filter === 'all' || c.status === filter);
  const near = app.vehicles.filter((v) => v.lastCam === cam.code || v.lastCam === cam.id || v.journey.some((j) => j.cam === cam.code || j.cam === cam.id)).slice(0, 6);

  useEffect(() => {
    if (app.target.cameraId) setSelId(app.target.cameraId);
  }, [app.navSeq, app.target.cameraId]);

  const offline = CAMERAS.filter((c) => c.status === 'offline').length;

  return (
    <div className="page-shell fade-up">
      <div className="page-hero flex flex-wrap items-end justify-between gap-3 px-5 py-5 sm:px-6 sm:py-6">
        <div>
          <Kicker className="text-sand">Camera Network Operations</Kicker>
          <p className="mt-1 font-display text-[34px] font-bold leading-tight text-cream">
            {CAMERAS.length - offline} of {CAMERAS.length} feeds <span className="italic text-sand">streaming</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Tabs items={SCOPE_WINDOWS} value={scopeWindow} onChange={setScopeWindow} />
          <Tabs items={FILTERS} value={filter} onChange={setFilter} />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[300px_1fr]">
        {/* Roster */}
        <Card tone="strong" className="section-contrast flex flex-col p-3 sm:p-4">
          <div className="flex items-center justify-between px-1 pb-2">
            <Kicker>Feeds</Kicker>
            <span className="text-[14px] font-semibold tabular-nums text-mauve/65">{list.length}</span>
          </div>
          <div className="flex max-h-[520px] flex-col gap-1 overflow-y-auto pr-1">
            {list.length === 0 && <Empty icon="camera" title="No cameras in this state" />}
            {list.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelId(c.id)}
                className={cx(
                  'group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-150 active:scale-[0.98]',
                  c.id === cam.id ? 'border-dusk/40 bg-sand/50' : 'border-transparent hover:border-clay/25 hover:bg-cream/85'
                )}
              >
                <span className={cx('h-1.5 w-1.5 shrink-0 rounded-full', c.status === 'online' ? 'bg-sand' : c.status === 'degraded' ? 'bg-dusk' : 'bg-mauve')} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-semibold text-ink/90">{c.name}</span>
                  <span className="text-[14px] font-semibold text-mauve/70">{c.code} · {c.district}</span>
                </span>
                <Icon name="chevronRight" className="h-3.5 w-3.5 text-dusk/70 transition group-hover:text-mauve" />
              </button>
            ))}
          </div>
        </Card>

        {/* Viewer */}
        <div className="flex flex-col gap-4">
          <Card className="page-hero p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-[22px] font-bold text-cream">{cam.name}</h2>
                  <Badge tone={statusBadge(cam.status)}>{cam.status}</Badge>
                </div>
                <div className="mt-1 text-[14px] font-semibold text-sand/85">{cam.code} · {cam.district} · {cam.heading}</div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Btn size="sm" variant={playing ? 'soft' : 'solid'} icon={playing ? 'pause' : 'play'} onClick={() => setPlaying(!playing)}>
                  {playing ? 'Pause feed' : 'Resume feed'}
                </Btn>
                <Btn size="sm" variant="soft" icon="car" onClick={() => setShowVeh(!showVeh)}>Plates</Btn>
                <Btn size="sm" variant="soft" icon="layers" onClick={() => setShowGrid(!showGrid)}>Grid</Btn>
                <Btn size="sm" variant="soft" icon="map" onClick={() => app.nav({ page: 'map', cameraId: cam.id })}>Locate</Btn>
              </div>
            </div>

            <CameraFeed cam={cam} playing={playing} showGrid={showGrid} className="mt-4 aspect-video w-full" />

            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-cream/[0.07] pt-4 sm:grid-cols-4">
              {[
                ['Resolution', cam.res],
                ['Frame rate', cam.fps + ' fps'],
                ['Vehicles today', cam.vehiclesToday.toLocaleString()],
                ['Avg speed', app.fmtSpeed(cam.avgSpeed)],
              ].map(([k, v]) => (
                <div key={k}>
                  <Kicker className="text-sand">{k}</Kicker>
                  <div className="mt-1 text-[14px] font-semibold text-cream/90">{v}</div>
                </div>
              ))}
            </div>
          </Card>

          {showVeh && (
            <Card className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <Kicker>Plates captured — {cam.code}</Kicker>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => app.nav({ page: 'upload' })}
                    className="flex items-center gap-1.5 rounded-lg border border-blue-600/30 bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-800 hover:bg-blue-500/20 transition-all cursor-pointer"
                  >
                    <Icon name="upload" className="h-3 w-3 text-blue-600" />
                    <span>Upload & Ingest</span>
                    <Icon name="arrowRight" className="h-2.5 w-2.5" />
                  </button>
                  <Badge tone="neutral">last 30 min</Badge>
                </div>
              </div>
              {near.length === 0 ? (
                <Empty icon="car" title="No watchlist vehicles at this camera" sub="Regular traffic continues to be captured and classified." />
              ) : (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {near.map((v) => (
<button key={v.id} onClick={() => app.nav({ page: 'vehicles', vehicleId: v.id })} className="hit justify-between rounded-xl border border-clay/25 pr-3 hover:border-dusk/35 hover:bg-cream/90">
                      <span className="flex items-center gap-3">
                        <span className="font-display text-[15px] tracking-wide text-ink">{v.plate}</span>
                        <Badge tone={v.status === 'flagged' ? 'critical' : v.status === 'watchlist' ? 'medium' : 'good'}>{v.status}</Badge>
                      </span>
                      <span className="flex items-center gap-2 text-[14px] font-semibold tabular-nums text-mauve/75">
                        {app.fmtSpeed(v.speed)} <Icon name="arrowUpRight" className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="section-contrast p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <Kicker>Corridor groups</Kicker>
            <span className="text-[14px] font-semibold tabular-nums text-mauve/65">tap to focus</span>
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {CAMERA_GROUPS.map((g) => (
              <button
                key={g.name}
                onClick={() => setSelId(g.ids[0])}
                className="group flex items-center justify-between rounded-xl border border-clay/25 bg-cream/80 px-3.5 py-3 text-left transition-all duration-150 hover:border-dusk/35 hover:bg-cream active:scale-[0.99]"
              >
                <span className="min-w-0">
                  <span className="block text-[14px] font-semibold text-ink/90">{g.name}</span>
                  <span className="text-[14px] font-semibold text-mauve/70">{g.ids.length} cameras · {g.ids.map((id) => camById(id)?.code).filter(Boolean).join(', ')}</span>
                </span>
                <span className="shrink-0 rounded-lg border border-clay/30 px-3 py-1.5 text-[14px] font-bold uppercase tracking-[0.08em] text-mauve/75 transition-colors group-hover:border-dusk/40 group-hover:text-ink">Focus</span>
              </button>
            ))}
          </div>
        </Card>

        <Card className="section-contrast p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <Kicker>Node uptime — 30 days</Kicker>
            <span className="text-[14px] font-semibold tabular-nums text-mauve/65">tap to open feed</span>
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {CAMERAS.map((c) => (
              <button key={c.id} onClick={() => setSelId(c.id)} className="group grid grid-cols-[64px_1fr_52px] items-center gap-3 text-left">
                <span className="text-[14px] font-semibold tabular-nums text-mauve/75 transition-colors group-hover:text-ink">{c.code}</span>
                <span className="h-1.5 overflow-hidden rounded-full bg-clay/20">
                  <span
                    className="block h-full rounded-full transition-all duration-500 group-hover:opacity-80"
                    style={{ width: `${UPTIME[c.id] ?? 0}%`, background: (UPTIME[c.id] ?? 0) > 97 ? 'rgba(194,207,223,.85)' : (UPTIME[c.id] ?? 0) > 90 ? 'rgba(61,110,165,.7)' : 'rgba(61,110,165,.45)' }}
                  />
                </span>
                <span className="text-right text-[14px] font-semibold tabular-nums text-mauve/80">{(UPTIME[c.id] ?? 0).toFixed(1)}%</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}