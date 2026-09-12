import { CAMERAS, camById, type Vehicle, type TrafficAlert, type JourneyEvent, type VehicleType, type VehicleStatus, type Severity, type AlertStatus } from '../data/mock';
import type { Detection, AlertItem } from '../types';

export function normalizeVehicleType(raw?: string): VehicleType {
  if (!raw) return 'Sedan';
  const r = raw.toLowerCase();
  if (r.includes('ambulance') || r.includes('emergency')) return 'Ambulance';
  if (r.includes('suv')) return 'SUV';
  if (r.includes('truck') || r.includes('tipper') || r.includes('lorry')) return 'Truck';
  if (r.includes('bus')) return 'Bus';
  if (r.includes('two') || r.includes('bike') || r.includes('motorcycle') || r.includes('scooter')) return 'Two-wheeler';
  if (r.includes('van') || r.includes('traveller')) return 'Van';
  return 'Sedan';
}

function timeSince(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const diffMins = Math.max(0, Math.floor((Date.now() - d.getTime()) / 60000));
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const hours = Math.floor(diffMins / 60);
    if (hours < 24) return `${hours} hr ago`;
    return `${Math.floor(hours / 24)} d ago`;
  } catch {
    return 'recently';
  }
}

export function detectionsToVehicles(detections: Detection[]): Vehicle[] {
  if (!Array.isArray(detections) || detections.length === 0) {
    return [];
  }

  const map = new Map<string, Detection[]>();
  for (const det of detections) {
    const key = (det.normalized_plate_text || det.raw_plate_text || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!key) continue;
    const existing = map.get(key) || [];
    existing.push(det);
    map.set(key, existing);
  }

  const vehicles: Vehicle[] = [];

  map.forEach((sightings, plateKey) => {
    sightings.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const latest = sightings[sightings.length - 1];

    const cam = camById(latest.camera_id) || CAMERAS.find((c) => c.code === latest.camera_id) || CAMERAS[0];
    const hasAnyAlert = sightings.some((s) => s.has_alert);
    const status: VehicleStatus = hasAnyAlert ? 'flagged' : 'clear';

    let owner = latest.owner_name?.trim() || 'Registered Citizen';
    let make = 'Vehicle';
    let model = latest.vehicle_type || 'Standard';

    if (owner.includes('(') && owner.includes(')')) {
      const match = owner.match(/^(.*?)\s*\((.*?)\)$/);
      if (match) {
        owner = match[1].trim();
        const carInfo = match[2].trim().split(' ');
        make = carInfo[0] || 'Vehicle';
        model = carInfo.slice(1).join(' ') || latest.vehicle_type;
      }
    }

    const journey: JourneyEvent[] = sightings.map((s, idx) => {
      const sCam = camById(s.camera_id) || CAMERAS.find((c) => c.code === s.camera_id);
      const tStr = new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return {
        t: tStr,
        cam: s.camera_id,
        loc: sCam?.name || s.camera_id,
        speed: Math.round(28 + (s.confidence_score * 16) + (idx % 5)),
        dir: sCam?.heading?.split(' ')[0] || 'Northbound',
        note: s.has_alert ? `Alert flag: ${s.alert_type}` : `OCR: ${Math.round(s.ocr_confidence * 100)}%`,
      };
    });

    vehicles.push({
      id: latest.id,
      plate: latest.normalized_plate_text || latest.raw_plate_text,
      make,
      model,
      color: normalizeVehicleType(latest.vehicle_type) === 'Ambulance' ? 'Emergency White/Red' : 'Titanium Grey',
      type: normalizeVehicleType(latest.vehicle_type),
      owner,
      license: `DL-REG-${plateKey.slice(-4) || '2026'}`,
      status,
      flaggedReason: hasAnyAlert ? `System flagged match on CCTV corridor: ${latest.alert_type || 'Watchlist'}` : undefined,
      speed: Math.round(30 + (latest.confidence_score * 15)),
      lastCam: latest.camera_id,
      lastSeen: timeSince(latest.timestamp),
      kmToday: Math.max(12, sightings.length * 8),
      tags: ['live-database', 'yolov8-anpr', ...(hasAnyAlert ? ['flagged-alert'] : []), ...(normalizeVehicleType(latest.vehicle_type) === 'Ambulance' ? ['ambulance-corridor'] : [])],
      journey,
      road: 0,
      prog: Math.min(0.9, Math.max(0.1, (cam?.x || 300) / 700)),
      dir: 1,
      _rawTimestamp: new Date(latest.timestamp).getTime(),
    } as any);
  });

  // Most recent vehicle sightings first
  vehicles.sort((a: any, b: any) => (b._rawTimestamp || 0) - (a._rawTimestamp || 0));

  return vehicles;
}

export function detectionsToAlerts(detections: Detection[]): TrafficAlert[] {
  if (!Array.isArray(detections)) return [];

  const alerts: TrafficAlert[] = [];

  detections.filter((d) => d.has_alert).forEach((d) => {
    const cam = camById(d.camera_id) || CAMERAS.find((c) => c.code === d.camera_id);
    const diffMins = Math.max(1, Math.floor((Date.now() - new Date(d.timestamp).getTime()) / 60000));
    alerts.push({
      id: `alt-${d.id}`,
      severity: 'critical',
      type: d.alert_type || 'Watchlist',
      title: `${d.alert_type || 'Alert Flag'} — ${d.normalized_plate_text || d.raw_plate_text} at ${cam?.name || d.camera_id}`,
      vehicleId: d.id,
      cameraId: cam?.id || 'c1',
      zone: cam?.district || 'Krishna Nagar',
      minsAgo: diffMins,
      status: 'open',
      detail: `Vehicle registration ${d.normalized_plate_text || d.raw_plate_text} detected at ${cam?.name || d.camera_id} (${d.camera_id}) with ${Math.round(d.confidence_score * 100)}% detection confidence. Review status: ${d.processing_status}.`
    });
  });

  return alerts;
}

export function backendAlertsToTrafficAlerts(backendAlerts: AlertItem[], detections: Detection[]): TrafficAlert[] {
  if (!Array.isArray(backendAlerts)) return [];
  const detMap = new Map<string, Detection>();
  detections.forEach((d) => detMap.set(d.id, d));

  return backendAlerts.map((ba) => {
    const det = ba.detection || detMap.get(ba.detection_id);
    const cam = camById(ba.camera_id) || CAMERAS.find((c) => c.code === ba.camera_id) || CAMERAS[0];
    const diffMins = Math.max(1, Math.floor((Date.now() - new Date(ba.created_at).getTime()) / 60000));

    let status: AlertStatus = 'open';
    if (ba.status === 'ACKNOWLEDGED' || ba.status === 'ASSIGNED') status = 'acknowledged';
    if (ba.status === 'RESOLVED' || ba.status === 'DISMISSED') status = 'resolved';

    let severity: Severity = 'critical';
    if (ba.severity === 'HIGH') severity = 'high';
    if (ba.severity === 'MEDIUM') severity = 'medium';
    if (ba.severity === 'LOW') severity = 'low';

    const catLabel = (ba.category || 'WATCHLIST_HIT').replace(/_/g, ' ');
    return {
      id: ba.id,
      severity,
      type: catLabel,
      title: `${catLabel} — ${ba.plate_matched || 'Plate'} at ${cam?.name || ba.camera_id}`,
      vehicleId: det?.id || ba.detection_id,
      cameraId: cam?.id || 'c1',
      zone: cam?.district || 'Krishna Nagar',
      minsAgo: diffMins,
      status,
      detail: `Watchlist match: ${ba.plate_matched || 'Vehicle'} detected at ${cam?.name || ba.camera_id} (${ba.camera_id}). Category: ${catLabel}. Assigned: ${ba.assigned_to || 'Unassigned'}. Status: ${ba.status || 'OPEN'}.`
    };
  });
}
