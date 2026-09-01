from typing import Dict, List


class CityTrafficAnalyticsEngine:
    """
    GIS-Integrated City Traffic Analytics & Heatmap Intelligence Engine.
    Computes Level-of-Service (LoS), corridor congestion indexes, flow densities, and bottlenecks.
    """

    FREE_FLOW_SPEEDS = {
        "Expressway / Highway (DND / NH-48)": 80.0,
        "Arterial Ring Road (AIIMS / Moti Bagh)": 60.0,
        "City Core (Connaught / Janpath)": 45.0,
        "Diplomatic Zone (Shanti Path)": 50.0
    }

    @classmethod
    def calculate_level_of_service(cls, observed_avg_speed: float, corridor_type: str = "Arterial Ring Road (AIIMS / Moti Bagh)") -> Dict:
        """
        Computes Highway Capacity Manual Level-of-Service (LoS A through F).
        """
        free_flow = cls.FREE_FLOW_SPEEDS.get(corridor_type, 55.0)
        speed_ratio = observed_avg_speed / free_flow

        if speed_ratio >= 0.85:
            los = "LoS A (Free Flow)"
            congestion_score = 15
        elif speed_ratio >= 0.70:
            los = "LoS B (Reasonably Free Flow)"
            congestion_score = 35
        elif speed_ratio >= 0.55:
            los = "LoS C (Stable Flow)"
            congestion_score = 55
        elif speed_ratio >= 0.40:
            los = "LoS D (Approaching Unstable Flow)"
            congestion_score = 72
        elif speed_ratio >= 0.25:
            los = "LoS E (Unstable Flow - Capacity Limit)"
            congestion_score = 88
        else:
            los = "LoS F (Forced Breakdown / Gridlock)"
            congestion_score = 98

        return {
            "corridor_type": corridor_type,
            "free_flow_speed_kph": free_flow,
            "observed_speed_kph": round(observed_avg_speed, 1),
            "speed_ratio": round(speed_ratio, 2),
            "level_of_service": los,
            "congestion_score_100": congestion_score
        }

    @classmethod
    def generate_corridor_analytics(cls, camera_stats: List[Dict]) -> Dict:
        """
        Analyzes network-wide camera stats and produces congestion ranking & bottleneck alerts.
        """
        corridor_reports = []
        total_veh = 0
        bottlenecks = []

        for cam in camera_stats:
            code = cam.get("code", "CAM-01")
            name = cam.get("name", "Corridor Node")
            zone = cam.get("zone", "Central")
            speed = cam.get("avg_speed", 35.0)
            vol = cam.get("volume_today", 15000)
            total_veh += vol

            corr_type = "Expressway / Highway (DND / NH-48)" if "DND" in name or "NH" in name else "City Core (Connaught / Janpath)" if "Connaught" in name or "Janpath" in name else "Arterial Ring Road (AIIMS / Moti Bagh)"
            los_data = cls.calculate_level_of_service(speed, corr_type)

            report = {
                "camera_code": code,
                "corridor_name": name,
                "zone": zone,
                "volume_today": vol,
                "level_of_service": los_data["level_of_service"],
                "congestion_score": los_data["congestion_score_100"]
            }
            corridor_reports.append(report)

            if los_data["congestion_score_100"] >= 75:
                bottlenecks.append({
                    "corridor": f"{code} ({name})",
                    "congestion_score": los_data["congestion_score_100"],
                    "observed_speed": f"{speed} km/h",
                    "severity": "CRITICAL" if los_data["congestion_score_100"] >= 88 else "HIGH"
                })

        # Sort by congestion score descending
        corridor_reports.sort(key=lambda x: x["congestion_score"], reverse=True)

        return {
            "status": "SUCCESS",
            "total_network_vehicles": total_veh,
            "active_corridors_analyzed": len(corridor_reports),
            "active_bottlenecks_detected": len(bottlenecks),
            "bottlenecks": bottlenecks,
            "top_congested_corridors": corridor_reports[:5]
        }
