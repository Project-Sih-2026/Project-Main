import os
import sys
import json

# Set UTF-8 encoding for Windows terminal
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai_pipeline.indian_syntax_rectifier import IndianSyntaxRectifier

def test_syntax_repair():
    print("=" * 80)
    print(" 🛠️ TESTING BAYESIAN OPTICAL CONFUSION REPAIR (DIRT / BLURRED OCR)")
    print("=" * 80)

    # Scenarios where OCR misidentifies letters for digits (or vice-versa)
    DISTORTED_OCR_INPUTS = [
        {
            "description": "State & Number confusion: '0' for 'D', 'O' for '0', '8' for 'B', 'I' for '1'",
            "raw_noisy_ocr": "0L-O1-A8-482I",
            "expected": "DL-01-AB-4821"
        },
        {
            "description": "Haryana SUV: 'B' for '8' in RTO code, 'Z' for '2' in number",
            "raw_noisy_ocr": "HR-2G-DK-ZZ58",
            "expected": "HR-26-DK-2258"
        },
        {
            "description": "Noida Tollway: 'I' for '1' in RTO code, 'T' for '7' in number",
            "raw_noisy_ocr": "UP-I6-AX-5IT7",
            "expected": "UP-16-AX-5177"
        },
        {
            "description": "Maharashtra Plate: Space-separated unsegmented string",
            "raw_noisy_ocr": "MH 12 DE 1433",
            "expected": "MH-12-DE-1433"
        },
        {
            "description": "Continuous unhyphenated string with leading 'IND' stamp",
            "raw_noisy_ocr": "INDDL08CA1044",
            "expected": "DL-08-CA-1044"
        }
    ]

    for item in DISTORTED_OCR_INPUTS:
        print(f"\n• Scenario: {item['description']}")
        print(f"  Input Raw OCR String : '{item['raw_noisy_ocr']}'")
        rectified, conf, is_valid = IndianSyntaxRectifier.rectify(item["raw_noisy_ocr"])
        print(f"  AI Rectified Plate   : '{rectified}' (Confidence: {conf*100:.1f}%)")
        print(f"  Target Expected      : '{item['expected']}'")
        match = "✅ EXACT MATCH" if rectified == item['expected'] else "❌ MISMATCH"
        print(f"  Result               : {match}")

if __name__ == "__main__":
    test_syntax_repair()
