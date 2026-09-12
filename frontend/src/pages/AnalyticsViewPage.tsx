import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../state/appContext';
import { AreaChart } from '../components/Charts';
import { Icon } from '../components/Icons';
import { Badge, Bars, Btn, Card, Empty, Kicker, Tabs } from '../components/ui';
import { CAMERAS, CONGESTION, OCR_TREND, PEAKS, RANGES, UPTIME, VIOLATIONS, type RangeKey } from '../data/mock';

export function AnalyticsPage() {
  const app = useApp();
  const [rk, setRk] = useState<RangeKey>('24h');
  const [dist, setDist] = useState('All districts');
  const r = RANGES[rk];
  const districts = ['All districts', ...Array.from(new Set(CAMERAS.map((c) => c.district)))];
  const distCams = CAMERAS.filter((c) => dist === 'All districts' || c.district === dist);
  const camBars = useMemo(
    () => distCams.filter((c) => c.vehiclesToday > 0).sort((a, b) => b.vehiclesToday - a.vehiclesToday).slice(0, 6).map((c) => ({ label: c.name, value: c.vehiclesToday })),
    [dist]
  );
  const peak = PEAKS[rk];
  const violTotal = VIOLATIONS.reduce((s, v) => s + v.count, 0);

  useEffect(() => { if (camBars.length === 0) setDist('All districts'); }, [camBars.length]);

  return (
    <div className="page-shell fade-up">
      <div className="page-hero flex flex-wrap items-end justify-between gap-3 px-5 py-5 sm:px-6 sm:py-6">
        <div>
          <Kicker className="text-sand">Traffic analytics</Kicker>
          <p className="mt-1 font-display text-[34px] font-bold leading-tight text-cream">
            {r.kpis.vehicles.toLocaleString()} <span className="italic text-sand">vehicles analysed</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={dist} onChange={(e) => setDist(e.target.value)} className="input-base h-10 w-44 cursor-pointer text-[14px] font-semibold">
            {districts.map((d) => <option key={d}>{d}</option>)}
          </select>
          <Tabs
            items={[
              { id: '24h', label: '24H Hourly' },
              { id: '7d', label: '7D Weekly' },
              { id: '30d', label: '30D Monthly' },
              { id: '90d', label: '90D Macro' },
            ]}
            value={rk}
            onChange={(id) => setRk(id as RangeKey)}
          />
          <Btn size="sm" variant="soft" icon="download" onClick={() => app.toast('CSV export ready — demo snapshot')}>Export</Btn>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card tone="strong" className="page-hero p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <Kicker className="text-sand">Volume</Kicker>
              <div className="mt-1 font-display text-[22px] font-bold text-cream">Vehicles per hour</div>
            </div>
            <Badge tone="good">{r.kpis.d[0]} vs prev</Badge>
          </div>
          <div className="mt-4">
            <AreaChart
              data={r.volume}
              labels={r.labels}
              height={190}
              unit="veh/hr"
              showPeakMarker={true}
              color="#0284c7"
            />
          </div>
        </Card>
        <Card className="section-contrast p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <Kicker>Average speed</Kicker>
              <div className="mt-1 font-display text-[22px] font-bold text-ink">Network-wide · {app.settings.units === 'mph' ? 'mph' : 'km/h'}</div>
            </div>
            <Badge tone="good">{r.kpis.d[1]} vs prev</Badge>
          </div>
          <div className="mt-4">
            <AreaChart
              data={r.speed.map((sp) => (app.settings.units === 'mph' ? Math.round(sp * 0.621) : sp))}
              labels={r.labels}
              height={190}
              color="#f59e0b"
              unit={app.settings.units === 'mph' ? 'mph' : 'km/h'}
              showPeakMarker={false}
            />
          </div>
        </Card>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="section-contrast p-4 sm:p-5">
          <Kicker>Busiest cameras{dist !== 'All districts' ? ` · ${dist}` : ''}</Kicker>
          <div className="mt-4">
            {camBars.length === 0 ? <Empty icon="camera" title="No flow data" /> : (
              <Bars data={camBars} onClick={(label) => { const c = CAMERAS.find((x) => x.name === label); if (c) app.nav({ page: 'cameras', cameraId: c.id }); }} />
            )}
          </div>
        </Card>

        <Card className="section-contrast p-4 sm:p-5">
          <Kicker>Violations · 30 days</Kicker>
          <div className="mt-4">
            {VIOLATIONS.length === 0 ? (
              <div className="py-8 text-center text-[13px] font-semibold text-mauve/70">
                No violation enforcement events logged.
              </div>
            ) : (
              <Bars data={VIOLATIONS.map((v) => ({ label: v.type, value: v.count }))} onClick={(l) => app.toast(`${l}: ${VIOLATIONS.find((v) => v.type === l)?.count ?? 0} recorded events`)} />
            )}
          </div>
          <div className="mt-4 border-t border-clay/25 pt-3 text-[14px] font-semibold text-mauve/75">
            Total enforcement events: <span className="font-bold text-mauve">{violTotal.toLocaleString()}</span>
          </div>
        </Card>

        <Card className="section-contrast p-4 sm:p-5">
          <Kicker>Peak windows</Kicker>
          <div className="mt-3 flex flex-col gap-3">
            {peak.length === 0 ? (
              <div className="py-8 text-center text-[13px] font-semibold text-mauve/70">
                No peak surge windows recorded.
              </div>
            ) : (
              peak.map((p) => (
                <button key={p.window} onClick={() => app.toast(`${p.window} — ${p.vol.toLocaleString()} veh/hr`)} className="rounded-xl border border-clay/25 bg-sand/45 px-3.5 py-3 text-left transition-colors hover:border-dusk/35 hover:bg-cream">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-bold text-ink/90">{p.window}</span>
                    <span className="text-[14px] font-bold tabular-nums text-mauve">{p.vol.toLocaleString()}</span>
                  </div>
                  <div className="mt-0.5 text-[14px] font-semibold text-mauve/70">{p.note}</div>
                </button>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card className="section-contrast p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <Kicker>District congestion index</Kicker>
          <Btn size="sm" variant="ghost" icon="map" onClick={() => app.nav({ page: 'map' })}>View on map <Icon name="arrowRight" className="h-3.5 w-3.5" /></Btn>
        </div>
        <div className="mt-4">
          {CONGESTION.length === 0 ? (
            <div className="py-6 text-center text-[13px] font-semibold text-mauve/70">
              No district congestion bottlenecks recorded. Feeds nominal.
            </div>
          ) : (
            <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {CONGESTION.map((c) => (
                <button key={c.district} onClick={() => app.toast(`${c.district} — index ${c.index} (${c.delta === '0' ? 'stable' : `${c.delta} vs yesterday`})`)} className="group grid grid-cols-[130px_1fr_70px] items-center gap-3 text-left">
                  <span className="truncate text-[14px] font-semibold text-mauve/80 group-hover:text-ink">{c.district}</span>
                  <span className="h-2 overflow-hidden rounded-full bg-clay/20"><span className="block h-full rounded-full bg-dusk transition-all duration-500 group-hover:bg-mauve" style={{ width: `${c.index}%` }} /></span>
                  <span className="text-right text-[14px] font-semibold tabular-nums text-mauve/80">{c.index} <span className={c.delta.startsWith('+') ? 'text-mauve' : c.delta.startsWith('−') ? 'text-dusk' : 'text-mauve/55'}>{c.delta}</span></span>
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>
      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Card className="page-hero p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Kicker className="text-sand">Recognition quality</Kicker>
              <div className="mt-1 font-display text-[22px] font-bold text-cream">ANPR accuracy — last 12 cycles</div>
            </div>
            <span className="rounded-full border border-clay/35 bg-sand/45 px-3 py-1.5 text-[14px] font-bold uppercase tracking-[0.08em] text-mauve">
              {OCR_TREND.length > 0 ? `${OCR_TREND[OCR_TREND.length - 1].toFixed(1)}% current` : '0.0% current'}
            </span>
          </div>
          <div className="mt-4">
            <AreaChart
              data={OCR_TREND.length > 0 ? OCR_TREND : [0, 0, 0, 0, 0, 0]}
              labels={['Cycle -11', 'Cycle -10', 'Cycle -9', 'Cycle -8', 'Cycle -7', 'Cycle -6', 'Cycle -5', 'Cycle -4', 'Cycle -3', 'Cycle -2', 'Cycle -1', 'Current Cycle']}
              height={170}
              color="#0284c7"
              unit="%"
              showPeakMarker={true}
            />
          </div>
          <div className="mt-2 flex justify-between text-[14px] font-semibold tabular-nums text-sand/80">
            <span>−11</span>
            <span>−6</span>
            <span>now</span>
          </div>
        </Card>

        <Card className="section-contrast p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <Kicker>Camera uptime — 30 days</Kicker>
            <span className="text-[14px] font-semibold tabular-nums text-mauve/65">{CAMERAS.length} nodes</span>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {CAMERAS.map((c) => (
              <button key={c.id} onClick={() => app.nav({ page: 'cameras', cameraId: c.id })} className="group grid grid-cols-[64px_1fr_52px] items-center gap-3 text-left">
                <span className="text-[14px] font-semibold tabular-nums text-mauve/80 transition-colors group-hover:text-ink">{c.code}</span>
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