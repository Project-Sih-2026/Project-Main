import uuid
from datetime import datetime, timedelta, timezone
from app.core.database import SessionLocal, Base, engine
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
    Base.metadata.create_all(bind=engine)
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
    # 2. Seed Cameras (20 High-Density Intersections in Krishna Nagar & Gandhi Nagar)
    initial_cameras = [
        # --- Krishna Nagar (CAM-KN-01 to CAM-KN-10) ---
        Camera(id="CAM-KN-01", name="CAM-KN-01", designation="Lal Quarter Market Chowk", district="Krishna Nagar", sector="East Delhi Core", location_address="Lal Quarter Main Market, Krishna Nagar", latitude=28.6575, longitude=77.2795, direction="Northbound", status="nominal", throughput_mbps=4.5, uptime_str="28d 4h 12m", ping_ms=15),
        Camera(id="CAM-KN-02", name="CAM-KN-02", designation="Vijay Chowk Crossing", district="Krishna Nagar", sector="East Delhi Core", location_address="Vijay Chowk Central Intersection, Krishna Nagar", latitude=28.6550, longitude=77.2820, direction="Eastbound", status="nominal", throughput_mbps=4.2, uptime_str="14d 6h 22m", ping_ms=18),
        Camera(id="CAM-KN-03", name="CAM-KN-03", designation="Krishna Nagar Metro Station", district="Krishna Nagar", sector="Main Vikas Marg Link", location_address="Vikas Marg & Metro Gate 1, Krishna Nagar", latitude=28.6515, longitude=77.2805, direction="Westbound", status="nominal", throughput_mbps=4.8, uptime_str="21d 12h 05m", ping_ms=12),
        Camera(id="CAM-KN-04", name="CAM-KN-04", designation="Jheel Khurenja Chowk", district="Krishna Nagar", sector="West Corridor", location_address="Jheel Khurenja Main T-Point, Krishna Nagar", latitude=28.6590, longitude=77.2755, direction="Northbound", status="scanning", throughput_mbps=3.9, uptime_str="8d 14h 10m", ping_ms=21),
        Camera(id="CAM-KN-05", name="CAM-KN-05", designation="Chander Nagar Junction", district="Krishna Nagar", sector="North Corridor", location_address="Chander Nagar Road & Krishna Nagar Link", latitude=28.6610, longitude=77.2835, direction="Southbound", status="nominal", throughput_mbps=4.1, uptime_str="30d 19h 12m", ping_ms=14),
        Camera(id="CAM-KN-06", name="CAM-KN-06", designation="Swarn Cinema Road Intersection", district="Krishna Nagar", sector="South Corridor", location_address="Swarn Cinema Road & Radhey Puri Link", latitude=28.6535, longitude=77.2765, direction="Eastbound", status="nominal", throughput_mbps=4.0, uptime_str="19d 8h 33m", ping_ms=17),
        Camera(id="CAM-KN-07", name="CAM-KN-07", designation="Radhey Puri Main Market", district="Krishna Nagar", sector="West Corridor", location_address="Radhey Puri Main Market Chowk, Krishna Nagar", latitude=28.6560, longitude=77.2725, direction="Westbound", status="nominal", throughput_mbps=4.3, uptime_str="12d 3h 40m", ping_ms=16),
        Camera(id="CAM-KN-08", name="CAM-KN-08", designation="East Azad Nagar Metro Link", district="Krishna Nagar", sector="North-East Link", location_address="East Azad Nagar Main Road, Krishna Nagar", latitude=28.6645, longitude=77.2800, direction="Northbound", status="standby", throughput_mbps=3.7, uptime_str="5d 22h 10m", ping_ms=24),
        Camera(id="CAM-KN-09", name="CAM-KN-09", designation="Kanti Nagar Extension Crossing", district="Krishna Nagar", sector="North Corridor", location_address="Kanti Nagar Ext. & Circular Road Crossing", latitude=28.6670, longitude=77.2780, direction="Southbound", status="nominal", throughput_mbps=4.4, uptime_str="17d 11h 18m", ping_ms=13),
        Camera(id="CAM-KN-10", name="CAM-KN-10", designation="Old Anarkali Road Junction", district="Krishna Nagar", sector="East Corridor", location_address="Old Anarkali Rd & Jagat Puri Border", latitude=28.6585, longitude=77.2865, direction="Eastbound", status="nominal", throughput_mbps=4.2, uptime_str="25d 7h 00m", ping_ms=19),

        # --- Gandhi Nagar (CAM-GN-01 to CAM-GN-10) ---
        Camera(id="CAM-GN-01", name="CAM-GN-01", designation="Gandhi Nagar Textile Market", district="Gandhi Nagar", sector="Pushta Road Gate", location_address="Main Market Entry, Pushta Road, Gandhi Nagar", latitude=28.6625, longitude=77.2690, direction="Northbound", status="nominal", throughput_mbps=4.6, uptime_str="31d 0h 15m", ping_ms=14),
        Camera(id="CAM-GN-02", name="CAM-GN-02", designation="Mahila Colony Chowk", district="Gandhi Nagar", sector="Central Hub", location_address="Mahila Colony & Subhash Mohalla Chowk", latitude=28.6595, longitude=77.2665, direction="Eastbound", status="nominal", throughput_mbps=4.0, uptime_str="9d 18h 45m", ping_ms=18),
        Camera(id="CAM-GN-03", name="CAM-GN-03", designation="Dharampura T-Point", district="Gandhi Nagar", sector="West Hub", location_address="Dharampura & Kailash Nagar T-Point", latitude=28.6640, longitude=77.2635, direction="Westbound", status="nominal", throughput_mbps=4.1, uptime_str="15d 14h 20m", ping_ms=16),
        Camera(id="CAM-GN-04", name="CAM-GN-04", designation="Shastri Park Pushta Corridor", district="Gandhi Nagar", sector="North Pushta Highway", location_address="Pushta Highway & Shastri Park Flyover Link", latitude=28.6680, longitude=77.2610, direction="Northbound", status="scanning", throughput_mbps=4.7, uptime_str="22d 9h 10m", ping_ms=11),
        Camera(id="CAM-GN-05", name="CAM-GN-05", designation="Geeta Colony Flyover Link", district="Gandhi Nagar", sector="South Arterial Link", location_address="Geeta Colony Flyover Descent & Gandhi Nagar Link", latitude=28.6540, longitude=77.2710, direction="Southbound", status="nominal", throughput_mbps=4.5, uptime_str="18d 3h 50m", ping_ms=15),
        Camera(id="CAM-GN-06", name="CAM-GN-06", designation="Ashok Gali Crossing", district="Gandhi Nagar", sector="Market Core", location_address="Ashok Gali & Main Market Rd, Gandhi Nagar", latitude=28.6615, longitude=77.2675, direction="Northbound", status="nominal", throughput_mbps=3.9, uptime_str="11d 8h 05m", ping_ms=20),
        Camera(id="CAM-GN-07", name="CAM-GN-07", designation="Raghuvarpura Main Road", district="Gandhi Nagar", sector="North-East Hub", location_address="Raghuvarpura Road Crossing, Gandhi Nagar", latitude=28.6655, longitude=77.2670, direction="Eastbound", status="nominal", throughput_mbps=4.2, uptime_str="27d 16h 30m", ping_ms=16),
        Camera(id="CAM-GN-08", name="CAM-GN-08", designation="Seelampur Metro Pushta Link", district="Gandhi Nagar", sector="North Link", location_address="GT Road & Seelampur Metro Pushta Junction", latitude=28.6695, longitude=77.2650, direction="Northbound", status="standby", throughput_mbps=3.8, uptime_str="6d 10h 15m", ping_ms=23),
        Camera(id="CAM-GN-09", name="CAM-GN-09", designation="Shanti Mohalla Market Gate", district="Gandhi Nagar", sector="East Market Link", location_address="Shanti Mohalla Main Gate, Gandhi Nagar", latitude=28.6605, longitude=77.2715, direction="Southbound", status="nominal", throughput_mbps=4.3, uptime_str="16d 21h 00m", ping_ms=17),
        Camera(id="CAM-GN-10", name="CAM-GN-10", designation="Ramesh Park Pushta Entry", district="Gandhi Nagar", sector="South Pushta Link", location_address="Ramesh Park & Pushta Road Southern Entry", latitude=28.6510, longitude=77.2695, direction="Southbound", status="nominal", throughput_mbps=4.1, uptime_str="20d 5h 40m", ping_ms=15),
    ]
    for cam in initial_cameras:
        existing = db.query(Camera).filter(Camera.id == cam.id).first()
        if not existing:
            db.add(cam)
        else:
            existing.designation = cam.designation
            existing.location_address = cam.location_address
            existing.latitude = cam.latitude
            existing.longitude = cam.longitude
            existing.district = cam.district
            existing.sector = cam.sector
    db.commit()
    print(f"{len(initial_cameras)} Cameras seeded for Krishna Nagar & Gandhi Nagar.")

    # 3. Seed Watchlists
    watchlists = [
        Watchlist(
            id="wl-001",
            normalized_plate="DL01AB1234",
            category="STOLEN_VEHICLE_REPORT",
            severity="CRITICAL",
            description="Reported stolen black sedan seen entering Gandhi Nagar Pushta. Verified police case filed.",
            case_number="POL-2026-8831",
            created_by="system_admin",
            is_active=True
        ),
        Watchlist(
            id="wl-002",
            normalized_plate="MH12DE5678",
            category="WARRANT_ADVISORY",
            severity="HIGH",
            description="Vehicle associated with active municipal warrant moving towards Krishna Nagar Lal Quarter.",
            case_number="WRN-2026-0419",
            created_by="system_admin",
            is_active=True
        ),
        Watchlist(
            id="wl-003",
            normalized_plate="KA05MJ9988",
            category="TRAFFIC_VIOLATION",
            severity="MEDIUM",
            description="Repeat red-light violation advisory across Jheel Khurenja corridor.",
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

    # 4. Seed Detections & Journey Observations for DL-01-AB-1234 traversing Gandhi Nagar -> Krishna Nagar
    now = datetime.now(timezone.utc)
    journey_stops = [
        ("CAM-GN-04", "DL-01-AB-1234", "DL01AB1234", "Sedan", now - timedelta(minutes=35)),
        ("CAM-GN-01", "DL-01-AB-1234", "DL01AB1234", "Sedan", now - timedelta(minutes=24)),
        ("CAM-KN-04", "DL-01-AB-1234", "DL01AB1234", "Sedan", now - timedelta(minutes=14)),
        ("CAM-KN-01", "DL-01-AB-1234", "DL01AB1234", "Sedan", now - timedelta(minutes=7)),
        ("CAM-KN-02", "DL-01-AB-1234", "DL01AB1234", "Sedan", now - timedelta(minutes=2)),
    ]

    for idx, (cam_id, raw_p, norm_p, v_type, ts) in enumerate(journey_stops, 1):
        det_id = f"det-seed-stolen-{idx}"
        existing_det = db.query(Detection).filter(Detection.id == det_id).first()
        full_uri, crop_uri, v_box, p_box = generate_synthetic_evidence_image(cam_id, raw_p, v_type)
        if not existing_det:
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
        else:
            existing_det.camera_id = cam_id
            existing_det.timestamp = ts
            
        # If last stop, add to alert queue
        if idx == len(journey_stops):
            if not db.query(Alert).filter(Alert.id == "alt-stolen-01").first():
                alert = Alert(
                    id="alt-stolen-01",
                    detection_id=det_id,
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
                    notes=f"Possible watchlist match detected at {cam_id} (Vijay Chowk Crossing)",
                    created_at=ts
                )
                db.add_all([alert, action])
    db.commit()

    # 5. Additional diverse vehicle detections across Krishna Nagar & Gandhi Nagar
    other_samples = [
        ("CAM-KN-01", "MH-12-DE-5678", "MH12DE5678", "SUV", now - timedelta(minutes=10), True, "WARRANT_ADVISORY"),
        ("CAM-GN-02", "WB-02-AK-4433", "WB02AK4433", "Transit Van", now - timedelta(minutes=8), False, None),
        ("CAM-KN-05", "HR-26-DK-2020", "HR26DK2020", "SUV", now - timedelta(minutes=6), False, None),
        ("CAM-GN-05", "TN-09-CQ-7711", "TN09CQ7711", "Sedan", now - timedelta(minutes=4), False, None),
        ("CAM-KN-03", "UP-32-BN-8800", "UP32BN8800", "Motorcycle", now - timedelta(minutes=1), False, None),
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
                alt_id = f"alt-warrant-{idx}"
                if not db.query(Alert).filter(Alert.id == alt_id).first():
                    alert = Alert(
                        id=alt_id,
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
