export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: 'ROLE_ANALYST' | 'ROLE_OPERATOR' | 'ROLE_ADMIN';
  is_active: boolean;
  created_at: string;
}

export interface Camera {
  id: string;
  name: string;
  designation: string;
  district: string;
  sector: string;
  location_address: string;
  latitude: number;
  longitude: number;
  direction: string;
  stream_url?: string;
  resolution: string;
  status: 'nominal' | 'scanning' | 'standby' | 'degraded' | 'offline';
  throughput_mbps: number;
  uptime_str: string;
  ping_ms: number;
  last_heartbeat: string;
}

export interface Detection {
  id: string;
  camera_id: string;
  timestamp: string;
  raw_plate_text: string;
  normalized_plate_text: string;
  confidence_score: number;
  ocr_confidence: number;
  model_version: string;
  vehicle_type: string;
  owner_name?: string;
  bounding_box?: string;
  plate_bounding_box?: string;
  evidence_image_uri: string;
  plate_crop_uri?: string;
  processing_status: string;
  is_corrected: boolean;
  corrected_plate_text?: string;
  review_status: string;
  has_alert: boolean;
  alert_type?: string;
}

export interface OCRCorrection {
  id: string;
  detection_id: string;
  original_ocr: string;
  corrected_plate: string;
  reviewer_id: string;
  reviewer_username: string;
  reason: string;
  notes?: string;
  revision_number: number;
  created_at: string;
}

export interface WatchlistItem {
  id: string;
  normalized_plate: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  case_number?: string;
  created_by: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AlertItem {
  id: string;
  detection_id: string;
  camera_id: string;
  watchlist_id?: string;
  plate_matched: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'NEW' | 'ACKNOWLEDGED' | 'ASSIGNED' | 'ESCALATED' | 'RESOLVED' | 'DISMISSED';
  assigned_to?: string;
  dismissal_reason?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
  detection?: Detection;
  camera?: Camera;
  actions?: AlertAction[];
}

export interface AlertAction {
  id: string;
  alert_id: string;
  user_id: string;
  username: string;
  action: string;
  from_status: string;
  to_status: string;
  notes?: string;
  reason?: string;
  created_at: string;
}

export interface AnalyticsKPIs {
  total_detection_events: number;
  unique_normalized_plates: number;
  active_cameras_count: number;
  review_required_count: number;
  active_alerts_count: number;
  system_health_status: string;
}

export interface VolumeTrendPoint {
  timestamp_hour: string;
  detection_count: number;
  unique_plates: number;
}

export interface HotspotIntersection {
  camera_id: string;
  designation: string;
  location_address: string;
  detection_count: number;
  congestion_index: number;
}

export interface VehicleHistoryStop {
  stop_number: number;
  camera_id: string;
  camera_designation: string;
  location_address: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  raw_plate_text: string;
  confidence_score: number;
  evidence_image_uri: string;
  status: string;
  distance_from_prev_km?: number;
  duration_mins_from_prev?: number;
  estimated_speed_kmh?: number;
}

export interface VehicleJourney {
  plate: string;
  total_observations: number;
  first_seen: string;
  last_seen: string;
  total_distance_km?: number;
  total_duration_mins?: number;
  average_speed_kmh?: number;
  observation_stops: VehicleHistoryStop[];
  disclaimer: string;
}

export interface SystemHealth {
  connectivity_status: string;
  network_ping_ms: number;
  active_feed_count: number;
  worker_queue_backlog: number;
  ocr_failure_rate_pct: number;
  delayed_sources_count: number;
  last_sync_timestamp: string;
  db_status: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  username: string;
  action_type: string;
  target_type?: string;
  target_id?: string;
  details_json?: string;
  ip_address: string;
  created_at: string;
}

export interface RetentionPolicy {
  id: string;
  name: string;
  data_type: string;
  retention_days: number;
  auto_purge_enabled: boolean;
  last_purged_at?: string;
}
