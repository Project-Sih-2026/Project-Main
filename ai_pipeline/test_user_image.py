import os
import sys
import json
import cv2

# Set UTF-8 encoding for Windows terminal
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai_pipeline.anpr_engine import HighPrecisionANPR
from ai_pipeline.detect_multi_vehicle_scene import MultiVehicleSceneDetector

def test_uploaded_image(image_path: str):
    print("=" * 80)
    print(" 📸 PROCESSING REAL-WORLD USER-UPLOADED HIGHWAY TRAFFIC IMAGE")
    print(f" • File: {image_path}")
    print("=" * 80)

    if not os.path.exists(image_path):
        print(f"❌ Error: File not found at {image_path}")
        return

    # 1. Load Image
    img = cv2.imread(image_path)
    h, w = img.shape[:2]
    print(f" • Image Resolution: {w}x{h} px")

    # 2. Run High-Precision Multi-Vehicle Scene Detector
    detector = MultiVehicleSceneDetector()
    
    # Run full OCR on the image
    print("\n🔍 Running Deep Character Recognition on Traffic Scene...")
    
    # We can also do high-resolution targeted crops for specific detected vehicles in the frame:
    # 1. Main Black Honda Sedan (foreground right):
    # Crop around [ymin: 600-850, xmin: 520-900]
    honda_plate_crop = img[int(h*0.65):int(h*0.82), int(w*0.52):int(w*0.88)]
    
    # 2. Left Motorcycle (rear plate):
    # Crop around [ymin: 580-780, xmin: 280-420]
    bike_plate_crop = img[int(h*0.55):int(h*0.78), int(w*0.28):int(w*0.42)]
    
    anpr = detector.anpr

    print("\n--- [Vehicle 1: Black Honda Sedan (Foreground Right)] ---")
    res_honda = anpr.extract_plate_text(honda_plate_crop)
    print(json.dumps(res_honda, indent=4))

    print("\n--- [Vehicle 2: Commuter Motorcycle (Left Shoulder)] ---")
    res_bike = anpr.extract_plate_text(bike_plate_crop)
    print(json.dumps(res_bike, indent=4))

    # Also run full automated scene scan
    annotated_path = "ai_pipeline/user_image_annotated.jpg"
    full_scene_res = detector.process_scene_image(img, save_annotated_path=annotated_path)
    print("\n--- [Full Scene Auto-Scan Output] ---")
    print(json.dumps(full_scene_res, indent=4))

    print("\n" + "=" * 80)
    print(f" ✅ Processing Complete! Annotated output saved to: {annotated_path}")
    print("=" * 80)

if __name__ == "__main__":
    img_p = r"C:/Users/Hp/.gemini/antigravity/brain/6c7fc8bb-f9d1-40fb-9579-bcf45fbac83b/.user_uploaded/media_1788284750068.png"
    test_uploaded_image(img_p)
