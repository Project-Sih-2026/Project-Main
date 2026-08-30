// ─── City Traffic Intelligence — frontend-only mock data layer (no backend) ───

export type CameraStatus = 'online' | 'degraded' | 'offline';
export interface Camera {
  id: string; code: string; name: string; district: string;
  x: number; y: number; status: CameraStatus;
  res: string; fps: number; vehiclesToday: number; avgSpeed: number; heading: string;
}

export type VehicleStatus = 'clear' | 'watchlist' | 'flagged';
export type VehicleType = 'Sedan' | 'SUV' | 'Truck' | 'Bus' | 'Two-wheeler' | 'Van';
export interface JourneyEvent { t: string; cam: string; loc: string; speed: number; dir: string; note?: string }
export interface Vehicle {
  id: string; plate: string; make: string; model: string; color: string; type: VehicleType;
  owner: string; license: string; status: VehicleStatus; note?: string;
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
  { id: 'c1', code: 'CAM-01', name: 'Meridian & 5th', district: 'Meridian Core', x: 420, y: 210, status: 'online', res: '4K', fps: 30, vehiclesToday: 12480, avgSpeed: 38, heading: 'N–S corridor' },
  { id: 'c2', code: 'CAM-02', name: 'Harbor Tunnel West', district: 'Harborfront', x: 640, y: 470, status: 'online', res: '1440p', fps: 30, vehiclesToday: 9870, avgSpeed: 42, heading: 'Tunnel approach' },
  { id: 'c3', code: 'CAM-03', name: 'Northgate Interchange', district: 'Northgate', x: 300, y: 95, status: 'degraded', res: '1080p', fps: 24, vehiclesToday: 7210, avgSpeed: 51, heading: 'Merge lane 3' },
  { id: 'c4', code: 'CAM-04', name: 'Old Quarter Gate', district: 'Old Quarter', x: 180, y: 300, status: 'online', res: '1080p', fps: 30, vehiclesToday: 6450, avgSpeed: 29, heading: 'Heritage zone' },
  { id: 'c5', code: 'CAM-05', name: 'University Loop', district: 'University', x: 140, y: 470, status: 'online', res: '1440p', fps: 30, vehiclesToday: 5120, avgSpeed: 33, heading: 'Campus ring' },
  { id: 'c6', code: 'CAM-06', name: 'Riverside Expressway', district: 'Riverside', x: 760, y: 250, status: 'offline', res: '4K', fps: 30, vehiclesToday: 0, avgSpeed: 0, heading: 'Elevated E-bound' },
  { id: 'c7', code: 'CAM-07', name: 'Central Station Plaza', district: 'Meridian Core', x: 480, y: 340, status: 'online', res: '1080p', fps: 30, vehiclesToday: 15340, avgSpeed: 24, heading: 'Plaza approach' },
  { id: 'c8', code: 'CAM-08', name: 'Airport South Link', district: 'Airport South', x: 860, y: 560, status: 'online', res: '1440p', fps: 30, vehiclesToday: 8730, avgSpeed: 55, heading: 'Departures ramp' },
];

export const ROADS: Road[] = [
  { id: 'r1', name: 'Meridian Avenue', points: [[60, 210], [940, 210]], level: 3 },
  { id: 'r2', name: 'Central Boulevard', points: [[480, 60], [480, 600]], level: 2 },
  { id: 'r3', name: 'Harbor Route', points: [[480, 340], [700, 470], [860, 560]], level: 4 },
  { id: 'r4', name: 'North Spur', points: [[300, 60], [300, 210]], level: 2 },
  { id: 'r5', name: 'University Loop', points: [[120, 380], [240, 470], [140, 505]], level: 1 },
  { id: 'r6', name: 'Riverside Expressway', points: [[940, 210], [700, 250]], level: 3 },
  { id: 'r7', name: 'Station Link', points: [[480, 340], [340, 300]], level: 2 },
  { id: 'r8', name: 'Airport Link', points: [[640, 520], [940, 470]], level: 2 },
  { id: 'r9', name: 'Old Quarter Lane', points: [[180, 150], [180, 320]], level: 1 },
  { id: 'r10', name: 'Ring North', points: [[120, 80], [880, 80]], level: 2 },
  { id: 'r11', name: 'Ring West', points: [[120, 80], [120, 520]], level: 1 },
  { id: 'r12', name: 'Ring East', points: [[880, 80], [880, 520]], level: 2 },
];
export const DISTRICTS: District[] = [
  { id: 'd1', name: 'Northgate', points: [[60, 40], [430, 40], [445, 150], [80, 150]], lx: 255, ly: 100 },
  { id: 'd2', name: 'Old Quarter', points: [[95, 155], [440, 150], [420, 320], [100, 325]], lx: 255, ly: 245 },
  { id: 'd3', name: 'Meridian Core', points: [[300, 155], [700, 150], [700, 345], [425, 322], [445, 150]], lx: 585, ly: 185 },
  { id: 'd4', name: 'University', points: [[45, 330], [305, 325], [280, 525], [65, 520]], lx: 170, ly: 425 },
  { id: 'd5', name: 'Riverside', points: [[705, 150], [955, 150], [940, 385], [700, 345]], lx: 830, ly: 255 },
  { id: 'd6', name: 'Harborfront', points: [[560, 385], [940, 385], [900, 600], [520, 600]], lx: 720, ly: 495 },
  { id: 'd7', name: 'Industrial West', points: [[300, 325], [560, 385], [520, 600], [260, 525]], lx: 395, ly: 460 },
  { id: 'd8', name: 'Airport South', points: [[705, 440], [965, 425], [975, 615], [705, 615]], lx: 835, ly: 535 },
];

export const VEHICLES: Vehicle[] = [
  { id: 'v1', plate: 'KX·4821', make: 'Audi', model: 'A4', color: 'Graphite', type: 'Sedan', owner: 'Dana Whitfield', license: 'DL C-4412-9981', status: 'watchlist', note: 'Linked to case #2291 — weekday northbound pattern through Meridian Core.', speed: 62, lastCam: 'CAM-01', lastSeen: '2 min ago', kmToday: 41, tags: ['case-2291', 'night-active'], road: 0, prog: 0.42, dir: 1, journey: [
    { t: '07:12', cam: 'CAM-04', loc: 'Old Quarter Gate', speed: 38, dir: 'Southbound' },
    { t: '07:41', cam: 'CAM-07', loc: 'Central Station Plaza', speed: 44, dir: 'Westbound' },
    { t: '08:03', cam: 'CAM-01', loc: 'Meridian & 5th', speed: 61, dir: 'Northbound', note: '24 over limit — flagged by ANPR' },
    { t: '08:36', cam: 'CAM-03', loc: 'Northgate Interchange', speed: 58, dir: 'Northbound' },
    { t: '09:02', cam: 'CAM-01', loc: 'Meridian & 5th', speed: 62, dir: 'Northbound' },
    { t: '09:19', cam: 'CAM-07', loc: 'Central Station Plaza', speed: 49, dir: 'Southbound' },
  ] },
  { id: 'v2', plate: 'MR·1103', make: 'Volvo', model: 'FH16', color: 'White', type: 'Truck', owner: 'Harbor Freight Co.', license: 'Fleet FL-2201', status: 'flagged', note: 'Stolen — report #7741. Last confirmed at Harbor Tunnel West.', speed: 0, lastCam: 'CAM-02', lastSeen: '14 min ago', kmToday: 118, tags: ['stolen', 'report-7741'], road: 2, prog: 0.8, dir: 1, journey: [
    { t: '05:20', cam: 'CAM-08', loc: 'Airport South Link', speed: 55, dir: 'Westbound' },
    { t: '06:05', cam: 'CAM-02', loc: 'Harbor Tunnel West', speed: 48, dir: 'Westbound' },
    { t: '08:47', cam: 'CAM-02', loc: 'Harbor Tunnel West', speed: 0, dir: 'Stationary', note: '11 min dwell — drone dispatched' },
    { t: '09:03', cam: 'CAM-02', loc: 'Harbor Tunnel West', speed: 44, dir: 'Eastbound' },
  ] },
  { id: 'v3', plate: 'TS·7702', make: 'Toyota', model: 'Camry', color: 'Silver', type: 'Sedan', owner: 'Michael Osei', license: 'DL B-1180-4432', status: 'clear', speed: 48, lastCam: 'CAM-03', lastSeen: 'just now', kmToday: 12, tags: [], road: 3, prog: 0.3, dir: 1, journey: [
    { t: '07:55', cam: 'CAM-03', loc: 'Northgate Interchange', speed: 44, dir: 'Southbound' },
    { t: '08:31', cam: 'CAM-01', loc: 'Meridian & 5th', speed: 51, dir: 'Southbound' },
    { t: '09:00', cam: 'CAM-03', loc: 'Northgate Interchange', speed: 48, dir: 'Northbound' },
  ] },
  { id: 'v4', plate: 'GN·2258', make: 'Hyundai', model: 'Tucson', color: 'Navy', type: 'SUV', owner: 'Sofia Marín', license: 'DL A-7723-1109', status: 'watchlist', note: 'Repeat red-light violations — 12 events in 30 days.', speed: 71, lastCam: 'CAM-08', lastSeen: '6 min ago', kmToday: 66, tags: ['red-light-12x'], road: 7, prog: 0.5, dir: 1, journey: [
    { t: '06:44', cam: 'CAM-01', loc: 'Meridian & 5th', speed: 66, dir: 'Southbound' },
    { t: '07:20', cam: 'CAM-03', loc: 'Northgate Interchange', speed: 72, dir: 'Eastbound', note: 'Red-light sequence — 1.8s after signal' },
    { t: '08:02', cam: 'CAM-07', loc: 'Central Station Plaza', speed: 58, dir: 'Southbound' },
    { t: '08:55', cam: 'CAM-08', loc: 'Airport South Link', speed: 118, dir: 'Westbound', note: 'School-adjacent zone — highest speed today' },
  ] },
  { id: 'v5', plate: 'PW·9041', make: 'Yamaha', model: 'MT-07', color: 'Black', type: 'Two-wheeler', owner: 'Iris Kato', license: 'DL C-9931-2207', status: 'clear', speed: 74, lastCam: 'CAM-05', lastSeen: 'just now', kmToday: 23, tags: [], road: 4, prog: 0.2, dir: 1, journey: [
    { t: '08:10', cam: 'CAM-04', loc: 'Old Quarter Gate', speed: 41, dir: 'Westbound' },
    { t: '08:44', cam: 'CAM-05', loc: 'University Loop', speed: 68, dir: 'Southbound' },
    { t: '09:12', cam: 'CAM-05', loc: 'University Loop', speed: 74, dir: 'Northbound' },
  ] },
  { id: 'v6', plate: 'BD·3319', make: 'Mercedes', model: 'Sprinter', color: 'Pearl', type: 'Van', owner: 'Civic Logistics', license: 'Fleet FL-4477', status: 'clear', speed: 54, lastCam: 'CAM-07', lastSeen: '3 min ago', kmToday: 88, tags: [], road: 1, prog: 0.55, dir: -1, journey: [
    { t: '06:30', cam: 'CAM-08', loc: 'Airport South Link', speed: 62, dir: 'Northbound' },
    { t: '07:35', cam: 'CAM-01', loc: 'Meridian & 5th', speed: 51, dir: 'Southbound' },
    { t: '08:48', cam: 'CAM-07', loc: 'Central Station Plaza', speed: 31, dir: 'Westbound', note: '31 below platoon median — hard braking behind' },
    { t: '09:15', cam: 'CAM-07', loc: 'Central Station Plaza', speed: 54, dir: 'Northbound' },
  ] },
  { id: 'v7', plate: 'HV·6620', make: 'MAN', model: "Lion's Coach", color: 'Cream', type: 'Bus', owner: 'Metro Transit', license: 'Fleet FL-0031', status: 'clear', speed: 39, lastCam: 'CAM-01', lastSeen: '1 min ago', kmToday: 104, tags: [], road: 0, prog: 0.7, dir: -1, journey: [
    { t: '06:05', cam: 'CAM-05', loc: 'University Loop', speed: 36, dir: 'Eastbound' },
    { t: '07:50', cam: 'CAM-07', loc: 'Central Station Plaza', speed: 33, dir: 'Northbound' },
    { t: '09:18', cam: 'CAM-01', loc: 'Meridian & 5th', speed: 39, dir: 'Southbound' },
  ] },
  { id: 'v8', plate: 'QL·5177', make: 'Ford', model: 'Explorer', color: 'Charcoal', type: 'SUV', owner: 'Aldo Brenner', license: 'DL B-5518-8860', status: 'flagged', note: 'BOLO — hit-and-run #5512, front-left damage.', speed: 66, lastCam: 'CAM-02', lastSeen: '5 min ago', kmToday: 57, tags: ['bolo', 'hit-and-run'], road: 2, prog: 0.35, dir: 1, journey: [
    { t: '07:02', cam: 'CAM-04', loc: 'Old Quarter Gate', speed: 52, dir: 'Southbound' },
    { t: '07:39', cam: 'CAM-01', loc: 'Meridian & 5th', speed: 61, dir: 'Southbound' },
    { t: '08:26', cam: 'CAM-02', loc: 'Harbor Tunnel West', speed: 66, dir: 'Westbound', note: 'Wrong-way entry against tunnel flow' },
    { t: '09:08', cam: 'CAM-02', loc: 'Harbor Tunnel West', speed: 64, dir: 'Westbound' },
  ] },
  { id: 'v9', plate: 'CV·9910', make: 'Scania', model: 'R500', color: 'Terracotta', type: 'Truck', owner: 'Westgate Aggregates', license: 'Fleet FL-8812', status: 'flagged', note: 'Overweight permit expired — fine pending.', speed: 51, lastCam: 'CAM-05', lastSeen: '21 min ago', kmToday: 142, tags: ['compliance'], road: 4, prog: 0.6, dir: -1, journey: [
    { t: '05:40', cam: 'CAM-02', loc: 'Harbor Tunnel West', speed: 47, dir: 'Westbound' },
    { t: '07:12', cam: 'CAM-07', loc: 'Central Station Plaza', speed: 44, dir: 'Southbound' },
    { t: '08:37', cam: 'CAM-05', loc: 'University Loop', speed: 51, dir: 'Eastbound', note: 'Weigh-in-motion triggered — 114% of limit' },
  ] },
  { id: 'v10', plate: 'DK·3388', make: 'Honda', model: 'City', color: 'Bronze', type: 'Sedan', owner: 'R. Okafor', license: 'DL A-2210-7743', status: 'watchlist', note: 'Surveillance interest — task force referral.', speed: 59, lastCam: 'CAM-03', lastSeen: '18 min ago', kmToday: 27, tags: ['task-force'], road: 3, prog: 0.1, dir: -1, journey: [
    { t: '06:58', cam: 'CAM-02', loc: 'Harbor Tunnel West', speed: 55, dir: 'Northbound' },
    { t: '07:47', cam: 'CAM-01', loc: 'Meridian & 5th', speed: 62, dir: 'Northbound' },
    { t: '08:40', cam: 'CAM-03', loc: 'Northgate Interchange', speed: 59, dir: 'Southbound', note: 'First sighting in 6 days' },
  ] },
];
export const ALERTS: TrafficAlert[] = [
  { id: 'a1', severity: 'critical', type: 'Watchlist', title: 'Watchlist match — KX·4821 at 62 km/h', vehicleId: 'v1', cameraId: 'c1', zone: 'Meridian Core', minsAgo: 2, status: 'open', detail: 'Watchlisted sedan matched CAM-01 northbound at 62 km/h in a 50 zone. Pattern consistent with case #2291 activity window. Recommend shadow unit.' },
  { id: 'a2', severity: 'critical', type: 'Wrong-way', title: 'Wrong-way vehicle on Harbor Route', vehicleId: 'v8', cameraId: 'c2', zone: 'Harborfront', minsAgo: 5, status: 'open', detail: 'Vehicle QL·5177 entered Harbor Route against flow at ~66 km/h. Tunnel operators notified; overhead signage triggered.' },
  { id: 'a3', severity: 'high', type: 'Stolen', title: 'Stolen truck stationary — MR·1103', vehicleId: 'v2', cameraId: 'c2', zone: 'Harborfront', minsAgo: 14, status: 'open', detail: 'Stolen Volvo FH16 has been stationary at Harbor Tunnel West for 11 minutes. Drone unit dispatched for visual confirmation.' },
  { id: 'a4', severity: 'high', type: 'Speed', title: 'Excessive speed — 118 km/h near school zone', vehicleId: 'v4', cameraId: 'c8', zone: 'Airport South', minsAgo: 21, status: 'acknowledged', detail: 'Hyundai GN·2258 clocked at 118 km/h on Airport South Link. Two prior speeding events today — enforcement review suggested.' },
  { id: 'a5', severity: 'high', type: 'Incident', title: 'Feed loss during suspected collision — CAM-06', vehicleId: 'v3', cameraId: 'c6', zone: 'Riverside', minsAgo: 27, status: 'open', detail: 'Riverside Expressway feed dropped for 94s during a suspected multi-vehicle collision. Recovery vehicle en route; manual verification required.' },
  { id: 'a6', severity: 'medium', type: 'Congestion', title: 'Congestion building — Central Station Plaza', vehicleId: 'v7', cameraId: 'c7', zone: 'Meridian Core', minsAgo: 32, status: 'open', detail: 'Queue length doubled in 12 minutes around the plaza approach. Suggest signal retiming or diversion messaging.' },
  { id: 'a7', severity: 'medium', type: 'Signal', title: 'Red-light sequence — GN·2258', vehicleId: 'v4', cameraId: 'c3', zone: 'Northgate', minsAgo: 48, status: 'acknowledged', detail: 'Vehicle crossed 1.8s after red at Northgate Interchange. Plate match confirmed via ANPR. 12th event this month.' },
  { id: 'a8', severity: 'medium', type: 'System', title: 'Camera degraded — Northgate Interchange', vehicleId: 'v10', cameraId: 'c3', zone: 'Northgate', minsAgo: 61, status: 'acknowledged', detail: 'CAM-03 bitrate degraded 40% (dropped frames). Maintenance ticket MT-2214 auto-created.' },
  { id: 'a9', severity: 'low', type: 'Obstruction', title: 'Obstruction in bike lane — University Loop', vehicleId: 'v5', cameraId: 'c5', zone: 'University', minsAgo: 74, status: 'open', detail: 'Stopped two-wheeler partially blocking the protected lane near the campus ring.' },
  { id: 'a10', severity: 'low', type: 'Compliance', title: 'Unregistered commercial vehicle — CV·9910', vehicleId: 'v9', cameraId: 'c5', zone: 'University', minsAgo: 96, status: 'resolved', detail: 'Scania CV·9910 operating with expired overweight permit. Citation issued remotely; vehicle released.' },
  { id: 'a11', severity: 'high', type: 'Watchlist', title: 'Watchlist match — DK·3388 re-appeared', vehicleId: 'v10', cameraId: 'c3', zone: 'Northgate', minsAgo: 120, status: 'open', detail: 'Task-force interest vehicle re-appeared after 6 dormant days, heading south on Central Boulevard.' },
  { id: 'a12', severity: 'medium', type: 'Anomaly', title: 'Speed differential anomaly — platoon on Meridian Ave', vehicleId: 'v6', cameraId: 'c1', zone: 'Meridian Core', minsAgo: 143, status: 'resolved', detail: 'Van BD·3319 traveling 31 below platoon median, forcing hard braking behind. Cleared after lane change.' },
];
export const CONGESTION: { district: string; index: number; delta: string }[] = [
  { district: 'Meridian Core', index: 78, delta: '+4' },
  { district: 'Harborfront', index: 71, delta: '+2' },
  { district: 'Industrial West', index: 64, delta: '0' },
  { district: 'Riverside', index: 58, delta: '−3' },
  { district: 'Northgate', index: 52, delta: '+1' },
  { district: 'University', index: 41, delta: '−2' },
  { district: 'Old Quarter', index: 37, delta: '0' },
  { district: 'Airport South', index: 29, delta: '−1' },
];

export const CLASS_MIX = [
  { label: 'Sedans', value: 38 }, { label: 'SUVs', value: 27 }, { label: 'Commercial', value: 14 },
  { label: 'Two-wheelers', value: 12 }, { label: 'Buses', value: 5 }, { label: 'Other', value: 4 },
];

export const VIOLATIONS = [
  { type: 'Speeding', count: 214 }, { type: 'Red-light', count: 96 }, { type: 'Illegal turn', count: 58 },
  { type: 'Wrong-way', count: 31 }, { type: 'Unregistered', count: 12 },
];

export type RangeKey = '24h' | '7d' | '30d';
export interface RangeData {
  labels: string[]; volume: number[]; speed: number[];
  kpis: { vehicles: number; unique: number; ocr: number; avgSpeed: number; alerts: number; congestion: number; d: [string, string, string, string] };
}

const H24 = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

export const RANGES: Record<RangeKey, RangeData> = {
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
};

export const PEAKS: Record<RangeKey, { window: string; vol: number; note: string }[]> = {
  '24h': [
    { window: '08:00 – 09:30', vol: 1480, note: 'Inbound peak — Meridian Core' },
    { window: '17:00 – 18:30', vol: 1560, note: 'Outbound peak — Riverside Expressway' },
    { window: '12:15 – 13:00', vol: 1280, note: 'Lunch mid-peak — Station Plaza' },
  ],
  '7d': [
    { window: 'Fri 17:00 – 19:00', vol: 1620, note: 'Weekly maximum — Harbor Route' },
    { window: 'Sat 20:00 – 22:00', vol: 1440, note: 'Nightlife surge — Old Quarter' },
    { window: 'Thu 08:00 – 09:30', vol: 1510, note: 'Midweek inbound peak' },
  ],
  '30d': [
    { window: 'Fri 17:00 – 19:00', vol: 1680, note: 'Recurring weekly maximum' },
    { window: 'Sat 20:00 – 22:00', vol: 1490, note: 'Weekend nightlife pattern' },
    { window: 'Mon 08:00 – 09:30', vol: 1470, note: 'Week-start commuter surge' },
  ],
};

// ─── Brief datasets: congested-area ranking, camera locations, uptime, OCR ───
export interface Hotspot { name: string; level: 1 | 2 | 3; veh: number; note: string; x: number; y: number }
/** x/y are coordinates in the City Map SVG viewBox (0 0 1000 660), placed on the road network. */
export const HOTSPOTS: Hotspot[] = [
  { name: 'ITO Junction', level: 3, veh: 1840, note: 'Gridlock — signal cycle overshoot', x: 500, y: 218 },
  { name: 'MG Road', level: 3, veh: 1620, note: 'Dense cluster — event traffic inbound', x: 596, y: 398 },
  { name: 'Sector 18', level: 2, veh: 1150, note: 'Building — retail rush hour', x: 300, y: 470 },
  { name: 'Ring Road', level: 1, veh: 780, note: 'Flowing — normal profile', x: 880, y: 390 },
];

/** Named camera locations for the 4-feed layout selector (brief §11). */
export const CAMERA_GROUPS: { name: string; ids: string[] }[] = [
  { name: 'Central Avenue', ids: ['c1', 'c2', 'c3', 'c4'] },
  { name: 'Harbor Line', ids: ['c5', 'c6', 'c7', 'c8'] },
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

// ─── Helpers ───
export function camById(id: string) {
  return CAMERAS.find((c) => c.id === id || c.code === id);
}
export function vehById(id: string) {
  return VEHICLES.find((v) => v.id === id || v.plate === id);
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