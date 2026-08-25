# Product Requirements Document (PRD)
## City-Wide AI Vehicle Tracking & Traffic Analytics Platform

**Document Version:** 1.0.0
**Status:** Approved / Authoritative Baseline
**Classification:** Sensitive Civic Operations Platform

---

### 1. Executive Summary & Core Principle

The City-Wide AI Vehicle Tracking & Traffic Analytics Platform is a secure civic intelligence system to monitor traffic flow, review license plate OCR detections, track observed cross-camera journeys, and act on configurable vehicle watchlist / blacklist alerts.

#### Core Operating Principle: Probabilistic AI with Human Verification
> The platform assists authorized operators and must NEVER present AI inferences as unquestionable facts.
> Cautious, objective language is mandatory across all user interfaces, reports, and audit logs:
> - Use: Possible watchlist match, Review required, Low confidence, Unverified reading, Camera observation sequence.
> - Prohibit: Any language implying guilt, legal certainty, registered vehicle ownership, driver identity, or automated punitive enforcement.

### 2. User Personas & RBAC
1. **Viewer / Traffic Analyst (ROLE_ANALYST)**: Aggregated analytics, traffic trends, no raw plate search.
2. **Operations Dispatcher / Reviewer (ROLE_OPERATOR)**: Live feeds, search, triage alerts, OCR corrections.
3. **Operations Supervisor / Administrator (ROLE_ADMIN)**: Full access, camera config, watchlist management, audit log review, retention policies.

### 3. Functional Requirements & Scope
- **REQ-CAM**: Camera & source registration with telemetry (throughput, status, ping, uptime, coordinates).
- **REQ-INGEST**: Image & video ingestion pipeline with job status tracking.
- **REQ-AI**: Vehicle bounding box detection and ALPR plate OCR pipeline with raw & normalized text and confidence.
- **REQ-DET**: Detection records storing source, camera, timestamp, coordinates, raw OCR, normalized plate, confidence, model version, evidence image.
- **REQ-ROUTE**: Cross-camera vehicle history & GIS observation timeline (explicitly ordered camera stops, not continuous GPS).
- **REQ-SRCH**: Vehicle search by exact/normalized plate with filters (time, camera, sector, confidence, alert status).
- **REQ-OCR-REV**: OCR correction review interface with immutable audit history and mandatory reason logging.
- **REQ-ALERT**: Blacklist/watchlist matching, reviewable alert queue with triage state machine (NEW, ACKNOWLEDGED, ASSIGNED, ESCALATED, RESOLVED, DISMISSED).
- **REQ-ANALYTICS**: Traffic analytics for detection events vs unique plates, busy intersections, volume trends.
- **REQ-HEALTH**: Persistent data-health strip for connectivity, backlog, failure rate, and node telemetry.
- **REQ-SEC**: RBAC, audit logging for sensitive searches/corrections/exports, retention policies, policy-aware export.

### 4. Explicitly Out of Scope
- Facial recognition, driver identification, vehicle-owner lookup, predictive crime scoring, automated dispatch/fines, continuous GPS tracking, silent biometric re-ID, predictive congestion forecasting in MVP.

### 5. Technology Stack
- Backend: Python FastAPI, SQLAlchemy, SQLite/PostgreSQL, OpenCV, WebSockets.
- Frontend: React, TypeScript, Vite, Tailwind CSS, Lucide Icons, Leaflet GIS Map, Recharts.
- Directory structure: /frontend and /backend separated as independent modules.

### 6. Frontend Theme & Design
- Deep navy background (#081522), Navy-slate panels (#0E2233, #132C40), Cyan accents (#28B8D8), Teal/Green healthy (#56D6B0, #42C98A), Amber review-required (#F3B63F), Coral red alerts (#E86A67).
