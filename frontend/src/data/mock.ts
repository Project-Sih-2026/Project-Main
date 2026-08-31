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
  // ── Central Delhi & Connaught Core ──
  { id: 'c1', code: 'CAM-01', name: 'Connaught Inner Circle', district: 'Connaught Core', x: 420, y: 210, lat: 28.6328, lng: 77.2197, status: 'online', res: '4K', fps: 30, vehiclesToday: 18420, avgSpeed: 34, heading: 'Barakhamba Radial' },
  { id: 'c2', code: 'CAM-02', name: 'Janpath & Tolstoy Marg', district: 'Connaught Core', x: 440, y: 230, lat: 28.6255, lng: 77.2185, status: 'online', res: '1440p', fps: 30, vehiclesToday: 14210, avgSpeed: 31, heading: 'Janpath S-bound' },
  { id: 'c3', code: 'CAM-03', name: 'Mandi House Circle', district: 'Connaught Core', x: 470, y: 220, lat: 28.6258, lng: 77.2345, status: 'online', res: '1080p', fps: 30, vehiclesToday: 15320, avgSpeed: 36, heading: 'Barakhamba E-bound' },
  { id: 'c4', code: 'CAM-04', name: 'Minto Road Interchange', district: 'Connaught Core', x: 430, y: 190, lat: 28.6385, lng: 77.2270, status: 'degraded', res: '1080p', fps: 24, vehiclesToday: 11840, avgSpeed: 29, heading: 'Connaught N-link' },

  // ── Central Vista & Ceremonial Axis ──
  { id: 'c5', code: 'CAM-05', name: 'India Gate C-Hexagon', district: 'Central Vista', x: 180, y: 300, lat: 28.6129, lng: 77.2295, status: 'online', res: '4K', fps: 30, vehiclesToday: 21450, avgSpeed: 28, heading: 'Rajpath ceremonial' },
  { id: 'c6', code: 'CAM-06', name: 'Kartavya Path & Man Singh Rd', district: 'Central Vista', x: 220, y: 310, lat: 28.6145, lng: 77.2215, status: 'online', res: '1440p', fps: 30, vehiclesToday: 12900, avgSpeed: 30, heading: 'Central Vista W-bound' },
  { id: 'c7', code: 'CAM-07', name: 'Janpath Crossing', district: 'Central Vista', x: 480, y: 340, lat: 28.6210, lng: 77.2180, status: 'online', res: '1080p', fps: 30, vehiclesToday: 16340, avgSpeed: 26, heading: 'Ministry plaza approach' },
  { id: 'c8', code: 'CAM-08', name: 'Central Secretariat Gate', district: 'Central Vista', x: 260, y: 320, lat: 28.6165, lng: 77.2090, status: 'online', res: '1440p', fps: 30, vehiclesToday: 13700, avgSpeed: 25, heading: 'Raisina Hill North' },

  // ── South Delhi & Inner Ring Road ──
  { id: 'c9', code: 'CAM-09', name: 'AIIMS Ring Road Flyover', district: 'South Extension', x: 300, y: 95, lat: 28.5672, lng: 77.2100, status: 'online', res: '4K', fps: 30, vehiclesToday: 24210, avgSpeed: 38, heading: 'Inner Ring E-bound' },
  { id: 'c10', code: 'CAM-10', name: 'South Extension Part II', district: 'South Extension', x: 330, y: 110, lat: 28.5685, lng: 77.2210, status: 'online', res: '1080p', fps: 30, vehiclesToday: 21900, avgSpeed: 35, heading: 'Ring Rd flyway' },
  { id: 'c11', code: 'CAM-11', name: 'Moolchand Underpass', district: 'South Extension', x: 360, y: 120, lat: 28.5695, lng: 77.2360, status: 'online', res: '1440p', fps: 30, vehiclesToday: 19800, avgSpeed: 42, heading: 'Lajpat Nagar ramp' },
  { id: 'c12', code: 'CAM-12', name: 'Ashram Chowk Gateway', district: 'South Extension', x: 390, y: 130, lat: 28.5710, lng: 77.2580, status: 'degraded', res: '1080p', fps: 24, vehiclesToday: 26400, avgSpeed: 22, heading: 'Mathura Rd underpass' },
  { id: 'c13', code: 'CAM-13', name: 'Moti Bagh Ring Flyover', district: 'Dhaula Kuan', x: 270, y: 80, lat: 28.5785, lng: 77.1690, status: 'online', res: '1440p', fps: 30, vehiclesToday: 18700, avgSpeed: 44, heading: 'Inner Ring West' },
  { id: 'c14', code: 'CAM-14', name: 'Dhaula Kuan Interchange', district: 'Dhaula Kuan', x: 640, y: 470, lat: 28.5921, lng: 77.1610, status: 'online', res: '4K', fps: 30, vehiclesToday: 28470, avgSpeed: 46, heading: 'NH-48 flyover link' },

  // ── Chanakyapuri & Diplomatic Enclave ──
  { id: 'c15', code: 'CAM-15', name: 'Shanti Path Diplomatic Ring', district: 'Chanakyapuri', x: 290, y: 350, lat: 28.5910, lng: 77.1890, status: 'online', res: '1440p', fps: 30, vehiclesToday: 9100, avgSpeed: 40, heading: 'Embassy North ring' },
  { id: 'c16', code: 'CAM-16', name: 'Teen Murti Marg Circle', district: 'Chanakyapuri', x: 310, y: 330, lat: 28.6040, lng: 77.1990, status: 'online', res: '1080p', fps: 30, vehiclesToday: 11400, avgSpeed: 36, heading: 'Kushak Rd corridor' },

  // ── South-West Outer Ring & Vasant Kunj ──
  { id: 'c17', code: 'CAM-17', name: 'Munirka Outer Ring Flyover', district: 'Vasant Kunj', x: 230, y: 440, lat: 28.5580, lng: 77.1720, status: 'online', res: '1440p', fps: 30, vehiclesToday: 22100, avgSpeed: 48, heading: 'Outer Ring E-bound' },
  { id: 'c18', code: 'CAM-18', name: 'IIT Delhi Flyover Junction', district: 'South Extension', x: 250, y: 460, lat: 28.5450, lng: 77.1925, status: 'online', res: '1080p', fps: 30, vehiclesToday: 17800, avgSpeed: 41, heading: 'Aurobindo Marg Link' },
  { id: 'c19', code: 'CAM-19', name: 'Nelson Mandela Marg', district: 'Vasant Kunj', x: 140, y: 470, lat: 28.5412, lng: 77.1555, status: 'online', res: '1440p', fps: 30, vehiclesToday: 16120, avgSpeed: 42, heading: 'Campus–Mall ring' },
  { id: 'c20', code: 'CAM-20', name: 'Mahipalpur NH-48 Bypass', district: 'Aerocity Hub', x: 160, y: 490, lat: 28.5420, lng: 77.1280, status: 'online', res: '1080p', fps: 30, vehiclesToday: 25300, avgSpeed: 44, heading: 'NH-48 Gurugram Link' },

  // ── Aerocity & IGI Airport Corridor ──
  { id: 'c21', code: 'CAM-21', name: 'Aerocity Central Spine', district: 'Aerocity Hub', x: 740, y: 240, lat: 28.5510, lng: 77.1215, status: 'online', res: '4K', fps: 30, vehiclesToday: 19800, avgSpeed: 38, heading: 'Hospitality corridor' },
  { id: 'c22', code: 'CAM-22', name: 'IGI Airport T3 Expressway', district: 'Aerocity Hub', x: 760, y: 250, lat: 28.5562, lng: 77.0855, status: 'online', res: '4K', fps: 30, vehiclesToday: 31200, avgSpeed: 52, heading: 'T3 Departures flyway' },
  { id: 'c23', code: 'CAM-23', name: 'IGI Airport T1 Domestic', district: 'Aerocity Hub', x: 720, y: 260, lat: 28.5720, lng: 77.1120, status: 'online', res: '1440p', fps: 30, vehiclesToday: 23600, avgSpeed: 45, heading: 'T1 Arrivals ramp' },

  // ── East Delhi & Trans-Yamuna Gateways ──
  { id: 'c24', code: 'CAM-24', name: 'DND Tollway Gateway', district: 'DND Gateway', x: 860, y: 560, lat: 28.5810, lng: 77.3010, status: 'online', res: '1440p', fps: 30, vehiclesToday: 34730, avgSpeed: 62, heading: 'Noida–Delhi ramp' },
  { id: 'c25', code: 'CAM-25', name: 'Sarai Kale Khan ISBT / RRTS', district: 'DND Gateway', x: 820, y: 530, lat: 28.5895, lng: 77.2550, status: 'online', res: '1080p', fps: 30, vehiclesToday: 27100, avgSpeed: 33, heading: 'Ring Rd Ring interchange' },
  { id: 'c26', code: 'CAM-26', name: 'ITO Yamuna Bridge Gateway', district: 'Connaught Core', x: 800, y: 480, lat: 28.6289, lng: 77.2480, status: 'online', res: '4K', fps: 30, vehiclesToday: 38200, avgSpeed: 24, heading: 'Vikas Marg arterial' },
];

export const ROADS: Road[] = [
  { id: 'r1', name: 'Inner Ring Road (AIIMS – Moti Bagh)', points: [[60, 210], [940, 210]], level: 3 },
  { id: 'r2', name: 'Barakhamba–Janpath Corridor', points: [[480, 60], [480, 600]], level: 2 },
  { id: 'r3', name: 'Airport Express Highway (NH-48)', points: [[480, 340], [700, 470], [860, 560]], level: 4 },
  { id: 'r4', name: 'Nelson Mandela Marg', points: [[300, 60], [300, 210]], level: 2 },
  { id: 'r5', name: 'Vasant Kunj Radial Loop', points: [[120, 380], [240, 470], [140, 505]], level: 1 },
  { id: 'r6', name: 'DND Flyway Expressway', points: [[940, 210], [700, 250]], level: 3 },
  { id: 'r7', name: 'Central Vista Link', points: [[480, 340], [340, 300]], level: 2 },
  { id: 'r8', name: 'Aerocity Terminal Link', points: [[640, 520], [940, 470]], level: 2 },
  { id: 'r9', name: 'India Gate C-Hexagon Lane', points: [[180, 150], [180, 320]], level: 1 },
  { id: 'r10', name: 'Outer Ring North (Munirka)', points: [[120, 80], [880, 80]], level: 2 },
  { id: 'r11', name: 'Ridge Road Link', points: [[120, 80], [120, 520]], level: 1 },
  { id: 'r12', name: 'Mathura Road Gateway', points: [[880, 80], [880, 520]], level: 2 },
];
export const DISTRICTS: District[] = [
  { id: 'd1', name: 'South Extension', points: [[60, 40], [430, 40], [445, 150], [80, 150]], lx: 255, ly: 100 },
  { id: 'd2', name: 'Central Vista', points: [[95, 155], [440, 150], [420, 320], [100, 325]], lx: 255, ly: 245 },
  { id: 'd3', name: 'Connaught Core', points: [[300, 155], [700, 150], [700, 345], [425, 322], [445, 150]], lx: 585, ly: 185 },
  { id: 'd4', name: 'Vasant Kunj', points: [[45, 330], [305, 325], [280, 525], [65, 520]], lx: 170, ly: 425 },
  { id: 'd5', name: 'DND Gateway', points: [[705, 150], [955, 150], [940, 385], [700, 345]], lx: 830, ly: 255 },
  { id: 'd6', name: 'Dhaula Kuan', points: [[560, 385], [940, 385], [900, 600], [520, 600]], lx: 720, ly: 495 },
  { id: 'd7', name: 'Chanakyapuri', points: [[300, 325], [560, 385], [520, 600], [260, 525]], lx: 395, ly: 460 },
  { id: 'd8', name: 'Aerocity Hub', points: [[705, 440], [965, 425], [975, 615], [705, 615]], lx: 835, ly: 535 },
];

export const VEHICLES: Vehicle[] = [
  { id: 'v1', plate: 'DL-01-AB-4821', make: 'Audi', model: 'A4 2.0 TFSI', color: 'Graphite Grey', type: 'Sedan', owner: 'Ramesh Varma', license: 'DL C-4412-9981', status: 'watchlist', note: 'Linked to case #2291 — weekday northbound pattern through Connaught Core.', flaggedReason: 'Law Enforcement Case #2291 Link — Recurring unregistered night-route pattern through VIP corridor', speed: 62, lastCam: 'CAM-01', lastSeen: '2 min ago', kmToday: 41, tags: ['case-2291', 'vip-corridor'], road: 0, prog: 0.42, dir: 1, journey: [
    { t: '07:12', cam: 'CAM-05', loc: 'India Gate C-Hexagon', speed: 38, dir: 'Southbound' },
    { t: '07:41', cam: 'CAM-07', loc: 'Janpath Crossing', speed: 44, dir: 'Westbound' },
    { t: '08:03', cam: 'CAM-01', loc: 'Connaught Inner Circle', speed: 61, dir: 'Northbound', note: '21 over limit — flagged by ANPR' },
    { t: '08:36', cam: 'CAM-09', loc: 'AIIMS Ring Road Flyover', speed: 58, dir: 'Northbound' },
    { t: '09:02', cam: 'CAM-01', loc: 'Connaught Inner Circle', speed: 62, dir: 'Northbound' },
    { t: '09:19', cam: 'CAM-07', loc: 'Janpath Crossing', speed: 49, dir: 'Southbound' },
  ] },
  { id: 'v2', plate: 'HR-38-T-1103', make: 'Tata', model: 'Prima 4928 Tipper', color: 'Polar White', type: 'Truck', owner: 'NCR Freight Logistics', license: 'Fleet FL-2201', status: 'flagged', note: 'Stolen — report #7741. Last confirmed at Dhaula Kuan Interchange.', flaggedReason: 'STOLEN VEHICLE — Police FIR #7741 filed at Sarita Vihar Police Station; Intercept Team Dispatched', speed: 0, lastCam: 'CAM-14', lastSeen: '14 min ago', kmToday: 118, tags: ['stolen', 'fir-7741', 'intercept-active'], road: 2, prog: 0.8, dir: 1, journey: [
    { t: '05:20', cam: 'CAM-24', loc: 'DND Tollway Gateway', speed: 55, dir: 'Westbound' },
    { t: '06:05', cam: 'CAM-14', loc: 'Dhaula Kuan Interchange', speed: 48, dir: 'Westbound' },
    { t: '08:47', cam: 'CAM-14', loc: 'Dhaula Kuan Interchange', speed: 0, dir: 'Stationary', note: '11 min dwell — intercept team notified' },
    { t: '09:03', cam: 'CAM-14', loc: 'Dhaula Kuan Interchange', speed: 44, dir: 'Eastbound' },
  ] },
  { id: 'v3', plate: 'DL-03-CC-7702', make: 'Toyota', model: 'Camry Hybrid', color: 'Silver Metallic', type: 'Sedan', owner: 'Michael Osei', license: 'DL B-1180-4432', status: 'clear', flaggedReason: 'Clear — Regular verified commuter vehicle with clean registration compliance', speed: 48, lastCam: 'CAM-09', lastSeen: 'just now', kmToday: 12, tags: ['verified-commuter'], road: 3, prog: 0.3, dir: 1, journey: [
    { t: '07:55', cam: 'CAM-09', loc: 'AIIMS Ring Road Flyover', speed: 44, dir: 'Southbound' },
    { t: '08:31', cam: 'CAM-01', loc: 'Connaught Inner Circle', speed: 51, dir: 'Southbound' },
    { t: '09:00', cam: 'CAM-09', loc: 'AIIMS Ring Road Flyover', speed: 48, dir: 'Northbound' },
  ] },
  { id: 'v4', plate: 'HR-26-DK-2258', make: 'Hyundai', model: 'Creta SX (O)', color: 'Navy Blue', type: 'SUV', owner: 'Sofia Marín', license: 'DL A-7723-1109', status: 'watchlist', note: 'Repeat red-light violations — 12 events in 30 days.', flaggedReason: 'CHRONIC TRAFFIC OFFENDER — 12 Red-Light Jumps in 30 Days & 118 km/h Speeding Violation on DND Flyway', speed: 71, lastCam: 'CAM-24', lastSeen: '6 min ago', kmToday: 66, tags: ['red-light-12x', 'speed-challan'], road: 7, prog: 0.5, dir: 1, journey: [
    { t: '06:44', cam: 'CAM-01', loc: 'Connaught Inner Circle', speed: 66, dir: 'Southbound' },
    { t: '07:20', cam: 'CAM-09', loc: 'AIIMS Ring Road Flyover', speed: 72, dir: 'Eastbound', note: 'Red-light sequence — 1.8s after signal' },
    { t: '08:02', cam: 'CAM-07', loc: 'Janpath Crossing', speed: 58, dir: 'Southbound' },
    { t: '08:55', cam: 'CAM-24', loc: 'DND Tollway Gateway', speed: 118, dir: 'Westbound', note: 'Expressway segment — flagged for speeding' },
  ] },
  { id: 'v5', plate: 'DL-04-NA-9041', make: 'Yamaha', model: 'MT-15 V2', color: 'Matte Black', type: 'Two-wheeler', owner: 'Iris Kato', license: 'DL C-9931-2207', status: 'clear', flaggedReason: 'Clear — Standard commuter two-wheeler in regular transit pattern', speed: 74, lastCam: 'CAM-19', lastSeen: 'just now', kmToday: 23, tags: ['commuter'], road: 4, prog: 0.2, dir: 1, journey: [
    { t: '08:10', cam: 'CAM-05', loc: 'India Gate C-Hexagon', speed: 41, dir: 'Westbound' },
    { t: '08:44', cam: 'CAM-19', loc: 'Nelson Mandela Marg', speed: 68, dir: 'Southbound' },
    { t: '09:12', cam: 'CAM-19', loc: 'Nelson Mandela Marg', speed: 74, dir: 'Northbound' },
  ] },
  { id: 'v6', plate: 'DL-1L-EE-3319', make: 'Force', model: 'Traveller 3050', color: 'Pearl White', type: 'Van', owner: 'Delhi Express Logistics', license: 'Fleet FL-4477', status: 'clear', flaggedReason: 'Clear — Authorized Commercial Logistics Carrier with active route permit', speed: 54, lastCam: 'CAM-07', lastSeen: '3 min ago', kmToday: 88, tags: ['commercial-permit'], road: 1, prog: 0.55, dir: -1, journey: [
    { t: '06:30', cam: 'CAM-24', loc: 'DND Tollway Gateway', speed: 62, dir: 'Northbound' },
    { t: '07:35', cam: 'CAM-01', loc: 'Connaught Inner Circle', speed: 51, dir: 'Southbound' },
    { t: '08:48', cam: 'CAM-07', loc: 'Janpath Crossing', speed: 31, dir: 'Westbound', note: 'Traffic slow-down around ministry gate' },
    { t: '09:15', cam: 'CAM-07', loc: 'Janpath Crossing', speed: 54, dir: 'Northbound' },
  ] },
  { id: 'v7', plate: 'DL-1P-TR-6620', make: 'Tata Motors', model: 'Starbus EV', color: 'DTC Green-Cream', type: 'Bus', owner: 'DTC City Transit', license: 'Fleet FL-0031', status: 'clear', flaggedReason: 'Clear — Public Transportation DTC Electric Bus on scheduled route #502', speed: 39, lastCam: 'CAM-01', lastSeen: '1 min ago', kmToday: 104, tags: ['dtc-transit'], road: 0, prog: 0.7, dir: -1, journey: [
    { t: '06:05', cam: 'CAM-19', loc: 'Nelson Mandela Marg', speed: 36, dir: 'Eastbound' },
    { t: '07:50', cam: 'CAM-07', loc: 'Janpath Crossing', speed: 33, dir: 'Northbound' },
    { t: '09:18', cam: 'CAM-01', loc: 'Connaught Inner Circle', speed: 39, dir: 'Southbound' },
  ] },
  { id: 'v8', plate: 'UP-16-AX-5177', make: 'Toyota', model: 'Fortuner 4x4', color: 'Charcoal Black', type: 'SUV', owner: 'Aldo Brenner', license: 'DL B-5518-8860', status: 'flagged', note: 'BOLO — hit-and-run #5512, front bumper damage.', flaggedReason: 'POLICE BOLO — Hit & Run Incident #5512 (Barakhamba Rd) with severe front bumper damage', speed: 66, lastCam: 'CAM-14', lastSeen: '5 min ago', kmToday: 57, tags: ['bolo', 'hit-and-run', 'impound-order'], road: 2, prog: 0.35, dir: 1, journey: [
    { t: '07:02', cam: 'CAM-05', loc: 'India Gate C-Hexagon', speed: 52, dir: 'Southbound' },
    { t: '07:39', cam: 'CAM-01', loc: 'Connaught Inner Circle', speed: 61, dir: 'Southbound' },
    { t: '08:26', cam: 'CAM-14', loc: 'Dhaula Kuan Interchange', speed: 66, dir: 'Westbound', note: 'Lane change violation at interchange ramp' },
    { t: '09:08', cam: 'CAM-14', loc: 'Dhaula Kuan Interchange', speed: 64, dir: 'Westbound' },
  ] },
  { id: 'v9', plate: 'HR-55-AG-9910', make: 'Ashok Leyland', model: 'Ecomet 1215', color: 'Terracotta', type: 'Truck', owner: 'Gurugram Aggregates', license: 'Fleet FL-8812', status: 'flagged', note: 'Overweight permit expired — fine pending.', flaggedReason: 'OVERWEIGHT & PERMIT BREACH — Weigh-in-motion sensor triggered at 114% axle limit with expired permit', speed: 51, lastCam: 'CAM-19', lastSeen: '21 min ago', kmToday: 142, tags: ['compliance', 'overweight-114%'], road: 4, prog: 0.6, dir: -1, journey: [
    { t: '05:40', cam: 'CAM-14', loc: 'Dhaula Kuan Interchange', speed: 47, dir: 'Westbound' },
    { t: '07:12', cam: 'CAM-07', loc: 'Janpath Crossing', speed: 44, dir: 'Southbound' },
    { t: '08:37', cam: 'CAM-19', loc: 'Nelson Mandela Marg', speed: 51, dir: 'Eastbound', note: 'Weigh-in-motion triggered — 114% of limit' },
  ] },
  { id: 'v10', plate: 'DL-09-CB-3388', make: 'Honda', model: 'City VTEC', color: 'Bronze Metallic', type: 'Sedan', owner: 'R. Okafor', license: 'DL A-2210-7743', status: 'watchlist', note: 'Surveillance interest — NCR task force referral.', flaggedReason: 'SPECIAL TASK FORCE WATCHLIST — High-priority surveillance interest referral from Crime Branch unit', speed: 59, lastCam: 'CAM-09', lastSeen: '18 min ago', kmToday: 27, tags: ['task-force', 'crime-branch'], road: 3, prog: 0.1, dir: -1, journey: [
    { t: '06:58', cam: 'CAM-14', loc: 'Dhaula Kuan Interchange', speed: 55, dir: 'Northbound' },
    { t: '07:47', cam: 'CAM-01', loc: 'Connaught Inner Circle', speed: 62, dir: 'Northbound' },
    { t: '08:40', cam: 'CAM-09', loc: 'AIIMS Ring Road Flyover', speed: 59, dir: 'Southbound', note: 'First sighting in 6 days' },
  ] },
  { id: 'v11', plate: 'DL-08-CA-1044', make: 'Mahindra', model: 'Scorpio-N Z8', color: 'Deep Forest Green', type: 'SUV', owner: 'Vikram Rajput', license: 'DL A-9912-3321', status: 'watchlist', flaggedReason: 'UNAUTHORIZED HIGH-BEAM / FLASHERS — Recurring illegal siren & beacon usage in diplomatic zone', speed: 68, lastCam: 'CAM-15', lastSeen: '8 min ago', kmToday: 35, tags: ['illegal-beacon', 'vip-violation'], road: 2, prog: 0.4, dir: 1, journey: [
    { t: '07:30', cam: 'CAM-15', loc: 'Shanti Path Diplomatic Ring', speed: 58, dir: 'Northbound' },
    { t: '08:15', cam: 'CAM-06', loc: 'Kartavya Path & Man Singh Rd', speed: 64, dir: 'Eastbound' },
    { t: '08:50', cam: 'CAM-05', loc: 'India Gate C-Hexagon', speed: 68, dir: 'Southbound' },
  ] },
  { id: 'v12', plate: 'UP-14-BT-9902', make: 'Maruti Suzuki', model: 'Brezza ZXi', color: 'Magma Grey', type: 'SUV', owner: 'Pooja Verma', license: 'UP 14-8821-4410', status: 'clear', flaggedReason: 'Clear — Standard private suburban commuter with valid fastag & PUC', speed: 52, lastCam: 'CAM-24', lastSeen: '4 min ago', kmToday: 49, tags: ['noida-commuter'], road: 5, prog: 0.6, dir: 1, journey: [
    { t: '07:45', cam: 'CAM-24', loc: 'DND Tollway Gateway', speed: 60, dir: 'Westbound' },
    { t: '08:20', cam: 'CAM-10', loc: 'South Extension Part II', speed: 48, dir: 'Westbound' },
    { t: '08:52', cam: 'CAM-09', loc: 'AIIMS Ring Road Flyover', speed: 52, dir: 'Westbound' },
  ] },
  { id: 'v13', plate: 'DL-02-CD-5520', make: 'Mercedes-Benz', model: 'E-Class E220d', color: 'Obsidian Black', type: 'Sedan', owner: 'Oberoi Aviation Transport', license: 'DL C-7714-9901', status: 'clear', flaggedReason: 'Clear — Chauffeur VIP airport transfer with clean compliance record', speed: 65, lastCam: 'CAM-22', lastSeen: '9 min ago', kmToday: 82, tags: ['airport-transfer'], road: 6, prog: 0.7, dir: 1, journey: [
    { t: '07:15', cam: 'CAM-01', loc: 'Connaught Inner Circle', speed: 45, dir: 'Southbound' },
    { t: '08:00', cam: 'CAM-14', loc: 'Dhaula Kuan Interchange', speed: 62, dir: 'Westbound' },
    { t: '08:45', cam: 'CAM-22', loc: 'IGI Airport T3 Expressway', speed: 65, dir: 'Westbound' },
  ] },
  { id: 'v14', plate: 'HR-26-BQ-4411', make: 'Kia', model: 'Seltos GTX', color: 'Gravity Grey', type: 'SUV', owner: 'Ankit Sharma', license: 'HR 26-4401-2299', status: 'watchlist', flaggedReason: 'PUC COMPLIANCE EXPIRED — Automated pollution monitoring camera alert at Dhaula Kuan corridor', speed: 57, lastCam: 'CAM-14', lastSeen: '12 min ago', kmToday: 38, tags: ['puc-expired', 'emission-alert'], road: 2, prog: 0.5, dir: 1, journey: [
    { t: '07:22', cam: 'CAM-20', loc: 'Mahipalpur NH-48 Bypass', speed: 54, dir: 'Eastbound' },
    { t: '08:05', cam: 'CAM-14', loc: 'Dhaula Kuan Interchange', speed: 57, dir: 'Eastbound' },
    { t: '08:40', cam: 'CAM-13', loc: 'Moti Bagh Ring Flyover', speed: 50, dir: 'Eastbound' },
  ] },
];

export const ALERTS: TrafficAlert[] = [
  { id: 'a1', severity: 'critical', type: 'Watchlist', title: 'Watchlist match — DL-01-AB-4821 at 62 km/h', vehicleId: 'v1', cameraId: 'c1', zone: 'Connaught Core', minsAgo: 2, status: 'open', detail: 'Watchlisted sedan matched CAM-01 northbound at 62 km/h in a 50 zone. Pattern consistent with case #2291 activity window. Recommend shadow unit.' },
  { id: 'a2', severity: 'critical', type: 'Wrong-way', title: 'Wrong-way vehicle on Airport Express Flyway', vehicleId: 'v8', cameraId: 'c2', zone: 'Dhaula Kuan', minsAgo: 5, status: 'open', detail: 'Vehicle UP-16-AX-5177 entered Airport Express ramp against flow at ~66 km/h. Traffic control unit notified; overhead signage triggered.' },
  { id: 'a3', severity: 'high', type: 'Stolen', title: 'Stolen commercial truck stationary — HR-38-T-1103', vehicleId: 'v2', cameraId: 'c2', zone: 'Dhaula Kuan', minsAgo: 14, status: 'open', detail: 'Stolen Tata Prima has been stationary at Dhaula Kuan Interchange for 11 minutes. Intercept unit dispatched for visual confirmation.' },
  { id: 'a4', severity: 'high', type: 'Speed', title: 'Excessive speed — 118 km/h on DND Tollway', vehicleId: 'v4', cameraId: 'c8', zone: 'DND Gateway', minsAgo: 21, status: 'acknowledged', detail: 'Hyundai HR-26-DK-2258 clocked at 118 km/h on DND Express corridor. Two prior speeding events today — automated e-challan queued.' },
  { id: 'a5', severity: 'high', type: 'Incident', title: 'Feed drop at Aerocity Expressway — CAM-06', vehicleId: 'v3', cameraId: 'c6', zone: 'Aerocity Hub', minsAgo: 27, status: 'open', detail: 'Aerocity Expressway feed dropped for 94s during an accident response. Technical dispatch underway.' },
  { id: 'a6', severity: 'medium', type: 'Congestion', title: 'Congestion building — Janpath Crossing', vehicleId: 'v7', cameraId: 'c7', zone: 'Central Vista', minsAgo: 32, status: 'open', detail: 'Queue length doubled in 12 minutes around Janpath plaza approach. Suggest signal cycle retiming.' },
  { id: 'a7', severity: 'medium', type: 'Signal', title: 'Red-light sequence — HR-26-DK-2258', vehicleId: 'v4', cameraId: 'c3', zone: 'South Extension', minsAgo: 48, status: 'acknowledged', detail: 'Vehicle crossed 1.8s after red at AIIMS Ring Road Flyover. Plate match confirmed via ANPR. 12th event this month.' },
  { id: 'a8', severity: 'medium', type: 'System', title: 'Camera degraded — AIIMS Ring Road', vehicleId: 'v10', cameraId: 'c3', zone: 'South Extension', minsAgo: 61, status: 'acknowledged', detail: 'CAM-03 bitrate degraded 40% (dropped frames). Maintenance ticket MT-2214 auto-created.' },
  { id: 'a9', severity: 'low', type: 'Obstruction', title: 'Obstruction in bus lane — Nelson Mandela Marg', vehicleId: 'v5', cameraId: 'c5', zone: 'Vasant Kunj', minsAgo: 74, status: 'open', detail: 'Stopped two-wheeler partially blocking the dedicated transit lane.' },
  { id: 'a10', severity: 'low', type: 'Compliance', title: 'Unregistered commercial vehicle — HR-55-AG-9910', vehicleId: 'v9', cameraId: 'c5', zone: 'Vasant Kunj', minsAgo: 96, status: 'resolved', detail: 'Truck HR-55-AG-9910 operating with expired overweight permit. E-challan issued remotely; vehicle cleared.' },
  { id: 'a11', severity: 'high', type: 'Watchlist', title: 'Watchlist match — DL-09-CB-3388 re-appeared', vehicleId: 'v10', cameraId: 'c3', zone: 'South Extension', minsAgo: 120, status: 'open', detail: 'Special task force interest vehicle re-appeared after 6 dormant days, heading south on Barakhamba–Janpath Corridor.' },
  { id: 'a12', severity: 'medium', type: 'Anomaly', title: 'Speed differential anomaly — platoon on Inner Ring Rd', vehicleId: 'v6', cameraId: 'c1', zone: 'Connaught Core', minsAgo: 143, status: 'resolved', detail: 'Van DL-1L-EE-3319 traveling 31 km/h below platoon median, forcing abrupt braking behind. Cleared after lane change.' },
];
export const CONGESTION: { district: string; index: number; delta: string }[] = [
  { district: 'Connaught Core', index: 78, delta: '+4' },
  { district: 'Dhaula Kuan', index: 74, delta: '+3' },
  { district: 'South Extension', index: 68, delta: '+1' },
  { district: 'DND Gateway', index: 64, delta: '0' },
  { district: 'Central Vista', index: 52, delta: '−2' },
  { district: 'Vasant Kunj', index: 46, delta: '−1' },
  { district: 'Chanakyapuri', index: 37, delta: '0' },
  { district: 'Aerocity Hub', index: 29, delta: '−1' },
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
};

// ─── Brief datasets: congested-area ranking, camera locations, uptime, OCR ───
export interface Hotspot { name: string; level: 1 | 2 | 3; veh: number; note: string; x: number; y: number; lat: number; lng: number }
/** x/y are coordinates in the City Map SVG viewBox (0 0 1000 660), placed on the road network. */
export const HOTSPOTS: Hotspot[] = [
  { name: 'ITO Junction', level: 3, veh: 1840, note: 'Gridlock — signal cycle overshoot', x: 500, y: 218, lat: 28.6289, lng: 77.2410 },
  { name: 'Dhaula Kuan Interchange', level: 3, veh: 1620, note: 'Dense cluster — airport flyover merge', x: 596, y: 398, lat: 28.5921, lng: 77.1610 },
  { name: 'AIIMS Ring Road', level: 2, veh: 1150, note: 'Building — south corridor rush', x: 300, y: 470, lat: 28.5672, lng: 77.2100 },
  { name: 'DND Toll Gateway', level: 1, veh: 780, note: 'Flowing — fast-tag profile', x: 880, y: 390, lat: 28.5810, lng: 77.3010 },
];

/** Named camera locations for the 4-feed layout selector (brief §11). */
export const CAMERA_GROUPS: { name: string; ids: string[] }[] = [
  { name: 'Central Arteries (Connaught - AIIMS)', ids: ['c1', 'c2', 'c3', 'c4'] },
  { name: 'Expressways (Airport - DND)', ids: ['c5', 'c6', 'c7', 'c8'] },
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