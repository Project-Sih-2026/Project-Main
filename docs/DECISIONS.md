# Architectural Decision Records (DECISIONS.md)

### ADR 001: Strict Separation of /frontend and /backend Folders
- **Status:** Approved
- **Decision:** Establish independent frontend (React + TypeScript + Vite + Tailwind CSS) and backend (FastAPI + SQLAlchemy + Pydantic v2) directory trees.

### ADR 002: Dual-Plate Storage & Immutable OCR Correction Audit Log
- **Status:** Approved
- **Decision:** Detections always preserve immutable raw_plate_text alongside normalized_plate_text. Manual corrections are saved in ocr_corrections with user_id, timestamp, and mandatory reason enum without overwriting original raw OCR.

### ADR 003: Epistemic Restraint & Discrete Camera Observation Sequence
- **Status:** Approved
- **Decision:** Maps show discrete numbered camera stops with clear disclaimers, never continuous GPS tracking.

### ADR 004: Civic Operations Dark Palette & Layout
- **Status:** Approved
- **Decision:** Use deep navy #081522 background, slate panels #0E2233/#132C40, cyan #28B8D8 accents, teal #56D6B0 healthy, amber #F3B63F review-required, coral red #E86A67 alerts matching the tactical UI layout.

### ADR 005: Out-of-Scope Compliance Guardrails
- **Status:** Approved
- **Decision:** Strictly omit facial recognition (replace UI button with Plate OCR / Evidence Review), driver identification, DMV lookups, and predictive crime scoring.
