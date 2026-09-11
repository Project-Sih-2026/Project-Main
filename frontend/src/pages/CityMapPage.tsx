import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../state/appContext';
import { Icon } from '../components/Icons';
import { Badge, Btn, Card, Kicker, cx } from '../components/ui';
import { CAMERAS, HOTSPOTS, ROADS, VEHICLES, camById, timeAgo, type Vehicle, type Camera, type Road } from '../data/mock';
import { getCamera30MinDetections, type ANPRDetection } from '../data/anprGenerator';
import { getCameraDistance, getNearestCameras, formatDistance, type CameraDistanceTarget } from '../data/cameraDistances';
import { CameraFeed } from '../components/CameraFeed';
import { calculateInterCameraSpeed, type InterCameraSpeedResult } from '../data/speedTrapEngine';

const CONGESTION: Record<string, number> = { r1: 3, r2: 2, r3: 4, r4: 2, r5: 1, r6: 3, r7: 2, r8: 2, r9: 1, r10: 2, r11: 1, r12: 2 };

export interface HotspotCorridor {
  id: string;
  name: string;
  fromCam: string;
  toCam: string;
  severity: 'critical' | 'high' | 'medium';
  congestionIndex: number;
  delayMins: number;
  avgSpeed: number;
  vehiclesPerHour: number;
  bottleneckReason: string;
}

const HOTSPOT_CORRIDORS: HotspotCorridor[] = [];

// Defined Sector Extents for Instant Sector Zoom
interface SectorPreset {
  id: string;
  name: string;
  district: string;
  center: [number, number];
  zoom: number;
  camCount: number;
  bounds?: [[number, number], [number, number]];
}

const SECTORS: SectorPreset[] = [
  {
    id: 'all',
    name: 'All East Delhi Sectors',
    district: 'East Delhi Surveillance Grid',
    center: [28.6450, 77.2950],
    zoom: 12.8,
    camCount: 20,
    bounds: [[28.590, 77.250], [28.690, 77.340]]
  },
  {
    id: 'mayur-vihar',
    name: 'Mayur Vihar & Akshardham (South)',
    district: 'Mayur Vihar',
    center: [28.6100, 77.2950],
    zoom: 14.0,
    camCount: 4,
  },
  {
    id: 'vikas-marg',
    name: 'Vikas Marg (Laxmi Nagar & Preet Vihar)',
    district: 'Vikas Marg Corridor',
    center: [28.6360, 77.2860],
    zoom: 14.5,
    camCount: 3,
  },
  {
    id: 'anand-vihar',
    name: 'Anand Vihar, Karkardooma & Ghazipur',
    district: 'East Border Corridor',
    center: [28.6400, 77.3180],
    zoom: 14.0,
    camCount: 4,
  },
  {
    id: 'shahdara-dilshad',
    name: 'Shahdara, Vivek Vihar & Dilshad Garden',
    district: 'North East Sector',
    center: [28.6730, 77.3100],
    zoom: 14.0,
    camCount: 5,
  },
  {
    id: 'yamuna-pushta',
    name: 'Krishna Nagar, Gandhi Nagar & Pushta',
    district: 'Central & Pushta',
    center: [28.6620, 77.2680],
    zoom: 14.5,
    camCount: 4,
  },
];

// Timeline 30-Minute Blocks
interface TimeSliceDef {
  id: string;
  label: string;
  timeRange: string;
  startH: number;
  startM: number;
  endH: number;
  endM: number;
}

const TIMELINE_SLICES_DEF: TimeSliceDef[] = [
  { id: 'all', label: 'All Day (24h)', timeRange: '00:00 – 23:59', startH: 0, startM: 0, endH: 24, endM: 0 },
  { id: 't1', label: '07:00 – 07:30', timeRange: '07:00 – 07:30', startH: 7, startM: 0, endH: 7, endM: 30 },
  { id: 't2', label: '07:30 – 08:00', timeRange: '07:30 – 08:00', startH: 7, startM: 30, endH: 8, endM: 0 },
  { id: 't3', label: '08:00 – 08:30 (Peak)', timeRange: '08:00 – 08:30', startH: 8, startM: 0, endH: 8, endM: 30 },
  { id: 't4', label: '08:30 – 09:00 (Peak)', timeRange: '08:30 – 09:00', startH: 8, startM: 30, endH: 9, endM: 0 },
  { id: 't5', label: '09:00 – 09:30', timeRange: '09:00 – 09:30', startH: 9, startM: 0, endH: 9, endM: 30 },
  { id: 'recent', label: 'Past 20-30 mins', timeRange: 'Live Surveillance Feed', startH: 8, startM: 40, endH: 9, endM: 30 },
];

export function CityMapPage() {
  const app = useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const camerasLayerRef = useRef<L.LayerGroup | null>(null);
  const alertsLayerRef = useRef<L.LayerGroup | null>(null);
  const hotspotsLayerRef = useRef<L.LayerGroup | null>(null);
  const corridorsLayerRef = useRef<L.LayerGroup | null>(null);
  const interCameraDistLayerRef = useRef<L.LayerGroup | null>(null);
  const journeyLayerRef = useRef<L.LayerGroup | null>(null);
  const altCorridorLayerRef = useRef<L.LayerGroup | null>(null);
  const clickMarkerRef = useRef<L.Marker | null>(null);

  const [layers, setLayers] = useState({
    cameras: true,
    corridors: true,
    distances: true,
    journey: true,
    altRoutes: true,
    alerts: true,
    congestion: true,
  });

  const [mapReady, setMapReady] = useState(false);
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedTimeSlice, setSelectedTimeSlice] = useState<string>('all');
  const [stateFilter, setStateFilter] = useState<'all' | 'DL' | 'HR' | 'UP'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [camSearchQuery, setCamSearchQuery] = useState('');
  const [camStatusFilter, setCamStatusFilter] = useState<'all' | 'flagged' | 'watchlist' | 'clear'>('all');
  const [inspectedLoc, setInspectedLoc] = useState<{
    lat: number;
    lng: number;
    nearestCam?: string;
    distanceMeters?: number;
    time: string;
  } | null>(null);

  const [selCamId, setSelCamId] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    app.target.mapVehicle || app.target.vehicleId || 'v1'
  );
  const [dynamicVehicles, setDynamicVehicles] = useState<Record<string, Vehicle>>({});

  // Inter-Camera Section Speed Trap Analyzer State
  const [speedSourceCam, setSpeedSourceCam] = useState<string>('c2'); // CAM-KN-02
  const [speedSourceTime, setSpeedSourceTime] = useState<string>('08:45');
  const [speedTargetCam, setSpeedTargetCam] = useState<string>('c18'); // CAM-GN-08
  const [speedTargetTime, setSpeedTargetTime] = useState<string>('08:47');
  const [speedLimit, setSpeedLimit] = useState<number>(50);
  const [speedResult, setSpeedResult] = useState<InterCameraSpeedResult | null>(null);

  useEffect(() => {
    const res = calculateInterCameraSpeed(
      speedSourceCam,
      speedSourceTime,
      speedTargetCam,
      speedTargetTime,
      'DL-01-AB-1234',
      speedLimit
    );
    setSpeedResult(res);
  }, [speedSourceCam, speedSourceTime, speedTargetCam, speedTargetTime, speedLimit]);

  const toggle = (k: keyof typeof layers) => setLayers((l) => ({ ...l, [k]: !l[k] }));

  // Computed timeline slices with actual database vehicle observations
  const timelineSlices = useMemo(() => {
    return TIMELINE_SLICES_DEF.map((ts) => {
      const count = app.vehicles.filter((v) => {
        if (ts.id === 'all') return true;
        if (ts.id === 'recent') return v.lastSeen.includes('min') || v.lastSeen.includes('just');
        return v.journey.some((evt) => {
          const [h, m] = evt.t.split(':').map((x) => parseInt(x, 10));
          const totalMins = h * 60 + m;
          const startMins = ts.startH * 60 + ts.startM;
          const endMins = ts.endH * 60 + ts.endM;
          return totalMins >= startMins && totalMins <= endMins;
        });
      }).length;
      return {
        ...ts,
        vehCount: count
      };
    });
  }, [app.vehicles]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [28.6450, 77.2950],
      zoom: 13,
      minZoom: 10,
      maxZoom: 19,
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true
    });

    // OpenStreetMap High-Resolution Colored Basemap (100% Free, No Watermark, No API Key)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      minZoom: 11,
      keepBuffer: 8,
      updateWhenIdle: false,
      updateWhenZooming: false,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    camerasLayerRef.current = L.layerGroup().addTo(map);
    interCameraDistLayerRef.current = L.layerGroup().addTo(map);
    corridorsLayerRef.current = L.layerGroup().addTo(map);
    alertsLayerRef.current = L.layerGroup().addTo(map);
    hotspotsLayerRef.current = L.layerGroup().addTo(map);
    altCorridorLayerRef.current = L.layerGroup().addTo(map);
    journeyLayerRef.current = L.layerGroup().addTo(map);

    // Fit Krishna Nagar & Gandhi Nagar grid view
    map.fitBounds([[28.648, 77.255], [28.672, 77.292]], { padding: [30, 30] });

    // Handle map click anywhere for instant coordinate inspection
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      let nearest: Camera | null = null;
      let minDist = Infinity;
      CAMERAS.forEach((c) => {
        const d = Math.hypot(c.lat - lat, c.lng - lng) * 111000;
        if (d < minDist) {
          minDist = d;
          nearest = c;
        }
      });

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setInspectedLoc({
        lat,
        lng,
        nearestCam: nearest ? `${(nearest as Camera).name} (${(nearest as Camera).code})` : undefined,
        distanceMeters: Math.round(minDist),
        time: timeStr
      });

      if (clickMarkerRef.current) {
        map.removeLayer(clickMarkerRef.current);
      }

      const clickIcon = L.divIcon({
        className: 'custom-city-click-pin',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center;">
            <div style="width: 14px; height: 14px; border-radius: 50%; background: #E86A67; border: 2.5px solid #FFFFFF; box-shadow: 0 0 10px rgba(232,106,103,0.9);"></div>
            <div style="width: 2px; height: 10px; background: #E86A67;"></div>
          </div>
        `,
        iconSize: [20, 24],
        iconAnchor: [10, 24]
      });

      const marker = L.marker([lat, lng], { icon: clickIcon }).addTo(map);
      marker.bindPopup(`
        <div style="padding: 4px; font-family: sans-serif; min-width: 200px;">
          <div style="font-weight: 800; color: #1E293B; font-size: 12px; margin-bottom: 3px; display: flex; align-items: center; justify-content: space-between;">
            <span>📍 Inspected Coordinate</span>
            <span style="font-size: 10px; color: #64748B;">${timeStr}</span>
          </div>
          <div style="font-family: monospace; font-size: 11px; background: #F1F5F9; padding: 4px 6px; border-radius: 6px; border: 1px solid #CBD5E1; color: #0F172A; font-weight: bold; margin-bottom: 4px;">
            ${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E
          </div>
          ${nearest ? `
            <div style="font-size: 11px; color: #334155;">
              <span style="color: #64748B;">Nearest Sensor:</span><br/>
              <strong>${(nearest as Camera).name}</strong> (~${Math.round(minDist)}m away)
            </div>
          ` : ''}
        </div>
      `).openPopup();
      clickMarkerRef.current = marker;
      app.toast(`Inspected: ${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E`);
    });

    mapInstanceRef.current = map;
    setMapReady(true);

    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 300);
    const t3 = setTimeout(() => map.invalidateSize(), 600);

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
      setMapReady(false);
    };
  }, []);

  // Handle Sector Switch
  const handleSelectSector = (secId: string) => {
    setSelectedSector(secId);
    const sec = SECTORS.find((s) => s.id === secId);
    if (!sec || !mapInstanceRef.current) return;

    if (sec.bounds) {
      mapInstanceRef.current.fitBounds(sec.bounds, { padding: [30, 30] });
    } else {
      mapInstanceRef.current.flyTo(sec.center, sec.zoom, { duration: 0.9 });
    }
  };

  // Filter vehicles by Sector, Time Slice, and State
  const filteredVehicles = useMemo(() => {
    const curSlice = TIMELINE_SLICES_DEF.find((s) => s.id === selectedTimeSlice) || TIMELINE_SLICES_DEF[0];
    const sec = SECTORS.find((s) => s.id === selectedSector);

    return app.vehicles.filter((v) => {
      // State Filter (DL, HR, UP)
      if (stateFilter !== 'all') {
        const prefix = v.plate.split('-')[0]?.toUpperCase();
        if (prefix !== stateFilter) return false;
      }

      // Sector Filter (if not 'all', check if any checkpoint matches that district/corridor)
      if (sec && sec.id !== 'all') {
        const matchesSector = v.journey.some((evt) => {
          const c = camById(evt.cam);
          return c && (c.district.toLowerCase() === sec.district.toLowerCase() || c.name.toLowerCase().includes(sec.name.toLowerCase().slice(0, 6)));
        });
        if (!matchesSector) return false;
      }

      // Time Filter
      if (curSlice.id === 'all') return true;
      if (curSlice.id === 'recent') return v.lastSeen.includes('min') || v.lastSeen.includes('just');

      const hasObs = v.journey.some((evt) => {
        const [h, m] = evt.t.split(':').map((x) => parseInt(x, 10));
        const totalMins = h * 60 + m;
        const startMins = curSlice.startH * 60 + curSlice.startM;
        const endMins = curSlice.endH * 60 + curSlice.endM;
        return totalMins >= startMins && totalMins <= endMins;
      });

      return hasObs;
    });
  }, [selectedSector, selectedTimeSlice, stateFilter, app.vehicles]);

  // Selected camera details and actual detected vehicles from database
  const selCam: Camera | undefined = useMemo(() => {
    return selCamId ? camById(selCamId) : undefined;
  }, [selCamId]);

  const rawCam30MinDetections = useMemo((): ANPRDetection[] => {
    if (!selCam) return [];
    const actualDets: ANPRDetection[] = [];
    app.vehicles.forEach((v) => {
      v.journey.forEach((evt, idx) => {
        if (evt.cam === selCam.code || evt.cam === selCam.id) {
          actualDets.push({
            id: `${v.id}-${idx}`,
            plate: v.plate,
            make: v.make,
            model: v.model,
            color: v.color,
            type: v.type,
            speed: evt.speed || v.speed,
            timeStr: evt.t,
            status: v.status,
            flaggedReason: v.flaggedReason,
            confidence: 0.94 + ((idx % 5) * 0.01),
            dir: evt.dir,
            lane: 'Lane 1',
            vehicleRef: v,
          });
        }
      });
    });
    return actualDets;
  }, [selCam, app.vehicles]);

  const filteredCamDetections = useMemo(() => {
    return rawCam30MinDetections.filter((det) => {
      if (camStatusFilter !== 'all' && det.status !== camStatusFilter) return false;
      if (camSearchQuery.trim()) {
        const q = camSearchQuery.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        const plateClean = det.plate.toLowerCase().replace(/[^a-z0-9]/g, '');
        return plateClean.includes(q) || det.make.toLowerCase().includes(q) || det.model.toLowerCase().includes(q);
      }
      return true;
    });
  }, [rawCam30MinDetections, camStatusFilter, camSearchQuery]);

  // Active vehicle for route trajectory
  const focusVeh: Vehicle | undefined = useMemo(() => {
    if (dynamicVehicles[selectedVehicleId]) return dynamicVehicles[selectedVehicleId];
    return app.vehicles.find((v) => v.id === selectedVehicleId || v.plate === selectedVehicleId) || filteredVehicles[0] || app.vehicles[0];
  }, [selectedVehicleId, dynamicVehicles, filteredVehicles, app.vehicles]);

  // Search vehicle by plate
  const handleSearchVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!q) return;

    // Search in primary vehicles
    const hit = app.vehicles.find(
      (v) =>
        v.plate.toLowerCase().replace(/[^a-z0-9]/g, '').includes(q) ||
        q.includes(v.plate.toLowerCase().replace(/[^a-z0-9]/g, '')) ||
        v.make.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q)
    );

    if (hit) {
      setSelectedVehicleId(hit.id);
      setLayers((l) => ({ ...l, journey: true }));
      app.toast(`Tracing route for ${hit.plate} (${hit.make} ${hit.model})`);
      return;
    }

    // Search in raw camera detections
    const detHit = rawCam30MinDetections.find(
      (d) =>
        d.plate.toLowerCase().replace(/[^a-z0-9]/g, '').includes(q) ||
        q.includes(d.plate.toLowerCase().replace(/[^a-z0-9]/g, ''))
    );

    if (detHit && detHit.vehicleRef) {
      setDynamicVehicles((prev) => ({ ...prev, [detHit.vehicleRef!.id]: detHit.vehicleRef! }));
      setSelectedVehicleId(detHit.vehicleRef.id);
      setLayers((l) => ({ ...l, journey: true }));
      app.toast(`Tracing ANPR route for ${detHit.plate} (${detHit.make} ${detHit.model})`);
    } else {
      app.toast(`No vehicle matches registration "${searchQuery}"`);
    }
  };

  // Render Camera Markers + Inter-Camera Distance Vectors on Map
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !camerasLayerRef.current || !interCameraDistLayerRef.current) return;
    camerasLayerRef.current.clearLayers();
    interCameraDistLayerRef.current.clearLayers();

    if (!layers.cameras) return;

    // 1. Draw Camera Markers with precision tactical badge
    CAMERAS.forEach((cam) => {
      const isSelected = selCamId === cam.id || selCamId === cam.code;
      const isOnline = cam.status === 'online';
      const isDegraded = cam.status === 'degraded';

      const statusColor = isOnline ? '#3B82F6' : isDegraded ? '#F59E0B' : '#EF4444';
      const codeShort = cam.code.replace('CAM-', '');

      const customIcon = L.divIcon({
        className: 'custom-leaflet-camera-pin',
        html: `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            transform: ${isSelected ? 'scale(1.18)' : 'scale(1)'};
            transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
            filter: drop-shadow(0 3px 6px rgba(0,0,0,0.45));
          ">
            <div style="
              display: flex;
              align-items: center;
              gap: 4px;
              padding: 3px 7px;
              border-radius: 9999px;
              background: ${isSelected ? '#1E293B' : '#0F172A'};
              border: 1.5px solid ${statusColor};
              box-shadow: 0 0 10px ${isSelected ? statusColor : 'rgba(0,0,0,0.3)'};
              color: #FFFFFF;
              font-family: system-ui, -apple-system, sans-serif;
              font-size: 11px;
              font-weight: 700;
              line-height: 1;
              white-space: nowrap;
            ">
              <span style="width: 6px; height: 6px; border-radius: 50%; background: ${isOnline ? '#10B981' : isDegraded ? '#F59E0B' : '#EF4444'}; box-shadow: 0 0 6px ${isOnline ? '#10B981' : '#EF4444'};"></span>
              <span>${codeShort}</span>
            </div>
            <div style="
              width: 0;
              height: 0;
              border-left: 4px solid transparent;
              border-right: 4px solid transparent;
              border-top: 5px solid ${statusColor};
              margin-top: -1px;
            "></div>
          </div>
        `,
        iconSize: [60, 26],
        iconAnchor: [30, 26]
      });

      const marker = L.marker([cam.lat, cam.lng], { icon: customIcon });

      marker.on('click', () => {
        setSelCamId(cam.id);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([cam.lat, cam.lng], Math.max(mapInstanceRef.current.getZoom(), 15), { duration: 0.5 });
        }
      });

      marker.bindTooltip(`<strong>${cam.code}</strong>: ${cam.name}<br/><span style="color: #64748B; font-size: 10px;">${cam.district} · ${cam.avgSpeed} km/h avg</span>`, {
        direction: 'top',
        offset: [0, -26]
      });

      camerasLayerRef.current?.addLayer(marker);
    });

    // 2. Draw Inter-Camera Distance Vectors from Selected Camera to Closest Neighbors
    if (selCamId && layers.distances) {
      const selectedCam = CAMERAS.find((c) => c.id === selCamId || c.code === selCamId);
      if (selectedCam) {
        const neighbors = getNearestCameras(selectedCam.id, 4);
        neighbors.forEach((nbr) => {
          const targetCam = CAMERAS.find((c) => c.id === nbr.target_id || c.code === nbr.target_id);
          if (!targetCam) return;

          // Dashed vector connecting camera pair
          const distVector = L.polyline(
            [[selectedCam.lat, selectedCam.lng], [targetCam.lat, targetCam.lng]],
            {
              color: '#3B82F6',
              weight: 2,
              opacity: 0.8,
              dashArray: '4, 4',
              lineCap: 'round'
            }
          );
          interCameraDistLayerRef.current?.addLayer(distVector);

          // Midpoint distance pill
          const midLat = (selectedCam.lat + targetCam.lat) / 2;
          const midLng = (selectedCam.lng + targetCam.lng) / 2;
          const distPillIcon = L.divIcon({
            className: 'custom-dist-tag',
            html: `
              <div style="
                background: #0F172A;
                border: 1px solid #3B82F6;
                color: #93C5FD;
                font-family: monospace;
                font-size: 10px;
                font-weight: bold;
                padding: 1.5px 5px;
                border-radius: 4px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.5);
                white-space: nowrap;
              ">
                📏 ${nbr.distance_meters}m · ${nbr.est_transit_mins}m
              </div>
            `,
            iconSize: [85, 18],
            iconAnchor: [42, 9]
          });
          const distTagMarker = L.marker([midLat, midLng], { icon: distPillIcon });
          interCameraDistLayerRef.current?.addLayer(distTagMarker);
        });
      }
    }
  }, [mapReady, layers.cameras, layers.distances, selCamId]);

  // Render Inter-Camera Hotspot & Bottleneck Corridors
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !corridorsLayerRef.current) return;
    corridorsLayerRef.current.clearLayers();

    if (!layers.corridors) return;

    HOTSPOT_CORRIDORS.forEach((cor) => {
      const camA = CAMERAS.find((c) => c.code === cor.fromCam || c.id === cor.fromCam);
      const camB = CAMERAS.find((c) => c.code === cor.toCam || c.id === cor.toCam);
      if (!camA || !camB) return;

      const corColor = cor.severity === 'critical' ? '#DC2626' : cor.severity === 'high' ? '#EA580C' : '#EAB308';

      // Outer glow line
      const casing = L.polyline([[camA.lat, camA.lng], [camB.lat, camB.lng]], {
        color: corColor,
        weight: 8,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round'
      });

      // Inner animated dashed line
      const line = L.polyline([[camA.lat, camA.lng], [camB.lat, camB.lng]], {
        color: corColor,
        weight: 3.5,
        opacity: 0.9,
        dashArray: '6, 4',
        lineCap: 'round',
        lineJoin: 'round'
      });

      corridorsLayerRef.current?.addLayer(casing);
      corridorsLayerRef.current?.addLayer(line);

      // Midpoint Corridor Choke Badge
      const midLat = (camA.lat + camB.lat) / 2;
      const midLng = (camA.lng + camB.lng) / 2;

      const badgeIcon = L.divIcon({
        className: 'custom-corridor-badge',
        html: `
          <div style="
            display: flex;
            align-items: center;
            gap: 4px;
            background: #0F172A;
            border: 1.5px solid ${corColor};
            color: #FFFFFF;
            padding: 2px 7px;
            border-radius: 6px;
            font-family: system-ui, sans-serif;
            font-size: 10px;
            font-weight: 800;
            box-shadow: 0 0 10px ${corColor}90;
            white-space: nowrap;
            cursor: pointer;
          ">
            <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${corColor}; box-shadow: 0 0 6px ${corColor};"></span>
            <span>${cor.congestionIndex}% Choke (+${cor.delayMins}m)</span>
          </div>
        `,
        iconSize: [125, 22],
        iconAnchor: [62, 11]
      });

      const badgeMarker = L.marker([midLat, midLng], { icon: badgeIcon });
      badgeMarker.bindPopup(`
        <div style="padding: 4px; font-family: sans-serif; min-width: 220px;">
          <div style="font-weight: 800; color: #1E293B; font-size: 12px; margin-bottom: 2px;">
            ⚠️ Inter-Camera Bottleneck
          </div>
          <div style="font-size: 11px; font-weight: bold; color: ${corColor}; margin-bottom: 4px;">
            ${cor.name}
          </div>
          <div style="font-size: 10.5px; color: #475569; margin-bottom: 4px;">
            • Link: <strong>${camA.code} ➔ ${camB.code}</strong><br/>
            • Congestion Index: <strong>${cor.congestionIndex}%</strong><br/>
            • Estimated Delay: <strong>+${cor.delayMins} min</strong> (${cor.avgSpeed} km/h avg)<br/>
            • Peak Hourly Flow: <strong>${cor.vehiclesPerHour.toLocaleString()} veh/hr</strong>
          </div>
          <div style="font-size: 10px; background: #F8FAFC; border: 1px solid #E2E8F0; padding: 4px 6px; border-radius: 4px; color: #334155;">
            <strong>Choke Cause:</strong> ${cor.bottleneckReason}
          </div>
        </div>
      `);

      corridorsLayerRef.current?.addLayer(badgeMarker);
    });
  }, [mapReady, layers.corridors]);

  // Render Clean Chronological AI Route + Probable Alternative Branches (No Criss-Cross Web)
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !journeyLayerRef.current || !altCorridorLayerRef.current) return;
    journeyLayerRef.current.clearLayers();
    altCorridorLayerRef.current.clearLayers();

    if (!layers.journey || !focusVeh || !focusVeh.journey || focusVeh.journey.length === 0) return;

    // Build strict chronological sequence of camera coordinates
    const stopCoords: [number, number][] = [];
    const stopData: { stopNum: number; cam: Camera; time: string; speed: number; note?: string }[] = [];

    focusVeh.journey.forEach((evt, idx) => {
      const c = camById(evt.cam);
      if (c) {
        stopCoords.push([c.lat, c.lng]);
        stopData.push({
          stopNum: idx + 1,
          cam: c,
          time: evt.t,
          speed: evt.speed,
          note: evt.note
        });
      }
    });

    if (stopCoords.length > 0) {
      const routeColor = focusVeh.status === 'watchlist' ? '#D97706' : focusVeh.status === 'flagged' ? '#DC2626' : '#2563EB';

      // 1. Initial sequential fallback line
      let routeLine = L.polyline(stopCoords, {
        color: routeColor,
        weight: 4,
        opacity: 0.85,
        dashArray: '6, 8',
        lineCap: 'round',
        lineJoin: 'round'
      });
      journeyLayerRef.current.addLayer(routeLine);

      // 2. Render AI Feasible Alternative Transit Corridors (Segment by segment, cleanly curved)
      if (layers.altRoutes && stopCoords.length >= 2) {
        for (let i = 0; i < stopCoords.length - 1; i++) {
          const ptA = stopCoords[i];
          const ptB = stopCoords[i + 1];

          // Compute a gentle realistic alternative branch between camera A and camera B
          const midLat = (ptA[0] + ptB[0]) / 2 + ((i % 2 === 0 ? 1 : -1) * 0.005);
          const midLng = (ptA[1] + ptB[1]) / 2 + ((i % 2 === 0 ? -1 : 1) * 0.007);

          const altCorridor = L.polyline([ptA, [midLat, midLng], ptB], {
            color: '#8B5CF6',
            weight: 3,
            opacity: 0.6,
            dashArray: '4, 6',
            lineCap: 'round'
          });

          altCorridor.bindTooltip(`AI Feasible Branch (${i === 0 ? '34%' : '27%'} likelihood): Stop ${i + 1} ➔ Stop ${i + 2}`, {
            sticky: true,
            direction: 'center'
          });

          altCorridorLayerRef.current.addLayer(altCorridor);
        }
      }

      // 3. Fetch True Road-to-Road AI Primary Snapped Path from OSRM
      if (stopCoords.length >= 2) {
        const coordsQuery = stopCoords.map(([lat, lng]) => `${lng},${lat}`).join(';');
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordsQuery}?overview=full&geometries=geojson`;

        fetch(osrmUrl)
          .then((res) => res.json())
          .then((data) => {
            if (data.code === 'Ok' && data.routes && data.routes[0]?.geometry?.coordinates) {
              const roadCoordinates: [number, number][] = data.routes[0].geometry.coordinates.map(
                ([lng, lat]: [number, number]) => [lat, lng]
              );

              if (journeyLayerRef.current) {
                journeyLayerRef.current.removeLayer(routeLine);

                // Ambient Route Glow
                const casingLine = L.polyline(roadCoordinates, {
                  color: routeColor,
                  weight: 8,
                  opacity: 0.3,
                  lineCap: 'round',
                  lineJoin: 'round'
                });
                journeyLayerRef.current.addLayer(casingLine);

                // Solid Tactical Primary Road Line
                const roadPolyline = L.polyline(roadCoordinates, {
                  color: routeColor,
                  weight: 4.5,
                  opacity: 0.95,
                  lineCap: 'round',
                  lineJoin: 'round'
                });
                journeyLayerRef.current.addLayer(roadPolyline);

                // Fit view strictly to the car's traversed sector
                if (mapInstanceRef.current) {
                  const bounds = L.latLngBounds(roadCoordinates);
                  mapInstanceRef.current.fitBounds(bounds, { padding: [55, 55], maxZoom: 15 });
                }
              }
            }
          })
          .catch((err) => {
            console.warn('Road snapping fallback active:', err);
            if (stopCoords.length > 1 && mapInstanceRef.current) {
              const bounds = L.latLngBounds(stopCoords);
              mapInstanceRef.current.fitBounds(bounds, { padding: [55, 55], maxZoom: 15 });
            }
          });
      }

      // 4. Draw Clean Sequential Stop Waypoint Badges (1 -> 2 -> 3 -> 4)
      stopData.forEach((stop) => {
        const isWatch = focusVeh.status !== 'clear';
        const stopMarkerIcon = L.divIcon({
          className: 'custom-journey-stop',
          html: `
            <div style="
              display: flex;
              align-items: center;
              justify-content: center;
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background: ${isWatch ? '#DC2626' : '#1E293B'};
              border: 2px solid #FFFFFF;
              box-shadow: 0 3px 8px rgba(0,0,0,0.35);
              color: #FFFFFF;
              font-family: monospace;
              font-size: 12px;
              font-weight: 800;
            ">
              ${stop.stopNum}
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const stopMarker = L.marker([stop.cam.lat, stop.cam.lng], { icon: stopMarkerIcon });
        stopMarker.bindPopup(`
          <div style="font-family: system-ui, sans-serif; padding: 3px; min-width: 220px;">
            <div style="font-size: 10px; font-weight: 800; color: #D97706; text-transform: uppercase;">
              Stop #${stop.stopNum} · ${stop.time}
            </div>
            <div style="font-size: 13px; font-weight: 700; color: #1E293B; margin-top: 2px;">
              ${focusVeh.plate} (${focusVeh.make} ${focusVeh.model})
            </div>
            <div style="font-size: 11px; color: #64748B; margin-top: 2px;">
              ${stop.cam.code}: ${stop.cam.name}
            </div>
            <div style="font-size: 11px; color: #334155; margin-top: 4px; background: #F1F5F9; padding: 4px 6px; border-radius: 4px;">
              Recorded Speed: <strong>${stop.speed} km/h</strong>
            </div>
            ${focusVeh.flaggedReason ? `
              <div style="font-size: 10px; color: #DC2626; margin-top: 4px; font-weight: 700; border-top: 1px solid #E2E8F0; padding-top: 3px;">
                🚨 ${focusVeh.flaggedReason}
              </div>` : ''
            }
          </div>
        `);

        journeyLayerRef.current?.addLayer(stopMarker);
      });
    }
  }, [mapReady, layers.journey, layers.altRoutes, focusVeh]);

  // Render Hotspots Layer (Tactical concentrated choke points)
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !hotspotsLayerRef.current) return;
    hotspotsLayerRef.current.clearLayers();

    if (!layers.congestion) return;

    HOTSPOTS.forEach((h) => {
      const color = h.level === 3 ? '#DC2626' : h.level === 2 ? '#D97706' : '#EAB308';
      const outerRadius = h.level === 3 ? 110 : h.level === 2 ? 85 : 65;
      const innerRadius = h.level === 3 ? 35 : h.level === 2 ? 25 : 18;

      // Concentrated Outer Zone
      const outerCircle = L.circle([h.lat, h.lng], {
        color: color,
        weight: 1.5,
        opacity: 0.8,
        dashArray: '4, 4',
        fillColor: color,
        fillOpacity: 0.15,
        radius: outerRadius
      });

      // High Intensity Core Zone
      const innerCircle = L.circle([h.lat, h.lng], {
        color: color,
        weight: 2,
        fillColor: color,
        fillOpacity: 0.45,
        radius: innerRadius
      });

      // Center Tactical Beacon Icon
      const beaconIcon = L.divIcon({
        className: 'custom-hotspot-beacon',
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: ${color};
            border: 2px solid #FFFFFF;
            box-shadow: 0 0 10px ${color};
            font-size: 10px;
            color: #FFFFFF;
            font-weight: 800;
          ">
            <div style="width: 6px; height: 6px; border-radius: 50%; background: #FFFFFF;"></div>
          </div>
        `,
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      });
      const beaconMarker = L.marker([h.lat, h.lng], { icon: beaconIcon });

      const tooltipContent = `
        <div style="padding: 2px; font-family: sans-serif;">
          <div style="font-weight: 800; color: #1E293B; font-size: 12px; margin-bottom: 2px;">
            ⚠️ Hotspot: ${h.name}
          </div>
          <div style="font-size: 11px; color: #475569;">
            Density: <strong>${h.veh.toLocaleString()} veh/hr</strong> (Level ${h.level})
          </div>
          <div style="font-size: 10.5px; color: #64748B; margin-top: 2px;">
            ${h.note}
          </div>
        </div>
      `;

      outerCircle.bindTooltip(tooltipContent, { sticky: true, direction: 'top' });
      innerCircle.bindTooltip(tooltipContent, { sticky: true, direction: 'top' });
      beaconMarker.bindTooltip(tooltipContent, { sticky: true, direction: 'top' });

      hotspotsLayerRef.current?.addLayer(outerCircle);
      hotspotsLayerRef.current?.addLayer(innerCircle);
      hotspotsLayerRef.current?.addLayer(beaconMarker);
    });
  }, [mapReady, layers.congestion]);

  // Render Active Alerts Layer
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !alertsLayerRef.current) return;
    alertsLayerRef.current.clearLayers();

    if (!layers.alerts) return;

    app.alerts.filter((a) => a.status === 'open').forEach((a) => {
      const c = camById(a.cameraId);
      if (!c) return;

      const alertIcon = L.divIcon({
        className: 'custom-alert-pin',
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: #DC2626;
            border: 2px solid #FFFFFF;
            box-shadow: 0 2px 8px rgba(220,38,38,0.6);
            color: #FFFFFF;
            font-size: 11px;
            font-weight: 800;
          ">
            !
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      const marker = L.marker([c.lat + 0.0015, c.lng + 0.0015], { icon: alertIcon });
      marker.bindPopup(`
        <div style="font-family: system-ui, sans-serif; padding: 2px;">
          <div style="color: #DC2626; font-weight: 700; font-size: 11px; text-transform: uppercase;">
            ${a.severity} Alert — ${a.type}
          </div>
          <div style="font-weight: 700; color: #1E293B; font-size: 12px; margin-top: 2px;">
            ${a.title}
          </div>
          <div style="color: #64748B; font-size: 11px; margin-top: 4px;">
            ${a.detail}
          </div>
        </div>
      `);

      alertsLayerRef.current?.addLayer(marker);
    });
  }, [mapReady, layers.alerts, app.alerts]);

  return (
    <div className="page-shell fade-up">
      {/* Top Page Hero Banner */}
      <div className="page-hero flex flex-wrap items-end justify-between gap-3 px-5 py-4 sm:px-6 sm:py-5">
        <div>
          <Kicker className="text-sand">Tactical GIS Intelligence</Kicker>
          <p className="mt-1 font-display text-[28px] font-bold leading-tight text-cream sm:text-[32px]">
            Live City Map <span className="italic text-sand">· Delhi NCR Surveillance Grid</span>
          </p>
        </div>

        {/* Action Buttons & Layer Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(layers) as (keyof typeof layers)[]).map((k) => (
            <button
              key={k}
              onClick={() => toggle(k)}
              className={cx(
                'rounded-full border px-3 py-1.5 text-[12px] font-bold capitalize transition-all duration-150 active:scale-95',
                layers[k] ? 'border-sand/50 bg-sand/20 text-sand' : 'border-cream/15 text-sand/70 hover:border-cream/30 hover:bg-cream/10 hover:text-cream'
              )}
            >
              {layers[k] ? '● ' : '○ '}
              {k === 'journey'
                ? 'AI Road Route'
                : k === 'altRoutes'
                ? 'Feasible Branches'
                : k === 'corridors'
                ? 'Bottleneck Corridors'
                : k === 'distances'
                ? 'Sensor Distance Grid'
                : k === 'congestion'
                ? 'Hotspot Zones'
                : k}
            </button>
          ))}
        </div>
      </div>

      {/* Control Console: Sector Area Zoom + Timeline Chart + Plate Search */}
      <div className="flex flex-col gap-3.5 rounded-xl border border-clay/25 bg-cream/90 p-4 shadow-sm backdrop-blur">
        {/* Row 1: Sector / Area Focus Selector */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[12px] font-bold text-ink flex items-center gap-1">
              <Icon name="map" className="h-3.5 w-3.5 text-dusk" />
              Focus Area / Sector:
            </span>
            {SECTORS.map((sec) => (
              <button
                key={sec.id}
                onClick={() => handleSelectSector(sec.id)}
                className={cx(
                  'rounded-lg px-2.5 py-1 text-[12px] font-bold transition active:scale-95',
                  selectedSector === sec.id
                    ? 'bg-dusk text-cream shadow-sm'
                    : 'border border-clay/35 bg-cream text-ink hover:bg-sand/40'
                )}
              >
                {sec.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-ink">State:</span>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value as typeof stateFilter)}
              className="rounded-lg border border-clay/35 bg-cream px-2 py-1 text-[12px] font-bold text-ink outline-none"
            >
              <option value="all">All States (DL, HR, UP)</option>
              <option value="DL">Delhi (DL)</option>
              <option value="HR">Haryana (HR)</option>
              <option value="UP">Noida (UP)</option>
            </select>
          </div>
        </div>

        {/* Row 2: Timeline Traffic Volume Density Bar Chart */}
        <div className="flex flex-col gap-1.5 border-t border-clay/20 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-dusk flex items-center gap-1">
              <Icon name="clock" className="h-3.5 w-3.5" />
              Select Observation Timeline Window:
            </span>
            <span className="text-[11px] font-bold text-mauve">
              {filteredVehicles.length} vehicles observed in selected sector & timeline
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {timelineSlices.map((ts) => {
              const isSel = selectedTimeSlice === ts.id;
              return (
                <button
                  key={ts.id}
                  onClick={() => setSelectedTimeSlice(ts.id)}
                  className={cx(
                    'flex flex-col rounded-lg border p-2 text-left transition-all active:scale-95',
                    isSel
                      ? 'border-dusk bg-dusk text-cream shadow-md'
                      : 'border-clay/30 bg-cream text-ink hover:border-dusk/40 hover:bg-sand/30'
                  )}
                >
                  <span className={cx('text-[11px] font-bold', isSel ? 'text-cream' : 'text-ink')}>
                    {ts.label}
                  </span>
                  <div className="mt-1 flex items-center justify-between text-[10px]">
                    <span className={isSel ? 'text-sand' : 'text-mauve'}>{ts.timeRange}</span>
                    <span className={cx('font-bold', isSel ? 'text-cream' : 'text-dusk')}>
                      {ts.vehCount} veh
                    </span>
                  </div>
                  {/* Visual density bar */}
                  <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-clay/20">
                    <div
                      className={cx('h-full rounded-full', isSel ? 'bg-sand' : 'bg-dusk')}
                      style={{ width: `${Math.min(100, Math.round((ts.vehCount / Math.max(1, app.vehicles.length)) * 100))}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 3: Direct Registration Search & Detected Cars Carousel */}
        <div className="flex flex-col gap-3 border-t border-clay/20 pt-3">
          <form onSubmit={handleSearchVehicle} className="flex items-center gap-2">
            <div className="relative flex flex-1 items-center">
              <Icon name="search" className="absolute left-3 h-4 w-4 text-mauve/70" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type car number (e.g. DL-01-AB-4821, HR-38, UP-16, DL-03)..."
                className="h-9 w-full rounded-lg border border-clay/35 bg-cream pl-9 pr-3 text-[13px] font-bold text-ink outline-none transition focus:border-dusk"
              />
            </div>
            <Btn size="sm" variant="solid" type="submit" icon="search">
              Trace AI Route
            </Btn>
          </form>

          {/* Quick Select Cards for Detected Cars in Window */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {filteredVehicles.map((v) => {
              const isSel = v.id === selectedVehicleId;
              return (
                <button
                  key={v.id}
                  onClick={() => {
                    setSelectedVehicleId(v.id);
                    setLayers((l) => ({ ...l, journey: true }));
                  }}
                  className={cx(
                    'flex shrink-0 items-center gap-2.5 rounded-xl border px-3 py-1.5 text-left transition-all active:scale-95',
                    isSel
                      ? 'border-dusk bg-dusk text-cream shadow-md'
                      : 'border-clay/35 bg-cream hover:border-dusk/40 hover:bg-sand/30'
                  )}
                >
                  <div>
                    <div className={cx('font-display text-[13px] font-bold', isSel ? 'text-cream' : 'text-ink')}>
                      {v.plate}
                    </div>
                    <div className={cx('text-[11px] font-semibold', isSel ? 'text-sand' : 'text-mauve')}>
                      {v.make} {v.model} · {v.journey.length} Cameras
                    </div>
                  </div>
                  <Badge tone={v.status === 'flagged' ? 'critical' : v.status === 'watchlist' ? 'medium' : 'good'}>
                    {v.status}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Full-Width Leaflet Tactical Map */}
      <div className="mt-4 w-full">
        <div
          className="relative w-full rounded-2xl border border-clay/40 bg-cream/90 p-2 shadow-md overflow-hidden"
          style={{ height: '666px', minHeight: '666px' }}
        >
          <div
            ref={mapContainerRef}
            className="w-full rounded-xl overflow-hidden shadow-inner"
            style={{ height: '650px', minHeight: '650px', width: '100%', position: 'relative', zIndex: 1 }}
          />

          {/* Map Legend Overlay */}
          <div className="pointer-events-none absolute left-5 top-5 z-[999] flex flex-col gap-1.5 rounded-lg border border-clay/20 bg-cream/90 px-3 py-2 text-[11px] font-semibold text-ink shadow-sm backdrop-blur">
            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#2563EB]" /> Surveillance Node (20 Active)</span>
            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#D97706]" /> AI Estimated Primary Path</span>
            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#8B5CF6]" /> Probable Alternative Branch</span>
            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#DC2626]" /> Priority Alert Incident</span>
          </div>

          {/* Floating Active Inspected Coordinate HUD */}
          {inspectedLoc && (
            <div className="absolute top-5 right-5 z-[999] flex items-center gap-3 rounded-xl border border-clay/35 bg-ink/95 px-4 py-2.5 text-cream shadow-2xl backdrop-blur font-mono text-xs max-w-sm">
              <div className="h-2.5 w-2.5 rounded-full bg-[#E86A67] shrink-0 animate-ping" />
              <div className="min-w-0 flex-1">
                <div className="font-bold flex items-center justify-between gap-2">
                  <span>{inspectedLoc.lat.toFixed(5)}° N, {inspectedLoc.lng.toFixed(5)}° E</span>
                  <span className="text-[10px] text-sand/80 font-normal">{inspectedLoc.time}</span>
                </div>
                {inspectedLoc.nearestCam && (
                  <div className="text-[11px] text-sand truncate">
                    Near: {inspectedLoc.nearestCam} (~{inspectedLoc.distanceMeters}m)
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(`${inspectedLoc.lat.toFixed(5)}, ${inspectedLoc.lng.toFixed(5)}`);
                  app.toast(`Copied ${inspectedLoc.lat.toFixed(5)}, ${inspectedLoc.lng.toFixed(5)}`);
                }}
                className="rounded bg-cream/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-cream hover:bg-cream/30 transition shrink-0"
              >
                Copy
              </button>
            </div>
          )}

          {/* Dedicated Camera Inspector & Distance Matrix Sheet on Map */}
          {selCam && (
            <div className="absolute bottom-5 left-5 right-5 z-[1000] flex flex-col gap-2 rounded-xl border border-clay/35 bg-cream/95 p-4 shadow-2xl backdrop-blur sm:right-auto sm:max-w-md max-h-[580px] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-clay/25 pb-2">
                <div>
                  <div className="text-[15px] font-bold text-ink flex items-center gap-2">
                    <Icon name="camera" className="h-4 w-4 text-dusk" />
                    {selCam.code}: {selCam.name}
                  </div>
                  <div className="text-[11.5px] font-semibold text-mauve">
                    {selCam.district} · Heading: {selCam.heading}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={selCam.status === 'online' ? 'good' : 'critical'}>{selCam.status}</Badge>
                  <button
                    aria-label="Close"
                    onClick={() => setSelCamId(null)}
                    className="rounded-full p-1 text-mauve hover:bg-clay/20 hover:text-ink transition"
                  >
                    <Icon name="x" className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Compact Tactical CCTV Stream Viewer */}
              <CameraFeed cam={selCam} className="h-32 w-full rounded-lg" />

              {/* Nearest Neighboring Sensors with Haversine Distances & Jump Actions */}
              <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-2 text-[11px]">
                <div className="flex items-center justify-between font-bold text-blue-900 mb-1">
                  <span>📏 Closest Grid Sensors:</span>
                  <span className="text-[10px] text-blue-600 font-normal">Haversine GPS Matrix</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {getNearestCameras(selCam.id, 4).map((nbr) => {
                    const tCam = CAMERAS.find((c) => c.id === nbr.target_id || c.code === nbr.target_id);
                    return (
                      <button
                        key={nbr.target_id}
                        onClick={() => {
                          setSelCamId(nbr.target_id);
                          if (tCam && mapInstanceRef.current) {
                            mapInstanceRef.current.flyTo([tCam.lat, tCam.lng], 15, { duration: 0.5 });
                          }
                        }}
                        className="flex items-center justify-between rounded bg-white px-2 py-1 border border-blue-200 hover:border-blue-400 text-left transition"
                      >
                        <span className="font-bold text-slate-800 text-[10.5px]">
                          {nbr.target_id.replace('CAM-', '')}
                        </span>
                        <span className="font-mono font-semibold text-blue-700 text-[10px]">
                          {nbr.distance_meters}m ({nbr.est_transit_mins}m)
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Camera Telemetrics */}
              <div className="grid grid-cols-3 gap-1.5 text-center text-[10.5px] text-ink">
                <div className="rounded-lg bg-sand/30 p-1">
                  <div className="text-mauve text-[9.5px]">Avg Speed</div>
                  <div className="font-bold text-[12px]">{selCam.avgSpeed} km/h</div>
                </div>
                <div className="rounded-lg bg-sand/30 p-1">
                  <div className="text-mauve text-[9.5px]">Today's Vol</div>
                  <div className="font-bold text-[12px]">{selCam.vehiclesToday.toLocaleString()}</div>
                </div>
                <div className="rounded-lg bg-sand/30 p-1">
                  <div className="text-mauve text-[9.5px]">30-Min Flow</div>
                  <div className="font-bold text-[12px] text-dusk">{rawCam30MinDetections.length * 30} v/h</div>
                </div>
              </div>

              {/* Cars Passed Through This Camera in Past 30 Minutes */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-dusk mb-1">
                  <span>Plates Logged (Past 30m):</span>
                  <span className="text-[10px] text-mauve font-semibold">{filteredCamDetections.length} matches</span>
                </div>
                <div className="max-h-32 overflow-y-auto flex flex-col gap-1 pr-1">
                  {filteredCamDetections.slice(0, 8).map((det) => (
                    <div
                      key={det.id}
                      className="flex items-center justify-between rounded border border-clay/25 bg-cream px-2 py-1 text-[11px] hover:border-dusk/40 transition"
                    >
                      <div className="truncate min-w-0 pr-1">
                        <span className="font-bold text-ink">{det.plate}</span>
                        <span className="text-[9.5px] text-mauve ml-1.5">({det.make} {det.model})</span>
                      </div>
                      <button
                        onClick={() => {
                          if (det.vehicleRef) {
                            setDynamicVehicles((prev) => ({ ...prev, [det.vehicleRef!.id]: det.vehicleRef! }));
                            setSelectedVehicleId(det.vehicleRef.id);
                          }
                          setLayers((l) => ({ ...l, journey: true }));
                          app.toast(`Tracing AI route for ${det.plate}`);
                        }}
                        className="rounded bg-dusk px-1.5 py-0.5 text-[10px] font-bold text-cream hover:bg-ink transition shrink-0"
                      >
                        Trace
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-1 flex items-center gap-2 border-t border-clay/25 pt-2">
                <Btn
                  size="sm"
                  variant="solid"
                  className="flex-1 text-[12px] h-8"
                  icon="camera"
                  onClick={() => app.nav({ page: 'cameras', cameraId: selCam.id })}
                >
                  Full Camera Operations
                </Btn>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Structured Dashboard Panels Placed Below Map */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Column 1: Active AI Route Trajectory Breakdown with Explicit Flagged Reason */}
        {focusVeh && (
          <Card className="border-clay/30 bg-sand/45 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <Kicker>Active Vehicle Dossier</Kicker>
                <Badge tone={focusVeh.status === 'flagged' ? 'critical' : focusVeh.status === 'watchlist' ? 'medium' : 'good'}>
                  {focusVeh.status.toUpperCase()}
                </Badge>
              </div>

              <div className="mt-1 font-display text-[24px] font-bold text-ink">{focusVeh.plate}</div>
              <div className="text-[13px] font-semibold text-mauve/80">
                {focusVeh.make} {focusVeh.model} · {focusVeh.color} ({focusVeh.type})
              </div>

              {/* Prominent Legal / Incident Reason for Flagged / Watchlist Status */}
              {focusVeh.flaggedReason && (
                <div
                  className={cx(
                    'mt-3 rounded-lg p-3 text-[12px] border transition',
                    focusVeh.status === 'flagged'
                      ? 'bg-red-500/10 border-red-500/30 text-red-900'
                      : focusVeh.status === 'watchlist'
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-900'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900'
                  )}
                >
                  <div className="font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <Icon name="alert-triangle" className="h-3.5 w-3.5" />
                    {focusVeh.status === 'flagged'
                      ? '🚨 Police Flagged Reason:'
                      : focusVeh.status === 'watchlist'
                      ? '⚠️ Watchlist Violation:'
                      : '✅ Verification Status:'}
                  </div>
                  <div className="font-semibold leading-snug">{focusVeh.flaggedReason}</div>
                </div>
              )}

              {/* Step-by-Step Road Journey Legs */}
              <div className="mt-3 flex flex-col gap-2 border-t border-clay/25 pt-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-dusk">
                  Sequential Observation Path ({focusVeh.journey.length} Checkpoints):
                </span>

                <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pr-1">
                  {focusVeh.journey.map((evt, idx) => {
                    const c = camById(evt.cam);
                    return (
                      <div key={idx} className="flex items-start gap-2.5 text-[12px]">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-dusk text-[10px] font-bold text-cream">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <div className="font-bold text-ink">{c?.name || evt.loc}</div>
                          <div className="text-[11px] text-mauve/85">
                            {evt.t} · {evt.speed} km/h · {evt.dir}
                          </div>
                          {idx < focusVeh.journey.length - 1 && (
                            <div className="mt-1 rounded bg-cream/80 p-1 text-[10px] text-ink/90 border border-clay/20">
                              <span className="font-bold text-blue-700">➜ AI Primary Path:</span> Road Corridor to {focusVeh.journey[idx + 1].cam}
                              <br />
                              <span className="font-bold text-purple-700">⤹ Feasible Branch:</span> Parallel Radial Route
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <Btn size="sm" variant="solid" className="mt-4 w-full" icon="car" onClick={() => app.nav({ page: 'vehicles', vehicleId: focusVeh.id })}>
              Open Full Vehicle Dossier
            </Btn>
          </Card>
        )}

        {/* Column 2: Operational Sector Directory (Quick Area Selector) */}
        <Card className="p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <Kicker>Operational Sectors Directory</Kicker>
              <Badge tone="neutral">{SECTORS.length} Sectors</Badge>
            </div>
            <p className="mt-1 text-[12px] text-mauve/80">Select any municipal sector to focus cameras and filter vehicles:</p>
            <div className="mt-3 flex flex-col gap-2">
              {SECTORS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectSector(s.id)}
                  className={cx(
                    'flex items-center justify-between rounded-xl p-2.5 text-left text-[13px] font-semibold transition border',
                    selectedSector === s.id
                      ? 'border-dusk bg-dusk text-cream font-bold shadow-sm'
                      : 'border-clay/25 hover:border-dusk/40 hover:bg-sand/35 text-ink'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon name="map" className="h-4 w-4 shrink-0 opacity-80" />
                    <span className="truncate">{s.name}</span>
                  </div>
                  <span className={cx('text-[11px] shrink-0 font-bold', selectedSector === s.id ? 'text-sand' : 'text-mauve')}>
                    {s.camCount} Cameras
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => handleSelectSector('all')}
            className="mt-3 w-full rounded-lg border border-clay/35 bg-cream/70 py-2 text-[12px] font-bold text-ink hover:bg-sand/40 transition text-center"
          >
            Reset to Tactical Grid
          </button>
        </Card>

        {/* Column 3: Inter-Camera Speed Trap Radar & Anomaly Detector */}
        <div className="flex flex-col gap-4">
          <Card className="border-clay/30 bg-sand/45 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <Kicker>Point-to-Point Speed Trap Radar</Kicker>
                <Badge tone={speedResult?.isViolation ? 'critical' : 'good'}>
                  {speedResult?.statusLabel || 'Active'}
                </Badge>
              </div>
              <p className="mt-1 text-[11.5px] text-mauve/80">
                Calculates average velocity over shortest road corridor between any 2 camera sightings:
              </p>

              {/* Camera Sightings & Time Inputs */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-[11.5px]">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-mauve mb-1">1. Entry Camera</label>
                  <select
                    value={speedSourceCam}
                    onChange={(e) => setSpeedSourceCam(e.target.value)}
                    className="w-full rounded-lg border border-clay/35 bg-cream p-1.5 text-[11px] font-bold text-ink outline-none"
                  >
                    {CAMERAS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} ({c.district})
                      </option>
                    ))}
                  </select>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-[10px] text-mauve">Time:</span>
                    <input
                      type="text"
                      value={speedSourceTime}
                      onChange={(e) => setSpeedSourceTime(e.target.value)}
                      placeholder="08:45"
                      className="w-full rounded border border-clay/30 bg-cream px-1.5 py-0.5 text-[11px] font-mono font-bold text-ink"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-mauve mb-1">2. Exit Camera</label>
                  <select
                    value={speedTargetCam}
                    onChange={(e) => setSpeedTargetCam(e.target.value)}
                    className="w-full rounded-lg border border-clay/35 bg-cream p-1.5 text-[11px] font-bold text-ink outline-none"
                  >
                    {CAMERAS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} ({c.district})
                      </option>
                    ))}
                  </select>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-[10px] text-mauve">Time:</span>
                    <input
                      type="text"
                      value={speedTargetTime}
                      onChange={(e) => setSpeedTargetTime(e.target.value)}
                      placeholder="08:47"
                      className="w-full rounded border border-clay/30 bg-cream px-1.5 py-0.5 text-[11px] font-mono font-bold text-ink"
                    />
                  </div>
                </div>
              </div>

              {/* Speed Limit Selector */}
              <div className="mt-2.5 flex items-center justify-between rounded-lg bg-cream/80 p-2 border border-clay/20 text-[11px]">
                <span className="font-bold text-ink">Corridor Speed Limit:</span>
                <div className="flex items-center gap-1">
                  {[30, 50, 60].map((lim) => (
                    <button
                      key={lim}
                      onClick={() => setSpeedLimit(lim)}
                      className={cx(
                        'rounded px-2 py-0.5 text-[10.5px] font-bold transition',
                        speedLimit === lim ? 'bg-dusk text-cream' : 'border border-clay/30 bg-cream text-mauve'
                      )}
                    >
                      {lim} km/h
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculated Speed Trap Results */}
              {speedResult && (
                <div className="mt-3 rounded-xl border border-clay/30 bg-cream p-3 shadow-inner">
                  <div className="grid grid-cols-3 gap-2 text-center text-[10.5px]">
                    <div className="rounded-lg bg-sand/35 p-1.5">
                      <div className="text-mauve text-[9.5px]">Shortest Road Dist</div>
                      <div className="font-bold text-[13px] text-ink">{speedResult.shortestRoadDistanceKm} km</div>
                    </div>
                    <div className="rounded-lg bg-sand/35 p-1.5">
                      <div className="text-mauve text-[9.5px]">Transit Duration</div>
                      <div className="font-bold text-[13px] text-ink">{speedResult.elapsedDurationStr}</div>
                    </div>
                    <div
                      className={cx(
                        'rounded-lg p-1.5 text-white',
                        speedResult.isViolation ? 'bg-red-600' : 'bg-emerald-600'
                      )}
                    >
                      <div className="text-white/80 text-[9.5px]">Section Avg Speed</div>
                      <div className="font-bold text-[13px]">{speedResult.calculatedSpeedKmh} km/h</div>
                    </div>
                  </div>

                  <div className="mt-2 text-[11px] text-slate-700 leading-snug">
                    {speedResult.summary}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-3 flex items-center gap-2">
              <Btn
                size="sm"
                variant="soft"
                className="flex-1 text-[11.5px]"
                icon="map"
                onClick={() => {
                  if (speedResult && mapInstanceRef.current) {
                    const cA = speedResult.fromCam;
                    const cB = speedResult.toCam;
                    const b = L.latLngBounds([[cA.lat, cA.lng], [cB.lat, cB.lng]]);
                    mapInstanceRef.current.fitBounds(b, { padding: [50, 50] });
                    app.toast(`Inspecting corridor ${cA.code} ➔ ${cB.code} (${speedResult.shortestRoadDistanceKm} km)`);
                  }
                }}
              >
                Focus Corridor
              </Btn>
              <Btn
                size="sm"
                variant={speedResult?.isViolation ? 'danger' : 'solid'}
                className="flex-1 text-[11.5px]"
                icon="shield"
                onClick={() => {
                  if (speedResult) {
                    app.toast(
                      speedResult.isViolation
                        ? `🚨 Automated E-Challan Dispatched for ${speedResult.plate} (${speedResult.calculatedSpeedKmh} km/h in ${speedResult.speedLimitKmh} km/h zone)`
                        : `Verified compliant average speed for ${speedResult.plate}`
                    );
                  }
                }}
              >
                {speedResult?.isViolation ? 'Issue E-Challan' : 'Verify Speed Log'}
              </Btn>
            </div>
          </Card>

          {/* Incident & Violation Live Queue */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <Kicker>Active Incidents & Alerts</Kicker>
              <Badge tone="critical">{app.alerts.filter((a) => a.status === 'open').length}</Badge>
            </div>
            <div className="mt-2 flex flex-col">
              {app.alerts.filter((a) => a.status === 'open').slice(0, 3).map((a) => (
                <button key={a.id} onClick={() => app.nav({ page: 'alerts', alertId: a.id, statusFilter: 'open' })} className="hit items-start">
                  <span className={cx('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', a.severity === 'critical' ? 'bg-ink' : 'bg-mauve')} />
                  <span className="flex-1 truncate text-[13px] font-semibold text-ink/90">{a.title}</span>
                  <span className="text-[12px] font-semibold text-mauve/70">{timeAgo(a.minsAgo)}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}