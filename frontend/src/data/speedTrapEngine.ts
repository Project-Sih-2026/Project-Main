import { CAMERAS, camById, type Camera } from './mock';
import { getCameraDistance } from './cameraDistances';

export interface InterCameraSpeedResult {
  plate: string;
  fromCam: Camera;
  timeA: string;
  toCam: Camera;
  timeB: string;
  directDistanceM: number;
  shortestRoadDistanceM: number;
  shortestRoadDistanceKm: number;
  elapsedSeconds: number;
  elapsedDurationStr: string;
  calculatedSpeedKmh: number;
  speedLimitKmh: number;
  excessSpeedKmh: number;
  isViolation: boolean;
  violationType: 'CRITICAL_SPEEDING' | 'MODERATE_SPEEDING' | 'SUSPICIOUS_CLONE' | 'DWELL_CONGESTION' | 'COMPLIANT';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'good';
  statusLabel: string;
  summary: string;
}

/**
 * Calculates point-to-point transit speed between any two camera observations.
 * Supports custom times in format 'HH:MM' or ISO timestamp.
 */
export function calculateInterCameraSpeed(
  fromCamId: string,
  timeAStr: string,
  toCamId: string,
  timeBStr: string,
  plate: string = 'DL-01-AB-1234',
  speedLimitKmh: number = 50
): InterCameraSpeedResult | null {
  const camA = camById(fromCamId);
  const camB = camById(toCamId);
  if (!camA || !camB) return null;

  // 1. Calculate road distance
  const distObj = getCameraDistance(camA.id, camB.id);
  const directDistM = distObj ? distObj.distance_meters : Math.hypot(camA.lat - camB.lat, camA.lng - camB.lng) * 111000;
  const roadDistM = Math.round(directDistM * 1.22);
  const roadDistKm = Number((roadDistM / 1000).toFixed(2));

  // 2. Parse time difference
  const parseSeconds = (t: string): number => {
    if (t.includes('T')) {
      return new Date(t).getTime() / 1000;
    }
    const parts = t.split(':').map(Number);
    if (parts.length >= 2) {
      return parts[0] * 3600 + parts[1] * 60 + (parts[2] || 0);
    }
    return 0;
  };

  let deltaSec = Math.abs(parseSeconds(timeBStr) - parseSeconds(timeAStr));
  if (deltaSec <= 0) deltaSec = 60; // default 1 min fallback

  const mins = Math.floor(deltaSec / 60);
  const secs = Math.round(deltaSec % 60);
  const durationStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

  // 3. Calculate Speed
  const calculatedSpeed = Number(((roadDistM / deltaSec) * 3.6).toFixed(1));
  const excess = Math.max(0, Number((calculatedSpeed - speedLimitKmh).toFixed(1)));

  // 4. Anomaly Evaluation
  let violationType: InterCameraSpeedResult['violationType'] = 'COMPLIANT';
  let severity: InterCameraSpeedResult['severity'] = 'good';
  let isViolation = false;
  let statusLabel = 'NORMAL SPEED COMPLIANT';
  let summary = `Maintained lawful average speed (${calculatedSpeed} km/h) along ${camA.code} ➔ ${camB.code} (Speed Limit: ${speedLimitKmh} km/h).`;

  if (calculatedSpeed > 160 && roadDistKm > 0.4) {
    violationType = 'SUSPICIOUS_CLONE';
    severity = 'critical';
    isViolation = true;
    statusLabel = 'CLONED NUMBER PLATE FRAUD';
    summary = `Physically impossible transit (${calculatedSpeed} km/h across ${roadDistKm} km in ${durationStr}). High probability of cloned duplicate plates!`;
  } else if (calculatedSpeed > speedLimitKmh + 15) {
    violationType = 'CRITICAL_SPEEDING';
    severity = 'critical';
    isViolation = true;
    statusLabel = `CRITICAL SPEEDING (+${excess} km/h)`;
    summary = `Exceeded speed limit by +${excess} km/h traversing ${camA.code} ➔ ${camB.code} in ${durationStr} (${calculatedSpeed} km/h vs ${speedLimitKmh} km/h limit).`;
  } else if (calculatedSpeed > speedLimitKmh) {
    violationType = 'MODERATE_SPEEDING';
    severity = 'high';
    isViolation = true;
    statusLabel = `SPEED VIOLATION (+${excess} km/h)`;
    summary = `Point-to-point section speed of ${calculatedSpeed} km/h exceeded the ${speedLimitKmh} km/h corridor speed limit.`;
  } else if (calculatedSpeed < 6 && deltaSec > 400) {
    violationType = 'DWELL_CONGESTION';
    severity = 'low';
    statusLabel = 'HEAVY TRAFFIC DWELL';
    summary = `High transit delay (${durationStr}) along ${camA.code} ➔ ${camB.code}. Average crawl speed ${calculatedSpeed} km/h.`;
  }

  return {
    plate,
    fromCam: camA,
    timeA: timeAStr,
    toCam: camB,
    timeB: timeBStr,
    directDistanceM: Math.round(directDistM),
    shortestRoadDistanceM: roadDistM,
    shortestRoadDistanceKm: roadDistKm,
    elapsedSeconds: deltaSec,
    elapsedDurationStr: durationStr,
    calculatedSpeedKmh: calculatedSpeed,
    speedLimitKmh,
    excessSpeedKmh: excess,
    isViolation,
    violationType,
    severity,
    statusLabel,
    summary,
  };
}
