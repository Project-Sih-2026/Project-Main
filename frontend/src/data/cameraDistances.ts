// Dynamic Pairwise Distance & Transit Metrics for all 20 Cameras
// Computes WGS84 Haversine GPS distance and cardinal bearings directly from camera nodes
import { CAMERAS } from './mock';

export interface CameraDistanceTarget {
  target_id: string;
  target_name: string;
  distance_meters: number;
  distance_km: number;
  est_transit_mins_30kmh?: number;
  est_transit_mins?: number;
  est_transit_secs: number;
  bearing_deg: number;
  cardinal_direction: string;
}

export interface CameraNodeMeta {
  id: string;
  code: string;
  designation: string;
  district: string;
  sector: string;
  lat: number;
  lng: number;
  direction: string;
}

export interface CameraDistanceData {
  total_cameras: number;
  cameras: CameraNodeMeta[];
  matrix: Record<string, Record<string, any>>;
}

export function haversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000.0;
  const phi1 = (lat1 * Math.PI) / 180.0;
  const phi2 = (lat2 * Math.PI) / 180.0;
  const dphi = ((lat2 - lat1) * Math.PI) / 180.0;
  const dlam = ((lon2 - lon1) * Math.PI) / 180.0;
  const a = Math.sin(dphi / 2.0) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dlam / 2.0) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): [number, string] {
  const phi1 = (lat1 * Math.PI) / 180.0;
  const phi2 = (lat2 * Math.PI) / 180.0;
  const dlam = ((lon2 - lon1) * Math.PI) / 180.0;
  const y = Math.sin(dlam) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dlam);
  const deg = Math.round(((Math.atan2(y, x) * 180.0) / Math.PI + 360.0) % 360.0 * 10) / 10;
  const compass = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const idx = Math.floor((deg + 11.25) / 22.5) % 16;
  return [deg, compass[idx]];
}

function buildDistanceData(): CameraDistanceData {
  const speedKmh = 30.0;
  const speedMps = (speedKmh * 1000.0) / 3600.0;

  const cameras: CameraNodeMeta[] = CAMERAS.map((c) => ({
    id: c.code,
    code: c.code,
    designation: c.name,
    district: c.district,
    sector: c.district,
    lat: c.lat,
    lng: c.lng,
    direction: c.heading,
  }));

  const matrix: Record<string, Record<string, any>> = {};

  CAMERAS.forEach((c1) => {
    const row: Record<string, any> = {};
    const neighbors: CameraDistanceTarget[] = [];

    CAMERAS.forEach((c2) => {
      if (c1.id === c2.id) {
        const selfTarget: CameraDistanceTarget = {
          target_id: c2.code,
          target_name: c2.name,
          distance_meters: 0,
          distance_km: 0,
          est_transit_mins_30kmh: 0,
          est_transit_mins: 0,
          est_transit_secs: 0,
          bearing_deg: 0,
          cardinal_direction: '-',
        };
        row[c2.id] = selfTarget;
        row[c2.code] = selfTarget;
        return;
      }

      const distM = haversineDistanceMeters(c1.lat, c1.lng, c2.lat, c2.lng);
      const distKm = Math.round((distM / 1000.0) * 1000) / 1000;
      const transitSecs = Math.round(distM / speedMps);
      const transitMins = Math.round((transitSecs / 60.0) * 10) / 10;
      const [brgDeg, brgDir] = calculateBearing(c1.lat, c1.lng, c2.lat, c2.lng);

      const target: CameraDistanceTarget = {
        target_id: c2.code,
        target_name: c2.name,
        distance_meters: distM,
        distance_km: distKm,
        est_transit_mins_30kmh: transitMins,
        est_transit_mins: transitMins,
        est_transit_secs: transitSecs,
        bearing_deg: brgDeg,
        cardinal_direction: brgDir,
      };

      row[c2.id] = target;
      row[c2.code] = target;
      neighbors.push(target);
    });

    neighbors.sort((a, b) => a.distance_meters - b.distance_meters);
    row['_nearest_neighbors'] = neighbors;

    matrix[c1.id] = row;
    matrix[c1.code] = row;
  });

  return {
    total_cameras: CAMERAS.length,
    cameras,
    matrix,
  };
}

export const CAMERA_DISTANCE_DATA: CameraDistanceData = buildDistanceData();

export function getCameraDistance(fromCamId: string, toCamId: string): CameraDistanceTarget | null {
  const fromMatrix = CAMERA_DISTANCE_DATA.matrix[fromCamId];
  if (!fromMatrix) return null;
  const target = fromMatrix[toCamId];
  return target && !Array.isArray(target) ? (target as CameraDistanceTarget) : null;
}

export function getNearestCameras(camId: string, topN: number = 5): CameraDistanceTarget[] {
  const node = CAMERA_DISTANCE_DATA.matrix[camId];
  if (!node || !node._nearest_neighbors) return [];
  return (node._nearest_neighbors as CameraDistanceTarget[]).slice(0, topN);
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return Math.round(meters) + ' m';
  return (meters / 1000).toFixed(2) + ' km';
}