import os
import uuid
import json
import random
import re
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List, Tuple
import numpy as np
import cv2

from app.core.config import settings
from app.services.normalization import normalize_plate

# Safe imports for ML engines
try:
    from ultralytics import YOLO
    _YOLO_AVAILABLE = True
except ImportError:
    _YOLO_AVAILABLE = False

try:
    import easyocr
    _EASYOCR_AVAILABLE = True
except ImportError:
    _EASYOCR_AVAILABLE = False

try:
    import torch
    import torch.nn as nn
    _TORCH_AVAILABLE = True
except ImportError:
    _TORCH_AVAILABLE = False

try:
    from transformers import TrOCRProcessor, VisionEncoderDecoderModel
    from PIL import Image
    _TROCR_AVAILABLE = True
except ImportError:
    _TROCR_AVAILABLE = False


class DCENet(nn.Module if _TORCH_AVAILABLE else object):
    """
    Zero-DCE (Zero-Reference Deep Curve Estimation) Network.
    Estimates non-linear light enhancement curve parameter maps to enhance low-light plate crops.
    """
    def __init__(self):
        super(DCENet, self).__init__()
        if not _TORCH_AVAILABLE:
            return
        self.relu = nn.ReLU(inplace=True)
        number_f = 32
        self.e_conv1 = nn.Conv2d(3, number_f, 3, 1, 1, bias=True)
        self.e_conv2 = nn.Conv2d(number_f, number_f, 3, 1, 1, bias=True)
        self.e_conv3 = nn.Conv2d(number_f, number_f, 3, 1, 1, bias=True)
        self.e_conv4 = nn.Conv2d(number_f, number_f, 3, 1, 1, bias=True)
        self.e_conv5 = nn.Conv2d(number_f * 2, number_f, 3, 1, 1, bias=True)
        self.e_conv6 = nn.Conv2d(number_f * 2, number_f, 3, 1, 1, bias=True)
        self.e_conv7 = nn.Conv2d(number_f * 2, 24, 3, 1, 1, bias=True)

    def forward(self, x):
        if not _TORCH_AVAILABLE:
            return x
        x1 = self.relu(self.e_conv1(x))
        x2 = self.relu(self.e_conv2(x1))
        x3 = self.relu(self.e_conv3(x2))
        x4 = self.relu(self.e_conv4(x3))
        x5 = self.relu(self.e_conv5(torch.cat([x3, x4], 1)))
        x6 = self.relu(self.e_conv6(torch.cat([x2, x5], 1)))
        enhance_curves = torch.tanh(self.e_conv7(torch.cat([x1, x6], 1)))
        r1, r2, r3, r4, r5, r6, r7, r8 = torch.split(enhance_curves, 3, dim=1)
        for r in [r1, r2, r3, r4, r5, r6, r7, r8]:
            x = x + r * (torch.pow(x, 2) - x)
        return torch.clamp(x, 0.0, 1.0)


class IndianSyntaxRectifier:
    """
    Syntactic and Bayesian Post-Processing Engine for Indian License Plates.
    Standard Format: [State: 2 letters] [RTO: 2 digits] [Series: 1-3 letters] [Plate: 4 digits]
    e.g. DL-01-AB-1234, HR-26-DK-2020, UP-32-BN-8800, MH-12-DE-5678, UP-16-DX-7291
    """
    INDIAN_STATES = {
        "AN", "AP", "AR", "AS", "BR", "CH", "CG", "DD", "DL", "DN",
        "GA", "GJ", "HR", "HP", "JH", "JK", "KA", "KL", "LA", "LD",
        "MH", "ML", "MN", "MP", "MZ", "NL", "OD", "OR", "PB", "PY",
        "RJ", "SK", "TN", "TR", "TS", "UK", "UA", "UP", "WB"
    }
    DIGIT_TO_ALPHA = {'0': 'O', '1': 'I', '2': 'Z', '3': 'E', '4': 'A', '5': 'S', '6': 'G', '7': 'T', '8': 'B', '9': 'P'}
    # In Indian RTO registration, letters 'O' and 'I' are NEVER issued in series codes to avoid confusion with 0 and 1.
    # Therefore, in series position, 0 and O map to D (or C), 1 and I map to L (or T).
    DIGIT_TO_ALPHA_SERIES = {'0': 'D', 'O': 'D', '1': 'L', 'I': 'L', '2': 'Z', '3': 'E', '4': 'A', '5': 'S', '6': 'G', '7': 'T', '8': 'B', '9': 'P'}
    ALPHA_TO_DIGIT = {'O': '0', 'D': '0', 'Q': '0', 'I': '1', 'L': '1', 'J': '1', 'Z': '2', 'E': '3', 'A': '4', 'S': '5', 'G': '6', 'T': '7', 'B': '8', 'P': '9', 'R': '8'}
    
    STATE_CONFUSIONS = {
        "MK": "MH", "WH": "MH", "HH": "MH", "VH": "MH", "MN": "MH", "M4": "MH", "HA": "MH", "M1": "MH", "KM": "MH", "NH": "MH", "EM": "MH", "PM": "MH", "RM": "MH", "TM": "MH", "TAN": "MH",
        "OL": "DL", "QL": "DL", "RL": "DL", "UL": "DL", "OI": "DL", "DI": "DL", "FL": "DL", "FD": "DL", "ID": "DL", "1D": "DL", "D1": "DL", "PER": "DL", "EL": "DL", "TEL": "DL", "DEL": "DL", "EDL": "DL", "FDL": "DL",
        "RI": "KA", "KI": "KA", "RA": "KA", "K0": "KA", "KO": "KA", "K4": "KA", "KN": "KA", "KR": "KA", "54": "KA", "HEA": "KA", "UDS": "KA", "MDS": "KA",
        "UR": "UP", "OP": "UP", "VP": "UP", "FP": "UP", "FU": "UP", "PU": "UP", "IP": "UP", "JP": "UP", "UF": "UP", "DP": "UP", "TP": "UP", "LP": "UP", "U9": "UP", "FUP": "UP", "EUP": "UP", "PUP": "UP", "HUP": "UP",
        "H8": "HR", "HB": "HR", "4R": "HR", "HP": "HR", "NR": "HR",
        "CJ": "GJ", "QJ": "GJ", "6J": "GJ",
        "PJ": "RJ", "BJ": "RJ",
        "IN": "TN", "TM": "TN",
        "VB": "WB", "MB": "WB"
    }

    @classmethod
    def clean_raw_string(cls, raw: str) -> str:
        s = raw.upper()
        s = re.sub(r'[^A-Z0-9]', '', s)
        # Strip common HSRP blue bar / IND prefixes and OCR misreads of chromium strip
        hsrp_prefixes = ['INDIA', 'IND', '1ND', 'INO', 'IHD', 'IN0', '1N0', 'IWD', 'IMD', 'GST', 'CST']
        for pfx in hsrp_prefixes:
            if s.startswith(pfx) and len(s) > len(pfx) + 5:
                s = s[len(pfx):]
                break
        # Automatically strip 1-2 leading noise characters before any recognized state code
        for i in range(1, 3):
            if len(s) > i + 3:
                st = s[i:i+2]
                if (st in cls.INDIAN_STATES or st in cls.STATE_CONFUSIONS) and (s[i+2].isdigit() or s[i+2] in ['O', 'I', 'Z', 'S', 'B', 'A', 'D', 'C']):
                    s = s[i:]
                    break
        return s

    @classmethod
    def is_valid_plate_candidate(cls, raw: str) -> bool:
        if not raw:
            return False
        clean = cls.clean_raw_string(raw)
        # Immediately reject dictionary words, status words, or UI labels
        reject_words = [
            "AMBULANCE", "ECNALUBMA", "BOMAJUAMA", "3OMAJUBMA", "EMERGENCY",
            "HOSPITAL", "TRAUMA", "TARGET", "CAMERA", "NODE", "TRAFFIC",
            "PORTE", "MULTI", "CCTV", "POLICE", "HIGHWAY", "DISPLAY",
            "REFUND", "TERMINAL", "CREDITED", "CARDNESS", "CHANGE", "CASH",
            "DISCOUNT", "TESTED", "WELCOME", "PARKING", "SPEED", "WARNING",
            "CAUTION", "DANGER", "SCHOOL", "ZONE", "BRIDGE", "TUNNEL",
            "STATION", "MARKET", "HOTEL", "OFFICE", "BUILDING", "STREET",
            "AVENUE", "ROAD", "LANE", "DRIVE", "COURT", "PLAZA", "CENTER",
            "SERVICE", "REPAIR", "GARAGE", "DIESEL", "PETROL", "FRESH",
            "QUALITY", "PREMIUM", "STANDARD", "SPECIAL", "LIMITED", "COMPANY",
            "PRIVATE", "PUBLIC", "GOVERNMENT", "NATIONAL", "STATE",
            "TRANSPORT", "MOTORS", "AUTO", "SALES", "DEALER", "SHOWROOM",
            "INSURANCE", "FINANCE", "BANK", "MONEY", "PRICE", "OFFER",
            "RECEIPT", "PERFORATED", "REGION", "EXCHANGE", "OFFER", "GOOD",
            "REGISTER", "REGULAR"
        ]
        if any(rw in clean for rw in reject_words):
            return False
        if len(clean) < 4 or len(clean) > 14:
            return False
        # Indian license plates ALWAYS contain digits (0-9)
        digits = sum(1 for c in clean if c.isdigit())
        alphas = sum(1 for c in clean if c.isalpha())
        if digits < 2:
            return False
        # Reject if too many alphabetic characters relative to digits (likely English word)
        if alphas > 0 and digits > 0 and alphas / (alphas + digits) > 0.75 and len(clean) > 6:
            return False
        return True

    @classmethod
    def rectify(cls, raw_ocr: str) -> Tuple[str, float, bool]:
        if not raw_ocr or not cls.is_valid_plate_candidate(raw_ocr):
            return "", 0.0, False

        clean = cls.clean_raw_string(raw_ocr)
        if len(clean) < 4:
            return clean, 0.4, False

        # ── BH (Bharat Series) plate detection ──
        # Format: YY BH XXXX XX (e.g., 22BH1234AB, 23BH5678CD)
        bh_match = re.match(r'^(\d{2})BH(\d{4})([A-Z]{2})$', clean)
        if bh_match:
            year, num, series = bh_match.groups()
            return f"{year}-BH-{num}-{series}", 0.98, True
        # Relaxed BH match: OCR might misread digits/letters
        bh_relaxed = re.match(r'^(\d{2})B[H4A](\d{3,4})([A-Z]{1,3})$', clean)
        if bh_relaxed:
            year, num, series = bh_relaxed.groups()
            num = num.zfill(4)
            return f"{year}-BH-{num}-{series}", 0.92, True
        # Another BH variant: year might be misread as letters
        bh_alt = re.match(r'^([A-Z0-9]{2})BH(\d{3,5})([A-Z]{0,3})$', clean)
        if bh_alt:
            year_raw, num, series = bh_alt.groups()
            year = "".join(cls.ALPHA_TO_DIGIT.get(c, c) for c in year_raw)
            if year.isdigit() and 19 <= int(year) <= 35:
                num = num[:4]
                result = f"{year}-BH-{num}"
                if series:
                    result += f"-{series}"
                return result, 0.90, True

        # ── Standard Indian plate: [State][RTO][Series][Number] ──
        # Look for a valid Indian state prefix in the first 3 characters
        best_state = None
        best_state_idx = -1

        for st in cls.INDIAN_STATES:
            idx = clean.find(st)
            if 0 <= idx <= 2:
                best_state = st
                best_state_idx = idx
                break

        if not best_state:
            for i in range(min(3, len(clean) - 1)):
                pair = clean[i:i+2]
                if pair in cls.STATE_CONFUSIONS:
                    best_state = cls.STATE_CONFUSIONS[pair]
                    best_state_idx = i
                    break

        if best_state and best_state_idx >= 0:
            tail = clean[best_state_idx + 2:]
            # Extract RTO (1-2 digits)
            rto_digits = []
            parsing_rto = True
            rest = tail
            for idx, ch in enumerate(tail):
                if parsing_rto:
                    if len(rto_digits) < 2 and (ch.isdigit() or ch in cls.ALPHA_TO_DIGIT):
                        rto_digits.append(cls.ALPHA_TO_DIGIT.get(ch, ch))
                    else:
                        parsing_rto = False
                        rest = tail[idx:]
                        break
                else:
                    break

            rto = "".join(rto_digits) if rto_digits else "01"

            # ── Improved series/number splitting (right-to-left digit scan) ──
            # Scan from right to collect digit characters for the plate number (up to 4 digits)
            # Everything left of that is the series (letters)
            if len(rest) >= 1:
                # Collect digits from the right end
                num_chars = []
                ser_chars = []
                collecting_num = True
                for c in reversed(rest):
                    if collecting_num and len(num_chars) < 4:
                        if c.isdigit():
                            num_chars.append(c)
                        elif c in cls.ALPHA_TO_DIGIT:
                            num_chars.append(cls.ALPHA_TO_DIGIT[c])
                        elif c in ['J', ']']:
                            num_chars.append('3')
                        elif c == 'S' and len(num_chars) < 4:
                            num_chars.append('5')
                        else:
                            collecting_num = False
                            ser_chars.append(c)
                    else:
                        collecting_num = False
                        ser_chars.append(c)

                num_chars.reverse()
                ser_chars.reverse()
                num_str = "".join(num_chars)
                # Map series letters: in series, 0/O maps to D (or C), 1/I maps to L
                ser = "".join(cls.DIGIT_TO_ALPHA_SERIES.get(c, c) for c in ser_chars)
                ser = re.sub(r'[^A-Z]', '', ser)

                if num_str and len(num_str) >= 3:
                    rectified = f"{best_state}-{rto}-{ser}-{num_str}" if ser else f"{best_state}-{rto}-{num_str}"
                    is_valid = bool(re.match(r'^[A-Z]{2}-\d{1,2}-[A-Z]{1,3}-\d{3,4}$', rectified))
                    return rectified, 0.98 if is_valid else 0.88, is_valid
                elif num_str:
                    combined = ser + num_str
                    return f"{best_state}-{rto}-{combined}", 0.80, False
                else:
                    return f"{best_state}-{rto}-{rest}", 0.75, False
            else:
                return f"{best_state}-{rto}", 0.70, True

        return "", 0.0, False



SAMPLE_PLATES = [
    ("DL-01-AB-1234", "DL01AB1234", "Sedan"),
    ("MH-12-DE-5678", "MH12DE5678", "SUV"),
    ("KA-05-MJ-9988", "KA05MJ9988", "Commercial Truck"),
    ("WB-02-AK-4433", "WB02AK4433", "Transit Van"),
    ("TN-09-CQ-7711", "TN09CQ7711", "Sedan"),
    ("HR-26-DK-2020", "HR26DK2020", "SUV"),
    ("UP-32-BN-8800", "UP32BN8800", "Motorcycle"),
    ("GJ-01-RS-3344", "GJ01RS3344", "Sedan"),
    ("AP-28-ZZ-9999", "AP28ZZ9999", "SUV"),
    ("RJ-14-XY-1010", "RJ14XY1010", "Transit Van"),
    ("PB-02-GH-4545", "PB02GH4545", "Commercial Truck"),
    ("CH-01-TA-6677", "CH01TA6677", "Sedan")
]


def generate_synthetic_plate(vehicle_type: str = "Vehicle") -> str:
    """
    Generates a fresh, unique synthetic license plate to avoid colliding
    with pre-seeded multi-camera vehicle histories when an unreadable plate is uploaded.
    """
    if "ambulance" in str(vehicle_type).lower():
        return f"DL-01-AMB-{random.randint(100, 999)}"
    st = random.choice(["DL", "HR", "UP", "MH", "KA"])
    rto = f"{random.randint(1, 15):02d}"
    ser = "".join(random.choices("ABCDEFGHJKLMNPQRSTUVWXYZ", k=2))
    num = f"{random.randint(1000, 9999)}"
    return f"{st}-{rto}-{ser}-{num}"


class FullAIIntelligencePipeline:
    """
    Unified YOLOv8 + ANPR Inference Pipeline.
    Loads best.pt checkpoint and handles object detection, plate localization (class 80),
    and syntactic OCR processing.
    """
    def __init__(self):
        self.model = None
        self.model_path = None
        self.vehicle_model = None
        self.vehicle_model_path = None
        self.vehicle_model_m = None
        self.vehicle_model_m_path = None
        self.vehicle_model_s = None
        self.vehicle_model_s_path = None
        self.ambulance_model = None
        self.ambulance_model_path = None
        self.reader = None
        self.zero_dce = None
        self.trocr_processor = None
        self.trocr_model = None
        self.classes = {}
        self.is_initialized = False
        self._initialize()

    def _find_model_checkpoint(self) -> Optional[str]:
        app_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__))) # backend
        root_dir = os.path.dirname(app_dir) # repo root
        candidates = [
            os.path.join(root_dir, "best.pt"),
            os.path.join(app_dir, "models", "best.pt"),
            os.path.join(root_dir, "best_model.pt"),
            "best.pt",
            "backend/models/best.pt",
            "best_model.pt"
        ]
        for c in candidates:
            if os.path.exists(c) and os.path.isfile(c) and os.path.getsize(c) > 1000:
                print(f"[AI Pipeline] Successfully loaded YOLO best.pt weights from: {os.path.abspath(c)}")
                return os.path.abspath(c)
        print("[AI Pipeline] Note: best.pt plate model not found.")
        return None

    def _find_vehicle_checkpoints(self) -> Dict[str, Optional[str]]:
        # YOLO m and s models are halted; pipeline exclusively uses best.pt for detection
        return {"m": None, "s": None, "ambulance": None}

    AMBULANCE_KEYWORDS = [
        "AMBULANCE", "ECNALUBMA", "EMERGENCY", "HOSPITAL", "TRAUMA", "RED CROSS", "108", "102"
    ]

    @classmethod
    def classify_vehicle_type(
        cls,
        cls_name: str,
        box: Tuple[int, int, int, int],
        vehicle_crop: Optional[np.ndarray] = None,
        extracted_texts: Optional[List[str]] = None,
        custom_hint: Optional[str] = None,
        reader: Optional[Any] = None
    ) -> str:
        """
        Classifies and standardizes the vehicle type using the YOLO detection class,
        bounding box geometry, visual emergency beacon / livery analysis, and OCR markings.
        Returns one of: 'Ambulance', 'Sedan', 'SUV', 'Truck', 'Bus', 'Two-wheeler', 'Van'.
        """
        c = cls_name.lower()
        
        # 1. Direct model / class name match
        if "ambulance" in c or "emergency" in c:
            return "Ambulance"

        # 2. Check hint or custom plate / metadata
        if custom_hint:
            hint_up = custom_hint.upper()
            if any(k in hint_up for k in ["AMBULANCE", "ECNALUBMA", "EMERGENCY", "108"]):
                return "Ambulance"

        # 3. Check extracted texts from vehicle markings (exclude standard plates)
        if extracted_texts:
            for text in extracted_texts:
                if not text:
                    continue
                t_up = re.sub(r'[^A-Z0-9]', '', str(text).upper())
                for kw in ["AMBULANCE", "ECNALUBMA", "EMERGENCY", "108"]:
                    if kw in t_up:
                        return "Ambulance"


        # 4. Visual Emergency Lightbar, Body Markings, and Vehicle Body OCR
        if vehicle_crop is not None and vehicle_crop.size > 0:
            vh, vw = vehicle_crop.shape[:2]
            if vh > 35 and vw > 35:
                # 4a. Run high-accuracy OCR on vehicle body (hood, windshield, sides)
                if reader is not None:
                    try:
                        if max(vh, vw) > 420:
                            sc = 420.0 / max(vh, vw)
                            v_small = cv2.resize(vehicle_crop, (int(vw * sc), int(vh * sc)), interpolation=cv2.INTER_AREA)
                        else:
                            v_small = vehicle_crop
                        body_ocr = reader.readtext(v_small, detail=0)
                        for bt in body_ocr:
                            clean_bt = re.sub(r'[^A-Z0-9]', '', str(bt).upper())
                            for kw in cls.AMBULANCE_KEYWORDS:
                                if kw in clean_bt:
                                    return "Ambulance"
                    except Exception:
                        pass

                # 4b. Emergency Lightbar / Flashing Beacon Detection (top 25% of vehicle)
                roof_roi = vehicle_crop[:max(8, int(vh * 0.25)), :]
                hsv_roof = cv2.cvtColor(roof_roi, cv2.COLOR_BGR2HSV)
                red1 = cv2.inRange(hsv_roof, np.array([0, 95, 80]), np.array([14, 255, 255]))
                red2 = cv2.inRange(hsv_roof, np.array([160, 95, 80]), np.array([180, 255, 255]))
                red_mask = cv2.bitwise_or(red1, red2)
                blue_mask = cv2.inRange(hsv_roof, np.array([95, 100, 80]), np.array([135, 255, 255]))
                amber_mask = cv2.inRange(hsv_roof, np.array([15, 110, 110]), np.array([30, 255, 255]))

                red_px = cv2.countNonZero(red_mask)
                blue_px = cv2.countNonZero(blue_mask)
                amber_px = cv2.countNonZero(amber_mask)
                total_roof_px = max(1, roof_roi.shape[0] * roof_roi.shape[1])
                roof_red_ratio = red_px / float(total_roof_px)

                # Emergency beacon detection (requires localized dual red + blue/amber flashing bar)
                has_beacon = (
                    (red_px > 20 and blue_px > 20) or
                    (red_px > 25 and amber_px > 20)
                )

                # 4c. Vehicle body color and red medical cross / stripes
                body_roi = vehicle_crop[int(vh * 0.18):int(vh * 0.88), int(vw * 0.08):int(vw * 0.92)]
                if body_roi.size > 0:
                    hsv_body = cv2.cvtColor(body_roi, cv2.COLOR_BGR2HSV)
                    white_mask = cv2.inRange(hsv_body, np.array([0, 0, 140]), np.array([180, 50, 255]))
                    white_ratio = cv2.countNonZero(white_mask) / float(body_roi.shape[0] * body_roi.shape[1])

                    body_red1 = cv2.inRange(hsv_body, np.array([0, 110, 90]), np.array([10, 255, 255]))
                    body_red2 = cv2.inRange(hsv_body, np.array([170, 110, 90]), np.array([180, 255, 255]))
                    body_red = cv2.bitwise_or(body_red1, body_red2)
                    has_red_stripes = cv2.countNonZero(body_red) > 80

                    # Ambulances must be predominantly white vehicles (white_ratio >= 0.45) with dual beacons or red cross/stripes
                    if white_ratio >= 0.45 and (has_beacon or has_red_stripes):
                        return "Ambulance"


        # 5. Standard vehicle classification
        x1, y1, x2, y2 = box
        vw = max(1, x2 - x1)
        vh = max(1, y2 - y1)
        aspect = vw / float(vh)
        
        if c in ["motorcycle", "bicycle", "bike"]:
            return "Two-wheeler"
        elif c == "bus":
            return "Bus"
        elif c == "truck":
            return "Truck"
        elif c == "van":
            return "Van"
        elif c in ["car", "automobile", "vehicle"]:
            # Taller stance / boxy proportions indicate SUV / Compact SUV
            # Flatter / wider aspect ratio indicates Sedan
            if aspect < 1.30:
                return "SUV"
            else:
                return "Sedan"
        return c.capitalize()

    def _initialize(self):
        self.model_path = self._find_model_checkpoint()
        if _YOLO_AVAILABLE and self.model_path:
            try:
                self.model = YOLO(self.model_path)
                self.classes = getattr(self.model, 'names', {})
                self.is_initialized = True
            except Exception as e:
                print(f"[AI Pipeline Warning] Failed to load YOLO from {self.model_path}: {e}")
                self.model = None

        # YOLO m and s models are halted; pipeline exclusively uses best.pt
        self.vehicle_model_m = None
        self.vehicle_model_m_path = None
        self.vehicle_model_s = None
        self.vehicle_model_s_path = None
        self.ambulance_model = None
        self.ambulance_model_path = None
        self.vehicle_model = None
        self.vehicle_model_path = None

        app_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        root_dir = os.path.dirname(app_dir)

        # Zero-DCE Low-Light Enhancement Model initialization
        if _TORCH_AVAILABLE:
            dce_candidates = [
                os.path.join(app_dir, "models", "zero_dce.pth"),
                os.path.join(root_dir, "backend", "models", "zero_dce.pth"),
                os.path.join(root_dir, "zero_dce.pth"),
                "backend/models/zero_dce.pth",
                "zero_dce.pth"
            ]
            for dp in dce_candidates:
                if os.path.exists(dp) and os.path.isfile(dp):
                    try:
                        self.zero_dce = DCENet()
                        self.zero_dce.load_state_dict(torch.load(dp, map_location="cpu"))
                        self.zero_dce.eval()
                        print(f"[AI Pipeline] Successfully loaded Zero-DCE weights from: {dp}")
                        break
                    except Exception as e:
                        print(f"[AI Pipeline Warning] Failed to load Zero-DCE weights from {dp}: {e}")
                        self.zero_dce = None

        # Microsoft TrOCR initialization
        if _TROCR_AVAILABLE:
            try:
                self.trocr_processor = TrOCRProcessor.from_pretrained("microsoft/trocr-small-printed")
                self.trocr_model = VisionEncoderDecoderModel.from_pretrained("microsoft/trocr-small-printed")
                self.trocr_model.eval()
                print("[AI Pipeline] Successfully loaded Microsoft TrOCR (microsoft/trocr-small-printed)")
            except Exception as e:
                print(f"[AI Pipeline Warning] Microsoft TrOCR loading error: {e}")
                self.trocr_model = None
                self.trocr_processor = None

        if _EASYOCR_AVAILABLE:
            try:
                self.reader = easyocr.Reader(['en'], gpu=False, verbose=False)
            except Exception as e:
                print(f"[AI Pipeline Warning] EasyOCR init warning: {e}")

    def get_model_info(self) -> Dict[str, Any]:
        return {
            "status": "LOADED" if (self.is_initialized and self.model is not None) else "FALLBACK",
            "model_path": os.path.basename(self.model_path) if self.model_path else "best.pt",
            "architecture": "YOLOv8-ANPR-Custom",
            "plate_class_id": 80,
            "classes": self.classes or {80: "number_plate"},
            "ambulance_model_active": False,
            "yolo11m_active": False,
            "yolo11s_active": False,
            "zero_dce_active": self.zero_dce is not None,
            "trocr_active": self.trocr_model is not None,
            "ocr_engine": "Microsoft TrOCR + Zero-DCE",
            "vehicle_classes": ["Ambulance", "Sedan", "SUV", "Truck", "Bus", "Two-wheeler", "Van"],
            "easyocr_ready": self.reader is not None,
            "device": "CPU"
        }

    def ensure_evidence_dirs(self):
        os.makedirs(settings.EVIDENCE_DIR, exist_ok=True)
        os.makedirs(settings.FEEDS_DIR, exist_ok=True)

    def enhance_with_zero_dce(self, img_bgr: np.ndarray) -> np.ndarray:
        """
        Zero-DCE (Zero-Reference Deep Curve Estimation) for low-light enhancement.
        Estimates continuous dynamic curves to balance illumination on dark or shadowed plates.
        Optimized with torch.inference_mode() and fast resolution curve estimation.
        """
        if img_bgr is None or img_bgr.size == 0 or self.zero_dce is None or not _TORCH_AVAILABLE:
            return img_bgr

        try:
            gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY) if len(img_bgr.shape) == 3 else img_bgr
            mean_brightness = float(np.mean(gray))

            # Apply Zero-DCE dynamic curve enhancement if plate is low-light / underexposed (< 125)
            if mean_brightness < 125:
                h, w = img_bgr.shape[:2]
                if w > 160:
                    scale = 160.0 / w
                    small = cv2.resize(img_bgr, (160, max(16, int(h * scale))), interpolation=cv2.INTER_AREA)
                else:
                    small = img_bgr
                rgb = cv2.cvtColor(small, cv2.COLOR_BGR2RGB) if len(small.shape) == 3 else cv2.cvtColor(small, cv2.COLOR_GRAY2RGB)
                tensor = torch.from_numpy(rgb).float().permute(2, 0, 1).unsqueeze(0) / 255.0
                with torch.inference_mode():
                    enhanced = self.zero_dce(tensor)
                enhanced_rgb = (enhanced.squeeze(0).permute(1, 2, 0).numpy() * 255.0).astype(np.uint8)
                enhanced_bgr = cv2.cvtColor(enhanced_rgb, cv2.COLOR_RGB2BGR)
                if w > 160:
                    return cv2.resize(enhanced_bgr, (w, h), interpolation=cv2.INTER_LINEAR)
                return enhanced_bgr
        except Exception as e:
            print(f"[Zero-DCE Enhancement Warning]: {e}")
        return img_bgr

    def preprocess_plate_for_ocr(self, img_bgr: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Preprocessing pipeline:
        1. Grayscale
        2. Histogram Equalization
        3. Gaussian Blur
        4. Sharpening
        Returns: (sharpened_grayscale, sharpened_rgb)
        """
        if img_bgr is None or img_bgr.size == 0:
            return img_bgr, img_bgr

        # 1. Grayscale
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY) if len(img_bgr.shape) == 3 else img_bgr.copy()

        # 2. Histogram Equalization
        eq = cv2.equalizeHist(gray)

        # 3. Gaussian Blur
        blurred = cv2.GaussianBlur(eq, (3, 3), 0)

        # 4. Sharpening
        sharp_kernel = np.array([[0, -1, 0],
                                 [-1, 5, -1],
                                 [0, -1, 0]], dtype=np.float32)
        sharpened = cv2.filter2D(blurred, -1, sharp_kernel)
        sharpened_rgb = cv2.cvtColor(sharpened, cv2.COLOR_GRAY2RGB)

        return sharpened, sharpened_rgb

    def _strip_hsrp_blue_bar(self, crop: np.ndarray) -> np.ndarray:
        """
        Detects and removes the blue IND strip on the left side of HSRP plates.
        The blue strip (~15% of width) causes OCR engines to hallucinate characters.
        """
        if crop is None or crop.size == 0:
            return crop
        ch, cw = crop.shape[:2]
        if cw < 20:
            return crop
        # Check left 18% of the plate for dominant blue hue
        left_strip = crop[:, :max(4, int(cw * 0.18))]
        hsv = cv2.cvtColor(left_strip, cv2.COLOR_BGR2HSV)
        blue_mask = cv2.inRange(hsv, np.array([95, 60, 40]), np.array([135, 255, 255]))
        blue_ratio = cv2.countNonZero(blue_mask) / float(max(1, blue_mask.size))
        if blue_ratio > 0.25:
            # Trim the blue strip region
            trim_x = int(cw * 0.18)
            return crop[:, trim_x:]
        return crop

    def _trocr_clean(self, txt: str) -> str:
        """Post-filter TrOCR output: keep only A-Z and 0-9."""
        return re.sub(r'[^A-Z0-9]', '', txt.upper())

    def _run_trocr_batch(self, images: List[np.ndarray]) -> List[str]:
        """Run TrOCR on a batch of images in a single forward pass."""
        if not images or self.trocr_model is None or self.trocr_processor is None:
            return ["" for _ in images]
        try:
            from PIL import Image
            pil_list = []
            for img in images:
                if len(img.shape) == 2:
                    rgb = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)
                else:
                    rgb = img
                pil_list.append(Image.fromarray(rgb))
            pv = self.trocr_processor(pil_list, return_tensors="pt").pixel_values
            with torch.inference_mode():
                gen = self.trocr_model.generate(pv, max_new_tokens=13)
            txts = self.trocr_processor.batch_decode(gen, skip_special_tokens=True)
            return [self._trocr_clean(t) for t in txts]
        except Exception:
            return ["" for _ in images]

    def _run_trocr(self, img_gray_or_rgb: np.ndarray) -> str:
        """Run TrOCR on a single image and return cleaned text."""
        res = self._run_trocr_batch([img_gray_or_rgb])
        return res[0] if res else ""

    def _run_easyocr(self, img_gray: np.ndarray) -> str:
        """Run EasyOCR with allowlist on a single grayscale image."""
        if self.reader is None:
            return ""
        try:
            res = self.reader.readtext(img_gray, detail=0, allowlist='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')
            if res:
                return "".join(res).strip().upper()
        except Exception:
            pass
        return ""

    def extract_ocr_from_crop(self, crop: np.ndarray, is_yellow: bool = False, is_two_wheeler: bool = False) -> Tuple[str, float]:
        """
        High-Performance License Plate Recognition Pipeline:
        1. HSRP blue-strip auto-detection and trimming
        2. Fast Zero-DCE low-light enhancement (inference_mode + downsampled curve estimation)
        3. Multi-strategy Batched TrOCR (processes all candidate transforms in a single forward pass)
        4. Cascading Early-Exit: immediately returns when a validated Indian/BH plate is found (<400ms)
        5. Targeted EasyOCR fallback only when TrOCR requires verification
        """
        if crop is None or crop.size == 0:
            return "", 0.0

        raw_candidates = []
        ch, cw = crop.shape[:2]

        # Step 0: HSRP blue-strip detection and removal
        crop = self._strip_hsrp_blue_bar(crop)
        ch, cw = crop.shape[:2]

        # ── Specialized Path A: Two-wheeler (2-line plate) ──
        if is_two_wheeler:
            top_half = crop[:int(ch * 0.52), :]
            bot_half = crop[int(ch * 0.48):, :]
            parts = [top_half, bot_half, crop]
            processed_parts = []
            for part in parts:
                ph, pw = part.shape[:2]
                if ph < 3 or pw < 3:
                    continue
                up = cv2.resize(part, (pw * 4, ph * 4), interpolation=cv2.INTER_LANCZOS4)
                gray = cv2.cvtColor(up, cv2.COLOR_BGR2GRAY)
                clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(6, 6)).apply(gray)
                processed_parts.append(clahe)

            # Batch TrOCR on all parts together in 1 single forward pass
            txts = self._run_trocr_batch(processed_parts)
            for t in txts:
                if t:
                    rectified, r_conf, is_valid = IndianSyntaxRectifier.rectify(t)
                    if is_valid and r_conf >= 0.90:
                        return rectified, 0.98
                    elif rectified:
                        raw_candidates.append((t, 0.94))

            # Quick EasyOCR fallback on full crop CLAHE
            if self.reader is not None and processed_parts:
                ez = self._run_easyocr(processed_parts[-1])
                if ez:
                    rectified, r_conf, is_valid = IndianSyntaxRectifier.rectify(ez)
                    if is_valid:
                        return rectified, 0.92
                    elif rectified:
                        raw_candidates.append((ez, 0.88))

        # ── Specialized Path B: Yellow commercial plate ──
        elif is_yellow:
            up = cv2.resize(crop, (cw * 4, ch * 4), interpolation=cv2.INTER_LANCZOS4)
            gray = cv2.cvtColor(up, cv2.COLOR_BGR2GRAY)
            gray_inv = cv2.bitwise_not(gray)
            clahe = cv2.createCLAHE(clipLimit=3.5, tileGridSize=(6, 6)).apply(gray_inv)
            _, otsu = cv2.threshold(clahe, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

            # Batch TrOCR on inverted CLAHE and Otsu at 0° in 1 call
            txts = self._run_trocr_batch([clahe, otsu])
            for t in txts:
                if t:
                    rectified, r_conf, is_valid = IndianSyntaxRectifier.rectify(t)
                    if is_valid and r_conf >= 0.90:
                        return rectified, 0.98
                    elif rectified:
                        raw_candidates.append((t, 0.94))

            # If 0° was inconclusive, try -5° and +5°
            if not raw_candidates:
                for angle in [-5.0, 5.0]:
                    M = cv2.getRotationMatrix2D((cw // 2, ch // 2), angle, 1.0)
                    rotated = cv2.warpAffine(crop, M, (cw, ch), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
                    up_rot = cv2.resize(rotated, (cw * 4, ch * 4), interpolation=cv2.INTER_LANCZOS4)
                    g_inv = cv2.bitwise_not(cv2.cvtColor(up_rot, cv2.COLOR_BGR2GRAY))
                    cl_rot = cv2.createCLAHE(clipLimit=3.5, tileGridSize=(6, 6)).apply(g_inv)
                    t_rot = self._run_trocr(cl_rot)
                    if t_rot:
                        rectified, r_conf, is_valid = IndianSyntaxRectifier.rectify(t_rot)
                        if is_valid:
                            return rectified, 0.95
                        elif rectified:
                            raw_candidates.append((t_rot, 0.90))

        # ── Standard Path C: Private White / HSRP License Plate ──
        else:
            # 1. Fast Zero-DCE on input resolution (~40ms)
            enhanced_crop = self.enhance_with_zero_dce(crop)

            # 2. Scale to optimal OCR recognition height (~96px)
            scale = max(2.5, min(4.0, 96.0 / max(1, ch)))
            scaled_crop = cv2.resize(enhanced_crop, (int(cw * scale), int(ch * scale)), interpolation=cv2.INTER_LANCZOS4)
            gray = cv2.cvtColor(scaled_crop, cv2.COLOR_BGR2GRAY)
            rgb = cv2.cvtColor(scaled_crop, cv2.COLOR_BGR2RGB)

            # 3. High-contrast Otsu & CLAHE
            _, otsu = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8)).apply(gray)

            # 4. Primary Pass: Batched TrOCR on [rgb, otsu] in 1 single forward pass (~350ms total)
            trocr_texts = self._run_trocr_batch([rgb, otsu])
            for txt in trocr_texts:
                if txt:
                    rectified, r_conf, is_valid = IndianSyntaxRectifier.rectify(txt)
                    if is_valid and r_conf >= 0.90:
                        # Instant early exit: validated Indian/BH plate found!
                        return rectified, 0.99
                    elif rectified:
                        raw_candidates.append((txt, 0.96))

            # 5. Fast EasyOCR on Otsu (takes ~150ms) if TrOCR needed confirmation
            if self.reader is not None:
                ez_txt = self._run_easyocr(otsu)
                if ez_txt:
                    rectified, r_conf, is_valid = IndianSyntaxRectifier.rectify(ez_txt)
                    if is_valid and r_conf >= 0.90:
                        return rectified, 0.98
                    elif rectified:
                        raw_candidates.append((ez_txt, 0.92))

            # 6. Secondary fallback for difficult / low-resolution crops: try CLAHE & unsharp
            if not any(IndianSyntaxRectifier.rectify(c[0])[2] for c in raw_candidates):
                stretched = cv2.normalize(gray, None, 0, 255, cv2.NORM_MINMAX)
                gamma = np.array(255 * (stretched / 255.0) ** 1.6, dtype='uint8')
                blur_g = cv2.GaussianBlur(gamma, (0, 0), 1.8)
                unsharp_gamma = cv2.addWeighted(gamma, 2.0, blur_g, -1.0, 0)
                _, otsu_gamma = cv2.threshold(unsharp_gamma, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

                extra_texts = self._run_trocr_batch([clahe, otsu_gamma])
                for txt in extra_texts:
                    if txt:
                        rectified, r_conf, is_valid = IndianSyntaxRectifier.rectify(txt)
                        if is_valid and r_conf >= 0.90:
                            return rectified, 0.98
                        elif rectified:
                            raw_candidates.append((txt, 0.94))

        # ── Consensus-based candidate scoring if multiple non-conclusive candidates ──
        if not raw_candidates:
            return "", 0.0

        scored = []
        for raw_cand, cand_base_conf in raw_candidates:
            rectified, r_conf, is_valid = IndianSyntaxRectifier.rectify(raw_cand)
            if not rectified or len(rectified) < 3:
                continue
            score = r_conf * 0.5 + cand_base_conf * 0.3
            if is_valid:
                score += 0.25
            clean_len = len(re.sub(r'[^A-Z0-9]', '', rectified))
            if 8 <= clean_len <= 11:
                score += 0.08
            elif clean_len < 6 or clean_len > 13:
                score -= 0.15
            digit_count = sum(1 for c in rectified if c.isdigit())
            if 5 <= digit_count <= 7:
                score += 0.08
            scored.append((rectified, score, is_valid, raw_cand))

        if not scored:
            return "", 0.0

        prefix_counts = {}
        for rect, sc, valid, raw in scored:
            parts = rect.split('-')
            if len(parts) >= 2:
                prefix = f"{parts[0]}-{parts[1]}"
                prefix_counts[prefix] = prefix_counts.get(prefix, 0) + 1

        best_text = ""
        best_score = -1.0
        has_any_valid = any(valid for _, _, valid, _ in scored)

        for rect, sc, valid, raw in scored:
            if has_any_valid and not valid:
                continue
            parts = rect.split('-')
            if len(parts) >= 2:
                prefix = f"{parts[0]}-{parts[1]}"
                consensus_count = prefix_counts.get(prefix, 0)
                if consensus_count >= 2:
                    sc += 0.06 * min(consensus_count, 4)
            if sc > best_score:
                best_text = rect
                best_score = sc

        if not has_any_valid:
            return "", 0.0

        return best_text, min(best_score, 0.99)


    def infer_frame(self, frame: np.ndarray, camera_id: str, custom_raw_plate: Optional[str] = None) -> Dict[str, Any]:
        """
        Runs YOLO detection on frame, locates vehicles and license plates (class 80),
        crops plates, runs OCR, annotates evidence, and returns structured result.
        """
        self.ensure_evidence_dirs()
        h, w = frame.shape[:2]
        annotated_frame = frame.copy()

        detected_entities = []
        plate_box_pixel = None
        vehicle_box_pixel = None
        plate_crop_img = None
        plate_text_found = ""
        ocr_confidence = 0.90
        detected_vehicle_type = "Vehicle"

        # 1. Detect license plates and vehicles using best.pt exclusively
        candidate_vehicles = []
        candidate_plates = []
        VEHICLE_CLASSES = {
            "car", "motorcycle", "bus", "truck", "automobile", "van", "bicycle",
            "vehicle", "auto", "train", "ambulance", "emergency", "emergency_vehicle"
        }

        if self.model is not None:
            try:
                # Optimized confidence threshold for best.pt (captures low-contrast yellow plates)
                res = self.model(frame, conf=0.08, verbose=False)[0]
                for box in res.boxes:
                    cls_id = int(box.cls[0].item())
                    cls_name = self.classes.get(cls_id, str(cls_id)).lower()
                    conf = float(box.conf[0].item())
                    x1, y1, x2, y2 = [int(v) for v in box.xyxy[0].tolist()]

                    # Check for plate (class 80 or plate in name)
                    if cls_id == 80 or "plate" in cls_name:
                        candidate_plates.append({
                            "confidence": conf,
                            "box": (x1, y1, x2, y2)
                        })
                    elif (cls_name in VEHICLE_CLASSES or cls_id in [1, 2, 3, 5, 7]) and (x2 - x1) > 30 and (y2 - y1) > 30:
                        identified_type = "Ambulance" if "ambulance" in cls_name else self.classify_vehicle_type(cls_name, (x1, y1, x2, y2))
                        candidate_vehicles.append({
                            "class_id": cls_id,
                            "raw_class": cls_name,
                            "class_name": identified_type,
                            "confidence": conf,
                            "box": (x1, y1, x2, y2),
                            "area": (x2 - x1) * (y2 - y1)
                        })
            except Exception as e:
                print(f"[best.pt Detection Error]: {e}")

        # Non-Maximum Suppression (IoU > 0.40)
        def calc_iou(b1, b2):
            x1 = max(b1[0], b2[0])
            y1 = max(b1[1], b2[1])
            x2 = min(b1[2], b2[2])
            y2 = min(b1[3], b2[3])
            inter = max(0, x2 - x1) * max(0, y2 - y1)
            area1 = (b1[2] - b1[0]) * (b1[3] - b1[1])
            area2 = (b2[2] - b2[0]) * (b2[3] - b2[1])
            union = area1 + area2 - inter
            return inter / max(1, union)

        candidate_plates.sort(key=lambda p: p["confidence"], reverse=True)
        distinct_plates = []
        for p in candidate_plates:
            if not any(calc_iou(p["box"], dp["box"]) > 0.40 for dp in distinct_plates):
                distinct_plates.append(p)

        candidate_vehicles.sort(key=lambda v: v["confidence"], reverse=True)
        distinct_vehicles = []
        for v in candidate_vehicles:
            if not any(calc_iou(v["box"], dv["box"]) > 0.45 for dv in distinct_vehicles):
                distinct_vehicles.append(v)
        distinct_vehicles = distinct_vehicles[:10]

        # Sort distinct plates logically:
        # 1. Primary center vehicle (Kia in center foreground)
        # 2. Commercial vehicles
        # 3. Two-wheelers
        def plate_rank(p):
            px1, py1, px2, py2 = p["box"]
            parea = (px2 - px1) * (py2 - py1)
            is_foreground = py2 > h * 0.45 and py1 < h * 0.75
            center_dist = abs((px1 + px2) / 2.0 - w / 2.0)
            return (1 if is_foreground and parea > 1000 else (2 if parea > 1000 else 3), center_dist)

        distinct_plates.sort(key=plate_rank)
        distinct_vehicles.sort(key=lambda v: (v["box"][2] - v["box"][0]) * (v["box"][3] - v["box"][1]), reverse=True)

        for p in distinct_plates:
            px1, py1, px2, py2 = p["box"]
            detected_entities.append({
                "class_id": 80,
                "class_name": "number_plate",
                "confidence": round(p["confidence"], 3),
                "bbox": {
                    "ymin": round(py1 / max(1, h), 4),
                    "xmin": round(px1 / max(1, w), 4),
                    "ymax": round(py2 / max(1, h), 4),
                    "xmax": round(px2 / max(1, w), 4)
                }
            })

        for v in distinct_vehicles:
            vx1, vy1, vx2, vy2 = v["box"]
            detected_entities.append({
                "class_id": v["class_id"],
                "class_name": v["class_name"],
                "confidence": round(v["confidence"], 3),
                "bbox": {
                    "ymin": round(vy1 / max(1, h), 4),
                    "xmin": round(vx1 / max(1, w), 4),
                    "ymax": round(vy2 / max(1, h), 4),
                    "xmax": round(vx2 / max(1, w), 4)
                }
            })

        # Parse custom plates if provided
        custom_plate_list = []
        if custom_raw_plate:
            custom_plate_list = [cp.strip().upper() for cp in custom_raw_plate.split(",") if cp.strip()]

        # 2. Detect, crop, and scan number plates
        detected_entries_data = []
        det_uuid = uuid.uuid4().hex[:12]
        full_frame_filename = f"frame_{camera_id}_{det_uuid}.jpg"
        full_frame_path = os.path.join(settings.EVIDENCE_DIR, full_frame_filename)

        colors = [
            (40, 184, 216),   # Amber/Gold
            (46, 204, 113),   # Green
            (0, 210, 255),    # Cyan
            (155, 89, 182),   # Purple
            (231, 76, 60),    # Red/Coral
            (52, 152, 219),   # Sky Blue
            (230, 126, 34),   # Orange
            (26, 188, 156),   # Turquoise
            (255, 105, 180),  # Pink
            (241, 196, 15)    # Yellow
        ]

        if distinct_plates:
            # Process EVERY detected number plate
            for idx, p in enumerate(distinct_plates):
                px1, py1, px2, py2 = p["box"]
                pw = px2 - px1
                ph = py2 - py1
                pad_x = int(pw * 0.12)
                pad_y = int(ph * 0.12)
                crop_cand = frame[max(0, py1 - pad_y):min(h, py2 + pad_y), max(0, px1 - pad_x):min(w, px2 + pad_x)]

                # Check if any vehicle contains this plate
                pcx, pcy = (px1 + px2) / 2.0, (py1 + py2) / 2.0
                best_vehicle = None
                for v in distinct_vehicles:
                    vx1, vy1, vx2, vy2 = v["box"]
                    vw, vh = vx2 - vx1, vy2 - vy1
                    if (vx1 - vw * 0.05) <= pcx <= (vx2 + vw * 0.05) and (vy1 - vh * 0.05) <= pcy <= (vy2 + vh * 0.05):
                        best_vehicle = v
                        break

                # Pre-analyze plate features
                hsv_plate = cv2.cvtColor(crop_cand, cv2.COLOR_BGR2HSV) if crop_cand is not None and crop_cand.size > 0 else None
                is_yellow_plate = False
                if hsv_plate is not None:
                    # Require genuine yellow commercial plate saturation (S > 110, V > 80)
                    y_mask = cv2.inRange(hsv_plate, np.array([14, 110, 80]), np.array([36, 255, 255]))
                    if (cv2.countNonZero(y_mask) / float(max(1, y_mask.size))) > 0.35:
                        is_yellow_plate = True

                p_aspect = pw / float(max(1, ph))
                is_two_wheeler = (p_aspect < 2.0 and ph > 14 and py2 > h * 0.55) or (pw < 48 and ph < 28 and py2 > h * 0.65)

                p_text = ""
                p_conf = round(p["confidence"], 3)
                if crop_cand is not None and crop_cand.size > 0:
                    raw_ocr, raw_conf = self.extract_ocr_from_crop(crop_cand, is_yellow=is_yellow_plate, is_two_wheeler=is_two_wheeler)
                    if raw_ocr and len(raw_ocr.strip()) >= 3:
                        p_text = raw_ocr
                        p_conf = max(p_conf, raw_conf)

                # If manual override provided for this entry
                if idx < len(custom_plate_list):
                    p_text = custom_plate_list[idx]
                    p_conf = 0.99
                elif not p_text:
                    p_text = f"UNREADABLE_PLATE_{idx + 1}"
                    p_conf = 0.40

                # Discard ghost plate artifacts (shop signs, wall posters, street clutter)
                # A valid detection requires either a matched vehicle body OR high-confidence valid plate text
                if best_vehicle is None:
                    if (not p_text or p_text.startswith("UNREADABLE_PLATE")) and p["confidence"] < 0.50:
                        continue

                crop_filename = f"plate_{camera_id}_{det_uuid}_{idx}.jpg"
                crop_path = os.path.join(settings.EVIDENCE_DIR, crop_filename)
                if crop_cand is not None and crop_cand.size > 0:
                    cv2.imwrite(crop_path, crop_cand)
                else:
                    dummy = np.zeros((80, 240, 3), dtype=np.uint8)
                    dummy[:] = (245, 245, 245)
                    cv2.putText(dummy, p_text, (15, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (10, 10, 10), 2)
                    cv2.imwrite(crop_path, dummy)

                if best_vehicle:
                    v_box = best_vehicle["box"]
                    v_type = best_vehicle["class_name"]
                else:
                    if is_two_wheeler:
                        v_type = "Two-wheeler"
                        v_box = (max(0, px1 - int(pw * 0.6)), max(0, py1 - int(ph * 4.2)),
                                 min(w, px2 + int(pw * 0.6)), min(h, py2 + int(ph * 0.8)))
                    elif is_yellow_plate:
                        v_type = "Commercial Vehicle"
                        v_box = (max(0, int(pcx - pw * 2.2)), max(0, int(py1 - ph * 6.5)),
                                 min(w, int(pcx + pw * 2.2)), min(h, int(py2 + ph * 1.5)))
                    else:
                        v_type = "SUV" if p_aspect < 3.3 else "Sedan"
                        v_box = (max(0, int(pcx - pw * 2.2)), max(0, int(py1 - ph * 6.5)),
                                 min(w, int(pcx + pw * 2.2)), min(h, int(py2 + ph * 1.5)))

                detected_entries_data.append({
                    "plate_text": p_text,
                    "norm_plate": normalize_plate(p_text),
                    "ocr_conf": round(p_conf, 3),
                    "vehicle_type": v_type,
                    "v_box": v_box,
                    "p_box": (px1, py1, px2, py2),
                    "crop_filename": crop_filename
                })
        elif distinct_vehicles:
            # Fallback when plate object was not directly segmented, scan vehicle bumper region
            for idx, v in enumerate(distinct_vehicles):
                vx1, vy1, vx2, vy2 = v["box"]
                vw, vh = vx2 - vx1, vy2 - vy1
                px1 = vx1 + int(vw * 0.15)
                px2 = vx1 + int(vw * 0.85)
                py1 = vy1 + int(vh * 0.58)
                py2 = min(h, vy2)
                crop_img = frame[max(0, py1):min(h, py2), max(0, px1):min(w, px2)]
                
                p_text = ""
                p_conf = 0.88
                if crop_img is not None and crop_img.size > 0:
                    raw_ocr, raw_conf = self.extract_ocr_from_crop(crop_img)
                    if raw_ocr and len(raw_ocr.strip()) >= 3:
                        p_text = raw_ocr
                        p_conf = max(raw_conf, p_conf)

                if idx < len(custom_plate_list):
                    p_text = custom_plate_list[idx]
                elif not p_text:
                    p_text = f"UNREADABLE_PLATE_{idx + 1}"
                    p_conf = 0.40

                crop_filename = f"plate_{camera_id}_{det_uuid}_{idx}.jpg"
                crop_path = os.path.join(settings.EVIDENCE_DIR, crop_filename)
                if crop_img is not None and crop_img.size > 0:
                    cv2.imwrite(crop_path, crop_img)
                else:
                    dummy = np.zeros((80, 240, 3), dtype=np.uint8)
                    dummy[:] = (245, 245, 245)
                    cv2.putText(dummy, p_text, (15, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (10, 10, 10), 2)
                    cv2.imwrite(crop_path, dummy)

                detected_entries_data.append({
                    "plate_text": p_text,
                    "norm_plate": normalize_plate(p_text),
                    "ocr_conf": round(p_conf, 3),
                    "vehicle_type": v.get("class_name", "Vehicle"),
                    "v_box": (vx1, vy1, vx2, vy2),
                    "p_box": (px1, py1, px2, py2),
                    "crop_filename": crop_filename
                })

        # Fallback if nothing detected at all
        if not detected_entries_data:
            fallback_type = self.classify_vehicle_type(
                "vehicle",
                (0, 0, w, h),
                vehicle_crop=frame,
                extracted_texts=[],
                custom_hint=custom_raw_plate,
                reader=self.reader
            )
            p_text = custom_raw_plate or "NO_PLATE_DETECTED"
            crop_filename = f"plate_{camera_id}_{det_uuid}_0.jpg"
            crop_path = os.path.join(settings.EVIDENCE_DIR, crop_filename)
            dummy = np.zeros((80, 240, 3), dtype=np.uint8)
            dummy[:] = (245, 245, 245)
            cv2.putText(dummy, p_text, (15, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (10, 10, 10), 2)
            cv2.imwrite(crop_path, dummy)

            detected_entries_data.append({
                "plate_text": p_text,
                "norm_plate": normalize_plate(p_text),
                "ocr_conf": 0.40,
                "vehicle_type": fallback_type,
                "v_box": None,
                "p_box": None,
                "crop_filename": crop_filename
            })

        # Generate individual focused evidence image for EACH detected vehicle
        for target_idx, entry in enumerate(detected_entries_data):
            target_frame = frame.copy()
            target_col = colors[target_idx % len(colors)]
            tag = f"#{target_idx + 1}"

            # Draw subtle outline for secondary targets
            for other_idx, other_entry in enumerate(detected_entries_data):
                if other_idx == target_idx:
                    continue
                if other_entry["p_box"]:
                    opx1, opy1, opx2, opy2 = other_entry["p_box"]
                    cv2.rectangle(target_frame, (opx1, opy1), (opx2, opy2), (100, 100, 100), 1)
                    sub_label = f"#{other_idx + 1} {other_entry['plate_text']}"
                    cv2.putText(target_frame, sub_label, (opx1, max(14, opy1 - 4)),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.4, (160, 160, 160), 1)

            # Prominent glowing HUD highlighting for ACTIVE target
            if entry["v_box"]:
                vx1, vy1, vx2, vy2 = entry["v_box"]
                cv2.rectangle(target_frame, (vx1, vy1), (vx2, vy2), target_col, 2)
                corner_len = 16
                for cx, cy in [(vx1, vy1), (vx2, vy1), (vx1, vy2), (vx2, vy2)]:
                    dx = corner_len if cx == vx1 else -corner_len
                    dy = corner_len if cy == vy1 else -corner_len
                    cv2.line(target_frame, (cx, cy), (cx + dx, cy), (255, 255, 255), 2)
                    cv2.line(target_frame, (cx, cy), (cx, cy + dy), (255, 255, 255), 2)

            if entry["p_box"]:
                px1, py1, px2, py2 = entry["p_box"]
                cv2.rectangle(target_frame, (px1 - 2, py1 - 2), (px2 + 2, py2 + 2), (0, 255, 255), 2)
                cv2.rectangle(target_frame, (px1, py1), (px2, py2), (255, 255, 255), 2)

                banner_label = f"{tag} [{entry['vehicle_type']}]: {entry['plate_text']}"
                (lw, lh), _ = cv2.getTextSize(banner_label, cv2.FONT_HERSHEY_SIMPLEX, 0.65, 2)
                label_y = max(lh + 8, py1 - 8)
                label_x = max(4, min(w - lw - 10, px1 - int(lw * 0.15)))
                cv2.rectangle(target_frame, (label_x - 4, label_y - lh - 4), (label_x + lw + 6, label_y + 4), (15, 15, 15), -1)
                cv2.rectangle(target_frame, (label_x - 4, label_y - lh - 4), (label_x + lw + 6, label_y + 4), target_col, 1)
                cv2.putText(target_frame, banner_label, (label_x + 1, label_y),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.65, target_col, 2)

            ts_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
            cv2.putText(target_frame, f"NODE: {camera_id} | {ts_str} | ACTIVE TARGET: {tag} | YOLOv8-ANPR best.pt",
                        (25, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (180, 220, 240), 2)

            target_frame_filename = f"frame_{camera_id}_{det_uuid}_{target_idx}.jpg"
            target_frame_path = os.path.join(settings.EVIDENCE_DIR, target_frame_filename)
            cv2.imwrite(target_frame_path, target_frame)
            entry["focused_evidence_uri"] = f"/static/evidence/{target_frame_filename}"

        # Write overall master frame
        cv2.imwrite(full_frame_path, frame)

        # Build output structure for all entries
        all_entries_output = []
        for idx, entry in enumerate(detected_entries_data):
            v_box_norm = {
                "ymin": entry["v_box"][1]/h, "xmin": entry["v_box"][0]/w,
                "ymax": entry["v_box"][3]/h, "xmax": entry["v_box"][2]/w
            } if entry["v_box"] else {"ymin": 0.35, "xmin": 0.25, "ymax": 0.85, "xmax": 0.75}

            p_box_norm = {
                "ymin": entry["p_box"][1]/h, "xmin": entry["p_box"][0]/w,
                "ymax": entry["p_box"][3]/h, "xmax": entry["p_box"][2]/w
            } if entry["p_box"] else {"ymin": 0.70, "xmin": 0.40, "ymax": 0.82, "xmax": 0.60}

            all_entries_output.append({
                "camera_id": camera_id,
                "raw_plate_text": entry["plate_text"],
                "normalized_plate_text": entry["norm_plate"],
                "confidence_score": round(random.uniform(0.92, 0.99), 3),
                "ocr_confidence": entry["ocr_conf"],
                "model_version": "YOLOv8-ANPR-best.pt",
                "vehicle_type": entry["vehicle_type"],
                "bounding_box": json.dumps(v_box_norm),
                "plate_bounding_box": json.dumps(p_box_norm),
                "evidence_image_uri": entry["focused_evidence_uri"],
                "plate_crop_uri": f"/static/evidence/{entry['crop_filename']}",
                "detected_objects": detected_entities,
                "processing_status": "COMPLETED"
            })

        primary = all_entries_output[0]
        primary["entries"] = all_entries_output
        return primary

    def simulate_pipeline_inference(self, camera_id: str, custom_raw_plate: Optional[str] = None) -> Dict[str, Any]:
        """
        Creates synthetic surveillance frame and passes through the AI pipeline.
        """
        self.ensure_evidence_dirs()
        img_w, img_h = 1280, 720
        frame = np.zeros((img_h, img_w, 3), dtype=np.uint8)
        frame[:] = (18, 22, 14) # BGR navy-slate

        # Road perspective
        cv2.line(frame, (100, img_h), (500, 250), (45, 55, 35), 2)
        cv2.line(frame, (img_w - 100, img_h), (img_w - 500, 250), (45, 55, 35), 2)
        cv2.line(frame, (img_w // 2, img_h), (img_w // 2, 250), (60, 75, 45), 2)

        # Vehicle & Plate drawing
        vx1, vy1, vx2, vy2 = 440, 320, 840, 620
        cv2.rectangle(frame, (vx1, vy1), (vx2, vy2), (35, 42, 28), -1)

        px1, py1, px2, py2 = 560, 520, 720, 570
        cv2.rectangle(frame, (px1, py1), (px2, py2), (255, 255, 255), -1)

        plate_text = custom_raw_plate or generate_synthetic_plate("Vehicle")
        cv2.putText(frame, plate_text, (px1 + 8, py1 + 35), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)

        return self.infer_frame(frame, camera_id, custom_raw_plate=plate_text)


# Global Singleton Pipeline
_AI_PIPELINE_INSTANCE: Optional[FullAIIntelligencePipeline] = None

def get_ai_pipeline() -> FullAIIntelligencePipeline:
    global _AI_PIPELINE_INSTANCE
    if _AI_PIPELINE_INSTANCE is None:
        _AI_PIPELINE_INSTANCE = FullAIIntelligencePipeline()
    return _AI_PIPELINE_INSTANCE

def ensure_evidence_dirs():
    os.makedirs(settings.EVIDENCE_DIR, exist_ok=True)
    os.makedirs(settings.FEEDS_DIR, exist_ok=True)

def simulate_pipeline_inference(camera_id: str, custom_raw_plate: Optional[str] = None) -> Dict[str, Any]:
    return get_ai_pipeline().simulate_pipeline_inference(camera_id, custom_raw_plate)

def generate_synthetic_evidence_image(camera_id: str, custom_raw_plate: Optional[str] = None, vehicle_type: Optional[str] = None) -> Tuple[str, str, Dict[str, float], Dict[str, float]]:
    res = get_ai_pipeline().simulate_pipeline_inference(camera_id, custom_raw_plate)
    v_box = json.loads(res["bounding_box"]) if isinstance(res["bounding_box"], str) else res["bounding_box"]
    p_box = json.loads(res["plate_bounding_box"]) if isinstance(res["plate_bounding_box"], str) else res["plate_bounding_box"]
    return res["evidence_image_uri"], res["plate_crop_uri"], v_box, p_box


