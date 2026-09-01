import os
import sys
import json
import numpy as np

# Set UTF-8 encoding for Windows terminal
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai_pipeline.anpr_engine import HighPrecisionANPR
from ai_pipeline.benchmark_test import create_synthetic_plate_image
from ai_pipeline.indian_syntax_rectifier import IndianSyntaxRectifier

def inspect_sample_data():
    print("=" * 80)
    print(" 🔍 LIVE INSPECTION: ANPR AI MODEL INFERENCE & PAYLOAD OUTPUT")
    print("=" * 80)

    # Initialize Engine
    anpr = HighPrecisionANPR(languages=['en'], gpu=False)

    # Diverse Real-World Edge Cases
    TEST_CASES = [
        {
            "name": "Case 1: Standard Delhi Commuter (DL VIP Corridor)",
            "plate": "DL-01-AB-4821",
            "condition": "High noon bright lighting, 0° skew",
            "skew": 0.0,
            "noise": False,
            "dark": False
        },
        {
            "name": "Case 2: Gurugram SUV at Flyover Merge (HR Angled View)",
            "plate": "HR-26-DK-2258",
            "condition": "14° camera mounting tilt from overhead gantry",
            "skew": 14.0,
            "noise": False,
            "dark": False
        },
        {
            "name": "Case 3: Noida High-Speed Tollway (UP Nighttime + Sensor Grain)",
            "plate": "UP-16-AX-5177",
            "condition": "Night vision IR camera with high sensor ISO noise",
            "skew": 0.0,
            "noise": True,
            "dark": True
        },
        {
            "name": "Case 4: Heavy Commercial Freight Tipper (HR Aggregates)",
            "plate": "HR-55-AG-9910",
            "condition": "Road dirt, slight -6° tilt, commercial plate aspect",
            "skew": -6.0,
            "noise": True,
            "dark": False
        },
        {
            "name": "Case 5: Mumbai Inter-State Vehicle (MH Western Gateway)",
            "plate": "MH-12-DE-1433",
            "condition": "Standard daytime entry checkpoint",
            "skew": 0.0,
            "noise": False,
            "dark": False
        }
    ]

    for item in TEST_CASES:
        print(f"\n▶ Testing: {item['name']}")
        print(f"  • Condition: {item['condition']}")
        print(f"  • Ground Truth: {item['plate']}")

        # 1. Generate realistic camera crop frame
        img = create_synthetic_plate_image(
            item["plate"],
            skew_angle=item["skew"],
            add_noise=item["noise"],
            dark_mode=item["dark"]
        )

        # 2. Run AI Model Inference
        result = anpr.extract_plate_text(img)

        # 3. Extract Geographic & RTO Metadata from State Code
        state_code = result['rectified_plate'].split('-')[0] if '-' in result['rectified_plate'] else 'UNKNOWN'
        state_name = IndianSyntaxRectifier.INDIAN_STATES.get(state_code, "Unknown Jurisdiction")

        # 4. Enrich full enterprise payload
        payload = {
            "status": "SUCCESS",
            "ground_truth": item["plate"],
            "raw_ocr_stream": result["raw_ocr"],
            "rectified_license_plate": result["rectified_plate"],
            "state_jurisdiction": f"{state_name} ({state_code})",
            "confidence_score": f"{result['confidence'] * 100:.1f}%",
            "is_valid_indian_rto_format": result["is_valid_indian_format"],
            "inference_latency": f"{result['latency_ms']:.1f} ms"
        }

        print("  • Returned Payload:")
        print(json.dumps(payload, indent=4))
        print("-" * 80)

if __name__ == "__main__":
    inspect_sample_data()
