import { CAMERAS, VEHICLES, type Camera, type Vehicle, type VehicleStatus, type VehicleType } from './mock';

export interface ANPRDetection {
  id: string;
  plate: string;
  make: string;
  model: string;
  color: string;
  type: VehicleType;
  speed: number;
  timeStr: string;
  status: VehicleStatus;
  flaggedReason?: string;
  confidence: number;
  dir: string;
  lane: string;
  vehicleRef?: Vehicle;
}

// Procedural realistic vehicle registry generator for high-volume metropolitan traffic
const MAKES_MODELS: { make: string; model: string; type: VehicleType; color: string }[] = [
  { make: 'Toyota', model: 'Innova Crysta', type: 'SUV', color: 'Pearl White' },
  { make: 'Toyota', model: 'Fortuner 4x4', type: 'SUV', color: 'Attitude Black' },
  { make: 'Toyota', model: 'Camry Hybrid', type: 'Sedan', color: 'Silver Metallic' },
  { make: 'Hyundai', model: 'Creta SX (O)', type: 'SUV', color: 'Titan Grey' },
  { make: 'Hyundai', model: 'Verna Turbo', type: 'Sedan', color: 'Starry Night' },
  { make: 'Hyundai', model: 'Venue SX', type: 'SUV', color: 'Fiery Red' },
  { make: 'Maruti Suzuki', model: 'Brezza ZXi', type: 'SUV', color: 'Magma Grey' },
  { make: 'Maruti Suzuki', model: 'Swift Dzire', type: 'Sedan', color: 'Arctic White' },
  { make: 'Maruti Suzuki', model: 'Grand Vitara', type: 'SUV', color: 'Nexa Blue' },
  { make: 'Maruti Suzuki', model: 'Ertiga VXi', type: 'SUV', color: 'Splendid Silver' },
  { make: 'Mahindra', model: 'Scorpio-N Z8', type: 'SUV', color: 'Deep Forest' },
  { make: 'Mahindra', model: 'XUV700 AX7', type: 'SUV', color: 'Midnight Black' },
  { make: 'Mahindra', model: 'Thar 4WD', type: 'SUV', color: 'Rocky Beige' },
  { make: 'Tata Motors', model: 'Nexon EV Max', type: 'SUV', color: 'Intensi-Teal' },
  { make: 'Tata Motors', model: 'Harrier Dark', type: 'SUV', color: 'Oberon Black' },
  { make: 'Tata Motors', model: 'Safari Gold', type: 'SUV', color: 'Black Gold' },
  { make: 'Tata Motors', model: 'Starbus EV', type: 'Bus', color: 'DTC Green' },
  { make: 'Tata Motors', model: 'Prima 4928', type: 'Truck', color: 'Polar White' },
  { make: 'Tata Motors', model: 'Ace Gold HT', type: 'Van', color: 'Signal Yellow' },
  { make: 'Kia', model: 'Seltos GTX', type: 'SUV', color: 'Gravity Grey' },
  { make: 'Kia', model: 'Carnival Limousine', type: 'Van', color: 'Aurora Black' },
  { make: 'Honda', model: 'City VTEC', type: 'Sedan', color: 'Radiant Red' },
  { make: 'Honda', model: 'Elevate ZX', type: 'SUV', color: 'Phoenix Orange' },
  { make: 'Skoda', model: 'Slavia 1.5 TSI', type: 'Sedan', color: 'Crystal Blue' },
  { make: 'Volkswagen', model: 'Virtus GT', type: 'Sedan', color: 'Candy White' },
  { make: 'BMW', model: '330Li M Sport', type: 'Sedan', color: 'Portimao Blue' },
  { make: 'Mercedes-Benz', model: 'E-Class E220d', type: 'Sedan', color: 'Obsidian Black' },
  { make: 'Audi', model: 'A4 2.0 TFSI', type: 'Sedan', color: 'Mythos Black' },
  { make: 'Royal Enfield', model: 'Classic 350', type: 'Two-wheeler', color: 'Stealth Black' },
  { make: 'Yamaha', model: 'MT-15 V2', type: 'Two-wheeler', color: 'Metallic Black' },
  { make: 'Bajaj', model: 'Pulsar NS200', type: 'Two-wheeler', color: 'Burnt Red' },
  { make: 'Ashok Leyland', model: 'Ecomet 1215', type: 'Truck', color: 'Terracotta' },
  { make: 'Force Motors', model: 'Traveller 3050', type: 'Van', color: 'Pearl White' },
  { make: 'BharatBenz', model: '1617R Freight', type: 'Truck', color: 'Navy Blue' },
];

const STATE_CODES = ['DL-01', 'DL-02', 'DL-03', 'DL-04', 'DL-05', 'DL-06', 'DL-07', 'DL-08', 'DL-09', 'DL-10', 'DL-11', 'DL-12', 'HR-26', 'HR-55', 'HR-38', 'UP-16', 'UP-14'];
const SERIES = ['AB', 'BC', 'CD', 'CA', 'CK', 'DK', 'EA', 'EB', 'NA', 'SR', 'TA', 'ZG', 'AX', 'BT'];

function pseudoRand(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

/**
 * Generate 40 to 80+ realistic vehicle sightings for any camera in the past 20-30 minute window
 */
export function getCamera30MinDetections(camera: Camera): ANPRDetection[] {
  const detections: ANPRDetection[] = [];
  const camNum = parseInt(camera.code.replace('CAM-', ''), 10) || 1;
  const targetCount = 38 + (camNum * 7) % 32; // 38 to 70 vehicles

  // 1. Include known matching vehicles from VEHICLES dataset
  VEHICLES.forEach((v) => {
    v.journey.forEach((evt) => {
      if (evt.cam === camera.code || evt.cam === camera.id || evt.loc.toLowerCase().includes(camera.name.toLowerCase().slice(0, 8))) {
        detections.push({
          id: `det-${v.id}-${evt.t}`,
          plate: v.plate,
          make: v.make,
          model: v.model,
          color: v.color,
          type: v.type,
          speed: evt.speed,
          timeStr: evt.t,
          status: v.status,
          flaggedReason: v.flaggedReason,
          confidence: 0.96,
          dir: evt.dir,
          lane: `Lane ${1 + ((v.plate.charCodeAt(3) || 1) % 3)}`,
          vehicleRef: v,
        });
      }
    });
  });

  // 2. Generate dense, high-frequency stream of vehicles for this hotspot camera
  for (let i = 0; i < targetCount; i++) {
    const seed = camNum * 1000 + i * 37;
    const r1 = pseudoRand(seed);
    const r2 = pseudoRand(seed + 1);
    const r3 = pseudoRand(seed + 2);
    const r4 = pseudoRand(seed + 3);

    // Calculate timestamp within 08:50 to 09:28 (past ~30 mins)
    const minsAgo = Math.floor(r1 * 28);
    const m = (28 - minsAgo + 60) % 60;
    const h = m > 28 ? 8 : 9;
    const timeStr = `0${h}`.slice(-2) + `:${`0${m}`.slice(-2)}`;

    // Generate plate
    const state = STATE_CODES[Math.floor(r2 * STATE_CODES.length)];
    const series = SERIES[Math.floor(r3 * SERIES.length)];
    const num = String(1000 + Math.floor(r4 * 8999));
    const plate = `${state}-${series}-${num}`;

    // Skip duplicate plate
    if (detections.some((d) => d.plate === plate)) continue;

    // Vehicle model
    const vehTemplate = MAKES_MODELS[Math.floor(r1 * MAKES_MODELS.length)];

    // Violation status
    let status: VehicleStatus = 'clear';
    let flaggedReason: string | undefined;

    if (r2 > 0.88) {
      status = 'watchlist';
      flaggedReason = 'Speeding Infraction — Clocked over corridor limit';
    } else if (r3 > 0.94) {
      status = 'flagged';
      flaggedReason = 'PUC Compliance Expired / Unregistered Commercial Vehicle';
    }

    const recordedSpeed = Math.round(camera.avgSpeed + (r4 - 0.5) * 26);
    const matchingVeh = VEHICLES.find((v) => v.plate === plate);

    detections.push({
      id: `gen-${camera.code}-${i}`,
      plate,
      make: vehTemplate.make,
      model: vehTemplate.model,
      color: vehTemplate.color,
      type: vehTemplate.type,
      speed: Math.max(18, recordedSpeed),
      timeStr,
      status,
      flaggedReason,
      confidence: Math.round((0.92 + r1 * 0.07) * 100) / 100,
      dir: camera.heading.split(' ')[0] || 'Northbound',
      lane: `Lane ${(i % 3) + 1}`,
      vehicleRef: matchingVeh || {
        id: `auto-${plate}`,
        plate,
        make: vehTemplate.make,
        model: vehTemplate.model,
        color: vehTemplate.color,
        type: vehTemplate.type,
        owner: 'Delhi Commuter Registry',
        license: `${state} R-${num}`,
        status,
        flaggedReason,
        speed: recordedSpeed,
        lastCam: camera.code,
        lastSeen: `${minsAgo} min ago`,
        kmToday: Math.round(15 + r2 * 75),
        tags: status !== 'clear' ? ['traffic-monitoring'] : [],
        road: (camNum % 8),
        prog: 0.5,
        dir: 1,
        journey: [
          { t: timeStr, cam: camera.code, loc: camera.name, speed: recordedSpeed, dir: camera.heading }
        ]
      }
    });
  }

  // Sort descending by time
  return detections.sort((a, b) => b.timeStr.localeCompare(a.timeStr));
}
