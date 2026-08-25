# Requirements Traceability Matrix (TRACEABILITY.md)

| PRD Req ID | Requirement Summary | Planned Frontend Screen | Planned API Endpoint(s) | Database Tables | Backend Service |
|---|---|---|---|---|---|
| REQ-CAM-01 | Camera Registration | Cameras View & Operations Grid | POST /api/v1/cameras, GET /api/v1/cameras | cameras | camera_service.py |
| REQ-CAM-02 | Real-time Camera Telemetry | Node Telemetry Side Panel | GET /api/v1/cameras/{id}/telemetry, WS /ws/telemetry | camera_telemetry | telemetry_service.py |
| REQ-CAM-03 | Camera Status Categorization | Tactical Camera Bar & Filter | GET /api/v1/cameras?sector=... | cameras | camera_service.py |
| REQ-INGEST-01 | Media Ingestion (Video/Image) | Ingestion Modal & Feed Streamer | POST /api/v1/ingest/upload, POST /api/v1/ingest/stream | ingestion_jobs | ingest_service.py |
| REQ-INGEST-02 | Ingestion Status Tracking | Ingest Job Queue & Health Drawer | GET /api/v1/ingest/jobs | ingestion_jobs | ingest_service.py |
| REQ-AI-01 | Vehicle Bounding Box Detection | Live CCTV Feed AI Overlay | (Internal Ingestion Pipeline) | detections | detection_engine.py |
| REQ-AI-02 | Plate OCR & Confidence | Tactical Evidence Drawer | GET /api/v1/detections/{id} | detections | ocr_engine.py |
| REQ-AI-03 | Plate Text Normalization | Search Results & Vehicle Record | POST /api/v1/detections/normalize | (Utility) | normalization.py |
| REQ-AI-04 | Dual Storage (Raw vs Normalized) | Evidence Detail & Audit Comparison | GET /api/v1/detections/{id} | detections | detection_service.py |
| REQ-DET-01 | Detection Entity Model | Detection Feeds & Activity Log | GET /api/v1/detections | detections | detection_service.py |
| REQ-DET-02 | Evidence Review Drawer | Full Evidence Inspection Modal | GET /api/v1/detections/{id}/evidence | detections, media_files | evidence_service.py |
| REQ-ROUTE-01 | Cross-Camera History Query | Vehicle History Table & Timeline | GET /api/v1/vehicles/{plate}/history | detections, cameras | route_service.py |
| REQ-ROUTE-02 | GIS Observation Sequence Map | Central GIS Map / Mini-Map | GET /api/v1/vehicles/{plate}/route | detections, cameras | route_service.py |
| REQ-ROUTE-03 | Non-continuous Tracking Disclaimers | GIS Map Overlays & Labels | UI Disclaimer Component | N/A | GISRouteMap.tsx |
| REQ-SRCH-01 | Global & Targeted Plate Search | Top Search Bar & Search View | GET /api/v1/search/plates | detections | search_service.py |
| REQ-SRCH-02 | Search Multi-Filter Panel | Advanced Search Filter Drawer | POST /api/v1/search/advanced | detections, cameras | search_service.py |
| REQ-SRCH-03 | Sensitive Search Audit Trail | Audit History Page (Admin only) | GET /api/v1/audit/searches | audit_logs | audit_service.py |
| REQ-OCR-REV-01 | OCR Correction Interface | Evidence Review -> OCR Edit Dialog | UI Modal | N/A | EvidenceReviewModal.tsx |
| REQ-OCR-REV-02 | Operator Correction Workflow | Edit Plate Dialog with Reason | POST /api/v1/detections/{id}/correct | ocr_corrections, detections | correction_service.py |
| REQ-OCR-REV-03 | Immutable Revision History | OCR Revision Log in Modal | GET /api/v1/detections/{id}/revisions | ocr_corrections | correction_service.py |
| REQ-ALERT-01 | Watchlist Management | Alerts View -> Watchlist Registry | GET/POST/DELETE /api/v1/watchlists | watchlists | watchlist_service.py |
| REQ-ALERT-02 | Possible Match Alert Generation | Live Alert Badge & Notifications | GET /api/v1/alerts, WS /ws/alerts | alerts, detections | alert_engine.py |
| REQ-ALERT-03 | Alert Triage State Machine | Alerts Queue Panel & Action Toolbar | PATCH /api/v1/alerts/{id}/state | alerts, alert_actions | alert_service.py |
| REQ-ALERT-04 | Mandatory Dismissal Reason | Dismiss Alert Dialog with Reason | POST /api/v1/alerts/{id}/dismiss | alerts, alert_actions | alert_service.py |
| REQ-ANALYTICS-01 | Civic Operations KPI Cards | Dashboard Header Cards | GET /api/v1/analytics/kpis | detections, cameras, alerts | analytics_service.py |
| REQ-ANALYTICS-02 | Volume Trends & Hotspots | Analytics Charts (Area/Bar) | GET /api/v1/analytics/volume-trends | detections | analytics_service.py |
| REQ-ANALYTICS-03 | Distinct Metrics (Events vs Unique) | KPI Summary & Chart Tooltips | GET /api/v1/analytics/kpis | detections | analytics_service.py |
| REQ-HEALTH-01 | Persistent Data-Health Strip | Bottom System Status Strip | GET /api/v1/health/system, WS /ws/health | DB & Queue telemetry | health_service.py |
| REQ-HEALTH-02 | Node Telemetry Inspection Pane | Right Telemetry Inspector Panel | GET /api/v1/cameras/{id}/telemetry | cameras, camera_telemetry | telemetry_service.py |
| REQ-SEC-01 | JWT Authentication & RBAC | Login Screen & Role Switcher | POST /api/v1/auth/login, GET /api/v1/auth/me | users | auth_service.py |
| REQ-SEC-02 | Sensitive Action Audit Logging | Audit Logs View & Export Manager | GET /api/v1/audit/logs | audit_logs | audit_service.py |
| REQ-SEC-03 | Data Retention & Purge Policy | Settings -> Data Lifecycle Tab | GET/POST /api/v1/admin/retention | retention_policies, audit_logs | retention_service.py |
| REQ-SEC-04 | Policy-Aware Watermarked Export | Export Modal (CSV/JSON/PDF) | POST /api/v1/export/detections | audit_logs | export_service.py |
