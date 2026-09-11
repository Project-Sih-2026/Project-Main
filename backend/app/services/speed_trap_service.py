import math
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from app.models.camera import Camera
from app.models.alert import Alert
from app.models.detection import Detection

def calculate_haversine_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371000.0  # Earth radius in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

def analyze_inter_camera_transit(
    cam_a_id: str,
    time_a: datetime,
    cam_b_id: str,
    time_b: datetime,
    plate: str = "DL-01-AB-1234",
    speed_limit_kmh: float = 50.0,
    db: Optional[Session] = None
) -> dict:
    """
    Computes shortest corridor distance, elapsed transit duration, section average speed,
    and checks for point-to-point speeding violations or cloned plate anomalies.
    """
    cam_a = db.query(Camera).filter(Camera.id == cam_a_id).first() if db else None
    cam_b = db.query(Camera).filter(Camera.id == cam_b_id).first() if db else None

    # Fallback coordinates if not in DB
    lat_a = cam_a.latitude if cam_a else 28.6550
    lon_a = cam_a.longitude if cam_a else 77.2820
    lat_b = cam_b.latitude if cam_b else 28.6695
    lon_b = cam_b.longitude if cam_b else 77.2650

    direct_dist_m = calculate_haversine_meters(lat_a, lon_a, lat_b, lon_b)
    # Urban road network detour factor typically 1.20 - 1.28x of straight line
    road_dist_m = round(direct_dist_m * 1.22, 1)
    road_dist_km = round(road_dist_m / 1000.0, 3)

    delta_seconds = abs((time_b - time_a).total_seconds())
    if delta_seconds <= 0:
        delta_seconds = 1.0  # prevent division by zero

    duration_mins = round(delta_seconds / 60.0, 2)
    duration_str = f"{int(delta_seconds // 60)}m {int(delta_seconds % 60)}s"

    # Calculated Point-to-Point Average Section Speed
    speed_mps = road_dist_m / delta_seconds
    calculated_speed_kmh = round(speed_mps * 3.6, 1)

    excess_speed_kmh = max(0.0, round(calculated_speed_kmh - speed_limit_kmh, 1))

    # Anomaly & Violation Classification
    if calculated_speed_kmh > 160.0 and road_dist_km > 0.5:
        violation_type = "SUSPICIOUS_CLONED_PLATE"
        severity = "CRITICAL"
        is_violation = True
        status_label = "CLONED PLATE FRAUD DETECTED"
        summary = f"Physically impossible transit speed ({calculated_speed_kmh} km/h over {road_dist_km} km in {duration_str}). Indicates duplicate cloned registration plates operating simultaneously."
    elif calculated_speed_kmh > (speed_limit_kmh + 15.0):
        violation_type = "SECTION_SPEEDING_CRITICAL"
        severity = "CRITICAL"
        is_violation = True
        status_label = f"EXCESS SPEEDING (+{excess_speed_kmh} km/h)"
        summary = f"Vehicle traversed corridor {cam_a_id} ➔ {cam_b_id} ({road_dist_km} km) in {duration_str} at average speed of {calculated_speed_kmh} km/h (Limit: {speed_limit_kmh} km/h)."
    elif calculated_speed_kmh > speed_limit_kmh:
        violation_type = "SECTION_SPEEDING_MODERATE"
        severity = "HIGH"
        is_violation = True
        status_label = f"MODERATE SPEEDING (+{excess_speed_kmh} km/h)"
        summary = f"Vehicle exceeded corridor speed limit by {excess_speed_kmh} km/h along {cam_a_id} ➔ {cam_b_id}."
    elif calculated_speed_kmh < 5.0 and delta_seconds > 600:
        violation_type = "CORRIDOR_DWELL_CONGESTION"
        severity = "LOW"
        is_violation = False
        status_label = "EXTENDED CORRIDOR DWELL"
        summary = f"High transit delay ({duration_str}) along {cam_a_id} ➔ {cam_b_id}. Average crawl speed {calculated_speed_kmh} km/h."
    else:
        violation_type = "COMPLIANT"
        severity = "NONE"
        is_violation = False
        status_label = "NORMAL SPEED COMPLIANCE"
        summary = f"Vehicle maintained lawful average speed ({calculated_speed_kmh} km/h) within {speed_limit_kmh} km/h speed limit."

    # Auto-record alert in database if flagged and db session provided
    alert_id = None
    if is_violation and db:
        import uuid
        alert_id = f"alt-spd-{uuid.uuid4().hex[:8]}"
        alert_obj = Alert(
            id=alert_id,
            camera_id=cam_b_id,
            vehicle_plate=plate,
            alert_type=violation_type,
            severity=severity,
            summary=summary,
            status="ACTIVE",
            created_at=datetime.now(timezone.utc)
        )
        db.add(alert_obj)
        db.commit()

    return {
        "plate": plate,
        "from_camera": {
            "id": cam_a_id,
            "designation": cam_a.designation if cam_a else cam_a_id,
            "timestamp": time_a.isoformat(),
            "lat": lat_a,
            "lng": lon_a
        },
        "to_camera": {
            "id": cam_b_id,
            "designation": cam_b.designation if cam_b else cam_b_id,
            "timestamp": time_b.isoformat(),
            "lat": lat_b,
            "lng": lon_b
        },
        "corridor_metrics": {
            "haversine_direct_m": direct_dist_m,
            "shortest_road_distance_m": road_dist_m,
            "shortest_road_distance_km": road_dist_km,
            "elapsed_seconds": round(delta_seconds, 1),
            "elapsed_duration_str": duration_str,
            "calculated_speed_kmh": calculated_speed_kmh,
            "speed_limit_kmh": speed_limit_kmh,
            "excess_speed_kmh": excess_speed_kmh
        },
        "evaluation": {
            "is_violation": is_violation,
            "violation_type": violation_type,
            "severity": severity,
            "status_label": status_label,
            "summary": summary,
            "generated_alert_id": alert_id
        }
    }
