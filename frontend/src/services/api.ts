const API_BASE = "/api/v1";
export const BACKEND_STATIC = "";

import {
  User, Camera, Detection, OCRCorrection,
  WatchlistItem, AlertItem, AnalyticsKPIs,
  VolumeTrendPoint, HotspotIntersection, VehicleJourney,
  SystemHealth, AuditLog, RetentionPolicy
} from "../types";

async function parseError(res: Response, defaultMsg: string): Promise<string> {
  try {
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      return json.detail || json.message || text || defaultMsg;
    } catch {
      return text || defaultMsg;
    }
  } catch {
    return defaultMsg;
  }
}

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

  // Ingest & Detections
  getDetections: async (
    options?: { limit?: number; camera_id?: string; plate?: string; review_status?: string } | number,
    cameraId?: string,
    plateQuery?: string
  ): Promise<Detection[]> => {
    const params = new URLSearchParams();
    if (typeof options === "number") {
      params.append("limit", String(options));
      if (cameraId) params.append("camera_id", cameraId);
      if (plateQuery) params.append("plate", plateQuery);
    } else if (options) {
      if (options.limit) params.append("limit", String(options.limit));
      if (options.camera_id && options.camera_id !== "all") params.append("camera_id", options.camera_id);
      if (options.plate) params.append("plate", options.plate);
      if (options.review_status && options.review_status !== "all") params.append("review_status", options.review_status);
    }
    const res = await fetch(`${API_BASE}/detections?${params.toString()}`);
    return res.json();
  },
  getRecentDetections: async (limit: number = 6): Promise<Detection[]> => {
    const res = await fetch(`${API_BASE}/detections?limit=${limit}`);
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
  uploadFrameAndGetRoute: async (
    cameraIdOrFile: string | File,
    fileOrCameraId: File | string,
    customPlate?: string,
    ownerName?: string,
    timestamp?: string
  ): Promise<{
    detection: Detection;
    journey: VehicleJourney | null;
    detections?: Array<{ detection: Detection; journey: VehicleJourney | null }>;
    count?: number;
  }> => {
    const file = cameraIdOrFile instanceof File ? cameraIdOrFile : (fileOrCameraId as File);
    const cameraId = typeof cameraIdOrFile === "string" ? cameraIdOrFile : (fileOrCameraId as string);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("camera_id", cameraId);
    if (customPlate) formData.append("custom_plate", customPlate);
    if (ownerName) formData.append("owner_name", ownerName);
    if (timestamp) formData.append("timestamp", timestamp);

    const params = new URLSearchParams({ camera_id: cameraId });
    if (customPlate) params.append("custom_plate", customPlate);
    if (ownerName) params.append("owner_name", ownerName);
    if (timestamp) params.append("timestamp", timestamp);

    const res = await fetch(`${API_BASE}/detections/upload-route?${params.toString()}`, {
      method: "POST",
      body: formData
    });
    if (!res.ok) {
      throw new Error(await parseError(res, "Failed to process image upload"));
    }
    return res.json();
  },
  uploadFrameWithRoute: async (
    file: File,
    cameraId: string,
    customPlate?: string,
    ownerName?: string,
    timestamp?: string
  ) => {
    return api.uploadFrameAndGetRoute(cameraId, file, customPlate, ownerName, timestamp);
  },
  submitOCRCorrection: async (detectionId: string, payload: { corrected_plate: string; reason: string; notes?: string }): Promise<OCRCorrection> => {
    const res = await fetch(`${API_BASE}/detections/${detectionId}/correct`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      throw new Error(await parseError(res, "Failed to submit correction"));
    }
    return res.json();
  },
  getOCRRevisions: async (detectionId: string): Promise<OCRCorrection[]> => {
    const res = await fetch(`${API_BASE}/detections/${detectionId}/revisions`);
    return res.json();
  },
  deleteDetection: async (detectionId: string): Promise<{ status: string; message: string }> => {
    const res = await fetch(`${API_BASE}/detections/${detectionId}`, { method: "DELETE" });
    if (!res.ok) {
      throw new Error(await parseError(res, "Failed to delete detection"));
    }
    return res.json();
  },
  purgeAllDetections: async (): Promise<{ status: string; message: string }> => {
    const res = await fetch(`${API_BASE}/detections/purge-all`, { method: "DELETE" });
    if (!res.ok) {
      throw new Error(await parseError(res, "Failed to purge detections"));
    }
    return res.json();
  },
  updateDetection: async (
    detectionId: string,
    payload: {
      owner_name?: string;
      vehicle_type?: string;
      normalized_plate_text?: string;
      camera_id?: string;
      timestamp?: string;
    }
  ): Promise<Detection> => {
    const res = await fetch(`${API_BASE}/detections/${detectionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      throw new Error(await parseError(res, "Failed to update detection"));
    }
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
