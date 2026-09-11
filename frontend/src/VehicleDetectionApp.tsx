import { useCallback, useState } from 'react';
import { AppContext, type Nav, type PageId, type Toast } from './state/appContext';
import { CameraUploadPortalPage } from './pages/CameraUploadPortalPage';
import { Toasts } from './components/ui';
import { Icon } from './components/Icons';
import { getOperationsPortalUrl } from './utils/navigation';
import { PageBackground } from './components/layout/PageBackground';
import {
  ALERTS, DEFAULT_SETTINGS, VEHICLES,
  type AlertStatus, type Settings, type User,
} from './data/mock';

export default function VehicleDetectionApp() {
  const [target, setTarget] = useState<Nav>({});
  const [navSeq, setNavSeq] = useState(0);
  const [user, setUser] = useState<User | null>({
    name: 'Edge AI Officer',
    email: 'ai.detection@cityops.gov',
    role: 'Operator'
  });
  const [vehicles, setVehicles] = useState(VEHICLES);
  const [alerts, setAlerts] = useState(ALERTS);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, msg }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  const nav = useCallback((n: Nav) => {
    setNavSeq((s) => s + 1);
    setTarget(n);
    if (n.page === 'vehicles' && n.query) {
      window.open(getOperationsPortalUrl('vehicles'), '_blank');
    } else if (n.page === 'map') {
      window.open(getOperationsPortalUrl('map'), '_blank');
    }
  }, []);

  const value = {
    page: 'upload' as PageId,
    nav,
    navSeq,
    target,
    user,
    login: () => true,
    logout: () => {},
    updateUser: (u: Partial<User>) => setUser((cur) => (cur ? { ...cur, ...u } : cur)),
    vehicles,
    toggleWatch: (id: string) => {
      setVehicles((vs) => vs.map((v) => (v.id === id ? { ...v, status: v.status === 'watchlist' ? 'clear' : 'watchlist' } : v)));
      const v = vehicles.find((x) => x.id === id);
      toast(v?.status === 'watchlist' ? `${v.plate} removed from watchlist` : `${v?.plate ?? 'Vehicle'} added to watchlist`);
    },
    alerts,
    setAlertStatus: (id: string, s: AlertStatus) => {
      setAlerts((as) => as.map((a) => (a.id === id ? { ...a, status: s } : a)));
      toast(`Alert ${id.toUpperCase()} → ${s}`);
    },
    resetData: () => {},
    settings,
    update: (p: Partial<Settings>) => setSettings((s) => ({ ...s, ...p })),
    toasts,
    toast,
    fmtSpeed: (kph: number) => `${Math.round(kph)} km/h`,
  };

  return (
    <AppContext.Provider value={value}>
      <div className="relative isolate min-h-screen bg-cream text-ink flex flex-col">
        <PageBackground variant="faded" />
        {/* Dedicated Standalone Top Bar for Port 5174 */}
        <header className="sticky top-0 z-50 border-b border-clay/20 bg-cream/95 backdrop-blur px-4 py-3 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/netra-logo.png"
                alt="NETRA"
                className="h-9 w-auto object-contain drop-shadow-sm transition-transform hover:scale-105"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-sm font-bold tracking-tight text-ink">
                    NETRA • AI Vehicle Detection & Plate Registry
                  </h2>
                  <span className="rounded-md bg-blue-500/15 border border-blue-500/30 px-1.5 py-0.2 text-[10px] font-mono font-bold text-blue-800">
                    PORT 5174
                  </span>
                </div>
                <p className="text-[11px] text-mauve">
                  National Edge Ingestion • YOLOv8 Multi-Vehicle Pipeline
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-clay/30 bg-white/70 px-3 py-1 text-xs text-mauve">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Backend: <strong className="text-ink">127.0.0.1:8000</strong></span>
              </div>

              <a
                href={getOperationsPortalUrl()}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-xl border border-clay/35 bg-ink px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-ink/90 transition-all"
              >
                <span>City Operations Console</span>
                <span className="font-mono text-[10px] bg-white/20 px-1.5 py-0.5 rounded">Port 5173</span>
                <Icon name="arrowUpRight" className="h-3.5 w-3.5 text-blue-400" />
              </a>
            </div>
          </div>
        </header>

        {/* Main Detection Portal Content */}
        <main className="flex-1">
          <CameraUploadPortalPage />
        </main>

        <Toasts items={toasts} />
      </div>
    </AppContext.Provider>
  );
}
