import math
from app.models.camera import Camera

def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371000.0  # Earth radius in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

def calculate_bearing(lat1: float, lon1: float, lat2: float, lon2: float) -> tuple[float, str]:
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dlam = math.radians(lon2 - lon1)
    y = math.sin(dlam) * math.cos(phi2)
    x = math.cos(phi1) * math.sin(phi2) - math.sin(phi1) * math.cos(phi2) * math.cos(dlam)
    deg = (math.degrees(math.atan2(y, x)) + 360) % 360
    compass = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
    idx = int((deg + 11.25) / 22.5) % 16
    return round(deg, 1), compass[idx]

def compute_camera_distances_matrix(cameras: list[Camera], urban_speed_kmh: float = 30.0) -> dict:
    speed_mps = (urban_speed_kmh * 1000.0) / 3600.0
    camera_lookup = {
        c.id: {
            "id": c.id,
            "code": c.name,
            "designation": c.designation,
            "district": c.district,
            "sector": c.sector,
            "lat": c.latitude,
            "lng": c.longitude,
            "direction": c.direction
        }
        for c in cameras
    }

    matrix: dict[str, dict] = {}
    all_pairs: list[dict] = []

    for c1 in cameras:
        matrix[c1.id] = {}
        neighbors: list[dict] = []
        for c2 in cameras:
            if c1.id == c2.id:
                matrix[c1.id][c2.id] = {
                    "target_id": c2.id,
                    "target_name": c2.designation,
                    "distance_meters": 0.0,
                    "distance_km": 0.0,
                    "est_transit_mins": 0.0,
                    "est_transit_secs": 0,
                    "bearing_deg": 0.0,
                    "cardinal_direction": "-"
                }
                continue

            dist_m = haversine_distance_meters(c1.latitude, c1.longitude, c2.latitude, c2.longitude)
            dist_km = round(dist_m / 1000.0, 3)
            est_secs = round(dist_m / speed_mps)
            est_mins = round(est_secs / 60.0, 1)
            brg_deg, brg_cardinal = calculate_bearing(c1.latitude, c1.longitude, c2.latitude, c2.longitude)

            entry = {
                "target_id": c2.id,
                "target_name": c2.designation,
                "distance_meters": dist_m,
                "distance_km": dist_km,
                "est_transit_mins": est_mins,
                "est_transit_secs": est_secs,
                "bearing_deg": brg_deg,
                "cardinal_direction": brg_cardinal
            }
            matrix[c1.id][c2.id] = entry
            neighbors.append(entry)

            all_pairs.append({
                "from_id": c1.id,
                "from_name": c1.designation,
                "to_id": c2.id,
                "to_name": c2.designation,
                "distance_meters": dist_m,
                "distance_km": dist_km,
                "est_transit_mins": est_mins,
                "bearing": f"{brg_deg}° ({brg_cardinal})"
            })

        neighbors.sort(key=lambda x: x["distance_meters"])
        matrix[c1.id]["_nearest_neighbors"] = neighbors[:6]

    return {
        "total_cameras": len(cameras),
        "urban_speed_reference_kmh": urban_speed_kmh,
        "cameras": list(camera_lookup.values()),
        "matrix": matrix,
        "all_pairs_count": len(all_pairs),
        "pairwise_records": all_pairs
    }
