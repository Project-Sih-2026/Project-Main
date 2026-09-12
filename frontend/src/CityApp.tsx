import { useCallback, useEffect, useState } from 'react';
import { AppContext, type Nav, type PageId, type Toast } from './state/appContext';
import { GovNav } from './components/layout/GovNav';
import { TopBar } from './components/layout/TopBar';
import { Toasts, cx } from './components/ui';
import { PageBackground } from './components/layout/PageBackground';
import { LoginPage } from './pages/LoginPage';
import { OperationsPage as DashboardPage } from './pages/DashboardPage';
import { VehicleSearchPage } from './pages/VehicleSearchPage';
import { CamerasPage } from './pages/CameraOpsPage';
import { CityMapPage } from './pages/CityMapPage';
import { AlertsPage } from './pages/AlertCenterPage';
import { AnalyticsPage } from './pages/AnalyticsViewPage';
import { SettingsPage } from './pages/SettingsPage';
import { CameraUploadPortalPage } from './pages/CameraUploadPortalPage';
import {
  ALERTS, DEFAULT_SETTINGS, VEHICLES, setLiveVehicles,
  type AlertStatus, type Settings, type User, type Vehicle, type TrafficAlert
} from './data/mock';
import { api } from './services/api';
import { detectionsToVehicles, detectionsToAlerts, backendAlertsToTrafficAlerts } from './services/dataAdapter';

export default function CityApp() {
  const extractUrlState = (): { page: PageId; target: Nav } => {
    if (typeof window === 'undefined') return { page: 'dashboard', target: {} };
    const rawHash = window.location.hash.replace('#', '');
    const queryIdx = rawHash.indexOf('?');
    const hashPage = (queryIdx !== -1 ? rawHash.slice(0, queryIdx) : rawHash).toLowerCase();

    let pageId: PageId = 'dashboard';
    if (hashPage === 'upload' || hashPage === 'detection' || hashPage === 'anpr') {
      pageId = 'upload';
    } else if (['dashboard', 'vehicles', 'cameras', 'map', 'alerts', 'analytics', 'settings', 'upload'].includes(hashPage)) {
      pageId = hashPage as PageId;
    }

    let params = new URLSearchParams();
    if (queryIdx !== -1) {
      params = new URLSearchParams(rawHash.slice(queryIdx + 1));
    }
    if (!params.get('vehicle') && !params.get('plate') && !params.get('mapVehicle')) {
      params = new URLSearchParams(window.location.search);
    }

    const veh = params.get('vehicle') || params.get('plate') || params.get('mapVehicle');
    const cam = params.get('camera') || params.get('cameraId');

    const targetObj: Nav = {};
    if (veh) {
      targetObj.mapVehicle = veh;
      targetObj.vehicleId = veh;
    }
    if (cam) {
      targetObj.cameraId = cam;
    }
    if (Object.keys(targetObj).length > 0) {
      targetObj.page = pageId;
    }

    return { page: pageId, target: targetObj };
  };

  const initialUrlState = extractUrlState();
  const [page, setPage] = useState<PageId>(initialUrlState.page);
  const [target, setTarget] = useState<Nav>(initialUrlState.target);
  const [navSeq, setNavSeq] = useState(0);
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('civic_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return { name: 'Ava Chen', email: 'ava.chen@cityops.gov', role: 'Operator' };
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [alerts, setAlerts] = useState<TrafficAlert[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const fetchLiveData = useCallback(async () => {
    try {
      const [dets, alts] = await Promise.all([
        api.getDetections({ limit: 200 }).catch(() => []),
        api.getAlerts().catch(() => []),
      ]);
      if (Array.isArray(dets)) {
        if (dets.length === 0) {
          setLiveVehicles([]);
          setVehicles([]);
          setAlerts([]);
        } else {
          const liveVehs = detectionsToVehicles(dets);
          setLiveVehicles(liveVehs);
          setVehicles(liveVehs);

          const liveAltsFromDets = detectionsToAlerts(dets);
          const liveAltsFromBackend = Array.isArray(alts) ? backendAlertsToTrafficAlerts(alts, dets) : [];

          const alertMap = new Map<string, TrafficAlert>();
          liveAltsFromDets.forEach((a) => alertMap.set(a.id, a));
          liveAltsFromBackend.forEach((a) => alertMap.set(a.id, a));
          setAlerts(Array.from(alertMap.values()));
        }
      }
    } catch (e) {
      console.warn('CityApp failed to fetch live database detections:', e);
    }
  }, []);

  // Poll database on mount and every 4 seconds to sync any live detections and AI uploads
  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 4000);
    return () => clearInterval(interval);
  }, [fetchLiveData]);

  // Sync window.location.hash with active page when page changes
  useEffect(() => {
    const currentHash = window.location.hash.replace('#', '');
    const currentHashPage = currentHash.split('?')[0];
    if (currentHashPage !== page) {
      window.location.hash = target.mapVehicle ? `${page}?vehicle=${encodeURIComponent(target.mapVehicle)}` : page;
    }
  }, [page, target]);

  // Listen to external hash changes
  useEffect(() => {
    const onHashChange = () => {
      const { page: newPage, target: newTarget } = extractUrlState();
      setPage(newPage);
      if (Object.keys(newTarget).length > 0) {
        setTarget(newTarget);
        setNavSeq((s) => s + 1);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const toast = useCallback((msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, msg }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  const nav = useCallback((n: Nav) => {
    setNavSeq((s) => s + 1);
    setTarget(n);
    if (n.page) setPage(n.page);
  }, []);

  const login = useCallback((email: string, pass: string) => {
    if (!email.includes('@') || pass.length < 4) return false;
    const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const role = email.startsWith('noor') ? 'Analyst' : email.startsWith('eli') ? 'Administrator' : 'Operator';
    const newUser: User = { name, email, role };
    setUser(newUser);
    try { localStorage.setItem('civic_user', JSON.stringify(newUser)); } catch (e) {}
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
      fetchLiveData();
      setSettings(DEFAULT_SETTINGS);
      toast('Live database synchronized');
    },
    settings,
    update: (p: Partial<Settings>) => setSettings((s) => ({ ...s, ...p })),
    toasts,
    toast,
    fmtSpeed: (kph: number) => (settings.units === 'mph' ? `${Math.round(kph * 0.621)} mph` : `${Math.round(kph)} km/h`),
  };

  useEffect(() => {
    document.title = user ? 'NETRA — Operations Intelligence Console' : 'Sign in — NETRA Traffic Intelligence';
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
      case 'upload': return <CameraUploadPortalPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <AppContext.Provider value={value}>
      <div className={cx('relative isolate min-h-screen bg-cream text-ink', settings.compact && 'compact', settings.reduceMotion && 'no-motion')}>
        <PageBackground variant="faded" />
        <div>
          <TopBar />
          <GovNav />
          <main key={navSeq} className="min-h-[calc(100vh-116px)]">
            {renderPage()}
          </main>
        </div>
        <Toasts items={toasts} />
      </div>
    </AppContext.Provider>
  );
}