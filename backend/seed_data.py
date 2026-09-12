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
from app.models.hospital import Hospital
from app.services.ai_pipeline import generate_synthetic_evidence_image
from app.services.normalization import normalize_plate

def seed_database(target_db=None):
    if target_db is None:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        should_close = True
    else:
        db = target_db
        should_close = False
    
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
    # 2. Seed Cameras (20 Strategic Intersections Across East Delhi)
    initial_cameras = [
        # --- South & Central East Delhi (CAM-KN-01 to CAM-KN-10) ---
        Camera(id="CAM-KN-01", name="CAM-KN-01", designation="Lal Quarter Market Chowk", district="Krishna Nagar", sector="Central East Delhi", location_address="Lal Quarter Main Market, Krishna Nagar", latitude=28.6575, longitude=77.2795, direction="Northbound", status="nominal", throughput_mbps=4.5, uptime_str="28d 4h 12m", ping_ms=15),
        Camera(id="CAM-KN-02", name="CAM-KN-02", designation="Preet Vihar Vikas Marg Junction", district="Preet Vihar", sector="Vikas Marg Arterial", location_address="Vikas Marg & Preet Vihar Metro Station", latitude=28.6415, longitude=77.2950, direction="Eastbound", status="nominal", throughput_mbps=4.2, uptime_str="14d 6h 22m", ping_ms=18),
        Camera(id="CAM-KN-03", name="CAM-KN-03", designation="Laxmi Nagar Metro & Shakarpur Hub", district="Laxmi Nagar", sector="Commercial Corridor", location_address="Vikas Marg & Shakarpur Main Chowk", latitude=28.6305, longitude=77.2770, direction="Westbound", status="nominal", throughput_mbps=4.8, uptime_str="21d 12h 05m", ping_ms=12),
        Camera(id="CAM-KN-04", name="CAM-KN-04", designation="Akshardham Flyover & NH-24 Merge", district="Akshardham", sector="Express Highway Hub", location_address="Delhi-Meerut Expressway / NH-24 Merge", latitude=28.6180, longitude=77.2790, direction="Southbound", status="scanning", throughput_mbps=3.9, uptime_str="8d 14h 10m", ping_ms=21),
        Camera(id="CAM-KN-05", name="CAM-KN-05", designation="Mayur Vihar Phase-1 Pocket-1 Chowk", district="Mayur Vihar", sector="Noida Link Corridor", location_address="Noida Link Road & Trilokpuri Link", latitude=28.6045, longitude=77.2915, direction="Southbound", status="nominal", throughput_mbps=4.1, uptime_str="30d 19h 12m", ping_ms=14),
        Camera(id="CAM-KN-06", name="CAM-KN-06", designation="Mayur Vihar Phase-2 Kalyanvas Crossing", district="Mayur Vihar", sector="Residential Arterial", location_address="Patparganj Road & Phase-2 Pocket A", latitude=28.6160, longitude=77.3080, direction="Eastbound", status="nominal", throughput_mbps=4.0, uptime_str="19d 8h 33m", ping_ms=17),
        Camera(id="CAM-KN-07", name="CAM-KN-07", designation="Mayur Vihar Phase-3 Kondli Border", district="Mayur Vihar", sector="Border Transit Zone", location_address="Kondli Canal Road & Phase-3 Bus Terminal", latitude=28.5980, longitude=77.3270, direction="Southbound", status="nominal", throughput_mbps=4.3, uptime_str="12d 3h 40m", ping_ms=16),
        Camera(id="CAM-KN-08", name="CAM-KN-08", designation="Patparganj Industrial Area / Max Hospital", district="Patparganj", sector="Industrial & Health Hub", location_address="IP Extension & Mother Dairy Plant Arterial", latitude=28.6295, longitude=77.3090, direction="Northbound", status="standby", throughput_mbps=3.7, uptime_str="5d 22h 10m", ping_ms=24),
        Camera(id="CAM-KN-09", name="CAM-KN-09", designation="Ghazipur Border & Flower Market Corridor", district="Ghazipur", sector="Interstate Border Corridor", location_address="NH-24 Roundabout & Ghazipur UP Border", latitude=28.6240, longitude=77.3340, direction="Eastbound", status="nominal", throughput_mbps=4.4, uptime_str="17d 11h 18m", ping_ms=13),
        Camera(id="CAM-KN-10", name="CAM-KN-10", designation="Karkardooma Court & CBD Ground Junction", district="Karkardooma", sector="Institutional Zone", location_address="Master Plan Road & Karkardooma Metro", latitude=28.6485, longitude=77.3045, direction="Northbound", status="nominal", throughput_mbps=4.2, uptime_str="25d 7h 00m", ping_ms=19),

        # --- North & East Border Corridors (CAM-GN-01 to CAM-GN-10) ---
        Camera(id="CAM-GN-01", name="CAM-GN-01", designation="Anand Vihar ISBT & Terminal Gate", district="Anand Vihar", sector="Multimodal Transit Hub", location_address="Chaudhary Charan Singh Marg & Kaushambi Border", latitude=28.6465, longitude=77.3155, direction="Eastbound", status="nominal", throughput_mbps=4.6, uptime_str="31d 0h 15m", ping_ms=14),
        Camera(id="CAM-GN-02", name="CAM-GN-02", designation="Surajmal Vihar / Sports Complex Road", district="Vivek Vihar", sector="Institutional Arterial", location_address="Surajmal Vihar T-Point & Sports Complex Rd", latitude=28.6580, longitude=77.3110, direction="Northbound", status="nominal", throughput_mbps=4.0, uptime_str="9d 18h 45m", ping_ms=18),
        Camera(id="CAM-GN-03", name="CAM-GN-03", designation="Vivek Vihar Underpass & ITI Crossing", district="Vivek Vihar", sector="Northern Link Corridor", location_address="Surya Nagar Border & Vivek Vihar Road", latitude=28.6675, longitude=77.3160, direction="Northbound", status="nominal", throughput_mbps=4.1, uptime_str="15d 14h 20m", ping_ms=16),
        Camera(id="CAM-GN-04", name="CAM-GN-04", designation="Dilshad Garden Metro & GTB Hospital Chowk", district="Dilshad Garden", sector="Health & Transit Hub", location_address="Tahirpur Road & GTB Enclave Chowk", latitude=28.6815, longitude=77.3120, direction="Northbound", status="scanning", throughput_mbps=4.7, uptime_str="22d 9h 10m", ping_ms=11),
        Camera(id="CAM-GN-05", name="CAM-GN-05", designation="Apsara Border & GT Road Checkpoint", district="Shahdara", sector="Interstate Border Post", location_address="Grand Trunk Road & UP Border (Apsara)", latitude=28.6790, longitude=77.3275, direction="Eastbound", status="nominal", throughput_mbps=4.5, uptime_str="18d 3h 50m", ping_ms=15),
        Camera(id="CAM-GN-06", name="CAM-GN-06", designation="Shahdara Flyover & Railway Station Crossing", district="Shahdara", sector="Railway & Market Hub", location_address="Old Rohtak Road / GT Road Flyover", latitude=28.6725, longitude=77.2915, direction="Westbound", status="nominal", throughput_mbps=3.9, uptime_str="11d 8h 05m", ping_ms=20),
        Camera(id="CAM-GN-07", name="CAM-GN-07", designation="Seelampur Metro & Welcome Interchange", district="Seelampur", sector="Metro Interchange", location_address="Grand Trunk Road & Welcome Junction", latitude=28.6685, longitude=77.2720, direction="Westbound", status="nominal", throughput_mbps=4.2, uptime_str="27d 16h 30m", ping_ms=16),
        Camera(id="CAM-GN-08", name="CAM-GN-08", designation="Shastri Park Pushta Highway & IT Park Link", district="Shastri Park", sector="Trans-Yamuna Arterial", location_address="Pushta Road & ISBT Kashmiri Gate Link", latitude=28.6690, longitude=77.2560, direction="Northbound", status="standby", throughput_mbps=3.8, uptime_str="6d 10h 15m", ping_ms=23),
        Camera(id="CAM-GN-09", name="CAM-GN-09", designation="Gandhi Nagar Textile Market & Pushta Link", district="Gandhi Nagar", sector="Wholesale Market Zone", location_address="Pushta Road Main Gate & Textile Hub", latitude=28.6615, longitude=77.2655, direction="Southbound", status="nominal", throughput_mbps=4.3, uptime_str="16d 21h 00m", ping_ms=17),
        Camera(id="CAM-GN-10", name="CAM-GN-10", designation="Geeta Colony Flyover & Yamuna Bridge Ramp", district="Geeta Colony", sector="Riverfront Arterial", location_address="Geeta Colony Ramp & Yamuna Bridge", latitude=28.6495, longitude=77.2675, direction="Southbound", status="nominal", throughput_mbps=4.1, uptime_str="20d 5h 40m", ping_ms=15),
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

    # 4. Retention Policies
    now = datetime.now(timezone.utc)
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

    # 7. Seed 20 East Delhi Hospitals (Backend Database Only - Not Plotted on Map)
    hospitals = [
        Hospital(id="HOSP-ED-01", name="Guru Teg Bahadur (GTB) Hospital & UCMS", hospital_type="Government Teaching Hospital", district="Shahdara / Dilshad Garden", address="Taharpur Road, Dilshad Garden, Delhi - 110095", latitude=28.6835, longitude=77.3115, emergency_phone="+91-11-22586262", total_beds=1500, has_trauma_center=True),
        Hospital(id="HOSP-ED-02", name="Max Super Speciality Hospital, Patparganj", hospital_type="Private Super Speciality", district="Patparganj", address="108A, IP Extension, Patparganj, Delhi - 110092", latitude=28.6292, longitude=77.3094, emergency_phone="+91-11-43033333", total_beds=400, has_trauma_center=True),
        Hospital(id="HOSP-ED-03", name="Lal Bahadur Shastri Hospital (LBS Hospital)", hospital_type="Government District Hospital", district="Mayur Vihar", address="Khichripur, Mayur Vihar Phase-II, Delhi - 110091", latitude=28.6186, longitude=77.3108, emergency_phone="+91-11-22774145", total_beds=350, has_trauma_center=True),
        Hospital(id="HOSP-ED-04", name="Dr. Hedgewar Arogya Sansthan", hospital_type="Government Multi Speciality", district="Karkardooma", address="CBD Grounds, Karkardooma, Delhi - 110032", latitude=28.6536, longitude=77.3005, emergency_phone="+91-11-22308000", total_beds=300, has_trauma_center=True),
        Hospital(id="HOSP-ED-05", name="Rajiv Gandhi Super Speciality Hospital", hospital_type="Government Autonomous Institute", district="Dilshad Garden", address="Tahirpur, Dilshad Garden, Delhi - 110093", latitude=28.6868, longitude=77.3175, emergency_phone="+91-11-22890000", total_beds=650, has_trauma_center=True),
        Hospital(id="HOSP-ED-06", name="Chacha Nehru Bal Chikitsalaya", hospital_type="Government Pediatric Hospital", district="Geeta Colony", address="Geeta Colony, East Delhi - 110031", latitude=28.6508, longitude=77.2718, emergency_phone="+91-11-22044811", total_beds=220, has_trauma_center=False),
        Hospital(id="HOSP-ED-07", name="Institute of Human Behaviour & Allied Sciences (IHBAS)", hospital_type="Government Neuro-Psychiatric", district="Dilshad Garden", address="GT Road, Dilshad Garden, Delhi - 110095", latitude=28.6795, longitude=77.3160, emergency_phone="+91-11-22597777", total_beds=500, has_trauma_center=False),
        Hospital(id="HOSP-ED-08", name="Swami Dayanand Hospital (SDNH)", hospital_type="Municipal Multi Speciality", district="Shahdara", address="Dilshad Garden Road, Shahdara, Delhi - 110095", latitude=28.6775, longitude=77.3060, emergency_phone="+91-11-22588383", total_beds=370, has_trauma_center=True),
        Hospital(id="HOSP-ED-09", name="Dharamshila Narayana Superspeciality Hospital", hospital_type="Private Oncology & Multi Speciality", district="Vasundhara Enclave", address="Vasundhara Enclave, Near New Ashok Nagar Metro, Delhi - 110096", latitude=28.6015, longitude=77.3245, emergency_phone="+91-11-43066666", total_beds=350, has_trauma_center=True),
        Hospital(id="HOSP-ED-10", name="Kailash Deepak Memorial Hospital", hospital_type="Private Super Speciality", district="Karkardooma", address="Institutional Area, Vikas Marg Ext II, Delhi - 110092", latitude=28.6475, longitude=77.2990, emergency_phone="+91-11-22144444", total_beds=200, has_trauma_center=False),
        Hospital(id="HOSP-ED-11", name="Metro Multispeciality Hospital", hospital_type="Private Multi Speciality", district="Preet Vihar", address="21 Community Centre, Preet Vihar, Delhi - 110092", latitude=28.6420, longitude=77.2940, emergency_phone="+91-11-42421000", total_beds=150, has_trauma_center=False),
        Hospital(id="HOSP-ED-12", name="Shanti Mukand Hospital", hospital_type="Charitable Trust Multi Speciality", district="Karkardooma", address="2 Institutional Area, Vikas Marg Ext, Delhi - 110092", latitude=28.6480, longitude=77.3030, emergency_phone="+91-11-47276600", total_beds=200, has_trauma_center=True),
        Hospital(id="HOSP-ED-13", name="Goyal Hospital & Urology Centre", hospital_type="Private Speciality Hospital", district="Krishna Nagar", address="E-4/8, Krishna Nagar, Delhi - 110051", latitude=28.6558, longitude=77.2785, emergency_phone="+91-11-22093333", total_beds=80, has_trauma_center=False),
        Hospital(id="HOSP-ED-14", name="Makkar Multispeciality Hospital", hospital_type="Private Multi Speciality", district="Laxmi Nagar", address="A-1 Priyadarshini Vihar, Vikas Marg, Delhi - 110092", latitude=28.6360, longitude=77.2845, emergency_phone="+91-11-22521111", total_beds=100, has_trauma_center=False),
        Hospital(id="HOSP-ED-15", name="Suraksha Multi Speciality Hospital", hospital_type="Private Multi Speciality", district="Vivek Vihar", address="1/1 Surya Nagar Border, Vivek Vihar, Delhi - 110095", latitude=28.6655, longitude=77.3150, emergency_phone="+91-11-22158888", total_beds=100, has_trauma_center=False),
        Hospital(id="HOSP-ED-16", name="Jeevan Anmol Hospital", hospital_type="Private Multi Speciality", district="Mayur Vihar", address="Pocket-1, Mayur Vihar Phase-I, Delhi - 110091", latitude=28.6030, longitude=77.2955, emergency_phone="+91-11-47355555", total_beds=100, has_trauma_center=False),
        Hospital(id="HOSP-ED-17", name="East Delhi Medical Centre", hospital_type="Private Multi Speciality", district="Shahdara", address="1/550 Mansarovar Park, GT Road, Shahdara, Delhi - 110032", latitude=28.6750, longitude=77.2980, emergency_phone="+91-11-22119999", total_beds=120, has_trauma_center=False),
        Hospital(id="HOSP-ED-18", name="Jag Pravesh Chandra Hospital", hospital_type="Government Multi Speciality", district="Shastri Park", address="Pushta Road, Shastri Park, Delhi - 110053", latitude=28.6710, longitude=77.2585, emergency_phone="+91-11-22184453", total_beds=200, has_trauma_center=True),
        Hospital(id="HOSP-ED-19", name="Dr. B.R. Sur Medical Institution & Hospital", hospital_type="Government Homeopathic & General Hospital", district="Laxmi Nagar", address="Nanak Chand Block, Shakarpur / Laxmi Nagar, Delhi - 110092", latitude=28.6320, longitude=77.2790, emergency_phone="+91-11-22441234", total_beds=90, has_trauma_center=False),
        Hospital(id="HOSP-ED-20", name="Ghazipur Community Health Center", hospital_type="Government Community Health Center", district="Ghazipur", address="Main Ghazipur Dairy Farm Road, Ghazipur, Delhi - 110096", latitude=28.6225, longitude=77.3315, emergency_phone="+91-11-22789012", total_beds=80, has_trauma_center=True)
    ]
    for hosp in hospitals:
        existing = db.query(Hospital).filter(Hospital.id == hosp.id).first()
        if not existing:
            db.add(hosp)
        else:
            existing.name = hosp.name
            existing.hospital_type = hosp.hospital_type
            existing.district = hosp.district
            existing.address = hosp.address
            existing.latitude = hosp.latitude
            existing.longitude = hosp.longitude
            existing.emergency_phone = hosp.emergency_phone
            existing.total_beds = hosp.total_beds
            existing.has_trauma_center = hosp.has_trauma_center
    db.commit()
    print("Hospitals seeded.")

    # 8. Seed Realistic Vehicle Detections & Multi-Camera Journeys
    sample_vehicles_data = [
        {
            "plate": "DL-01-AMB-9911",
            "type": "Ambulance",
            "owner": "Delhi Emergency Services (Tata Winger Ambulance)",
            "has_alert": True,
            "alert_type": "EMERGENCY_AMBULANCE",
            "alert_category": "EMERGENCY_CORRIDOR",
            "alert_severity": "CRITICAL",
            "alert_status": "ACKNOWLEDGED",
            "stops": [
                {"cam": "CAM-KN-03", "mins_ago": 24, "conf": 0.98, "ocr_conf": 0.97},
                {"cam": "CAM-KN-02", "mins_ago": 16, "conf": 0.99, "ocr_conf": 0.98},
                {"cam": "CAM-KN-08", "mins_ago": 7,  "conf": 0.98, "ocr_conf": 0.96},
            ]
        },
        {
            "plate": "DL-01-AB-1234",
            "type": "Sedan",
            "owner": "Rajesh Sharma (Black Hyundai Verna)",
            "has_alert": True,
            "alert_type": "STOLEN_VEHICLE_REPORT",
            "alert_category": "STOLEN_VEHICLE",
            "alert_severity": "CRITICAL",
            "alert_status": "ASSIGNED",
            "assigned_to": "Officer Sarah Chen",
            "watchlist_id": "wl-001",
            "stops": [
                {"cam": "CAM-KN-01", "mins_ago": 42, "conf": 0.96, "ocr_conf": 0.95},
                {"cam": "CAM-KN-02", "mins_ago": 31, "conf": 0.97, "ocr_conf": 0.96},
                {"cam": "CAM-GN-01", "mins_ago": 18, "conf": 0.98, "ocr_conf": 0.97},
            ]
        },
        {
            "plate": "HR-26-DK-8821",
            "type": "SUV",
            "owner": "Vikramaditya Rao (White Toyota Fortuner)",
            "has_alert": True,
            "alert_type": "SPEEDING_VIOLATION",
            "alert_category": "SPEED_TRAP_SECTION",
            "alert_severity": "HIGH",
            "alert_status": "NEW",
            "stops": [
                {"cam": "CAM-KN-04", "mins_ago": 28, "conf": 0.95, "ocr_conf": 0.94},
                {"cam": "CAM-KN-05", "mins_ago": 24, "conf": 0.97, "ocr_conf": 0.96},
            ]
        },
        {
            "plate": "DL-03-CD-5678",
            "type": "Sedan",
            "owner": "Ananya Sen (Silver Honda City)",
            "has_alert": False,
            "stops": [
                {"cam": "CAM-GN-08", "mins_ago": 52, "conf": 0.94, "ocr_conf": 0.93},
                {"cam": "CAM-GN-07", "mins_ago": 40, "conf": 0.96, "ocr_conf": 0.95},
                {"cam": "CAM-GN-06", "mins_ago": 29, "conf": 0.97, "ocr_conf": 0.96},
                {"cam": "CAM-GN-02", "mins_ago": 14, "conf": 0.98, "ocr_conf": 0.97},
            ]
        },
        {
            "plate": "UP-14-BT-3329",
            "type": "Commercial Truck",
            "owner": "Kailash Logistics (Tata Signa 4825.TK)",
            "has_alert": False,
            "stops": [
                {"cam": "CAM-KN-09", "mins_ago": 48, "conf": 0.93, "ocr_conf": 0.92},
                {"cam": "CAM-KN-06", "mins_ago": 35, "conf": 0.95, "ocr_conf": 0.94},
                {"cam": "CAM-KN-07", "mins_ago": 21, "conf": 0.96, "ocr_conf": 0.95},
            ]
        },
        {
            "plate": "DL-01-PC-1044",
            "type": "Bus",
            "owner": "Delhi Transport Corporation (Tata Starbus EV)",
            "has_alert": False,
            "stops": [
                {"cam": "CAM-GN-01", "mins_ago": 44, "conf": 0.97, "ocr_conf": 0.96},
                {"cam": "CAM-GN-03", "mins_ago": 32, "conf": 0.98, "ocr_conf": 0.97},
                {"cam": "CAM-GN-04", "mins_ago": 20, "conf": 0.98, "ocr_conf": 0.98},
                {"cam": "CAM-GN-05", "mins_ago": 9,  "conf": 0.99, "ocr_conf": 0.98},
            ]
        },
        {
            "plate": "MH-12-DE-5678",
            "type": "SUV",
            "owner": "Sunil Kulkarni (Mahindra Scorpio-N)",
            "has_alert": True,
            "alert_type": "WARRANT_ADVISORY",
            "alert_category": "MUNICIPAL_WARRANT",
            "alert_severity": "HIGH",
            "alert_status": "NEW",
            "watchlist_id": "wl-002",
            "stops": [
                {"cam": "CAM-KN-10", "mins_ago": 38, "conf": 0.96, "ocr_conf": 0.95},
                {"cam": "CAM-KN-01", "mins_ago": 19, "conf": 0.97, "ocr_conf": 0.96},
            ]
        },
        {
            "plate": "DL-07-SQ-9102",
            "type": "Two-wheeler",
            "owner": "Deepak Verma (TVS Jupiter Delivery)",
            "has_alert": False,
            "stops": [
                {"cam": "CAM-GN-09", "mins_ago": 34, "conf": 0.95, "ocr_conf": 0.94},
                {"cam": "CAM-GN-10", "mins_ago": 15, "conf": 0.96, "ocr_conf": 0.95},
            ]
        },
        {
            "plate": "DL-05-EX-4491",
            "type": "Two-wheeler",
            "owner": "Mohit Gupta (Royal Enfield Classic 350)",
            "has_alert": False,
            "stops": [
                {"cam": "CAM-KN-01", "mins_ago": 5, "conf": 0.98, "ocr_conf": 0.97},
            ]
        },
        {
            "plate": "UP-16-BZ-4402",
            "type": "Sedan",
            "owner": "Sanjay Rawat (Maruti Ciaz)",
            "has_alert": False,
            "stops": [
                {"cam": "CAM-KN-04", "mins_ago": 3, "conf": 0.97, "ocr_conf": 0.96},
            ]
        }
    ]

    base_time = datetime.now(timezone.utc)
    for v_data in sample_vehicles_data:
        raw_plate = v_data["plate"]
        norm_plate = normalize_plate(raw_plate)
        v_type = v_data["type"]
        v_owner = v_data["owner"]
        has_alt = v_data.get("has_alert", False)
        alt_type = v_data.get("alert_type")

        for idx, stop in enumerate(v_data["stops"], 1):
            det_id = f"det-seed-{norm_plate.lower()}-{idx}"
            det_time = base_time - timedelta(minutes=stop["mins_ago"])

            existing_det = db.query(Detection).filter(Detection.id == det_id).first()
            if not existing_det:
                try:
                    ev_uri, crop_uri, v_box, p_box = generate_synthetic_evidence_image(
                        camera_id=stop["cam"],
                        custom_raw_plate=raw_plate
                    )
                except Exception:
                    ev_uri = f"/static/evidence/feed_{stop['cam']}_preview.jpg"
                    crop_uri = None
                    v_box = [120, 180, 520, 680]
                    p_box = [420, 310, 470, 550]

                det = Detection(
                    id=det_id,
                    camera_id=stop["cam"],
                    timestamp=det_time,
                    raw_plate_text=raw_plate,
                    normalized_plate_text=norm_plate,
                    confidence_score=stop["conf"],
                    ocr_confidence=stop["ocr_conf"],
                    model_version="YOLOv8-ANPR-v2.4",
                    vehicle_type=v_type,
                    owner_name=v_owner,
                    bounding_box=str(v_box),
                    plate_bounding_box=str(p_box),
                    evidence_image_uri=ev_uri,
                    plate_crop_uri=crop_uri,
                    processing_status="COMPLETED",
                    review_status="VERIFIED",
                    has_alert=has_alt,
                    alert_type=alt_type
                )
                db.add(det)

                # If this is the latest sighting and vehicle has an alert, seed the alert record
                if has_alt and idx == len(v_data["stops"]):
                    alt_id = f"alt-seed-{norm_plate.lower()}"
                    existing_alt = db.query(Alert).filter(Alert.id == alt_id).first()
                    if not existing_alt:
                        alt = Alert(
                            id=alt_id,
                            detection_id=det_id,
                            camera_id=stop["cam"],
                            watchlist_id=v_data.get("watchlist_id"),
                            plate_matched=norm_plate,
                            category=v_data.get("alert_category", "GENERAL_INVESTIGATION"),
                            severity=v_data.get("alert_severity", "HIGH"),
                            status=v_data.get("alert_status", "NEW"),
                            assigned_to=v_data.get("assigned_to"),
                            resolution_notes="Automated ANPR match on high-density surveillance grid.",
                            created_at=det_time,
                            updated_at=det_time
                        )
                        db.add(alt)

                        # If acknowledged/assigned, add action trail
                        if alt.status in ["ACKNOWLEDGED", "ASSIGNED"]:
                            action_id = f"act-seed-{norm_plate.lower()}-1"
                            act = AlertAction(
                                id=action_id,
                                alert_id=alt_id,
                                user_id="usr-oper-01",
                                username="Sarah Chen",
                                action="ASSIGN" if alt.status == "ASSIGNED" else "ACKNOWLEDGE",
                                from_status="NEW",
                                to_status=alt.status,
                                notes="Corridor units alerted for active tactical intercept.",
                                created_at=det_time + timedelta(minutes=2)
                            )
                            db.add(act)

    db.commit()
    print(f"Realistic vehicle detections, multi-camera journeys, and alerts seeded successfully.")

    print("Database seeding completed successfully!")
    if should_close:
        db.close()

if __name__ == "__main__":
    seed_database()

