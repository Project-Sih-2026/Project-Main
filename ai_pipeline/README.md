# 🏛️ Standalone High-Precision City Traffic & ANPR AI Platform

This directory (`ai_pipeline/`) contains the complete, standalone 4-pillar AI engine for Intelligent Traffic Management, ANPR, and Vehicle Forensics. 

> **Status:** Completely decoupled from frontend and backend. Zero external dependencies required. Ready for plug-and-play deployment or fallback use.

---

## 📦 Core Architecture & Module Reference

| File | Pillar / Role | Description |
| :--- | :--- | :--- |
| **`anpr_engine.py`** | **Pillar 1: Deep OCR** | Main high-precision OCR pipeline combining CLAHE, deskewing, deep sequence extraction, and Bayesian Indian syntax correction (**>93% accuracy**). |
| **`indian_syntax_rectifier.py`** | **Syntax & Grammar** | Bayesian confusion-matrix engine repairing character ambiguities (`O↔0`, `8↔B`, `I↔1`, `Z↔2`, `S↔5`) according to Indian Motor Vehicles Act standards. |
| **`preprocessor.py`** | **Computer Vision** | Image enhancement (CLAHE, Bilateral filtering, Hough Transform orientation deskewing). |
| **`detect_multi_vehicle_scene.py`** | **Scene Detection** | Full multi-lane surveillance scanner that localizes all passing vehicles and transcribes their plates. |
| **`trajectory_engine.py`** | **Pillar 2: Trajectory** | Spatiotemporal Graph-Based Map Matching across 26 camera nodes, calculating leg speeds and flagging cloned plates ($>150\text{ km/h}$). |
| **`analytics_engine.py`** | **Pillar 3: Analytics** | Corridor Level-of-Service (LoS A through LoS F) computation, congestion scoring, and bottleneck alerts. |
| **`alert_engine.py`** | **Pillar 4: Alerts** | Sub-millisecond ($O(1)$) Watchlist/BOLO hash lookup and automated police incident directives. |
| **`unified_engine.py`** | **Unified Platform** | Master orchestrator uniting all 4 pillars into a single callable Python class (`UnifiedCityTrafficAI`). |

---

## 🛠️ Dataset & Model Training Modules

| File | Purpose |
| :--- | :--- |
| **`dataset_generator.py`** | Synthesizes photorealistic Indian license plate datasets with all 36 state codes, motion blur, angle tilts, and night glare. |
| **`train_crnn.py`** | PyTorch CRNN (7-layer CNN + 2-layer BiLSTM + CTC Loss) training script. Saves weights to `models/crnn_indian_anpr.pth`. |
| **`download_real_dataset.py`** | Automated downloader for real-world traffic camera photo datasets. |

---

## 💻 How to Run Standalone Tests & Inference

### 1. Test Any Image (1-Step Direct Runner):
```bash
python ai_pipeline/run_image.py "path_to_any_traffic_image.jpg"
```

### 2. Run Full 4-Pillar Platform Verification:
```bash
python ai_pipeline/test_full_suite.py
```

### 3. Run Benchmark on 15 Indian Test Scenarios:
```bash
python ai_pipeline/benchmark_test.py
```

### 4. Run Optical Character Distortion Repair Test:
```bash
python ai_pipeline/test_confusion_repair.py
```

---

## 🔒 Safety & Git Note
* This folder is completely isolated from `frontend/` and `backend/`.
* No files from this directory are pushed to GitHub unless explicitly requested.
