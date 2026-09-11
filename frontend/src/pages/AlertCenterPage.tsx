import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../state/appContext';
import { Icon } from '../components/Icons';
import { Badge, Btn, Card, Empty, Kicker, Tabs, cx, sevTone, statusTone } from '../components/ui';
import { HOTSPOTS, camById, timeAgo, vehById, type AlertStatus, type Severity } from '../data/mock';

const SEV_FILTERS = ['all', 'critical', 'high', 'medium', 'low'];
const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'acknowledged', label: 'Acknowledged' },
  { id: 'resolved', label: 'Resolved' },
];
const SEV_DOT: Record<Severity, string> = { critical: 'bg-ink', high: 'bg-mauve', medium: 'bg-dusk', low: 'bg-clay' };

const ALERT_TIME_WINDOWS = [
  { id: '1h', label: '1h Active' },
  { id: '8h', label: '8h Shift' },
  { id: '24h', label: '24h Day' },
  { id: '7d', label: '7d Audit' },
];

export function AlertsPage() {
  const app = useApp();
  const [sev, setSev] = useState<string>('all');
  const [status, setStatus] = useState<AlertStatus | 'all'>('all');
  const [timeScope, setTimeScope] = useState<string>('24h');
  const [q, setQ] = useState('');
  const [type, setType] = useState('All types');
  const [selId, setSelId] = useState<string | null>(null);

  const types = useMemo(() => ['All types', ...Array.from(new Set(app.alerts.map((a) => a.type)))], [app.alerts]);

  useEffect(() => {
    const t = app.target;
    if (t.statusFilter) setStatus(t.statusFilter);
    if (t.alertId) setSelId(t.alertId);
  }, [app.navSeq, app.target]);

  const getVeh = (id: string) =>
    app.vehicles.find((v) => v.id === id || v.plate.replace(/[^A-Z0-9]/gi, '') === id.replace(/[^A-Z0-9]/gi, '')) || vehById(id);

  const rows = useMemo(
    () =>
      app.alerts.filter((a) => {
        if (sev !== 'all' && a.severity !== sev) return false;
        if (status !== 'all' && a.status !== status) return false;
        if (type !== 'All types' && a.type !== type) return false;
        if (timeScope === '1h' && a.minsAgo > 60) return false;
        if (timeScope === '8h' && a.minsAgo > 480) return false;
        if (timeScope === '24h' && a.minsAgo > 1440) return false;
        if (q.trim()) {
          const v = getVeh(a.vehicleId);
          const c = camById(a.cameraId);
          const hay = `${a.title} ${a.zone} ${v?.plate ?? ''} ${c?.name ?? ''} ${c?.code ?? ''}`.toLowerCase();
          if (!hay.includes(q.trim().toLowerCase())) return false;
        }
        return true;
      }),
    [app.alerts, app.vehicles, sev, status, type, timeScope, q]
  );

  const sel = app.alerts.find((a) => a.id === selId);
  const selVeh = sel ? getVeh(sel.vehicleId) : undefined;
  const selCam = sel ? camById(sel.cameraId) : undefined;
  const counts = (s: string) => app.alerts.filter((a) => a.status === s).length;

  return (
    <div className="page-shell fade-up">
      <div className="page-hero flex flex-wrap items-end justify-between gap-3 px-5 py-5 sm:px-6 sm:py-6">
        <div>
          <Kicker className="text-sand">Incident & Alert Center</Kicker>
          <p className="mt-1 font-display text-[34px] font-bold leading-tight text-cream">
            {counts('open')} open <span className="italic text-sand">· {counts('acknowledged')} acknowledged</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Tabs items={ALERT_TIME_WINDOWS} value={timeScope} onChange={setTimeScope} />
          <Tabs items={STATUS_FILTERS} value={status} onChange={(id) => setStatus(id as AlertStatus | 'all')} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Icon name="search" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mauve/60" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search alerts, plates, cameras…" className="input-base h-10 pl-9 text-[14px]" />
        </div>
        {SEV_FILTERS.map((s) => (
          <button key={s} onClick={() => setSev(s)} className={cx('rounded-full border px-3 py-1.5 text-[14px] font-bold capitalize transition-all duration-150 active:scale-95', sev === s ? 'border-dusk/50 bg-sand/55 text-mauve' : 'border-clay/30 text-mauve/70 hover:border-dusk/35 hover:bg-cream hover:text-ink')}>
            {s}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <select value={type} onChange={(e) => setType(e.target.value)} className="input-base h-9 w-40 cursor-pointer text-[13px]">
            {types.map((t) => <option key={t}>{t}</option>)}
          </select>
          <Btn size="sm" variant="ghost" icon="refresh" onClick={() => { setSev('all'); setStatus('all'); setQ(''); setType('All types'); }}>Reset</Btn>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.25fr_1fr]">
        <Card tone="strong" className="section-contrast p-2 sm:p-3">
          <div className="flex flex-col">
            {rows.length === 0 && <Empty icon="bell" title="No alerts match these filters" sub="Try clearing the search or severity filters." />}
            {rows.map((a) => {
              const v = getVeh(a.vehicleId);
              const c = camById(a.cameraId);
              return (
                <button key={a.id} onClick={() => setSelId(a.id)} className={cx('flex items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors duration-150', selId === a.id ? 'bg-sand/55' : 'hover:bg-cream/90')}>
                  <span className={cx('mt-1.5 h-2 w-2 shrink-0 rounded-full', SEV_DOT[a.severity])} />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-[14px] font-bold text-ink/90">{a.title}</span>
                      <Badge tone={sevTone(a.severity)}>{a.severity}</Badge>
                      {a.status !== 'open' && <Badge tone={statusTone(a.status)}>{a.status}</Badge>}
                    </span>
                    <span className="mt-1 block text-[14px] font-semibold text-mauve/70">
                      {a.type} · {c?.name} · {v?.plate} · {timeAgo(a.minsAgo)}
                    </span>
                  </span>
                  <Icon name="chevronRight" className="mt-1.5 h-4 w-4 shrink-0 text-dusk/70" />
                </button>
              );
            })}
          </div>
        </Card>
        {sel ? (
          <Card className="page-hero h-fit p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Kicker className="text-sand">{sel.type} · {sel.id.toUpperCase()}</Kicker>
                <div className="mt-1.5 font-display text-[22px] font-bold leading-snug text-cream">{sel.title}</div>
              </div>
              <Badge tone={sevTone(sel.severity)}>{sel.severity}</Badge>
            </div>
            <p className="mt-3 text-[14px] font-semibold leading-relaxed text-sand/90">{sel.detail}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-[14px]">
              <div className="rounded-xl border border-clay/25 bg-cream/80 p-3">
                <Kicker>Vehicle</Kicker>
                <div className="mt-1 font-display text-[16px] text-ink">{selVeh?.plate}</div>
                <div className="text-[14px] font-semibold text-mauve/70">{selVeh?.make} {selVeh?.model} · {selVeh?.status}</div>
                <Btn size="sm" variant="ghost" className="mt-2 px-0" icon="arrowRight" onClick={() => app.nav({ page: 'vehicles', vehicleId: sel.vehicleId })}>Open dossier</Btn>
              </div>
              <div className="rounded-xl border border-clay/25 bg-cream/80 p-3">
                <Kicker>Camera</Kicker>
                <div className="mt-1 font-display text-[16px] text-ink">{selCam?.code}</div>
                <div className="text-[14px] font-semibold text-mauve/70">{selCam?.name} · {sel.zone}</div>
                <Btn size="sm" variant="ghost" className="mt-2 px-0" icon="arrowRight" onClick={() => app.nav({ page: 'cameras', cameraId: sel.cameraId })}>View feed</Btn>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Btn size="sm" variant="solid" icon="map" onClick={() => app.nav({ page: 'map', cameraId: sel.cameraId, mapVehicle: sel.vehicleId })}>Locate on map</Btn>
              {sel.status === 'open' && <Btn size="sm" variant="soft" icon="check" onClick={() => app.setAlertStatus(sel.id, 'acknowledged')}>Acknowledge</Btn>}
              {sel.status !== 'resolved' && <Btn size="sm" variant="outline" icon="shield" onClick={() => app.setAlertStatus(sel.id, 'resolved')}>Resolve</Btn>}
              {sel.status === 'resolved' && <Btn size="sm" variant="soft" icon="refresh" onClick={() => app.setAlertStatus(sel.id, 'open')}>Reopen</Btn>}
            </div>
          </Card>
        ) : (
          <Card><Empty icon="bell" title="Select an alert" sub="Choose an alert on the left to triage it." /></Card>
        )}
      </div>
      <Card className="section-contrast p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <Kicker>Hotspot zones under watch</Kicker>
          <Btn size="sm" variant="ghost" onClick={() => app.nav({ page: 'map' })}>City map</Btn>
        </div>
        <div className="mt-4">
          {HOTSPOTS.length === 0 ? (
            <div className="py-6 text-center text-[13px] font-semibold text-mauve/70">
              No active hotspot incidents or watch zones. All sectors nominal.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {HOTSPOTS.map((h) => (
                <div key={h.name} className="rounded-xl border border-clay/25 bg-cream/80 px-3.5 py-3 transition-colors hover:border-dusk/35">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[13.5px] font-semibold text-ink/90">{h.name}</span>
                    <span className="flex shrink-0 gap-0.5" aria-label={`Congestion level ${h.level} of 3`}>
                      {[1, 2, 3].map((i) => (
                        <span key={i} className="h-1.5 w-1.5 rounded-full" style={{ background: i <= h.level ? 'rgba(51,81,126,.9)' : 'rgba(194,207,223,.3)' }} />
                      ))}
                    </span>
                  </div>
                  <div className="mt-1 text-[14px] font-semibold tabular-nums text-mauve/75">{h.veh.toLocaleString()} veh/hr</div>
                  <div className="mt-1.5 text-[14px] font-semibold leading-snug text-mauve/70">{h.note}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}