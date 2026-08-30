import { useCallback, useEffect, useState } from 'react';
import { AppContext, type Nav, type PageId, type Toast } from './state/appContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { Toasts, cx } from './components/ui';
import { LoginPage } from './pages/LoginPage';
import { OperationsPage as DashboardPage } from './pages/DashboardPage';
import { VehicleSearchPage } from './pages/VehicleSearchPage';
import { CamerasPage } from './pages/CameraOpsPage';
import { CityMapPage } from './pages/CityMapPage';
import { AlertsPage } from './pages/AlertCenterPage';
import { AnalyticsPage } from './pages/AnalyticsViewPage';
import { SettingsPage } from './pages/SettingsPage';
import {
  ALERTS, DEFAULT_SETTINGS, VEHICLES,
  type AlertStatus, type Settings, type User,
} from './data/mock';

export default function CityApp() {
  const [page, setPage] = useState<PageId>('dashboard');
  const [target, setTarget] = useState<Nav>({});
  const [navSeq, setNavSeq] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
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
    if (n.page) setPage(n.page);
    setMenuOpen(false);
  }, []);

  const login = useCallback((email: string, pass: string) => {
    if (!email.includes('@') || pass.length < 4) return false;
    const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const role = email.startsWith('noor') ? 'Analyst' : email.startsWith('eli') ? 'Administrator' : 'Operator';
    setUser({ name, email, role });
    setPage('dashboard');
    return true;
  }, []);

  const value = {
    page,
    nav,
    navSeq,
    target,
    user,
    login,
    logout: () => { setUser(null); setPage('dashboard'); },
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
    resetData: () => {
      setVehicles(VEHICLES);
      setAlerts(ALERTS);
      setSettings(DEFAULT_SETTINGS);
      toast('Demo data restored to snapshot');
    },
    settings,
    update: (p: Partial<Settings>) => setSettings((s) => ({ ...s, ...p })),
    toasts,
    toast,
    fmtSpeed: (kph: number) => (settings.units === 'mph' ? `${Math.round(kph * 0.621)} mph` : `${Math.round(kph)} km/h`),
  };

  useEffect(() => {
    document.title = user ? 'City Traffic Intelligence — Operations Console' : 'Sign in — City Traffic Intelligence';
  }, [user]);

  if (!user)
    return (
      <AppContext.Provider value={value}>
        <LoginPage />
      </AppContext.Provider>
    );

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <DashboardPage />;
      case 'vehicles': return <VehicleSearchPage />;
      case 'cameras': return <CamerasPage />;
      case 'map': return <CityMapPage />;
      case 'alerts': return <AlertsPage />;
      case 'analytics': return <AnalyticsPage />;
      case 'settings': return <SettingsPage />;
    }
  };

  return (
    <AppContext.Provider value={value}>
      <div className={cx('min-h-screen bg-cream text-ink', settings.compact && 'compact', settings.reduceMotion && 'no-motion')}>
        <div className={cx(menuOpen ? 'block' : 'hidden', 'lg:block')}>
          <Sidebar />
        </div>
        {menuOpen && (
          <button aria-label="Close menu" onClick={() => setMenuOpen(false)} className="fixed inset-0 z-30 bg-mauve/35 backdrop-blur-sm lg:hidden" />
        )}
        <div className="lg:pl-16">
          <TopBar onMenu={() => setMenuOpen(true)} />
          <main key={navSeq} className="min-h-[calc(100vh-58px)]">
            {renderPage()}
          </main>
        </div>
        <Toasts items={toasts} />
      </div>
    </AppContext.Provider>
  );
}