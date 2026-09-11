// ─── City Traffic Intelligence — frontend-only mock data layer (no backend) ───

export type CameraStatus = 'online' | 'degraded' | 'offline';
export interface Camera {
  id: string; code: string; name: string; district: string;
  x: number; y: number; lat: number; lng: number; status: CameraStatus;
  res: string; fps: number; vehiclesToday: number; avgSpeed: number; heading: string;
}

export type VehicleStatus = 'clear' | 'watchlist' | 'flagged';
export type VehicleType = 'Sedan' | 'SUV' | 'Truck' | 'Bus' | 'Two-wheeler' | 'Van';
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
  // ── Krishna Nagar Corridors (CAM-KN-01 to CAM-KN-10) ──
  { id: 'c1', code: 'CAM-KN-01', name: 'Lal Quarter Market Chowk', district: 'Krishna Nagar', x: 480, y: 240, lat: 28.6575, lng: 77.2795, status: 'online', res: '4K', fps: 30, vehiclesToday: 18420, avgSpeed: 28, heading: 'Lal Quarter Market North' },
  { id: 'c2', code: 'CAM-KN-02', name: 'Vijay Chowk Crossing', district: 'Krishna Nagar', x: 520, y: 290, lat: 28.6550, lng: 77.2820, status: 'online', res: '1440p', fps: 30, vehiclesToday: 14210, avgSpeed: 31, heading: 'Vijay Chowk E-bound' },
  { id: 'c3', code: 'CAM-KN-03', name: 'Krishna Nagar Metro Station', district: 'Krishna Nagar', x: 500, y: 350, lat: 28.6515, lng: 77.2805, status: 'online', res: '4K', fps: 30, vehiclesToday: 21450, avgSpeed: 38, heading: 'Vikas Marg arterial' },
  { id: 'c4', code: 'CAM-KN-04', name: 'Jheel Khurenja Chowk', district: 'Krishna Nagar', x: 420, y: 220, lat: 28.6590, lng: 77.2755, status: 'online', res: '1080p', fps: 30, vehiclesToday: 15320, avgSpeed: 26, heading: 'Jheel T-Point W-bound' },
  { id: 'c5', code: 'CAM-KN-05', name: 'Chander Nagar Junction', district: 'Krishna Nagar', x: 540, y: 190, lat: 28.6610, lng: 77.2835, status: 'online', res: '1440p', fps: 30, vehiclesToday: 12900, avgSpeed: 33, heading: 'Chander Nagar S-link' },
  { id: 'c6', code: 'CAM-KN-06', name: 'Swarn Cinema Road', district: 'Krishna Nagar', x: 440, y: 320, lat: 28.6535, lng: 77.2765, status: 'online', res: '1080p', fps: 30, vehiclesToday: 11840, avgSpeed: 29, heading: 'Radhey Puri corridor' },
  { id: 'c7', code: 'CAM-KN-07', name: 'Radhey Puri Main Market', district: 'Krishna Nagar', x: 380, y: 270, lat: 28.6560, lng: 77.2725, status: 'online', res: '1080p', fps: 30, vehiclesToday: 13700, avgSpeed: 25, heading: 'Radhey Puri Market' },
  { id: 'c8', code: 'CAM-KN-08', name: 'East Azad Nagar Metro Link', district: 'Krishna Nagar', x: 490, y: 140, lat: 28.6645, lng: 77.2800, status: 'degraded', res: '1080p', fps: 24, vehiclesToday: 16340, avgSpeed: 32, heading: 'Azad Nagar North Link' },
  { id: 'c9', code: 'CAM-KN-09', name: 'Kanti Nagar Ext Crossing', district: 'Krishna Nagar', x: 460, y: 100, lat: 28.6670, lng: 77.2780, status: 'online', res: '1440p', fps: 30, vehiclesToday: 17800, avgSpeed: 35, heading: 'Circular Road approach' },
  { id: 'c10', code: 'CAM-KN-10', name: 'Old Anarkali Junction', district: 'Krishna Nagar', x: 590, y: 230, lat: 28.6585, lng: 77.2865, status: 'online', res: '1080p', fps: 30, vehiclesToday: 10400, avgSpeed: 30, heading: 'Jagat Puri link' },

  // ── Gandhi Nagar Corridors (CAM-GN-01 to CAM-GN-10) ──
  { id: 'c11', code: 'CAM-GN-01', name: 'Gandhi Nagar Textile Market', district: 'Gandhi Nagar', x: 320, y: 160, lat: 28.6625, lng: 77.2690, status: 'online', res: '4K', fps: 30, vehiclesToday: 24210, avgSpeed: 22, heading: 'Pushta Market Gate' },
  { id: 'c12', code: 'CAM-GN-02', name: 'Mahila Colony Chowk', district: 'Gandhi Nagar', x: 280, y: 210, lat: 28.6595, lng: 77.2665, status: 'online', res: '1080p', fps: 30, vehiclesToday: 18700, avgSpeed: 27, heading: 'Subhash Mohalla link' },
  { id: 'c13', code: 'CAM-GN-03', name: 'Dharampura T-Point', district: 'Gandhi Nagar', x: 230, y: 140, lat: 28.6640, lng: 77.2635, status: 'online', res: '1440p', fps: 30, vehiclesToday: 16120, avgSpeed: 29, heading: 'Kailash Nagar W-bound' },
  { id: 'c14', code: 'CAM-GN-04', name: 'Shastri Park Pushta Corridor', district: 'Gandhi Nagar', x: 190, y: 80, lat: 28.6680, lng: 77.2610, status: 'online', res: '4K', fps: 30, vehiclesToday: 28470, avgSpeed: 46, heading: 'Shastri Park highway' },
  { id: 'c15', code: 'CAM-GN-05', name: 'Geeta Colony Flyover Link', district: 'Gandhi Nagar', x: 350, y: 300, lat: 28.6540, lng: 77.2710, status: 'online', res: '1440p', fps: 30, vehiclesToday: 21900, avgSpeed: 39, heading: 'Geeta Colony ramp' },
  { id: 'c16', code: 'CAM-GN-06', name: 'Ashok Gali Crossing', district: 'Gandhi Nagar', x: 290, y: 180, lat: 28.6615, lng: 77.2675, status: 'online', res: '1080p', fps: 30, vehiclesToday: 12400, avgSpeed: 24, heading: 'Main Market core' },
  { id: 'c17', code: 'CAM-GN-07', name: 'Raghuvarpura Main Road', district: 'Gandhi Nagar', x: 280, y: 110, lat: 28.6655, lng: 77.2670, status: 'online', res: '1440p', fps: 30, vehiclesToday: 15300, avgSpeed: 30, heading: 'Raghuvarpura corridor' },
  { id: 'c18', code: 'CAM-GN-08', name: 'Seelampur Metro Pushta', district: 'Gandhi Nagar', x: 250, y: 60, lat: 28.6695, lng: 77.2650, status: 'degraded', res: '1080p', fps: 24, vehiclesToday: 26400, avgSpeed: 38, heading: 'GT Road link' },
  { id: 'c19', code: 'CAM-GN-09', name: 'Shanti Mohalla Market Gate', district: 'Gandhi Nagar', x: 350, y: 200, lat: 28.6605, lng: 77.2715, status: 'online', res: '1440p', fps: 30, vehiclesToday: 17200, avgSpeed: 25, heading: 'Shanti Mohalla Gate' },
  { id: 'c20', code: 'CAM-GN-10', name: 'Ramesh Park Pushta Entry', district: 'Gandhi Nagar', x: 330, y: 360, lat: 28.6510, lng: 77.2695, status: 'online', res: '1080p', fps: 30, vehiclesToday: 19800, avgSpeed: 42, heading: 'Pushta Southern link' },
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

export const CONGESTION: { district: string; index: number; delta: string }[] = [
  { district: 'Lal Quarter Core', index: 82, delta: '+5' },
  { district: 'Gandhi Nagar Main Market', index: 79, delta: '+4' },
  { district: 'Jheel Khurenja Junction', index: 71, delta: '+2' },
  { district: 'Shastri Park Pushta', index: 65, delta: '-1' },
  { district: 'Vikas Marg Link', index: 58, delta: '-3' },
  { district: 'Swarn Cinema Corridor', index: 52, delta: '+1' },
  { district: 'Radhey Puri Radial', index: 44, delta: '0' },
  { district: 'East Azad Nagar Egress', index: 36, delta: '-2' },
];

export const CLASS_MIX = [
  { label: 'Sedans', value: 38 }, { label: 'SUVs', value: 27 }, { label: 'Commercial', value: 14 },
  { label: 'Two-wheelers', value: 12 }, { label: 'Buses', value: 5 }, { label: 'Other', value: 4 },
];

export const VIOLATIONS = [
  { type: 'Speeding', count: 214 }, { type: 'Red-light', count: 96 }, { type: 'Illegal turn', count: 58 },
  { type: 'Wrong-way', count: 31 }, { type: 'Unregistered', count: 12 },
];

export type RangeKey = '15m' | '8h' | '24h' | '7d' | '30d' | '90d';
export interface RangeData {
  labels: string[]; volume: number[]; speed: number[];
  kpis: { vehicles: number; unique: number; ocr: number; avgSpeed: number; alerts: number; congestion: number; d: [string, string, string, string] };
}

const H24 = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

export const RANGES: Record<RangeKey, RangeData> = {
  '15m': {
    labels: ['-15m', '-12m', '-9m', '-6m', '-3m', 'Live'],
    volume: [1420, 1490, 1540, 1580, 1620, 1650],
    speed: [34, 33, 31, 30, 29, 31],
    kpis: { vehicles: 412, unique: 388, ocr: 96.2, avgSpeed: 31, alerts: 3, congestion: 68, d: ['+8.4%', '+1.2%', '+1', '+5 pts'] },
  },
  '8h': {
    labels: ['01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00'],
    volume: [300, 330, 480, 760, 1180, 1420, 1560, 1640],
    speed: [56, 52, 44, 38, 31, 29, 27, 26],
    kpis: { vehicles: 7670, unique: 2190, ocr: 95.4, avgSpeed: 32, alerts: 19, congestion: 64, d: ['+5.1%', '+0.9%', '+4', '+2 pts'] },
  },
  '24h': {
    labels: H24,
    volume: [420, 380, 340, 310, 300, 330, 480, 760, 1180, 1420, 1350, 1280, 1240, 1180, 1220, 1310, 1480, 1560, 1320, 1040, 860, 700, 560, 480],
    speed: [58, 57, 56, 55, 56, 52, 44, 38, 31, 29, 30, 32, 33, 31, 30, 29, 27, 26, 31, 38, 44, 49, 53, 56],
    kpis: { vehicles: 12842, unique: 3281, ocr: 94.8, avgSpeed: 34, alerts: 37, congestion: 62, d: ['+4.2%', '+0.8%', '+8', '+3 pts'] },
  },
  '7d': {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    volume: [21400, 22400, 21900, 23100, 24800, 26900, 19800],
    speed: [36, 35, 34, 36, 33, 31, 41],
    kpis: { vehicles: 159300, unique: 18402, ocr: 95.1, avgSpeed: 35, alerts: 312, congestion: 58, d: ['+1.8%', '+0.4%', '−12', '−2 pts'] },
  },
  '30d': {
    labels: Array.from({ length: 30 }, (_, i) => String(i + 1)),
    volume: [21400, 22050, 21800, 22500, 23100, 24600, 19900, 21300, 22100, 22600, 23000, 23400, 27100, 20200, 21600, 22300, 21900, 22750, 23300, 24800, 27400, 20500, 21800, 22400, 22800, 23500, 24100, 27600, 20800, 19900],
    speed: [36, 35, 36, 34, 33, 31, 41, 36, 35, 34, 34, 33, 31, 40, 36, 35, 36, 34, 33, 32, 30, 41, 35, 34, 34, 33, 32, 30, 41, 38],
    kpis: { vehicles: 681400, unique: 61240, ocr: 94.6, avgSpeed: 34, alerts: 1290, congestion: 60, d: ['+6.1%', '−1.2%', '+22', '+1 pt'] },
  },
  '90d': {
    labels: ['Month 1', 'Month 2', 'Month 3'],
    volume: [681400, 712000, 745000],
    speed: [34, 35, 33],
    kpis: { vehicles: 2138400, unique: 178000, ocr: 95.8, avgSpeed: 34, alerts: 3820, congestion: 59, d: ['+8.2%', '+1.5%', '+45', '+2 pts'] },
  },
};

export const PEAKS: Record<RangeKey, { window: string; vol: number; note: string }[]> = {
  '15m': [
    { window: 'Last 5 mins', vol: 1650, note: 'Sudden bottleneck at AIIMS Flyover' },
    { window: '10 mins ago', vol: 1540, note: 'Dhaula Kuan ramp merge surge' },
  ],
  '8h': [
    { window: '07:30 – 08:30', vol: 1640, note: 'Shift peak — Connaught Core inbound' },
    { window: '06:00 – 07:00', vol: 1180, note: 'Early morning freight clearing' },
  ],
  '24h': [
    { window: '08:00 – 09:30', vol: 1480, note: 'Inbound peak — Connaught Core & Janpath' },
    { window: '17:00 – 18:30', vol: 1560, note: 'Outbound peak — DND Flyway & NH-48' },
    { window: '12:15 – 13:00', vol: 1280, note: 'Midday rush — AIIMS Ring Road' },
  ],
  '7d': [
    { window: 'Fri 17:00 – 19:00', vol: 1620, note: 'Weekend outbound — Airport Express NH-48' },
    { window: 'Sat 20:00 – 22:00', vol: 1440, note: 'Night surge — Aerocity & Connaught Place' },
    { window: 'Thu 08:00 – 09:30', vol: 1510, note: 'Midweek inbound peak — DND Gateway' },
  ],
  '30d': [
    { window: 'Fri 17:00 – 19:00', vol: 1680, note: 'Recurring weekly maximum' },
    { window: 'Sat 20:00 – 22:00', vol: 1490, note: 'Weekend retail & airport rush' },
    { window: 'Mon 08:00 – 09:30', vol: 1470, note: 'Week-start NCR commuter surge' },
  ],
  '90d': [
    { window: 'Festival Week Fri 18:00', vol: 1980, note: 'Quarterly all-time peak' },
    { window: 'National Holiday Eve', vol: 1820, note: 'Inter-state egress choke' },
  ],
};

// ─── Brief datasets: congested-area ranking, camera locations, uptime, OCR ───
export interface Hotspot { name: string; level: 1 | 2 | 3; veh: number; note: string; x: number; y: number; lat: number; lng: number }
/** x/y are coordinates in the City Map SVG viewBox (0 0 1000 660), placed on the road network. */
export const HOTSPOTS: Hotspot[] = [
  { name: 'Lal Quarter Market Chowk', level: 3, veh: 1840, note: 'High density market bottleneck — signal cycle overshoot', x: 480, y: 240, lat: 28.6575, lng: 77.2795 },
  { name: 'Gandhi Nagar Textile Market', level: 3, veh: 1620, note: 'Dense commercial cluster — Pushta road loading merge', x: 320, y: 160, lat: 28.6625, lng: 77.2690 },
  { name: 'Jheel Khurenja Chowk', level: 2, veh: 1150, note: 'Cross-traffic flow from Geeta Colony link', x: 420, y: 220, lat: 28.6590, lng: 77.2755 },
  { name: 'Shastri Park Pushta Highway', level: 1, veh: 780, note: 'High speed arterial flow towards GT Road', x: 190, y: 80, lat: 28.6680, lng: 77.2610 },
];

/** Named camera locations for layout selector. */
export const CAMERA_GROUPS: { name: string; ids: string[] }[] = [
  { name: 'Krishna Nagar Corridors', ids: ['c1', 'c2', 'c3', 'c4', 'c5'] },
  { name: 'Gandhi Nagar Corridors', ids: ['c11', 'c12', 'c13', 'c14', 'c15'] },
];

export const UPTIME: Record<string, number> = { c1: 99.8, c2: 99.4, c3: 96.2, c4: 99.1, c5: 98.7, c6: 41.3, c7: 99.6, c8: 99.9 };
export const OCR_TREND: number[] = [93.1, 93.6, 94.0, 93.8, 94.4, 94.9, 94.6, 95.1, 94.8, 94.2, 94.7, 95.0];

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