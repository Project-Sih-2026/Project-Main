const API_BASE = "http://127.0.0.1:8000/api/v1";
export const BACKEND_STATIC = "http://127.0.0.1:8000";

import {
  User, Camera, Detection, OCRCorrection,
  WatchlistItem, AlertItem, AnalyticsKPIs,
  VolumeTrendPoint, HotspotIntersection, VehicleJourney,
  SystemHealth, AuditLog, RetentionPolicy
} from "../types";

export const api = {
  // Auth & Profile
  getMe: async (): Promise<User> => {
    const res = await fetch(`${API_BASE}/auth/me`);
    return res.json();
  },
  switchRole: async (role: string): Promise<User> => {
    const res = await fetch(`${API_BASE}/auth/switch-role?role=${role}`, { method: "POST" });
    return res.json();
  },

  // Cameras
  getCameras: async (sector?: string, status?: string): Promise<Camera[]> => {
    const params = new URLSearchParams();
    if (sector && sector !== "All Sectors") params.append("sector", sector);
    if (status && status !== "all") params.append("status", status);
    const res = await fetch(`${API_BASE}/cameras?${params.toString()}`);
    return res.json();
  },
  getCameraById: async (id: string): Promise<Camera> => {
    const res = await fetch(`${API_BASE}/cameras/${id}`);
    return res.json();
  },
  getCameraTelemetry: async (id: string) => {
    const res = await fetch(`${API_BASE}/cameras/${id}/telemetry`);
    return res.json();
  },
  scanNetwork: async () => {
    const res = await fetch(`${API_BASE}/cameras/scan-network`, { method: "POST" });
    return res.json();
  },

  // Detections & Evidence
  getDetections: async (params?: { camera_id?: string; plate?: string; review_status?: string; limit?: number }): Promise<Detection[]> => {
    const query = new URLSearchParams();
    if (params?.camera_id && params.camera_id !== "all") query.append("camera_id", params.camera_id);
    if (params?.plate) query.append("plate", params.plate);
    if (params?.review_status && params.review_status !== "all") query.append("review_status", params.review_status);
    if (params?.limit) query.append("limit", params.limit.toString());
    const res = await fetch(`${API_BASE}/detections?${query.toString()}`);
    return res.json();
  },
  getDetectionById: async (id: string): Promise<Detection> => {
    const res = await fetch(`${API_BASE}/detections/${id}`);
    return res.json();
  },
  simulateDetection: async (cameraId: string, customPlate?: string): Promise<Detection> => {
    const params = new URLSearchParams({ camera_id: cameraId });
    if (customPlate) params.append("custom_plate", customPlate);
    const res = await fetch(`${API_BASE}/detections/simulate?${params.toString()}`, { method: "POST" });
    return res.json();
  },
  submitOCRCorrection: async (detectionId: string, payload: { corrected_plate: string; reason: string; notes?: string }): Promise<OCRCorrection> => {
    const res = await fetch(`${API_BASE}/detections/${detectionId}/correct`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Failed to submit correction");
    }
    return res.json();
  },
  getOCRRevisions: async (detectionId: string): Promise<OCRCorrection[]> => {
    const res = await fetch(`${API_BASE}/detections/${detectionId}/revisions`);
    return res.json();
  },

  // Vehicle History & GIS
  getVehicleHistory: async (plate: string): Promise<VehicleJourney> => {
    const res = await fetch(`${API_BASE}/vehicles/${encodeURIComponent(plate)}/history`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "No observations found");
    }
    return res.json();
  },

  // Search
  searchPlates: async (query: string): Promise<Detection[]> => {
    const res = await fetch(`${API_BASE}/search/plates?q=${encodeURIComponent(query)}`);
    return res.json();
  },
  advancedSearch: async (criteria: any): Promise<Detection[]> => {
    const res = await fetch(`${API_BASE}/search/advanced`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(criteria)
    });
    return res.json();
  },

  // Alerts & Watchlists
  getAlerts: async (status?: string, severity?: string): Promise<AlertItem[]> => {
    const params = new URLSearchParams();
    if (status && status !== "all") params.append("status", status);
    if (severity && severity !== "all") params.append("severity", severity);
    const res = await fetch(`${API_BASE}/alerts?${params.toString()}`);
    return res.json();
  },
  getAlertDetail: async (id: string): Promise<AlertItem> => {
    const res = await fetch(`${API_BASE}/alerts/${id}`);
    return res.json();
  },
  performAlertAction: async (alertId: string, payload: { action: string; assigned_to?: string; reason?: string; notes?: string }): Promise<AlertItem> => {
    const res = await fetch(`${API_BASE}/alerts/${alertId}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Failed to execute alert action");
    }
    return res.json();
  },
  getWatchlist: async (): Promise<WatchlistItem[]> => {
    const res = await fetch(`${API_BASE}/alerts/watchlist`);
    return res.json();
  },
  addWatchlist: async (item: Partial<WatchlistItem>): Promise<WatchlistItem> => {
    const res = await fetch(`${API_BASE}/alerts/watchlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item)
    });
    return res.json();
  },
  deactivateWatchlist: async (id: string) => {
    const res = await fetch(`${API_BASE}/alerts/watchlist/${id}`, { method: "DELETE" });
    return res.json();
  },

  // Analytics
  getKPIs: async (): Promise<AnalyticsKPIs> => {
    const res = await fetch(`${API_BASE}/analytics/kpis`);
    return res.json();
  },
  getVolumeTrends: async (): Promise<VolumeTrendPoint[]> => {
    const res = await fetch(`${API_BASE}/analytics/volume-trends`);
    return res.json();
  },
  getHotspots: async (): Promise<HotspotIntersection[]> => {
    const res = await fetch(`${API_BASE}/analytics/hotspots`);
    return res.json();
  },

  // Health
  getSystemHealth: async (): Promise<SystemHealth> => {
    const res = await fetch(`${API_BASE}/health/system`);
    return res.json();
  },

  // Audit & Governance
  getAuditLogs: async (actionType?: string): Promise<AuditLog[]> => {
    const params = new URLSearchParams();
    if (actionType && actionType !== "all") params.append("action_type", actionType);
    const res = await fetch(`${API_BASE}/audit/logs?${params.toString()}`);
    return res.json();
  },
  getRetentionPolicies: async (): Promise<RetentionPolicy[]> => {
    const res = await fetch(`${API_BASE}/audit/retention`);
    return res.json();
  },
  triggerPurge: async (policyId: string) => {
    const res = await fetch(`${API_BASE}/audit/retention/purge?policy_id=${policyId}`, { method: "POST" });
    return res.json();
  },
  getExportDetectionsUrl: () => `${API_BASE}/export/detections/csv`,
  getExportAlertsUrl: () => `${API_BASE}/export/alerts/csv`
};
