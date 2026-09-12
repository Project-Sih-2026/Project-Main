// ─── City Traffic Intelligence — frontend-only mock data layer (no backend) ───

export type CameraStatus = 'online' | 'degraded' | 'offline';
export interface Camera {
  id: string; code: string; name: string; district: string;
  x: number; y: number; lat: number; lng: number; status: CameraStatus;
  res: string; fps: number; vehiclesToday: number; avgSpeed: number; heading: string;
}

export type VehicleStatus = 'clear' | 'watchlist' | 'flagged';
export type VehicleType = 'Sedan' | 'SUV' | 'Truck' | 'Bus' | 'Two-wheeler' | 'Van' | 'Ambulance';
export interface JourneyEvent { t: string; cam: string; loc: string; speed: number; dir: string; note?: string }
export interface Vehicle {
  id: string; plate: string; make: string; model: string; color: string; type: VehicleType;
  owner: string; license: string; status: VehicleStatus; note?: string;
  flaggedReason?: string;
  speed: number; lastCam: string; lastSeen: string; kmToday: number; tags: string[];
  journey: JourneyEvent[]; road: number; prog: number; dir: 1 | -1;
}

export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type AlertStatus = 'open' | 'acknowledged' | 'resolved';
export interface TrafficAlert {
  id: string; severity: Severity; type: string; title: string;
  vehicleId: string; cameraId: string; zone: string; minsAgo: number;
  status: AlertStatus; detail: string;
}

export interface Road { id: string; name: string; points: [number, number][]; level: 1 | 2 | 3 | 4 }
export interface District { id: string; name: string; points: [number, number][]; lx: number; ly: number }

export const CAMERAS: Camera[] = [
  // ── Krishna Nagar & Central East Corridors (c1 to c5) ──
  { id: 'c1', code: 'CAM-KN-01', name: 'Lal Quarter Market Chowk', district: 'Krishna Nagar', x: 348, y: 232, lat: 28.6575, lng: 77.2795, status: 'online', res: '4K', fps: 30, vehiclesToday: 0, avgSpeed: 0, heading: 'Northbound' },
  { id: 'c2', code: 'CAM-KN-02', name: 'Preet Vihar Vikas Marg Junction', district: 'Preet Vihar', x: 500, y: 322, lat: 28.6415, lng: 77.2950, status: 'online', res: '1440p', fps: 30, vehiclesToday: 0, avgSpeed: 0, heading: 'Eastbound' },
  { id: 'c3', code: 'CAM-KN-03', name: 'Laxmi Nagar Metro & Shakarpur Hub', district: 'Laxmi Nagar', x: 324, y: 383, lat: 28.6305, lng: 77.2770, status: 'online', res: '4K', fps: 30, vehiclesToday: 0, avgSpeed: 0, heading: 'Westbound' },
  { id: 'c4', code: 'CAM-KN-04', name: 'Akshardham Flyover & NH-24 Merge', district: 'Akshardham', x: 343, y: 453, lat: 28.6180, lng: 77.2790, status: 'online', res: '1080p', fps: 30, vehiclesToday: 0, avgSpeed: 0, heading: 'Southbound' },
  { id: 'c5', code: 'CAM-KN-05', name: 'Mayur Vihar Phase-1 Pocket-1 Chowk', district: 'Mayur Vihar', x: 466, y: 529, lat: 28.6045, lng: 77.2915, status: 'online', res: '1440p', fps: 30, vehiclesToday: 0, avgSpeed: 0, heading: 'Southbound' },

  // ── Mayur Vihar, Patparganj & Ghazipur Corridors (c6 to c10) ──
  { id: 'c6', code: 'CAM-KN-06', name: 'Mayur Vihar Phase-2 Kalyanvas Crossing', district: 'Mayur Vihar', x: 627, y: 464, lat: 28.6160, lng: 77.3080, status: 'online', res: '1080p', fps: 30, vehiclesToday: 0, avgSpeed: 0, heading: 'Eastbound' },
  { id: 'c7', code: 'CAM-KN-07', name: 'Mayur Vihar Phase-3 Kondli Border', district: 'Mayur Vihar', x: 813, y: 565, lat: 28.5980, lng: 77.3270, status: 'online', res: '1080p', fps: 30, vehiclesToday: 0, avgSpeed: 0, heading: 'Southbound' },
  { id: 'c8', code: 'CAM-KN-08', name: 'Patparganj Industrial Area / Max Hospital', district: 'Patparganj', x: 637, y: 389, lat: 28.6295, lng: 77.3090, status: 'degraded', res: '1080p', fps: 24, vehiclesToday: 0, avgSpeed: 0, heading: 'Northbound' },
  { id: 'c9', code: 'CAM-KN-09', name: 'Ghazipur Border & Flower Market Corridor', district: 'Ghazipur', x: 881, y: 420, lat: 28.6240, lng: 77.3340, status: 'online', res: '1440p', fps: 30, vehiclesToday: 0, avgSpeed: 0, heading: 'Eastbound' },
  { id: 'c10', code: 'CAM-KN-10', name: 'Karkardooma Court & CBD Ground Junction', district: 'Karkardooma', x: 593, y: 282, lat: 28.6485, lng: 77.3045, status: 'online', res: '1080p', fps: 30, vehiclesToday: 0, avgSpeed: 0, heading: 'Northbound' },

  // ── Anand Vihar, Vivek Vihar & Dilshad Garden Corridors (c11 to c15) ──
  { id: 'c11', code: 'CAM-GN-01', name: 'Anand Vihar ISBT & Terminal Gate', district: 'Anand Vihar', x: 700, y: 294, lat: 28.6465, lng: 77.3155, status: 'online', res: '4K', fps: 30, vehiclesToday: 0, avgSpeed: 0, heading: 'Eastbound' },
  { id: 'c12', code: 'CAM-GN-02', name: 'Surajmal Vihar / Sports Complex Road', district: 'Vivek Vihar', x: 656, y: 229, lat: 28.6580, lng: 77.3110, status: 'online', res: '1080p', fps: 30, vehiclesToday: 0, avgSpeed: 0, heading: 'Northbound' },
  { id: 'c13', code: 'CAM-GN-03', name: 'Vivek Vihar Underpass & ITI Crossing', district: 'Vivek Vihar', x: 705, y: 176, lat: 28.6675, lng: 77.3160, status: 'online', res: '1440p', fps: 30, vehiclesToday: 0, avgSpeed: 0, heading: 'Northbound' },
  { id: 'c14', code: 'CAM-GN-04', name: 'Dilshad Garden Metro & GTB Hospital Chowk', district: 'Dilshad Garden', x: 666, y: 98, lat: 28.6815, lng: 77.3120, status: 'online', res: '4K', fps: 30, vehiclesToday: 0, avgSpeed: 0, heading: 'Northbound' },
  { id: 'c15', code: 'CAM-GN-05', name: 'Apsara Border & GT Road Checkpoint', district: 'Shahdara', x: 818, y: 112, lat: 28.6790, lng: 77.3275, status: 'online', res: '1440p', fps: 30, vehiclesToday: 0, avgSpeed: 0, heading: 'Eastbound' },

  // ── Shahdara, Seelampur, Shastri Park & Geeta Colony (c16 to c20) ──
  { id: 'c16', code: 'CAM-GN-06', name: 'Shahdara Flyover & Railway Station Crossing', district: 'Shahdara', x: 466, y: 148, lat: 28.6725, lng: 77.2915, status: 'online', res: '1080p', fps: 30, vehiclesToday: 0, avgSpeed: 0, heading: 'Westbound' },
  { id: 'c17', code: 'CAM-GN-07', name: 'Seelampur Metro & Welcome Interchange', district: 'Seelampur', x: 275, y: 170, lat: 28.6685, lng: 77.2720, status: 'online', res: '1440p', fps: 30, vehiclesToday: 0, avgSpeed: 0, heading: 'Westbound' },
  { id: 'c18', code: 'CAM-GN-08', name: 'Shastri Park Pushta Highway & IT Park Link', district: 'Shastri Park', x: 119, y: 168, lat: 28.6690, lng: 77.2560, status: 'degraded', res: '1080p', fps: 24, vehiclesToday: 0, avgSpeed: 0, heading: 'Northbound' },
  { id: 'c19', code: 'CAM-GN-09', name: 'Gandhi Nagar Textile Market & Pushta Link', district: 'Gandhi Nagar', x: 212, y: 210, lat: 28.6615, lng: 77.2655, status: 'online', res: '1440p', fps: 30, vehiclesToday: 0, avgSpeed: 0, heading: 'Southbound' },
  { id: 'c20', code: 'CAM-GN-10', name: 'Geeta Colony Flyover & Yamuna Bridge Ramp', district: 'Geeta Colony', x: 231, y: 277, lat: 28.6495, lng: 77.2675, status: 'online', res: '1080p', fps: 30, vehiclesToday: 0, avgSpeed: 0, heading: 'Southbound' },
];

export const ROADS: Road[] = [
  { id: 'r1', name: 'Pushta Road Arterial (Gandhi Nagar)', points: [[190, 80], [330, 360]], level: 3 },
  { id: 'r2', name: 'Lal Quarter – Vijay Chowk Link', points: [[480, 240], [520, 290]], level: 2 },
  { id: 'r3', name: 'Vikas Marg & Metro Corridor', points: [[350, 300], [500, 350]], level: 4 },
  { id: 'r4', name: 'Jheel Khurenja – Chander Nagar Corridor', points: [[420, 220], [540, 190]], level: 2 },
  { id: 'r5', name: 'Gandhi Nagar Main Market Link', points: [[320, 160], [280, 210]], level: 1 },
  { id: 'r6', name: 'Shastri Park Pushta Highway', points: [[190, 80], [250, 60]], level: 3 },
  { id: 'r7', name: 'Radhey Puri – Swarn Cinema Link', points: [[380, 270], [440, 320]], level: 2 },
  { id: 'r8', name: 'Azad Nagar – Kanti Nagar Radial', points: [[490, 140], [460, 100]], level: 2 },
];

export const DISTRICTS: District[] = [
  { id: 'd1', name: 'Krishna Nagar Core', points: [[380, 160], [600, 160], [600, 360], [380, 360]], lx: 490, ly: 260 },
  { id: 'd2', name: 'Gandhi Nagar Hub', points: [[160, 60], [380, 60], [380, 360], [160, 360]], lx: 270, ly: 210 },
];

export const VEHICLES: Vehicle[] = [];

export const ALERTS: TrafficAlert[] = [];

export const CONGESTION: { district: string; index: number; delta: string }[] = [];

export const CLASS_MIX: { label: string; value: number }[] = [];

export const VIOLATIONS: { type: string; count: number }[] = [];

export type RangeKey = '15m' | '8h' | '24h' | '7d' | '30d' | '90d';
export interface RangeData {
  labels: string[]; volume: number[]; speed: number[];
  kpis: { vehicles: number; unique: number; ocr: number; avgSpeed: number; alerts: number; congestion: number; d: [string, string, string, string] };
}

const H24 = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

export const RANGES: Record<RangeKey, RangeData> = {
  '15m': {
    labels: ['-15m', '-12m', '-9m', '-6m', '-3m', 'Live'],
    volume: [0, 0, 0, 0, 0, 0],
    speed: [0, 0, 0, 0, 0, 0],
    kpis: { vehicles: 0, unique: 0, ocr: 0, avgSpeed: 0, alerts: 0, congestion: 0, d: ['0%', '0%', '0', '0 pts'] },
  },
  '8h': {
    labels: ['01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00'],
    volume: [0, 0, 0, 0, 0, 0, 0, 0],
    speed: [0, 0, 0, 0, 0, 0, 0, 0],
    kpis: { vehicles: 0, unique: 0, ocr: 0, avgSpeed: 0, alerts: 0, congestion: 0, d: ['0%', '0%', '0', '0 pts'] },
  },
  '24h': {
    labels: H24,
    volume: Array(24).fill(0),
    speed: Array(24).fill(0),
    kpis: { vehicles: 0, unique: 0, ocr: 0, avgSpeed: 0, alerts: 0, congestion: 0, d: ['0%', '0%', '0', '0 pts'] },
  },
  '7d': {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    volume: [0, 0, 0, 0, 0, 0, 0],
    speed: [0, 0, 0, 0, 0, 0, 0],
    kpis: { vehicles: 0, unique: 0, ocr: 0, avgSpeed: 0, alerts: 0, congestion: 0, d: ['0%', '0%', '0', '0 pts'] },
  },
  '30d': {
    labels: Array.from({ length: 30 }, (_, i) => String(i + 1)),
    volume: Array(30).fill(0),
    speed: Array(30).fill(0),
    kpis: { vehicles: 0, unique: 0, ocr: 0, avgSpeed: 0, alerts: 0, congestion: 0, d: ['0%', '0%', '0', '0 pts'] },
  },
  '90d': {
    labels: ['Month 1', 'Month 2', 'Month 3'],
    volume: [0, 0, 0],
    speed: [0, 0, 0],
    kpis: { vehicles: 0, unique: 0, ocr: 0, avgSpeed: 0, alerts: 0, congestion: 0, d: ['0%', '0%', '0', '0 pts'] },
  },
};

export const PEAKS: Record<RangeKey, { window: string; vol: number; note: string }[]> = {
  '15m': [],
  '8h': [],
  '24h': [],
  '7d': [],
  '30d': [],
  '90d': [],
};

// ─── Brief datasets: congested-area ranking, camera locations, uptime, OCR ───
export interface Hotspot { name: string; level: 1 | 2 | 3; veh: number; note: string; x: number; y: number; lat: number; lng: number }
/** x/y are coordinates in the City Map SVG viewBox (0 0 1000 660), placed on the road network. */
export const HOTSPOTS: Hotspot[] = [];

/** Named camera locations for layout selector. */
export const CAMERA_GROUPS: { name: string; ids: string[] }[] = [
  { name: 'South & Central East Delhi', ids: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10'] },
  { name: 'North & East Border Corridors', ids: ['c11', 'c12', 'c13', 'c14', 'c15', 'c16', 'c17', 'c18', 'c19', 'c20'] },
];

export const UPTIME: Record<string, number> = {};
export const OCR_TREND: number[] = [];

// ─── User & settings ───
export interface User { name: string; email: string; role: string }
export type Unit = 'km/h' | 'mph';
export interface Settings {
  units: Unit;
  compact: boolean;
  reduceMotion: boolean;
  notif: { critical: boolean; watchlist: boolean; offline: boolean; digest: boolean };
  mapLayers: { cameras: boolean; vehicles: boolean; alerts: boolean; congestion: boolean; watchlist: boolean };
}
export const DEFAULT_SETTINGS: Settings = {
  units: 'km/h',
  compact: false,
  reduceMotion: false,
  notif: { critical: true, watchlist: true, offline: false, digest: true },
  mapLayers: { cameras: true, vehicles: true, alerts: true, congestion: true, watchlist: true },
};

let _liveVehicles: Vehicle[] = [];
export function setLiveVehicles(vehs: Vehicle[]) {
  _liveVehicles = vehs;
}
export function getLiveVehicles(): Vehicle[] {
  return _liveVehicles;
}

// ─── Helpers ───
export function camById(id: string) {
  return CAMERAS.find((c) => c.id === id || c.code === id);
}
export function vehById(id: string) {
  if (!id) return undefined;
  const norm = id.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return _liveVehicles.find((v) => v.id === id || v.plate.toUpperCase().replace(/[^A-Z0-9]/g, '') === norm || v.plate === id) ||
         VEHICLES.find((v) => v.id === id || v.plate === id);
}
export function timeAgo(mins: number) {
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h} hr ago`;
  return `${Math.floor(h / 24)} d ago`;
}
/** Position along a polyline for the given progress 0..1 (used by the live map). */
export function pointAlong(points: [number, number][], prog: number) {
  const segs: number[] = [];
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const d = Math.hypot(points[i + 1][0] - points[i][0], points[i + 1][1] - points[i][1]);
    segs.push(d);
    total += d;
  }
  let dist = Math.max(0, Math.min(1, prog)) * total;
  for (let i = 0; i < segs.length; i++) {
    if (dist <= segs[i] || i === segs.length - 1) {
      const r = segs[i] === 0 ? 0 : dist / segs[i];
      return { x: points[i][0] + (points[i + 1][0] - points[i][0]) * r, y: points[i][1] + (points[i + 1][1] - points[i][1]) * r };
    }
    dist -= segs[i];
  }
  const last = points[points.length - 1];
  return { x: last[0], y: last[1] };
}