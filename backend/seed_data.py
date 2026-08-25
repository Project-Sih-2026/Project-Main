import uuid
from datetime import datetime, timedelta, timezone
from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.user import User
from app.models.camera import Camera
from app.models.detection import Detection
from app.models.watchlist import Watchlist
from app.models.alert import Alert, AlertAction
from app.models.retention_policy import RetentionPolicy
from app.services.ai_pipeline import generate_synthetic_evidence_image
from app.services.normalization import normalize_plate

def seed_database():
    db = SessionLocal()
    
    # 1. Seed Users
    if not db.query(User).filter(User.username == "admin").first():
        admin = User(
            id="usr-admin-01",
            username="admin",
            email="admin@citytraffic.gov",
            full_name="Chief Operations Supervisor",
            hashed_password=get_password_hash("admin123"),
            role="ROLE_ADMIN",
            is_active=True
        )
        operator = User(
            id="usr-oper-01",
            username="operator1",
            email="operator@citytraffic.gov",
            full_name="Sarah Chen (Lead Dispatcher)",
            hashed_password=get_password_hash("oper123"),
            role="ROLE_OPERATOR",
            is_active=True
        )
        analyst = User(
            id="usr-anal-01",
            username="analyst1",
            email="analyst@citytraffic.gov",
            full_name="Marcus Vance (Traffic Engineer)",
            hashed_password=get_password_hash("anal123"),
            role="ROLE_ANALYST",
            is_active=True
        )
        db.add_all([admin, operator, analyst])
        db.commit()
        print("Users seeded.")

    # 2. Seed Cameras
    initial_cameras = [
        Camera(
            id="CAM-022",
            name="CAM-022",
            designation="Intersection B-Alpha",
            district="Central District",
            sector="Sector 7",
            location_address="Central Ave · Intersection B-Alpha",
            latitude=40.7128,
            longitude=-74.0060,
            direction="Northbound",
            status="nominal",
            throughput_mbps=4.2,
            uptime_str="14d 6h 22m",
            ping_ms=18
        ),
        Camera(
            id="CAM-023",
            name="CAM-023",
            designation="Grand Boulevard East",
            district="Central District",
            sector="Sector 7",
            location_address="Grand Blvd & 5th Ave",
            latitude=40.7155,
            longitude=-74.0035,
            direction="Eastbound",
            status="scanning",
            throughput_mbps=3.8,
            uptime_str="8d 14h 10m",
            ping_ms=22
        ),
        Camera(
            id="CAM-024",
            name="CAM-024",
            designation="Harbor Expressway North",
            district="Waterfront District",
            sector="Sector 8",
            location_address="Harbor Expwy & Dock St",
            latitude=40.7088,
            longitude=-74.0112,
            direction="Northbound",
            status="standby",
            throughput_mbps=4.0,
            uptime_str="21d 2h 45m",
            ping_ms=19
        ),
        Camera(
            id="CAM-025",
            name="CAM-025",
            designation="Tech Corridor Junction",
            district="Innovation Hub",
            sector="Sector 4",
            location_address="Silicon Way & Metro Dr",
            latitude=40.7220,
            longitude=-73.9980,
            direction="Southbound",
            status="standby",
            throughput_mbps=4.5,
            uptime_str="3d 11h 05m",
            ping_ms=16
        ),
        Camera(
            id="CAM-026",
            name="CAM-026",
            designation="Westside Tunnel Approach",
            district="West District",
            sector="Sector 7",
            location_address="Westway Rd & Tunnel Plaza",
            latitude=40.7190,
            longitude=-74.0140,
            direction="Westbound",
            status="nominal",
            throughput_mbps=4.1,
            uptime_str="30d 19h 12m",
            ping_ms=15
        ),
        Camera(
            id="CAM-027",
            name="CAM-027",
            designation="Financial Plaza South",
            district="Central District",
            sector="Sector 7",
            location_address="Market St & Exchange Pl",
            latitude=40.7075,
            longitude=-74.0090,
            direction="Southbound",
            status="nominal",
            throughput_mbps=4.3,
            uptime_str="19d 08h 33m",
            ping_ms=17
        )
    ]
    for cam in initial_cameras:
        if not db.query(Camera).filter(Camera.id == cam.id).first():
            db.add(cam)
    db.commit()
    print("Cameras seeded.")

    # 3. Seed Watchlists
    watchlists = [
        Watchlist(
            id="wl-001",
            normalized_plate="DL01AB1234",
            category="STOLEN_VEHICLE_REPORT",
            severity="CRITICAL",
            description="Reported stolen black sedan from Sector 3 parking complex. Verified police case filed.",
            case_number="POL-2026-8831",
            created_by="system_admin",
            is_active=True
        ),
        Watchlist(
            id="wl-002",
            normalized_plate="MH12DE5678",
            category="WARRANT_ADVISORY",
            severity="HIGH",
            description="Vehicle associated with active municipal warrant. Review observation stops carefully.",
            case_number="WRN-2026-0419",
            created_by="system_admin",
            is_active=True
        ),
        Watchlist(
            id="wl-003",
            normalized_plate="KA05MJ9988",
            category="TRAFFIC_VIOLATION",
            severity="MEDIUM",
            description="Repeat red-light violation advisory across Central Corridor.",
            case_number="TRF-2026-9092",
            created_by="system_admin",
            is_active=True
        )
    ]
    for wl in watchlists:
        if not db.query(Watchlist).filter(Watchlist.id == wl.id).first():
            db.add(wl)
    db.commit()
    print("Watchlists seeded.")

    # 4. Seed Detections & Journey Observations for DL-01-AB-1234 (stolen) across multiple cameras
    now = datetime.now(timezone.utc)
    journey_stops = [
        ("CAM-024", "DL-01-AB-1234", "DL01AB1234", "Sedan", now - timedelta(minutes=45)),
        ("CAM-027", "DL-01-AB-1234", "DL01AB1234", "Sedan", now - timedelta(minutes=30)),
        ("CAM-022", "DL-01-AB-1234", "DL01AB1234", "Sedan", now - timedelta(minutes=14)),
        ("CAM-023", "DL-01-AB-1234", "DL01AB1234", "Sedan", now - timedelta(minutes=4)),
    ]

    for idx, (cam_id, raw_p, norm_p, v_type, ts) in enumerate(journey_stops, 1):
        det_id = f"det-seed-stolen-{idx}"
        if not db.query(Detection).filter(Detection.id == det_id).first():
            full_uri, crop_uri, v_box, p_box = generate_synthetic_evidence_image(cam_id, raw_p, v_type)
            det = Detection(
                id=det_id,
                camera_id=cam_id,
                timestamp=ts,
                raw_plate_text=raw_p,
                normalized_plate_text=norm_p,
                confidence_score=0.96,
                ocr_confidence=0.94,
                model_version="YOLOv8-ANPR-v2.4",
                vehicle_type=v_type,
                evidence_image_uri=full_uri,
                plate_crop_uri=crop_uri,
                processing_status="COMPLETED",
                has_alert=True,
                alert_type="STOLEN_VEHICLE_REPORT"
            )
            db.add(det)
            
            # If last stop, add to alert queue
            if idx == len(journey_stops):
                alert = Alert(
                    id="alt-stolen-01",
                    detection_id=det.id,
                    camera_id=cam_id,
                    watchlist_id="wl-001",
                    plate_matched=norm_p,
                    category="STOLEN_VEHICLE_REPORT",
                    severity="CRITICAL",
                    status="NEW",
                    created_at=ts,
                    updated_at=ts
                )
                action = AlertAction(
                    id="act-stolen-01",
                    alert_id="alt-stolen-01",
                    user_id="sys-engine",
                    username="Automated Watchlist Matcher",
                    action="TRIGGER_ALERT",
                    from_status="NONE",
                    to_status="NEW",
                    notes="Possible watchlist match detected at CAM-023",
                    created_at=ts
                )
                db.add_all([alert, action])
    db.commit()

    # 5. Additional diverse vehicle detections
    other_samples = [
        ("CAM-022", "MH-12-DE-5678", "MH12DE5678", "SUV", now - timedelta(minutes=10), True, "WARRANT_ADVISORY"),
        ("CAM-022", "WB-02-AK-4433", "WB02AK4433", "Transit Van", now - timedelta(minutes=7), False, None),
        ("CAM-026", "HR-26-DK-2020", "HR26DK2020", "SUV", now - timedelta(minutes=5), False, None),
        ("CAM-022", "TN-09-CQ-7711", "TN09CQ7711", "Sedan", now - timedelta(minutes=2), False, None),
        ("CAM-023", "UP-32-BN-8800", "UP32BN8800", "Motorcycle", now - timedelta(minutes=1), False, None),
    ]

    for idx, (cam_id, raw_p, norm_p, v_type, ts, has_alt, alt_type) in enumerate(other_samples, 10):
        det_id = f"det-seed-sample-{idx}"
        if not db.query(Detection).filter(Detection.id == det_id).first():
            full_uri, crop_uri, _, _ = generate_synthetic_evidence_image(cam_id, raw_p, v_type)
            det = Detection(
                id=det_id,
                camera_id=cam_id,
                timestamp=ts,
                raw_plate_text=raw_p,
                normalized_plate_text=norm_p,
                confidence_score=0.94,
                ocr_confidence=0.91,
                model_version="YOLOv8-ANPR-v2.4",
                vehicle_type=v_type,
                evidence_image_uri=full_uri,
                plate_crop_uri=crop_uri,
                processing_status="COMPLETED",
                has_alert=has_alt,
                alert_type=alt_type
            )
            db.add(det)
            if has_alt:
                alert = Alert(
                    id=f"alt-warrant-{idx}",
                    detection_id=det.id,
                    camera_id=cam_id,
                    watchlist_id="wl-002",
                    plate_matched=norm_p,
                    category=alt_type,
                    severity="HIGH",
                    status="ACKNOWLEDGED",
                    assigned_to="operator1",
                    created_at=ts,
                    updated_at=ts
                )
                db.add(alert)
    db.commit()

    # 6. Retention Policies
    policies = [
        RetentionPolicy(
            id="pol-01",
            name="CCTV Video Evidence Patches",
            data_type="RAW_VIDEO_EVIDENCE",
            retention_days=30,
            auto_purge_enabled=True,
            last_purged_at=now - timedelta(days=2)
        ),
        RetentionPolicy(
            id="pol-02",
            name="Plate Detection Metadata",
            data_type="DETECTION_METADATA",
            retention_days=90,
            auto_purge_enabled=True,
            last_purged_at=now - timedelta(days=2)
        ),
        RetentionPolicy(
            id="pol-03",
            name="Operator Audit Trails",
            data_type="AUDIT_LOGS",
            retention_days=365,
            auto_purge_enabled=False,
            last_purged_at=None
        )
    ]
    for pol in policies:
        if not db.query(RetentionPolicy).filter(RetentionPolicy.id == pol.id).first():
            db.add(pol)
    db.commit()
    print("Database seeding completed successfully!")
    db.close()

if __name__ == "__main__":
    seed_database()
