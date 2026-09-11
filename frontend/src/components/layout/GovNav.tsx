import { Icon, type IconName } from '../Icons';
import { cx } from '../ui';
import { useApp, type PageId } from '../../state/appContext';

/* Government-portal style primary nav bar — deep blue band with icon-over-label
   sections centered in the bar, divided by hairlines. Sits directly beneath the
   page-title/search row. */

const GOV_NAV: { id: PageId; icon: IconName; label: string; externalUrl?: string }[] = [
  { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
  { id: 'vehicles', icon: 'car', label: 'Vehicle Search' },
  { id: 'cameras', icon: 'camera', label: 'Cameras' },
  { id: 'map', icon: 'map', label: 'City Map' },
  { id: 'alerts', icon: 'bell', label: 'Alerts' },
  { id: 'analytics', icon: 'chart', label: 'Analytics' },
  { id: 'dashboard' as PageId, icon: 'upload', label: 'AI Detection Portal (Port 5174)', externalUrl: 'http://localhost:5174' },
];

export function GovNav() {
  const app = useApp();
  const openAlerts = app.alerts.filter((a) => a.status === 'open').length;

  return (
    <div className="bg-gradient-to-b from-[#1D5FA8] to-[#0B3D7A] shadow-[0_6px_18px_rgba(0,0,0,0.22)]">
      <div className="mx-auto flex max-w-[1560px] items-center justify-between px-2 sm:px-6">
        <div
          onClick={() => app.nav({ page: 'dashboard' })}
          className="flex items-center gap-2.5 py-1.5 pl-1 pr-4 border-r border-cream/20 cursor-pointer hover:opacity-90 transition-opacity select-none"
          title="NETRA — National Surveillance & Traffic Operations"
        >
          <img src="/netra-logo.png" alt="NETRA" className="h-8 w-auto object-contain filter drop-shadow" />
          <span className="font-display text-[14px] uppercase tracking-[0.2em] font-bold text-white hidden md:inline">NETRA</span>
        </div>
        {/* Icon-over-label sections with hairline dividers */}
        <nav className="flex min-w-0 items-stretch overflow-x-auto justify-center flex-1" aria-label="Primary">
          {GOV_NAV.map((item) => {
            const active = !item.externalUrl && app.page === item.id;
            return (
              <button
                key={item.label}
                onClick={() => (item.externalUrl ? window.open(item.externalUrl, '_blank') : app.nav({ page: item.id }))}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
                className={cx(
                  'relative flex flex-col items-center justify-center gap-1 border-l border-cream/15 px-5 py-2.5 transition-colors first:border-l-0',
                  active ? 'bg-white/12' : 'hover:bg-white/8'
                )}
              >
                <Icon name={item.icon} className="h-[19px] w-[19px] text-cream" strokeWidth={1.5} />
                <span className="whitespace-nowrap font-display text-[13.5px] tracking-wide text-cream">{item.label}</span>
                {item.id === 'alerts' && openAlerts > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C0392B] px-1 text-[10px] font-bold text-white">
                    {openAlerts}
                  </span>
                )}
                {active && <span className="absolute inset-x-4 bottom-0 h-[3px] rounded-t bg-[#D9E4F2]" />}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
