import time
from typing import Dict, List, Optional


class RealTimeAlertEngine:
    """
    Real-Time Watchlist, BOLO, and Anomaly Triage Alert System.
    Provides sub-millisecond hash lookups against blacklisted vehicles,
    automated incident generation, and dispatch directives.
    """

    # In-Memory Blacklist & Watchlist Registry (O(1) Hash Map)
    WATCHLIST_DATABASE = {
        "HR-38-T-1103": {
            "status": "FLAGGED",
            "category": "STOLEN_VEHICLE",
            "fir_number": "FIR #7741",
            "police_station": "Sarita Vihar Police Station",
            "severity": "CRITICAL",
            "action": "Immediate Intercept Unit Dispatched"
        },
        "UP-16-AX-5177": {
            "status": "FLAGGED",
            "category": "HIT_AND_RUN_BOLO",
            "fir_number": "BOLO #5512",
            "police_station": "Barakhamba Road Police Station",
            "severity": "CRITICAL",
            "action": "Impound & Forensics Inspection Order Active"
        },
        "DL-01-AB-4821": {
            "status": "WATCHLIST",
            "category": "VIP_CORRIDOR_SECURITY_INTEREST",
            "fir_number": "Case #2291",
            "police_station": "Special Cell NCR Unit",
            "severity": "HIGH",
            "action": "Passive Shadow Unit & Telemetry Tracking"
        },
        "HR-26-DK-2258": {
            "status": "WATCHLIST",
            "category": "CHRONIC_SPEED_REDLIGHT_OFFENDER",
            "fir_number": "Challan #CH-9921",
            "police_station": "Traffic Enforcement Headquarters",
            "severity": "MEDIUM",
            "action": "Automated e-Challan & Notice Queued"
        },
        "HR-55-AG-9910": {
            "status": "FLAGGED",
            "category": "OVERWEIGHT_PERMIT_BREACH",
            "fir_number": "WIM-114%",
            "police_station": "Commercial Transport Department",
            "severity": "HIGH",
            "action": "Divert to Weighbridge Toll Inspection"
        }
    }

    @classmethod
    def evaluate_detection(cls, plate: str, camera_code: str, speed_kph: float, timestamp: str) -> Dict:
        """
        Evaluates a live ANPR detection against watchlists and behavioral anomaly rules.
        """
        clean_plate = plate.replace(" ", "").upper()
        hit = cls.WATCHLIST_DATABASE.get(clean_plate)

        alerts = []
        is_flagged = False
        compliance_status = "CLEAR"

        # 1. Watchlist / Blacklist Check
        if hit:
            is_flagged = True
            compliance_status = hit["status"]
            alerts.append({
                "alert_id": f"ALT-{int(time.time() * 1000) % 100000}",
                "severity": hit["severity"],
                "category": hit["category"],
                "headline": f"{hit['category']} — {plate} observed at {camera_code}",
                "fir_reference": hit["fir_number"],
                "jurisdiction": hit["police_station"],
                "action_directive": hit["action"],
                "timestamp": timestamp
            })

        # 2. Dynamic Behavioral Anomalies (Excessive Speed)
        if speed_kph > 105.0:
            alerts.append({
                "alert_id": f"ALT-SPD-{int(time.time() * 1000) % 100000}",
                "severity": "HIGH",
                "category": "EXCESSIVE_SPEEDING_DANGER",
                "headline": f"Dangerous Overspeed: {speed_kph} km/h logged on {camera_code}",
                "fir_reference": "Automated Motor Vehicles Act Sec 183",
                "jurisdiction": "Automated ANPR Radar Enforcement",
                "action_directive": "Trigger Overhead Variable Message Sign & Issue e-Challan",
                "timestamp": timestamp
            })

        return {
            "plate_number": plate,
            "camera_code": camera_code,
            "speed_kph": speed_kph,
            "timestamp": timestamp,
            "compliance_status": compliance_status,
            "is_flagged": is_flagged,
            "active_alerts_count": len(alerts),
            "alerts": alerts
        }
