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
import { api } from '../services/api';
import { HOSPITALS, findNearestHospital, type Hospital, type NearestHospitalResult } from '../data/hospitals';
import { OFFICIAL_SAVED_AMBULANCE, OFFICIAL_AMBULANCE_HOSPITAL, type OfficialAmbulance } from '../data/officialAmbulance';
import {
  CONGESTION_NODES,
  CONGESTED_ARTERIES,
  getCongestionColor,
  type CongestionNode,
  type CongestedArtery,
} from '../data/congestionHeatmap';

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
    corridors: false,
    distances: false,
    journey: true,
    altRoutes: false,
    alerts: true,
    congestion: false,
  });

  const [mapReady, setMapReady] = useState(false);
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedTimeSlice, setSelectedTimeSlice] = useState<string>('all');
  const [stateFilter, setStateFilter] = useState<'all' | 'DL' | 'HR' | 'UP'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [camSearchQuery, setCamSearchQuery] = useState('');
  const [camStatusFilter, setCamStatusFilter] = useState<'all' | 'flagged' | 'watchlist' | 'clear'>('all');
  const [congestionSeverityFilter, setCongestionSeverityFilter] = useState<'all' | 'critical'>('all');
  const [showArteriesHeat, setShowArteriesHeat] = useState<boolean>(true);
  const [inspectedLoc, setInspectedLoc] = useState<{
    lat: number;
    lng: number;
    nearestCam?: string;
    distanceMeters?: number;
    time: string;
  } | null>(null);

  const [selCamId, setSelCamId] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(() => {
    if (app.target.mapVehicle) return app.target.mapVehicle;
    if (app.target.vehicleId) return app.target.vehicleId;
    if (typeof window !== 'undefined') {
      const rawHash = window.location.hash.replace('#', '');
      const queryIdx = rawHash.indexOf('?');
      if (queryIdx !== -1) {
        const p = new URLSearchParams(rawHash.slice(queryIdx + 1));
        const veh = p.get('vehicle') || p.get('plate') || p.get('mapVehicle');
        if (veh) return veh;
      }
      const p2 = new URLSearchParams(window.location.search);
      const veh2 = p2.get('vehicle') || p2.get('plate') || p2.get('mapVehicle');
      if (veh2) return veh2;
    }
    return app.vehicles[0]?.id || '';
  });
  const [dynamicVehicles, setDynamicVehicles] = useState<Record<string, Vehicle>>({});
  const [activeEmergencyHospital, setActiveEmergencyHospital] = useState<{
    hospital: Hospital;
    distanceMeters: number;
    etaMinutes: number;
    ambulancePlate: string;
    patientCondition?: string;
    model?: string;
    driver?: string;
    evidenceImage?: string;
    plateCrop?: string;
  } | null>(null);

  const handleSelectOfficialAmbulance = () => {
    const ambVeh =
      app.vehicles.find(
        (v) =>
          v.plate.toUpperCase().replace(/[^A-Z0-9]/g, '') === 'DL01AMB9911' ||
          v.type === 'Ambulance' ||
          v.id === OFFICIAL_SAVED_AMBULANCE.id
      ) || OFFICIAL_SAVED_AMBULANCE;

    setDynamicVehicles((prev) => ({
      ...prev,
      [ambVeh.id]: ambVeh,
      [ambVeh.plate]: ambVeh,
      'DL01AMB9911': ambVeh,
    }));
    setSelectedVehicleId(ambVeh.id);
    app.nav({ page: 'map', mapVehicle: ambVeh.plate, vehicleId: ambVeh.id });
    setLayers((l) => ({ ...l, journey: true }));
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([28.6380, 77.2980], 13.5, { duration: 0.8 });
    }
    app.toast(`🚨 Emergency Green Corridor: ${ambVeh.plate} ➔ Max Super Speciality Hospital`);
  };

  // Map the official verified ambulance so it is always immediately accessible
  useEffect(() => {
    setDynamicVehicles((prev) => ({
      ...prev,
      [OFFICIAL_SAVED_AMBULANCE.id]: OFFICIAL_SAVED_AMBULANCE,
      [OFFICIAL_SAVED_AMBULANCE.plate]: OFFICIAL_SAVED_AMBULANCE,
      'DL01AMB9911': OFFICIAL_SAVED_AMBULANCE,
    }));
  }, []);

  // Sync selected vehicle when arriving from upload portal, search page, or live vehicles update
  useEffect(() => {
    const targetVal = app.target.mapVehicle || app.target.vehicleId;
    if (targetVal) {
      const cleanTarget = targetVal.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const match = app.vehicles.find(
        (v) => v.plate.toUpperCase().replace(/[^A-Z0-9]/g, '') === cleanTarget || v.id === targetVal || v.plate === targetVal
      );
      if (match) {
        setSelectedVehicleId(match.id);
      } else {
        setSelectedVehicleId(targetVal);
      }
    } else if (app.vehicles.length > 0 && (!selectedVehicleId || selectedVehicleId === 'v1')) {
      setSelectedVehicleId(app.vehicles[0].id);
    }
  }, [app.target.mapVehicle, app.target.vehicleId, app.vehicles]);

  // Fetch live journey history from backend whenever selected vehicle changes
  useEffect(() => {
    const targetPlate = selectedVehicleId || app.target.mapVehicle || app.target.vehicleId;
    if (!targetPlate || targetPlate === 'v1') return;

    let isSubscribed = true;

    const fetchJourney = async () => {
      try {
        const journeyData = await api.getVehicleHistory(targetPlate).catch(() => null);
        if (!isSubscribed || !journeyData) return;

        if (journeyData.observation_stops && journeyData.observation_stops.length > 0) {
          const stops = journeyData.observation_stops;
          const latestStop = stops[stops.length - 1];
          const plateText = journeyData.plate || targetPlate;
          const cleanPlate = plateText.toUpperCase().replace(/[^A-Z0-9]/g, '');

          const isAmb =
            plateText.toUpperCase().includes('AMB') ||
            targetPlate.toUpperCase().includes('AMB') ||
            cleanPlate === 'DL01AMB9911' ||
            targetPlate === OFFICIAL_SAVED_AMBULANCE.id;

          const vehicleObj: Vehicle = {
            id: isAmb ? OFFICIAL_SAVED_AMBULANCE.id : `live-${plateText}`,
            plate: isAmb ? OFFICIAL_SAVED_AMBULANCE.plate : plateText,
            make: isAmb ? OFFICIAL_SAVED_AMBULANCE.make : 'Vehicle',
            model: isAmb ? OFFICIAL_SAVED_AMBULANCE.model : 'Tracked',
            color: isAmb ? OFFICIAL_SAVED_AMBULANCE.color : 'Titanium Grey',
            type: isAmb ? 'Ambulance' : 'Sedan',
            owner: isAmb ? OFFICIAL_SAVED_AMBULANCE.owner : 'Registered Citizen',
            license: isAmb ? OFFICIAL_SAVED_AMBULANCE.license : `DL-REG-${cleanPlate.slice(-4) || '2026'}`,
            status: isAmb ? 'flagged' : (stops.some((s) => s.status.includes('Match') || s.status.includes('Alert')) ? 'flagged' : 'clear'),
            flaggedReason: isAmb ? OFFICIAL_SAVED_AMBULANCE.flaggedReason : undefined,
            speed: Math.round(journeyData.average_speed_kmh || latestStop.estimated_speed_kmh || 35),
            lastCam: latestStop.camera_id,
            lastSeen: 'just now',
            kmToday: Math.round(journeyData.total_distance_km || stops.length * 4),
            tags: isAmb ? OFFICIAL_SAVED_AMBULANCE.tags : ['live-database', 'trajectory'],
            journey: stops.map((s, idx) => {
              const camObj = camById(s.camera_id);
              const tStr = new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return {
                t: tStr,
                cam: s.camera_id,
                loc: s.location_address || camObj?.name || s.camera_id,
                speed: Math.round(s.estimated_speed_kmh || 30 + (idx * 2)),
                dir: camObj?.heading?.split(' ')[0] || 'Northbound',
                note: isAmb && idx === stops.length - 1
                  ? 'Terminal CCTV Sighting: Approaching Max Hospital Entrance'
                  : `Stop #${s.stop_number} · ${s.status}`,
              };
            }),
            road: 0,
            prog: 0.5,
            dir: 1,
          };

          setDynamicVehicles((prev) => ({
            ...prev,
            [targetPlate]: vehicleObj,
            [plateText]: vehicleObj,
            [cleanPlate]: vehicleObj,
            [`live-${plateText}`]: vehicleObj,
          }));
        }
      } catch (err) {
        console.warn('Could not fetch backend vehicle journey:', err);
      }
    };

    fetchJourney();

    return () => {
      isSubscribed = false;
    };
  }, [selectedVehicleId, app.target.mapVehicle, app.target.vehicleId]);

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

  // Filter vehicles by Sector, Time Slice, and State (merges database vehicles with dynamic/random ambulances)
  const filteredVehicles = useMemo(() => {
    const curSlice = TIMELINE_SLICES_DEF.find((s) => s.id === selectedTimeSlice) || TIMELINE_SLICES_DEF[0];
    const sec = SECTORS.find((s) => s.id === selectedSector);

    // Merge dynamic vehicles + ensure saved official ambulance is readily available
    const allVehs = [...app.vehicles];
    const existingIds = new Set(allVehs.map((v) => v.id));
    const existingPlates = new Set(allVehs.map((v) => v.plate.toUpperCase().replace(/[^A-Z0-9]/g, '')));
    if (!existingPlates.has('DL01AMB9911') && !existingIds.has(OFFICIAL_SAVED_AMBULANCE.id)) {
      allVehs.unshift(OFFICIAL_SAVED_AMBULANCE);
      existingIds.add(OFFICIAL_SAVED_AMBULANCE.id);
    }
    Object.values(dynamicVehicles).forEach((dv) => {
      if (!existingIds.has(dv.id)) {
        allVehs.unshift(dv);
        existingIds.add(dv.id);
      }
    });

    return allVehs.filter((v) => {
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
    if (selectedVehicleId) {
      if (dynamicVehicles[selectedVehicleId]) return dynamicVehicles[selectedVehicleId];
      const cleanId = selectedVehicleId.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (cleanId && dynamicVehicles[cleanId]) return dynamicVehicles[cleanId];

      const found = app.vehicles.find(
        (v) =>
          v.id === selectedVehicleId ||
          v.plate === selectedVehicleId ||
          (cleanId && v.plate.toUpperCase().replace(/[^A-Z0-9]/g, '') === cleanId)
      );
      if (found) return found;
    }
    return filteredVehicles[0] || app.vehicles[0];
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
      const isAmbulance = focusVeh.type === 'Ambulance' || 
                          focusVeh.flaggedReason?.toLowerCase().includes('ambulance') || 
                          focusVeh.tags?.includes('ambulance-corridor') ||
                          focusVeh.plate.toUpperCase().includes('AMB');

      const routeColor = isAmbulance 
        ? '#10B981' 
        : focusVeh.status === 'watchlist' 
        ? '#D97706' 
        : focusVeh.status === 'flagged' 
        ? '#DC2626' 
        : '#2563EB';

      // If vehicle is an ambulance, calculate the nearest receiving hospital and extend route to it
      let effectiveRouteCoords = [...stopCoords];
      let nearestHospResult: NearestHospitalResult | null = null;

      if (isAmbulance) {
        // Permanent saved hospital destination: Max Super Speciality Hospital, Patparganj
        const destHospital = OFFICIAL_AMBULANCE_HOSPITAL;
        effectiveRouteCoords = [...stopCoords, [destHospital.lat, destHospital.lng]];

        setActiveEmergencyHospital({
          hospital: destHospital,
          distanceMeters: 1420,
          etaMinutes: 3,
          ambulancePlate: focusVeh.plate,
          patientCondition: (focusVeh as any).patientCondition || 'Acute Cardiac Emergency (Golden Hour Protocol)',
          model: `${focusVeh.make} ${focusVeh.model}`,
          driver: (focusVeh as any).driverName || 'Rajesh Kumar (CATS Pilot Unit 4)',
          evidenceImage: (focusVeh as any).evidenceImage || '/static/evidence/frame_CAM-KN-08_ac25fcfada60_0.jpg',
          plateCrop: (focusVeh as any).plateCrop || '/static/evidence/plate_CAM-KN-08_ac25fcfada60_0.jpg',
        });

        // Add prominent hospital destination marker on the map
        const hospitalIcon = L.divIcon({
          className: 'custom-hospital-destination-pin',
          html: `
            <div style="
              display: flex;
              flex-direction: column;
              align-items: center;
              position: relative;
              cursor: pointer;
            ">
              <div style="
                position: absolute;
                top: -8px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                border: 2.5px solid #EF4444;
                opacity: 0.85;
                animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
              "></div>
              <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                width: 42px;
                height: 42px;
                border-radius: 50%;
                background: #DC2626;
                border: 3px solid #FFFFFF;
                box-shadow: 0 4px 16px rgba(220,38,38,0.7);
                color: #FFFFFF;
                font-size: 20px;
                z-index: 15;
              ">
                🏥
              </div>
              <div style="
                background: #0F172A;
                color: #FFFFFF;
                font-size: 10px;
                font-family: system-ui, sans-serif;
                font-weight: 800;
                padding: 3px 8px;
                border-radius: 6px;
                margin-top: 4px;
                white-space: nowrap;
                border: 1.5px solid #F87171;
                box-shadow: 0 3px 10px rgba(0,0,0,0.5);
              ">
                🏥 ${destHospital.name.split('(')[0].trim()}
              </div>
              <div style="
                background: #10B981;
                color: #FFFFFF;
                font-size: 9px;
                font-weight: 900;
                padding: 1.5px 6px;
                border-radius: 4px;
                margin-top: 2px;
                white-space: nowrap;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              ">
                🚨 ETA: ~3m · 1.4 km
              </div>
            </div>
          `,
          iconSize: [220, 72],
          iconAnchor: [110, 24]
        });

        const hospMarker = L.marker([destHospital.lat, destHospital.lng], { icon: hospitalIcon });
        hospMarker.bindPopup(`
          <div style="font-family: system-ui, sans-serif; padding: 6px; min-width: 270px;">
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 10px; font-weight: 900; color: #DC2626; text-transform: uppercase;">
              <span>🏥 Emergency Receiving Hospital</span>
              <span style="background: #FEF2F2; color: #DC2626; border: 1px solid #FCA5A5; padding: 1px 6px; border-radius: 4px;">24/7 TRAUMA DESK</span>
            </div>
            <div style="font-size: 15px; font-weight: 900; color: #0F172A; margin-top: 4px; line-height: 1.25;">
              ${destHospital.name}
            </div>
            <div style="font-size: 11px; color: #64748B; margin-top: 2px;">
              📍 ${destHospital.address}
            </div>
            
            <div style="margin-top: 8px; background: #ECFDF5; border: 1.5px solid #A7F3D0; border-radius: 6px; padding: 6px 8px;">
              <div style="font-size: 11px; font-weight: 800; color: #065F46; display: flex; align-items: center; justify-content: space-between;">
                <span>🚑 Incoming: ${focusVeh.plate}</span>
                <span style="background: #10B981; color: #FFFFFF; padding: 1px 5px; border-radius: 4px; font-size: 9.5px;">ACTIVE CORRIDOR</span>
              </div>
              <div style="font-size: 10.5px; color: #047857; margin-top: 2px;">
                Transit Distance: <strong>1.4 km</strong> · Est. Arrival: <strong>~3 minutes</strong>
              </div>
            </div>

            <div style="margin-top: 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 10.5px;">
              <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 4px 6px; border-radius: 4px;">
                <span style="color: #64748B; display: block; font-size: 9px; font-weight: 700;">EMERGENCY LINE</span>
                <strong style="color: #0F172A;">${destHospital.emergencyPhone}</strong>
              </div>
              <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 4px 6px; border-radius: 4px;">
                <span style="color: #64748B; display: block; font-size: 9px; font-weight: 700;">TOTAL CAPACITY</span>
                <strong style="color: #0F172A;">${destHospital.totalBeds} Beds</strong>
              </div>
            </div>

            <div style="margin-top: 8px; font-size: 10px; font-weight: 700; color: #059669; background: #D1FAE5; padding: 4px 6px; border-radius: 4px; display: flex; align-items: center; gap: 4px;">
              <span>🟢</span>
              <span>Municipal Traffic Signal Preemption Active for this Corridor</span>
            </div>
          </div>
        `);
        journeyLayerRef.current.addLayer(hospMarker);
      } else {
        setActiveEmergencyHospital(null);
      }

      // Check if vehicle observations span across at least 2 distinct camera locations
      const hasMultipleLocations = stopCoords.some((pt, i) => {
        if (i === 0) return false;
        const first = stopCoords[0];
        return Math.abs(pt[0] - first[0]) > 0.0001 || Math.abs(pt[1] - first[1]) > 0.0001;
      });

      // SINGLE CAMERA LOCATION for non-ambulance vehicles:
      if (!isAmbulance && !hasMultipleLocations) {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo(stopCoords[0], 15, { duration: 0.6 });
        }

        const primaryStop = stopData[0];
        const isWatch = focusVeh.status !== 'clear';
        const sightingCount = stopData.length;

        const singleStopIcon = L.divIcon({
          className: 'custom-journey-stop',
          html: `
            <div style="
              display: flex;
              flex-direction: column;
              align-items: center;
              position: relative;
            ">
              <div style="
                position: absolute;
                top: -6px;
                width: 46px;
                height: 46px;
                border-radius: 50%;
                border: 2px solid ${isWatch ? '#DC2626' : '#2563EB'};
                opacity: 0.8;
                animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
              "></div>
              <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: ${isWatch ? '#DC2626' : '#1E293B'};
                border: 2.5px solid #FFFFFF;
                box-shadow: 0 4px 14px rgba(0,0,0,0.45);
                color: #FFFFFF;
                font-family: monospace;
                font-size: 16px;
                font-weight: 900;
                z-index: 10;
              ">
                📍
              </div>
              <div style="
                background: #0F172A;
                color: #FFFFFF;
                font-size: 9.5px;
                font-family: system-ui, sans-serif;
                font-weight: 700;
                padding: 2.5px 7px;
                border-radius: 4px;
                margin-top: 3px;
                white-space: nowrap;
                border: 1px solid #CBD5E1;
                box-shadow: 0 2px 8px rgba(0,0,0,0.35);
              ">
                ${sightingCount > 1 ? `${sightingCount} Sightings at ${primaryStop.cam.code}` : `Single Sighting: ${primaryStop.cam.code}`}
              </div>
            </div>
          `,
          iconSize: [160, 58],
          iconAnchor: [80, 22]
        });

        const singleMarker = L.marker([primaryStop.cam.lat, primaryStop.cam.lng], { icon: singleStopIcon });
        singleMarker.bindPopup(`
          <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 240px;">
            <div style="font-size: 10px; font-weight: 800; color: #D97706; text-transform: uppercase; display: flex; align-items: center; justify-content: space-between;">
              <span>📍 ${sightingCount > 1 ? `${sightingCount} SIGHTINGS AT THIS NODE` : 'SINGLE CAMERA OBSERVATION'}</span>
            </div>
            <div style="font-size: 14px; font-weight: 800; color: #1E293B; margin-top: 3px;">
              ${focusVeh.plate} (${focusVeh.make} ${focusVeh.model})
            </div>
            <div style="font-size: 11px; color: #64748B; margin-top: 2px;">
              ${primaryStop.cam.code}: ${primaryStop.cam.name}
            </div>
            <div style="font-size: 11px; color: #334155; margin-top: 4px; background: #F1F5F9; padding: 4px 6px; border-radius: 4px;">
              Passage Times: <strong>${stopData.map((s) => s.time).join(', ')}</strong>
            </div>
            <div style="font-size: 10.5px; color: #64748B; margin-top: 5px; background: #FFFBEB; border: 1px solid #FDE68A; padding: 4px 6px; border-radius: 5px; line-height: 1.35;">
              ℹ️ <strong>Single Camera Location.</strong> All sightings of this vehicle are at ${primaryStop.cam.code}.
            </div>
          </div>
        `);
        journeyLayerRef.current.addLayer(singleMarker);

      } else {
        // MULTI-CAMERA / EMERGENCY HOSPITAL ROUTE:
        // 1. Immediately render direct polyline and fit map bounds so user sees route immediately
        const initialPolyline = L.polyline(effectiveRouteCoords, {
          color: routeColor,
          weight: isAmbulance ? 5.5 : 4,
          opacity: 0.9,
          dashArray: isAmbulance ? '10, 6' : '6, 8',
          lineCap: 'round',
          lineJoin: 'round'
        });
        journeyLayerRef.current.addLayer(initialPolyline);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.fitBounds(L.latLngBounds(effectiveRouteCoords), { padding: [55, 55], maxZoom: 15 });
        }

        // Ambulance Green Corridor ambient glow casing
        if (isAmbulance) {
          const ambCasing = L.polyline(effectiveRouteCoords, {
            color: '#10B981',
            weight: 15,
            opacity: 0.4,
            lineCap: 'round',
            lineJoin: 'round'
          });
          journeyLayerRef.current.addLayer(ambCasing);
        }

        // 2. Render AI Feasible Alternative Transit Corridors if enabled
        if (layers.altRoutes && stopCoords.length >= 2) {
          for (let i = 0; i < stopCoords.length - 1; i++) {
            const ptA = stopCoords[i];
            const ptB = stopCoords[i + 1];

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

        // 3. True Road Snapping via OSRM (enhancement with graceful fallback)
        const coordsQuery = effectiveRouteCoords.map(([lat, lng]) => `${lng},${lat}`).join(';');
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordsQuery}?overview=full&geometries=geojson`;

        fetch(osrmUrl)
          .then((res) => res.json())
          .then((data) => {
            if (data.code === 'Ok' && data.routes && data.routes[0]?.geometry?.coordinates) {
              const roadCoordinates: [number, number][] = data.routes[0].geometry.coordinates.map(
                ([lng, lat]: [number, number]) => [lat, lng]
              );

              if (journeyLayerRef.current) {
                journeyLayerRef.current.removeLayer(initialPolyline);

                // Ambient Route Glow
                const casingLine = L.polyline(roadCoordinates, {
                  color: routeColor,
                  weight: isAmbulance ? 12 : 8,
                  opacity: isAmbulance ? 0.45 : 0.3,
                  lineCap: 'round',
                  lineJoin: 'round'
                });
                journeyLayerRef.current.addLayer(casingLine);

                // Solid Tactical Primary Road Line
                const roadPolyline = L.polyline(roadCoordinates, {
                  color: routeColor,
                  weight: isAmbulance ? 5.5 : 4.5,
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
          });

        // 4. Draw Waypoint Badges for each stop in sequence
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
                background: ${isAmbulance ? '#10B981' : isWatch ? '#DC2626' : '#1E293B'};
                border: 2px solid #FFFFFF;
                box-shadow: 0 3px 8px rgba(0,0,0,0.35);
                color: #FFFFFF;
                font-family: monospace;
                font-size: 12px;
                font-weight: 800;
              ">
                ${isAmbulance ? '🚑' : stop.stopNum}
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });

          const stopMarker = L.marker([stop.cam.lat, stop.cam.lng], { icon: stopMarkerIcon });
          stopMarker.bindPopup(`
            <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 230px;">
              <div style="font-size: 10px; font-weight: 800; color: ${isAmbulance ? '#059669' : '#D97706'}; text-transform: uppercase; display: flex; align-items: center; justify-content: space-between;">
                <span>Stop #${stop.stopNum} · ${stop.time}</span>
                ${isAmbulance ? '<span style="background: #10B98125; color: #059669; padding: 1px 5px; border-radius: 4px; font-weight: 900;">🚨 PRIORITY AMBULANCE</span>' : ''}
              </div>
              <div style="font-size: 14px; font-weight: 800; color: #1E293B; margin-top: 3px;">
                ${focusVeh.plate} (${focusVeh.make} ${focusVeh.model})
              </div>
              <div style="font-size: 11px; color: #64748B; margin-top: 2px;">
                ${stop.cam.code}: ${stop.cam.name}
              </div>
              <div style="font-size: 11px; color: #334155; margin-top: 4px; background: #F1F5F9; padding: 4px 6px; border-radius: 4px;">
                Recorded Speed: <strong>${stop.speed} km/h</strong> · Time: <strong>${stop.time}</strong>
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
    }
  }, [mapReady, layers.journey, layers.altRoutes, focusVeh]);

  // Render Premium Tactical Congestion Heatmap Layer
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !hotspotsLayerRef.current) return;
    hotspotsLayerRef.current.clearLayers();

    if (!layers.congestion) return;

    // 1. Render Congested Artery Corridors (Flow Ribbons)
    if (showArteriesHeat) {
      CONGESTED_ARTERIES.forEach((art) => {
        const colors = getCongestionColor(art.congestionIndex);

        // Ambient thermal glow ribbon
        const glowRibbon = L.polyline(art.points, {
          color: colors.glow,
          weight: 14,
          opacity: 0.38,
          lineCap: 'round',
          lineJoin: 'round',
        });

        // Crisp tactical core ribbon with moving dashed pattern
        const coreRibbon = L.polyline(art.points, {
          color: colors.core,
          weight: 4.5,
          opacity: 0.95,
          dashArray: '10, 6',
          lineCap: 'round',
          lineJoin: 'round',
        });

        const ribbonTooltip = `
          <div style="font-family: system-ui, sans-serif; padding: 2px;">
            <div style="font-weight: 800; font-size: 11px; color: ${colors.border}; display: flex; align-items: center; gap: 4px;">
              <span>🔥</span>
              <span>${art.name}</span>
            </div>
            <div style="font-size: 10px; color: #475569; margin-top: 2px;">
              Flow: <strong>${art.statusLabel}</strong> · Speed: <strong>${art.avgSpeedKmh} km/h</strong> · Delay: <strong>+${art.delayMins} min</strong>
            </div>
          </div>
        `;

        glowRibbon.bindTooltip(ribbonTooltip, { sticky: true, direction: 'top' });
        coreRibbon.bindTooltip(ribbonTooltip, { sticky: true, direction: 'top' });

        hotspotsLayerRef.current?.addLayer(glowRibbon);
        hotspotsLayerRef.current?.addLayer(coreRibbon);
      });
    }

    // 2. Render Multi-Layer Gaussian Thermal Density Nodes
    const filteredNodes = CONGESTION_NODES.filter((n) => {
      if (congestionSeverityFilter === 'critical') return n.severity === 'critical';
      return true;
    });

    filteredNodes.forEach((node) => {
      const colors = getCongestionColor(node.congestionIndex);

      // Layer A: Outer Ambient Thermal Gradient Aura
      const outerAura = L.circle([node.lat, node.lng], {
        color: colors.glow,
        weight: 1.5,
        opacity: 0.65,
        dashArray: '4, 4',
        fillColor: colors.glow,
        fillOpacity: 0.16,
        radius: node.radiusMeters,
      });

      // Layer B: Mid-Density Thermal Plume
      const midPlume = L.circle([node.lat, node.lng], {
        color: colors.border,
        weight: 1.5,
        opacity: 0.85,
        fillColor: colors.glow,
        fillOpacity: 0.36,
        radius: node.radiusMeters * 0.52,
      });

      // Layer C: High-Intensity Core Plume
      const corePlume = L.circle([node.lat, node.lng], {
        color: colors.core,
        weight: 2,
        opacity: 0.95,
        fillColor: colors.core,
        fillOpacity: 0.68,
        radius: node.coreRadiusMeters,
      });

      // Layer D: Continuous Gaussian Radial Gradient Blur DivIcon
      const blurRadiusPx = node.radiusMeters > 700 ? 160 : 120;
      const gradientIcon = L.divIcon({
        className: 'custom-gaussian-heat-spot',
        html: `
          <div style="
            width: ${blurRadiusPx}px;
            height: ${blurRadiusPx}px;
            border-radius: 50%;
            background: radial-gradient(circle at center, 
              ${colors.core}B3 0%, 
              ${colors.glow}80 38%, 
              ${colors.glow}33 68%, 
              transparent 100%
            );
            filter: blur(8px);
            mix-blend-mode: screen;
            pointer-events: none;
          "></div>
        `,
        iconSize: [blurRadiusPx, blurRadiusPx],
        iconAnchor: [blurRadiusPx / 2, blurRadiusPx / 2],
      });
      const gradientMarker = L.marker([node.lat, node.lng], { icon: gradientIcon, interactive: false });

      // Layer E: Tactical Pulsing Center Beacon & Real-Time Density Pill
      const beaconIcon = L.divIcon({
        className: 'custom-heatmap-tactical-pill',
        html: `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            position: relative;
            transform: scale(1);
            transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
            filter: drop-shadow(0 4px 10px rgba(0,0,0,0.55));
          ">
            <div style="
              position: absolute;
              top: -6px;
              width: 38px;
              height: 38px;
              border-radius: 50%;
              border: 2px solid ${colors.core};
              opacity: 0.85;
              animation: ping 1.7s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
            <div style="
              display: flex;
              align-items: center;
              gap: 4px;
              background: #0F172A;
              border: 1.5px solid ${colors.border};
              box-shadow: 0 0 14px ${colors.glow}80;
              color: #FFFFFF;
              padding: 2.5px 7px;
              border-radius: 9999px;
              font-family: system-ui, -apple-system, sans-serif;
              font-size: 11px;
              font-weight: 800;
              line-height: 1;
              white-space: nowrap;
              z-index: 10;
            ">
              <span style="font-size: 11px;">🔥</span>
              <span>${node.congestionIndex}%</span>
              <span style="color: ${colors.glow}; font-size: 9.5px; font-family: monospace; font-weight: 700;">+${node.delayMins}m</span>
            </div>
            <div style="
              width: 0;
              height: 0;
              border-left: 4px solid transparent;
              border-right: 4px solid transparent;
              border-top: 5px solid ${colors.border};
              margin-top: -1px;
            "></div>
          </div>
        `,
        iconSize: [80, 28],
        iconAnchor: [40, 28],
      });

      const beaconMarker = L.marker([node.lat, node.lng], { icon: beaconIcon });

      // Interactive Luxury Telemetry Popup
      beaconMarker.bindPopup(`
        <div style="font-family: system-ui, -apple-system, sans-serif; padding: 6px; min-width: 290px; color: #0F172A;">
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 10px; font-weight: 900; text-transform: uppercase;">
            <span style="color: ${colors.border}; display: flex; align-items: center; gap: 3px;">
              <span>🔥</span>
              <span>Traffic Heatmap Telemetry</span>
            </span>
            <span style="background: ${colors.border}20; color: ${colors.border}; border: 1px solid ${colors.border}50; padding: 1px 6px; border-radius: 4px; font-size: 9px; font-weight: 800;">
              ${node.severity === 'critical' ? 'LEVEL 3 · CRITICAL GRIDLOCK' : node.severity === 'heavy' ? 'LEVEL 2 · HEAVY CONGESTION' : 'LEVEL 1 · MODERATE'}
            </span>
          </div>

          <div style="font-size: 15px; font-weight: 900; color: #0F172A; margin-top: 4px; line-height: 1.25;">
            ${node.name}
          </div>
          <div style="font-size: 11px; color: #64748B; margin-top: 2px;">
            📍 ${node.district} Sector · Active Sensor Network
          </div>

          <!-- Congestion Index Meter -->
          <div style="margin-top: 8px; background: #F1F5F9; border-radius: 6px; padding: 6px 8px; border: 1px solid #E2E8F0;">
            <div style="display: flex; justify-content: space-between; font-size: 10px; font-weight: 800; margin-bottom: 3px;">
              <span style="color: #475569;">CONGESTION SATURATION</span>
              <span style="color: ${colors.border}; font-weight: 900;">${node.congestionIndex}% CAPACITY</span>
            </div>
            <div style="height: 6px; width: 100%; background: #E2E8F0; border-radius: 9999px; overflow: hidden;">
              <div style="height: 100%; width: ${node.congestionIndex}%; background: linear-gradient(90deg, #F59E0B, ${colors.core}); border-radius: 9999px;"></div>
            </div>
          </div>

          <!-- Real-Time Metrics Grid -->
          <div style="margin-top: 8px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; font-size: 10px; text-align: center;">
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 5px 4px; border-radius: 4px;">
              <span style="color: #64748B; display: block; font-size: 8.5px; font-weight: 700; text-transform: uppercase;">Throughput</span>
              <strong style="color: #0F172A; font-size: 11px;">${node.volumeVehPerHour.toLocaleString()} v/h</strong>
            </div>
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 5px 4px; border-radius: 4px;">
              <span style="color: #64748B; display: block; font-size: 8.5px; font-weight: 700; text-transform: uppercase;">Avg Speed</span>
              <strong style="color: ${node.avgSpeedKmh < 15 ? '#DC2626' : '#D97706'}; font-size: 11px;">${node.avgSpeedKmh} km/h</strong>
            </div>
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 5px 4px; border-radius: 4px;">
              <span style="color: #64748B; display: block; font-size: 8.5px; font-weight: 700; text-transform: uppercase;">Est. Delay</span>
              <strong style="color: #DC2626; font-size: 11px;">+${node.delayMins} min</strong>
            </div>
          </div>

          <!-- Root Cause -->
          <div style="margin-top: 8px; font-size: 10.5px; color: #78350F; background: #FFFBEB; border: 1px solid #FDE68A; padding: 5px 7px; border-radius: 4px; line-height: 1.35;">
            <strong style="color: #92400E;">⚠️ Primary Bottleneck:</strong> ${node.bottleneckReason}
          </div>

          <!-- Recommended Detour Advisory -->
          <div style="margin-top: 6px; font-size: 10.5px; color: #065F46; background: #ECFDF5; border: 1px solid #A7F3D0; padding: 5px 7px; border-radius: 4px; line-height: 1.35;">
            <strong style="color: #065F46;">➜ Recommended Bypass:</strong> ${node.recommendedDetour}
          </div>
        </div>
      `);

      hotspotsLayerRef.current?.addLayer(outerAura);
      hotspotsLayerRef.current?.addLayer(midPlume);
      hotspotsLayerRef.current?.addLayer(corePlume);
      hotspotsLayerRef.current?.addLayer(gradientMarker);
      hotspotsLayerRef.current?.addLayer(beaconMarker);
    });
  }, [mapReady, layers.congestion, showArteriesHeat, congestionSeverityFilter]);

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
          {(Object.keys(layers) as (keyof typeof layers)[]).map((k) => {
            const isCongestion = k === 'congestion';
            return (
              <button
                key={k}
                onClick={() => toggle(k)}
                className={cx(
                  'rounded-full border px-3 py-1.5 text-[12px] font-bold capitalize transition-all duration-150 active:scale-95 flex items-center gap-1.5 cursor-pointer',
                  isCongestion
                    ? layers[k]
                      ? 'border-amber-400 bg-gradient-to-r from-amber-500/30 to-orange-500/30 text-amber-200 shadow-[0_0_16px_rgba(245,158,11,0.4)] ring-1 ring-amber-400 font-black'
                      : 'border-amber-500/40 bg-amber-500/10 text-amber-400 hover:border-amber-400 hover:bg-amber-500/20 hover:text-amber-200'
                    : layers[k]
                    ? 'border-sand/50 bg-sand/20 text-sand'
                    : 'border-cream/15 text-sand/70 hover:border-cream/30 hover:bg-cream/10 hover:text-cream'
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
                  : isCongestion
                  ? '🔥 Congestion Heatmap'
                  : k}
              </button>
            );
          })}
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

          {/* Quick Select Cards for Detected Cars in Window + Official Saved Emergency Ambulance */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {/* Quick Select Dedicated Official Emergency Ambulance Button */}
            <button
              type="button"
              onClick={handleSelectOfficialAmbulance}
              className={cx(
                'flex shrink-0 items-center gap-2.5 rounded-xl border-2 px-3.5 py-1.5 text-left transition-all active:scale-95 shadow-md cursor-pointer',
                (focusVeh?.type === 'Ambulance' || focusVeh?.plate.toUpperCase().includes('AMB'))
                  ? 'border-emerald-400 bg-emerald-700 text-white shadow-lg ring-2 ring-emerald-400'
                  : 'border-emerald-600 bg-emerald-600 hover:bg-emerald-700 text-white'
              )}
              title="Official CATS Emergency Ambulance with locked corridor route to Max Super Speciality Hospital"
            >
              <span className="text-xl">🚑</span>
              <div>
                <div className="font-display text-[12px] font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                  <span>DL-01-AMB-9911</span>
                  <span className="bg-white/25 text-[9px] px-1.5 py-0.2 rounded font-mono font-bold">EMERGENCY CORRIDOR</span>
                </div>
                <div className="text-[10px] font-semibold text-emerald-100 flex items-center gap-1">
                  <span>🔒 Route to Max Hospital (Saved)</span>
                </div>
              </div>
            </button>

            {filteredVehicles.map((v) => {
              const isSel = v.id === selectedVehicleId || v.plate === selectedVehicleId;
              const uniqueCams = new Set(v.journey.map((e) => e.cam)).size;
              const isAmb = v.type === 'Ambulance';
              const camCountLabel =
                uniqueCams === 1
                  ? `1 Camera · ${v.journey.length} sighting${v.journey.length > 1 ? 's' : ''}`
                  : `${uniqueCams} Cameras · ${v.journey.length} stops`;

              return (
                <button
                  key={v.id}
                  onClick={() => {
                    setSelectedVehicleId(v.id);
                    app.nav({ page: 'map', mapVehicle: v.plate, vehicleId: v.id });
                    setLayers((l) => ({ ...l, journey: true }));
                    app.toast(`Tracing route for ${v.plate} (${v.make} ${v.model})`);
                  }}
                  className={cx(
                    'flex shrink-0 items-center gap-2.5 rounded-xl border px-3 py-1.5 text-left transition-all active:scale-95 cursor-pointer',
                    isAmb
                      ? isSel
                        ? 'border-emerald-600 bg-emerald-700 text-white shadow-lg ring-2 ring-emerald-400'
                        : 'border-emerald-500/60 bg-emerald-50/90 text-emerald-950 hover:bg-emerald-100 hover:border-emerald-600'
                      : isSel
                      ? 'border-dusk bg-dusk text-cream shadow-md ring-2 ring-sand/40'
                      : 'border-clay/35 bg-cream hover:border-dusk/40 hover:bg-sand/30'
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    {isAmb && <span className="text-base">🚑</span>}
                    <div>
                      <div className={cx('font-display text-[13px] font-bold', isAmb ? (isSel ? 'text-white' : 'text-emerald-950') : isSel ? 'text-cream' : 'text-ink')}>
                        {v.plate}
                      </div>
                      <div className={cx('text-[11px] font-semibold', isAmb ? (isSel ? 'text-emerald-100' : 'text-emerald-700') : isSel ? 'text-sand' : 'text-mauve')}>
                        {v.make} {v.model} · {camCountLabel}
                      </div>
                    </div>
                  </div>
                  <Badge tone={isAmb ? 'critical' : v.status === 'flagged' ? 'critical' : v.status === 'watchlist' ? 'medium' : 'good'}>
                    {isAmb ? 'EMERGENCY' : v.status}
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

          {/* Map Legend & Quick Layer Overlay */}
          <div className="absolute left-5 top-5 z-[999] flex flex-col gap-1.5 rounded-xl border border-clay/25 bg-cream/95 px-3.5 py-2.5 text-[11px] font-semibold text-ink shadow-md backdrop-blur">
            <div className="flex items-center justify-between gap-3 border-b border-clay/20 pb-1.5 font-bold">
              <span className="text-dusk uppercase tracking-wider text-[10px]">Surveillance Grid</span>
              <button
                type="button"
                onClick={() => toggle('congestion')}
                className={cx(
                  'rounded-full px-2 py-0.5 text-[10px] font-black transition cursor-pointer flex items-center gap-1',
                  layers.congestion
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-clay/20 text-ink hover:bg-clay/30'
                )}
                title="Toggle Area Traffic Congestion Heatmap"
              >
                <span>🔥 Heatmap</span>
                <span className="font-mono text-[9px]">{layers.congestion ? 'ON' : 'OFF'}</span>
              </button>
            </div>
            <div className="flex flex-col gap-1 text-[10.5px]">
              <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#2563EB]" /> Surveillance Node (20 Active)</span>
              <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#D97706]" /> AI Estimated Road Path</span>
              {layers.congestion ? (
                <>
                  <span className="flex items-center gap-2 font-bold text-red-600">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444] animate-pulse" /> Critical Gridlock (&gt;80%)
                  </span>
                  <span className="flex items-center gap-2 text-amber-600">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" /> Moderate Flow (50-80%)
                  </span>
                </>
              ) : (
                <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#8B5CF6]" /> Probable Alternative Branch</span>
              )}
              <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#DC2626]" /> Priority Alert Incident</span>
            </div>
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

          {/* Active Ambulance Emergency Hospital Corridor HUD Card */}
          {activeEmergencyHospital && (
            <div className="absolute bottom-5 left-5 right-5 sm:left-auto sm:right-5 sm:max-w-md z-[1000] rounded-2xl border-2 border-emerald-500/80 bg-slate-900/95 p-4 text-white shadow-2xl backdrop-blur animate-in fade-in slide-in-from-bottom-3">
              <div className="flex items-center justify-between border-b border-white/15 pb-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-mono text-xs font-black tracking-wider text-emerald-400 uppercase">
                    🚨 Priority Emergency Green Corridor
                  </span>
                </div>
                <span className="rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[9.5px] font-bold px-2 py-0.5">
                  SIGNALS PREEMPTED
                </span>
              </div>

              <div className="mt-2.5 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-black text-white tracking-wide">
                      {activeEmergencyHospital.ambulancePlate}
                    </span>
                    <span className="rounded bg-emerald-500 text-slate-950 font-black text-[9px] px-1.5 py-0.2 uppercase">
                      Ambulance
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 truncate">
                    {activeEmergencyHospital.model || 'Emergency Critical Care Unit'}
                    {activeEmergencyHospital.driver ? ` · Driver: ${activeEmergencyHospital.driver}` : ''}
                  </p>
                  {activeEmergencyHospital.patientCondition && (
                    <p className="text-[11px] text-amber-300 font-semibold mt-1">
                      ⚠️ {activeEmergencyHospital.patientCondition}
                    </p>
                  )}
                </div>

                <div className="shrink-0 flex flex-col items-end gap-1">
                  <span className="rounded-full bg-emerald-500/25 border border-emerald-400/50 text-emerald-300 font-mono text-[10px] font-bold px-2.5 py-0.5 uppercase tracking-wide flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Saved Route
                  </span>
                  <span className="text-[10px] text-emerald-200/70 font-mono">
                    Max Hospital Corrd.
                  </span>
                </div>
              </div>

              <div className="mt-2.5 rounded-xl bg-white/10 border border-white/15 p-2.5 flex items-center justify-between text-xs">
                <div className="min-w-0 flex-1 pr-2">
                  <span className="text-[9.5px] text-slate-400 font-semibold uppercase tracking-wider block">
                    Nearest Receiving Hospital
                  </span>
                  <strong className="text-emerald-300 font-bold text-sm block truncate">
                    🏥 {activeEmergencyHospital.hospital.name}
                  </strong>
                  <span className="text-[11px] text-slate-300 block truncate">
                    📍 {activeEmergencyHospital.hospital.address}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono font-semibold mt-0.5 block">
                    📞 Emergency Desk: {activeEmergencyHospital.hospital.emergencyPhone} · {activeEmergencyHospital.hospital.totalBeds} Beds
                  </span>
                </div>
                <div className="text-right shrink-0 pl-2 border-l border-white/15">
                  <div className="font-mono text-lg font-black text-emerald-400 leading-tight">
                    ~{activeEmergencyHospital.etaMinutes}m
                  </div>
                  <div className="font-mono text-[10.5px] text-slate-300">
                    {(activeEmergencyHospital.distanceMeters / 1000).toFixed(1)} km
                  </div>
                  <div className="text-[9px] text-emerald-300/80 font-bold mt-0.5">
                    ETA ARRIVAL
                  </div>
                </div>
              </div>

              {/* Uploaded CCTV Detection Evidence Frame & Plate Patch */}
              {activeEmergencyHospital.evidenceImage && (
                <div className="mt-2.5 flex items-center gap-2.5 rounded-xl bg-black/40 border border-white/15 p-2 backdrop-blur">
                  <img
                    src={activeEmergencyHospital.plateCrop || activeEmergencyHospital.evidenceImage}
                    alt="ANPR Plate Crop"
                    className="h-9 w-20 object-cover rounded border border-white/20 bg-black shrink-0"
                  />
                  <div className="min-w-0 flex-1 text-[10px]">
                    <div className="text-emerald-300 font-bold uppercase tracking-wider flex items-center justify-between">
                      <span>📷 AI CCTV Evidence</span>
                      <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded text-[8.5px] font-mono">98.4% CONF</span>
                    </div>
                    <div className="text-slate-300 truncate mt-0.5">
                      CAM-KN-08 · Patparganj / Max Hospital Arterial
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Active Tactical Congestion Heatmap HUD Card */}
          {layers.congestion && (
            <div
              className={cx(
                'absolute z-[1000] rounded-2xl border-2 border-amber-500/80 bg-slate-900/95 p-4 text-white shadow-2xl backdrop-blur animate-in fade-in slide-in-from-bottom-3',
                activeEmergencyHospital
                  ? 'bottom-5 left-5 max-w-sm sm:max-w-md'
                  : 'bottom-5 left-5 right-5 sm:left-auto sm:right-5 sm:max-w-md'
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
                  <span className="font-mono text-xs font-black tracking-wider text-amber-300 uppercase">
                    🔥 City Congestion Heatmap
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[9.5px] font-bold px-2 py-0.5">
                    74% SURGE INDEX
                  </span>
                  <button
                    onClick={() => toggle('congestion')}
                    aria-label="Close heatmap"
                    className="rounded-full p-1 text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  >
                    <Icon name="x" className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Thermal Flow Spectrum Legend */}
              <div className="mt-2.5">
                <div className="flex items-center justify-between text-[10px] text-slate-300 font-semibold mb-1">
                  <span>Corridor Velocity Spectrum:</span>
                  <span className="text-amber-300 font-mono text-[9.5px]">12 Active Monitored Nodes</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 via-orange-500 to-purple-600 shadow-inner" />
                <div className="mt-1 flex items-center justify-between text-[9px] font-mono text-slate-400">
                  <span className="text-emerald-400">&gt;35 km/h Fluid</span>
                  <span className="text-amber-400">20-35 Moderate</span>
                  <span className="text-orange-400">12-20 Heavy</span>
                  <span className="text-purple-400">&lt;12 Gridlock</span>
                </div>
              </div>

              {/* Quick Area Sector Focus Selector */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1.5">
                  <span>Quick Focus Hotspots:</span>
                  <span className="text-[9px] text-amber-400 font-semibold">Click to Zoom Sector</span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {[
                    { name: 'Anand Vihar', idx: 91, lat: 28.6465, lng: 77.3155 },
                    { name: 'Laxmi Nagar', idx: 88, lat: 28.6305, lng: 77.2770 },
                    { name: 'Akshardham', idx: 84, lat: 28.6180, lng: 77.2790 },
                    { name: 'Ghazipur', idx: 78, lat: 28.6240, lng: 77.3340 },
                    { name: 'Gandhi Nagar', idx: 74, lat: 28.6615, lng: 77.2655 },
                    { name: 'Seelampur', idx: 72, lat: 28.6685, lng: 77.2720 },
                  ].map((spot) => (
                    <button
                      key={spot.name}
                      onClick={() => {
                        if (mapInstanceRef.current) {
                          mapInstanceRef.current.flyTo([spot.lat, spot.lng], 15.5, { duration: 0.7 });
                        }
                        app.toast(`Focusing congestion zone: ${spot.name} (${spot.idx}% Saturation)`);
                      }}
                      className="shrink-0 rounded-lg border border-white/15 bg-white/10 hover:bg-amber-500/25 hover:border-amber-400/80 px-2 py-1 text-[10px] font-bold text-white transition active:scale-95 cursor-pointer"
                    >
                      <span>{spot.name}</span>
                      <span className="ml-1 font-mono text-amber-300 font-black">{spot.idx}%</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Heatmap Layer Controls */}
              <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-white/15 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCongestionSeverityFilter((prev) => (prev === 'all' ? 'critical' : 'all'))}
                    className={cx(
                      'rounded px-2 py-0.5 font-bold transition cursor-pointer',
                      congestionSeverityFilter === 'critical'
                        ? 'bg-red-500 text-white shadow-sm'
                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                    )}
                  >
                    {congestionSeverityFilter === 'critical' ? '🔴 Critical Only (>80%)' : 'All 12 Nodes'}
                  </button>
                  <button
                    onClick={() => setShowArteriesHeat((prev) => !prev)}
                    className={cx(
                      'rounded px-2 py-0.5 font-bold transition cursor-pointer',
                      showArteriesHeat
                        ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                        : 'bg-white/10 text-slate-400 hover:bg-white/20'
                    )}
                  >
                    {showArteriesHeat ? 'Road Ribbons ON' : 'Road Ribbons OFF'}
                  </button>
                </div>
                <span className="text-[9px] text-slate-400 font-mono">
                  Live CCTV GPS
                </span>
              </div>
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

                {focusVeh.journey.length > 1 && new Set(focusVeh.journey.map((e) => e.cam)).size === 1 && (
                  <div className="mt-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 p-2.5 text-[11.5px] text-amber-900 leading-snug">
                    <div className="font-bold flex items-center gap-1 text-amber-800 mb-1">
                      <span>📍</span> Single Node Observation ({focusVeh.journey[0]?.cam})
                    </div>
                    All {focusVeh.journey.length} logged sightings are at this same camera checkpoint. To view an inter-camera corridor route across Delhi, log or upload this vehicle at a second camera location (e.g. CAM-KN-02, CAM-KN-03, CAM-GN-01).
                  </div>
                )}
                {activeEmergencyHospital && (
                  <div className="mt-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-[12px]">
                    <div className="flex items-center justify-between font-bold text-emerald-800 uppercase text-[10px] tracking-wider">
                      <span>🏥 Receiving Hospital</span>
                      <span className="bg-emerald-600 text-white px-1.5 py-0.2 rounded font-mono text-[9px]">LOCKED ROUTE</span>
                    </div>
                    <div className="font-bold text-emerald-950 text-[13px] mt-1">
                      {activeEmergencyHospital.hospital.name}
                    </div>
                    <div className="text-emerald-800 text-[11px] mt-0.5">
                      📍 {activeEmergencyHospital.hospital.address}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] font-mono font-bold bg-white/70 rounded p-1.5 border border-emerald-200">
                      <span className="text-emerald-700">Transit: ~{activeEmergencyHospital.etaMinutes} mins</span>
                      <span className="text-emerald-700">Distance: {(activeEmergencyHospital.distanceMeters / 1000).toFixed(1)} km</span>
                      <span className="text-emerald-600">Signal: PREEMPTED</span>
                    </div>
                    {activeEmergencyHospital.evidenceImage && (
                      <div className="mt-2 pt-2 border-t border-emerald-200 flex items-center gap-2">
                        <img
                          src={activeEmergencyHospital.plateCrop || activeEmergencyHospital.evidenceImage}
                          alt="Plate Evidence"
                          className="h-8 w-16 object-cover rounded border border-emerald-300 bg-black shrink-0"
                        />
                        <div className="text-[10px] text-emerald-900 leading-tight">
                          <strong>Uploaded AI Evidence:</strong> Verified CCTV plate detection patch at CAM-KN-08.
                        </div>
                      </div>
                    )}
                  </div>
                )}
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