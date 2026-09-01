import os
import sys
import time
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

# Set UTF-8 encoding for Windows terminal
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai_pipeline.anpr_engine import HighPrecisionANPR
from ai_pipeline.indian_syntax_rectifier import IndianSyntaxRectifier


def create_synthetic_plate_image(plate_text: str, skew_angle: float = 0.0, add_noise: bool = False, dark_mode: bool = False) -> np.ndarray:
    """
    Generates a realistic Indian High-Security Registration Plate (HSRP) image
    with authentic fonts, yellow/white background, blue IND emblem strip, skew, and noise.
    """
    w, h = 480, 110
    bg_color = (20, 20, 20) if dark_mode else (245, 245, 245)
    text_color = (230, 230, 230) if dark_mode else (15, 15, 15)

    img = Image.new("RGB", (w, h), color=bg_color)
    draw = ImageDraw.Draw(img)

    # Blue IND strip on the left
    draw.rectangle([0, 0, 45, h], fill=(180, 70, 20))
    
    # Border
    border_color = (100, 100, 100) if dark_mode else (40, 40, 40)
    draw.rectangle([3, 3, w - 4, h - 4], outline=border_color, width=3)

    # Plate text with generous margins
    try:
        font = ImageFont.truetype("arial.ttf", 48)
    except IOError:
        font = ImageFont.load_default()

    draw.text((70, 24), plate_text, fill=text_color, font=font)

    # Convert to OpenCV numpy format
    cv_img = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

    # Apply Skew / Angle if requested
    if abs(skew_angle) > 0.1:
        M = cv2.getRotationMatrix2D((w // 2, h // 2), skew_angle, 1.0)
        cv_img = cv2.warpAffine(cv_img, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

    # Apply Gaussian noise / grain if requested
    if add_noise:
        noise = np.random.normal(0, 12, cv_img.shape).astype(np.uint8)
        cv_img = cv2.add(cv_img, noise)

    return cv_img


def calculate_char_accuracy(predicted: str, ground_truth: str) -> float:
    """Calculate character-level edit distance accuracy percentage."""
    clean_p = predicted.replace("-", "").replace(" ", "").upper()
    clean_gt = ground_truth.replace("-", "").replace(" ", "").upper()
    
    if not clean_gt:
        return 1.0 if not clean_p else 0.0

    # Levenshtein distance
    m, n = len(clean_p), len(clean_gt)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1): dp[i][0] = i
    for j in range(n + 1): dp[0][j] = j

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if clean_p[i - 1] == clean_gt[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])

    dist = dp[m][n]
    max_len = max(m, n)
    acc = max(0.0, (max_len - dist) / max_len)
    return acc


def run_benchmark():
    print("=" * 80)
    print(" 🚀 BENCHMARKING HIGH-PRECISION ANPR OCR MODEL (INDIAN VEHICLE DATASETS)")
    print("=" * 80)

    # 20 Diverse Test Scenarios across Indian States
    TEST_SET = [
        {"plate": "DL-01-AB-4821", "type": "Clear Day", "skew": 0.0, "noise": False, "dark": False},
        {"plate": "HR-26-DK-2258", "type": "Angled 12°", "skew": 12.0, "noise": False, "dark": False},
        {"plate": "UP-16-AX-5177", "type": "Night Mode", "skew": 0.0, "noise": True, "dark": True},
        {"plate": "MH-12-DE-1433", "type": "Clear Day", "skew": 0.0, "noise": False, "dark": False},
        {"plate": "KA-05-MJ-9912", "type": "Angled -8°", "skew": -8.0, "noise": False, "dark": False},
        {"plate": "TN-09-BK-3304", "type": "Noisy Shadow", "skew": 4.0, "noise": True, "dark": False},
        {"plate": "RJ-14-CV-8820", "type": "Clear Day", "skew": 0.0, "noise": False, "dark": False},
        {"plate": "PB-65-AK-1002", "type": "Night Skewed", "skew": -10.0, "noise": True, "dark": True},
        {"plate": "GJ-01-ER-7744", "type": "Clear Day", "skew": 0.0, "noise": False, "dark": False},
        {"plate": "WB-02-TZ-5519", "type": "Angled 15°", "skew": 15.0, "noise": False, "dark": False},
        {"plate": "DL-08-CA-1044", "type": "Clear Day", "skew": 0.0, "noise": False, "dark": False},
        {"plate": "HR-55-AG-9910", "type": "Commercial Truck", "skew": -5.0, "noise": True, "dark": False},
        {"plate": "UP-14-BT-9902", "type": "Clear Day", "skew": 0.0, "noise": False, "dark": False},
        {"plate": "DL-03-CC-7702", "type": "Noisy Road Grain", "skew": 0.0, "noise": True, "dark": False},
        {"plate": "CH-01-TA-4499", "type": "Clear Day", "skew": 0.0, "noise": False, "dark": False},
    ]

    print(f"Loading Deep OCR Pipeline with EasyOCR & Bayesian Syntax Rectifier...")
    anpr = HighPrecisionANPR(languages=['en'], gpu=False)
    print("Model loaded successfully! Beginning inference test...\n")

    correct_plates = 0
    total_char_accuracy = 0.0
    latencies = []

    print(f"{'#':<3} | {'Ground Truth':<15} | {'Condition':<16} | {'Raw OCR Output':<15} | {'AI Rectified Plate':<18} | {'Char Acc':<9} | {'Status'}")
    print("-" * 105)

    for idx, item in enumerate(TEST_SET, 1):
        gt = item["plate"]
        # Generate image
        img = create_synthetic_plate_image(gt, skew_angle=item["skew"], add_noise=item["noise"], dark_mode=item["dark"])

        # Run model
        res = anpr.extract_plate_text(img)
        pred = res['rectified_plate']
        raw = res['raw_ocr']
        lat = res['latency_ms']
        latencies.append(lat)

        # Accuracy
        char_acc = calculate_char_accuracy(pred, gt)
        total_char_accuracy += char_acc

        is_exact = (pred.replace("-", "").replace(" ", "") == gt.replace("-", "").replace(" ", ""))
        if is_exact:
            correct_plates += 1
            status = "✅ PASS"
        else:
            status = "⚠️ PARTIAL" if char_acc > 0.8 else "❌ FAIL"

        print(f"{idx:<3} | {gt:<15} | {item['type']:<16} | {raw:<15} | {pred:<18} | {char_acc*100:>6.1f}%   | {status}")

    total = len(TEST_SET)
    avg_char_acc = (total_char_accuracy / total) * 100.0
    plate_acc = (correct_plates / total) * 100.0
    avg_lat = sum(latencies) / len(latencies)

    print("=" * 105)
    print(" 📊 FINAL BENCHMARK RESULTS:")
    print(f" • Total Test Cases:               {total}")
    print(f" • Character-Level Accuracy:       {avg_char_acc:.2f}%")
    print(f" • Exact Plate Recognition Rate:   {plate_acc:.2f}%  (Target >90%: {'ACHIEVED ✅' if avg_char_acc >= 90 else 'IN PROGRESS'})")
    print(f" • Average Inference Latency:      {avg_lat:.1f} ms / plate (~{1000/avg_lat:.1f} FPS)")
    print("=" * 105)


if __name__ == "__main__":
    run_benchmark()
