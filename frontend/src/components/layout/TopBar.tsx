import { useState } from 'react';
import { Icon, type IconName } from '../Icons';
import { cx, useClock } from '../ui';
import { useApp } from '../../state/appContext';

const TITLES: Record<string, { kicker: string; title: string }> = {
  dashboard: { kicker: '', title: 'Dashboard' },
  vehicles: { kicker: 'Investigation', title: 'Vehicle Search' },
  cameras: { kicker: 'Surveillance', title: 'Camera Network' },
  map: { kicker: 'Live', title: 'City Map' },
  alerts: { kicker: 'Response', title: 'Alert Center' },
  analytics: { kicker: 'Insight', title: 'Traffic Analytics' },
  settings: { kicker: 'Console', title: 'Settings' },
  upload: { kicker: 'Edge AI Ingestion', title: 'AI Vehicle Detection & Plate Registry' },
};

export function TopBar() {
  const app = useApp();
  const now = useClock();
  const t = TITLES[app.page] ?? TITLES.dashboard;
  const [q, setQ] = useState('');
  const initials = app.user?.name.split(' ').map((w) => w[0]).slice(0, 2).join('') ?? 'OP';

  return (
    <header className="sticky top-0 z-30 border-b border-clay/25 bg-cream/85 backdrop-blur-xl">
      <div className="flex h-[58px] items-center gap-4 px-5 sm:px-8">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <img
            src="/netra-logo.png"
            alt="NETRA"
            className="h-9 w-auto object-contain drop-shadow-sm hidden sm:block cursor-pointer transition-transform hover:scale-105"
            onClick={() => app.nav({ page: 'dashboard' })}
            title="NETRA Traffic Operations"
          />
          <div className="min-w-0">
            {t.kicker && <div className="text-[13px] font-bold uppercase tracking-[0.14em] text-mauve/70">{t.kicker}</div>}
            <h1 className="truncate font-display text-[22px] leading-tight text-ink">{t.title}</h1>
          </div>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); app.nav({ page: 'vehicles', query: q.trim() }); setQ(''); }}
          className="relative hidden w-[240px] items-center lg:flex xl:w-[300px]"
        >
          <Icon name="search" className="pointer-events-none absolute left-3 h-4 w-4 text-mauve/60" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search vehicles, plates…"
            aria-label="Global search"
            className="input-base h-10 pl-9 pr-9 text-[14px]"
          />
          <button type="submit" aria-label="Run search" className="absolute right-2 flex h-6 w-6 items-center justify-center rounded-md text-mauve/60 transition hover:bg-sand/40 hover:text-ink active:scale-90">
            <Icon name="arrowRight" className="h-3.5 w-3.5" />
          </button>
        </form>

        <div className="hidden items-center gap-2 rounded-xl border border-clay/30 bg-sand/45 px-3 py-2 md:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sand opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-sand" />
          </span>
          <span className="text-[14px] font-bold tracking-wide text-ink/80">
            {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
          </span>
          <span className="text-[14px] font-bold uppercase tracking-[0.14em] text-mauve/60">Live</span>
        </div>

        <button
          onClick={() => app.nav({ page: 'alerts', statusFilter: 'open' })}
          aria-label="Open alerts"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-mauve/75 transition hover:bg-sand/50 hover:text-ink active:scale-90"
        >
          <Icon name="bell" />
          {app.alerts.some((a) => a.status === 'open') && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-sand" />}
        </button>

        <button
          onClick={() => app.nav({ page: 'settings' })}
          className={cx(
            'flex items-center gap-2.5 rounded-xl border border-clay/30 py-1.5 pl-1.5 pr-3 transition-colors hover:border-mauve/35 hover:bg-sand/40',
            app.page === 'settings' && 'border-mauve/35 bg-sand/45'
          )}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sand text-[14px] font-bold text-ink">{initials}</span>
          <span className="hidden text-left leading-tight sm:block">
            <span className="block text-[14px] font-bold text-ink">{app.user?.name ?? 'Operator'}</span>
            <span className="block text-[14px] font-semibold text-mauve/70">{app.user?.role ?? 'Operator'}</span>
          </span>
          <Icon name="chevronDown" className="hidden h-3 w-3 text-mauve/60 sm:block" />
        </button>
      </div>
    </header>
  );
}

export type { IconName };