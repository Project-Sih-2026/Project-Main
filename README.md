# City-Wide AI Vehicle Tracking & Traffic Analytics Platform

> Built strictly to the specifications of [`/docs/PRD.md`](./docs/PRD.md).

An operational platform for municipal traffic engineers and law enforcement dispatchers, providing cross-camera vehicle history observation, ALPR/OCR confidence assessment with dual-storage immutability, actionable watchlist alert triage, aggregate volume trends, and full auditability.

---

## 🏛️ Repository Structure

```
├── backend/                  # FastAPI Python backend service
│   ├── app/
│   │   ├── api/v1/          # Endpoints: auth, cameras, detections, search, alerts, analytics, health, audit, export
│   │   ├── core/            # Security (JWT, RBAC), Config, Database session
│   │   ├── models/          # SQLAlchemy ORM models (Detections, OCRCorrections, Alerts, Watchlist, etc.)
│   │   ├── schemas/         # Pydantic v2 validation models
│   │   └── services/        # Normalization, Alert engine, AI pipeline, Audit logging
│   ├── tests/               # Pytest automated test suite
│   ├── static/              # Synthetic evidence frames and crops
│   ├── requirements.txt     # Python dependencies
│   └── seed_data.py         # Database seeder with realistic civic observations
├── frontend/                 # React 19 + TypeScript + Vite + Tailwind CSS SPA
│   ├── src/
│   │   ├── components/      # UI Layout, Cameras, GIS Leaflet map, Detections, Alerts, Analytics
│   │   ├── pages/           # Operations, Cameras, Vehicle History, Alerts, Analytics, Audit/Health
│   │   ├── services/        # Typed API client
│   │   └── types/           # TypeScript domain definitions
│   └── package.json         # Frontend dependencies and scripts
└── docs/                     # Authoritative Specifications
    ├── PRD.md               # Product Requirements Document (Source of Truth)
    ├── TRACEABILITY.md      # Requirements traceability matrix
    └── DECISIONS.md         # Architectural Decision Records (ADRs)
```

---

## 🚀 Quick Start Guide

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python seed_data.py
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
- API & Interactive Docs: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:5173`

### 3. Run Automated Tests
```bash
cd backend
python -m pytest -v tests/test_backend.py
```

---

## 🛡️ Core Product Guarantees & Privacy Restraints

- **Dual-Storage Plate OCR**: Machine-generated `raw_plate_text` is preserved immutably alongside `normalized_plate_text`.
- **Immutable Human Revision History**: Human edits require a mandatory reason enum (`MISREAD_CHARACTER`, `PARTIAL_OBSCURATION`, etc.) and log reviewer details.
- **Epistemic Restraint on GIS**: Trajectory maps strictly render discrete camera observation stops with timestamps, displaying required disclaimers (*"Discrete camera observation sequence. Does not represent continuous GPS tracking."*).
- **Mandatory Alert Dismissal Logging**: Watchlist alert dismissals mandate structured operational justifications (`FALSE_POSITIVE_OCR`, `UNMATCHED_CHARACTER`, etc.) and remain auditable.
- **Strict Privacy Scope**: No facial recognition, driver identification, DMV owner lookups, or predictive crime scoring.
