import { Icon, type IconName } from '../Icons';
import { cx } from '../ui';
import { useApp, type PageId } from '../../state/appContext';

const NAV: { id: PageId; icon: IconName; label: string; externalUrl?: string }[] = [
  { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
  { id: 'vehicles', icon: 'car', label: 'Vehicle Search' },
  { id: 'cameras', icon: 'camera', label: 'Cameras' },
  { id: 'map', icon: 'map', label: 'City Map' },
  { id: 'alerts', icon: 'bell', label: 'Alerts' },
  { id: 'analytics', icon: 'chart', label: 'Analytics' },
  { id: 'upload', icon: 'upload', label: 'AI Detection Portal' },
];

export function Sidebar() {
  const app = useApp();
  const openAlerts = app.alerts.filter((a) => a.status === 'open').length;

  const Item = ({ item }: { item: { id: PageId; icon: IconName; label: string; externalUrl?: string } }) => {
    const active = app.page === item.id;
    return (
      <button
        onClick={() => {
          if (item.externalUrl) {
            window.open(item.externalUrl, '_blank');
          } else {
            app.nav({ page: item.id });
          }
        }}
        aria-label={item.label}
        className={cx(
          'group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150 active:scale-90',
          active ? 'bg-sand/75 text-ink' : 'text-mauve/70 hover:bg-sand/45 hover:text-ink'
        )}
      >
        <Icon name={item.icon} />
        {item.id === 'alerts' && openAlerts > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-sand px-1 text-[14px] font-bold text-ink">
            {openAlerts}
          </span>
        )}
        {active && <span className="absolute -left-[9px] h-5 w-[3px] rounded-full bg-mauve" />}
        <span className="pointer-events-none absolute left-[52px] z-50 hidden whitespace-nowrap rounded-lg border border-clay/35 bg-cream px-3 py-2 text-[14px] font-bold text-ink shadow-xl group-hover:block">
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-16 flex-col items-center border-r border-clay/25 bg-cream/92 py-4 backdrop-blur">
      <button
        onClick={() => app.nav({ page: 'dashboard' })}
        aria-label="Home"
        className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink/5 p-1 text-ink shadow-[0_2px_16px_rgba(217,228,242,0.25)] transition-transform duration-150 hover:scale-105 active:scale-95"
      >
        <img src="/netra-logo.png" alt="NETRA" className="h-full w-full object-contain" />
      </button>
      <div className="mt-5 h-px w-7 bg-clay/35" />
      <nav className="mt-5 flex flex-col items-center gap-2">
        {NAV.map((item) => (
          <Item key={item.id} item={item} />
        ))}
      </nav>
      <div className="mt-auto flex flex-col items-center gap-2">
        <Item item={{ id: 'settings', icon: 'settings', label: 'Settings' }} />
        <div className="h-px w-7 bg-clay/35" />
        <button
          onClick={app.logout}
          aria-label="Sign out"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-mauve/70 transition-all duration-150 hover:bg-sand/45 hover:text-ink active:scale-90"
        >
          <Icon name="logout" />
        </button>
      </div>
    </aside>
  );
}
