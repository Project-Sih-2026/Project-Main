import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../state/appContext';
import { Icon } from '../components/Icons';
import { Badge, Btn, Card, Empty, Input, Kicker, Select, cx } from '../components/ui';
import { VEHICLES, camById, type Vehicle, type VehicleStatus } from '../data/mock';

const TYPES = ['All types', 'Sedan', 'SUV', 'Truck', 'Bus', 'Two-wheeler', 'Van'];
const STATUSES = ['All statuses', 'clear', 'watchlist', 'flagged'];
const QUICK = ['kx', 'truck', 'stolen', 'harbor'];

const STATUS_BADGE = (s: VehicleStatus): 'critical' | 'medium' | 'good' =>
  s === 'flagged' ? 'critical' : s === 'watchlist' ? 'medium' : 'good';

function ResultRow({ v, active, onClick }: { v: Vehicle; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        'group w-full rounded-xl border px-3.5 py-3 text-left transition-all duration-150 active:scale-[0.99]',
        active ? 'border-dusk/40 bg-sand/50' : 'border-transparent hover:border-clay/25 hover:bg-cream/85'
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-display text-[17px] tracking-wide text-ink">{v.plate}</span>
        <Badge tone={STATUS_BADGE(v.status)}>{v.status}</Badge>
      </div>
      <div className="mt-1 flex items-center gap-2 text-[14px] font-semibold text-mauve/80">
        <span>{v.make} {v.model}</span>
        <span className="text-clay/40">·</span>
        <span>{v.type}</span>
        <span className="text-clay/40">·</span>
        <span className="tabular-nums">{v.speed} km/h</span>
        <span className="ml-auto text-[14px] font-semibold text-dusk/70">{v.lastSeen}</span>
      </div>
    </button>
  );
}

export function VehicleSearchPage() {
  const app = useApp();
  const navKey = `${app.navSeq}:${app.target.vehicleId ?? ''}`;
  const [q, setQ] = useState('');
  const [type, setType] = useState(TYPES[0]);
  const [status, setStatus] = useState(STATUSES[0]);

  useEffect(() => {
    if (app.target.query !== undefined) setQ(app.target.query);
  }, [app.navSeq, app.target.query]);
  const [selId, setSelId] = useState<string | null>(null);

  useEffect(() => {
    const t = app.target.vehicleId;
    if (t) {
      setQ('');
      setType(TYPES[0]);
      setStatus(STATUSES[0]);
      setSelId(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navKey]);

  const results = useMemo(
    () =>
      VEHICLES.filter((v) => {
        const hay = `${v.plate} ${v.make} ${v.model} ${v.color} ${v.type} ${v.owner}`.toLowerCase();
        return (
          (q.trim() === '' || hay.includes(q.trim().toLowerCase())) &&
          (type === TYPES[0] || v.type === type) &&
          (status === STATUSES[0] || v.status === status)
        );
      }),
    [q, type, status]
  );
  const sel = VEHICLES.find((v) => v.id === selId) ?? results[0];

  return (
    <div className="page-shell fade-up">
      <Card tone="strong" className="page-hero p-4 sm:p-5">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-col gap-3 lg:flex-row lg:items-center"
        >
          <div className="relative flex-1">
            <Icon name="search" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sand/75" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search plate, make, model, color or owner…" className="h-11 pl-10" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={type} onChange={setType} options={TYPES} ariaLabel="Vehicle type" className="w-[130px]" />
            <Select value={status} onChange={setStatus} options={STATUSES} ariaLabel="Vehicle status" className="w-[140px]" />
            <Btn
              variant="ghost"
              className="text-cream/90 hover:bg-cream/10 hover:text-cream"
              onClick={() => { setQ(''); setType(TYPES[0]); setStatus(STATUSES[0]); }}
              disabled={q === '' && type === TYPES[0] && status === STATUSES[0]}
            >
              Clear
            </Btn>
          </div>
        </form>
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-sand/20 pt-3">
          <Kicker className="text-sand">Try</Kicker>
          {QUICK.map((s) => (
            <button
              key={s}
              onClick={() => setQ(s)}
              className="rounded-full border border-sand/20 px-3 py-1.5 text-[14px] font-bold text-sand transition hover:border-clay/50 hover:bg-cream/10 hover:text-cream active:scale-95"
            >
              {s}
            </button>
          ))}
          <span className="ml-auto text-[14px] font-semibold tabular-nums text-sand/85">
            {results.length} of {VEHICLES.length} registered vehicles
          </span>
        </div>
      </Card>
      <div className="grid gap-4 xl:grid-cols-[1fr_1.35fr]">
        {/* Results */}
        <Card className="section-contrast flex flex-col p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <Kicker>Results</Kicker>
            <span className="text-[14px] font-semibold tabular-nums text-mauve/70">{results.length} matches</span>
          </div>
          <div className="mt-3 flex max-h-[560px] flex-col gap-1 overflow-y-auto pr-1">
            {results.length === 0 && <Empty title="No vehicles match" sub="Adjust the query, type or status filters to widen the search." />}
            {results.map((v) => (
              <ResultRow key={v.id} v={v} active={sel?.id === v.id} onClick={() => setSelId(v.id)} />
            ))}
          </div>
        </Card>

        {/* Detail */}
        {sel ? (
          <div className="flex flex-col gap-4">
            <Card className="section-contrast p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-display text-[30px] font-bold leading-none tracking-wide text-ink">{sel.plate}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge tone={STATUS_BADGE(sel.status)}>{sel.status}</Badge>
                    <Badge tone="neutral">{sel.type}</Badge>
                    <span className="text-[14px] font-semibold text-mauve/75">{sel.make} {sel.model} · {sel.color}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Btn size="sm" variant={sel.status === 'watchlist' ? 'solid' : 'soft'} icon={sel.status === 'watchlist' ? 'check' : 'plus'} onClick={() => app.toggleWatch(sel.id)}>
                    {sel.status === 'watchlist' ? 'On watchlist' : 'Watchlist'}
                  </Btn>
                  <Btn size="sm" variant="soft" icon="map" onClick={() => app.nav({ page: 'map', mapVehicle: sel.id })}>Track on map</Btn>
                </div>
              </div>

              {sel.note && (
                <div className="mt-4 rounded-xl border border-clay/30 bg-cream/85 px-3.5 py-3 text-[14px] font-semibold leading-relaxed text-ink/90">
                  <span className="mb-1 block text-[14px] font-bold uppercase tracking-[0.12em] text-mauve">Case note</span>
                  {sel.note}
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-clay/25 pt-4 sm:grid-cols-3">
                {[
                  ['Owner', sel.owner],
                  ['License', sel.license],
                  ['Distance today', sel.kmToday + ' km'],
                  ['Last camera', sel.lastCam],
                  ['Last seen', sel.lastSeen],
                  ['Current speed', sel.speed + ' km/h'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <Kicker>{k}</Kicker>
                    <div className="mt-1 text-[14px] font-semibold text-ink/90">{v}</div>
                  </div>
                ))}
              </div>

              {sel.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {sel.tags.map((t) => (
                    <span key={t} className="rounded-full bg-sand/55 px-3 py-1.5 text-[14px] font-bold text-mauve">#{t}</span>
                  ))}
                </div>
              )}
            </Card>
              <Card className="section-contrast p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <Kicker>Journey timeline — today</Kicker>
                  <Badge tone="neutral">{sel.journey.length} sightings</Badge>
                </div>
                <div className="mt-4 flex flex-col">
                  {sel.journey.map((j, i) => {
                    const c = camById(j.cam);
                    return (
                      <div key={i} className="relative flex gap-4 pb-5 last:pb-0">
                        {i < sel.journey.length - 1 && <span className="absolute bottom-0 left-[5px] top-3 w-px bg-clay/35" />}
                        <span className="relative mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full border-2 border-dusk/75 bg-cream" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <span className="text-[14px] font-semibold text-ink/90">{c?.name ?? j.cam}</span>
                            <span className="text-[14px] font-semibold tabular-nums text-mauve/65">{j.t}</span>
                          </div>
                          <div className="mt-0.5 text-[14px] font-semibold text-mauve/75">
                            {j.loc} · {j.dir} · <span className="tabular-nums">{app.fmtSpeed(j.speed)}</span>
                          </div>
                          {j.note && <div className="mt-1.5 rounded-lg bg-sand/45 px-2.5 py-1.5 text-[14px] font-semibold text-ink/85">{j.note}</div>}
                          {c && (
                            <div className="mt-2 flex gap-2">
                              <Btn size="sm" variant="ghost" icon="camera" onClick={() => app.nav({ page: 'cameras', cameraId: c.id })}>Camera feed</Btn>
                              <Btn size="sm" variant="ghost" icon="map" onClick={() => app.nav({ page: 'map', cameraId: c.id, mapVehicle: sel.id })}>On map</Btn>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
          </div>
        ) : (
          <Card><Empty title="Select a vehicle" sub="Choose a result on the left to open the full journey timeline." /></Card>
        )}
      </div>
    </div>
  );
}