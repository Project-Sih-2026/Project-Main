import { createContext, useContext } from 'react';
import type { AlertStatus, Settings, TrafficAlert, User, Vehicle } from '../data/mock';

export type PageId = 'dashboard' | 'vehicles' | 'cameras' | 'map' | 'alerts' | 'analytics' | 'settings' | 'upload';

/** Payload used when navigating — pages re-initialise from it (keyed by navSeq). */
export interface Nav {
  page?: PageId;
  vehicleId?: string;
  query?: string;
  cameraId?: string;
  alertId?: string;
  district?: string;
  mapVehicle?: string;
  statusFilter?: AlertStatus | 'all';
}

export interface Toast {
  id: number;
  msg: string;
}

export interface AppCtx {
  page: PageId;
  nav: (n: Nav) => void;
  navSeq: number;
  target: Nav;
  user: User | null;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  updateUser: (u: Partial<User>) => void;
  vehicles: Vehicle[];
  toggleWatch: (id: string) => void;
  alerts: TrafficAlert[];
  setAlertStatus: (id: string, s: AlertStatus) => void;
  resetData: () => void;
  settings: Settings;
  update: (p: Partial<Settings>) => void;
  toasts: Toast[];
  toast: (msg: string) => void;
  fmtSpeed: (kph: number) => string;
}

const Ctx = createContext<AppCtx | null>(null);

export function useApp(): AppCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside <AppContext.Provider>');
  return v;
}

export { Ctx as AppContext };