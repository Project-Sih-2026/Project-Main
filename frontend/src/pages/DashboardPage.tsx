import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../state/appContext';
import { AreaChart } from '../components/Charts';
import { CameraFeed } from '../components/CameraFeed';
import { Icon, type IconName } from '../components/Icons';
import { Badge, Btn, Card, Kicker, Select, Tabs, cx, useClock } from '../components/ui';
import { CAMERAS, HOTSPOTS, RANGES, VEHICLES, timeAgo, type RangeKey } from '../data/mock';

const KPIS = (rk: RangeKey, openAlerts: number) => {
  const r = RANGES[rk];
  const online = CAMERAS.filter((c) => c.status === 'online').length;
  return [
    { label: 'Vehicles tracked', v: r.kpis.vehicles.toLocaleString(), d: r.kpis.d[0], icon: 'car' as IconName, light: false },
    { label: 'Cameras online', v: `${online} / ${CAMERAS.length}`, d: '+2 restored', icon: 'camera' as IconName, light: false },
    { label: 'Active alerts', v: String(openAlerts), d: 'live — triage now', icon: 'bell' as IconName, light: true },
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
  const [district, setDistrict] = useState('All districts');
  const [camId, setCamId] = useState('c1');
  const r = RANGES[rk];
  const districts = ['All districts', ...Array.from(new Set(CAMERAS.map((c) => c.district)))];
  const visibleCams = CAMERAS.filter((c) => district === 'All districts' || c.district === district);
  const cam = CAMERAS.find((c) => c.id === camId) ?? visibleCams[0] ?? CAMERAS[0];
  const openAlerts = useMemo(() => app.alerts.filter((a) => a.status === 'open').slice(0, 5), [app.alerts]);
  const tracked = VEHICLES.filter((v) => v.status !== 'clear');
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
        {KPIS(rk, openCount).map((k) => (
          <Kpi key={k.label} {...k} />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <Card tone="strong" className="section-contrast p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Kicker>Network flow</Kicker>
              <div className="mt-1 font-display text-[22px] text-ink">Vehicles per hour · all corridors</div>
            </div>
            <Tabs
              items={[{ id: '24h', label: '24H' }, { id: '7d', label: '7D' }, { id: '30d', label: '30D' }]}
              value={rk}
              onChange={(id) => setRk(id as RangeKey)}
            />
          </div>
          <div className="mt-4">
            <AreaChart data={r.volume} height={210} color="#C7A9A3" />
          </div>
          <div className="mt-2 flex justify-between text-[14px] font-semibold tabular-nums text-mauve/70">
            <span>{r.labels[0]}</span>
            <span>{r.labels[Math.floor(r.labels.length / 2)]}</span>
            <span>{r.labels[r.labels.length - 1]}</span>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-clay/25 pt-4 text-[14px] font-semibold text-mauve/75">
            <span className="flex items-center gap-1.5"><Icon name="clock" className="h-3.5 w-3.5 text-dusk" /> Peak {Math.max(...r.volume).toLocaleString()} veh/hr</span>
            <span className="flex items-center gap-1.5"><Icon name="activity" className="h-3.5 w-3.5 text-dusk" /> Avg {Math.round(r.volume.reduce((a, b) => a + b, 0) / r.volume.length).toLocaleString()} veh/hr</span>
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
      <div className="grid gap-4 xl:grid-cols-3">
        <Card tone="quiet" className="section-contrast p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <Kicker>Tracked now</Kicker>
            <Btn variant="ghost" size="sm" onClick={() => app.nav({ page: 'vehicles' })}>Vehicle search <Icon name="arrowRight" className="h-3.5 w-3.5" /></Btn>
          </div>
          <div className="mt-3 flex flex-col gap-1">
            {tracked.map((v) => (
              <button key={v.id} onClick={() => app.nav({ page: 'vehicles', vehicleId: v.id })} className="hit">
                <span className="w-[74px] font-display text-[14px] tracking-wide text-ink">{v.plate}</span>
                <Badge tone={v.status === 'flagged' ? 'critical' : 'medium'}>{v.status}</Badge>
                <span className="ml-auto text-[14px] font-semibold tabular-nums text-mauve/75">{app.fmtSpeed(v.speed)}</span>
                <Icon name="locate" className="h-3.5 w-3.5 text-dusk/70" />
              </button>
            ))}
          </div>
        </Card>

        <Card tone="quiet" className="section-contrast p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <Kicker>Live alerts</Kicker>
            <Btn variant="ghost" size="sm" onClick={() => app.nav({ page: 'alerts', statusFilter: 'open' })}>Alert center <Icon name="arrowRight" className="h-3.5 w-3.5" /></Btn>
          </div>
          <div className="mt-3 flex flex-col gap-1">
            {openAlerts.map((a) => (
              <button key={a.id} onClick={() => app.nav({ page: 'alerts', alertId: a.id, statusFilter: 'open' })} className="hit items-start">
                <span className={cx('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', a.severity === 'critical' ? 'bg-sand' : a.severity === 'high' ? 'bg-clay' : 'bg-dusk')} />
                <span className="flex-1">
                  <span className="block truncate text-[13.5px] font-semibold text-ink/90">{a.title}</span>
                  <span className="text-[14px] font-semibold text-mauve/70">{a.zone} · {timeAgo(a.minsAgo)}</span>
                </span>
                <Icon name="chevronRight" className="mt-1 h-3.5 w-3.5 text-dusk/70" />
              </button>
            ))}
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
            {HOTSPOTS.map((h) => (
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
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}